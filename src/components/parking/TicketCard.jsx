"use client";

import { useState, useEffect } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { QRCodeSVG } from "qrcode.react";
import {
  MapPin,
  Clock,
  Bike,
  ShieldCheck,
  Copy,
  Check,
  Printer,
  Compass,
  ArrowRight,
  ExternalLink,
  Navigation,
} from "lucide-react";
import toast from "react-hot-toast";

export default function TicketCard({ session, onOpenMap }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session?.entryTime) return;

    const calculateElapsed = () => {
      const start = new Date(session.entryTime).getTime();
      const end = session.exitTime ? new Date(session.exitTime).getTime() : Date.now();
      const diffSec = Math.max(0, Math.floor((end - start) / 1000));
      setElapsedSeconds(diffSec);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) return null;

  const lot = session.parkingLotId || {};
  const slot = session.parkingSlotId || {};
  const vehicle = session.vehicleId || {};

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const billedHours = Math.max(1, Math.ceil(elapsedSeconds / 3600));
  const hourlyRate = lot.hourlyRate || 20;
  const accruedFee = session.status === "completed" ? (session.fee || hourlyRate) : hourlyRate * billedHours;

  const ticketId = session.ticketId || "WDIP-PENDING";

  const qrPayload = JSON.stringify({
    ticketId,
    lot: lot.name,
    zone: slot.zone || "Zone A",
    slot: slot.slotNumber || "Slot #",
    reg: vehicle.registrationNumber || "N/A",
    entry: session.entryTime,
    auth: "VERIFIED",
  });

  const handleCopyTicket = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ticketId);
      setCopied(true);
      toast.success("Ticket ID copied to clipboard");
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Pseudo-hash for boarding pass security strip
  const hashStub = ticketId.replace(/[^A-Za-z0-9]/g, "").slice(-8).toUpperCase() || "7F4B9E12";

  return (
    <div className="relative max-w-md mx-auto select-none print:shadow-none print:border-none print:m-0 font-sans">
      {/* Outer Shell: Soft Luxury Boarding Pass Architecture */}
      <div className="bg-[#FFFFFF] rounded-2xl border-2 border-[#E2D9CC] shadow-[0_12px_36px_rgba(60,45,30,0.08)] overflow-hidden transition-all duration-200">
        
        {/* ═════════════════════════════════════════════════════════
            1. TOP FLIGHT-STYLE HEADER (Deep Luxury Forest Green)
        ═════════════════════════════════════════════════════════ */}
        <div className="bg-[#12382F] text-white p-5 sm:p-6 relative overflow-hidden border-b border-[#1A4F42]">
          {/* Subtle geometric hairline watermark */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute right-10 -bottom-10 w-44 h-44 rounded-full border border-white/[0.03] pointer-events-none" />

          {/* Top Bar: Wordmark & Live Telemetry Badge */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <LogoMark size={24} />
              <div className="flex items-baseline leading-none">
                <span className="font-extrabold text-[11px] tracking-[0.14em] text-[#E8DCCB] uppercase">
                  Where Did I
                </span>
                <span className="font-extrabold text-[11px] tracking-[0.14em] text-[#D4AF37] uppercase ml-1">
                  Park?
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18493D] border border-[#D4AF37]/35 text-[10px] font-mono tracking-wider text-[#F3E5AB]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span>{session.status === "completed" ? "CHECKED OUT" : "ACTIVE SESSION"}</span>
            </div>
          </div>

          {/* Facility Name & City */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#D4AF37] font-bold block">
              Designated Two-Wheeler Bay
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
              {lot.name || "Main gate parking"}
            </h2>
            <p className="text-xs text-[#E8DCCB]/90 flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="truncate">{lot.address || "LPU Campus"}, {lot.city || "Phagwara"}</span>
            </p>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════
            2. PERFORATED CUTOUT TEAR-STRIP (Boarding Pass Notch)
        ═════════════════════════════════════════════════════════ */}
        <div className="relative h-6 bg-[#12382F] flex items-center justify-between">
          {/* Left Notch */}
          <div className="w-5 h-5 -ml-2.5 rounded-full bg-[#F7F8FA] border-r-2 border-[#E2D9CC] shadow-inner" />
          
          {/* Perforated Dashed Line in Champagne Gold */}
          <div className="flex-1 mx-2 border-b-2 border-dashed border-[#D4AF37]/30" />
          
          {/* Right Notch */}
          <div className="w-5 h-5 -mr-2.5 rounded-full bg-[#F7F8FA] border-l-2 border-[#E2D9CC] shadow-inner" />
        </div>

        {/* ═════════════════════════════════════════════════════════
            3. BOARDING TELEMETRY STUB (Clickable Zone & Bay Demarcation)
        ═════════════════════════════════════════════════════════ */}
        <div className="bg-[#12382F] px-5 sm:px-6 pb-6 text-white border-b-2 border-[#1A4F42]">
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              if (onOpenMap) onOpenMap();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (onOpenMap) onOpenMap();
              }
            }}
            className="bg-[#0C2720] hover:bg-[#10332A] rounded-xl p-4 border-2 border-[#D4AF37]/35 hover:border-[#D4AF37] grid grid-cols-12 gap-3 items-center shadow-xs cursor-pointer group transition-all select-none"
            title="Click on the bay arrow to open campus satellite map and live route"
          >
            {/* Zone */}
            <div className="col-span-5 text-left">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#E8DCCB]/70 block font-semibold">
                ZONE
              </span>
              <span className="text-base sm:text-lg font-black text-white tracking-wide">
                {slot.zone || "Zone A"}
              </span>
            </div>

            {/* Direction Arrow Button (Animated on hover) */}
            <div className="col-span-2 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#176B5B] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#12382F] group-hover:scale-115 shadow-sm transition-all">
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </div>
            </div>

            {/* Slot Callout in Champagne Gold */}
            <div className="col-span-5 text-right">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#D4AF37] block font-bold">
                BAY ALLOCATED
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono group-hover:text-[#F3E5AB] transition-colors">
                {slot.slotNumber || "A-01"}
              </span>
            </div>
          </div>

          {/* Interactive Hint */}
          <div
            onClick={() => onOpenMap && onOpenMap()}
            className="flex items-center justify-center gap-1.5 mt-2.5 text-[10px] font-bold text-[#E8DCCB]/80 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
          >
            <Navigation className="w-3 h-3 text-[#D4AF37]" />
            <span>Click arrow to view live route on map</span>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════
            4. TICKET DATA MATRIX (Vehicle, Real-time Clock, Tariff)
        ═════════════════════════════════════════════════════════ */}
        <div className="p-5 sm:p-6 space-y-5 bg-white">
          {/* Ticket Identifier Row */}
          <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#EFE9DF]">
            <div>
              <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-[#7A6C5F] block font-bold">
                Boarding Ticket Pass ID
              </span>
              <span className="font-mono text-sm sm:text-base font-black text-[#1C1815] tracking-wide">
                {ticketId}
              </span>
            </div>

            <button
              onClick={handleCopyTicket}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF6EE] hover:bg-[#EFE7D8] border border-[#DFD1BD] text-[#1C1815] text-xs font-bold transition-colors cursor-pointer"
              title="Copy Ticket ID"
              aria-label="Copy Ticket ID"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#176B5B] stroke-[2.5]" />
                  <span className="text-[#176B5B] font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#7A6C5F]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Telemetry Grid in Soft Ivory */}
          <div className="grid grid-cols-2 gap-3.5 text-xs">
            {/* Vehicle Details */}
            <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#E5DACB]">
              <div className="flex items-center gap-1.5 text-[#7A6C5F] mb-1 font-semibold">
                <Bike className="w-3.5 h-3.5 text-[#176B5B]" />
                <span className="text-[10px] font-mono uppercase tracking-wider">Registered Vehicle</span>
              </div>
              <span className="font-black text-[#1C1815] text-sm block font-mono">
                {vehicle.registrationNumber || "PB08AB1234"}
              </span>
              <span className="text-[11px] font-medium text-[#706254] truncate block mt-0.5">
                {vehicle.make || "Two-Wheeler"} {vehicle.model || ""}
              </span>
            </div>

            {/* Entry Timestamp */}
            <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#E5DACB]">
              <div className="flex items-center gap-1.5 text-[#7A6C5F] mb-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#176B5B]" />
                <span className="text-[10px] font-mono uppercase tracking-wider">Entry Timestamp</span>
              </div>
              <span className="font-black text-[#1C1815] text-xs block">
                {session.entryTime
                  ? new Date(session.entryTime).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "Live"}
              </span>
              <span className="text-[11px] font-medium text-[#706254] block mt-0.5">
                {session.entryTime
                  ? new Date(session.entryTime).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Today"}
              </span>
            </div>
          </div>

          {/* Soft Sage & Gold Live Duration & Accrued Tariff Card */}
          <div className="p-4 rounded-xl bg-[#F0F7F4] border-2 border-[#A7D7C7] text-[#1C1815] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-[#176B5B] block font-black">
                Elapsed Duration (Live)
              </span>
              <div className="font-mono text-lg sm:text-xl font-black text-[#12382F] tracking-wider flex items-center gap-1 mt-0.5">
                <span>{String(hours).padStart(2, "0")}h</span>
                <span className="text-[#176B5B] animate-pulse">:</span>
                <span>{String(minutes).padStart(2, "0")}m</span>
                <span className="text-[#176B5B] animate-pulse">:</span>
                <span className="text-[#176B5B]">{String(seconds).padStart(2, "0")}s</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-[#7A6C5F] block font-bold">
                Accrued Tariff
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#B08528] font-mono mt-0.5">
                ₹{accruedFee}
              </div>
              <span className="text-[10px] text-[#706254] block font-semibold">
                ₹{hourlyRate}/hr billing rate
              </span>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════
              5. AUTHENTICATION QR & BARCODE STUB (Soft Ivory & Gold)
          ═════════════════════════════════════════════════════════ */}
          <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E2D9CC] flex flex-col items-center justify-center space-y-3">
            {/* High-Contrast QR Code with Gold Corner Brackets */}
            <div className="relative p-3 bg-white rounded-xl border border-[#DFD1BD] shadow-xs">
              {/* Corner focus brackets in Champagne Gold */}
              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#D4AF37]" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#D4AF37]" />
              <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#D4AF37]" />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#D4AF37]" />

              <QRCodeSVG
                value={qrPayload}
                size={144}
                level="H"
                includeMargin={false}
                bgColor="#FFFFFF"
                fgColor="#12382F"
              />
            </div>

            {/* Vector Barcode Strip */}
            <div className="w-full max-w-[240px] flex flex-col items-center">
              <svg
                className="w-full h-8 opacity-80"
                viewBox="0 0 240 32"
                fill="#1C1815"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Precision barcode pattern */}
                {[
                  2, 4, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 1, 3,
                  4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 3, 1, 2,
                  4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1,
                ].map((barWidth, idx) => {
                  let x = 0;
                  for (let i = 0; i < idx; i++) {
                    x += [
                      2, 4, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 1, 3,
                      4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 3, 1, 2,
                      4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1,
                    ][i] + 1.8;
                  }
                  return (
                    <rect
                      key={idx}
                      x={x}
                      y={0}
                      width={barWidth}
                      height={32}
                    />
                  );
                })}
              </svg>

              <span className="font-mono text-[10px] tracking-[0.25em] text-[#7A6C5F] mt-1 font-bold">
                *{ticketId}*
              </span>
            </div>

            {/* Verification Security Text */}
            <div className="flex items-center gap-1.5 text-[10px] text-[#7A6C5F] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#176B5B]" />
              <span>Campus Security Verified • Pass ID {hashStub}</span>
            </div>
          </div>

          {/* Action Strip: Print / Save Pass */}
          <div className="pt-2 flex items-center justify-between text-xs print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-[#1C1815] hover:text-[#176B5B] font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#7A6C5F]" />
              <span>Print / Save Pass</span>
            </button>

            <span className="text-[11px] font-medium text-[#706254]">
              Present pass at campus exit booth
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
