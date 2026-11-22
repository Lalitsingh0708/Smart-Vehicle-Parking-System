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
    const { id: lotId } = params;

    await connectDB();

    const lot = await ParkingLot.findById(lotId).lean();
    if (!lot) {
      return NextResponse.json(
        { error: "Parking lot not found" },
        { status: 404 }
      );
    }

    // 1. Fetch all sessions associated with this lot
    const sessions = await ParkingSession.find({ parkingLotId: lotId })
      .populate("userId", "name email phoneNumber role isVerified createdAt")
      .populate("parkingSlotId", "zone slotNumber status")
      .populate("vehicleId", "registrationNumber make model type")
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch all incidents reported for this lot
    const incidents = await SecurityIncident.find({ parkingLotId: lotId })
      .select("reportedBy status category createdAt")
      .lean();

    // Group incidents by user
    const userIncidentMap = new Map();
    for (const inc of incidents) {
      if (!inc.reportedBy) continue;
      const uId = inc.reportedBy.toString();
      const count = userIncidentMap.get(uId) || 0;
      userIncidentMap.set(uId, count + 1);
    }

    // 3. Aggregate unique users
    const usersMap = new Map();

    for (const sess of sessions) {
      if (!sess.userId?._id) continue;
      const uId = sess.userId._id.toString();

      if (!usersMap.has(uId)) {
        usersMap.set(uId, {
          user: sess.userId,
          totalSessions: 0,
          activeSession: null,
          recentVehicle: sess.vehicleId || null,
          recentSlot: sess.parkingSlotId || null,
          landmarkPhotosCount: 0,
          recentLandmarkPhoto: null,
          recentLandmarkNote: "",
          complaintsCount: userIncidentMap.get(uId) || 0,
          lastActivity: sess.createdAt,
        });
      }

      const userEntry = usersMap.get(uId);
      userEntry.totalSessions += 1;

      if (sess.status === "active" && !userEntry.activeSession) {
        userEntry.activeSession = {
          _id: sess._id,
          ticketId: sess.ticketId,
          slot: sess.parkingSlotId,
          vehicle: sess.vehicleId,
          entryTime: sess.entryTime,
          landmarkNote: sess.landmarkNote,
          landmarkPhotoUrl: sess.landmarkPhotoUrl,
        };
      }

      if (sess.landmarkPhotoUrl) {
        userEntry.landmarkPhotosCount += 1;
        if (!userEntry.recentLandmarkPhoto) {
          userEntry.recentLandmarkPhoto = sess.landmarkPhotoUrl;
          userEntry.recentLandmarkNote = sess.landmarkNote || "";
        }
      }
    }

    const usersList = Array.from(usersMap.values());

    return NextResponse.json({
      lot: {
        _id: lot._id,
        name: lot.name,
        address: lot.address,
        city: lot.city,
        totalCapacity: lot.totalCapacity,
        active: lot.active,
      },
      users: usersList,
      totalUsers: usersList.length,
    });
  } catch (error) {
    console.error("Admin fetch lot users error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve users for this parking lot" },
      { status: 500 }
    );
  }
}
