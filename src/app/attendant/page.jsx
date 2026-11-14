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
import TicketCard from "@/components/parking/TicketCard";
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
      {/* Booth Header & Facility Switcher (Soft Luxury Finish) */}
      <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-2xl border-2 border-[#E2D9CC] shadow-[0_6px_24px_rgba(60,45,30,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#176B5B] bg-[#EAF3EE] px-2.5 py-0.5 rounded-lg border border-[#C5DDD2]">
              Active Facility Booth
            </span>
            <span className="text-xs font-semibold text-[#706254] bg-[#FAF6EE] px-2.5 py-0.5 rounded-lg border border-[#E5DACB]">
              Campus Tariff: <strong className="text-[#B08528] font-black">₹{lot.hourlyRate || 10}/hr</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1815] tracking-tight mt-1.5">
            {lot.name}
          </h1>
          <p className="text-xs text-[#706254] flex items-center space-x-1.5 mt-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#176B5B] shrink-0" />
            <span>{lot.address}, {lot.city}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          {allLots.length > 1 && (
            <select
              value={selectedLotId}
              onChange={handleLotChange}
              className="px-3.5 py-2 text-xs font-bold border-2 border-[#DFD1BD] rounded-xl focus:ring-1 focus:ring-[#176B5B] text-[#1C1815] bg-[#FAF6EE]"
            >
              {allLots.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name} ({l.city})
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => {
              loadBoothStatus(selectedLotId);
              loadIncidents(selectedLotId);
            }}
            className="px-4 py-2 bg-[#FAF6EE] hover:bg-[#EFE7D8] text-[#176B5B] border-2 border-[#D9C49D] text-xs font-black rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#176B5B] ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Facility Metrics Strip (Forest Green, Warm Beige & Gold Accents) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Vacant Slots */}
        <div className="bg-[#F0F8F5] p-4 sm:p-5 rounded-2xl border-2 border-[#A3D9C9] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#176B5B] font-black uppercase tracking-wider">Vacant Slots</span>
            <CheckCircle2 className="w-4 h-4 text-[#176B5B]" />
          </div>
          <span className="text-3xl font-black text-[#176B5B] block mt-1">
            {stats.available || 0}
          </span>
          <span className="text-[11px] text-[#176B5B] font-semibold block mt-0.5">
            of {stats.total || 0} total capacity
          </span>
        </div>

        {/* Vehicles Inside */}
        <div className="bg-[#FFF5F5] p-4 sm:p-5 rounded-2xl border-2 border-[#FBC4C4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#C53030] font-black uppercase tracking-wider">Vehicles Inside</span>
            <Bike className="w-4 h-4 text-[#C53030]" />
          </div>
          <span className="text-3xl font-black text-[#C53030] block mt-1">
            {stats.occupied || 0}
          </span>
          <span className="text-[11px] text-[#C53030] font-semibold block mt-0.5">
            currently parked
          </span>
        </div>

        {/* Today's Check-ins */}
        <div className="bg-[#FAF6EE] p-4 sm:p-5 rounded-2xl border-2 border-[#DFD1BD] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#7A6C5F] font-black uppercase tracking-wider">Today's Check-ins</span>
            <LogIn className="w-4 h-4 text-[#B08528]" />
          </div>
          <span className="text-3xl font-black text-[#1C1815] block mt-1">
            {today.entries || 0}
          </span>
          <span className="text-[11px] text-[#7A6C5F] font-semibold block mt-0.5">
            entrance logs
          </span>
        </div>

        {/* Security Alerts */}
        <div className="bg-[#FFFBEB] p-4 sm:p-5 rounded-2xl border-2 border-[#FDE68A] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#B45309] font-black uppercase tracking-wider">Security Alerts</span>
            <ShieldAlert className="w-4 h-4 text-[#D97706]" />
          </div>
          <span className="text-3xl font-black text-[#B45309] block mt-1">
            {data?.openIncidentsCount || incidents.filter((i) => i.status === "open").length || 0}
          </span>
          <span className="text-[11px] text-[#B45309] font-semibold block mt-0.5">
            active incidents logged
          </span>
        </div>
      </div>

      {/* Attendant Operational Navigation Tabs (Beige & Forest Green Luxury Toolbar) */}
      <div className="bg-[#FFFFFF] p-2 rounded-2xl border-2 border-[#E2D9CC] shadow-xs flex gap-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("gate")}
          className={`py-2 px-3.5 rounded-xl flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer text-xs font-black ${
            activeTab === "gate"
              ? "bg-[#176B5B] text-white shadow-xs border border-[#D4AF37]/50"
              : "bg-[#FAF6EE] text-[#66584B] border border-[#E5DACB] hover:bg-[#EFE7D8] hover:text-[#1C1815]"
          }`}
        >
          <LogIn className="w-4 h-4 stroke-[2.5]" />
          <span>Gate Check-In &amp; Exit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("retrieval")}
          className={`py-2 px-3.5 rounded-xl flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer text-xs font-black ${
            activeTab === "retrieval"
              ? "bg-[#176B5B] text-white shadow-xs border border-[#D4AF37]/50"
              : "bg-[#FAF6EE] text-[#66584B] border border-[#E5DACB] hover:bg-[#EFE7D8] hover:text-[#1C1815]"
          }`}
        >
          <Compass className="w-4 h-4 stroke-[2.5]" />
          <span>Vehicle Retrieval Desk</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("zones")}
          className={`py-2 px-3.5 rounded-xl flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer text-xs font-black ${
            activeTab === "zones"
              ? "bg-[#176B5B] text-white shadow-xs border border-[#D4AF37]/50"
              : "bg-[#FAF6EE] text-[#66584B] border border-[#E5DACB] hover:bg-[#EFE7D8] hover:text-[#1C1815]"
          }`}
        >
          <Layers className="w-4 h-4 stroke-[2.5]" />
          <span>Zones &amp; Slot Map ({zoneStats.length} Zones)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vehicles")}
          className={`py-2 px-3.5 rounded-xl flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer text-xs font-black ${
            activeTab === "vehicles"
              ? "bg-[#176B5B] text-white shadow-xs border border-[#D4AF37]/50"
              : "bg-[#FAF6EE] text-[#66584B] border border-[#E5DACB] hover:bg-[#EFE7D8] hover:text-[#1C1815]"
          }`}
        >
          <Bike className="w-4 h-4 stroke-[2.5]" />
          <span>Parked Vehicles ({parkedVehicles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("incidents")}
          className={`py-2 px-3.5 rounded-xl flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer text-xs font-black ${
            activeTab === "incidents"
              ? "bg-[#176B5B] text-white shadow-xs border border-[#D4AF37]/50"
              : "bg-[#FAF6EE] text-[#66584B] border border-[#E5DACB] hover:bg-[#EFE7D8] hover:text-[#1C1815]"
          }`}
        >
          <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
          <span>Security &amp; Violations ({incidents.length})</span>
        </button>
      </div>

      {/* TAB 1: GATE CHECK-IN & CHECK-OUT (Soft Luxury Finish) */}
      {activeTab === "gate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entrance Gate: Check-In & Slot Allocation */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border-2 border-[#E2D9CC] shadow-[0_6px_24px_rgba(60,45,30,0.06)] space-y-4">
            <div className="flex items-center space-x-3 border-b-2 border-[#EFE9DF] pb-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#176B5B] border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center shadow-xs">
                <LogIn className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#1C1815] tracking-tight">
                  Entrance Gate Check-In
                </h2>
                <p className="text-[11px] font-semibold text-[#7A6C5F]">
                  Record two-wheeler arrival, allocate parking zone, and issue digital ticket.
                </p>
              </div>
            </div>

            {data?.lot?.allowCheckIn === false && (
              <div className="p-3.5 bg-amber-50 border-2 border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="flex items-center space-x-1.5 font-black text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Entrance Gate Paused by Admin</span>
                </div>
                <p className="text-[11px] font-medium text-amber-700 leading-snug">
                  New check-ins are temporarily paused by facility administration due to peak capacity. Exit gate check-outs remain fully operational.
                </p>
              </div>
            )}

            <form onSubmit={handleCheckIn} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-black text-[#1C1815] uppercase tracking-wider mb-1">
                  Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={inRegNumber}
                  onChange={(e) => setInRegNumber(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                  placeholder="e.g. PB08AB1234 or KA03HA5566"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border-2 border-[#176B5B] rounded-xl text-sm font-mono font-black tracking-wide uppercase text-[#1C1815] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1C1815] uppercase tracking-wider text-[11px] mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={inVehicleType}
                    onChange={(e) => setInVehicleType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border-2 border-[#DFD1BD] rounded-xl font-bold text-xs text-[#1C1815] focus:border-[#176B5B]"
                  >
                    <option value="motorcycle">Motorcycle / Bike</option>
                    <option value="scooter">Scooter (Petrol)</option>
                    <option value="electric_scooter">Electric Scooter</option>
                    <option value="moped">Moped</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1C1815] uppercase tracking-wider text-[11px] mb-1">
                    Zone &amp; Slot Allocation
                  </label>
                  <select
                    value={inSlotId}
                    onChange={(e) => setInSlotId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border-2 border-[#DFD1BD] rounded-xl font-bold text-xs text-[#1C1815] focus:border-[#176B5B]"
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
                  <label className="block font-bold text-[#7A6C5F] text-[11px] mb-1">
                    Make (Optional)
                  </label>
                  <input
                    type="text"
                    value={inMake}
                    onChange={(e) => setInMake(e.target.value)}
                    placeholder="Honda / Hero / Bajaj"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DFD1BD] rounded-xl font-medium text-[#1C1815]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#7A6C5F] text-[11px] mb-1">
                    Model (Optional)
                  </label>
                  <input
                    type="text"
                    value={inModel}
                    onChange={(e) => setInModel(e.target.value)}
                    placeholder="Activa / Splendor / Pulsar"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DFD1BD] rounded-xl font-medium text-[#1C1815]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#7A6C5F] text-[11px] mb-1">
                    Rider Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={inRiderName}
                    onChange={(e) => setInRiderName(e.target.value)}
                    placeholder="Walk-in Rider"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DFD1BD] rounded-xl font-medium text-[#1C1815]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#7A6C5F] text-[11px] mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={inRiderPhone}
                    onChange={(e) => setInRiderPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DFD1BD] rounded-xl font-medium text-[#1C1815]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={inSubmitting || stats.available === 0 || data?.lot?.allowCheckIn === false}
                className="w-full py-3.5 px-4 bg-[#176B5B] hover:bg-[#125448] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg border-2 border-[#D4AF37]/50 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-3"
              >
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {inSubmitting
                    ? "Assigning Slot..."
                    : data?.lot?.allowCheckIn === false
                    ? "Check-In Paused by Admin (Rush)"
                    : stats.available === 0
                    ? "Lot Full (No Vacant Slots)"
                    : "Check In Vehicle & Issue QR Slip"}
                </span>
              </button>
            </form>
          </div>

          {/* Exit Gate: Check-Out & Fee Collection */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border-2 border-[#E2D9CC] shadow-[0_6px_24px_rgba(60,45,30,0.06)] space-y-4">
            <div className="flex items-center space-x-3 border-b-2 border-[#EFE9DF] pb-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFF5F5] border border-[#FBC4C4] text-[#C53030] flex items-center justify-center shadow-xs">
                <LogOut className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#1C1815] tracking-tight">
                  Exit Gate Check-Out
                </h2>
                <p className="text-[11px] font-semibold text-[#7A6C5F]">
                  Scan ticket or enter plate number to calculate fee and release slot.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-black text-[#1C1815] uppercase tracking-wider mb-1">
                  Registration Number or Ticket ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={outIdentifier}
                    onChange={(e) => setOutIdentifier(e.target.value.toUpperCase())}
                    placeholder="e.g. PB08AB1234 or WDIP-20261113-XXXX"
                    className="flex-1 px-3.5 py-2.5 bg-[#FAF7F2] border-2 border-[#DFD1BD] rounded-xl text-sm font-mono font-black tracking-wide uppercase text-[#1C1815] focus:outline-none focus:border-[#176B5B] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleCheckOut()}
                    disabled={outSubmitting || !outIdentifier.trim()}
                    className="whitespace-nowrap px-5 py-2.5 bg-[#BA2D2D] hover:bg-[#9E2424] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{outSubmitting ? "Processing..." : "Process Exit"}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#FAF6EE] rounded-xl border-2 border-[#DFD1BD] text-xs space-y-2 text-[#706254] shadow-xs">
                <span className="font-black text-[#1C1815] block">
                  Exit Gate Verification Checklist:
                </span>
                <ul className="space-y-1.5 list-disc list-inside font-medium">
                  <li>Verify rider matches vehicle registration on record.</li>
                  <li>Calculate duration and collect total fee in ₹.</li>
                  <li>Clear departure; slot automatically updates to Available for new arrivals.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VEHICLE RETRIEVAL DESK (Soft Luxury Finish) */}
      {activeTab === "retrieval" && (
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border-2 border-[#E2D9CC] shadow-[0_6px_24px_rgba(60,45,30,0.06)] space-y-4">
            <div className="flex items-center space-x-3 border-b-2 border-[#EFE9DF] pb-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF6EE] border-2 border-[#D4AF37]/50 text-[#176B5B] flex items-center justify-center shadow-xs">
                <Compass className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#1C1815] tracking-tight">
                  Vehicle Retrieval Assistance
                </h2>
                <p className="text-[11px] font-semibold text-[#7A6C5F]">
                  Help riders remember where their two-wheeler is parked by searching registration plate or ticket identifier.
                </p>
              </div>
            </div>

            <form onSubmit={handleVehicleRetrieval} className="flex gap-2 max-w-xl">
              <input
                type="text"
                value={retrievalQuery}
                onChange={(e) => setRetrievalQuery(e.target.value.toUpperCase())}
                placeholder="Enter Registration Number (e.g. PB08AB1234) or Ticket ID"
                className="flex-1 px-3.5 py-2.5 bg-[#FAF7F2] border-2 border-[#176B5B] rounded-xl text-sm font-mono font-black uppercase tracking-wider text-[#1C1815] focus:outline-none focus:bg-white"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#176B5B] hover:bg-[#125448] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs border border-[#D4AF37]/50 flex items-center space-x-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>Find Vehicle</span>
              </button>
            </form>

            {retrievalSearched && !retrievalResult && (
              <div className="p-8 text-center bg-[#FAF6EE] rounded-2xl border-2 border-[#DFD1BD] text-xs space-y-2">
                <AlertCircle className="w-8 h-8 text-[#916E28] mx-auto" />
                <div className="font-black text-[#1C1815] text-sm">Vehicle Not Found Inside Facility</div>
                <p className="text-[#706254] max-w-md mx-auto font-medium">
                  No active parking record found for "{retrievalQuery}". Check for typos or confirm if the vehicle has already checked out.
                </p>
              </div>
            )}

            {retrievalResult && (
              <div className="p-6 bg-[#FAF6EE] rounded-2xl border-2 border-[#D4AF37] space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#EFE9DF] pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#176B5B] bg-[#EAF3EE] px-2.5 py-0.5 rounded-md border border-[#C5DDD2]">
                      Active Parking Session Located
                    </span>
                    <h3 className="text-2xl font-mono font-black text-[#1C1815] mt-1.5">
                      {retrievalResult.registrationNumber}
                    </h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-[#7A6C5F] font-bold block uppercase tracking-wider">Ticket ID</span>
                    <span className="font-mono text-sm font-black text-[#1C1815]">
                      {retrievalResult.ticketId}
                    </span>
                  </div>
                </div>

                {/* Big Location Banner */}
                <div className="bg-white p-5 rounded-xl border-2 border-[#DFD1BD] shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="text-xs text-[#7A6C5F] font-bold block uppercase tracking-wider">
                      Designated Zone
                    </span>
                    <span className="text-2xl font-black text-[#176B5B] mt-0.5 block">
                      {retrievalResult.zone}
                    </span>
                  </div>
                  <div className="border-t sm:border-t-0 sm:border-x-2 border-[#EFE9DF] pt-2 sm:pt-0">
                    <span className="text-xs text-[#7A6C5F] font-bold block uppercase tracking-wider">
                      Slot Number
                    </span>
                    <span className="text-3xl font-black text-[#1C1815] mt-0.5 block">
                      {retrievalResult.slotNumber}
                    </span>
                  </div>
                  <div className="border-t sm:border-t-0 border-[#EFE9DF] pt-2 sm:pt-0">
                    <span className="text-xs text-[#7A6C5F] font-bold block uppercase tracking-wider">
                      Parked Duration
                    </span>
                    <span className="text-2xl font-black text-[#B08528] mt-0.5 block">
                      {Math.floor(retrievalResult.elapsedMinutes / 60)}h {retrievalResult.elapsedMinutes % 60}m
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-white rounded-xl border border-[#DFD1BD] space-y-1.5">
                    <span className="font-black text-[#1C1815] block uppercase text-[11px]">Vehicle Information:</span>
                    <div className="text-[#706254]">
                      Make / Model: <strong className="text-[#1C1815]">{retrievalResult.make || "Standard"} {retrievalResult.model || "Two-Wheeler"}</strong>
                    </div>
                    <div className="text-[#706254] capitalize">
                      Type: <strong className="text-[#1C1815]">{retrievalResult.vehicleType?.replace("_", " ")}</strong>
                    </div>
                    <div className="text-[#706254]">
                      Rider: <strong className="text-[#1C1815]">{retrievalResult.riderName}</strong> ({retrievalResult.riderPhone || "No phone"})
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-[#DFD1BD] space-y-1.5">
                    <span className="font-black text-[#1C1815] block uppercase text-[11px]">Payment &amp; Timing:</span>
                    <div className="text-[#706254]">
                      Entry Time: <strong className="text-[#1C1815]">{new Date(retrievalResult.entryTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}</strong>
                    </div>
                    <div className="text-[#706254]">
                      Hourly Rate: <strong className="text-[#1C1815]">₹{lot.hourlyRate || 10} / hr</strong>
                    </div>
                    <div className="text-[#1C1815] font-black pt-0.5">
                      Current Accrued Fee: <span className="text-[#B08528] text-base font-mono">₹{retrievalResult.currentFee}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleCheckOut(retrievalResult.registrationNumber)}
                    className="px-5 py-2.5 bg-[#BA2D2D] hover:bg-[#9E2424] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Proceed to Exit &amp; Collect ₹{retrievalResult.currentFee}</span>
                  </button>
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
                <div key={z.zone} className="bg-white p-5 rounded-2xl border border-[#E2D9CC] shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-[#1C1815]">{z.zone}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#FAF6EE] border border-[#DFD1BD] text-[#706254]">
                      {occupancyPct}% full
                    </span>
                  </div>

                  <div className="w-full bg-[#EFE9DF] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        occupancyPct > 85 ? "bg-[#BA2D2D]" : occupancyPct > 60 ? "bg-[#D97706]" : "bg-[#176B5B]"
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 text-center text-xs pt-1 border-t border-[#EFE9DF]">
                    <div>
                      <span className="text-[10px] text-[#706254] uppercase font-bold block">Vacant</span>
                      <span className="font-black text-[#176B5B] text-sm">{z.available}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#706254] uppercase font-bold block">Parked</span>
                      <span className="font-black text-[#BA2D2D] text-sm">{z.occupied}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#706254] uppercase font-bold block">Total</span>
                      <span className="font-black text-[#1C1815] text-sm">{z.total}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Interactive Slot Grid */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2D9CC] shadow-xs space-y-4">
            <div className="border-b border-[#EFE9DF] pb-3">
              <h3 className="text-base font-black text-[#1C1815]">
                Facility Slot Occupancy Grid
              </h3>
              <p className="text-[11px] text-[#706254]">
                Real-time visual map of all two-wheeler parking slots across zones.
              </p>
            </div>

            <SlotGrid zones={zonesForGrid} disabled={true} />
          </div>
        </div>
      )}

      {/* TAB 4: PARKED VEHICLES ATTENDANCE LIST (Module 2 Occupancy) */}
      {activeTab === "vehicles" && (
        <div className="bg-white rounded-2xl border border-[#E2D9CC] shadow-xs overflow-hidden space-y-0">
          <div className="p-4 border-b border-[#EFE9DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF6EE]">
            <div>
              <h3 className="text-sm font-black text-[#1C1815] flex items-center space-x-2">
                <Bike className="w-4 h-4 text-[#176B5B]" />
                <span>Vehicles Currently Parked Inside ({parkedVehicles.length})</span>
              </h3>
              <span className="text-[11px] text-[#706254]">
                Live attendance list with elapsed parking duration and accrued fee in ₹.
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#706254] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search plate or slot..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#DFD1BD] rounded-xl focus:ring-1 focus:ring-[#176B5B] focus:border-[#176B5B] bg-[#FAF7F2] text-[#1C1815]"
              />
            </div>
          </div>

          {parkedVehicles.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#706254] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#176B5B] mx-auto" />
              <div className="font-bold text-[#1C1815]">
                Facility Currently Empty
              </div>
              <p className="text-[#706254] max-w-xs mx-auto">
                No two-wheelers are currently parked in this lot. Check in arriving vehicles using the Entrance Gate tab.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#E2D9CC] text-[#706254] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5 font-bold">Plate Number</th>
                    <th className="p-3.5 font-bold">Slot &amp; Zone</th>
                    <th className="p-3.5 font-bold">Vehicle Details</th>
                    <th className="p-3.5 font-bold">Rider</th>
                    <th className="p-3.5 font-bold">Check-In Time</th>
                    <th className="p-3.5 font-bold">Duration</th>
                    <th className="p-3.5 font-bold">Accrued Fee</th>
                    <th className="p-3.5 font-bold text-right">Departure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DF]">
                  {filteredParked.map((v) => (
                    <tr key={v.sessionId} className="hover:bg-[#FAF6EE]/50 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-black text-sm text-[#1C1815] block">
                          {v.registrationNumber}
                        </span>
                        <span className="font-mono text-[10px] text-[#706254]">
                          {v.ticketId}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-[#176B5B] bg-[#EAF3EE] px-2.5 py-0.5 rounded-md border border-[#C5DDD2]">
                          {v.zone} • {v.slotNumber}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#706254]">
                        <div className="font-bold text-[#1C1815]">{v.make} {v.model}</div>
                        <div className="text-[11px] text-[#706254] capitalize">
                          {v.vehicleType?.replace("_", " ")} {v.color ? `• ${v.color}` : ""}
                        </div>
                      </td>
                      <td className="p-3.5 text-[#706254]">
                        <div className="font-bold text-[#1C1815]">{v.riderName}</div>
                        <div className="text-[11px] text-[#706254]">{v.riderPhone}</div>
                      </td>
                      <td className="p-3.5 text-[11px] text-[#706254]">
                        {new Date(v.entryTime).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td className="p-3.5 font-bold text-[#1C1815]">
                        {Math.floor(v.elapsedMinutes / 60)}h {v.elapsedMinutes % 60}m
                      </td>
                      <td className="p-3.5 font-black text-[#B08528] text-sm font-mono">
                        ₹{v.currentFee}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleCheckOut(v.registrationNumber)}
                          className="px-3 py-1.5 bg-[#BA2D2D] hover:bg-[#9E2424] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <LogOut className="w-3 h-3 mr-1" />
                          <span>Check Out</span>
                        </button>
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
          <div className="bg-white p-6 rounded-2xl border border-[#E2D9CC] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#EFE9DF] pb-3">
              <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#1C1815]">
                  Report Incident / Violation
                </h2>
                <p className="text-[11px] text-[#706254]">
                  Log unauthorized parking, unofficial spaces, or security issues.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitIncident} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#1C1815] mb-1">
                  Violation Category *
                </label>
                <select
                  value={incidentCategory}
                  onChange={(e) => setIncidentCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFD1BD] rounded-xl focus:ring-1 focus:ring-[#176B5B] focus:border-[#176B5B] bg-[#FAF7F2] text-[#1C1815]"
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
                <label className="block font-bold text-[#1C1815] mb-1">
                  Vehicle Registration Number (Optional)
                </label>
                <input
                  type="text"
                  value={incidentReg}
                  onChange={(e) => setIncidentReg(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                  placeholder="e.g. DL01AB1234"
                  className="w-full px-3 py-2 border border-[#DFD1BD] rounded-xl font-mono uppercase bg-[#FAF7F2] text-[#1C1815] focus:ring-1 focus:ring-[#176B5B] focus:border-[#176B5B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1C1815] mb-1">
                  Incident Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  placeholder="Describe location, vehicle condition, or unauthorized behavior in detail..."
                  className="w-full px-3 py-2 border border-[#DFD1BD] rounded-xl focus:ring-1 focus:ring-[#176B5B] focus:border-[#176B5B] bg-[#FAF7F2] text-[#1C1815]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingIncident}
                className="w-full mt-2 px-4 py-2.5 bg-[#BA2D2D] hover:bg-[#9E2424] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <ShieldAlert className="w-4 h-4 mr-1.5" />
                <span>{submittingIncident ? "Logging Report..." : "Submit Violation Record"}</span>
              </button>
            </form>
          </div>

          {/* Incident Log Records */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2D9CC] shadow-xs overflow-hidden space-y-0">
            <div className="p-4 border-b border-[#EFE9DF] bg-[#FAF6EE]">
              <h3 className="text-sm font-black text-[#1C1815]">
                Facility Security &amp; Violation Records
              </h3>
              <p className="text-[11px] text-[#706254]">
                Recent incidents reported at {lot.name} reviewed by station attendants and admins.
              </p>
            </div>

            {incidents.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#706254] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#176B5B] mx-auto" />
                <div className="font-bold text-[#1C1815]">No Violations Logged</div>
                <p className="text-[#706254]">No security incidents have been reported for this lot.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#EFE9DF] max-h-[500px] overflow-y-auto">
                {incidents.map((inc) => (
                  <div key={inc._id} className="p-4 text-xs space-y-2 hover:bg-[#FAF6EE]/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-md bg-[#FAF6EE] text-[#92400E] border border-[#DFD1BD]">
                          {inc.category.replace("_", " ")}
                        </span>
                        {inc.vehicleId?.registrationNumber && (
                          <span className="font-mono font-black text-[#1C1815]">
                            {inc.vehicleId.registrationNumber}
                          </span>
                        )}
                      </div>
                      <Badge status={inc.status} text={inc.status.replace("_", " ")} />
                    </div>

                    <p className="text-[#1C1815] text-xs leading-relaxed">
                      {inc.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[#706254] pt-1">
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

      {/* Check-In Digital Boarding Pass Ticket Modal (Module 2) */}
      {newTicketSlip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-md w-full my-8">
            <button
              onClick={() => setNewTicketSlip(null)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-[#176B5B] border border-[#D4AF37] text-white flex items-center justify-center hover:bg-[#125448] transition-colors shadow-lg cursor-pointer"
              title="Close Pass"
            >
              <X className="w-4 h-4" />
            </button>
            <TicketCard
              session={{
                ...newTicketSlip,
                parkingLotId: {
                  name: lot.name,
                  address: lot.address,
                  city: lot.city || "New Delhi",
                  hourlyRate: lot.hourlyRate || 20,
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Checkout Receipt Modal (Module 2 & 3) */}
      {receiptData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-[#E2D9CC] shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#EFE9DF] pb-3">
              <h3 className="text-base font-black text-[#1C1815] flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-[#176B5B]" />
                <span>Exit Clearance Receipt</span>
              </h3>
              <span className="font-bold text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#EAF3EE] text-[#176B5B] border border-[#C5DDD2]">
                Checked Out
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#706254]">Vehicle Number:</span>
                <span className="font-mono font-black text-sm text-[#1C1815]">
                  {receiptData.registrationNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#706254]">Ticket Identifier:</span>
                <span className="font-mono font-bold text-[#1C1815]">
                  {receiptData.ticketId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#706254]">Slot Released:</span>
                <span className="font-bold text-[#176B5B] bg-[#EAF3EE] px-2 py-0.5 rounded-md border border-[#C5DDD2]">
                  {receiptData.zone} • {receiptData.slotNumber} (Available)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#706254]">Duration:</span>
                <span className="font-bold text-[#1C1815]">
                  {receiptData.durationMinutes} mins ({receiptData.billedHours} hr billed)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#706254]">Hourly Rate:</span>
                <span className="font-bold text-[#1C1815]">
                  ₹{receiptData.hourlyRate} / hr
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[#EFE9DF] font-black text-base text-[#1C1815]">
                <span>Total Fee Collected:</span>
                <span className="text-[#B08528] text-xl font-mono">₹{receiptData.totalFee}</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setReceiptData(null)}
                className="px-5 py-2.5 bg-[#176B5B] hover:bg-[#125448] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Dismiss &amp; Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
