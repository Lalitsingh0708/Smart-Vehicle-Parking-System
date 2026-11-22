"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Compass,
  Navigation,
  MapPin,
  Radio,
  Volume2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Map as MapIcon,
  Crosshair,
  Footprints,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Play,
  Square,
  VolumeX,
  Camera,
  Image as ImageIcon,
  Maximize2,
  Upload,
} from "lucide-react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import LandmarkPhotoModal from "@/components/parking/LandmarkPhotoModal";

const ParkingMap = dynamic(() => import("@/components/parking/ParkingMap"), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full bg-[#FAF7F2] flex items-center justify-center text-xs text-[#7A6C5F] rounded-xl border border-[#E2D9CC]">
      Loading facility satellite map...
    </div>
  ),
});

// Haversine geodesic distance in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 38;
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(1, Math.round(R * c));
}

// Bearing calculation in degrees (0 = North, 90 = East)
function calculateBearing(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 42;
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

// Web Audio API key-fob chirp sound (instant, zero file dependency)
function playKeyFobChirp() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    // First chirp
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(2400, ctx.currentTime);
    gain1.gain.setValueAtTime(0.18, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.09);

    // Second chirp (120ms later)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(2700, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.22);
  } catch {
    // Audio context was blocked or not allowed by browser policy
  }
}

