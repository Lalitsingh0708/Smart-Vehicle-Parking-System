"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Compass,
  Navigation,
  MapPin,
  Radio,
  Volume2,
  VolumeX,
  ExternalLink,
  ShieldCheck,
  Zap,
  Map as MapIcon,
  Crosshair,
  Sparkles,
} from "lucide-react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

const ParkingMap = dynamic(() => import("@/components/parking/ParkingMap"), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full bg-[#F7F8FA] flex items-center justify-center text-xs text-[#667085] rounded-xl border border-[#E4E7EC]">
      Loading facility satellite map...
    </div>
  ),
});

export default function ReturnCompassHUD({
  lot,
  slot,
  vehicle,
  viewMode: controlledViewMode,
  onToggleView,
  userLocation,
  routeInfo,
  onRouteCalculated,
}) {
  const [internalViewMode, setInternalViewMode] = useState("radar");
  const viewMode = controlledViewMode !== undefined ? controlledViewMode : internalViewMode;
  const setViewMode = onToggleView || setInternalViewMode;

  const lotsList = useMemo(() => (lot ? [lot] : []), [lot?._id, lot?.name]);

  const [heading, setHeading] = useState(42); // Compass bearing in degrees
  const [beaconActive, setBeaconActive] = useState(false);
  const [distanceMeters, setDistanceMeters] = useState(38);
  const [deviceTracking, setDeviceTracking] = useState(false);

  // Device orientation listener (rotates dynamically on mobile phones)
  useEffect(() => {
    const handleOrientation = (e) => {
      if (e.alpha !== null) {
        setDeviceTracking(true);
        // Alpha is the compass direction the device is pointing to (0 = North)
        setHeading(Math.round(e.alpha));
      }
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientation", handleOrientation, true);
      }
    };
  }, []);

  // Trigger simulated Smart Bay Beacon / Horn Flash
  const handleTriggerBeacon = () => {
    if (beaconActive) return;
    setBeaconActive(true);
    toast.success(
      `Bay ${slot.slotNumber || "A-01"} LED beacon activated for 15 seconds!`
    );

    // Haptic vibration on supported devices
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    setTimeout(() => {
      setBeaconActive(false);
    }, 15000);
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lot.coordinates?.latitude || 28.6315},${lot.coordinates?.longitude || 77.2167}&travelmode=walking`;

  return (
    <div className="bg-[#FFFFFF] rounded-2xl border-2 border-[#E2D9CC] shadow-[0_8px_32px_rgba(60,45,30,0.06)] overflow-hidden font-sans">
      {/* ═════════════════════════════════════════════════════════
          1. COMPASS HUD TOP HEADER (Soft Warm Beige & Forest Green)
      ═════════════════════════════════════════════════════════ */}
      <div className="p-4 sm:p-5 bg-[#FAF6EE] text-[#1C1815] flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#EFE9DF]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#176B5B] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-xs">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#176B5B] font-black">
                VEHICLE RETRIEVAL &amp; ORIENTATION
              </span>
              <span className="w-2 h-2 rounded-full bg-[#176B5B] animate-pulse" />
            </div>
            <h3 className="text-base font-black text-[#1C1815] tracking-tight leading-tight mt-0.5">
              Return to Your Two-Wheeler
            </h3>
          </div>
        </div>

        {/* View Switcher: Radar HUD vs Satellite Map */}
        <div className="flex items-center gap-1.5 bg-[#FFFFFF] p-1 rounded-xl border border-[#E5DACB] self-start sm:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("radar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              viewMode === "radar"
                ? "bg-[#176B5B] text-white shadow-xs border border-[#D4AF37]/50"
                : "text-[#66584B] hover:text-[#1C1815]"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>ORIENTATION DIAL</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              viewMode === "map"
                ? "bg-[#176B5B] text-white shadow-xs border border-[#D4AF37]/50"
                : "text-[#66584B] hover:text-[#1C1815]"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>CAMPUS MAP</span>
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════
          2. HUD MAIN DISPLAY (SOFT RETRIEVAL DIAL OR MAP)
      ═════════════════════════════════════════════════════════ */}
      {viewMode === "radar" ? (
        <div className="p-6 sm:p-8 bg-[#FAF7F2] text-[#1C1815] relative overflow-hidden flex flex-col items-center justify-center border-b-2 border-[#EFE9DF]">
          {/* Subtle architectural grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#176B5B 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Compass Reticle Visual Assembly */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center my-4">
            {/* Outer Compass Degree Ring in Warm Gold & Stone */}
            <div
              className="absolute inset-0 rounded-full border-2 border-[#DFD1BD] bg-white/70 shadow-sm transition-transform duration-500 ease-out"
              style={{ transform: `rotate(${-heading}deg)` }}
            >
              {/* Cardinal directions */}
              <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-xs font-mono font-black text-[#176B5B]">
                N
              </span>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-[#7A6C5F]">
                E
              </span>
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-[#7A6C5F]">
                S
              </span>
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-[#7A6C5F]">
                W
              </span>

              {/* Ticks on compass dial */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <div
                  key={deg}
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[1px] pointer-events-none"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <div className="w-[1px] h-2 bg-[#C2B4A1]" />
                </div>
              ))}
            </div>

            {/* Concentric Range Rings in Soft Gold & Champagne */}
            <div className="absolute w-44 h-44 rounded-full border border-dashed border-[#D4AF37]/35" />
            <div className="absolute w-28 h-28 rounded-full border border-[#D4AF37]/25" />
            <div className="absolute w-12 h-12 rounded-full border-2 border-[#176B5B]/30 bg-[#176B5B]/5" />

            {/* Target Bay Point Beacon in Forest Green with Gold Trim */}
            <div className="absolute top-10 right-14 flex flex-col items-center animate-bounce-slow z-20">
              <div className="relative">
                <span className="absolute -inset-1 rounded-full bg-[#176B5B] animate-ping opacity-40" />
                <div className="relative w-7 h-7 rounded-full bg-[#176B5B] text-[#D4AF37] font-mono font-black text-xs flex items-center justify-center border-2 border-[#D4AF37] shadow-md">
                  P
                </div>
              </div>
              <span className="text-[10px] font-mono font-black text-[#176B5B] bg-[#FAF6EE] px-2 py-0.5 rounded-md border border-[#D4AF37]/60 mt-1 shadow-xs whitespace-nowrap">
                BAY {slot.slotNumber || "A-01"}
              </span>
            </div>

            {/* Center Pointer / Directional Arrow in Forest Green */}
            <div
              className="relative w-16 h-16 flex items-center justify-center transition-transform duration-300 z-10"
              style={{ transform: `rotate(${heading + 25}deg)` }}
            >
              <svg
                className="w-12 h-12 text-[#176B5B] drop-shadow-[0_2px_8px_rgba(23,107,91,0.35)]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L19 21L12 17L5 21L12 2Z" />
              </svg>
            </div>
          </div>

          {/* Compass Telemetry Readout in Soft White & Gold */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 text-xs font-mono mt-2 z-10">
            <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#DFD1BD] shadow-xs">
              <span className="text-[#7A6C5F] block text-[9px] font-bold">HEADING</span>
              <span className="font-black text-[#176B5B]">
                {String(heading).padStart(3, "0")}° {heading < 90 ? "NE" : heading < 180 ? "SE" : heading < 270 ? "SW" : "NW"}
              </span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#DFD1BD] shadow-xs">
              <span className="text-[#7A6C5F] block text-[9px] font-bold">EST. DISTANCE</span>
              <span className="font-black text-[#1C1815]">~{distanceMeters} METERS</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#DFD1BD] shadow-xs">
              <span className="text-[#7A6C5F] block text-[9px] font-bold">WALKING TIME</span>
              <span className="font-black text-[#B08528]">~45 SECONDS</span>
            </div>
          </div>

          {/* Device tracking status hint */}
          <span className="text-[10px] font-mono text-[#7A6C5F] mt-3 text-center font-medium">
            {deviceTracking
              ? "● Device Gyroscope Connected (Live Orientation Active)"
              : "Bearing synchronized with facility coordinates"}
          </span>
        </div>
      ) : (
        /* Satellite / Ground Map View with Live Road Route */
        <div className="p-4 sm:p-5 bg-white border-b-2 border-[#EFE9DF] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1C1815] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#176B5B]" />
              <span>Campus Satellite Map &amp; Bay Route</span>
            </span>
            <span className="font-mono text-[10px] text-[#7A6C5F] font-bold">
              {lot.coordinates?.latitude?.toFixed(4)}° N, {lot.coordinates?.longitude?.toFixed(4)}° E
            </span>
          </div>

          {/* Active Navigation Route Banner */}
          {routeInfo && (
            <div className="p-3 bg-[#F0F8F5] border-2 border-[#A3D9C9] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#176B5B] text-white flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#176B5B] font-black block">
                    Active Route to Bay {slot.slotNumber || "A-01"}
                  </span>
                  <span className="text-xs font-black text-[#1C1815]">
                    {routeInfo.distanceMeters} meters along campus walkways • ~{Math.ceil((routeInfo.durationSeconds || 60) / 60)} min walk
                  </span>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat || 31.2562},${userLocation?.lng || 75.7032}&destination=${lot.coordinates?.latitude},${lot.coordinates?.longitude}&travelmode=walking`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#176B5B] hover:bg-[#125448] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
              >
                <span>Voice Navigation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <div className="rounded-xl overflow-hidden border-2 border-[#E2D9CC] shadow-xs">
            <ParkingMap
              lots={lotsList}
              selectedLotId={lot?._id}
              userLocation={userLocation}
              height="380px"
              zoom={16}
              onRouteCalculated={onRouteCalculated}
            />
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          3. INDOOR & GROUND MICRO-TELEMETRY (Soft Ivory & Gold)
      ═════════════════════════════════════════════════════════ */}
      <div className="p-5 sm:p-6 bg-white space-y-5">
        {/* Anchor & Pillar Telemetry Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#E5DACB]">
            <span className="text-[10px] font-mono uppercase text-[#7A6C5F] font-bold block mb-0.5">
              SECTOR / LEVEL
            </span>
            <span className="font-black text-[#1C1815] text-sm block">
              Ground Level
            </span>
            <span className="text-[10px] font-medium text-[#706254] block mt-0.5">
              Sector North 1
            </span>
          </div>

          <div className="p-3 bg-[#FAF3E8] border-2 border-[#D4AF37]/50 rounded-xl shadow-xs">
            <span className="text-[10px] font-mono uppercase text-[#916E28] font-black block mb-0.5">
              PILLAR ANCHOR
            </span>
            <span className="font-mono font-black text-[#176B5B] text-sm block">
              Pillar P-04
            </span>
            <span className="text-[10px] text-[#916E28] font-bold block mt-0.5">
              Radial Gate 4 Side
            </span>
          </div>

          <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#E5DACB]">
            <span className="text-[10px] font-mono uppercase text-[#7A6C5F] font-bold block mb-0.5">
              ZONE DEMARCATION
            </span>
            <span className="font-black text-[#1C1815] text-sm block">
              {slot.zone || "Zone A"}
            </span>
            <span className="text-[10px] font-medium text-[#706254] block mt-0.5">
              Aisle 1 (Bays 1-10)
            </span>
          </div>

          <div className="p-3 bg-[#F0F8F5] border-2 border-[#A3D9C9] rounded-xl shadow-xs">
            <span className="text-[10px] font-mono uppercase text-[#176B5B] font-black block mb-0.5">
              TARGET BAY
            </span>
            <span className="font-mono font-black text-2xl text-[#176B5B] block">
              {slot.slotNumber || "A-01"}
            </span>
            <span className="text-[10px] font-medium text-[#176B5B] block mt-0.5">
              1.2m × 2.2m Demarcated
            </span>
          </div>
        </div>

        {/* Action Controls: Smart Beacon & Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          {/* Smart Bay Beacon Trigger */}
          <button
            type="button"
            onClick={handleTriggerBeacon}
            disabled={beaconActive}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-xs font-black font-mono transition-all cursor-pointer shadow-xs ${
              beaconActive
                ? "bg-[#D4AF37] text-[#12382F] border-[#D4AF37] shadow-md"
                : "bg-[#176B5B] hover:bg-[#125448] text-white border-[#D4AF37]/50"
            }`}
          >
            <Zap className={`w-4 h-4 ${beaconActive ? "animate-bounce text-[#12382F]" : "text-[#D4AF37]"}`} />
            <span>
              {beaconActive
                ? "BAY BEACON FLASHING (15s)..."
                : "PINPOINT SLOT • FLASH BAY BEACON"}
            </span>
          </button>

          {/* Turn-by-Turn Walking Directions in Google Maps */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FAF6EE] hover:bg-[#EFE7D8] border-2 border-[#D9C49D] text-[#176B5B] text-xs font-black transition-all shadow-xs cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-[#176B5B]" />
            <span>Turn-by-Turn Walking Navigation</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#916E28]" />
          </a>
        </div>
      </div>
    </div>
  );
}

