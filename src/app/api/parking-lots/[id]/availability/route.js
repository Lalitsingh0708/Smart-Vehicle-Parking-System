import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingSlot from "@/models/ParkingSlot";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const stats = await ParkingSlot.aggregate([
      { $match: { parkingLotId: new (require("mongoose").Types.ObjectId)(id) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const availability = {
      available: 0,
      occupied: 0,
      reserved: 0,
      blocked: 0,
      total: 0,
    };

    stats.forEach((item) => {
      availability[item._id] = item.count;
      availability.total += item.count;
    });

    return NextResponse.json({
      parkingLotId: id,
      availability,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fetch availability error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve slot availability" },
      { status: 500 }
    );
  }
}
