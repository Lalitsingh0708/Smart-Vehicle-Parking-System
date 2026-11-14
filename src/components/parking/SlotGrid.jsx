"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Lock,
  Ban,
  Clock,
  Bike,
  Check,
  Zap,
  Shield,
  Layers,
  LayoutGrid,
  MapPin,
  Compass,
} from "lucide-react";

export default function SlotGrid({
  zones = [],
  selectedSlotId = null,
  onSelectSlot,
  disabled = false,
}) {
  const [activeZoneFilter, setActiveZoneFilter] = useState("all");
  const [viewMode, setViewMode] = useState("architectural"); // "architectural" | "compact"
  const [hoveredSlot, setHoveredSlot] = useState(null);

  // Status configuration
  const statusConfig = {
    available: {
      label: "Available",
      sublabel: "Ready for Allocation",
      borderColor: "border-[#176B5B]",
      badgeBg: "bg-emerald-50 text-[#176B5B] border-emerald-200",
      beaconColor: "bg-[#176B5B]",
      icon: CheckCircle2,
    },
    occupied: {
      label: "Occupied",
      sublabel: "Vehicle Currently Parked",
      borderColor: "border-[#DC2626]",
      badgeBg: "bg-red-50 text-red-700 border-red-200",
      beaconColor: "bg-[#DC2626]",
      icon: Lock,
    },
    reserved: {
      label: "Reserved",
      sublabel: "Allocated Pass Holder",
      borderColor: "border-[#D4AF37]",
      badgeBg: "bg-[#FAF3E8] text-[#916E28] border-[#E0D0B5]",
      beaconColor: "bg-[#D4AF37]",
      icon: Clock,
    },
    blocked: {
      label: "Blocked",
      sublabel: "Bay Maintenance / Closed",
      borderColor: "border-[#6B7280]",
      badgeBg: "bg-gray-100 text-gray-700 border-gray-300",
      beaconColor: "bg-[#6B7280]",
      icon: Ban,
    },
  };

  // Filter zones if specific zone is chosen
  const filteredZones =
    activeZoneFilter === "all"
      ? zones
      : zones.filter((z) => z.name === activeZoneFilter);

  const totalSlotsCount = zones.reduce((acc, z) => acc + (z.totalCount || z.slots?.length || 0), 0);
  const totalAvailableCount = zones.reduce((acc, z) => acc + (z.availableCount || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* ═════════════════════════════════════════════════════════
          1. CONTROL STRIP: ZONE TABS & VIEW MODE TOGGLE
      ═════════════════════════════════════════════════════════ */}
      <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border-2 border-[#E2D9CC] shadow-[0_4px_20px_rgba(60,45,30,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#EFE9DF]">
          {/* Zone Selector Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveZoneFilter("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black font-mono tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeZoneFilter === "all"
                  ? "bg-[#176B5B] text-white shadow-xs border border-[#D4AF37]/50"
                  : "bg-[#FAF6EE] text-[#66584B] border border-[#E5DACB] hover:bg-[#EFE7D8] hover:text-[#1C1815]"
              }`}
            >
              ALL ZONES ({totalAvailableCount}/{totalSlotsCount})
            </button>
            {zones.map((zone) => (
              <button
                key={zone.name}
                type="button"
                onClick={() => setActiveZoneFilter(zone.name)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black font-mono tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeZoneFilter === zone.name
                    ? "bg-[#176B5B] text-white shadow-xs border border-[#D4AF37]/50"
                    : "bg-[#FAF6EE] text-[#66584B] border border-[#E5DACB] hover:bg-[#EFE7D8] hover:text-[#1C1815]"
                }`}
              >
                {zone.name.toUpperCase()} ({zone.availableCount}/{zone.totalCount})
              </button>
            ))}
          </div>

          {/* View Mode Toggle: 2D Floor Plan vs Compact Matrix */}
          <div className="flex items-center gap-1 bg-[#FAF6EE] p-1 rounded-xl border border-[#E5DACB] shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("architectural")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                viewMode === "architectural"
                  ? "bg-white text-[#176B5B] shadow-xs border border-[#D4AF37]/40"
                  : "text-[#66584B] hover:text-[#1C1815]"
              }`}
              title="2D Architectural Bay Layout"
            >
              <Compass className="w-3.5 h-3.5 text-[#176B5B]" />
              <span>2D Floor Plan</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("compact")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                viewMode === "compact"
                  ? "bg-white text-[#176B5B] shadow-xs border border-[#D4AF37]/40"
                  : "text-[#66584B] hover:text-[#1C1815]"
              }`}
              title="Compact Matrix View"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#176B5B]" />
              <span>Matrix View</span>
            </button>
          </div>
        </div>

        {/* Status Legend Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-[#667085]">
            <span className="text-[11px] font-mono tracking-wider uppercase font-bold text-[#18212F]">
              Bay Status:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
              <span className="text-[11px] font-medium text-[#18212F]">Available (Free)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
              <span className="text-[11px] font-medium text-[#18212F]">Occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
              <span className="text-[11px] font-medium text-[#18212F]">Reserved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B7280]" />
              <span className="text-[11px] font-medium text-[#18212F]">Maintenance</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#667085]">
            <span>SECTOR GROUND // COVERED CANOPY</span>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════
          2. BAY GRID CONTAINERS BY ZONE
      ═════════════════════════════════════════════════════════ */}
      {filteredZones.length === 0 ? (
        <div className="text-center py-12 text-sm text-[#667085] bg-white rounded-2xl border border-[#E4E7EC]">
          No parking zones or slots have been configured for this lot.
        </div>
      ) : (
        filteredZones.map((zone) => {
          const slots = zone.slots || [];
          // Split slots into Row A and Row B for realistic facing-bay 2D architecture
          const midpoint = Math.ceil(slots.length / 2);
          const topRow = slots.slice(0, midpoint);
          const bottomRow = slots.slice(midpoint);

          return (
            <div
              key={zone.name}
              className="bg-[#FFFFFF] rounded-2xl border-2 border-[#E2D9CC] shadow-[0_6px_24px_rgba(60,45,30,0.06)] overflow-hidden"
            >
              {/* Zone Header (Warm Beige & Forest Green) */}
              <div className="px-5 py-3.5 bg-[#FAF6EE] border-b-2 border-[#EFE9DF] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#176B5B] text-[#D4AF37] border border-[#D4AF37]/50 flex items-center justify-center font-mono font-black text-xs shadow-xs">
                    {zone.name.replace(/[^A-Za-z0-9]/g, "").slice(-1) || "A"}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1C1815] tracking-tight">
                      {zone.name} • Two-Wheeler Demarcated Bay
                    </h3>
                    <span className="text-[10px] font-mono font-bold uppercase text-[#7A6C5F] block">
                      Ground Level • Aisle 1 • CCTV Monitored
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#7A6C5F] block">
                      Occupancy
                    </span>
                    <span className="text-xs font-mono font-black text-[#176B5B]">
                      {zone.availableCount} of {zone.totalCount} Free
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-16 h-2 bg-[#E2D9CC] rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-[#176B5B] rounded-full transition-all"
                      style={{
                        width: `${(zone.availableCount / (zone.totalCount || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ═════════════════════════════════════════════════════
                  VIEW MODE A: 2D ARCHITECTURAL FLOOR PLAN
                  Deep Luxury Pine Forest Asphalt Canvas
              ═════════════════════════════════════════════════════ */}
              {viewMode === "architectural" ? (
                <div className="p-5 sm:p-6 bg-[#0B1E19] relative overflow-hidden border-t border-[#132C24]">
                  {/* Subtle ground asphalt texture */}
                  <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(#ffffff 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                    }}
                  />

                  {/* Top Row of Bays */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 relative z-10">
                    {topRow.map((slot) => (
                      <ArchitecturalBay
                        key={slot.id || slot._id}
                        slot={slot}
                        isSelected={selectedSlotId === (slot.id || slot._id)}
                        disabled={disabled}
                        onSelect={() => onSelectSlot && onSelectSlot(slot)}
                        onHover={() => setHoveredSlot(slot)}
                        onLeave={() => setHoveredSlot(null)}
                        orientation="down"
                      />
                    ))}
                  </div>

                  {/* Central Transit Driveway / Aisle in Champagne Gold */}
                  <div className="my-5 py-3 border-y-2 border-dashed border-[#D4AF37]/35 bg-[#D4AF37]/[0.05] flex items-center justify-between px-4 select-none relative z-10">
                    <div className="flex items-center gap-2 text-[#E8D6B5]/80 text-[10px] font-mono tracking-[0.25em] uppercase font-bold">
                      <span>◀ ◀ DRIVEWAY TRANSIT AISLE</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-[#D4AF37] font-black text-[10px] font-mono tracking-[0.2em] uppercase">
                      <span>SPEED LIMIT 10 KM/H • KEEP LEFT</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#E8D6B5]/80 text-[10px] font-mono tracking-[0.25em] uppercase font-bold">
                      <span>EXIT GATE ▶ ▶</span>
                    </div>
                  </div>

                  {/* Bottom Row of Bays */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 relative z-10">
                    {bottomRow.map((slot) => (
                      <ArchitecturalBay
                        key={slot.id || slot._id}
                        slot={slot}
                        isSelected={selectedSlotId === (slot.id || slot._id)}
                        disabled={disabled}
                        onSelect={() => onSelectSlot && onSelectSlot(slot)}
                        onHover={() => setHoveredSlot(slot)}
                        onLeave={() => setHoveredSlot(null)}
                        orientation="up"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* ═════════════════════════════════════════════════════
                    VIEW MODE B: COMPACT MATRIX VIEW
                ═════════════════════════════════════════════════════ */
                <div className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2.5">
                    {slots.map((slot) => {
                      const isSelected = selectedSlotId === (slot.id || slot._id);
                      const isAvailable = slot.status === "available";
                      const config = statusConfig[slot.status] || statusConfig.available;
                      const Icon = config.icon;

                      return (
                        <button
                          key={slot.id || slot._id}
                          type="button"
                          disabled={!isAvailable || disabled}
                          onClick={() => isAvailable && onSelectSlot && onSelectSlot(slot)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#176B5B] text-white border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37] ring-offset-2 scale-[1.03]"
                              : isAvailable
                              ? "bg-white hover:bg-[#FAF6EE] border-[#E2D9CC] text-[#176B5B] shadow-xs hover:border-[#176B5B]"
                              : slot.status === "occupied"
                              ? "bg-red-50/50 border-red-200 text-red-800 cursor-not-allowed opacity-75"
                              : slot.status === "reserved"
                              ? "bg-[#FAF3E8]/80 border-[#E0D0B5] text-[#916E28] cursor-not-allowed opacity-75"
                              : "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed opacity-65"
                          }`}
                        >
                          <Icon className="w-4 h-4 mb-1" />
                          <span className="text-xs font-mono font-black">{slot.slotNumber}</span>
                          <span className="text-[9px] mt-0.5 tracking-wider uppercase font-semibold">
                            {config.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ═════════════════════════════════════════════════════════
          3. REAL-TIME HOVER HUD / TELEMETRY DRAWER (Forest Green & Champagne Gold)
      ═════════════════════════════════════════════════════════ */}
      {hoveredSlot && (
        <div className="p-4 bg-[#0B1E19] text-[#FAF6EE] rounded-2xl border-2 border-[#D4AF37]/35 shadow-[0_12px_32px_rgba(11,30,25,0.45)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#176B5B] flex items-center justify-center font-mono font-black text-lg text-[#D4AF37] border-2 border-[#D4AF37]/50 shadow-xs">
              {hoveredSlot.slotNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  Bay {hoveredSlot.slotNumber} • {hoveredSlot.zone || "Zone A"}
                </span>
                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-black tracking-wider ${
                    hoveredSlot.status === "available"
                      ? "bg-[#176B5B]/60 text-[#D4AF37] border border-[#D4AF37]/50"
                      : "bg-red-950/60 text-red-300 border border-red-500/40"
                  }`}
                >
                  {statusConfig[hoveredSlot.status]?.label || "Available"}
                </span>
              </div>
              <span className="text-xs text-[#E5DACB]/80 block mt-0.5 font-medium">
                Standard Two-Wheeler Bay (Width 1.2m × Length 2.2m) • Covered Canopy
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-[#E5DACB]">
              <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="font-semibold">EV Ready Option</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#E5DACB]">
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="font-semibold">CCTV Sector 1</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 2D Architectural Parking Bay Subcomponent
 * High-end architectural pavement rendering with Forest Green, Warm Beige & Champagne Gold
 */
function ArchitecturalBay({
  slot,
  isSelected,
  disabled,
  onSelect,
  onHover,
  onLeave,
  orientation = "down",
}) {
  const isAvailable = slot.status === "available";

  // Base styling for parking bay pavement
  let bayBg = "bg-[#122720]";
  let borderStyle = "border-[#1D483C]";
  let textBadge = "text-[#E6DAC8]";

  if (isSelected) {
    bayBg = "bg-[#176B5B]/60 ring-2 ring-[#D4AF37] shadow-[0_0_24px_rgba(212,175,55,0.4)]";
    borderStyle = "border-[#D4AF37]";
    textBadge = "text-[#D4AF37]";
  } else if (isAvailable) {
    bayBg = "bg-[#122720] hover:bg-[#18362D] cursor-pointer group";
    borderStyle = "border-[#1D483C] hover:border-[#D4AF37]";
    textBadge = "text-[#E6DAC8] group-hover:text-[#D4AF37]";
  } else if (slot.status === "occupied") {
    bayBg = "bg-[#0A1612] cursor-not-allowed opacity-90";
    borderStyle = "border-white/10";
    textBadge = "text-red-400";
  } else if (slot.status === "reserved") {
    bayBg = "bg-[#1B160C] cursor-not-allowed opacity-85";
    borderStyle = "border-[#D4AF37]/35";
    textBadge = "text-[#D4AF37]";
  } else {
    // blocked
    bayBg = "bg-[#09110E] cursor-not-allowed opacity-50";
    borderStyle = "border-white/10";
    textBadge = "text-stone-500";
  }

  return (
    <div
      role="button"
      tabIndex={isAvailable && !disabled ? 0 : -1}
      onClick={() => isAvailable && !disabled && onSelect()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && isAvailable && !disabled) {
          e.preventDefault();
          onSelect();
        }
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`relative h-28 sm:h-32 rounded-lg p-2.5 flex flex-col justify-between transition-all duration-150 select-none ${bayBg} ${
        // Demarcated parking bay line markings: Gold/Stone architectural pavement lines
        orientation === "down"
          ? `border-t-2 border-l-2 border-r-2 ${borderStyle}`
          : `border-b-2 border-l-2 border-r-2 ${borderStyle}`
      }`}
    >
      {/* Top Bay Marker Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs sm:text-sm font-black tracking-tight text-[#FAF6EE]">
          {slot.slotNumber}
        </span>

        {/* Status Indicator Icon */}
        {isSelected ? (
          <span className="w-4 h-4 rounded-full bg-[#D4AF37] text-[#0B1E19] flex items-center justify-center shadow-xs">
            <Check className="w-3 h-3 stroke-[3]" />
          </span>
        ) : isAvailable ? (
          <span className="w-2.5 h-2.5 rounded-full bg-[#176B5B] border border-[#D4AF37]/60 shadow-[0_0_8px_#176B5B] animate-pulse" />
        ) : slot.status === "occupied" ? (
          <Lock className="w-3.5 h-3.5 text-red-400" />
        ) : slot.status === "reserved" ? (
          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
        ) : (
          <Ban className="w-3.5 h-3.5 text-stone-500" />
        )}
      </div>

      {/* Center of Bay: Visual Representation */}
      <div className="my-auto flex items-center justify-center">
        {slot.status === "occupied" ? (
          /* Realistic Parked Two-Wheeler Silhouette SVG */
          <div className="flex flex-col items-center">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 text-stone-400/80 drop-shadow-md"
              viewBox="0 0 48 48"
              fill="currentColor"
            >
              {/* Top-down motorcycle outline */}
              <rect x="22" y="4" width="4" height="10" rx="2" fill="#D5CBBF" />
              <rect x="14" y="10" width="20" height="2.5" rx="1" fill="#D5CBBF" />
              <ellipse cx="24" cy="20" rx="6" ry="8" fill="#3E4C46" />
              <ellipse cx="24" cy="28" rx="4" ry="7" fill="#24332D" />
              <rect x="22" y="34" width="4" height="10" rx="2" fill="#D5CBBF" />
            </svg>
            <span className="text-[9px] font-mono uppercase tracking-wider text-red-400 font-bold mt-0.5">
              OCCUPIED
            </span>
          </div>
        ) : isSelected ? (
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-[#D4AF37] text-[#0B1E19] flex items-center justify-center shadow-lg font-bold">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#D4AF37] font-black mt-1">
              CHOSEN
            </span>
          </div>
        ) : isAvailable ? (
          <div className="flex flex-col items-center text-center group-hover:scale-105 transition-transform">
            <div className="w-6 h-6 rounded-full border border-dashed border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#D4AF37] font-bold mt-1 group-hover:text-[#F3E5AB]">
              ALLOCATE
            </span>
          </div>
        ) : slot.status === "reserved" ? (
          <div className="flex flex-col items-center text-center">
            <div className="text-[9px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
              RESERVED
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="text-[9px] font-mono uppercase tracking-widest text-stone-500 font-bold">
              CLOSED
            </div>
          </div>
        )}
      </div>

      {/* Bottom Pavement Stencil */}
      <div className="flex items-center justify-between text-[9px] font-mono border-t border-white/10 pt-1">
        <span className="text-[#E6DAC8]/40">1.2 × 2.2M</span>
        <span className={textBadge}>
          {isSelected ? "ALLOCATED" : isAvailable ? "FREE" : slot.status.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
