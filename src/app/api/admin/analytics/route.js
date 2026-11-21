import { NextResponse } from "next/server";
import { getAdminAnalyticsData } from "@/lib/analytics";
import { authenticateApiRequest } from "@/lib/api-auth";

export async function GET() {
  const auth = await authenticateApiRequest("admin");
  if (!auth.authenticated) return auth.response;

  try {
    const data = await getAdminAnalyticsData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch admin analytics error:", error);
    return NextResponse.json(
      { error: "Failed to generate administrator analytics" },
      { status: 500 }
    );
  }
}
