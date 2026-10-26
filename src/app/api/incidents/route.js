import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SecurityIncident from "@/models/SecurityIncident";
import { authenticateApiRequest } from "@/lib/api-auth";
import { incidentSchema } from "@/lib/validations";

export async function GET(request) {
  const auth = await authenticateApiRequest();
  if (!auth.authenticated) return auth.response;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const query = {};

    // Standard users can only view their own incident reports
    if (auth.session.role !== "admin") {
      query.reportedBy = auth.session.userId;
    }

    if (status) query.status = status;
    if (category) query.category = category;

    const incidents = await SecurityIncident.find(query)
      .populate("reportedBy", "name email phoneNumber")
      .populate("parkingLotId", "name address city")
      .populate("vehicleId", "registrationNumber make model")
      .populate("parkingSessionId", "ticketId entryTime")
      .sort({ createdAt: -1 });

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("Fetch incidents error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve incident reports" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await authenticateApiRequest();
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    const validatedData = incidentSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const incidentData = {
      reportedBy: auth.session.userId,
      category: validatedData.data.category,
      description: validatedData.data.description,
      status: "open",
    };

    if (validatedData.data.parkingSessionId) {
      incidentData.parkingSessionId = validatedData.data.parkingSessionId;
    }
    if (validatedData.data.parkingLotId) {
      incidentData.parkingLotId = validatedData.data.parkingLotId;
    }
    if (validatedData.data.vehicleId) {
      incidentData.vehicleId = validatedData.data.vehicleId;
    }
    if (validatedData.data.evidenceUrl) {
      incidentData.evidenceUrl = validatedData.data.evidenceUrl;
    }

    const incident = await SecurityIncident.create(incidentData);

    const populatedIncident = await SecurityIncident.findById(incident._id)
      .populate("parkingLotId", "name address")
      .populate("vehicleId", "registrationNumber make model");

    return NextResponse.json(
      {
        message: "Incident report submitted successfully. An administrator will review your report.",
        incident: populatedIncident,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create incident error:", error);
    return NextResponse.json(
      { error: "Failed to submit security incident report" },
      { status: 500 }
    );
  }
}
