"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Lovely Professional University (LPU), Phagwara, Punjab Coordinates
const LPU_CAMPUS_CENTER = [31.2536, 75.7037];

export default function ParkingMap({
  lots = [],
  selectedLotId = null,
  onSelectLot,
  userLocation = null,
  zoom = 16,
  height = "480px",
  onRouteCalculated,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const LRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routeGroupRef = useRef(null);
  const userMarkerRef = useRef(null);
  const lastRouteKeyRef = useRef(null);

  // 1. INITIALIZE LEAFLET MAP ONCE (Never remove/recreate on render to prevent flickering)
  useEffect(() => {
    let isMounted = true;

    async function setupMap() {
      if (typeof window === "undefined" || !mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      LRef.current = L;

      // Determine initial center
      let initialCenter = LPU_CAMPUS_CENTER;
      const initialSelected = lots.find((l) => (l.id || l._id) === selectedLotId);

      if (initialSelected?.coordinates?.latitude && initialSelected?.coordinates?.longitude) {
        initialCenter = [initialSelected.coordinates.latitude, initialSelected.coordinates.longitude];
      } else if (userLocation?.lat && userLocation?.lng) {
        initialCenter = [userLocation.lat, userLocation.lng];
      } else if (lots.length > 0 && lots[0].coordinates?.latitude) {
        initialCenter = [lots[0].coordinates.latitude, lots[0].coordinates.longitude];
      }

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoom,
        zoomControl: true,
      });

      // 1. High-Resolution Satellite Imagery Layer (Esri World Imagery)
      const satelliteTiles = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Esri Satellite Imagery",
          maxZoom: 19,
        }
      );

      // 2. High-Contrast Road & Landmark Labels Overlay
      const labelsOverlay = L.tileLayer(
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
        }
      );

      // 3. Standard Street Map Layer
      const streetTiles = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }
      );

      // SATELLITE VIEW AS DEFAULT
      const satelliteGroup = L.layerGroup([satelliteTiles, labelsOverlay]).addTo(map);

      // Interactive Layer Control
      const baseMaps = {
        "Satellite View (Campus)": satelliteGroup,
        "Standard Street Map": streetTiles,
      };
      L.control.layers(baseMaps, null, { position: "topright" }).addTo(map);

      // Dedicated layer groups for markers & navigation route
      markersGroupRef.current = L.layerGroup().addTo(map);
      routeGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size to ensure proper tile rendering without grey boxes
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    setupMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run ONCE on mount

  // 2. UPDATE MARKERS & ROUTE SMOOTHLY WITHOUT BLINKING MAP TILES
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L || !markersGroupRef.current || !routeGroupRef.current) return;

    // Clear previous markers without destroying map
    markersGroupRef.current.clearLayers();

    // Custom High-Contrast Parking Marker Icon
    const createParkingIcon = (isAvailable, isSelected) => {
      const bgColor = isSelected ? "#0F473C" : isAvailable ? "#176B5B" : "#4B5563";
      const ring = isSelected
        ? "box-shadow: 0 0 0 4px #D4AF37, 0 8px 16px rgba(0,0,0,0.5);"
        : "box-shadow: 0 4px 10px rgba(0,0,0,0.4);";

      return L.divIcon({
        className: "custom-parking-marker",
        html: `
          <div style="background-color: ${bgColor}; width: 38px; height: 38px; border-radius: 10px; border: 3px solid #FFFFFF; ${ring} display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 16px; font-family: Inter, sans-serif; cursor: pointer;">
            P
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
      });
    };

    // Render Parking Facility Markers
    lots.forEach((lot) => {
      if (!lot.coordinates?.latitude || !lot.coordinates?.longitude) return;

      const isAvailable = (lot.availableCount ?? 0) > 0;
      const isSelected = (lot.id || lot._id) === selectedLotId;

      const marker = L.marker([lot.coordinates.latitude, lot.coordinates.longitude], {
        icon: createParkingIcon(isAvailable, isSelected),
        zIndexOffset: isSelected ? 1000 : 100,
      }).addTo(markersGroupRef.current);

      const popupContent = document.createElement("div");
      popupContent.className = "p-1 font-sans";
      popupContent.innerHTML = `
        <div style="min-width: 200px;">
          <div style="font-weight: 800; font-size: 14px; color: #18212F; margin-bottom: 2px;">
            ${lot.name}
          </div>
          <div style="font-size: 11px; color: #667085; margin-bottom: 6px;">
            ${lot.address}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-bottom: 8px; padding-top: 4px; border-top: 1px solid #E4E7EC;">
            <span style="color: ${isAvailable ? "#16A34A" : "#DC2626"}; font-weight: 700;">
              ${lot.availableCount ?? 0} slots free
            </span>
            <span style="font-weight: 700; color: #18212F;">
              ₹${lot.hourlyRate}/hr
            </span>
          </div>
          <a href="/parking/${lot.id || lot._id}" style="display: block; text-align: center; background-color: #176B5B; color: white; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; text-decoration: none;">
            Select &amp; Allocate Bay &rarr;
          </a>
        </div>
      `;

      marker.bindPopup(popupContent);

      if (onSelectLot) {
        marker.on("click", () => {
          onSelectLot(lot);
        });
      }
    });

    // Render Rider Live Location Marker
    if (userLocation?.lat && userLocation?.lng) {
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <span style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: #00E5FF; opacity: 0.45; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="background-color: #00E5FF; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 12px rgba(0,229,255,0.9); z-index: 2;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 2000 })
        .addTo(markersGroupRef.current)
        .bindPopup("<b>Your Live Location</b><br/>Current Rider GPS Position");
    }

    // Draw Live Road Navigation Route
    const selectedLot = lots.find((l) => (l.id || l._id) === selectedLotId);

    if (userLocation?.lat && userLocation?.lng && selectedLot?.coordinates?.latitude) {
      const startLat = userLocation.lat;
      const startLng = userLocation.lng;
      const endLat = selectedLot.coordinates.latitude;
      const endLng = selectedLot.coordinates.longitude;

      const routeKey = `${startLat.toFixed(4)},${startLng.toFixed(4)}->${endLat.toFixed(4)},${endLng.toFixed(4)}`;

      // Only fetch route if route target has actually changed
      if (lastRouteKeyRef.current !== routeKey) {
        lastRouteKeyRef.current = routeKey;

        // Fetch real road route from OSRM engine
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

        fetch(osrmUrl)
          .then((res) => res.json())
          .then((routeData) => {
            if (!routeGroupRef.current) return;
            routeGroupRef.current.clearLayers();

            if (routeData.routes && routeData.routes.length > 0) {
              const rawCoords = routeData.routes[0].geometry.coordinates;
              const roadLatLngs = rawCoords.map(([lng, lat]) => [lat, lng]);
              const latLngs = [
                [startLat, startLng],
                ...roadLatLngs,
                [endLat, endLng],
              ];
              const distanceMeters = Math.round(routeData.routes[0].distance);
              const durationSec = Math.round(routeData.routes[0].duration);

              // Polyline Casing
              L.polyline(latLngs, {
                color: "#FFFFFF",
                weight: 9,
                opacity: 0.95,
                lineJoin: "round",
              }).addTo(routeGroupRef.current);

              // High-Contrast Cyan Navigation Path
              const navRoute = L.polyline(latLngs, {
                color: "#00E5FF",
                weight: 5,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
              }).addTo(routeGroupRef.current);

              map.fitBounds(navRoute.getBounds(), { padding: [60, 60] });

              if (onRouteCalculated) {
                onRouteCalculated({
                  distanceMeters,
                  durationSeconds: durationSec,
                  destinationName: selectedLot.name,
                });
              }
            }
          })
          .catch(() => {
            if (!routeGroupRef.current) return;
            routeGroupRef.current.clearLayers();

            const fallbackPath = [
              [startLat, startLng],
              [endLat, endLng],
            ];
            L.polyline(fallbackPath, {
              color: "#FFFFFF",
              weight: 8,
            }).addTo(routeGroupRef.current);

            const directRoute = L.polyline(fallbackPath, {
              color: "#00E5FF",
              weight: 5,
              dashArray: "6, 8",
            }).addTo(routeGroupRef.current);

            map.fitBounds(directRoute.getBounds(), { padding: [60, 60] });
          });
      }
    } else {
      routeGroupRef.current.clearLayers();
      lastRouteKeyRef.current = null;
    }
  }, [lots, selectedLotId, userLocation?.lat, userLocation?.lng]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: "100%", zIndex: 10 }}
      className="rounded-2xl overflow-hidden border-2 border-border-subtle shadow-md"
    />
  );
}
