import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { setSessionCookie, hashPassword } from "@/lib/auth";
import { PLATFORM_ADMIN_EMAIL } from "@/lib/email";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.json();
    const { credential, role: requestedRole = "user" } = body;

    if (!credential) {
      return NextResponse.json(
        { error: "Google credential token is required" },
        { status: 400 }
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;

    // 1. Verify token with Google's token verification service
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );

    const tokenInfo = await verifyRes.json();

    if (!verifyRes.ok || !tokenInfo.email) {
      console.error("Google token verification failed:", tokenInfo);
      return NextResponse.json(
        { error: tokenInfo.error_description || "Invalid Google token" },
        { status: 401 }
      );
    }

    // Verify audience matches our Client ID
    if (clientId && tokenInfo.aud !== clientId) {
      console.error("Google token audience mismatch:", tokenInfo.aud, "expected:", clientId);
      return NextResponse.json(
        { error: "Google token audience mismatch" },
        { status: 401 }
      );
    }

    const cleanEmail = tokenInfo.email.toLowerCase().trim();
    const userName = tokenInfo.name || tokenInfo.given_name || "Google User";

    await connectDB();

    // 2. Find or Create User in MongoDB
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      // Existing user: ensure email is verified
      user.isVerified = true;
      user.verificationOtp = null;
      user.verificationOtpExpires = null;

      // Sole platform administrator rule
      if (cleanEmail === PLATFORM_ADMIN_EMAIL) {
        user.role = "admin";
        user.isApprovedByAdmin = true;
      }

      await user.save();
    } else {
      // New user signup via Google
      let role = "user";
      let isApprovedByAdmin = true;
      let attendantApprovalStatus = "none";

      if (cleanEmail === PLATFORM_ADMIN_EMAIL) {
        role = "admin";
        isApprovedByAdmin = true;
        attendantApprovalStatus = "none";
      } else if (requestedRole === "attendant") {
        role = "attendant";
        isApprovedByAdmin = false;
        attendantApprovalStatus = "pending";
      }

      const randomPassword = crypto.randomBytes(32).toString("hex");
      const passwordHash = await hashPassword(randomPassword);

      user = await User.create({
        name: userName,
        email: cleanEmail,
        passwordHash,
        role,
        isVerified: true,
        isApprovedByAdmin,
        attendantApprovalStatus,
      });
    }

    // 3. Create Session Payload & Cookie
    const sessionPayload = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      assignedLotId: user.assignedLotId ? user.assignedLotId.toString() : null,
      isApprovedByAdmin: user.isApprovedByAdmin ?? (user.role !== "attendant"),
      attendantApprovalStatus:
        user.attendantApprovalStatus || (user.role === "attendant" ? "pending" : "none"),
    };

    await setSessionCookie(sessionPayload);

    // 4. Redirect Target
    let destination = "/dashboard";
    if (user.role === "admin") {
      destination = "/admin";
    } else if (user.role === "attendant") {
      destination = "/attendant";
    }

    return NextResponse.json({
      success: true,
      message: `Signed in as ${user.name}`,
      redirect: destination,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google verify route error:", error);
    return NextResponse.json(
      { error: "Internal server error during Google verification" },
      { status: 500 }
    );
  }
}
