"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import TicketCard from "@/components/parking/TicketCard";
import ReturnCompassHUD from "@/components/parking/ReturnCompassHUD";
import Button from "@/components/ui/Button";
import {
  MapPin,
  Clock,
  Bike,
  Navigation,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Receipt,
  Compass,
  ShieldCheck,
  Radio,
} from "lucide-react";
import toast from "react-hot-toast";

export default function MyParkingPage() {
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutReceipt, setCheckoutReceipt] = useState(null);

  // Interactive HUD mode & navigation route state
  const [hudViewMode, setHudViewMode] = useState("radar"); // "radar" | "map"
  const [userLocation, setUserLocation] = useState({ lat: 31.2562, lng: 75.7032 }); // LPU Gate 1 default
  const [routeInfo, setRouteInfo] = useState(null);

  // Stable route calculated handler to avoid re-render loops
  const handleRouteCalculated = useCallback((info) => {
    setRouteInfo((prev) => {
      if (
        prev &&
        prev.distanceMeters === info.distanceMeters &&
        prev.durationSeconds === info.durationSeconds &&
        prev.destinationName === info.destinationName
      ) {
        return prev;
      }
      return info;
    });
  }, []);

  // Handler for clicking the bay arrow or Navigate button
  const handleOpenMapAndRoute = () => {
    setHudViewMode("map");

    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // LPU Gate 1 default fallback coordinates
          setUserLocation({ lat: 31.2562, lng: 75.7032 });
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }

    const hudEl = document.getElementById("vehicle-hud-container");
    if (hudEl) {
      hudEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    toast.success("Opened campus satellite map with live route to your bay!");
  };

  const fetchActive = () => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setActiveSession(data.activeSession);
        }
      })
      .catch((err) => console.error("Error fetching active session:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchActive();
  }, []);

  const handleCheckout = async () => {
    if (!activeSession) return;

    const confirmed = window.confirm(
      "Are you sure you want to check out of this parking slot? Your parking fee will be calculated and the slot will be marked available."
    );
    if (!confirmed) return;

    setCheckingOut(true);

    try {
      const res = await fetch(`/api/parking-sessions/${activeSession._id}/checkout`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to check out");

      toast.success("Checkout completed! Slot is now available.");
      setCheckoutReceipt(data);
      setActiveSession(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="h-8 w-64 bg-white rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-96 bg-white rounded-2xl border border-[#E4E7EC] animate-pulse" />
          <div className="lg:col-span-5 h-96 bg-white rounded-2xl border border-[#E4E7EC] animate-pulse" />
        </div>
      </div>
    );
  }

  // Completed checkout receipt view
  if (checkoutReceipt) {
    const summary = checkoutReceipt.summary;
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E4E7EC] shadow-[0_12px_36px_rgba(29,12,27,0.06)] space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block mb-2 font-bold">
              TRANSACTION VERIFIED
            </span>
            <h1 className="text-2xl font-black text-[#18212F] tracking-tight">
              Checkout Completed
            </h1>
            <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
              Your parking session has concluded. The slot occupancy counter has been updated in the database.
            </p>
          </div>

          <div className="p-5 bg-[#F7F8FA] rounded-xl text-left text-xs space-y-2.5 border border-[#E4E7EC]">
            <div className="flex justify-between items-center pb-2 border-b border-[#E4E7EC]">
              <span className="text-[11px] font-mono uppercase text-[#667085]">Receipt Identifier</span>
              <span className="font-mono font-bold text-[#18212F]">{summary.ticketId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Entry Timestamp:</span>
              <span className="font-medium text-[#18212F]">
                {new Date(summary.entryTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Exit Timestamp:</span>
              <span className="font-medium text-[#18212F]">
                {new Date(summary.exitTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Total Parking Duration:</span>
              <span className="font-medium text-[#18212F]">
                {summary.durationMinutes} minutes ({summary.billedHours} hr billed)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Base Tariff Rate:</span>
              <span className="font-medium text-[#18212F]">
                ₹{summary.hourlyRate} / hour
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#E4E7EC] text-base font-black text-[#18212F]">
              <span>Settled Parking Fee:</span>
              <span className="text-[#176B5B] font-mono text-lg">₹{summary.totalFee}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/dashboard/history" className="flex-1">
              <Button size="sm" variant="secondary" className="w-full text-xs">
                View Parking History
              </Button>
            </Link>
            <Link href="/dashboard/find-parking" className="flex-1">
              <Button size="sm" className="w-full text-xs bg-[#176B5B] hover:bg-[#125448]">
                Find Available Parking
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#18212F] tracking-tight">
              Active Parking Session
            </h1>
            <p className="text-xs text-[#667085] mt-1">
              Retrieve your parked two-wheeler, access your digital boarding pass, or complete checkout.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F8FA] border border-[#CCD5DC] text-[11px] font-mono text-[#667085]">
            <Radio className="w-3 h-3 text-[#98A2B3]" />
            <span>STANDBY // NO ACTIVE PASS</span>
          </div>
        </div>

        <div className="bg-white p-10 sm:p-14 rounded-2xl border border-[#E4E7EC] shadow-[0_4px_20px_rgba(29,12,27,0.03)] text-center space-y-5 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#F7F8FA] border border-[#E4E7EC] text-[#667085] flex items-center justify-center mx-auto shadow-inner">
            <Bike className="w-8 h-8 text-[#176B5B]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-[#18212F]">
              No active vehicle parked
            </h2>
            <p className="text-xs text-[#667085] leading-relaxed max-w-sm mx-auto">
              You do not currently have a two-wheeler occupying a bay. When you allocate a bay, your official digital boarding pass and real-time retrieval coordinates will be displayed here.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/dashboard/find-parking">
              <Button size="sm" className="bg-[#176B5B] hover:bg-[#125448] text-xs px-6">
                Find Available Parking
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const lot = activeSession.parkingLotId || {};
  const slot = activeSession.parkingSlotId || {};
  const vehicle = activeSession.vehicleId || {};
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lot.coordinates?.latitude},${lot.coordinates?.longitude}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Bar (Soft Luxury Finish) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#176B5B] animate-pulse" />
            <span className="text-[11px] font-mono tracking-[0.18em] uppercase text-[#176B5B] font-bold">
              ACTIVE OCCUPANCY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1815] tracking-tight mt-1">
            Your Active Parking Session
          </h1>
          <p className="text-xs font-medium text-[#706254] mt-0.5">
            Digital Boarding Pass, bay coordinates, and real-time vehicle location.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleOpenMapAndRoute}
            className="px-3.5 py-2 bg-[#FAF6EE] hover:bg-[#EFE7D8] text-[#176B5B] border border-[#D9C49D] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-[#176B5B]" />
            <span>Navigate to Bay</span>
          </button>

          <button
            type="button"
            disabled={checkingOut}
            onClick={handleCheckout}
            className="px-4 py-2 bg-[#BA2D2D] hover:bg-[#9E2424] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{checkingOut ? "Processing..." : "Complete Checkout"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Telemetry & Boarding Pass */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (7 Cols): The "Return to My Bike" Soft Orientation & Map */}
        <div id="vehicle-hud-container" className="lg:col-span-7 space-y-4">
          <ReturnCompassHUD
            lot={lot}
            slot={slot}
            vehicle={vehicle}
            viewMode={hudViewMode}
            onToggleView={(m) => setHudViewMode(m)}
            userLocation={userLocation}
            routeInfo={routeInfo}
            onRouteCalculated={handleRouteCalculated}
          />

          {/* Quick Security / Incident Link */}
          <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-[#E8E2D8] text-xs shadow-xs">
            <span className="text-[#66584B] flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#176B5B]" />
              <span>Two-Wheeler Security Monitored by Campus Attendant</span>
            </span>
            <Link
              href="/dashboard/incidents"
              className="font-bold text-[#8F5206] hover:text-[#704005] flex items-center gap-1.5 text-xs transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Report Incident</span>
            </Link>
          </div>
        </div>

        {/* Right Column (5 Cols): The Soft Luxury Digital Boarding Pass */}
        <div className="lg:col-span-5 sticky top-24">
          <TicketCard session={activeSession} onOpenMap={handleOpenMapAndRoute} />
        </div>
      </div>
    </div>
  );
}
