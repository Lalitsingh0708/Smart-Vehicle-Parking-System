"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Bike,
  Clock,
  Search,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/vehicles").then((r) => r.json()),
      fetch("/api/parking-sessions?status=completed").then((r) => r.json()),
    ])
      .then(([meData, vData, sData]) => {
        if (meData.authenticated) {
          setUserData(meData.user);
          setActiveSession(meData.activeSession);
        }
        setVehicles(vData.vehicles || []);
        setRecentSessions((sData.sessions || []).slice(0, 3));
      })
      .catch((err) => console.error("Dashboard error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-white rounded animate-pulse" />
        <div className="h-40 bg-white rounded-card border border-border-subtle animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
            Rider Dashboard
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            Manage your two-wheeler parking allocations, active sessions, and registered vehicles.
          </p>
        </div>

        <Link href="/dashboard/find-parking">
          <Button size="sm">
            <Search className="w-3.5 h-3.5 mr-1.5" />
            <span>Find Parking Bay</span>
          </Button>
        </Link>
      </div>

      {/* Active Session Callout or Empty State */}
      {activeSession ? (
        <div className="bg-white p-6 rounded-card border-2 border-brand-500 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-status-available animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  Active Parking Session
                </span>
                <span className="text-xs font-mono text-ink-secondary">
                  Ticket #{activeSession.ticketId}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-ink-primary">
                {activeSession.parkingLotId?.name || "Designated Parking Bay"}
              </h2>

              <p className="text-xs text-ink-secondary flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-500" />
                <span>
                  {activeSession.parkingLotId?.address}, {activeSession.parkingLotId?.city}
                </span>
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-xs">
                <div>
                  <span className="text-ink-secondary block">Assigned Zone:</span>
                  <span className="font-semibold text-ink-primary">
                    {activeSession.parkingSlotId?.zone || "Zone A"}
                  </span>
                </div>
                <div>
                  <span className="text-ink-secondary block">Slot Number:</span>
                  <span className="font-bold text-brand-600 text-sm">
                    {activeSession.parkingSlotId?.slotNumber || "Slot #"}
                  </span>
                </div>
                <div>
                  <span className="text-ink-secondary block">Vehicle:</span>
                  <span className="font-semibold text-ink-primary">
                    {activeSession.vehicleId?.registrationNumber || "Two-Wheeler"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end justify-center gap-3">
              <Link href="/dashboard/my-parking">
                <Button size="md" className="w-full">
                  <span>View Ticket &amp; Directions</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-surface-subtle text-ink-secondary flex items-center justify-center mx-auto">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-ink-primary">
            No active parking session
          </h2>
          <p className="text-xs text-ink-secondary max-w-sm mx-auto">
            You currently do not have a two-wheeler parked in any system lot. Search nearby parking lots to allocate an available slot.
          </p>
          <Link href="/dashboard/find-parking">
            <Button size="sm">
              <Search className="w-3.5 h-3.5 mr-1.5" />
              <span>Find Available Parking</span>
            </Button>
          </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-card border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-secondary">Registered Vehicles</span>
            <Bike className="w-4 h-4 text-brand-500" />
          </div>
          <span className="text-2xl font-bold text-ink-primary block mt-2">
            {vehicles.length}
          </span>
          <Link
            href="/dashboard/vehicle"
            className="text-xs text-brand-500 hover:text-brand-600 font-medium inline-block mt-2"
          >
            Manage vehicles &rarr;
          </Link>
        </div>

        <div className="bg-white p-4 rounded-card border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-secondary">Completed Sessions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-ink-primary block mt-2">
            {recentSessions.length > 0 ? `${recentSessions.length}+` : "0"}
          </span>
          <Link
            href="/dashboard/history"
            className="text-xs text-brand-500 hover:text-brand-600 font-medium inline-block mt-2"
          >
            View history &rarr;
          </Link>
        </div>

        <div className="bg-white p-4 rounded-card border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink-secondary">Incident Reports</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-bold text-ink-primary block mt-2">
            Safety
          </span>
          <Link
            href="/dashboard/incidents"
            className="text-xs text-brand-500 hover:text-brand-600 font-medium inline-block mt-2"
          >
            File or review report &rarr;
          </Link>
        </div>
      </div>

      {/* Recent History Table */}
      <div className="bg-white rounded-card border border-border-subtle shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex justify-between items-center">
          <h3 className="text-sm font-bold text-ink-primary">
            Recent Completed Sessions
          </h3>
          <Link
            href="/dashboard/history"
            className="text-xs text-brand-500 hover:text-brand-600 font-semibold"
          >
            View all
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-ink-secondary">
            No completed parking sessions recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {recentSessions.map((s) => (
              <div key={s._id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-ink-primary block">
                    {s.parkingLotId?.name || "Parking Lot"}
                  </span>
                  <span className="text-ink-secondary text-[11px]">
                    Slot {s.parkingSlotId?.slotNumber} • {s.vehicleId?.registrationNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-ink-primary block">
                    ₹{s.fee || 0}
                  </span>
                  <span className="text-ink-secondary text-[11px]">
                    {new Date(s.entryTime).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
