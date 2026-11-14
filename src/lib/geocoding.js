/**
 * Reusable Geocoding Service (India-First & Dynamically Location-Aware)
 *
 * Implements the non-negotiable Location & Search Unbiased Policy:
 * 1. Never permanently bias searches to the US or Canada.
 * 2. Default to India (countrycodes=in) unless an explicit international destination is typed.
 * 3. Dynamically bias search viewbox toward user coordinates or campus region.
 * 4. Respects provider usage policies (User-Agent header, clean queries).
 */

export async function searchGeocodedLocation(query, options = {}) {
  if (!query || typeof query !== "string" || !query.trim()) {
    return [];
  }

  const trimmed = query.trim();
  const {
    userLat = null,
    userLng = null,
    countryCode = "in", // Default to India
    limit = 5,
  } = options;

  // Build params adhering to Nominatim usage guidelines
  const params = new URLSearchParams({
    q: trimmed,
    format: "json",
    addressdetails: "1",
    limit: String(limit),
  });

  // Check if user explicitly typed another country in query (e.g., "London, UK" or "Tokyo, Japan")
  const hasExplicitInternational = /,\s*(uk|usa|us|canada|japan|germany|france|australia|dubai|uae)\b/i.test(trimmed);

  if (!hasExplicitInternational && countryCode) {
    params.set("countrycodes", countryCode);
  }

  // If user coordinates are provided, bias viewbox around current position (+/- 0.5 degrees ~ 55km)
  if (userLat !== null && userLng !== null) {
    const lat = Number(userLat);
    const lng = Number(userLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      const viewbox = `${lng - 0.5},${lat + 0.5},${lng + 0.5},${lat - 0.5}`;
      params.set("viewbox", viewbox);
      params.set("bounded", "0"); // Prioritize viewbox without excluding other matches
    }
  }

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        "User-Agent": "WhereDidIPark-Campus-App/1.0 (wheredidipark@support.lpu.in)",
        "Accept-Language": "en-IN,en;q=0.9",
      },
    });

    if (!res.ok) {
      console.error("Geocoding lookup failed:", res.status);
      return [];
    }

    const data = await res.json();
    return (data || []).map((item) => ({
      placeId: item.place_id,
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
      address: item.address,
    }));
  } catch (err) {
    console.error("Geocoding service error:", err);
    return [];
  }
}

