"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Building,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Send,
  Calendar,
  Layers,
  ArrowRight,
  AlertCircle,
  Bike,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminManageAttendantsPage() {
  const [attendants, setAttendants] = useState([]);
  const [lots, setLots] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "pending" | "approved" | "rejected"
  const [processingId, setProcessingId] = useState(null);
  const [selectedLotMap, setSelectedLotMap] = useState({});
  const [dutyNotesMap, setDutyNotesMap] = useState({});

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/attendants")
      .then((r) => r.json())
      .then((data) => {
        if (data.attendants) {
          setAttendants(data.attendants);
          setLots(data.lots || []);
          setPendingCount(data.pendingCount || 0);

          // Populate default assigned lot selections
          const map = {};
          const notes = {};
          data.attendants.forEach((a) => {
            const lotId = a.assignedLotId?._id || a.assignedLotId || data.lots?.[0]?._id;
            if (lotId) map[a._id] = lotId.toString();
            notes[a._id] = a.approvalNotes || "";
          });
          setSelectedLotMap(map);
          setDutyNotesMap(notes);
        }
      })
      .catch((err) => {
        console.error("Error loading attendants:", err);
        toast.error("Failed to load attendant records");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAttendantAction = async (attendantId, action, targetLotId = null) => {
    setProcessingId(attendantId);
    try {
      const assignedLotId = targetLotId || selectedLotMap[attendantId];
      const notes = dutyNotesMap[attendantId] || "Please report on duty on time and oversee vehicle operations.";

      const res = await fetch("/api/admin/attendants/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendantId,
          action,
          assignedLotId,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      toast.success(data.message || "Duty updated successfully!");

      // Refresh list to update UI state
      loadData();
    } catch (err) {
      toast.error(err.message || "Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredAttendants = attendants.filter((a) => {
    // Status filter
    if (statusFilter === "pending") {
      if (a.isApprovedByAdmin && a.attendantApprovalStatus === "approved") return false;
    } else if (statusFilter === "approved") {
      if (!a.isApprovedByAdmin || a.attendantApprovalStatus !== "approved") return false;
    } else if (statusFilter === "rejected") {
      if (a.attendantApprovalStatus !== "rejected") return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = a.name?.toLowerCase().includes(q);
      const matchEmail = a.email?.toLowerCase().includes(q);
      const matchPhone = a.phoneNumber?.toLowerCase().includes(q);
      const matchLot = a.assignedLotId?.name?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchLot;
    }
    return true;
  });

  const totalCount = attendants.length;
  const approvedCount = attendants.filter(
    (a) => a.isApprovedByAdmin && a.attendantApprovalStatus === "approved"
  ).length;

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2D9CC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#176B5B] bg-[#EAF3EE] px-2.5 py-0.5 rounded-lg border border-[#C5DDD2]">
              Administrative Staffing
            </span>
            {pendingCount > 0 && (
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300 animate-pulse">
                {pendingCount} Awaiting Review
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1815] tracking-tight mt-1.5">
            Manage Parking Attendants
          </h1>
          <p className="text-xs text-[#706254] mt-0.5">
            Review attendant registrations, assign designated parking facilities (Booths), and oversee gate staff permissions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#176B5B] bg-white border border-[#DFD1BD] rounded-xl hover:bg-[#FAF6EE] transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Roster</span>
          </button>

          <Link href="/attendant">
            <button
              type="button"
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#176B5B] hover:bg-[#125448] border border-[#176B5B] rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Bike className="w-4 h-4 text-[#D4AF37]" />
              <span>Attendant Booth View</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ─── Metric Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#E2D9CC] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#706254] uppercase tracking-wider">
              Total Attendants
            </span>
            <UserCheck className="w-4 h-4 text-[#176B5B]" />
          </div>
          <span className="text-2xl font-black text-[#1C1815] block mt-2">
            {totalCount}
          </span>
          <span className="text-[11px] font-semibold text-[#8C7E72] block mt-0.5">
            staff profiles
          </span>
        </div>

        <div className="bg-[#FFFBEB] p-4 rounded-2xl border-2 border-amber-300 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider">
              Under Review
            </span>
            <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
          </div>
          <span className="text-2xl font-black text-amber-900 block mt-2">
            {pendingCount}
          </span>
          <span className="text-[11px] font-bold text-amber-800 block mt-0.5">
            awaiting admin approval
          </span>
        </div>

        <div className="bg-[#EAF5F2] p-4 rounded-2xl border-2 border-[#176B5B]/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#176B5B] uppercase tracking-wider">
              Active on Duty
            </span>
            <ShieldCheck className="w-4 h-4 text-[#176B5B]" />
          </div>
          <span className="text-2xl font-black text-[#176B5B] block mt-2">
            {approvedCount}
          </span>
          <span className="text-[11px] font-semibold text-[#125448] block mt-0.5">
            booth access granted
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2D9CC] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#706254] uppercase tracking-wider">
              Campus Facilities
            </span>
            <Layers className="w-4 h-4 text-[#B08528]" />
          </div>
          <span className="text-2xl font-black text-[#1C1815] block mt-2">
            {lots.length}
          </span>
          <span className="text-[11px] font-semibold text-[#8C7E72] block mt-0.5">
            parking locations
          </span>
        </div>
      </div>

      {/* ─── Filter & Search Toolbar ─── */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E2D9CC] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-[#176B5B] text-white shadow-xs"
                : "bg-[#FAF7F2] text-[#706254] hover:bg-[#EFE9DF]"
            }`}
          >
            All Staff ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            <span>Under Review</span>
            {pendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "approved"
                ? "bg-[#176B5B] text-white shadow-xs"
                : "bg-[#FAF7F2] text-[#706254] hover:bg-[#EFE9DF]"
            }`}
          >
            Active on Duty ({approvedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#8C7E72] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search attendant name, email..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#DFD1BD] rounded-xl text-[#1C1815] focus:outline-none focus:border-[#176B5B]"
          />
        </div>
      </div>

      {/* ─── Attendants List ─── */}
      {loading ? (
        <div className="p-16 text-center text-xs text-[#706254] bg-white rounded-2xl border border-[#E2D9CC]">
          <RefreshCw className="w-6 h-6 animate-spin text-[#176B5B] mx-auto mb-2" />
          <span>Loading attendant records...</span>
        </div>
      ) : filteredAttendants.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#706254] bg-white rounded-2xl border border-[#E2D9CC] space-y-2">
          <UserCheck className="w-8 h-8 text-[#A89887] mx-auto" />
          <p className="text-sm font-bold text-[#1C1815]">No attendants found</p>
          <p className="max-w-sm mx-auto text-[#706254]">
            {searchQuery
              ? "No attendant matches your current search criteria."
              : "When attendants register on the website, they will appear here under 'Under Review' until an administrator assigns them a parking facility."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAttendants.map((attendant) => {
            const isApproved =
              attendant.isApprovedByAdmin === true &&
              attendant.attendantApprovalStatus === "approved";
            const isPending =
              !attendant.isApprovedByAdmin ||
              attendant.attendantApprovalStatus === "pending";
            const isRejected = attendant.attendantApprovalStatus === "rejected";

            const currentLotId =
              selectedLotMap[attendant._id] ||
              attendant.assignedLotId?._id ||
              attendant.assignedLotId ||
              lots[0]?._id;

            const assignedLotObj =
              lots.find((l) => l._id?.toString() === attendant.assignedLotId?._id?.toString() || l._id?.toString() === attendant.assignedLotId?.toString()) ||
              attendant.assignedLotId;

            const isProcessing = processingId === attendant._id;

            return (
              <div
                key={attendant._id}
                className={`bg-white rounded-2xl border-2 transition-all p-5 shadow-xs ${
                  isPending
                    ? "border-amber-300 bg-gradient-to-r from-amber-50/40 via-white to-white"
                    : "border-[#E2D9CC] hover:border-[#176B5B]"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left: Attendant Bio */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs border ${
                        isPending
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-[#176B5B] text-white border-[#D4AF37]"
                      }`}
                    >
                      {attendant.name?.[0]?.toUpperCase() || "A"}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-[#1C1815]">
                          {attendant.name}
                        </h3>

                        {/* Status Badge */}
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            <span>Under Admin Review (Pending)</span>
                          </span>
                        ) : isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-[#EAF5F2] text-[#176B5B] border border-[#176B5B]/30">
                            <CheckCircle2 className="w-3 h-3 text-[#176B5B]" />
                            <span>Verified &amp; Assigned</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-red-100 text-red-900 border border-red-300">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#706254] flex-wrap pt-0.5">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#176B5B]" />
                          <span>{attendant.email}</span>
                        </span>
                        {attendant.phoneNumber && (
                          <span className="flex items-center gap-1.5 font-mono">
                            <Phone className="w-3.5 h-3.5 text-[#176B5B]" />
                            <span>{attendant.phoneNumber}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-[11px] text-[#8C7E72]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Registered:{" "}
                            {new Date(attendant.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </span>
                      </div>

                      {/* Current Facility Tag */}
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase text-[#8C7E72]">
                          Assigned Facility:
                        </span>
                        {assignedLotObj?.name ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF6EE] text-[#176B5B] border border-[#DFD1BD] text-xs font-black">
                            <Building className="w-3.5 h-3.5 text-[#B08528]" />
                            <span>{assignedLotObj.name}</span>
                            <span className="text-[10px] text-[#706254] font-medium">
                              ({assignedLotObj.city || "Campus"})
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            No Facility Assigned Yet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Facility Assignment & Admin Action Controls */}
                  <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DFD1BD] space-y-3 lg:w-96 shrink-0">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-[#1C1815] mb-1">
                        Select Parking Lot (Booth):
                      </label>
                      <select
                        value={currentLotId || ""}
                        onChange={(e) =>
                          setSelectedLotMap((prev) => ({
                            ...prev,
                            [attendant._id]: e.target.value,
                          }))
                        }
                        className="w-full bg-white text-xs font-bold text-[#1C1815] border border-[#DFD1BD] rounded-xl px-3 py-2 focus:outline-none focus:border-[#176B5B]"
                      >
                        {lots.map((lot) => (
                          <option key={lot._id} value={lot._id}>
                            {lot.name} &mdash; {lot.city || "Campus"} ({lot.totalCapacity} bays)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-[#1C1815] mb-1">
                        Duty Shift / Instructions:
                      </label>
                      <input
                        type="text"
                        value={dutyNotesMap[attendant._id] ?? ""}
                        onChange={(e) =>
                          setDutyNotesMap((prev) => ({
                            ...prev,
                            [attendant._id]: e.target.value,
                          }))
                        }
                        placeholder="e.g. Morning Shift 08:00 - 16:00. Radial Gate 4."
                        className="w-full bg-white text-xs text-[#1C1815] border border-[#DFD1BD] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#176B5B]"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleAttendantAction(attendant._id, "approve")}
                            className="flex-1 py-2 px-3 bg-[#176B5B] hover:bg-[#125448] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>{isProcessing ? "Processing..." : "Approve & Assign"}</span>
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleAttendantAction(attendant._id, "reject")}
                            className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      ) : isApproved ? (
                        <>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleAttendantAction(attendant._id, "reassign")}
                            className="flex-1 py-2 px-3 bg-[#176B5B] hover:bg-[#125448] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Building className="w-3.5 h-3.5" />
                            <span>{isProcessing ? "Updating..." : "Update Facility"}</span>
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleAttendantAction(attendant._id, "revoke")}
                            className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                            title="Temporarily suspend booth access and put under review"
                          >
                            Revoke
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAttendantAction(attendant._id, "approve")}
                          className="w-full py-2 px-3 bg-[#176B5B] hover:bg-[#125448] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Re-approve &amp; Assign</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
