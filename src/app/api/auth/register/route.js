import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/auth";
import { sendVerificationOtpEmail, PLATFORM_ADMIN_EMAIL } from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const { name, email, password, phoneNumber, accountType } = validatedData.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    const passwordHash = await hashPassword(password);

    // Sole platform administrator rule & attendant approval assignment
    let role = "user";
    let isApprovedByAdmin = true;
    let attendantApprovalStatus = "none";

    if (cleanEmail === PLATFORM_ADMIN_EMAIL) {
      role = "admin";
      isApprovedByAdmin = true;
      attendantApprovalStatus = "none";
    } else if (accountType === "attendant") {
      role = "attendant";
      isApprovedByAdmin = false;
      attendantApprovalStatus = "pending";
    }

    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { error: "An account with this email address already exists. Please sign in." },
          { status: 409 }
        );
      }

      // Existing unverified account: update credentials and send fresh OTP
      existingUser.name = name;
      existingUser.passwordHash = passwordHash;
      existingUser.phoneNumber = phoneNumber || "";
      existingUser.verificationOtp = otp;
      existingUser.verificationOtpExpires = otpExpires;
      existingUser.role = role;
      existingUser.isApprovedByAdmin = isApprovedByAdmin;
      existingUser.attendantApprovalStatus = attendantApprovalStatus;
      await existingUser.save();

      const emailResult = await sendVerificationOtpEmail({ email: cleanEmail, name, otp });

      return NextResponse.json({
        requiresVerification: true,
        email: cleanEmail,
        message: "Verification OTP sent to your email. Please enter the code to activate your account.",
        simulated: emailResult.simulated || false,
        devOtp: emailResult.simulated ? otp : undefined,
      });
    }

    // Create new unverified user
    await User.create({
      name,
      email: cleanEmail,
      passwordHash,
      role,
      phoneNumber: phoneNumber || "",
      isVerified: false,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
      isApprovedByAdmin,
      attendantApprovalStatus,
    });

    const emailResult = await sendVerificationOtpEmail({ email: cleanEmail, name, otp });

    return NextResponse.json(
      {
        requiresVerification: true,
        email: cleanEmail,
        message: "Account created! A 6-digit verification code has been sent to your email.",
        simulated: emailResult.simulated || false,
        devOtp: emailResult.simulated ? otp : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
