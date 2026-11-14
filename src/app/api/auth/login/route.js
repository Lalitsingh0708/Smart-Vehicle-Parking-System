import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { loginSchema } from "@/lib/validations";
import { comparePassword, setSessionCookie } from "@/lib/auth";
import { sendVerificationOtpEmail, PLATFORM_ADMIN_EMAIL } from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const { email, password } = validatedData.data;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate fresh 6-digit login verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOtp = otp;
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const emailResult = await sendVerificationOtpEmail({
      email: cleanEmail,
      name: user.name,
      otp,
      purpose: "login",
    });

    // Return requiresOtp response - DO NOT issue session cookie until OTP is verified
    return NextResponse.json({
      requiresOtp: true,
      email: cleanEmail,
      message: `A 6-digit login verification code has been sent to ${cleanEmail}. Enter it below to access your dashboard.`,
      simulated: emailResult.simulated || false,
      devOtp: emailResult.simulated ? otp : undefined,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
