import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingLot from "@/models/ParkingLot";
import ParkingSlot from "@/models/ParkingSlot";
import ParkingSession from "@/models/ParkingSession";
import User from "@/models/User";
import { authenticateApiRequest } from "@/lib/api-auth";

export async function GET(request) {
  const auth = await authenticateApiRequest(["attendant", "admin"]);
  if (!auth.authenticated) return auth.response;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    // If attendant, use their assigned lot; if admin, allow querying any lot or default to first
    let lotId = searchParams.get("lotId");
    if (!lotId && auth.session.role === "attendant") {
      const user = await User.findById(auth.session.userId);
      lotId = user?.assignedLotId?.toString();
    }

    if (!lotId) {
      // Default to first active lot if none specified
      const firstLot = await ParkingLot.findOne({ active: true });
      if (firstLot) lotId = firstLot._id.toString();
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

    // Get all slots for this lot
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
    slots.forEach((s) => {
      if (stats[s.status] !== undefined) {
        stats[s.status]++;
      }
      if (s.status === "available") {
        availableSlots.push({
          id: s._id,
          zone: s.zone,
          slotNumber: s.slotNumber,
        });
      }
    });

    // Get all currently parked active sessions in this lot
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
      const currentFee = billedHours * (lot.hourlyRate || 20);

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

    // Today's summary for attendant desk (entries & exits today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayEntries, todayExits] = await Promise.all([
      ParkingSession.countDocuments({
        parkingLotId: lotId,
        entryTime: { $gte: startOfToday },
      }),
      ParkingSession.countDocuments({
        parkingLotId: lotId,
        exitTime: { $gte: startOfToday },
        status: "completed",
      }),
    ]);

    // All available lots for quick switching (if attendant covers multiple or admin views)
    const allLots = await ParkingLot.find({ active: true }).select("name city").lean();

    return NextResponse.json({
      lot: {
        id: lot._id,
        name: lot.name,
        address: lot.address,
        city: lot.city,
        hourlyRate: lot.hourlyRate,
        openingHours: lot.openingHours,
      },
      stats,
      todaySummary: {
        entries: todayEntries,
        exits: todayExits,
      },
      parkedVehicles,
      availableSlots,
      allLots,
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
