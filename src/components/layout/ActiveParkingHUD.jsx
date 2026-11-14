"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bike,
  Clock,
  ArrowRight,
  Navigation,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShieldCheck,
  QrCode,
  X,
} from "lucide-react";

export default function ActiveParkingHUD() {
  const pathname = usePathname();
  const [activeSession, setActiveSession] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Don't display HUD on login, register, admin, attendant, my-parking, or find-parking pages
  const isExcludedRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/attendant") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/dashboard/my-parking" ||
    pathname === "/dashboard/find-parking" ||
    pathname === "/parking";

  // Fetch active session from session endpoint
  const checkActiveSession = () => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.activeSession) {
          setActiveSession(data.activeSession);
        } else {
          setActiveSession(null);
        }
      })
      .catch((err) => {
        console.error("ActiveParkingHUD session check failed:", err);
      });
  };

  useEffect(() => {
    checkActiveSession();
    // Re-check periodically every 60 seconds
    const interval = setInterval(checkActiveSession, 60000);
    return () => clearInterval(interval);
  }, [pathname]);

  // Live seconds timer
  useEffect(() => {
    if (!activeSession?.entryTime) return;

    const updateTimer = () => {
      const start = new Date(activeSession.entryTime).getTime();
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - start) / 1000));
      setElapsedSeconds(diffSec);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

  if (isExcludedRoute || !activeSession || dismissed) {
    return null;
  }

  const lot = activeSession.parkingLotId || {};
  const slot = activeSession.parkingSlotId || {};
  const vehicle = activeSession.vehicleId || {};

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const billedHours = Math.max(1, Math.ceil(elapsedSeconds / 3600));
  const hourlyRate = lot.hourlyRate || 20;
  const currentAccruedFee = hourlyRate * billedHours;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lot.coordinates?.latitude || 28.6315},${lot.coordinates?.longitude || 77.2167}`;

  return (
    <aside
      aria-label="Active Parking Floating HUD"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl transition-all duration-300 ease-out select-none"
    >
      {/* ═════════════════════════════════════════════════════════
          STATE A: COMPACT MINIMIZED DOCK
      ═════════════════════════════════════════════════════════ */}
      {minimized ? (
        <div className="bg-[#1D0C1B]/95 backdrop-blur-md text-white px-4 py-2.5 rounded-xl border border-white/15 shadow-[0_12px_36px_rgba(29,12,27,0.45)] flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5EE819] animate-pulse" />
            <span className="font-mono text-xs font-black text-[#5EE819]">
              {slot.slotNumber || "BAY"}
            </span>
            <span className="text-white/40 font-mono text-xs">•</span>
            <span className="font-mono text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
              {vehicle.registrationNumber || "PARKED"}
            </span>
            <span className="text-white/40 font-mono text-xs hidden sm:inline">•</span>
            <span className="font-mono text-xs text-[#CCD5DC] hidden sm:inline">
              {String(hours).padStart(2, "0")}h:{String(minutes).padStart(2, "0")}m
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/my-parking"
              className="text-[11px] font-bold text-[#5EE819] hover:text-[#49DE0B] flex items-center gap-1 transition-colors"
            >
              <span>View Pass</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => setMinimized(false)}
              className="p-1 text-white/60 hover:text-white transition-colors cursor-pointer"
              title="Expand HUD"
              aria-label="Expand HUD"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ═════════════════════════════════════════════════════════
            STATE B: FULL ARCHITECTURAL TELEMETRY HUD
        ═════════════════════════════════════════════════════════ */
        <div className="bg-[#1D0C1B]/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl border border-white/20 shadow-[0_16px_48px_rgba(29,12,27,0.55)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Subtle neon accent glow bar at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#5EE819] to-transparent" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            
            {/* Left: Bay & Vehicle Identification */}
            <div className="flex items-center gap-3">
              {/* Bay Number Callout */}
              <div className="relative w-12 h-12 rounded-xl bg-white/[0.08] border border-white/15 flex flex-col items-center justify-center shrink-0">
                <span className="text-[8px] font-mono tracking-widest uppercase text-[#5EE819] font-bold">
                  BAY
                </span>
                <span className="font-mono text-base font-black text-white leading-none">
                  {slot.slotNumber || "A-01"}
                </span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#5EE819] border-2 border-[#1D0C1B] animate-pulse" />
              </div>

              {/* Facility & Reg */}
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#5EE819] font-extrabold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>PARKED // {slot.zone || "ZONE A"}</span>
                  </span>
                </div>
                <h4 className="text-sm font-black text-white tracking-tight truncate max-w-[200px] sm:max-w-[240px]">
                  {lot.name || "Connaught Place Two-Wheeler Bay"}
                </h4>
                <p className="font-mono text-xs text-[#CCD5DC]/70 truncate">
                  {vehicle.registrationNumber || "DL01AB1234"} • {vehicle.make || "Bike"} {vehicle.model || ""}
                </p>
              </div>
            </div>

            {/* Center: Live Timer & Tariff Telemetry */}
            <div className="flex items-center justify-between sm:justify-center gap-4 py-2 sm:py-0 border-y sm:border-y-0 border-white/10 sm:border-l sm:border-r sm:px-4">
              {/* Elapsed timer */}
              <div>
                <span className="text-[9px] font-mono tracking-wider uppercase text-[#CCD5DC]/60 block">
                  ACTIVE TIME
                </span>
                <div className="font-mono text-sm sm:text-base font-black text-white tracking-wider flex items-center gap-0.5">
                  <span>{String(hours).padStart(2, "0")}h</span>
                  <span className="text-[#5EE819] animate-pulse">:</span>
                  <span>{String(minutes).padStart(2, "0")}m</span>
                  <span className="text-[#5EE819] animate-pulse">:</span>
                  <span className="text-[#5EE819]">{String(seconds).padStart(2, "0")}s</span>
                </div>
              </div>

              {/* Accrued tariff */}
              <div className="text-right sm:text-left">
                <span className="text-[9px] font-mono tracking-wider uppercase text-[#CCD5DC]/60 block">
                  ACCRUED
                </span>
                <div className="font-mono text-sm sm:text-base font-black text-[#5EE819]">
                  ₹{currentAccruedFee}.00
                </div>
              </div>
            </div>

            {/* Right: Actions & Controls */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              {/* Navigate Directions link */}
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Walking Directions to Lot"
                aria-label="Walking Directions to Lot"
              >
                <Navigation className="w-4 h-4 text-[#CCD5DC]" />
              </a>

              {/* Primary View Ticket CTA */}
              <Link
                href="/dashboard/my-parking"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5EE819] hover:bg-[#49DE0B] text-[#111111] font-extrabold text-xs tracking-wider uppercase transition-all shadow-[0_2px_12px_rgba(94,232,25,0.4)] cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Ticket Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Minimize to dock */}
              <button
                onClick={() => setMinimized(true)}
                className="p-1.5 text-white/50 hover:text-white transition-colors cursor-pointer"
                title="Minimize HUD"
                aria-label="Minimize HUD"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

