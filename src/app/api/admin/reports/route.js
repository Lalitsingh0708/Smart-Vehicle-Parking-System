import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingSession from "@/models/ParkingSession";
import SecurityIncident from "@/models/SecurityIncident";
import { authenticateApiRequest } from "@/lib/api-auth";

export async function GET(request) {
  const auth = await authenticateApiRequest("admin");
  if (!auth.authenticated) return auth.response;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "sessions"; // "sessions" or "incidents"
    const format = searchParams.get("format"); // "csv" or "json"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    if (type === "incidents") {
      const query = {};
      if (Object.keys(dateFilter).length > 0) {
        query.createdAt = dateFilter;
      }

      const incidents = await SecurityIncident.find(query)
        .populate("reportedBy", "name email")
        .populate("parkingLotId", "name")
        .populate("vehicleId", "registrationNumber")
        .sort({ createdAt: -1 })
        .lean();

      if (format === "csv") {
        const headers = ["ID", "Category", "Status", "Reported By", "Email", "Lot", "Vehicle", "Created At"];
        const rows = incidents.map((inc) => [
          inc._id.toString(),
          inc.category,
          inc.status,
          `"${inc.reportedBy?.name || "N/A"}"`,
          inc.reportedBy?.email || "N/A",
          `"${inc.parkingLotId?.name || "N/A"}"`,
          inc.vehicleId?.registrationNumber || "N/A",
          new Date(inc.createdAt).toLocaleString("en-IN"),
        ]);

        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

        return new NextResponse(csvContent, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="incidents_report.csv"',
          },
        });
      }

      return NextResponse.json({ incidents, count: incidents.length });
    }

    // Default: sessions report
    const query = {};
    if (Object.keys(dateFilter).length > 0) {
      query.entryTime = dateFilter;
    }

    const sessions = await ParkingSession.find(query)
      .populate("userId", "name email")
      .populate("parkingLotId", "name hourlyRate")
      .populate("parkingSlotId", "slotNumber zone")
      .populate("vehicleId", "registrationNumber make model")
      .sort({ createdAt: -1 })
      .lean();

    if (format === "csv") {
      const headers = [
        "Ticket ID",
        "Rider Name",
        "Email",
        "Vehicle Reg Number",
        "Parking Lot",
        "Zone",
        "Slot Number",
        "Entry Time",
        "Exit Time",
        "Fee (INR)",
        "Status",
      ];

      const rows = sessions.map((s) => [
        s.ticketId,
        `"${s.userId?.name || "N/A"}"`,
        s.userId?.email || "N/A",
        s.vehicleId?.registrationNumber || "N/A",
        `"${s.parkingLotId?.name || "N/A"}"`,
        s.parkingSlotId?.zone || "N/A",
        s.parkingSlotId?.slotNumber || "N/A",
        new Date(s.entryTime).toLocaleString("en-IN"),
        s.exitTime ? new Date(s.exitTime).toLocaleString("en-IN") : "Active",
        s.fee || 0,
        s.status,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="parking_sessions_report.csv"',
        },
      });
    }

    const totalRevenue = sessions.reduce((acc, curr) => acc + (curr.fee || 0), 0);

    return NextResponse.json({
      sessions,
      count: sessions.length,
      totalRevenue,
    });
  } catch (error) {
    console.error("Generate reports error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
