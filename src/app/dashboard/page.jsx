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
  Layers,
  User,
  Receipt,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  const loadDashboardData = async () => {
    try {
      const [meRes, vRes, sRes, iRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/vehicles"),
        fetch("/api/parking-sessions"),
        fetch("/api/incidents"),
      ]);

      const [meData, vData, sData, iData] = await Promise.all([
        meRes.json(),
        vRes.json(),
        sRes.json(),
        iRes.json(),
      ]);

      if (meData?.authenticated) {
        setUserData(meData.user);
        setActiveSession(meData.activeSession || null);
      }
      setVehicles(vData?.vehicles || []);
      setAllSessions(sData?.sessions || []);
      setIncidents(iData?.incidents || []);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Live timer calculation for active parking session
  useEffect(() => {
    if (!activeSession?.entryTime) {
      setElapsedMinutes(0);
      return;
    }

    const updateTimer = () => {
      const start = new Date(activeSession.entryTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - start) / (1000 * 60)));
      setElapsedMinutes(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [activeSession]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-white rounded-card animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-card border border-border-subtle animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-white rounded-card border border-border-subtle animate-pulse" />
        <div className="h-64 bg-white rounded-card border border-border-subtle animate-pulse" />
      </div>
    );
  }

  // Calculations derived from real backend data
  const completedSessions = allSessions.filter((s) => s.status === "completed");
  const totalSpent = completedSessions.reduce((acc, curr) => acc + (curr.fee || 0), 0);
  const recentSessions = allSessions.slice(0, 5);

  const activeDurationHours = Math.floor(elapsedMinutes / 60);
  const activeDurationMins = elapsedMinutes % 60;
  const activeHourlyRate = activeSession?.parkingLotId?.hourlyRate ?? 20;
  const activeBilledHours = Math.max(1, Math.ceil(elapsedMinutes / 60));
  const estimatedAccruedFee = activeBilledHours * activeHourlyRate;

  // Quick Services & Navigation Cards
  const riderServices = [
    {
      title: "Find Parking",
      href: "/dashboard/find-parking",
      icon: Search,
      badge: "Discovery",
      badgeColor: "bg-brand-50 text-brand-700 border-brand-200",
      description: "Search nearby two-wheeler parking bays with live slot availability.",
    },
    {
      title: "My Parking",
      href: "/dashboard/my-parking",
      icon: MapPin,
      badge: activeSession ? "Active Now" : "Checked Out",
      badgeColor: activeSession
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-surface-subtle text-ink-secondary border-border-subtle",
      description: "Retrieve your vehicle location, scan digital ticket, or check out.",
    },
    {
      title: "My Vehicles",
      href: "/dashboard/vehicle",
      icon: Bike,
      badge: `${vehicles.length} Registered`,
      badgeColor: "bg-brand-50 text-brand-700 border-brand-200",
      description: "Register and manage your motorcycles, scooters, and electric bikes.",
    },
    {
      title: "Parking History",
      href: "/dashboard/history",
      icon: Clock,
      badge: `${completedSessions.length} Completed`,
      badgeColor: "bg-surface-subtle text-ink-secondary border-border-subtle",
      description: "Inspect previous parking sessions and itemized fee receipts.",
    },
    {
      title: "Security Incidents",
      href: "/dashboard/incidents",
      icon: AlertTriangle,
      badge: `${incidents.length} Reported`,
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      description: "Report vehicle damage, theft concerns, or bay obstructions.",
    },
    {
      title: "Rider Profile",
      href: "/dashboard/profile",
      icon: User,
      badge: "Account",
      badgeColor: "bg-surface-subtle text-ink-secondary border-border-subtle",
      description: "View verified account credentials, contact phone, and role.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Personalized Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded">
            Two-Wheeler Rider Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-primary tracking-tight mt-1.5">
            Welcome back, {userData?.name || "Rider"}
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5 flex flex-wrap items-center gap-1.5">
            <span>{userData?.email}</span>
            <span>•</span>
            <span className="capitalize">{userData?.role === "admin" ? "System Administrator" : "Verified Rider"}</span>
            {userData?.phoneNumber && (
              <>
                <span>•</span>
                <span>+91 {userData.phoneNumber}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadDashboardData}
            title="Refresh dashboard data"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-ink-muted" />
            <span>Refresh</span>
          </Button>

          <Link href="/dashboard/find-parking">
            <Button size="sm">
              <Search className="w-3.5 h-3.5 mr-1.5" />
              <span>Find Parking Bay</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Real Summary Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Parking */}
        <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-secondary">Active Parking</span>
              <div className="w-8 h-8 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              {activeSession ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-extrabold text-brand-600">
                    Slot {activeSession.parkingSlotId?.slotNumber || "Parked"}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-status-available animate-pulse" />
                </div>
              ) : (
                <span className="text-xl font-bold text-ink-primary">None</span>
              )}
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between text-xs">
            {activeSession ? (
              <Link
                href="/dashboard/my-parking"
                className="text-brand-500 hover:text-brand-600 font-semibold inline-flex items-center space-x-1"
              >
                <span>View live ticket</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/dashboard/find-parking"
                className="text-brand-500 hover:text-brand-600 font-medium inline-flex items-center space-x-1"
              >
                <span>Find a parking lot</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <span className="text-[11px] text-ink-muted">
              {activeSession ? activeSession.parkingSlotId?.zone || "Zone A" : "Not parked"}
            </span>
          </div>
        </div>

        {/* Metric 2: Total Bookings */}
        <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-secondary">Total Bookings</span>
              <div className="w-8 h-8 rounded-md bg-surface-subtle text-ink-secondary flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-extrabold text-ink-primary">
                {allSessions.length}
              </span>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between text-xs">
            <Link
              href="/dashboard/history"
              className="text-brand-500 hover:text-brand-600 font-medium inline-flex items-center space-x-1"
            >
              <span>View all allocations</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[11px] text-ink-muted">All-time</span>
          </div>
        </div>

        {/* Metric 3: Registered Vehicles */}
        <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-secondary">Registered Vehicles</span>
              <div className="w-8 h-8 rounded-md bg-surface-subtle text-ink-secondary flex items-center justify-center">
                <Bike className="w-4 h-4 text-brand-500" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-extrabold text-ink-primary">
                {vehicles.length}
              </span>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between text-xs">
            <Link
              href="/dashboard/vehicle"
              className="text-brand-500 hover:text-brand-600 font-medium inline-flex items-center space-x-1"
            >
              <span>Manage two-wheelers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[11px] text-ink-muted">
              {vehicles.length === 1 ? "1 vehicle" : `${vehicles.length} vehicles`}
            </span>
          </div>
        </div>

        {/* Metric 4: Completed Parking History */}
        <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-secondary">Parking History</span>
              <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-ink-primary">
                {completedSessions.length}
              </span>
              <span className="text-xs font-semibold text-brand-600">
                ₹{totalSpent} paid
              </span>
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between text-xs">
            <Link
              href="/dashboard/history"
              className="text-brand-500 hover:text-brand-600 font-medium inline-flex items-center space-x-1"
            >
              <span>View receipts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[11px] text-ink-muted">Completed</span>
          </div>
        </div>
      </div>

      {/* 3. Active Parking Session Hero Banner */}
      {activeSession ? (
        <div className="bg-white p-6 rounded-card border-2 border-brand-500 shadow-sm relative overflow-hidden space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border-subtle">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-status-available animate-ping" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  Active Parking Session
                </span>
                <span className="text-xs font-mono text-ink-secondary ml-2">
                  Ticket #{activeSession.ticketId}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-ink-secondary">Elapsed:</span>
              <span className="font-bold text-ink-primary bg-surface-subtle px-2 py-0.5 rounded">
                {activeDurationHours > 0 ? `${activeDurationHours}h ` : ""}{activeDurationMins}m
              </span>
              <span className="text-ink-secondary">•</span>
              <span className="font-bold text-brand-600">
                Accrued: ₹{estimatedAccruedFee}
              </span>
              <span className="text-[11px] text-ink-muted">
                (₹{activeHourlyRate}/hr)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3">
              <div>
                <h2 className="text-xl font-bold text-ink-primary">
                  {activeSession.parkingLotId?.name || "Assigned Parking Bay"}
                </h2>
                <p className="text-xs text-ink-secondary flex items-center space-x-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                  <span>
                    {activeSession.parkingLotId?.address}, {activeSession.parkingLotId?.city}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
                <div className="p-2.5 bg-surface-subtle rounded-lg">
                  <span className="text-ink-secondary text-[11px] block">Zone</span>
                  <span className="font-semibold text-ink-primary">
                    {activeSession.parkingSlotId?.zone || "Zone A"}
                  </span>
                </div>

                <div className="p-2.5 bg-brand-50 border border-brand-200 rounded-lg">
                  <span className="text-brand-800 text-[11px] block font-medium">Slot Number</span>
                  <span className="font-extrabold text-brand-700 text-sm">
                    {activeSession.parkingSlotId?.slotNumber || "Slot #"}
                  </span>
                </div>

                <div className="p-2.5 bg-surface-subtle rounded-lg">
                  <span className="text-ink-secondary text-[11px] block">Parked Vehicle</span>
                  <span className="font-mono font-bold text-ink-primary truncate block">
                    {activeSession.vehicleId?.registrationNumber || "Two-Wheeler"}
                  </span>
                </div>

                <div className="p-2.5 bg-surface-subtle rounded-lg">
                  <span className="text-ink-secondary text-[11px] block">Entry Time</span>
                  <span className="font-medium text-ink-primary">
                    {new Date(activeSession.entryTime).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-2.5 justify-center">
              <Link href="/dashboard/my-parking" className="w-full">
                <Button size="md" className="w-full">
                  <span>View Ticket &amp; Directions</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/dashboard/incidents" className="w-full">
                <Button variant="secondary" size="md" className="w-full text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                  <span>Report Incident for Slot</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-card border border-border-subtle shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface-subtle text-ink-secondary flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6 text-ink-muted" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-ink-primary">
            No active parking session
          </h2>
          <p className="text-xs text-ink-secondary max-w-md mx-auto leading-relaxed">
            You do not currently have a two-wheeler parked in any facility. Search for available parking lots to reserve an open slot and obtain your digital QR ticket.
          </p>
          <div className="pt-2">
            <Link href="/dashboard/find-parking">
              <Button size="sm">
                <Search className="w-3.5 h-3.5 mr-1.5" />
                <span>Find Available Parking</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 4. Complete Rider Services & Quick Navigation Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-ink-primary">
            Rider Services &amp; Navigation
          </h2>
          <p className="text-xs text-ink-secondary">
            Direct shortcuts to all two-wheeler parking modules and account settings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {riderServices.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.href}
                href={service.href}
                className="bg-white p-5 rounded-card border border-border-subtle hover:border-brand-500 hover:shadow-sm transition-all group flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-md bg-surface-subtle group-hover:bg-brand-50 group-hover:text-brand-600 text-ink-primary flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${service.badgeColor}`}
                    >
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-ink-primary group-hover:text-brand-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border-subtle/80 flex items-center justify-between text-xs font-semibold text-brand-500 group-hover:text-brand-600">
                  <span>Open {service.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 5. Recent Completed Sessions Table */}
      <div className="bg-white rounded-card border border-border-subtle shadow-xs overflow-hidden space-y-0">
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-ink-primary">
              Recent Parking Activity
            </h3>
            <span className="text-[11px] text-ink-secondary">
              Latest parking allocations and completion records
            </span>
          </div>
          <Link
            href="/dashboard/history"
            className="text-xs text-brand-500 hover:text-brand-600 font-semibold inline-flex items-center space-x-1"
          >
            <span>View complete history</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-ink-secondary space-y-2">
            <Clock className="w-7 h-7 text-ink-muted mx-auto" />
            <p className="font-semibold text-ink-primary">No parking activity recorded yet</p>
            <p className="max-w-xs mx-auto text-[11px]">
              When you reserve a slot and complete your parking session, your time records and receipts will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/70 border-b border-border-subtle text-ink-secondary uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 font-semibold">Ticket ID</th>
                  <th className="p-3.5 font-semibold">Parking Bay</th>
                  <th className="p-3.5 font-semibold">Slot &amp; Zone</th>
                  <th className="p-3.5 font-semibold">Vehicle</th>
                  <th className="p-3.5 font-semibold">Entry Date</th>
                  <th className="p-3.5 font-semibold">Fee Paid</th>
                  <th className="p-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {recentSessions.map((session) => (
                  <tr key={session._id} className="hover:bg-surface-subtle/40 transition-colors">
                    <td className="p-3.5 font-mono font-medium text-ink-primary">
                      {session.ticketId}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-ink-primary block truncate max-w-[180px]">
                        {session.parkingLotId?.name || "Designated Lot"}
                      </span>
                      <span className="text-[11px] text-ink-secondary">
                        {session.parkingLotId?.city || "India"}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium">
                      {session.parkingSlotId?.zone || "Zone A"} • Slot {session.parkingSlotId?.slotNumber || "N/A"}
                    </td>
                    <td className="p-3.5 font-mono">
                      {session.vehicleId?.registrationNumber || "N/A"}
                    </td>
                    <td className="p-3.5 text-[11px] text-ink-secondary">
                      {new Date(session.entryTime).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3.5 font-bold text-ink-primary">
                      ₹{session.fee || 0}
                    </td>
                    <td className="p-3.5">
                      <Badge status={session.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
