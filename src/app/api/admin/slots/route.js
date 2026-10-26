import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingSlot from "@/models/ParkingSlot";
import ParkingLot from "@/models/ParkingLot";
import { authenticateApiRequest } from "@/lib/api-auth";
import { slotSchema } from "@/lib/validations";

export async function GET(request) {
  const auth = await authenticateApiRequest("admin");
  if (!auth.authenticated) return auth.response;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const lotId = searchParams.get("lotId");
    const zone = searchParams.get("zone");
    const status = searchParams.get("status");

    const query = {};
    if (lotId) query.parkingLotId = lotId;
    if (zone) query.zone = zone;
    if (status) query.status = status;

    const slots = await ParkingSlot.find(query)
      .populate("parkingLotId", "name address city")
      .sort({ parkingLotId: 1, zone: 1, slotNumber: 1 });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Fetch slots error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve parking slots" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await authenticateApiRequest("admin");
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    const validatedData = slotSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const lot = await ParkingLot.findById(validatedData.data.parkingLotId);
    if (!lot) {
      return NextResponse.json(
        { error: "Parking lot not found" },
        { status: 404 }
      );
    }

    const existingSlot = await ParkingSlot.findOne({
      parkingLotId: validatedData.data.parkingLotId,
      slotNumber: validatedData.data.slotNumber,
    });

    if (existingSlot) {
      return NextResponse.json(
        { error: `Slot number ${validatedData.data.slotNumber} already exists in this lot` },
        { status: 409 }
      );
    }

    const slot = await ParkingSlot.create(validatedData.data);

    // Update lot total capacity
    const totalSlots = await ParkingSlot.countDocuments({ parkingLotId: lot._id });
    lot.totalCapacity = totalSlots;
    await lot.save();

    return NextResponse.json(
      { message: "Slot created successfully", slot },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create slot error:", error);
    return NextResponse.json(
      { error: "Failed to create parking slot" },
      { status: 500 }
    );
  }
}
