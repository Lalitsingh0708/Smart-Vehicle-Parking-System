import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingSession from "@/models/ParkingSession";
import ParkingSlot from "@/models/ParkingSlot";
import ParkingLot from "@/models/ParkingLot";
import Vehicle from "@/models/Vehicle";
import { authenticateApiRequest } from "@/lib/api-auth";
import { allocateSlotSchema } from "@/lib/validations";

export async function GET(request) {
  const auth = await authenticateApiRequest();
  if (!auth.authenticated) return auth.response;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query = { userId: auth.session.userId };
    if (status) {
      query.status = status;
    }

    const sessions = await ParkingSession.find(query)
      .populate("parkingLotId")
      .populate("parkingSlotId")
      .populate("vehicleId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Fetch sessions error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve parking sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await authenticateApiRequest();
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    const validatedData = allocateSlotSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { parkingLotId, parkingSlotId, vehicleId } = validatedData.data;

    await connectDB();

    // 1. Verify vehicle belongs to user
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      ownerId: auth.session.userId,
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Selected vehicle not found or unauthorized" },
        { status: 404 }
      );
    }

    // 2. Prevent duplicate active session for the same vehicle
    const existingActiveVehicleSession = await ParkingSession.findOne({
      vehicleId,
      status: "active",
    });

    if (existingActiveVehicleSession) {
      return NextResponse.json(
        {
          error:
            "This vehicle is already parked in an active session. Check out of your current session before allocating a new slot.",
        },
        { status: 400 }
      );
    }

    // 3. Verify lot exists and is active
    const lot = await ParkingLot.findOne({ _id: parkingLotId, active: true });
    if (!lot) {
      return NextResponse.json(
        { error: "Selected parking lot is inactive or not found" },
        { status: 404 }
      );
    }

    // 4. Concurrency-safe atomic conditional update to claim the slot
    // Only succeeds if slot status is currently 'available'
    const claimedSlot = await ParkingSlot.findOneAndUpdate(
      {
        _id: parkingSlotId,
        parkingLotId,
        status: "available",
      },
      {
        $set: { status: "occupied" },
      },
      { new: true }
    );

    if (!claimedSlot) {
      return NextResponse.json(
        {
          error:
            "The requested slot is no longer available. Another rider may have just claimed it. Please select a different slot.",
        },
        { status: 409 }
      );
    }

    // 5. Generate unique ticket identifier
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const ticketId = `WDIP-${datePrefix}-${randomSuffix}`;

    try {
      const session = await ParkingSession.create({
        userId: auth.session.userId,
        vehicleId,
        parkingLotId,
        parkingSlotId,
        ticketId,
        entryTime: new Date(),
        status: "active",
        paymentStatus: "pending",
        fee: 0,
      });

      const populatedSession = await ParkingSession.findById(session._id)
        .populate("parkingLotId")
        .populate("parkingSlotId")
        .populate("vehicleId");

      return NextResponse.json(
        {
          message: "Parking slot allocated successfully",
          session: populatedSession,
        },
        { status: 201 }
      );
    } catch (sessionError) {
      // Compensate/rollback slot status if session record creation fails
      await ParkingSlot.findByIdAndUpdate(parkingSlotId, {
        $set: { status: "available" },
      });
      throw sessionError;
    }
  } catch (error) {
    console.error("Allocate slot error:", error);
    return NextResponse.json(
      { error: "Failed to allocate parking slot" },
      { status: 500 }
    );
  }
}
