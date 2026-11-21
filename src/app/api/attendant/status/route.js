import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingLot from "@/models/ParkingLot";
import ParkingSlot from "@/models/ParkingSlot";
import ParkingSession from "@/models/ParkingSession";
import SecurityIncident from "@/models/SecurityIncident";
import User from "@/models/User";
import { authenticateApiRequest } from "@/lib/api-auth";

export async function GET(request) {
  const auth = await authenticateApiRequest(["attendant", "admin"]);
  if (!auth.authenticated) return auth.response;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    let lotId = searchParams.get("lotId");
    const isAttendantRole = auth.session.role === "attendant";
    let attendantUser = null;

    // Strict Facility Isolation: Attendants can ONLY access their own assigned facility
    if (isAttendantRole) {
      attendantUser = await User.findById(auth.session.userId).lean();
      if (!attendantUser || attendantUser.isApprovedByAdmin !== true || attendantUser.attendantApprovalStatus !== "approved") {
        return NextResponse.json(
          {
            error: "Your attendant account is currently under administrator review. Access to parking operations is locked until approved.",
            underReview: true,
          },
          { status: 403 }
        );
      }

      if (!attendantUser.assignedLotId) {
        return NextResponse.json(
          {
            error: "No parking facility assigned to your attendant account. Please contact Platform Administrator (lalitbaghel0708@gmail.com) to assign your facility.",
            unassigned: true,
          },
          { status: 403 }
        );
      }

      // Overwrite lotId with the attendant's strict assignment
      lotId = attendantUser.assignedLotId.toString();
    } else {
      // Platform Admin: can inspect any facility or default to first active
      if (!lotId) {
        const firstLot = await ParkingLot.findOne({ active: true });
        if (firstLot) lotId = firstLot._id.toString();
      }
    }

    if (!lotId) {
      return NextResponse.json(
        { error: "No parking facility configured or assigned" },
        { status: 404 }
      );
    }

    const lot = await ParkingLot.findById(lotId).lean();
    if (!lot) {
      return NextResponse.json(
        { error: "Assigned parking lot not found" },
        { status: 404 }
      );
    }

    // Get all slots strictly for this specific lot
    const slots = await ParkingSlot.find({ parkingLotId: lotId })
      .sort({ zone: 1, slotNumber: 1 })
      .lean();

    const stats = {
      total: slots.length,
      available: 0,
      occupied: 0,
      reserved: 0,
      blocked: 0,
    };

    const availableSlots = [];
    const zoneMap = {};
    slots.forEach((s) => {
      if (stats[s.status] !== undefined) {
        stats[s.status]++;
      }
      const z = s.zone || "Zone A";
      if (!zoneMap[z]) {
        zoneMap[z] = { zone: z, total: 0, available: 0, occupied: 0, reserved: 0, blocked: 0 };
      }
      zoneMap[z].total++;
      if (zoneMap[z][s.status] !== undefined) {
        zoneMap[z][s.status]++;
      }
      if (s.status === "available") {
        availableSlots.push({
          id: s._id,
          zone: s.zone,
          slotNumber: s.slotNumber,
        });
      }
    });
    const zoneStats = Object.values(zoneMap);

    // Get all currently parked active sessions in this specific lot
    const activeSessions = await ParkingSession.find({
      parkingLotId: lotId,
      status: "active",
    })
      .populate("userId", "name email phoneNumber")
      .populate("vehicleId", "registrationNumber make model vehicleType color")
      .populate("parkingSlotId", "zone slotNumber")
      .sort({ entryTime: -1 })
      .lean();

    const now = Date.now();
    const parkedVehicles = activeSessions.map((session) => {
      const entryTimeMs = new Date(session.entryTime).getTime();
      const elapsedMinutes = Math.max(0, Math.floor((now - entryTimeMs) / (1000 * 60)));
      const billedHours = Math.max(1, Math.ceil(elapsedMinutes / 60));
      const currentFee = 0; // Free campus parking for students and staff

      return {
        sessionId: session._id,
        ticketId: session.ticketId,
        registrationNumber: session.vehicleId?.registrationNumber || "N/A",
        vehicleType: session.vehicleId?.vehicleType || "motorcycle",
        make: session.vehicleId?.make || "",
        model: session.vehicleId?.model || "",
        color: session.vehicleId?.color || "",
        riderName: session.userId?.name || "Walk-in Rider",
        riderPhone: session.userId?.phoneNumber || "N/A",
        zone: session.parkingSlotId?.zone || "N/A",
        slotNumber: session.parkingSlotId?.slotNumber || "N/A",
        slotId: session.parkingSlotId?._id,
        entryTime: session.entryTime,
        elapsedMinutes,
        billedHours,
        currentFee,
      };
    });

    // Today's summary for attendant desk (entries & exits today for this lot)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayEntries, todayExits, openIncidentsCount] = await Promise.all([
      ParkingSession.countDocuments({
        parkingLotId: lotId,
        entryTime: { $gte: startOfToday },
      }),
      ParkingSession.countDocuments({
        parkingLotId: lotId,
        exitTime: { $gte: startOfToday },
        status: "completed",
      }),
      SecurityIncident.countDocuments({
        parkingLotId: lotId,
        status: { $in: ["open", "under_review"] },
      }),
    ]);

    // Role-based facility switching:
    // Attendant ONLY receives their assigned lot (cannot view or switch to others).
    // Admin receives all active lots so they can oversee any campus booth.
    let allLots = [];
    if (isAttendantRole) {
      allLots = [
        {
          _id: lot._id,
          name: lot.name,
          city: lot.city,
        },
      ];
    } else {
      allLots = await ParkingLot.find({ active: true }).select("name city").lean();
    }

    return NextResponse.json({
      lot: {
        id: lot._id,
        _id: lot._id,
        name: lot.name,
        address: lot.address,
        city: lot.city,
        hourlyRate: lot.hourlyRate,
        openingHours: lot.openingHours,
        allowCheckIn: lot.allowCheckIn !== false,
      },
      stats,
      zoneStats,
      todaySummary: {
        entries: todayEntries,
        exits: todayExits,
      },
      openIncidentsCount,
      parkedVehicles,
      availableSlots,
      allSlots: slots.map((s) => ({
        id: s._id,
        zone: s.zone,
        slotNumber: s.slotNumber,
        status: s.status,
      })),
      allLots,
      isAttendantRole,
      attendantName: auth.session.name || "Attendant",
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Attendant status error:", error);
    return NextResponse.json(
      { error: "Failed to load attendant facility status" },
      { status: 500 }
    );
  }
}
