import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingLot from "@/models/ParkingLot";
import ParkingSession from "@/models/ParkingSession";
import SecurityIncident from "@/models/SecurityIncident";
import User from "@/models/User";
import { authenticateApiRequest } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request, context) {
  const auth = await authenticateApiRequest("admin");
  if (!auth.authenticated) return auth.response;

  try {
    const params = await context.params;
    const { id: lotId, userId } = params;

    await connectDB();

    const [lot, user] = await Promise.all([
      ParkingLot.findById(lotId).lean(),
      User.findById(userId).select("-passwordHash").lean(),
    ]);

    if (!lot) {
      return NextResponse.json(
        { error: "Parking facility not found" },
        { status: 404 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 1. Fetch all sessions by this user in this lot
    const sessions = await ParkingSession.find({
      parkingLotId: lotId,
      userId: userId,
    })
      .populate("parkingSlotId", "zone slotNumber status")
      .populate("vehicleId", "registrationNumber make model type")
      .sort({ createdAt: -1 })
      .lean();

    // 2. Extract landmark photos
    const landmarkPhotos = sessions
      .filter((s) => Boolean(s.landmarkPhotoUrl))
      .map((s) => ({
        sessionId: s._id,
        ticketId: s.ticketId,
        slotNumber: s.parkingSlotId?.slotNumber || "Bay",
        zone: s.parkingSlotId?.zone || "Zone",
        photoUrl: s.landmarkPhotoUrl,
        publicId: s.landmarkPhotoPublicId,
        note: s.landmarkNote || "No landmark note entered",
        createdAt: s.createdAt,
        status: s.status,
      }));

    // 3. Fetch all complaints/security incidents reported by this user in this lot
    const incidents = await SecurityIncident.find({
      parkingLotId: lotId,
      reportedBy: userId,
    })
      .populate("vehicleId", "registrationNumber make model")
      .populate("parkingSessionId", "ticketId")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      lot: {
        _id: lot._id,
        name: lot.name,
        address: lot.address,
        city: lot.city,
      },
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
      sessions,
      landmarkPhotos,
      incidents,
      stats: {
        totalSessions: sessions.length,
        activeSessions: sessions.filter((s) => s.status === "active").length,
        totalPhotos: landmarkPhotos.length,
        totalComplaints: incidents.length,
      },
    });
  } catch (error) {
    console.error("Admin fetch user in lot error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user details for this parking lot" },
      { status: 500 }
    );
  }
}
