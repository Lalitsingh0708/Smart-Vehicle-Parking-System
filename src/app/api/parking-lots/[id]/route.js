import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingLot from "@/models/ParkingLot";
import ParkingSlot from "@/models/ParkingSlot";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const lot = await ParkingLot.findById(id).lean();
    if (!lot) {
      return NextResponse.json(
        { error: "Parking lot not found" },
        { status: 404 }
      );
    }

    const slots = await ParkingSlot.find({ parkingLotId: id })
      .sort({ zone: 1, slotNumber: 1 })
      .lean();

    const stats = {
      available: 0,
      occupied: 0,
      reserved: 0,
      blocked: 0,
      total: slots.length,
    };

    // Group slots by zone
    const zonesMap = {};
    slots.forEach((slot) => {
      stats[slot.status] = (stats[slot.status] || 0) + 1;
      if (!zonesMap[slot.zone]) {
        zonesMap[slot.zone] = {
          name: slot.zone,
          availableCount: 0,
          totalCount: 0,
          slots: [],
        };
      }
      zonesMap[slot.zone].totalCount += 1;
      if (slot.status === "available") {
        zonesMap[slot.zone].availableCount += 1;
      }
      zonesMap[slot.zone].slots.push({
        id: slot._id,
        slotNumber: slot.slotNumber,
        status: slot.status,
        supportedVehicleTypes: slot.supportedVehicleTypes,
      });
    });

    const zones = Object.values(zonesMap);

    return NextResponse.json({
      lot: {
        id: lot._id,
        name: lot.name,
        address: lot.address,
        city: lot.city,
        coordinates: lot.coordinates,
        description: lot.description,
        openingHours: lot.openingHours,
        hourlyRate: lot.hourlyRate,
        totalCapacity: slots.length,
        availableCount: stats.available,
        occupiedCount: stats.occupied,
        reservedCount: stats.reserved,
        blockedCount: stats.blocked,
        active: lot.active,
        updatedAt: lot.updatedAt,
      },
      zones,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fetch parking lot details error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve parking lot details" },
      { status: 500 }
    );
  }
}
