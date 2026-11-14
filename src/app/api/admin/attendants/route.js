import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import ParkingLot from "@/models/ParkingLot";
import { authenticateApiRequest } from "@/lib/api-auth";

export async function GET() {
  const auth = await authenticateApiRequest("admin");
  if (!auth.authenticated) return auth.response;

  try {
    await connectDB();

    const [attendants, lots] = await Promise.all([
      User.find({ role: "attendant" })
        .populate("assignedLotId", "name address hourlyRate")
        .select("-passwordHash -verificationOtp")
        .sort({ createdAt: -1 })
        .lean(),
      ParkingLot.find({ active: true }).select("name address").lean(),
    ]);

    return NextResponse.json({
      attendants,
      lots,
      pendingCount: attendants.filter((a) => !a.isApprovedByAdmin || a.attendantApprovalStatus === "pending").length,
    });
  } catch (error) {
    console.error("Fetch admin attendants error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve attendant records" },
      { status: 500 }
    );
  }
}
