import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendVerificationOtpEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    await connectDB();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return NextResponse.json(
        { error: "No account found matching this email address" },
        { status: 404 }
      );
    }

    // Generate fresh OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationOtp = otp;
    user.verificationOtpExpires = otpExpires;
    await user.save();

    const emailResult = await sendVerificationOtpEmail({
      email: cleanEmail,
      name: user.name,
      otp,
      purpose: "login",
    });

    return NextResponse.json({
      success: true,
      message: "A fresh verification code has been sent to your email.",
      simulated: emailResult.simulated || false,
      devOtp: emailResult.simulated ? otp : undefined,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error while resending verification code" },
      { status: 500 }
    );
  }
}
