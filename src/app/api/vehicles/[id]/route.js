import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Vehicle from "@/models/Vehicle";
import ParkingSession from "@/models/ParkingSession";
import { authenticateApiRequest } from "@/lib/api-auth";
import { vehicleSchema } from "@/lib/validations";

export async function PATCH(request, { params }) {
  const auth = await authenticateApiRequest();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = vehicleSchema.partial().safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const vehicle = await Vehicle.findOne({
      _id: id,
      ownerId: auth.session.userId,
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found or unauthorized" },
        { status: 404 }
      );
    }

    if (validatedData.data.make) vehicle.make = validatedData.data.make;
    if (validatedData.data.model) vehicle.model = validatedData.data.model;
    if (validatedData.data.color !== undefined) vehicle.color = validatedData.data.color;
    if (validatedData.data.vehicleType) vehicle.vehicleType = validatedData.data.vehicleType;

    await vehicle.save();

    return NextResponse.json({
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    console.error("Update vehicle error:", error);
    return NextResponse.json(
      { error: "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const auth = await authenticateApiRequest();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    await connectDB();

    const vehicle = await Vehicle.findOne({
      _id: id,
      ownerId: auth.session.userId,
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if vehicle has an active parking session
    const activeSession = await ParkingSession.findOne({
      vehicleId: id,
      status: "active",
    });

    if (activeSession) {
      return NextResponse.json(
        { error: "Cannot delete vehicle while it is parked in an active parking session" },
        { status: 400 }
      );
    }

    await Vehicle.deleteOne({ _id: id });

    return NextResponse.json({
      message: "Vehicle removed successfully",
    });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    return NextResponse.json(
      { error: "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}
