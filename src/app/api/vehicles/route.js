import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Vehicle from "@/models/Vehicle";
import { vehicleSchema } from "@/lib/validations";
import { authenticateApiRequest } from "@/lib/api-auth";

export async function GET() {
  const auth = await authenticateApiRequest();
  if (!auth.authenticated) return auth.response;

  try {
    await connectDB();
    const vehicles = await Vehicle.find({ ownerId: auth.session.userId }).sort({
      createdAt: -1,
    });
    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error("Fetch vehicles error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve registered vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await authenticateApiRequest();
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    const validatedData = vehicleSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const cleanRegNumber = validatedData.data.registrationNumber.replace(/\s+/g, "");

    const existingVehicle = await Vehicle.findOne({
      ownerId: auth.session.userId,
      registrationNumber: cleanRegNumber,
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: "You have already registered this vehicle" },
        { status: 409 }
      );
    }

    const vehicle = await Vehicle.create({
      ownerId: auth.session.userId,
      registrationNumber: cleanRegNumber,
      vehicleType: validatedData.data.vehicleType,
      make: validatedData.data.make,
      model: validatedData.data.model,
      color: validatedData.data.color || "",
    });

    return NextResponse.json(
      { message: "Vehicle registered successfully", vehicle },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create vehicle error:", error);
    return NextResponse.json(
      { error: "Failed to register vehicle" },
      { status: 500 }
    );
  }
}
