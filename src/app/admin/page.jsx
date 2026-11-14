"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Layers,
  Grid,
  CheckCircle2,
  Lock,
  Ban,
  Clock,
  Users,
  AlertTriangle,
  ArrowRight,
  Bike,
  MapPin,
  ChevronDown,
  ChevronUp,
  Power,
  ShieldAlert,
  Plus,
  Search,
  Building,
  Check,
  Eye,
  Phone,
  Compass,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("facilities"); // "facilities" | "bikes"
  const [bikeSearchQuery, setBikeSearchQuery] = useState("");
  const [lotFilter, setLotFilter] = useState("all");
  const [expandedFacilityId, setExpandedFacilityId] = useState(null);
  const [expandAll, setExpandAll] = useState(false);
  const [togglingLotId, setTogglingLotId] = useState(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((res) => setData(res))
      .catch((err) => console.error("Error loading admin analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  const getElapsed = (entryTime) => {
    if (!entryTime) return "Active";
    const diffMs = Math.max(0, Date.now() - new Date(entryTime).getTime());
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${mins}m ago`;
    return `${hours}h ${mins}m ago`;
  };

  const handleToggleCheckIn = async (e, lotId, currentStatus) => {
    e.stopPropagation();
    setTogglingLotId(lotId);
    try {
      const nextStatus = !currentStatus;
      const res = await fetch(`/api/admin/parking-lots/${lotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowCheckIn: nextStatus }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update facility check-in status");

      toast.success(
        nextStatus
          ? "Facility check-in resumed. Riders can now allocate slots."
          : "Facility check-in paused for peak rush. Existing parked riders can still check out."
      );

      // Update local state
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          facilitiesBreakdown: prev.facilitiesBreakdown.map((f) =>
            f.id === lotId ? { ...f, allowCheckIn: nextStatus } : f
          ),
        };
      });
    } catch (err) {
      toast.error(err.message || "Action failed");
    } finally {
      setTogglingLotId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-white rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white rounded-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const overview = data?.overview || {};
  const charts = data?.charts || {};
  const facilities = data?.facilitiesBreakdown || [];
  const allParkedBikes = data?.allParkedBikes || [];

  const toggleExpand = (id) => {
    setExpandedFacilityId(expandedFacilityId === id ? null : id);
  };

  const filteredBikes = allParkedBikes.filter((b) => {
    if (lotFilter !== "all" && b.lotId !== lotFilter && b.lotName !== lotFilter) return false;
    if (bikeSearchQuery) {
      const q = bikeSearchQuery.toLowerCase().trim();
      const matchPlate = b.registrationNumber?.toLowerCase().includes(q);
      const matchRider = b.rider?.toLowerCase().includes(q);
      const matchModel = b.model?.toLowerCase().includes(q);
      const matchLot = b.lotName?.toLowerCase().includes(q);
      const matchSlot = b.slot?.toLowerCase().includes(q);
      return matchPlate || matchRider || matchModel || matchLot || matchSlot;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2D9CC]/60">
        <div>
          <h1 className="text-2xl font-black text-[#1C1815] tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs text-[#706254] mt-0.5">
            Real-time multi-location monitoring: live parked vehicles, empty lots, and occupancy audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/admin/lots/new">
            <button
              type="button"
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#176B5B] hover:bg-[#125448] border border-[#176B5B] rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Parking Lot</span>
            </button>
          </Link>

          <Link href="/attendant">
            <button
              type="button"
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#176B5B] hover:text-white bg-[#FAF7F2] hover:bg-[#176B5B] border border-[#B08528] rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
            >
              <Bike className="w-4 h-4" />
              <span>Attendant Booth View</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Pending Attendant Verification Alert Banner */}
      {overview.pendingAttendants > 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 shrink-0">
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-950">
                {overview.pendingAttendants} Booth Attendant{overview.pendingAttendants > 1 ? "s" : ""} Awaiting Verification
              </h4>
              <p className="text-xs font-semibold text-amber-800">
                Staff accounts require administrator review and facility assignment before booth onboarding.
              </p>
            </div>
          </div>
          <Link href="/admin/users">
            <button
              type="button"
              className="py-2 px-4 bg-[#176B5B] hover:bg-[#125448] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
            >
              Review &amp; Onboard Staff &rarr;
            </button>
          </Link>
        </div>
      )}

      {/* 8 Core Database Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2D9CC] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#706254] uppercase tracking-wider">Total Lots</span>
            <Layers className="w-4 h-4 text-[#176B5B]" />
          </div>
          <span className="text-2xl font-black text-[#1C1815] block mt-2">
            {overview.totalLots || 0}
          </span>
          <div className="flex items-center space-x-2 mt-1">
            <Link
              href="/admin/lots"
              className="text-[11px] text-[#176B5B] hover:text-[#125448] font-bold"
            >
              Manage facilities &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2D9CC] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#706254] uppercase tracking-wider">Total Slots</span>
            <Grid className="w-4 h-4 text-[#176B5B]" />
          </div>
          <span className="text-2xl font-black text-[#1C1815] block mt-2">
            {overview.totalSlots || 0}
          </span>
          <Link
            href="/admin/slots"
            className="text-[11px] text-[#176B5B] hover:text-[#125448] font-bold inline-block mt-1"
          >
            Manage slots &rarr;
          </Link>
        </div>

        <div className="bg-[#F0F8F5] p-4 rounded-2xl border border-[#C5DDD2] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#176B5B] font-bold uppercase tracking-wider">Vacant Slots</span>
            <CheckCircle2 className="w-4 h-4 text-[#176B5B]" />
          </div>
          <span className="text-2xl font-black text-[#176B5B] block mt-2">
            {overview.availableSlots || 0}
          </span>
          <span className="text-[11px] text-[#176B5B] font-medium block mt-1">
            Vacant across all facilities
          </span>
        </div>

        <div
          onClick={() => setViewMode("bikes")}
          className="bg-[#FFF5F5] p-4 rounded-2xl border border-[#FED7D7] shadow-xs cursor-pointer hover:border-[#E53E3E] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#C53030] font-bold uppercase tracking-wider">Vehicles Parked Now</span>
            <Lock className="w-4 h-4 text-[#C53030]" />
          </div>
          <span className="text-2xl font-black text-[#C53030] block mt-2">
            {overview.occupiedSlots || 0}
          </span>
          <span className="text-[11px] text-[#C53030] font-bold block mt-1 group-hover:underline">
            View all parked bikes &rarr;
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2D9CC] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#706254] uppercase tracking-wider">Active Sessions</span>
            <Clock className="w-4 h-4 text-[#176B5B]" />
          </div>
          <span className="text-2xl font-black text-[#1C1815] block mt-2">
            {overview.activeSessions || 0}
          </span>
          <Link
            href="/admin/sessions"
            className="text-[11px] text-[#176B5B] hover:text-[#125448] font-bold inline-block mt-1"
          >
            Audit sessions &rarr;
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2D9CC] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#706254] uppercase tracking-wider">Blocked Slots</span>
            <Ban className="w-4 h-4 text-[#706254]" />
          </div>
          <span className="text-2xl font-black text-[#1C1815] block mt-2">
            {overview.blockedSlots || 0}
          </span>
          <span className="text-[11px] text-[#706254] font-medium block mt-1">
            Maintenance or repair
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2D9CC] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#706254] uppercase tracking-wider">Registered Riders</span>
            <Users className="w-4 h-4 text-[#176B5B]" />
          </div>
          <span className="text-2xl font-black text-[#1C1815] block mt-2">
            {overview.totalUsers || 0}
          </span>
          <Link
            href="/admin/users"
            className="text-[11px] text-[#176B5B] hover:text-[#125448] font-bold inline-block mt-1"
          >
            View rider accounts &rarr;
          </Link>
        </div>

        <div className="bg-[#FFFBEB] p-4 rounded-2xl border border-[#FDE68A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#92400E] font-bold uppercase tracking-wider">Open Incidents</span>
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
          </div>
          <span className="text-2xl font-black text-[#B45309] block mt-2">
            {overview.openIncidents || 0}
          </span>
          <Link
            href="/admin/incidents"
            className="text-[11px] text-[#92400E] hover:text-[#78350F] font-bold inline-block mt-1"
          >
            Review incident queue &rarr;
          </Link>
        </div>
      </div>

      {/* MULTI-LOCATION OCCUPANCY & PARKED VEHICLES REGISTRY */}
      <div className="bg-white rounded-2xl border border-[#E2D9CC] shadow-xs overflow-hidden space-y-0">
        {/* Monitor Header with View Mode Switcher */}
        <div className="p-4 border-b border-[#EFE9DF] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FAF6EE]">
          <div>
            <h2 className="text-sm font-black text-[#1C1815] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#176B5B]" />
              <span>Multi-Location Parking &amp; Parked Bikes Registry</span>
            </h2>
            <p className="text-[11px] text-[#706254] mt-0.5">
              Live database tracking: identify which bike is parked in which parking lot, exact bay location, and rider details.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* View Mode Toggle */}
            <div className="bg-[#FAF7F2] p-1 border border-[#DFD1BD] rounded-xl flex items-center gap-1 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode("facilities")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  viewMode === "facilities"
                    ? "bg-[#176B5B] text-white shadow-xs"
                    : "text-[#706254] hover:text-[#1C1815] hover:bg-[#FAF6EE]"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>By Facility ({facilities.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("bikes")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  viewMode === "bikes"
                    ? "bg-[#176B5B] text-white shadow-xs"
                    : "text-[#706254] hover:text-[#1C1815] hover:bg-[#FAF6EE]"
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>All Parked Bikes ({allParkedBikes.length})</span>
              </button>
            </div>

            {viewMode === "facilities" && (
              <button
                type="button"
                onClick={() => setExpandAll(!expandAll)}
                className="px-3 py-1.5 text-xs font-bold text-[#176B5B] hover:text-[#125448] bg-[#EAF3EE] hover:bg-[#DFEDE6] border border-[#C5DDD2] rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                {expandAll ? "Collapse All" : "Expand All"}
              </button>
            )}
          </div>
        </div>

        {/* VIEW 1: BY FACILITY / PARKING LOT */}
        {viewMode === "facilities" && (
          <div className="divide-y divide-[#EFE9DF]">
            {facilities.map((fac) => {
              const isExpanded = expandAll || expandedFacilityId === fac.id;
              const isVacant = fac.occupiedSlots === 0;
              const isFull = fac.availableSlots === 0;

              return (
                <div key={fac.id} className="transition-colors">
                  <div
                    onClick={() => toggleExpand(fac.id)}
                    className="p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF6EE]/50 transition-colors"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-[#1C1815] whitespace-nowrap">
                          {fac.name}
                        </span>
                        <span className="text-xs font-semibold text-[#706254] whitespace-nowrap">
                          ({fac.city})
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider whitespace-nowrap ${
                            isVacant
                              ? "bg-[#FAF6EE] text-[#706254] border-[#DFD1BD]"
                              : isFull
                              ? "bg-[#FFF5F5] text-[#C53030] border-[#FED7D7]"
                              : "bg-[#EAF3EE] text-[#176B5B] border-[#C5DDD2]"
                          }`}
                        >
                          {isVacant ? "Vacant Lot" : isFull ? "Facility Full" : `${fac.occupancyPercent}% Occupied`}
                        </span>

                        {/* Live Rush & Check-in Control Status */}
                        {fac.allowCheckIn === false ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] inline-flex items-center gap-1 whitespace-nowrap">
                            <ShieldAlert className="w-3 h-3 text-[#D97706]" />
                            <span>Check-in Paused (Peak Rush)</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider bg-[#EAF3EE] text-[#176B5B] border-[#C5DDD2] inline-flex items-center gap-1 whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3 text-[#176B5B]" />
                            <span>Check-in Active</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#706254] flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#176B5B] shrink-0" />
                          <span>{fac.address}</span>
                        </span>
                        <span>•</span>
                        <span className="font-bold text-[#1C1815]">₹{fac.hourlyRate}/hr</span>
                        {fac.allowCheckIn === false && (
                          <>
                            <span>•</span>
                            <span className="text-[#92400E] font-bold">Checkout operational</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Admin Rush Control Toggle */}
                      <button
                        type="button"
                        disabled={togglingLotId === fac.id}
                        onClick={(e) => handleToggleCheckIn(e, fac.id, fac.allowCheckIn !== false)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                          fac.allowCheckIn === false
                            ? "bg-[#176B5B] hover:bg-[#125448] text-white border-[#176B5B] shadow-xs"
                            : "bg-[#FAF6EE] hover:bg-[#F3ECE1] text-[#92400E] border-[#D97706]"
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>
                          {togglingLotId === fac.id
                            ? "Updating..."
                            : fac.allowCheckIn === false
                            ? "Resume Check-in"
                            : "Pause Check-in (Peak Rush)"}
                        </span>
                      </button>

                      <div className="text-right min-w-[110px]">
                        <div className="text-xs whitespace-nowrap">
                          <span className="font-bold text-[#C53030]">{fac.occupiedSlots}</span> parked /{" "}
                          <span className="font-bold text-[#176B5B]">{fac.availableSlots}</span> empty
                        </div>
                        <div className="w-full bg-[#EFE9DF] rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-[#176B5B] h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, fac.occupancyPercent)}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-[#706254] hover:text-[#1C1815] hover:bg-[#FAF6EE] cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#176B5B]" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Parked Vehicles List */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 bg-[#FAF7F2] border-t border-[#E2D9CC]">
                      <div className="text-xs font-bold text-[#1C1815] mb-2.5 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Bike className="w-3.5 h-3.5 text-[#176B5B]" />
                          <span>Vehicles Currently Parked at {fac.name}:</span>
                        </span>
                        <span className="text-[#706254] text-[11px] font-semibold">
                          {fac.parkedVehicles.length} Active Two-Wheelers
                        </span>
                      </div>

                      {fac.parkedVehicles.length === 0 ? (
                        <div className="p-3.5 bg-white rounded-xl border border-[#DFD1BD] text-xs text-[#706254] text-center">
                          This parking facility is currently empty. No two-wheelers are occupying slots.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                          {fac.parkedVehicles.map((v, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 bg-white rounded-xl border border-[#DFD1BD] shadow-xs space-y-2 hover:border-[#176B5B] transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="font-mono font-black text-sm text-[#1C1815] bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#DFD1BD] inline-block tracking-wider">
                                    {v.registrationNumber}
                                  </span>
                                  <span className="text-[11px] text-[#706254] block mt-1 font-medium">
                                    {v.model}
                                  </span>
                                </div>
                                <span className="font-bold text-[#176B5B] bg-[#EAF3EE] px-2.5 py-1 rounded-lg text-xs border border-[#C5DDD2]">
                                  {v.slot}
                                </span>
                              </div>

                              <div className="pt-2 border-t border-[#EFE9DF] text-[11px] text-[#706254] flex items-center justify-between">
                                <span>Rider: <strong className="text-[#1C1815]">{v.rider}</strong></span>
                                {v.riderPhone && v.riderPhone !== "N/A" && (
                                  <span className="font-mono text-[#706254]">{v.riderPhone}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: ALL PARKED BIKES (MASTER REGISTRY WITH LOCATION & LOT) */}
        {viewMode === "bikes" && (
          <div className="p-4 space-y-4 bg-white">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#706254] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={bikeSearchQuery}
                  onChange={(e) => setBikeSearchQuery(e.target.value)}
                  placeholder="Search by vehicle plate (e.g. DL01AB1234), rider, lot, or slot..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#DFD1BD] rounded-xl bg-[#FAF7F2] text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
                />
              </div>

              <select
                value={lotFilter}
                onChange={(e) => setLotFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-[#DFD1BD] rounded-xl bg-[#FAF7F2] text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
              >
                <option value="all">All Parking Facilities ({allParkedBikes.length})</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.occupiedSlots} parked)
                  </option>
                ))}
              </select>
            </div>

            {/* Bikes Table / Cards */}
            {filteredBikes.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#706254] bg-[#FAF7F2] rounded-xl border border-[#DFD1BD]">
                No parked bikes found matching your search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#E2D9CC]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#E2D9CC] text-[#706254] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3 font-bold">Vehicle Plate</th>
                      <th className="p-3 font-bold">Two-Wheeler Model</th>
                      <th className="p-3 font-bold">Parking Facility Name</th>
                      <th className="p-3 font-bold">Exact Facility Location</th>
                      <th className="p-3 font-bold">Allocated Bay / Slot</th>
                      <th className="p-3 font-bold">Rider &amp; Contact</th>
                      <th className="p-3 font-bold">Parked Duration</th>
                      <th className="p-3 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE9DF]">
                    {filteredBikes.map((bike, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF6EE]/60 transition-colors">
                        {/* Vehicle Plate */}
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-mono font-black text-sm text-[#1C1815] bg-[#FAF6EE] px-2.5 py-1 rounded border border-[#DFD1BD] inline-block tracking-wider">
                            {bike.registrationNumber}
                          </span>
                        </td>

                        {/* Model */}
                        <td className="p-3">
                          <span className="font-bold text-[#1C1815] block">{bike.model}</span>
                          <span className="text-[10.5px] text-[#706254] uppercase tracking-wider">
                            {bike.vehicleType}
                          </span>
                        </td>

                        {/* Parking Lot Name */}
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <Building className="w-3.5 h-3.5 text-[#176B5B] shrink-0" />
                            <span className="font-black text-[#1C1815]">{bike.lotName}</span>
                          </div>
                          <span className="text-[10.5px] text-[#B08528] font-bold block mt-0.5">
                            ₹{bike.hourlyRate}/hr
                          </span>
                        </td>

                        {/* Exact Location & City */}
                        <td className="p-3 max-w-xs">
                          <div className="flex items-start space-x-1 text-[#706254]">
                            <MapPin className="w-3.5 h-3.5 text-[#176B5B] shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-relaxed text-[11.5px]">
                              {bike.lotAddress} {bike.lotCity ? `(${bike.lotCity})` : ""}
                            </span>
                          </div>
                        </td>

                        {/* Allocated Bay / Slot */}
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-black text-xs text-[#176B5B] bg-[#EAF3EE] px-2.5 py-1 rounded-md border border-[#C5DDD2] inline-block">
                            {bike.slot}
                          </span>
                        </td>

                        {/* Rider & Phone */}
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-bold text-[#1C1815] block">{bike.rider}</span>
                          {bike.riderPhone && bike.riderPhone !== "N/A" ? (
                            <span className="text-[11px] font-mono text-[#706254] flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-[#176B5B]" />
                              <span>{bike.riderPhone}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#706254]">Walk-in check-in</span>
                          )}
                        </td>

                        {/* Parked Duration */}
                        <td className="p-3 whitespace-nowrap text-[#706254]">
                          <span className="font-bold text-[#1C1815] block">
                            {getElapsed(bike.entryTime)}
                          </span>
                          <span className="text-[10.5px]">
                            Entry: {bike.entryTime ? new Date(bike.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-3 whitespace-nowrap text-center">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FFF5F5] text-[#C53030] border border-[#FED7D7] inline-flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C53030] inline-block animate-pulse" />
                            <span>Active In Bay</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily entries & exits chart */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2D9CC] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#1C1815]">
              Daily Parking Entries &amp; Exits (Last 7 Days)
            </h3>
            <span className="text-[11px] font-bold text-[#706254] uppercase tracking-wider">Verified Sessions</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.dailyActivity || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE9DF" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => val.slice(5)}
                  tick={{ fontSize: 11, fill: "#706254" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#706254" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FAF7F2",
                    border: "1.5px solid #DFD1BD",
                    color: "#1C1815",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px", fontWeight: 700 }} />
                <Bar dataKey="entries" name="Entries" fill="#176B5B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="exits" name="Exits" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lot capacity utilization chart */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2D9CC] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#1C1815]">
              Parking Capacity Breakdown by Facility
            </h3>
            <span className="text-[11px] font-bold text-[#706254] uppercase tracking-wider">Live Slots</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.utilizationByLot || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE9DF" />
                <XAxis
                  dataKey="name"
                  tickFormatter={(val) => (val.length > 10 ? `${val.slice(0, 10)}...` : val)}
                  tick={{ fontSize: 11, fill: "#706254" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#706254" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FAF7F2",
                    border: "1.5px solid #DFD1BD",
                    color: "#1C1815",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px", fontWeight: 700 }} />
                <Bar dataKey="available" name="Available Slots" fill="#176B5B" stackId="a" />
                <Bar dataKey="occupied" name="Occupied Slots" fill="#BA2D2D" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
