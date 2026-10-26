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

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
            System Administration &amp; Analytics
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            Database-backed parking facility metrics, occupancy trends, and security audits.
          </p>
        </div>
        <div className="text-xs text-ink-secondary bg-white px-3 py-1.5 rounded-button border border-border-subtle">
          Real-time Database Status
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
            Manage lots &rarr;
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
            <span className="text-xs text-emerald-800 font-medium">Available Slots</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 block mt-2">
            {overview.availableSlots || 0}
          </span>
          <span className="text-[11px] text-emerald-700 block mt-1">
            Ready for rider booking
          </span>
        </div>

        <div className="bg-white p-4 rounded-card border border-red-200 bg-red-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-800 font-medium">Occupied Slots</span>
            <Lock className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-2xl font-black text-red-700 block mt-2">
            {overview.occupiedSlots || 0}
          </span>
          <span className="text-[11px] text-red-700 block mt-1">
            Currently parked bikes
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
            View live sessions &rarr;
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
            View riders &rarr;
          </Link>
        </div>

        <div className="bg-white p-4 rounded-card border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-800 font-medium">Open Incidents</span>
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
              Parking Capacity Utilization by Lot
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

      {/* Incident Categories Breakdown */}
      <div className="bg-white p-5 rounded-card border border-border-subtle shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink-primary">
            Incident Reports by Category
          </h3>
          <Link
            href="/admin/incidents"
            className="text-xs text-brand-500 hover:text-brand-600 font-medium"
          >
            Review all incidents &rarr;
          </Link>
        </div>

        {charts.incidentStats?.length === 0 ? (
          <div className="p-6 text-center text-xs text-ink-secondary">
            No incident reports recorded in the database.
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.incidentStats || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#667085" }} />
                <YAxis tick={{ fontSize: 11, fill: "#667085" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18212F",
                    color: "#FFFFFF",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" name="Incidents" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
