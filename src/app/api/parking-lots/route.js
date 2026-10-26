import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingLot from "@/models/ParkingLot";
import ParkingSlot from "@/models/ParkingSlot";

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const maxRate = searchParams.get("maxRate");
    const availableOnly = searchParams.get("availableOnly") === "true";
    const userLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")) : null;
    const userLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")) : null;
    const sortBy = searchParams.get("sortBy") || "distance"; // distance, rate_low, capacity

    const filter = { active: true };

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { address: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ];
    }

    if (city) {
      filter.city = { $regex: `^${city}$`, $options: "i" };
    }

    if (maxRate && !isNaN(Number(maxRate))) {
      filter.hourlyRate = { $lte: Number(maxRate) };
    }

    const lots = await ParkingLot.find(filter).lean();

    // Aggregate real slot counts for each lot
    const lotIds = lots.map((l) => l._id);
    const slotStats = await ParkingSlot.aggregate([
      { $match: { parkingLotId: { $in: lotIds } } },
      {
        $group: {
          _id: { lotId: "$parkingLotId", status: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = {};
    lotIds.forEach((id) => {
      statsMap[id.toString()] = {
        available: 0,
        occupied: 0,
        reserved: 0,
        blocked: 0,
        total: 0,
      };
    });

    slotStats.forEach((stat) => {
      const lotId = stat._id.lotId.toString();
      const status = stat._id.status;
      if (statsMap[lotId]) {
        statsMap[lotId][status] = stat.count;
        statsMap[lotId].total += stat.count;
      }
    });

    let results = lots.map((lot) => {
      const stats = statsMap[lot._id.toString()] || {
        available: 0,
        occupied: 0,
        reserved: 0,
        blocked: 0,
        total: 0,
      };

      let distanceKm = null;
      if (
        userLat !== null &&
        userLng !== null &&
        lot.coordinates?.latitude &&
        lot.coordinates?.longitude
      ) {
        distanceKm = calculateDistanceKm(
          userLat,
          userLng,
          lot.coordinates.latitude,
          lot.coordinates.longitude
        );
      }

      return {
        id: lot._id,
        name: lot.name,
        address: lot.address,
        city: lot.city,
        coordinates: lot.coordinates,
        description: lot.description,
        openingHours: lot.openingHours,
        hourlyRate: lot.hourlyRate,
        totalCapacity: stats.total || lot.totalCapacity,
        availableCount: stats.available,
        occupiedCount: stats.occupied,
        reservedCount: stats.reserved,
        blockedCount: stats.blocked,
        distanceKm,
        active: lot.active,
        updatedAt: lot.updatedAt,
      };
    });

    if (availableOnly) {
      results = results.filter((lot) => lot.availableCount > 0);
    }

    if (sortBy === "distance" && userLat !== null && userLng !== null) {
      results.sort((a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999));
    } else if (sortBy === "rate_low") {
      results.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortBy === "capacity") {
      results.sort((a, b) => b.availableCount - a.availableCount);
    }

    return NextResponse.json({
      lots: results,
      totalCount: results.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fetch parking lots error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve parking lots" },
      { status: 500 }
    );
  }
}
