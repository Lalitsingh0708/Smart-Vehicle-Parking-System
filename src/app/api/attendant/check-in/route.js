import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingLot from "@/models/ParkingLot";
import ParkingSlot from "@/models/ParkingSlot";
import ParkingSession from "@/models/ParkingSession";
import Vehicle from "@/models/Vehicle";
import User from "@/models/User";
import { authenticateApiRequest } from "@/lib/api-auth";
import crypto from "crypto";

export async function POST(request) {
  const auth = await authenticateApiRequest(["attendant", "admin"]);
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    let {
      registrationNumber,
      lotId,
      slotId,
      vehicleType = "motorcycle",
      make = "Two-Wheeler",
      model = "Standard",
      riderName = "Walk-in Rider",
      riderPhone = "",
    } = body;

    if (!registrationNumber || typeof registrationNumber !== "string") {
      return NextResponse.json(
        { error: "Vehicle registration number is required" },
        { status: 400 }
      );
    }

    const cleanReg = registrationNumber.trim().toUpperCase().replace(/\s+/g, "");

    await connectDB();

    // Determine target parking lot and enforce strict attendant isolation
    let attendantLot = null;
    if (auth.session.role === "attendant") {
      const user = await User.findById(auth.session.userId).populate("assignedLotId");
      if (!user || user.isApprovedByAdmin !== true || user.attendantApprovalStatus !== "approved") {
        return NextResponse.json(
          { error: "Attendant account is under review. Gate check-in is unauthorized." },
          { status: 403 }
        );
      }
      if (!user.assignedLotId) {
        return NextResponse.json(
          { error: "No parking facility assigned to your attendant account. Gate check-in is unauthorized." },
          { status: 403 }
        );
      }

      attendantLot = user.assignedLotId;
      const attendantAssignedId = attendantLot._id.toString();

      // If client supplied a lotId that doesn't match their assigned facility, reject immediately
      if (lotId && lotId.toString() !== attendantAssignedId) {
        return NextResponse.json(
          {
            error: `Unauthorized: You are assigned exclusively to "${attendantLot.name}". You cannot check in vehicles into other parking facilities.`,
          },
          { status: 403 }
        );
      }

      lotId = attendantAssignedId;
    } else {
      // Platform Admin: if no lot specified, default to first active
      if (!lotId) {
        const firstLot = await ParkingLot.findOne({ active: true });
        if (firstLot) lotId = firstLot._id.toString();
      }
    }

    const lot = await ParkingLot.findById(lotId);
    if (!lot || !lot.active) {
      return NextResponse.json(
        { error: "Parking facility not found or currently inactive" },
        { status: 404 }
      );
    }

    if (lot.allowCheckIn === false) {
      return NextResponse.json(
        {
          error: `Check-in is currently paused for "${lot.name}" by facility administration due to peak rush. Check-outs remain operational.`,
        },
        { status: 403 }
      );
    }

    // Check if vehicle is already parked in ANY active session across all lots
    const vehicleActive = await ParkingSession.findOne({
      status: "active",
    })
      .populate({
        path: "vehicleId",
        match: { registrationNumber: cleanReg },
      })
      .populate("parkingSlotId parkingLotId");

    if (vehicleActive && vehicleActive.vehicleId) {
      return NextResponse.json(
        {
          error: `Vehicle ${cleanReg} is already parked at "${vehicleActive.parkingLotId?.name || "a campus facility"}" (Slot: ${vehicleActive.parkingSlotId?.slotNumber || "Bay"}). Check out the existing session first.`,
        },
        { status: 409 }
      );
    }

    // Check if this vehicle is registered in database
    let vehicle = await Vehicle.findOne({ registrationNumber: cleanReg });
    let riderUser = null;

    if (!vehicle) {
      // Find or create walk-in user account for gate walk-ins
      riderUser = await User.findOne({ email: "walkin@system.local" });
      if (!riderUser) {
        riderUser = await User.create({
          name: riderName || "Walk-in Rider",
          email: "walkin@system.local",
          passwordHash: "NONE",
          role: "user",
          phoneNumber: riderPhone || "",
          isVerified: true,
        });
      }

      vehicle = await Vehicle.create({
        ownerId: riderUser._id,
        registrationNumber: cleanReg,
        vehicleType,
        make,
        model,
      });
    } else {
      riderUser = await User.findById(vehicle.ownerId);
    }

    // Determine slot to claim in THIS SPECIFIC LOT ONLY:
    // Either specified slotId (must belong to lotId) or first available slot in this lot
    let targetSlot = null;
    if (slotId) {
      targetSlot = await ParkingSlot.findOneAndUpdate(
        { _id: slotId, parkingLotId: lotId, status: "available" },
        { $set: { status: "occupied" } },
        { new: true }
      );
    } else {
      targetSlot = await ParkingSlot.findOneAndUpdate(
        { parkingLotId: lotId, status: "available" },
        { $set: { status: "occupied" } },
        { new: true, sort: { zone: 1, slotNumber: 1 } }
      );
    }

    if (!targetSlot) {
      return NextResponse.json(
        { error: `No vacant bays available in "${lot.name}". The facility has reached full capacity.` },
        { status: 400 }
      );
    }

    // Generate unique verifiable digital ticket
    const ticketId = `TKT-${cleanReg.slice(-4)}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

    const newSession = await ParkingSession.create({
      userId: riderUser ? riderUser._id : vehicle.ownerId,
      vehicleId: vehicle._id,
      parkingLotId: lot._id,
      parkingSlotId: targetSlot._id,
      ticketId,
      entryTime: new Date(),
      status: "active",
      fee: 0,
      paymentStatus: "pending",
    });

    const populatedSession = await ParkingSession.findById(newSession._id)
      .populate("parkingLotId", "name address city hourlyRate")
      .populate("parkingSlotId", "zone slotNumber")
      .populate("vehicleId", "registrationNumber vehicleType make model")
      .populate("userId", "name phoneNumber email")
      .lean();

    return NextResponse.json({
      success: true,
      message: `Vehicle ${cleanReg} checked in successfully at "${lot.name}" (Slot: ${targetSlot.zone} ${targetSlot.slotNumber}).`,
      session: {
        id: populatedSession._id,
        ticketId: populatedSession.ticketId,
        entryTime: populatedSession.entryTime,
        lotName: populatedSession.parkingLotId?.name,
        lotAddress: populatedSession.parkingLotId?.address,
        slotNumber: populatedSession.parkingSlotId?.slotNumber,
        zone: populatedSession.parkingSlotId?.zone,
        registrationNumber: populatedSession.vehicleId?.registrationNumber,
        model: populatedSession.vehicleId?.model,
        riderName: populatedSession.userId?.name,
        riderPhone: populatedSession.userId?.phoneNumber,
        hourlyRate: populatedSession.parkingLotId?.hourlyRate,
      },
    });
  } catch (error) {
    console.error("Attendant check-in error:", error);
    return NextResponse.json(
      { error: "Failed to check in vehicle at gate terminal" },
      { status: 500 }
    );
  }
}
