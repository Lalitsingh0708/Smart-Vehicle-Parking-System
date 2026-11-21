import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import ParkingLot from "@/models/ParkingLot";
import { authenticateApiRequest } from "@/lib/api-auth";
import { sendAttendantApprovedEmail, sendAttendantDutyAssignmentEmail } from "@/lib/email";

export async function POST(request) {
  const auth = await authenticateApiRequest("admin");
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    const { attendantId, action, assignedLotId, notes } = body;

    if (!attendantId) {
      return NextResponse.json(
        { error: "Attendant user ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const attendant = await User.findById(attendantId);
    if (!attendant || attendant.role !== "attendant") {
      return NextResponse.json(
        { error: "Attendant account not found" },
        { status: 404 }
      );
    }

    let lot = null;
    if (assignedLotId) {
      lot = await ParkingLot.findById(assignedLotId);
    } else if (attendant.assignedLotId) {
      lot = await ParkingLot.findById(attendant.assignedLotId);
    } else {
      lot = await ParkingLot.findOne({ active: true });
    }

    if (action === "approve") {
      attendant.isApprovedByAdmin = true;
      attendant.attendantApprovalStatus = "approved";
      attendant.approvedAt = new Date();
      attendant.approvedBy = auth.session.userId;
      if (lot) {
        attendant.assignedLotId = lot._id;
      }
      if (notes) attendant.approvalNotes = notes;

      await attendant.save();

      // Send live notification duty email to the attendant
      if (lot) {
        try {
          await sendAttendantDutyAssignmentEmail({
            email: attendant.email,
            name: attendant.name,
            lotName: lot.name,
            lotAddress: lot.address,
            lotCity: lot.city,
            openingHours: lot.openingHours || "Campus Standard Operating Hours",
            notes: notes || "Account approved and onboarded for duty operations.",
          });
        } catch (err) {
          console.error("Failed to send duty email on approve:", err);
        }
      }

      return NextResponse.json({
        success: true,
        message: `${attendant.name} verified and assigned to "${lot ? lot.name : "booth"}". Duty notification email sent.`,
        attendant: {
          id: attendant._id,
          name: attendant.name,
          email: attendant.email,
          isApprovedByAdmin: true,
          attendantApprovalStatus: "approved",
          assignedLotId: attendant.assignedLotId,
          approvedAt: attendant.approvedAt,
        },
      });
    } else if (action === "reassign") {
      if (!lot) {
        return NextResponse.json(
          { error: "Valid parking facility required for reassignment." },
          { status: 400 }
        );
      }
      attendant.assignedLotId = lot._id;
      if (notes) attendant.approvalNotes = notes;
      await attendant.save();

      // Send live duty assignment email
      try {
        await sendAttendantDutyAssignmentEmail({
          email: attendant.email,
          name: attendant.name,
          lotName: lot.name,
          lotAddress: lot.address,
          lotCity: lot.city,
          openingHours: lot.openingHours || "Campus Standard Operating Hours",
          notes: notes || "Duty reassigned by Platform Administrator. Please report on time.",
        });
      } catch (err) {
        console.error("Failed to send duty assignment email on reassign:", err);
      }

      return NextResponse.json({
        success: true,
        message: `${attendant.name} reassigned to "${lot.name}". Duty notification email sent.`,
        attendant: {
          id: attendant._id,
          name: attendant.name,
          email: attendant.email,
          isApprovedByAdmin: attendant.isApprovedByAdmin,
          attendantApprovalStatus: attendant.attendantApprovalStatus,
          assignedLotId: attendant.assignedLotId,
        },
      });
    } else if (action === "reject" || action === "revoke") {
      attendant.isApprovedByAdmin = false;
      attendant.attendantApprovalStatus = action === "reject" ? "rejected" : "pending";
      if (notes) attendant.approvalNotes = notes;

      await attendant.save();

      return NextResponse.json({
        success: true,
        message: `${attendant.name}'s attendant access has been ${action === "reject" ? "rejected" : "suspended"}.`,
        attendant: {
          id: attendant._id,
          name: attendant.name,
          email: attendant.email,
          isApprovedByAdmin: false,
          attendantApprovalStatus: attendant.attendantApprovalStatus,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Supported actions are 'approve', 'reject', and 'revoke'." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Attendant approval error:", error);
    return NextResponse.json(
      { error: "Internal server error while processing attendant approval" },
      { status: 500 }
    );
  }
}
