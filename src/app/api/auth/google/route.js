import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/callback/google`;

  if (!clientId) {
    return NextResponse.json(
      { error: "Google OAuth Client ID is not configured on the server" },
      { status: 500 }
    );
  }

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  // Check if role or mode was passed (e.g. ?role=attendant)
  const { searchParams } = new URL(request.url);
  const roleParam = searchParams.get("role") || "user";

  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: "offline",
    response_type: "code",
    prompt: "select_account",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    state: JSON.stringify({ role: roleParam }),
  };

  const qs = new URLSearchParams(options);
  const targetUrl = `${rootUrl}?${qs.toString()}`;

  return NextResponse.redirect(targetUrl);
}
