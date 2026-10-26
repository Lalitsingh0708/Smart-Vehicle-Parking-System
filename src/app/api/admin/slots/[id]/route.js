import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingSlot from "@/models/ParkingSlot";
import ParkingSession from "@/models/ParkingSession";
import { authenticateApiRequest } from "@/lib/api-auth";

export async function PATCH(request, { params }) {
  const auth = await authenticateApiRequest("admin");
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, zone, slotNumber, supportedVehicleTypes } = body;

    await connectDB();

    const slot = await ParkingSlot.findById(id);
    if (!slot) {
      return NextResponse.json(
        { error: "Parking slot not found" },
        { status: 404 }
      );
    }

    // NON-NEGOTIABLE RULE SAFEGUARD:
    // Prevent administrators from marking a slot available while an active parking session occupies it
    if (status === "available" && slot.status === "occupied") {
      const activeSession = await ParkingSession.findOne({
        parkingSlotId: id,
        status: "active",
      });

      if (activeSession) {
        return NextResponse.json(
          {
            error: `Cannot mark slot as available. Active session ticket ${activeSession.ticketId} is currently parked in this slot. Check out or complete the active session first.`,
          },
          { status: 400 }
        );
      }
    }

    if (status) slot.status = status;
    if (zone) slot.zone = zone;
    if (slotNumber) slot.slotNumber = slotNumber;
    if (supportedVehicleTypes) slot.supportedVehicleTypes = supportedVehicleTypes;

    await slot.save();

    return NextResponse.json({
      message: "Slot updated successfully",
      slot,
    });
  } catch (error) {
    console.error("Update slot error:", error);
    return NextResponse.json(
      { error: "Failed to update slot" },
      { status: 500 }
    );
  }
}
