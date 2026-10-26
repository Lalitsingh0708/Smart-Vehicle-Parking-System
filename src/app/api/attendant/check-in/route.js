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

    // Determine target parking lot
    if (!lotId && auth.session.role === "attendant") {
      const user = await User.findById(auth.session.userId);
      lotId = user?.assignedLotId?.toString();
    }
    if (!lotId) {
      const firstLot = await ParkingLot.findOne({ active: true });
      if (firstLot) lotId = firstLot._id.toString();
    }

    const lot = await ParkingLot.findById(lotId);
    if (!lot) {
      return NextResponse.json(
        { error: "Parking lot not found or inactive" },
        { status: 404 }
      );
    }

    // Check if vehicle is already parked in any active session
    const existingActiveSession = await ParkingSession.findOne({
      status: "active",
    }).populate("vehicleId parkingLotId parkingSlotId");

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
          error: `Vehicle ${cleanReg} is already checked in at ${vehicleActive.parkingLotId?.name || "a facility"} (Slot: ${vehicleActive.parkingSlotId?.slotNumber}). Check out the existing session first.`,
        },
        { status: 409 }
      );
    }

    // Check if this vehicle is registered in database
    let vehicle = await Vehicle.findOne({ registrationNumber: cleanReg });
    let riderUser = null;

    if (!vehicle) {
      // Find or create walk-in user account for unattended walk-in riders
      riderUser = await User.findOne({ email: "walkin@system.local" });
      if (!riderUser) {
        riderUser = await User.create({
          name: riderName || "Walk-in Rider",
          email: "walkin@system.local",
          passwordHash: "NONE",
          role: "user",
          phoneNumber: riderPhone || "",
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

    // Determine slot to claim: either specified slotId or first available slot in lot
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
        { new: true }
      );
    }

    if (!targetSlot) {
      return NextResponse.json(
        { error: "No available slots in this parking facility to check in." },
        { status: 409 }
      );
    }

    // Generate ticket and create session
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const ticketId = `WDIP-${datePrefix}-${randomSuffix}`;

    try {
      const session = await ParkingSession.create({
        userId: riderUser._id,
        vehicleId: vehicle._id,
        parkingLotId: lotId,
        parkingSlotId: targetSlot._id,
        ticketId,
        entryTime: new Date(),
        status: "active",
        paymentStatus: "pending",
        fee: 0,
      });

      const populated = await ParkingSession.findById(session._id)
        .populate("parkingLotId", "name address city hourlyRate")
        .populate("parkingSlotId", "zone slotNumber")
        .populate("vehicleId", "registrationNumber make model vehicleType");

      return NextResponse.json(
        {
          message: `Check-in successful! Vehicle ${cleanReg} assigned to Slot ${targetSlot.zone} • ${targetSlot.slotNumber}`,
          session: populated,
          slot: targetSlot,
        },
        { status: 201 }
      );
    } catch (err) {
      // Compensate rollback slot
      await ParkingSlot.findByIdAndUpdate(targetSlot._id, {
        $set: { status: "available" },
      });
      throw err;
    }
  } catch (error) {
    console.error("Attendant check-in error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process attendant check-in" },
      { status: 500 }
    );
  }
}
