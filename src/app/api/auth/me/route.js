import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import ParkingSession from "@/models/ParkingSession";
import ParkingLot from "@/models/ParkingLot";
import ParkingSlot from "@/models/ParkingSlot";
import Vehicle from "@/models/Vehicle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// High-performance deduplication cache (3s TTL) to prevent simultaneous multiple DB hits from Navbar & HUD
const meCache = new Map();

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { authenticated: false, user: null },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    const cached = meCache.get(session.userId);
    if (cached && Date.now() - cached.timestamp < 3500) {
      return NextResponse.json(cached.data, {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    await connectDB();

    // Fast path: Only riders ('user' role) have active parking sessions.
    // Skipping session populate for admins and attendants saves 2 roundtrips and 3 joins on every page load.
    const isRider = session.role === "user";
    const userQuery = User.findById(session.userId).select("-passwordHash");
    if (session.role === "attendant") {
      userQuery.populate("assignedLotId");
    }

    const [user, activeSession] = await Promise.all([
      userQuery.lean(),
      isRider
        ? ParkingSession.findOne({
            userId: session.userId,
            status: "active",
          })
            .populate("parkingLotId", "name address city hourlyRate coordinates")
            .populate("parkingSlotId", "zone slotNumber")
            .populate("vehicleId", "registrationNumber make model")
            .lean()
        : Promise.resolve(null),
    ]);

    if (!user || !user.isVerified) {
      return NextResponse.json(
        { authenticated: false, user: null },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    const responsePayload = {
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        assignedLotId: user.assignedLotId || null,
      },
      activeSession: activeSession || null,
    };

    meCache.set(session.userId, {
      data: responsePayload,
      timestamp: Date.now(),
    });

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Authentication check failed" },
      { status: 500 }
    );
  }
}
