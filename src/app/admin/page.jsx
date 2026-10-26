"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  const [expandedFacilityId, setExpandedFacilityId] = useState(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((res) => setData(res))
      .catch((err) => console.error("Error loading admin analytics:", err))
      .finally(() => setLoading(false));
  }, []);

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

  const toggleExpand = (id) => {
    setExpandedFacilityId(expandedFacilityId === id ? null : id);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            Real-time multi-location monitoring: live parked vehicles, empty lots, and occupancy audits.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/attendant">
            <Button size="sm" variant="outline" className="text-xs">
              <Bike className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              <span>Attendant Booth View</span>
            </Button>
          </Link>
          <span className="text-xs text-ink-secondary bg-white px-3 py-1.5 rounded-button border border-border-subtle">
            Live Central Database
          </span>
        </div>
      </div>

      {/* 8 Core Database Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-secondary">Total Lots</span>
            <Layers className="w-4 h-4 text-brand-500" />
          </div>
          <span className="text-2xl font-bold text-ink-primary block mt-2">
            {overview.totalLots || 0}
          </span>
          <Link
            href="/admin/lots"
            className="text-[11px] text-brand-500 hover:text-brand-600 font-medium inline-block mt-1"
          >
            Manage facilities &rarr;
          </Link>
        </div>

        <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-secondary">Total Slots</span>
            <Grid className="w-4 h-4 text-brand-500" />
          </div>
          <span className="text-2xl font-bold text-ink-primary block mt-2">
            {overview.totalSlots || 0}
          </span>
          <Link
            href="/admin/slots"
            className="text-[11px] text-brand-500 hover:text-brand-600 font-medium inline-block mt-1"
          >
            Manage slots &rarr;
          </Link>
        </div>

        <div className="bg-white p-4 rounded-card border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-800 font-semibold">Vacant Slots</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 block mt-2">
            {overview.availableSlots || 0}
          </span>
          <span className="text-[11px] text-emerald-700 block mt-1">
            Vacant across all cities
          </span>
        </div>

        <div className="bg-white p-4 rounded-card border border-red-200 bg-red-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-800 font-semibold">Vehicles Parked Now</span>
            <Lock className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-2xl font-black text-red-700 block mt-2">
            {overview.occupiedSlots || 0}
          </span>
          <span className="text-[11px] text-red-700 block mt-1">
            Active in bays right now
          </span>
        </div>

        <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-secondary">Active Sessions</span>
            <Clock className="w-4 h-4 text-brand-600" />
          </div>
          <span className="text-2xl font-bold text-ink-primary block mt-2">
            {overview.activeSessions || 0}
          </span>
          <Link
            href="/admin/sessions"
            className="text-[11px] text-brand-500 hover:text-brand-600 font-medium inline-block mt-1"
          >
            Audit sessions &rarr;
          </Link>
        </div>

        <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-secondary">Blocked Slots</span>
            <Ban className="w-4 h-4 text-gray-500" />
          </div>
          <span className="text-2xl font-bold text-ink-primary block mt-2">
            {overview.blockedSlots || 0}
          </span>
          <span className="text-[11px] text-ink-secondary block mt-1">
            Maintenance or repair
          </span>
        </div>

        <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-secondary">Registered Riders</span>
            <Users className="w-4 h-4 text-brand-500" />
          </div>
          <span className="text-2xl font-bold text-ink-primary block mt-2">
            {overview.totalUsers || 0}
          </span>
          <Link
            href="/admin/users"
            className="text-[11px] text-brand-500 hover:text-brand-600 font-medium inline-block mt-1"
          >
            View rider accounts &rarr;
          </Link>
        </div>

        <div className="bg-white p-4 rounded-card border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-800 font-semibold">Open Incidents</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-700 block mt-2">
            {overview.openIncidents || 0}
          </span>
          <Link
            href="/admin/incidents"
            className="text-[11px] text-amber-800 hover:text-amber-900 font-medium inline-block mt-1"
          >
            Review incident queue &rarr;
          </Link>
        </div>
      </div>

      {/* MULTI-LOCATION OCCUPANCY MONITOR */}
      <div className="bg-white rounded-card border border-border-subtle shadow-xs overflow-hidden space-y-0">
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface-subtle/50">
          <div>
            <h2 className="text-sm font-bold text-ink-primary flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-brand-500" />
              <span>Multi-Location Parking Occupancy Monitor</span>
            </h2>
            <p className="text-[11px] text-ink-secondary">
              Inspect where bikes are currently parked, identify vacant facilities, and view exact vehicles present.
            </p>
          </div>
          <span className="text-xs font-semibold text-ink-secondary">
            {facilities.length} Monitored Facilities
          </span>
        </div>

        <div className="divide-y divide-border-subtle">
          {facilities.map((fac) => {
            const isExpanded = expandedFacilityId === fac.id;
            const isVacant = fac.occupiedSlots === 0;
            const isFull = fac.availableSlots === 0;

            return (
              <div key={fac.id} className="transition-colors">
                <div
                  onClick={() => toggleExpand(fac.id)}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-surface-subtle/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-ink-primary">
                        {fac.name}
                      </span>
                      <span className="text-xs font-medium text-ink-secondary">
                        ({fac.city})
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          isVacant
                            ? "bg-gray-100 text-gray-700 border-gray-300"
                            : isFull
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {isVacant ? "Vacant Lot" : isFull ? "Facility Full" : `${fac.occupancyPercent}% Occupied`}
                      </span>
                    </div>
                    <p className="text-xs text-ink-secondary flex items-center space-x-1">
                      <span>{fac.address}</span>
                      <span>•</span>
                      <span>₹{fac.hourlyRate}/hr</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-xs">
                        <span className="font-bold text-red-600">{fac.occupiedSlots}</span> parked /{" "}
                        <span className="font-bold text-emerald-600">{fac.availableSlots}</span> empty
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-brand-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, fac.occupancyPercent)}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-1 rounded text-ink-secondary hover:text-ink-primary"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-brand-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Parked Vehicles List */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-surface-subtle/30 border-t border-border-subtle">
                    <div className="text-xs font-semibold text-ink-primary mb-2 flex items-center justify-between">
                      <span>Vehicles Currently Parked at {fac.name}:</span>
                      <span className="text-ink-muted text-[11px]">
                        {fac.parkedVehicles.length} Active Records
                      </span>
                    </div>

                    {fac.parkedVehicles.length === 0 ? (
                      <div className="p-3 bg-white rounded border border-border-subtle text-xs text-ink-muted text-center">
                        This parking facility is currently empty. No two-wheelers are occupying slots.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {fac.parkedVehicles.map((v, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-white rounded border border-border-subtle flex justify-between items-center"
                          >
                            <div>
                              <span className="font-mono font-bold text-ink-primary block">
                                {v.registrationNumber}
                              </span>
                              <span className="text-[11px] text-ink-secondary">
                                {v.model} • Rider: {v.rider}
                              </span>
                            </div>
                            <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded text-xs border border-brand-200">
                              {v.slot}
                            </span>
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
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily entries & exits chart */}
        <div className="bg-white p-5 rounded-card border border-border-subtle shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink-primary">
              Daily Parking Entries &amp; Exits (Last 7 Days)
            </h3>
            <span className="text-[11px] text-ink-secondary">Verified Sessions</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.dailyActivity || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => val.slice(5)}
                  tick={{ fontSize: 11, fill: "#667085" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#667085" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18212F",
                    color: "#FFFFFF",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar dataKey="entries" name="Entries" fill="#176B5B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="exits" name="Exits" fill="#65bda6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lot capacity utilization chart */}
        <div className="bg-white p-5 rounded-card border border-border-subtle shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink-primary">
              Parking Capacity Breakdown by Facility
            </h3>
            <span className="text-[11px] text-ink-secondary">Live Slots</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.utilizationByLot || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
                <XAxis
                  dataKey="name"
                  tickFormatter={(val) => (val.length > 10 ? `${val.slice(0, 10)}...` : val)}
                  tick={{ fontSize: 11, fill: "#667085" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#667085" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18212F",
                    color: "#FFFFFF",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar dataKey="available" name="Available Slots" fill="#16A34A" stackId="a" />
                <Bar dataKey="occupied" name="Occupied Slots" fill="#DC2626" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
