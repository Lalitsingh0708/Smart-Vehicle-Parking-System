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

    let attendantAssignedLotId = null;
    let attendantLotName = null;

    // Strict Attendant Isolation
    if (auth.session.role === "attendant") {
      const user = await User.findById(auth.session.userId).populate("assignedLotId");
      if (!user || user.isApprovedByAdmin !== true || user.attendantApprovalStatus !== "approved") {
        return NextResponse.json(
          { error: "Attendant account is under review. Gate check-out is unauthorized." },
          { status: 403 }
        );
      }
      if (!user.assignedLotId) {
        return NextResponse.json(
          { error: "No parking facility assigned to your attendant account. Gate check-out is unauthorized." },
          { status: 403 }
        );
      }
      attendantAssignedLotId = user.assignedLotId._id.toString();
      attendantLotName = user.assignedLotId.name;
    }

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
          { error: `No registered vehicle found with plate ${cleanReg}` },
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

    // STRICT CHECK: An attendant CANNOT check out vehicles parked in another facility!
    if (attendantAssignedLotId && session.parkingLotId?._id?.toString() !== attendantAssignedLotId) {
      const actualLotName = session.parkingLotId?.name || "another facility";
      return NextResponse.json(
        {
          error: `Access Denied: This vehicle is parked at "${actualLotName}". As the booth attendant for "${attendantLotName}", you are only authorized to check out vehicles parked in your assigned facility.`,
        },
        { status: 403 }
      );
    }

    const exitTime = new Date();
    const entryTime = new Date(session.entryTime);
    const durationMs = Math.max(0, exitTime.getTime() - entryTime.getTime());
    const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
    const hourlyRate = 0; // Free campus parking for students and staff
    const fee = 0;

    session.exitTime = exitTime;
    session.status = "completed";
    session.fee = fee;
    session.paymentStatus = "free";
    await session.save();

    // Release parking bay
    if (session.parkingSlotId) {
      await ParkingSlot.findByIdAndUpdate(session.parkingSlotId._id, {
        $set: { status: "available" },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Vehicle ${session.vehicleId?.registrationNumber || ""} checkout successful at "${session.parkingLotId?.name}". Bay released.`,
      receipt: {
        ticketId: session.ticketId,
        registrationNumber: session.vehicleId?.registrationNumber,
        model: session.vehicleId?.model,
        vehicleType: session.vehicleId?.vehicleType,
        riderName: session.userId?.name,
        riderPhone: session.userId?.phoneNumber,
        lotName: session.parkingLotId?.name,
        lotAddress: session.parkingLotId?.address,
        slotNumber: session.parkingSlotId?.slotNumber,
        zone: session.parkingSlotId?.zone,
        entryTime: session.entryTime,
        exitTime: session.exitTime,
        durationHours,
        hourlyRate,
        fee,
      },
    });
  } catch (error) {
    console.error("Attendant check-out error:", error);
    return NextResponse.json(
      { error: "Failed to process vehicle checkout at gate terminal" },
      { status: 500 }
    );
  }
}
