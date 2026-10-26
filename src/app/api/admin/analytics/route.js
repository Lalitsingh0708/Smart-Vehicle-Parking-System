import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingLot from "@/models/ParkingLot";
import ParkingSlot from "@/models/ParkingSlot";
import ParkingSession from "@/models/ParkingSession";
import User from "@/models/User";
import SecurityIncident from "@/models/SecurityIncident";
import { authenticateApiRequest } from "@/lib/api-auth";

export async function GET() {
  const auth = await authenticateApiRequest("admin");
  if (!auth.authenticated) return auth.response;

  try {
    await connectDB();

    const [
      allLots,
      totalLots,
      totalSlots,
      slotStatusCounts,
      activeSessionsList,
      totalUsers,
      openIncidents,
      lotOccupancy,
      incidentsByCategory,
      recentSessions,
    ] = await Promise.all([
      ParkingLot.find({ active: true }).lean(),
      ParkingLot.countDocuments(),
      ParkingSlot.countDocuments(),
      ParkingSlot.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      ParkingSession.find({ status: "active" })
        .populate("vehicleId", "registrationNumber make model vehicleType")
        .populate("parkingSlotId", "zone slotNumber")
        .populate("parkingLotId", "name city")
        .populate("userId", "name phoneNumber")
        .lean(),
      User.countDocuments({ role: "user" }),
      SecurityIncident.countDocuments({ status: { $in: ["open", "under_review"] } }),
      ParkingSlot.aggregate([
        {
          $group: {
            _id: { lotId: "$parkingLotId", status: "$status" },
            count: { $sum: 1 },
          },
        },
      ]),
      SecurityIncident.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]),
      ParkingSession.find({
        entryTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      })
        .select("entryTime exitTime status")
        .lean(),
    ]);

    const slotStats = {
      available: 0,
      occupied: 0,
      reserved: 0,
      blocked: 0,
    };

    slotStatusCounts.forEach((item) => {
      if (slotStats[item._id] !== undefined) {
        slotStats[item._id] = item.count;
      }
    });

    // Map active parked vehicles by lotId
    const activeVehiclesByLot = {};
    activeSessionsList.forEach((s) => {
      const lid = s.parkingLotId?._id?.toString();
      if (!lid) return;
      if (!activeVehiclesByLot[lid]) activeVehiclesByLot[lid] = [];
      activeVehiclesByLot[lid].push({
        registrationNumber: s.vehicleId?.registrationNumber || "N/A",
        model: `${s.vehicleId?.make || ""} ${s.vehicleId?.model || ""}`,
        slot: `${s.parkingSlotId?.zone || ""} ${s.parkingSlotId?.slotNumber || ""}`,
        rider: s.userId?.name || "Rider",
        riderPhone: s.userId?.phoneNumber || "N/A",
        entryTime: s.entryTime,
      });
    });

    // Map slot counts by lot
    const lotSlotStats = {};
    lotOccupancy.forEach((item) => {
      const lid = item._id.lotId?.toString();
      if (!lid) return;
      if (!lotSlotStats[lid]) {
        lotSlotStats[lid] = { total: 0, available: 0, occupied: 0, reserved: 0, blocked: 0 };
      }
      lotSlotStats[lid].total += item.count;
      lotSlotStats[lid][item._id.status] = item.count;
    });

    // Detailed facility breakdown for Administrator overview
    const facilitiesBreakdown = allLots.map((lot) => {
      const lid = lot._id.toString();
      const stats = lotSlotStats[lid] || { total: lot.totalCapacity, available: lot.totalCapacity, occupied: 0 };
      const parked = activeVehiclesByLot[lid] || [];
      const total = stats.total || lot.totalCapacity;
      const occupied = stats.occupied || 0;
      const available = stats.available || 0;
      const percent = total > 0 ? Math.round((occupied / total) * 100) : 0;

      let status = "Normal";
      if (occupied === 0) status = "Vacant";
      else if (available === 0) status = "Full";
      else if (percent >= 80) status = "Near Capacity";

      return {
        id: lot._id,
        name: lot.name,
        city: lot.city,
        address: lot.address,
        hourlyRate: lot.hourlyRate,
        totalSlots: total,
        availableSlots: available,
        occupiedSlots: occupied,
        occupancyPercent: percent,
        status,
        parkedVehicles: parked,
      };
    });

    // Daily activity
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = { date: key, entries: 0, exits: 0 };
    }

    recentSessions.forEach((s) => {
      const entryKey = new Date(s.entryTime).toISOString().slice(0, 10);
      if (dailyMap[entryKey]) dailyMap[entryKey].entries += 1;
      if (s.exitTime) {
        const exitKey = new Date(s.exitTime).toISOString().slice(0, 10);
        if (dailyMap[exitKey]) dailyMap[exitKey].exits += 1;
      }
    });

    const dailyActivity = Object.values(dailyMap);

    const utilizationByLot = facilitiesBreakdown.map((f) => ({
      name: f.name,
      available: f.availableSlots,
      occupied: f.occupiedSlots,
    }));

    const categoryLabels = {
      theft: "Suspected Theft",
      damage: "Vehicle Damage",
      unauthorized_parking: "Unauthorized Parking",
      blocked_access: "Blocked Access",
      helmet_theft: "Helmet Theft",
      other: "Other",
    };

    const incidentStats = incidentsByCategory.map((c) => ({
      category: categoryLabels[c._id] || c._id,
      count: c.count,
    }));

    return NextResponse.json({
      overview: {
        totalLots,
        totalSlots,
        availableSlots: slotStats.available,
        occupiedSlots: slotStats.occupied,
        reservedSlots: slotStats.reserved,
        blockedSlots: slotStats.blocked,
        activeSessions: activeSessionsList.length,
        totalUsers,
        openIncidents,
      },
      facilitiesBreakdown,
      charts: {
        dailyActivity,
        utilizationByLot,
        incidentStats,
      },
    });
  } catch (error) {
    console.error("Fetch admin analytics error:", error);
    return NextResponse.json(
      { error: "Failed to generate administrator analytics" },
      { status: 500 }
    );
  }
}
