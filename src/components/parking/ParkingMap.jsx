"use client";

import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function ParkingMap({
  lots = [],
  selectedLotId = null,
  onSelectLot,
  userLocation = null,
  zoom = 13,
  height = "420px",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const defaultCenter = [28.6139, 77.209]; // Default: New Delhi, India

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      const L = (await import("leaflet")).default;

      // Clean up existing map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Determine center: selected lot > user location > first lot > default India
      let initialCenter = defaultCenter;
      if (selectedLotId) {
        const found = lots.find((l) => (l.id || l._id) === selectedLotId);
        if (found?.coordinates) {
          initialCenter = [found.coordinates.latitude, found.coordinates.longitude];
        }
      } else if (userLocation?.lat && userLocation?.lng) {
        initialCenter = [userLocation.lat, userLocation.lng];
      } else if (lots.length > 0 && lots[0].coordinates) {
        initialCenter = [lots[0].coordinates.latitude, lots[0].coordinates.longitude];
      }

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoom,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Custom SVG icon creator
      const createParkingIcon = (isAvailable, isSelected) => {
        const bgColor = isSelected ? "#125448" : isAvailable ? "#176B5B" : "#6B7280";
        return L.divIcon({
          className: "custom-parking-marker",
          html: `
            <div style="background-color: ${bgColor}; width: 34px; height: 34px; border-radius: 8px; border: 2px solid #FFFFFF; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 15px; font-family: Inter, sans-serif;">
              P
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -34],
        });
      };

      // Add markers for lots
      markersRef.current = [];
      lots.forEach((lot) => {
        if (!lot.coordinates?.latitude || !lot.coordinates?.longitude) return;

        const isAvailable = (lot.availableCount ?? 0) > 0;
        const isSelected = (lot.id || lot._id) === selectedLotId;

        const marker = L.marker([lot.coordinates.latitude, lot.coordinates.longitude], {
          icon: createParkingIcon(isAvailable, isSelected),
        }).addTo(map);

        const popupContent = document.createElement("div");
        popupContent.className = "p-1 font-sans";
        popupContent.innerHTML = `
          <div style="min-width: 180px;">
            <div style="font-weight: 600; font-size: 14px; color: #18212F; margin-bottom: 2px;">
              ${lot.name}
            </div>
            <div style="font-size: 12px; color: #667085; margin-bottom: 6px;">
              ${lot.address}, ${lot.city}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-bottom: 8px; padding-top: 4px; border-top: 1px solid #E4E7EC;">
              <span style="color: ${isAvailable ? "#16A34A" : "#DC2626"}; font-weight: 600;">
                ${lot.availableCount ?? 0} available slots
              </span>
              <span style="font-weight: 600; color: #18212F;">
                ₹${lot.hourlyRate}/hr
              </span>
            </div>
            <a href="/parking/${lot.id || lot._id}" style="display: block; text-align: center; background-color: #176B5B; color: white; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; text-decoration: none;">
              Select This Lot
            </a>
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onSelectLot) {
          marker.on("click", () => {
            onSelectLot(lot);
          });
        }

        markersRef.current.push({ id: lot.id || lot._id, marker });
      });

      // User location marker if available
      if (userLocation?.lat && userLocation?.lng) {
        const userIcon = L.divIcon({
          className: "custom-user-marker",
          html: `
            <div style="background-color: #2563EB; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 0 2px #2563EB;"></div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup("Your detected location");
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lots, selectedLotId, userLocation, zoom]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: "100%", zIndex: 10 }}
      className="rounded-card overflow-hidden border border-border-subtle"
    />
  );
}
