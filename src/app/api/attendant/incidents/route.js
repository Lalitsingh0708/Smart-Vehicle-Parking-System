import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SecurityIncident from "@/models/SecurityIncident";
import ParkingLot from "@/models/ParkingLot";
import Vehicle from "@/models/Vehicle";
import ParkingSession from "@/models/ParkingSession";
import User from "@/models/User";
import { authenticateApiRequest } from "@/lib/api-auth";

export async function GET(request) {
  const auth = await authenticateApiRequest(["attendant", "admin"]);
  if (!auth.authenticated) return auth.response;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    let lotId = searchParams.get("lotId");

    // Strict Attendant Isolation: Can only view incidents for their own assigned facility
    if (auth.session.role === "attendant") {
      const user = await User.findById(auth.session.userId).lean();
      if (!user?.assignedLotId) {
        return NextResponse.json({ incidents: [] });
      }
      lotId = user.assignedLotId.toString();
    }

    const query = {};
    if (lotId) {
      query.parkingLotId = lotId;
    }

    const incidents = await SecurityIncident.find(query)
      .populate("reportedBy", "name email phoneNumber role")
      .populate("parkingLotId", "name address city")
      .populate("vehicleId", "registrationNumber make model vehicleType")
      .populate("parkingSessionId", "ticketId entryTime")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("Attendant incidents fetch error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve security incident records" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await authenticateApiRequest(["attendant", "admin"]);
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    const {
      lotId,
      category = "unauthorized_parking",
      description,
      registrationNumber,
      evidenceUrl = "",
    } = body;

    if (!description || description.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a descriptive explanation of the incident (at least 5 characters)." },
        { status: 400 }
      );
    }

    const validCategories = [
      "theft",
      "damage",
      "unauthorized_parking",
      "blocked_access",
      "helmet_theft",
      "other",
    ];

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid incident category selected." },
        { status: 400 }
      );
    }

    await connectDB();

    let targetLotId = lotId;

    // Strict Attendant Isolation: Can only report incidents for their own assigned facility
    if (auth.session.role === "attendant") {
      const user = await User.findById(auth.session.userId).lean();
      if (!user?.assignedLotId) {
        return NextResponse.json(
          { error: "No parking facility assigned to your attendant account." },
          { status: 403 }
        );
      }
      targetLotId = user.assignedLotId.toString();
    }

    if (!targetLotId) {
      const firstLot = await ParkingLot.findOne({ active: true });
      if (firstLot) targetLotId = firstLot._id.toString();
    }

    let vehicleId = undefined;
    let parkingSessionId = undefined;

    if (registrationNumber) {
      const cleanReg = registrationNumber.trim().toUpperCase().replace(/\s+/g, "");
      const vehicle = await Vehicle.findOne({ registrationNumber: cleanReg });
      if (vehicle) {
        vehicleId = vehicle._id;
        const activeSession = await ParkingSession.findOne({
          vehicleId: vehicle._id,
          status: "active",
        });
        if (activeSession) {
          parkingSessionId = activeSession._id;
        }
      }
    }

    const incident = await SecurityIncident.create({
      reportedBy: auth.session.userId,
      parkingLotId: targetLotId,
      parkingSessionId,
      vehicleId,
      category,
      description: description.trim(),
      evidenceUrl: evidenceUrl.trim(),
      status: "open",
    });

    const populatedIncident = await SecurityIncident.findById(incident._id)
      .populate("reportedBy", "name email phoneNumber role")
      .populate("parkingLotId", "name address city")
      .populate("vehicleId", "registrationNumber make model")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Security incident reported to campus control center.",
      incident: populatedIncident,
    });
  } catch (error) {
    console.error("Attendant report incident error:", error);
    return NextResponse.json(
      { error: "Failed to record security incident" },
      { status: 500 }
    );
  }
}
