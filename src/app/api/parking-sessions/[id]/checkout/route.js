import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingSession from "@/models/ParkingSession";
import ParkingSlot from "@/models/ParkingSlot";
import ParkingLot from "@/models/ParkingLot";
import { authenticateApiRequest } from "@/lib/api-auth";

export async function POST(request, { params }) {
  const auth = await authenticateApiRequest();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    await connectDB();

    const session = await ParkingSession.findById(id).populate("parkingLotId");

    if (!session) {
      return NextResponse.json(
        { error: "Parking session not found" },
        { status: 404 }
      );
    }

    if (session.userId.toString() !== auth.session.userId && auth.session.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized to check out this parking session" },
        { status: 403 }
      );
    }

    if (session.status !== "active") {
      return NextResponse.json(
        { error: `This parking session is already marked as ${session.status}` },
        { status: 400 }
      );
    }

    const exitTime = new Date();
    const entryTime = new Date(session.entryTime);
    const durationMs = Math.max(0, exitTime.getTime() - entryTime.getTime());
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    // Billing rule: Minimum 1 hour, billed per hour or fraction thereof
    const billedHours = Math.max(1, Math.ceil(durationMinutes / 60));

    const hourlyRate = session.parkingLotId?.hourlyRate ?? 20;
    const totalFee = billedHours * hourlyRate;

    // Update session record
    session.exitTime = exitTime;
    session.status = "completed";
    session.fee = totalFee;
    session.paymentStatus = "paid";
    await session.save();

    // Free the parking slot atomically
    await ParkingSlot.findByIdAndUpdate(session.parkingSlotId, {
      $set: { status: "available" },
    });

    const populatedSession = await ParkingSession.findById(id)
      .populate("parkingLotId")
      .populate("parkingSlotId")
      .populate("vehicleId");

    return NextResponse.json({
      message: "Checkout completed successfully. Parking slot is now available.",
      session: populatedSession,
      summary: {
        entryTime,
        exitTime,
        durationMinutes,
        billedHours,
        hourlyRate,
        totalFee,
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to process parking checkout" },
      { status: 500 }
    );
  }
}
