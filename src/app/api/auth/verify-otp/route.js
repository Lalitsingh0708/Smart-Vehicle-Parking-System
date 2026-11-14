import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { setSessionCookie } from "@/lib/auth";
import { PLATFORM_ADMIN_EMAIL } from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email address and 6-digit OTP code are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    await connectDB();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return NextResponse.json(
        { error: "No account found matching this email address" },
        { status: 404 }
      );
    }

    const storedOtp = user.verificationOtp ? String(user.verificationOtp).trim() : "";

    // Verify OTP code strictly
    if (!storedOtp || storedOtp !== cleanOtp) {
      return NextResponse.json(
        { error: "Invalid verification code. Please check your email and try again." },
        { status: 400 }
      );
    }

    // Check expiration
    if (user.verificationOtpExpires && new Date(user.verificationOtpExpires).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Mark as verified & clear OTP
    user.isVerified = true;
    user.verificationOtp = null;
    user.verificationOtpExpires = null;

    // Enforce admin exclusivity rule
    if (user.email === PLATFORM_ADMIN_EMAIL) {
      user.role = "admin";
    } else if (user.role === "admin" && user.email !== PLATFORM_ADMIN_EMAIL) {
      user.role = "user";
    }

    await user.save();

    const sessionPayload = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      assignedLotId: user.assignedLotId ? user.assignedLotId.toString() : null,
      isApprovedByAdmin: user.isApprovedByAdmin ?? (user.role !== "attendant"),
      attendantApprovalStatus: user.attendantApprovalStatus || (user.role === "attendant" ? "pending" : "none"),
    };

    await setSessionCookie(sessionPayload);

    const redirect =
      sessionPayload.role === "admin"
        ? "/admin"
        : sessionPayload.role === "attendant"
        ? "/attendant"
        : "/dashboard";

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! Welcome to Where Did I Park?",
      redirect,
      user: sessionPayload,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error during OTP verification" },
      { status: 500 }
    );
  }
}
