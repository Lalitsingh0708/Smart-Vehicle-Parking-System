import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { setSessionCookie, hashPassword } from "@/lib/auth";
import { PLATFORM_ADMIN_EMAIL } from "@/lib/email";
import crypto from "crypto";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code) {
    console.error("Google OAuth error or code missing:", error);
    return NextResponse.redirect(`${appUrl}/login?error=Google authentication canceled`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/callback/google`;

    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Failed to exchange code for Google token:", tokenData);
      return NextResponse.redirect(
        `${appUrl}/login?error=Failed to retrieve authentication token from Google`
      );
    }

    // 2. Fetch authenticated user profile from Google
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileResponse.json();

    if (!profileResponse.ok || !profile.email) {
      console.error("Failed to fetch Google profile:", profile);
      return NextResponse.redirect(
        `${appUrl}/login?error=Failed to retrieve user profile from Google`
      );
    }

    const cleanEmail = profile.email.toLowerCase().trim();
    const userName = profile.name || profile.given_name || "Google User";

    // Parse role from state if provided
    let requestedRole = "user";
    if (state) {
      try {
        const parsedState = JSON.parse(state);
        if (parsedState.role === "attendant") {
          requestedRole = "attendant";
        }
      } catch {
        // ignore parse errors
      }
    }

    await connectDB();

    // 3. Find or Create User in MongoDB
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      // Existing user: mark email verified since verified by Google
      user.isVerified = true;
      user.verificationOtp = null;
      user.verificationOtpExpires = null;

      // Sole platform administrator enforcement
      if (cleanEmail === PLATFORM_ADMIN_EMAIL) {
        user.role = "admin";
        user.isApprovedByAdmin = true;
      }

      await user.save();
    } else {
      // New user registration via Google
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

    // 4. Create Session and Set Cookie
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

    // 5. Determine redirection
    let destination = "/dashboard";
    if (user.role === "admin") {
      destination = "/admin";
    } else if (user.role === "attendant") {
      destination = "/attendant";
    }

    return NextResponse.redirect(`${appUrl}${destination}`);
  } catch (err) {
    console.error("Google OAuth callback exception:", err);
    return NextResponse.redirect(
      `${appUrl}/login?error=An unexpected error occurred during Google sign in`
    );
  }
}
