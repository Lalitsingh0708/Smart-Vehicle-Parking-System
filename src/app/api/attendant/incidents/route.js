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
    if (!lotId && auth.session.role === "attendant") {
      const user = await User.findById(auth.session.userId);
      lotId = user?.assignedLotId?.toString();
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
    if (!targetLotId && auth.session.role === "attendant") {
      const user = await User.findById(auth.session.userId);
      targetLotId = user?.assignedLotId?.toString();
    }

    if (!targetLotId) {
      const firstLot = await ParkingLot.findOne({ active: true });
      if (firstLot) targetLotId = firstLot._id.toString();
    }

    let vehicleId = undefined;
    let parkingSessionId = undefined;

    if (registrationNumber && typeof registrationNumber === "string") {
      const cleanReg = registrationNumber.trim().toUpperCase().replace(/\s+/g, "");
      const vehicle = await Vehicle.findOne({ registrationNumber: cleanReg });
      if (vehicle) {
        vehicleId = vehicle._id;
        // Check for active session
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
      vehicleId,
      parkingSessionId,
      category,
      description: description.trim(),
      evidenceUrl: evidenceUrl.trim(),
      status: "open",
    });

    const populated = await SecurityIncident.findById(incident._id)
      .populate("reportedBy", "name email")
      .populate("parkingLotId", "name address")
      .populate("vehicleId", "registrationNumber make model");

    return NextResponse.json(
      {
        message: "Security incident / violation recorded successfully.",
        incident: populated,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Attendant log incident error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record security incident" },
      { status: 500 }
    );
  }
}
