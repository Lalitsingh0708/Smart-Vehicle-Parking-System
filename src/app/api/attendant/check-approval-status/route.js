import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import ParkingLot from "@/models/ParkingLot";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "admin") {
      return NextResponse.json({
        isApproved: true,
        status: "approved",
        role: "admin",
      });
    }

    await connectDB();
    const user = await User.findById(session.userId).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isApproved =
      user.isApprovedByAdmin === true && user.attendantApprovalStatus === "approved";

    let assignedLot = null;
    if (user.assignedLotId) {
      assignedLot = await ParkingLot.findById(user.assignedLotId).select("name address").lean();
    }

    return NextResponse.json({
      isApproved,
      status: user.attendantApprovalStatus || "pending",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        assignedLot: assignedLot ? { id: assignedLot._id, name: assignedLot.name, address: assignedLot.address } : null,
        approvedAt: user.approvedAt,
      },
    });
  } catch (error) {
    console.error("Check attendant approval status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
