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
      totalLots,
      totalSlots,
      slotStatusCounts,
      activeSessions,
      totalUsers,
      openIncidents,
      lotOccupancy,
      incidentsByCategory,
      recentSessions,
    ] = await Promise.all([
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
      ParkingSession.countDocuments({ status: "active" }),
      User.countDocuments({ role: "user" }),
      SecurityIncident.countDocuments({ status: { $in: ["open", "under_review"] } }),
      // Utilization by lot
      ParkingSlot.aggregate([
        {
          $group: {
            _id: { lotId: "$parkingLotId", status: "$status" },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "parkinglots",
            localField: "_id.lotId",
            foreignField: "_id",
            as: "lot",
          },
        },
        { $unwind: "$lot" },
      ]),
      // Incidents by category
      SecurityIncident.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]),
      // Entries in last 7 days
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

    // Process daily entries/exits for the last 7 days
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

    // Format lot occupancy
    const lotMap = {};
    lotOccupancy.forEach((item) => {
      const lotName = item.lot.name;
      if (!lotMap[lotName]) {
        lotMap[lotName] = { name: lotName, available: 0, occupied: 0, total: 0 };
      }
      lotMap[lotName].total += item.count;
      if (item._id.status === "available") {
        lotMap[lotName].available += item.count;
      } else if (item._id.status === "occupied") {
        lotMap[lotName].occupied += item.count;
      }
    });

    const utilizationByLot = Object.values(lotMap);

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
        activeSessions,
        totalUsers,
        openIncidents,
      },
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
