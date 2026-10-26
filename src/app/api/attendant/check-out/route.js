import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingLot from "@/models/ParkingLot";
import ParkingSlot from "@/models/ParkingSlot";
import ParkingSession from "@/models/ParkingSession";
import Vehicle from "@/models/Vehicle";
import User from "@/models/User";
import { authenticateApiRequest } from "@/lib/api-auth";

export async function POST(request) {
  const auth = await authenticateApiRequest(["attendant", "admin"]);
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    const { registrationNumber, ticketId, sessionId, lotId } = body;

    if (!registrationNumber && !ticketId && !sessionId) {
      return NextResponse.json(
        { error: "Please provide a registration number, ticket ID, or session ID" },
        { status: 400 }
      );
    }

    await connectDB();

    let query = { status: "active" };

    if (sessionId) {
      query._id = sessionId;
    } else if (ticketId) {
      query.ticketId = ticketId.trim().toUpperCase();
    } else if (registrationNumber) {
      const cleanReg = registrationNumber.trim().toUpperCase().replace(/\s+/g, "");
      const vehicle = await Vehicle.findOne({ registrationNumber: cleanReg });
      if (!vehicle) {
        return NextResponse.json(
          { error: `No vehicle found with registration number ${cleanReg}` },
          { status: 404 }
        );
      }
      query.vehicleId = vehicle._id;
    }

    const session = await ParkingSession.findOne(query)
      .populate("parkingLotId")
      .populate("parkingSlotId")
      .populate("vehicleId")
      .populate("userId", "name email phoneNumber");

    if (!session) {
      return NextResponse.json(
        { error: "No active parking session found matching the vehicle or ticket." },
        { status: 404 }
      );
    }

    const exitTime = new Date();
    const entryTime = new Date(session.entryTime);
    const durationMs = Math.max(0, exitTime.getTime() - entryTime.getTime());
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    const billedHours = Math.max(1, Math.ceil(durationMinutes / 60));

    const hourlyRate = session.parkingLotId?.hourlyRate ?? 20;
    const totalFee = billedHours * hourlyRate;

    // Update session
    session.exitTime = exitTime;
    session.status = "completed";
    session.fee = totalFee;
    session.paymentStatus = "paid";
    await session.save();

    // Free the parking slot atomically
    if (session.parkingSlotId?._id) {
      await ParkingSlot.findByIdAndUpdate(session.parkingSlotId._id, {
        $set: { status: "available" },
      });
    }

    return NextResponse.json({
      message: `Checkout confirmed for vehicle ${session.vehicleId?.registrationNumber}. Slot ${session.parkingSlotId?.slotNumber} is now available.`,
      receipt: {
        ticketId: session.ticketId,
        registrationNumber: session.vehicleId?.registrationNumber,
        vehicleModel: `${session.vehicleId?.make || ""} ${session.vehicleId?.model || ""}`,
        riderName: session.userId?.name || "Rider",
        parkingLotName: session.parkingLotId?.name,
        slotNumber: session.parkingSlotId?.slotNumber,
        zone: session.parkingSlotId?.zone,
        entryTime: session.entryTime,
        exitTime,
        durationMinutes,
        billedHours,
        hourlyRate,
        totalFee,
      },
    });
  } catch (error) {
    console.error("Attendant checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process attendant checkout" },
      { status: 500 }
    );
  }
}
