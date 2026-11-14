import { NextResponse } from "next/server";
import { searchGeocodedLocation } from "@/lib/geocoding";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const userLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")) : null;
    const userLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")) : null;

    if (!query.trim()) {
      return NextResponse.json({ places: [] });
    }

    const places = await searchGeocodedLocation(query, {
      userLat,
      userLng,
      countryCode: "in", // Default India priority
    });

    return NextResponse.json({ places });
  } catch (err) {
    console.error("Location search route error:", err);
    return NextResponse.json({ error: "Failed to search location", places: [] }, { status: 500 });
  }
}

