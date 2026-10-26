import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingLot from "@/models/ParkingLot";
import { authenticateApiRequest } from "@/lib/api-auth";
import { parkingLotSchema } from "@/lib/validations";

export async function PATCH(request, { params }) {
  const auth = await authenticateApiRequest("admin");
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = parkingLotSchema.partial().safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const lot = await ParkingLot.findById(id);
    if (!lot) {
      return NextResponse.json(
        { error: "Parking lot not found" },
        { status: 404 }
      );
    }

    Object.assign(lot, validatedData.data);
    await lot.save();

    return NextResponse.json({
      message: "Parking lot updated successfully",
      lot,
    });
  } catch (error) {
    console.error("Update parking lot error:", error);
    return NextResponse.json(
      { error: "Failed to update parking lot" },
      { status: 500 }
    );
  }
}
