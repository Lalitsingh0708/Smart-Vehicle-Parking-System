import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingLot from "@/models/ParkingLot";
import ParkingSlot from "@/models/ParkingSlot";
import { authenticateApiRequest } from "@/lib/api-auth";
import { parkingLotSchema } from "@/lib/validations";

export async function POST(request) {
  const auth = await authenticateApiRequest("admin");
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    const validatedData = parkingLotSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const lot = await ParkingLot.create({
      name: validatedData.data.name,
      address: validatedData.data.address,
      city: validatedData.data.city,
      coordinates: validatedData.data.coordinates,
      description: validatedData.data.description,
      openingHours: validatedData.data.openingHours,
      hourlyRate: validatedData.data.hourlyRate,
      totalCapacity: body.initialSlotsCount ? Number(body.initialSlotsCount) : 10,
      active: validatedData.data.active ?? true,
    });

    // Optionally generate slots
    const initialSlots = body.initialSlotsCount ? Number(body.initialSlotsCount) : 10;
    const slotsToInsert = [];
    const zones = ["Zone A", "Zone B"];
    const perZone = Math.ceil(initialSlots / zones.length);

    let createdCount = 0;
    for (const zone of zones) {
      const prefix = zone.slice(-1);
      for (let i = 1; i <= perZone && createdCount < initialSlots; i++) {
        slotsToInsert.push({
          parkingLotId: lot._id,
          zone,
          slotNumber: `${prefix}-${String(i).padStart(2, "0")}`,
          status: "available",
          supportedVehicleTypes: ["motorcycle", "scooter", "electric_scooter", "moped"],
        });
        createdCount++;
      }
    }

    if (slotsToInsert.length > 0) {
      await ParkingSlot.insertMany(slotsToInsert);
    }

    return NextResponse.json(
      {
        message: "Parking lot created successfully",
        lot,
        slotsCreated: slotsToInsert.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create parking lot error:", error);
    return NextResponse.json(
      { error: "Failed to create parking lot" },
      { status: 500 }
    );
  }
}
