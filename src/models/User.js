import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "attendant", "admin"],
      default: "user",
      index: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    assignedLotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingLot",
      index: true,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationOtp: {
      type: String,
      default: null,
    },
    verificationOtpExpires: {
      type: Date,
      default: null,
    },
    // Administrator Attendant Verification & Onboarding Workflow
    isApprovedByAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    attendantApprovalStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
      index: true,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvalNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
