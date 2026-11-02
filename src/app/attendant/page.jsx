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
  ShieldAlert,
  Layers,
  FileText,
  Printer,
  X,
  Compass,
  AlertTriangle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SlotGrid from "@/components/parking/SlotGrid";
import toast from "react-hot-toast";

export default function AttendantBoothPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState("");
  const [activeTab, setActiveTab] = useState("gate"); // "gate", "retrieval", "zones", "vehicles", "incidents"

  // Check-In Form
  const [inRegNumber, setInRegNumber] = useState("");
  const [inVehicleType, setInVehicleType] = useState("motorcycle");
  const [inMake, setInMake] = useState("");
  const [inModel, setInModel] = useState("");
  const [inRiderName, setInRiderName] = useState("");
  const [inRiderPhone, setInRiderPhone] = useState("");
  const [inSlotId, setInSlotId] = useState("");
  const [inSubmitting, setInSubmitting] = useState(false);
  const [newTicketSlip, setNewTicketSlip] = useState(null);

  // Check-Out Form
  const [outIdentifier, setOutIdentifier] = useState("");
  const [outSubmitting, setOutSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Vehicle Retrieval Tool (Module 3)
  const [retrievalQuery, setRetrievalQuery] = useState("");
  const [retrievalResult, setRetrievalResult] = useState(null);
  const [retrievalSearched, setRetrievalSearched] = useState(false);

  // Incident & Violation Reporting (Module 3)
  const [incidents, setIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  const [incidentCategory, setIncidentCategory] = useState("unauthorized_parking");
  const [incidentReg, setIncidentReg] = useState("");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [submittingIncident, setSubmittingIncident] = useState(false);

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
          const currentLotId = res.lot?.id || "";
          setSelectedLotId(currentLotId);
          loadIncidents(currentLotId);
        }
      })
      .catch((err) => console.error("Booth error:", err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  const loadIncidents = (lotId) => {
    if (!lotId) return;
    setLoadingIncidents(true);
    fetch(`/api/attendant/incidents?lotId=${lotId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.incidents) {
          setIncidents(res.incidents);
        }
      })
      .catch((err) => console.error("Incidents error:", err))
      .finally(() => setLoadingIncidents(false));
  };

  useEffect(() => {
    loadBoothStatus();
    const interval = setInterval(() => {
      loadBoothStatus(selectedLotId);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLotChange = (e) => {
    const newLotId = e.target.value;
    setSelectedLotId(newLotId);
    loadBoothStatus(newLotId);
    loadIncidents(newLotId);
  };

  // Process Check-In (Module 2)
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
          riderName: inRiderName || undefined,
          riderPhone: inRiderPhone || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to check in vehicle");

      toast.success(resData.message || "Vehicle checked in successfully");
      if (resData.session) {
        setNewTicketSlip(resData.session);
      }
      setInRegNumber("");
      setInMake("");
      setInModel("");
      setInRiderName("");
      setInRiderPhone("");
      setInSlotId("");
      loadBoothStatus(selectedLotId);
    } catch (err) {
      toast.error(err.message, { duration: 5000 });
    } finally {
      setInSubmitting(false);
    }
  };

  // Process Check-Out (Module 2 & 3)
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
      if (retrievalResult && (retrievalResult.registrationNumber === target || retrievalResult.ticketId === target)) {
        setRetrievalResult(null);
      }
      loadBoothStatus(selectedLotId);
    } catch (err) {
      toast.error(err.message, { duration: 5000 });
    } finally {
      setOutSubmitting(false);
    }
  };

  // Vehicle Retrieval Search (Module 3)
  const handleVehicleRetrieval = (e) => {
    e.preventDefault();
    if (!retrievalQuery.trim()) {
      toast.error("Enter registration number or ticket ID to search");
      return;
    }

    const q = retrievalQuery.trim().toUpperCase().replace(/\s+/g, "");
    const parked = data?.parkedVehicles || [];
    const found = parked.find(
      (v) =>
        v.registrationNumber.toUpperCase().replace(/\s+/g, "") === q ||
        v.ticketId.toUpperCase() === q ||
        (v.riderPhone && v.riderPhone.includes(q))
    );

    setRetrievalResult(found || null);
    setRetrievalSearched(true);
  };

  // Submit Incident / Violation (Module 3)
  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    if (!incidentDesc.trim() || incidentDesc.trim().length < 5) {
      toast.error("Please describe the incident in detail (min 5 characters)");
      return;
    }

    setSubmittingIncident(true);
    try {
      const res = await fetch("/api/attendant/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lotId: selectedLotId,
          category: incidentCategory,
          description: incidentDesc,
          registrationNumber: incidentReg ? incidentReg.toUpperCase().replace(/\s+/g, "") : undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to record incident");

      toast.success("Security violation report recorded successfully");
      setIncidentDesc("");
      setIncidentReg("");
      loadIncidents(selectedLotId);
      loadBoothStatus(selectedLotId);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingIncident(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-ink-secondary">
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
  const zoneStats = data?.zoneStats || [];
  const allSlots = data?.allSlots || [];

  // Group slots by zone for SlotGrid visualizer
  const zonesForGrid = zoneStats.map((z) => {
    const slotsInZone = allSlots.filter((s) => s.zone === z.zone);
    return {
      name: z.zone,
      totalCount: z.total,
      availableCount: z.available,
      slots: slotsInZone,
    };
  });

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
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
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
              className="px-3 py-1.5 text-xs border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 text-ink-primary bg-white"
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
            onClick={() => {
              loadBoothStatus(selectedLotId);
              loadIncidents(selectedLotId);
            }}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Facility Metrics Strip (Module 1 Availability & Occupancy) */}
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
            <span className="text-xs text-ink-secondary font-medium">Security Alerts</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-bold text-ink-primary block mt-1">
            {data?.openIncidentsCount || incidents.filter((i) => i.status === "open").length || 0}
          </span>
          <span className="text-[11px] text-ink-secondary">
            active incidents logged
          </span>
        </div>
      </div>

      {/* Attendant Operational Navigation Tabs */}
      <div className="flex border-b border-border-subtle gap-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab("gate")}
          className={`pb-2.5 px-3 flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "gate"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-ink-secondary hover:text-ink-primary"
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Gate Check-In &amp; Exit</span>
        </button>

        <button
          onClick={() => setActiveTab("retrieval")}
          className={`pb-2.5 px-3 flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "retrieval"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-ink-secondary hover:text-ink-primary"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Vehicle Retrieval Desk</span>
        </button>

        <button
          onClick={() => setActiveTab("zones")}
          className={`pb-2.5 px-3 flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "zones"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-ink-secondary hover:text-ink-primary"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Zones &amp; Slot Map ({zoneStats.length} Zones)</span>
        </button>

        <button
          onClick={() => setActiveTab("vehicles")}
          className={`pb-2.5 px-3 flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "vehicles"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-ink-secondary hover:text-ink-primary"
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Parked Vehicles ({parkedVehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("incidents")}
          className={`pb-2.5 px-3 flex items-center space-x-1.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "incidents"
              ? "border-brand-500 text-brand-600 font-bold"
              : "border-transparent text-ink-secondary hover:text-ink-primary"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Security &amp; Violations ({incidents.length})</span>
        </button>
      </div>

      {/* TAB 1: GATE CHECK-IN & CHECK-OUT (Modules 1 & 2) */}
      {activeTab === "gate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entrance Gate: Check-In & Slot Allocation */}
          <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-border-subtle pb-3">
              <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <LogIn className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink-primary">
                  Entrance Gate Check-In
                </h2>
                <p className="text-[11px] text-ink-secondary">
                  Record two-wheeler arrival, allocate parking zone, and issue digital ticket.
                </p>
              </div>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Registration Number *
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
                    className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 bg-white"
                  >
                    <option value="motorcycle">Motorcycle / Bike</option>
                    <option value="scooter">Scooter (Petrol)</option>
                    <option value="electric_scooter">Electric Scooter</option>
                    <option value="moped">Moped</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-ink-primary mb-1">
                    Zone &amp; Slot Allocation
                  </label>
                  <select
                    value={inSlotId}
                    onChange={(e) => setInSlotId(e.target.value)}
                    className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 bg-white"
                  >
                    <option value="">Auto-Allocate Next Available Slot</option>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-ink-secondary mb-1">
                    Rider Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={inRiderName}
                    onChange={(e) => setInRiderName(e.target.value)}
                    placeholder="Walk-in Rider"
                    className="w-full px-3 py-1.5 border border-border-subtle rounded-button"
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink-secondary mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={inRiderPhone}
                    onChange={(e) => setInRiderPhone(e.target.value)}
                    placeholder="9876543210"
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
                    : "Check In Vehicle & Issue QR Slip"}
                </span>
              </Button>
            </form>
          </div>

          {/* Exit Gate: Check-Out & Fee Collection */}
          <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-border-subtle pb-3">
              <div className="w-8 h-8 rounded-md bg-red-100 text-red-700 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink-primary">
                  Exit Gate Check-Out
                </h2>
                <p className="text-[11px] text-ink-secondary">
                  Scan ticket or enter plate number to calculate fee and release slot.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Registration Number or Ticket ID
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

              <div className="p-3.5 bg-surface-subtle/80 rounded-lg border border-border-subtle text-[11px] space-y-2 text-ink-secondary">
                <span className="font-semibold text-ink-primary block">
                  Exit Gate Verification Checklist:
                </span>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Verify rider matches vehicle registration on record.</li>
                  <li>Calculate duration and collect total fee in ₹.</li>
                  <li>Clear departure; slot automatically updates to Available for new arrivals.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VEHICLE RETRIEVAL DESK (Module 3 - "Where Did I Park?") */}
      {activeTab === "retrieval" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-border-subtle pb-3">
              <div className="w-8 h-8 rounded-md bg-brand-100 text-brand-700 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink-primary">
                  Vehicle Retrieval Assistance
                </h2>
                <p className="text-[11px] text-ink-secondary">
                  Help riders remember where their two-wheeler is parked by searching registration plate or ticket identifier.
                </p>
              </div>
            </div>

            <form onSubmit={handleVehicleRetrieval} className="flex gap-2 max-w-xl">
              <input
                type="text"
                value={retrievalQuery}
                onChange={(e) => setRetrievalQuery(e.target.value.toUpperCase())}
                placeholder="Enter Registration Number (e.g. DL01AB1234) or Ticket ID"
                className="flex-1 px-3.5 py-2.5 border-2 border-brand-500 rounded-button text-sm font-mono font-bold uppercase tracking-wider focus:ring-2 focus:ring-brand-200"
              />
              <Button type="submit" size="md">
                <Search className="w-4 h-4 mr-1" />
                <span>Find Vehicle</span>
              </Button>
            </form>

            {retrievalSearched && !retrievalResult && (
              <div className="p-8 text-center bg-surface-subtle/60 rounded-card border border-border-subtle text-xs space-y-2">
                <AlertCircle className="w-8 h-8 text-ink-muted mx-auto" />
                <div className="font-bold text-ink-primary">Vehicle Not Found Inside Facility</div>
                <p className="text-ink-secondary max-w-md mx-auto">
                  No active parking record found for "{retrievalQuery}". Check for typos or confirm if the vehicle has already checked out.
                </p>
              </div>
            )}

            {retrievalResult && (
              <div className="p-6 bg-brand-50/40 rounded-card border-2 border-brand-500/40 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-200 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-brand-700 bg-brand-100 px-2 py-0.5 rounded">
                      Active Parking Session Located
                    </span>
                    <h3 className="text-xl font-mono font-black text-ink-primary mt-1">
                      {retrievalResult.registrationNumber}
                    </h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-ink-secondary block">Ticket ID</span>
                    <span className="font-mono text-xs font-bold text-ink-primary">
                      {retrievalResult.ticketId}
                    </span>
                  </div>
                </div>

                {/* Big Location Banner */}
                <div className="bg-white p-5 rounded-card border border-brand-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="text-xs text-ink-secondary block uppercase tracking-wider">
                      Designated Zone
                    </span>
                    <span className="text-2xl font-black text-brand-600">
                      {retrievalResult.zone}
                    </span>
                  </div>
                  <div className="border-t sm:border-t-0 sm:border-x border-border-subtle pt-2 sm:pt-0">
                    <span className="text-xs text-ink-secondary block uppercase tracking-wider">
                      Slot Number
                    </span>
                    <span className="text-3xl font-black text-ink-primary">
                      {retrievalResult.slotNumber}
                    </span>
                  </div>
                  <div className="border-t sm:border-t-0 border-border-subtle pt-2 sm:pt-0">
                    <span className="text-xs text-ink-secondary block uppercase tracking-wider">
                      Parked Duration
                    </span>
                    <span className="text-2xl font-black text-emerald-700">
                      {Math.floor(retrievalResult.elapsedMinutes / 60)}h {retrievalResult.elapsedMinutes % 60}m
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-card border border-border-subtle space-y-1.5">
                    <span className="font-bold text-ink-primary block">Vehicle Information:</span>
                    <div className="text-ink-secondary">
                      Make / Model: <strong>{retrievalResult.make || "Standard"} {retrievalResult.model || "Two-Wheeler"}</strong>
                    </div>
                    <div className="text-ink-secondary capitalize">
                      Type: <strong>{retrievalResult.vehicleType?.replace("_", " ")}</strong>
                    </div>
                    <div className="text-ink-secondary">
                      Rider: <strong>{retrievalResult.riderName}</strong> ({retrievalResult.riderPhone || "No phone"})
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-card border border-border-subtle space-y-1.5">
                    <span className="font-bold text-ink-primary block">Payment &amp; Timing:</span>
                    <div className="text-ink-secondary">
                      Entry Time: <strong>{new Date(retrievalResult.entryTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}</strong>
                    </div>
                    <div className="text-ink-secondary">
                      Hourly Rate: <strong>₹{lot.hourlyRate || 20} / hr</strong>
                    </div>
                    <div className="text-ink-primary font-bold">
                      Current Accrued Fee: <span className="text-brand-600 text-sm">₹{retrievalResult.currentFee}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleCheckOut(retrievalResult.registrationNumber)}
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" />
                    <span>Proceed to Exit &amp; Collect ₹{retrievalResult.currentFee}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ZONES & VISUAL SLOT MAP (Module 1 & 2 - Zone Allocation & Occupancy) */}
      {activeTab === "zones" && (
        <div className="space-y-6">
          {/* Zone Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {zoneStats.map((z) => {
              const occupancyPct = z.total > 0 ? Math.round(((z.total - z.available) / z.total) * 100) : 0;
              return (
                <div key={z.zone} className="bg-white p-5 rounded-card border border-border-subtle shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-ink-primary">{z.zone}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-subtle text-ink-secondary">
                      {occupancyPct}% full
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        occupancyPct > 85 ? "bg-red-500" : occupancyPct > 60 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 text-center text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-ink-muted uppercase block">Vacant</span>
                      <span className="font-bold text-emerald-700">{z.available}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-muted uppercase block">Parked</span>
                      <span className="font-bold text-red-700">{z.occupied}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-ink-muted uppercase block">Total</span>
                      <span className="font-bold text-ink-primary">{z.total}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Interactive Slot Grid */}
          <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs space-y-4">
            <div className="border-b border-border-subtle pb-3">
              <h3 className="text-base font-bold text-ink-primary">
                Facility Slot Occupancy Grid
              </h3>
              <p className="text-[11px] text-ink-secondary">
                Real-time visual map of all two-wheeler parking slots across zones.
              </p>
            </div>

            <SlotGrid zones={zonesForGrid} disabled={true} />
          </div>
        </div>
      )}

      {/* TAB 4: PARKED VEHICLES ATTENDANCE LIST (Module 2 Occupancy) */}
      {activeTab === "vehicles" && (
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
                No two-wheelers are currently parked in this lot. Check in arriving vehicles using the Entrance Gate tab.
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
      )}

      {/* TAB 5: SECURITY INCIDENTS & VIOLATIONS (Module 3) */}
      {activeTab === "incidents" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Violation Form */}
          <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-border-subtle pb-3">
              <div className="w-8 h-8 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink-primary">
                  Report Incident / Violation
                </h2>
                <p className="text-[11px] text-ink-secondary">
                  Log unauthorized parking, unofficial spaces, or security issues.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitIncident} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Violation Category *
                </label>
                <select
                  value={incidentCategory}
                  onChange={(e) => setIncidentCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 bg-white"
                >
                  <option value="unauthorized_parking">Unauthorized / Unofficial Parking Space</option>
                  <option value="damage">Vehicle Damage</option>
                  <option value="blocked_access">Blocked Driveway / Emergency Exit</option>
                  <option value="theft">Vehicle Theft Attempt</option>
                  <option value="helmet_theft">Stolen Helmet or Accessories</option>
                  <option value="other">Other Operational Security Concern</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Vehicle Registration Number (Optional)
                </label>
                <input
                  type="text"
                  value={incidentReg}
                  onChange={(e) => setIncidentReg(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                  placeholder="e.g. DL01AB1234"
                  className="w-full px-3 py-2 border border-border-subtle rounded-button font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Incident Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  placeholder="Describe location, vehicle condition, or unauthorized behavior in detail..."
                  className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <Button
                type="submit"
                disabled={submittingIncident}
                variant="danger"
                className="w-full mt-2"
                size="md"
              >
                <ShieldAlert className="w-4 h-4 mr-1.5" />
                <span>{submittingIncident ? "Logging Report..." : "Submit Violation Record"}</span>
              </Button>
            </form>
          </div>

          {/* Incident Log Records */}
          <div className="lg:col-span-2 bg-white rounded-card border border-border-subtle shadow-xs overflow-hidden space-y-0">
            <div className="p-4 border-b border-border-subtle bg-surface-subtle/40">
              <h3 className="text-sm font-bold text-ink-primary">
                Facility Security &amp; Violation Records
              </h3>
              <p className="text-[11px] text-ink-secondary">
                Recent incidents reported at {lot.name} reviewed by station attendants and admins.
              </p>
            </div>

            {incidents.length === 0 ? (
              <div className="p-10 text-center text-xs text-ink-secondary space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="font-bold text-ink-primary">No Violations Logged</div>
                <p className="text-ink-muted">No security incidents have been reported for this lot.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-subtle max-h-[500px] overflow-y-auto">
                {incidents.map((inc) => (
                  <div key={inc._id} className="p-4 text-xs space-y-2 hover:bg-surface-subtle/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {inc.category.replace("_", " ")}
                        </span>
                        {inc.vehicleId?.registrationNumber && (
                          <span className="font-mono font-bold text-ink-primary">
                            {inc.vehicleId.registrationNumber}
                          </span>
                        )}
                      </div>
                      <Badge status={inc.status} text={inc.status.replace("_", " ")} />
                    </div>

                    <p className="text-ink-primary text-xs leading-relaxed">
                      {inc.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1">
                      <span>Reported by: {inc.reportedBy?.name || "Station Attendant"}</span>
                      <span>
                        {new Date(inc.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Check-In Digital QR Ticket Slip Modal (Module 2) */}
      {newTicketSlip && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-card border border-border-subtle shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-ink-primary">Digital Parking Slip</h3>
              </div>
              <button
                onClick={() => setNewTicketSlip(null)}
                className="text-ink-muted hover:text-ink-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slip Content */}
            <div className="p-4 bg-surface-subtle/70 rounded-card border border-dashed border-border-subtle space-y-4 text-center">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                  Where Did I Park?
                </span>
                <div className="text-sm font-black text-ink-primary">{lot.name}</div>
                <div className="text-[10px] text-ink-secondary">{lot.address}</div>
              </div>

              {/* Scannable QR Code */}
              <div className="flex justify-center p-2 bg-white rounded-lg border border-border-subtle w-36 h-36 mx-auto items-center">
                <QRCodeSVG
                  value={JSON.stringify({
                    ticketId: newTicketSlip.ticketId,
                    reg: newTicketSlip.vehicleId?.registrationNumber,
                    slot: newTicketSlip.parkingSlotId?.slotNumber,
                    zone: newTicketSlip.parkingSlotId?.zone,
                    lotId: lot.id,
                  })}
                  size={124}
                  level="M"
                />
              </div>

              <div className="p-2.5 bg-brand-50 rounded-lg border border-brand-200">
                <span className="text-[10px] text-brand-700 uppercase font-semibold block">
                  Assigned Parking Slot
                </span>
                <span className="text-xl font-mono font-black text-brand-700">
                  {newTicketSlip.parkingSlotId?.zone} • {newTicketSlip.parkingSlotId?.slotNumber}
                </span>
              </div>

              <div className="space-y-1 text-xs text-left pt-2 border-t border-border-subtle">
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Vehicle:</span>
                  <span className="font-mono font-bold text-ink-primary">
                    {newTicketSlip.vehicleId?.registrationNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Ticket ID:</span>
                  <span className="font-mono text-ink-primary">{newTicketSlip.ticketId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Rate:</span>
                  <span className="font-semibold text-ink-primary">₹{lot.hourlyRate || 20} / hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Entry:</span>
                  <span className="text-ink-primary">
                    {new Date(newTicketSlip.entryTime).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                <span>Print Slip</span>
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setNewTicketSlip(null)}
              >
                <span>Done</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Receipt Modal (Module 2 & 3) */}
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
