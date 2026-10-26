import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingSession from "@/models/ParkingSession";
import { authenticateApiRequest } from "@/lib/api-auth";

export async function GET(request, { params }) {
  const auth = await authenticateApiRequest();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    await connectDB();

    const session = await ParkingSession.findById(id)
      .populate("parkingLotId")
      .populate("parkingSlotId")
      .populate("vehicleId")
      .lean();

    if (!session) {
      return NextResponse.json(
        { error: "Parking session not found" },
        { status: 404 }
      );
    }

    // Must be owner or admin
    if (session.userId.toString() !== auth.session.userId && auth.session.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access to this parking session" },
        { status: 403 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Fetch session by ID error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve parking session details" },
      { status: 500 }
    );
  }
}
