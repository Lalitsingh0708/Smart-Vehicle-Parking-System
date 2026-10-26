import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SecurityIncident from "@/models/SecurityIncident";
import { authenticateApiRequest } from "@/lib/api-auth";
import { incidentResolutionSchema } from "@/lib/validations";

export async function GET(request, { params }) {
  const auth = await authenticateApiRequest();
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    await connectDB();

    const incident = await SecurityIncident.findById(id)
      .populate("reportedBy", "name email phoneNumber")
      .populate("parkingLotId", "name address city")
      .populate("vehicleId", "registrationNumber make model")
      .populate("parkingSessionId", "ticketId entryTime")
      .lean();

    if (!incident) {
      return NextResponse.json(
        { error: "Security incident not found" },
        { status: 404 }
      );
    }

    if (
      incident.reportedBy._id.toString() !== auth.session.userId &&
      auth.session.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Unauthorized access to this incident record" },
        { status: 403 }
      );
    }

    return NextResponse.json({ incident });
  } catch (error) {
    console.error("Fetch incident by ID error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve incident details" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  // Only administrators can update status and add resolution notes
  const auth = await authenticateApiRequest("admin");
  if (!auth.authenticated) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = incidentResolutionSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const incident = await SecurityIncident.findById(id);
    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    incident.status = validatedData.data.status;
    incident.resolutionNotes = validatedData.data.resolutionNotes;
    await incident.save();

    const updatedIncident = await SecurityIncident.findById(id)
      .populate("reportedBy", "name email phoneNumber")
      .populate("parkingLotId", "name address city")
      .populate("vehicleId", "registrationNumber make model");

    return NextResponse.json({
      message: "Incident status and resolution notes updated successfully",
      incident: updatedIncident,
    });
  } catch (error) {
    console.error("Update incident error:", error);
    return NextResponse.json(
      { error: "Failed to update incident record" },
      { status: 500 }
    );
  }
}
