"use client";

import { useState, useEffect } from "react";
import {
  Bike,
  LogIn,
  LogOut,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Receipt,
  AlertCircle,
  Tag,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";

export default function AttendantBoothPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState("");

  // Check-In Form
  const [inRegNumber, setInRegNumber] = useState("");
  const [inVehicleType, setInVehicleType] = useState("motorcycle");
  const [inMake, setInMake] = useState("");
  const [inModel, setInModel] = useState("");
  const [inSlotId, setInSlotId] = useState("");
  const [inSubmitting, setInSubmitting] = useState(false);

  // Check-Out Form
  const [outIdentifier, setOutIdentifier] = useState("");
  const [outSubmitting, setOutSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Parked Vehicles Search Filter
  const [searchFilter, setSearchFilter] = useState("");

  const loadBoothStatus = (lotId = "") => {
    setRefreshing(true);
    const url = lotId ? `/api/attendant/status?lotId=${lotId}` : "/api/attendant/status";

    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) {
          toast.error(res.error);
        } else {
          setData(res);
          setSelectedLotId(res.lot?.id || "");
        }
      })
      .catch((err) => console.error("Booth error:", err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadBoothStatus();
    // Auto refresh every 30 seconds
    const interval = setInterval(() => loadBoothStatus(selectedLotId), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLotChange = (e) => {
    const newLotId = e.target.value;
    setSelectedLotId(newLotId);
    loadBoothStatus(newLotId);
  };

  // Process Check-In
  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!inRegNumber.trim()) {
      toast.error("Please enter vehicle registration number");
      return;
    }

    setInSubmitting(true);
    try {
      const res = await fetch("/api/attendant/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber: inRegNumber.toUpperCase().replace(/\s+/g, ""),
          lotId: selectedLotId,
          slotId: inSlotId || undefined,
          vehicleType: inVehicleType,
          make: inMake || undefined,
          model: inModel || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to check in vehicle");

      toast.success(resData.message || "Vehicle checked in successfully");
      setInRegNumber("");
      setInMake("");
      setInModel("");
      setInSlotId("");
      loadBoothStatus(selectedLotId);
    } catch (err) {
      toast.error(err.message, { duration: 5000 });
    } finally {
      setInSubmitting(false);
    }
  };

  // Process Check-Out
  const handleCheckOut = async (vehicleIdentifier) => {
    const target = vehicleIdentifier || outIdentifier;
    if (!target.trim()) {
      toast.error("Please provide a registration number or ticket ID");
      return;
    }

    setOutSubmitting(true);
    try {
      const res = await fetch("/api/attendant/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber: target,
          lotId: selectedLotId,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to check out vehicle");

      toast.success(resData.message);
      setReceiptData(resData.receipt);
      setOutIdentifier("");
      loadBoothStatus(selectedLotId);
    } catch (err) {
      toast.error(err.message, { duration: 5000 });
    } finally {
      setOutSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-ink-secondary">
        Connecting to parking facility booth...
      </div>
    );
  }

  const lot = data?.lot || {};
  const stats = data?.stats || {};
  const today = data?.todaySummary || {};
  const parkedVehicles = data?.parkedVehicles || [];
  const availableSlots = data?.availableSlots || [];
  const allLots = data?.allLots || [];

  const filteredParked = parkedVehicles.filter((v) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      v.registrationNumber.toLowerCase().includes(q) ||
      v.slotNumber.toLowerCase().includes(q) ||
      v.ticketId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Booth Header & Facility Switcher */}
      <div className="bg-white p-5 rounded-card border border-border-subtle shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
              Active Facility Booth
            </span>
            <span className="text-xs text-ink-secondary">
              Hourly Rate: <strong className="text-ink-primary">₹{lot.hourlyRate || 20}/hr</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-ink-primary tracking-tight mt-1">
            {lot.name}
          </h1>
          <p className="text-xs text-ink-secondary flex items-center space-x-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-ink-muted" />
            <span>{lot.address}, {lot.city}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {allLots.length > 1 && (
            <select
              value={selectedLotId}
              onChange={handleLotChange}
              className="px-3 py-1.5 text-xs border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 text-ink-primary"
            >
              {allLots.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name} ({l.city})
                </option>
              ))}
            </select>
          )}

          <Button
            size="sm"
            variant="secondary"
            onClick={() => loadBoothStatus(selectedLotId)}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Facility Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-card border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-800 font-semibold">Vacant Slots</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 block mt-1">
            {stats.available || 0}
          </span>
          <span className="text-[11px] text-emerald-800">
            of {stats.total || 0} total capacity
          </span>
        </div>

        <div className="bg-white p-4 rounded-card border border-red-200 bg-red-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-800 font-semibold">Vehicles Inside</span>
            <Bike className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-2xl font-black text-red-700 block mt-1">
            {stats.occupied || 0}
          </span>
          <span className="text-[11px] text-red-800">
            currently parked
          </span>
        </div>

        <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-secondary font-medium">Today's Check-ins</span>
            <LogIn className="w-4 h-4 text-brand-600" />
          </div>
          <span className="text-2xl font-bold text-ink-primary block mt-1">
            {today.entries || 0}
          </span>
          <span className="text-[11px] text-ink-secondary">
            entrance logs
          </span>
        </div>

        <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-secondary font-medium">Today's Exits</span>
            <LogOut className="w-4 h-4 text-brand-600" />
          </div>
          <span className="text-2xl font-bold text-ink-primary block mt-1">
            {today.exits || 0}
          </span>
          <span className="text-[11px] text-ink-secondary">
            completed departures
          </span>
        </div>
      </div>

      {/* Two Station Action Panels: Check-In (Entrance) & Check-Out (Exit) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entrance Gate: Check-In */}
        <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-border-subtle pb-3">
            <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-primary">
                Entrance Booth Check-In
              </h2>
              <p className="text-[11px] text-ink-secondary">
                Enter number plate to verify rider or assign slot on arrival.
              </p>
            </div>
          </div>

          <form onSubmit={handleCheckIn} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Vehicle Registration Number *
              </label>
              <input
                type="text"
                required
                value={inRegNumber}
                onChange={(e) => setInRegNumber(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                placeholder="e.g. DL01AB1234 or KA03HA5566"
                className="w-full px-3 py-2.5 border-2 border-brand-500 rounded-button text-sm font-mono font-bold tracking-wide uppercase focus:ring-2 focus:ring-brand-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Vehicle Type
                </label>
                <select
                  value={inVehicleType}
                  onChange={(e) => setInVehicleType(e.target.value)}
                  className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
                >
                  <option value="motorcycle">Motorcycle / Bike</option>
                  <option value="scooter">Scooter (Petrol)</option>
                  <option value="electric_scooter">Electric Scooter</option>
                  <option value="moped">Moped</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Assign Slot
                </label>
                <select
                  value={inSlotId}
                  onChange={(e) => setInSlotId(e.target.value)}
                  className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Auto-Assign Next Available Slot</option>
                  {availableSlots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.zone} • {s.slotNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-ink-secondary mb-1">
                  Make (Optional)
                </label>
                <input
                  type="text"
                  value={inMake}
                  onChange={(e) => setInMake(e.target.value)}
                  placeholder="Honda / Hero / Bajaj"
                  className="w-full px-3 py-1.5 border border-border-subtle rounded-button"
                />
              </div>
              <div>
                <label className="block font-medium text-ink-secondary mb-1">
                  Model (Optional)
                </label>
                <input
                  type="text"
                  value={inModel}
                  onChange={(e) => setInModel(e.target.value)}
                  placeholder="Activa / Splendor / Pulsar"
                  className="w-full px-3 py-1.5 border border-border-subtle rounded-button"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={inSubmitting || stats.available === 0}
              className="w-full mt-2"
              size="md"
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              <span>
                {inSubmitting
                  ? "Assigning Slot..."
                  : stats.available === 0
                  ? "Lot Full (No Vacant Slots)"
                  : "Check In Vehicle & Allocate Slot"}
              </span>
            </Button>
          </form>
        </div>

        {/* Exit Gate: Check-Out */}
        <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-border-subtle pb-3">
            <div className="w-8 h-8 rounded-md bg-red-100 text-red-700 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-primary">
                Exit Booth Check-Out
              </h2>
              <p className="text-[11px] text-ink-secondary">
                Enter plate number or ticket ID to compute fee and release slot.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Vehicle Registration Number or Ticket ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={outIdentifier}
                  onChange={(e) => setOutIdentifier(e.target.value.toUpperCase())}
                  placeholder="e.g. DL01AB1234 or WDIP-20261026-XXXX"
                  className="w-full px-3 py-2.5 border border-border-subtle rounded-button text-sm font-mono font-bold tracking-wide uppercase focus:ring-1 focus:ring-brand-500"
                />
                <Button
                  onClick={() => handleCheckOut()}
                  disabled={outSubmitting || !outIdentifier.trim()}
                  size="md"
                  variant="danger"
                  className="whitespace-nowrap px-4"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  <span>{outSubmitting ? "Processing..." : "Process Exit"}</span>
                </Button>
              </div>
            </div>

            <div className="p-3 bg-surface-subtle/80 rounded-lg border border-border-subtle text-[11px] space-y-1 text-ink-secondary">
              <span className="font-semibold text-ink-primary block">
                Exit Procedure:
              </span>
              <p>
                1. Match number plate against active tickets.
                <br />
                2. Inform rider of calculated duration and total fee in ₹.
                <br />
                3. Collect fee and confirm exit; slot status immediately reverts to Available.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Parked Vehicles Attendance Table */}
      <div className="bg-white rounded-card border border-border-subtle shadow-xs overflow-hidden space-y-0">
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-subtle/40">
          <div>
            <h3 className="text-sm font-bold text-ink-primary flex items-center space-x-2">
              <Bike className="w-4 h-4 text-brand-600" />
              <span>Vehicles Currently Parked Inside ({parkedVehicles.length})</span>
            </h3>
            <span className="text-[11px] text-ink-secondary">
              Live attendance list with elapsed parking duration and accrued fee in ₹.
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search plate or slot..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 bg-white"
            />
          </div>
        </div>

        {parkedVehicles.length === 0 ? (
          <div className="p-10 text-center text-xs text-ink-secondary space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="font-semibold text-ink-primary">
              Facility Currently Empty
            </div>
            <p className="text-ink-muted max-w-xs mx-auto">
              No two-wheelers are currently parked in this lot. Check in arriving vehicles using the Entrance Booth above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/80 border-b border-border-subtle text-ink-secondary uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 font-semibold">Plate Number</th>
                  <th className="p-3.5 font-semibold">Slot &amp; Zone</th>
                  <th className="p-3.5 font-semibold">Vehicle Details</th>
                  <th className="p-3.5 font-semibold">Rider</th>
                  <th className="p-3.5 font-semibold">Check-In Time</th>
                  <th className="p-3.5 font-semibold">Duration</th>
                  <th className="p-3.5 font-semibold">Accrued Fee</th>
                  <th className="p-3.5 font-semibold text-right">Departure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredParked.map((v) => (
                  <tr key={v.sessionId} className="hover:bg-surface-subtle/40 transition-colors">
                    <td className="p-3.5">
                      <span className="font-mono font-black text-sm text-ink-primary block">
                        {v.registrationNumber}
                      </span>
                      <span className="font-mono text-[10px] text-ink-muted">
                        {v.ticketId}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {v.zone} • {v.slotNumber}
                      </span>
                    </td>
                    <td className="p-3.5 text-ink-secondary">
                      <div className="font-medium text-ink-primary">{v.make} {v.model}</div>
                      <div className="text-[11px] text-ink-muted capitalize">
                        {v.vehicleType?.replace("_", " ")} {v.color ? `• ${v.color}` : ""}
                      </div>
                    </td>
                    <td className="p-3.5 text-ink-secondary">
                      <div className="font-medium text-ink-primary">{v.riderName}</div>
                      <div className="text-[11px] text-ink-muted">{v.riderPhone}</div>
                    </td>
                    <td className="p-3.5 text-[11px] text-ink-secondary">
                      {new Date(v.entryTime).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                    <td className="p-3.5 font-semibold text-ink-primary">
                      {Math.floor(v.elapsedMinutes / 60)}h {v.elapsedMinutes % 60}m
                    </td>
                    <td className="p-3.5 font-bold text-brand-600 text-sm">
                      ₹{v.currentFee}
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleCheckOut(v.registrationNumber)}
                        className="text-xs py-1 px-2.5"
                      >
                        <LogOut className="w-3 h-3 mr-1" />
                        <span>Check Out</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checkout Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-card border border-border-subtle shadow-xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
              <h3 className="text-base font-bold text-ink-primary flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Exit Clearance Receipt</span>
              </h3>
              <Badge status="completed" text="Checked Out" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-secondary">Vehicle Number:</span>
                <span className="font-mono font-bold text-sm text-ink-primary">
                  {receiptData.registrationNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Ticket Identifier:</span>
                <span className="font-mono font-medium text-ink-primary">
                  {receiptData.ticketId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Slot Released:</span>
                <span className="font-bold text-brand-600">
                  {receiptData.zone} • {receiptData.slotNumber} (Now Available)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Duration:</span>
                <span className="font-medium text-ink-primary">
                  {receiptData.durationMinutes} mins ({receiptData.billedHours} hr billed)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Hourly Rate:</span>
                <span className="font-medium text-ink-primary">
                  ₹{receiptData.hourlyRate} / hr
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border-subtle font-bold text-base text-ink-primary">
                <span>Total Fee Collected:</span>
                <span className="text-emerald-700">₹{receiptData.totalFee}</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <Button size="sm" onClick={() => setReceiptData(null)}>
                Dismiss &amp; Print
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