export default function ReturnCompassHUD({
  session = {},
  onSessionUpdated,
  lot = {},
  slot = {},
  vehicle = {},
  viewMode: controlledViewMode,
  onToggleView,
  userLocation: propUserLocation,
  routeInfo,
  onRouteCalculated,
}) {
  const [internalViewMode, setInternalViewMode] = useState("radar");
  const viewMode = controlledViewMode !== undefined ? controlledViewMode : internalViewMode;
  const setViewMode = onToggleView || setInternalViewMode;

  const [isLandmarkModalOpen, setIsLandmarkModalOpen] = useState(false);
  const [isEnlargedPhotoOpen, setIsEnlargedPhotoOpen] = useState(false);

  const lotsList = useMemo(() => (lot?._id ? [lot] : []), [lot?._id, lot?.name]);

  // Destination coordinates of parked vehicle
  const bikeLat = lot.coordinates?.latitude || 31.2536;
  const bikeLng = lot.coordinates?.longitude || 75.7037;

  // Live GPS & Tracking States
  const [userLocation, setUserLocation] = useState(
    propUserLocation || { lat: 31.2562, lng: 75.7032 }
  );
  const [deviceHeading, setDeviceHeading] = useState(0); // Device gyroscope heading
  const [targetBearing, setTargetBearing] = useState(42); // Direction from user to bike
  const [distanceMeters, setDistanceMeters] = useState(38);
  const [isLiveGpsActive, setIsLiveGpsActive] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);

  // Simulated walking walk-through state (for testing / demo / lab presentation)
  const [isSimulatingWalk, setIsSimulatingWalk] = useState(false);
  const simIntervalRef = useRef(null);

  // Audio beacon state
  const [beaconActive, setBeaconActive] = useState(false);

  // Recalculate distance and bearing when location changes
  useEffect(() => {
    if (userLocation?.lat && userLocation?.lng) {
      const dist = calculateDistanceMeters(userLocation.lat, userLocation.lng, bikeLat, bikeLng);
      const brg = calculateBearing(userLocation.lat, userLocation.lng, bikeLat, bikeLng);
      setDistanceMeters(dist);
      setTargetBearing(brg);
      setHasArrived(dist <= 5);
    }
  }, [userLocation, bikeLat, bikeLng]);

  // Sync prop location if passed
  useEffect(() => {
    if (propUserLocation?.lat && propUserLocation?.lng) {
      setUserLocation(propUserLocation);
    }
  }, [propUserLocation]);

  // Real Device Gyroscope / Orientation Listener
  useEffect(() => {
    const handleOrientation = (e) => {
      if (e.alpha !== null) {
        // Alpha is 0-360 compass direction
        setDeviceHeading(Math.round(e.alpha));
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

  // Live GPS Watch Handler
  const startLiveGps = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLiveGpsActive(true);
    toast.success("Live GPS Radar Connected! Tracking your position.");

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        // Fallback default if user denies permission
        setIsLiveGpsActive(false);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    return () => {
      if (navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Trigger Simulated Walking (Viva / Demo Feature)
  const toggleSimulateWalk = () => {
    if (isSimulatingWalk) {
      clearInterval(simIntervalRef.current);
      setIsSimulatingWalk(false);
      toast("Walking simulation paused");
      return;
    }

    setIsSimulatingWalk(true);
    setHasArrived(false);
    toast.success("Walking approach initiated! Watch the radar & distance count down.");

    // Start from 45m away and step closer every second
    let currentDist = 45;
    setDistanceMeters(currentDist);

    simIntervalRef.current = setInterval(() => {
      currentDist -= 5;
      if (currentDist <= 0) {
        currentDist = 0;
        setDistanceMeters(0);
        setHasArrived(true);
        clearInterval(simIntervalRef.current);
        setIsSimulatingWalk(false);
        playKeyFobChirp();
        toast.success("You have arrived at your two-wheeler bay!", { duration: 5000 });
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([150, 100, 200]);
        }
      } else {
        setDistanceMeters(currentDist);
      }
    }, 1000);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  // Trigger Smart Bay Key Chirp & LED Beacon
  const handleTriggerBeacon = () => {
    if (beaconActive) return;
    setBeaconActive(true);
    playKeyFobChirp();

    toast.success(
      `Bay ${slot.slotNumber || "A-01"} LED Beacon activated with double-chirp!`
    );

    // Haptic vibration on supported devices
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([80, 50, 120]);
    }

    setTimeout(() => {
      setBeaconActive(false);
    }, 12000);
  };

  // Net relative needle angle (pointing towards target relative to user facing heading)
  const needleAngle = (targetBearing - deviceHeading + 360) % 360;

  // Directions URL for direct Google Maps walking mode
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat || 31.2562},${userLocation?.lng || 75.7032}&destination=${bikeLat},${bikeLng}&travelmode=walking`;

  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#EBE3D7] shadow-[0_15px_40px_rgba(28,24,21,0.06)] overflow-hidden font-sans">
      
      {/* ═════════════════════════════════════════════════════════
          1. COMPASS HUD TOP HEADER (Soft Luxury Beige & Forest Green)
      ═════════════════════════════════════════════════════════ */}
      <div className="p-4 sm:p-5 bg-[#FAF7F2] text-[#1C1815] flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE3D7]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#176B5B] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-sm">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#176B5B] font-black">
                LIVE RETRIEVAL RADAR
              </span>
              <span className={`w-2 h-2 rounded-full ${isLiveGpsActive || isSimulatingWalk ? "bg-[#52FF00] animate-ping" : "bg-[#176B5B] animate-pulse"}`} />
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#1C1815] tracking-tight leading-tight mt-0.5">
              Navigate to Your Two-Wheeler
            </h3>
          </div>
        </div>

        {/* View Switcher: Live Radar HUD vs Campus Satellite Map */}
        <div className="flex items-center gap-1.5 bg-[#FFFFFF] p-1 rounded-xl border border-[#E2D9CC] self-start sm:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("radar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              viewMode === "radar"
                ? "bg-[#176B5B] text-white shadow-xs border border-[#D4AF37]/50"
                : "text-[#706254] hover:text-[#1C1815]"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>RADAR COMPASS</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              viewMode === "map"
                ? "bg-[#176B5B] text-white shadow-xs border border-[#D4AF37]/50"
                : "text-[#706254] hover:text-[#1C1815]"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>CAMPUS MAP</span>
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════
          2. HUD MAIN DISPLAY: LIVE RADAR OR CAMPUS MAP
      ═════════════════════════════════════════════════════════ */}
      {viewMode === "radar" ? (
        <div className="p-6 sm:p-8 bg-[#FAF7F2] text-[#1C1815] relative overflow-hidden flex flex-col items-center justify-center border-b border-[#EBE3D7]">
          {/* Subtle architectural grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#176B5B 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Arrived Celebration Banner */}
          {hasArrived && (
            <div className="mb-4 py-2 px-4 bg-[#52FF00]/20 border-2 border-[#52FF00] rounded-xl flex items-center gap-2 text-xs font-black text-[#0A2603] animate-bounce z-20 shadow-md">
              <CheckCircle2 className="w-4 h-4 text-[#176B5B] stroke-[3]" />
              <span>YOU HAVE ARRIVED AT BAY {slot.slotNumber || "A-01"}!</span>
            </div>
          )}

          {/* Main Rotating Radar Assembly */}
          <div className="relative w-60 h-60 sm:w-72 sm:h-72 flex items-center justify-center my-3">
            {/* Outer Compass Degree Ring in Warm Gold & Bone */}
            <div
              className="absolute inset-0 rounded-full border-2 border-[#DFD1BD] bg-white/80 shadow-md transition-transform duration-700 ease-out"
              style={{ transform: `rotate(${-deviceHeading}deg)` }}
            >
              {/* Cardinal directions */}
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-mono font-black text-[#176B5B]">
                N
              </span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10.5px] font-mono font-bold text-[#7A6C5F]">
                E
              </span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10.5px] font-mono font-bold text-[#7A6C5F]">
                S
              </span>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10.5px] font-mono font-bold text-[#7A6C5F]">
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

            {/* Concentric Range Rings */}
            <div className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-dashed border-[#D4AF37]/40" />
            <div className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-[#D4AF37]/30" />
            <div className="absolute w-14 h-14 rounded-full border-2 border-[#176B5B]/30 bg-[#176B5B]/10" />

            {/* Radar Sweeper Animation */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none opacity-40">
              <div
                className="w-1/2 h-1/2 origin-bottom-right animate-spin"
                style={{
                  background: "linear-gradient(45deg, rgba(82,255,0,0.4) 0%, transparent 70%)",
                  animationDuration: "4s",
                }}
              />
            </div>

            {/* Target Bay Point Beacon in Forest Green with Gold Trim */}
            <div
              className={`absolute top-8 right-12 flex flex-col items-center z-20 transition-all duration-500 ${
                beaconActive ? "scale-125" : ""
              }`}
            >
              <div className="relative">
                <span className={`absolute -inset-1.5 rounded-full bg-[#52FF00] ${beaconActive ? "animate-ping opacity-90" : "animate-pulse opacity-40"}`} />
                <div className="relative w-8 h-8 rounded-full bg-[#176B5B] text-[#D4AF37] font-mono font-black text-xs flex items-center justify-center border-2 border-[#D4AF37] shadow-lg">
                  P
                </div>
              </div>
              <span className="text-[10px] font-mono font-black text-[#176B5B] bg-white px-2 py-0.5 rounded-md border border-[#D4AF37]/60 mt-1 shadow-xs whitespace-nowrap">
                BAY {slot.slotNumber || "A-01"}
              </span>
            </div>

            {/* Center Dynamic Compass Pointer (Directly points at bike!) */}
            <div
              className="relative w-20 h-20 flex items-center justify-center transition-transform duration-500 ease-out z-10"
              style={{ transform: `rotate(${needleAngle}deg)` }}
            >
              <svg
                className="w-14 h-14 text-[#176B5B] drop-shadow-[0_4px_10px_rgba(23,107,91,0.4)]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L19 21L12 17L5 21L12 2Z" />
              </svg>
            </div>
          </div>

          {/* Compass Telemetry Readout in Soft White & Gold */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono mt-2 z-10 w-full max-w-lg">
            <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E2D9CC] shadow-xs">
              <span className="text-[#7A6C5F] block text-[9px] font-bold">BEARING</span>
              <span className="font-black text-[#176B5B]">
                {String(targetBearing).padStart(3, "0")}° {targetBearing < 90 ? "NE" : targetBearing < 180 ? "SE" : targetBearing < 270 ? "SW" : "NW"}
              </span>
            </div>
            
            <div className="px-4 py-1.5 rounded-xl bg-white border-2 border-[#52FF00]/50 shadow-xs">
              <span className="text-[#7A6C5F] block text-[9px] font-bold">LIVE DISTANCE</span>
              <span className="font-black text-[#1C1815] text-sm">
                {hasArrived ? "0 METERS" : `~${distanceMeters} METERS`}
              </span>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E2D9CC] shadow-xs">
              <span className="text-[#7A6C5F] block text-[9px] font-bold">WALK TIME</span>
              <span className="font-black text-[#B08528]">
                {hasArrived ? "ARRIVED" : `~${Math.max(1, Math.ceil(distanceMeters / 1.2))} SEC`}
              </span>
            </div>
          </div>

          {/* Device tracking status & Demo Walk Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-3.5 z-10">
            <button
              type="button"
              onClick={startLiveGps}
              className={`px-3 py-1 rounded-lg text-[10.5px] font-mono font-bold border transition-all cursor-pointer ${
                isLiveGpsActive
                  ? "bg-[#176B5B] text-white border-[#176B5B]"
                  : "bg-white text-[#176B5B] border-[#176B5B]/40 hover:bg-[#FAF7F2]"
              }`}
            >
              {isLiveGpsActive ? "● GPS Connected" : "Connect Device GPS"}
            </button>

            <button
              type="button"
              onClick={toggleSimulateWalk}
              className={`px-3 py-1 rounded-lg text-[10.5px] font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                isSimulatingWalk
                  ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                  : "bg-white text-[#7A6C5F] border-[#E2D9CC] hover:text-[#1C1815]"
              }`}
            >
              <Footprints className="w-3.5 h-3.5 text-[#176B5B]" />
              <span>{isSimulatingWalk ? "Pause Walk Simulation" : "Test Walking Approach (Demo)"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Satellite / Ground Map View with Live Walking Route */
        <div className="p-4 sm:p-5 bg-white border-b border-[#EBE3D7] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1C1815] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#176B5B]" />
              <span>Campus Walking Map &amp; Direct Route</span>
            </span>
            <span className="font-mono text-[10.5px] text-[#7A6C5F] font-bold">
              {bikeLat?.toFixed(4)}° N, {bikeLng?.toFixed(4)}° E
            </span>
          </div>

          {/* Active Navigation Route Banner */}
          <div className="p-3 bg-[#F0F8F5] border border-[#A3D9C9] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#176B5B] text-white flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#176B5B] font-black block">
                  Active Walking Polyline &bull; Bay {slot.slotNumber || "A-01"}
                </span>
                <span className="text-xs font-black text-[#1C1815]">
                  {distanceMeters} meters along campus walkways &bull; ~{Math.max(1, Math.ceil(distanceMeters / 60))} min walk
                </span>
              </div>
            </div>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#176B5B] hover:bg-[#125448] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
            >
              <span>Open Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="rounded-xl overflow-hidden border border-[#E2D9CC] shadow-xs">
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
          3. TURN-BY-TURN STEP GUIDANCE & TELEMETRY
      ═════════════════════════════════════════════════════════ */}
      <div className="p-5 sm:p-6 bg-white space-y-4">
        
        {/* Proximity / Landmark Match Banner when within 15 meters */}
        {distanceMeters <= 15 && (session?.landmarkPhotoUrl || session?.landmarkNote) && (
          <div className="p-3.5 bg-[#FAF3E8] border-2 border-[#D4AF37] rounded-xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#12382F] flex items-center justify-center shrink-0 font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#916E28] font-black block">
                  PROXIMITY ALERT &bull; WITHIN {distanceMeters}M
                </span>
                <span className="text-xs font-bold text-[#1C1815]">
                  Look for your saved landmark: &ldquo;{session.landmarkNote || "Saved visual landmark"}&rdquo;
                </span>
              </div>
            </div>
            {session.landmarkPhotoUrl && (
              <button
                type="button"
                onClick={() => setIsEnlargedPhotoOpen(true)}
                className="px-2.5 py-1 bg-white hover:bg-[#FAF7F2] text-[#176B5B] border border-[#D4AF37] text-[11px] font-bold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>View Photo</span>
              </button>
            )}
          </div>
        )}

        {/* Visual Landmark & Note Anchor Card */}
        <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E2D9CC] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#176B5B]" />
              <span className="text-xs font-black text-[#1C1815] tracking-tight">
                Parking Landmark &amp; Visual Anchor
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLandmarkModalOpen(true)}
              className="text-[11px] font-bold text-[#176B5B] hover:text-[#125448] flex items-center gap-1 cursor-pointer"
            >
              <span>{session?.landmarkPhotoUrl || session?.landmarkNote ? "Edit Landmark" : "+ Add Photo / Note"}</span>
            </button>
          </div>

          {session?.landmarkPhotoUrl || session?.landmarkNote ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-3 rounded-lg border border-[#EBE3D7]">
              {session.landmarkPhotoUrl && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsEnlargedPhotoOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsEnlargedPhotoOpen(true);
                    }
                  }}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 border border-[#E2D9CC] cursor-pointer group shadow-xs"
                  title="Click to view full photo"
                >
                  <img
                    src={session.landmarkPhotoUrl}
                    alt="Parked vehicle landmark"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              )}

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#176B5B] bg-[#EAF5F2] px-2 py-0.5 rounded font-bold">
                    SAVED LANDMARK CUE
                  </span>
                </div>
                <p className="text-xs font-bold text-[#1C1815] leading-relaxed">
                  {session.landmarkNote ? `"${session.landmarkNote}"` : "Visual landmark photo attached."}
                </p>
                <p className="text-[11px] text-[#7A6C5F]">
                  Use this visual reference to identify your two-wheeler amongst other vehicles.
                </p>
              </div>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsLandmarkModalOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsLandmarkModalOpen(true);
                }
              }}
              className="p-3 bg-white rounded-lg border border-dashed border-[#D4AF37]/70 hover:border-[#176B5B] transition-colors cursor-pointer flex items-center justify-between gap-3 text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FAF6EE] border border-[#DFD1BD] flex items-center justify-center text-[#176B5B] group-hover:scale-105 transition-transform shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#1C1815] block group-hover:text-[#176B5B] transition-colors">
                    Add a quick landmark note or photo
                  </span>
                  <span className="text-[11px] text-[#7A6C5F] block">
                    e.g. &ldquo;Pillar 4 ke paas, tree ke neeche&rdquo; to easily spot your bike.
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#176B5B] shrink-0 bg-[#EAF5F2] px-2.5 py-1 rounded-lg border border-[#176B5B]/20">
                + Add
              </span>
            </div>
          )}
        </div>

        {/* Step-by-Step Walking Guidance Card */}
        <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E2D9CC] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#176B5B] flex items-center gap-1.5">
              <Navigation className="w-3 h-3 text-[#176B5B]" />
              <span>Turn-by-Turn Walking Directions</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-[#7A6C5F]">
              Step 1 of 3
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#176B5B] text-white text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <span className="font-semibold text-[#1C1815]">
                Walk towards <strong>Academic Zone Radial Gate 4</strong> ({lot.name || "Campus Facility"})
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#E2D9CC] text-[#1C1815] text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <span className="font-medium text-[#706254]">
                Enter Zone {slot.zone || "A"}&mdash;reference anchor: <strong>{session?.landmarkNote ? `"${session.landmarkNote}"` : "Pillar P-04"}</strong>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#E2D9CC] text-[#1C1815] text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <span className="font-medium text-[#706254]">
                Vehicle {vehicle.registrationNumber || "PB08AB1234"} is parked at <strong>Bay {slot.slotNumber || "A-01"}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Anchor & Pillar Telemetry Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E2D9CC]">
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

          <div className="p-2.5 bg-[#FAF3E8] border border-[#D4AF37]/50 rounded-xl shadow-xs">
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

          <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E2D9CC]">
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

          <div className="p-2.5 bg-[#F0F8F5] border border-[#A3D9C9] rounded-xl shadow-xs">
            <span className="text-[10px] font-mono uppercase text-[#176B5B] font-black block mb-0.5">
              TARGET BAY
            </span>
            <span className="font-mono font-black text-2xl text-[#176B5B] block">
              {slot.slotNumber || "A-01"}
            </span>
            <span className="text-[10px] font-medium text-[#176B5B] block mt-0.5">
              1.2m &times; 2.2m Demarcated
            </span>
          </div>
        </div>

        {/* Action Controls: Smart Beacon Chirp & Google Maps Direction */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Smart Bay Beacon Trigger with Audio Beep */}
          <button
            type="button"
            onClick={handleTriggerBeacon}
            disabled={beaconActive}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer shadow-sm ${
              beaconActive
                ? "bg-[#52FF00] text-[#0A2603] border-[#52FF00] animate-pulse"
                : "bg-[#FAF7F2] hover:bg-[#EFE7D8] text-[#1C1815] border-[#E2D9CC] hover:border-[#B5A89A]"
            }`}
          >
            <Volume2 className={`w-4 h-4 ${beaconActive ? "animate-bounce text-[#0A2603]" : "text-[#176B5B]"}`} />
            <span>{beaconActive ? "BEACON CHIRPING..." : "CHIRP HORN & FLASH LIGHTS"}</span>
          </button>

          {/* Direct Walking Directions Link */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-4 rounded-xl bg-[#176B5B] hover:bg-[#125448] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>OPEN WALKING ROUTE (GOOGLE MAPS)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Modal: Landmark Photo & Note Editor */}
      <LandmarkPhotoModal
        isOpen={isLandmarkModalOpen}
        onClose={() => setIsLandmarkModalOpen(false)}
        session={session}
        onUpdated={(updatedSession) => {
          if (onSessionUpdated) onSessionUpdated(updatedSession);
        }}
      />

      {/* Lightbox: Full Resolution Landmark Photo Preview */}
      {isEnlargedPhotoOpen && session?.landmarkPhotoUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setIsEnlargedPhotoOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-[#121212] rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 bg-black/50 text-white border-b border-white/10">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-bold">
                  {session.landmarkNote ? `Landmark: ${session.landmarkNote}` : "Parked Vehicle Photo"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEnlargedPhotoOpen(false)}
                className="px-2.5 py-1 text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black">
              <img
                src={session.landmarkPhotoUrl}
                alt="Enlarged landmark photo"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
            {session.landmarkNote && (
              <div className="p-3 bg-black/70 text-white text-xs border-t border-white/10 text-center font-medium">
                &ldquo;{session.landmarkNote}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
