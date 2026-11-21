"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  Bike,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building,
  UserCheck,
  Ban,
  Mail,
  Phone,
  ShieldAlert,
  MapPin,
  Send,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState("attendants"); // "attendants" | "riders"
  const [users, setUsers] = useState([]);
  const [attendants, setAttendants] = useState([]);
  const [lots, setLots] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedLotMap, setSelectedLotMap] = useState({});
  const [dutyNotesMap, setDutyNotesMap] = useState({});
  const [rosterAssignMap, setRosterAssignMap] = useState({});

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/attendants").then((r) => r.json()),
    ])
      .then(([usersRes, attendantsRes]) => {
        if (usersRes.users) setUsers(usersRes.users);
        if (attendantsRes.attendants) {
          setAttendants(attendantsRes.attendants);
          setLots(attendantsRes.lots || []);
          setPendingCount(attendantsRes.pendingCount || 0);

          // Populate default selected lots
          const map = {};
          attendantsRes.attendants.forEach((a) => {
            const lotId = a.assignedLotId?._id || a.assignedLotId || attendantsRes.lots?.[0]?._id;
            if (lotId) map[a._id] = lotId.toString();
          });
          setSelectedLotMap(map);
        }
      })
      .catch((err) => {
        console.error("Error loading admin users:", err);
        toast.error("Failed to load user and attendant records");
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

      toast.success(data.message || "Duty updated and notification email sent successfully!");

      // Update local attendant status & assigned lot
      setAttendants((prev) =>
        prev.map((att) => {
          if (att._id === attendantId) {
            const isApproved = action === "approve" || action === "reassign";
            const updatedLot = lots.find((l) => l._id.toString() === assignedLotId);
            return {
              ...att,
              isApprovedByAdmin: isApproved,
              attendantApprovalStatus: isApproved ? "approved" : action === "reject" ? "rejected" : "pending",
              assignedLotId: updatedLot || att.assignedLotId,
            };
          }
          return att;
        })
      );

      // Keep selectedLotMap in sync
      if (assignedLotId) {
        setSelectedLotMap((prev) => ({
          ...prev,
          [attendantId]: assignedLotId.toString(),
        }));
      }

      // Clear duty note for this attendant
      setDutyNotesMap((prev) => ({ ...prev, [attendantId]: "" }));

      // Recalculate pending
      setPendingCount((prev) => (action === "approve" ? Math.max(0, prev - 1) : prev));
    } catch (err) {
      toast.error(err.message || "Failed to update attendant");
    } finally {
      setProcessingId(null);
    }
  };

  // Helper: Find which attendant is assigned to a specific lot
  const getAttendantForLot = (lotId) => {
    return attendants.find((a) => {
      const aLotId = a.assignedLotId?._id?.toString() || a.assignedLotId?.toString();
      return aLotId === lotId.toString() && a.isApprovedByAdmin && a.attendantApprovalStatus === "approved";
    });
  };

  const ridersList = users.filter((u) => u.role === "user");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1C1815] tracking-tight">
            User Accounts &amp; Staff Duty Roster
          </h1>
          <p className="text-xs text-[#706254] mt-0.5">
            Monitor which attendant is deployed at each parking facility, assign shifts, and send instant duty notification emails.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#D8CCBD] hover:bg-[#FAF6EE] text-[#5C5046] hover:text-[#1C1815] rounded-xl text-xs font-black shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E2D9CC] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("attendants")}
          className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "attendants"
              ? "bg-[#176B5B] text-white shadow-sm"
              : "bg-white text-[#706254] hover:bg-[#FAF6EE] border border-[#E2D9CC]"
          }`}
        >
          <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
          <span>Parking Booth Attendants ({attendants.length})</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 ml-1">
              {pendingCount} Pending
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("riders")}
          className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "riders"
              ? "bg-[#176B5B] text-white shadow-sm"
              : "bg-white text-[#706254] hover:bg-[#FAF6EE] border border-[#E2D9CC]"
          }`}
        >
          <Bike className="w-4 h-4 stroke-[2.2]" />
          <span>Registered Riders ({ridersList.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E2D9CC] text-center text-xs text-[#706254]">
          Loading account records and facility duty assignments...
        </div>
      ) : activeTab === "attendants" ? (
        /* ================= ATTENDANTS MANAGEMENT TAB ================= */
        <div className="space-y-6">
          {/* Pending Banner Alert if any */}
          {pendingCount > 0 && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start space-x-3 shadow-xs">
              <ShieldAlert className="w-5 h-5 text-amber-700 stroke-[2.5] flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
                  {pendingCount} Attendant Account{pendingCount > 1 ? "s" : ""} Awaiting Admin Onboarding
                </h3>
                <p className="text-xs font-semibold text-amber-800">
                  Attendants cannot access parking bays, slots, or check-in terminals until verified and assigned to a parking facility below.
                </p>
              </div>
            </div>
          )}

          {/* FACILITY-WISE DUTY ROSTER MATRIX */}
          <div className="bg-white rounded-2xl border-2 border-[#E2D9CC] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE9DF] pb-3">
              <div>
                <h2 className="text-base font-black text-[#1C1815] flex items-center space-x-2">
                  <Building className="w-4 h-4 text-[#176B5B]" />
                  <span>Campus Parking Facility Duty Roster</span>
                </h2>
                <p className="text-xs text-[#706254] mt-0.5">
                  Real-time facility mapping: check which attendant is assigned to which parking lot. Reassign duty to immediately dispatch an official duty notification email.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#176B5B] bg-[#EAF3EE] px-3 py-1 rounded-xl border border-[#C5DDD2] shrink-0 self-start sm:self-auto">
                {lots.length} Monitored Facilities
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lots.map((lot) => {
                const assignedAttendant = getAttendantForLot(lot._id);
                const isVacant = !assignedAttendant;
                const isBusy = processingId === lot._id;

                return (
                  <div
                    key={lot._id}
                    className={`rounded-2xl border-2 p-4.5 space-y-3.5 transition-all flex flex-col justify-between ${
                      isVacant
                        ? "bg-[#FFFBEB] border-amber-300"
                        : "bg-[#FAF7F2] border-[#E2D9CC] hover:border-[#176B5B]"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-black text-sm text-[#1C1815]">
                            {lot.name}
                          </h3>
                          <p className="text-[11px] text-[#706254] flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#176B5B] shrink-0" />
                            <span className="line-clamp-1">{lot.address}</span>
                          </p>
                        </div>
                        <span className="text-[10.5px] font-bold text-[#176B5B] bg-[#EAF3EE] px-2 py-0.5 rounded border border-[#C5DDD2] shrink-0">
                          Free Campus Parking
                        </span>
                      </div>

                      {/* Assigned Staff Box */}
                      <div className="pt-2 border-t border-[#E5DACB]">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-[#8C7E72] mb-1">
                          Current Assigned Attendant:
                        </span>

                        {assignedAttendant ? (
                          <div className="bg-white p-2.5 rounded-xl border border-[#D8CCBD] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-[#1C1815]">
                                {assignedAttendant.name}
                              </span>
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider bg-[#EAF3EE] text-[#176B5B] border border-[#C5DDD2]">
                                <CheckCircle2 className="w-2.5 h-2.5 stroke-[2.5]" />
                                <span>On Duty</span>
                              </span>
                            </div>
                            <div className="text-[11px] text-[#706254] flex items-center space-x-1">
                              <Mail className="w-3 h-3 text-[#8C7E72]" />
                              <span className="truncate">{assignedAttendant.email}</span>
                            </div>
                            {assignedAttendant.phoneNumber && (
                              <div className="text-[11px] text-[#706254] flex items-center space-x-1">
                                <Phone className="w-3 h-3 text-[#8C7E72]" />
                                <span>{assignedAttendant.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-amber-100/60 p-2.5 rounded-xl border border-amber-300 text-center">
                            <span className="text-xs font-black text-amber-900 block">
                              Vacant Booth
                            </span>
                            <span className="text-[10.5px] text-amber-800 font-medium block">
                              No attendant deployed for this facility.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Shift Assignment Control for this lot */}
                    <div className="pt-2 border-t border-[#E5DACB] space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#8C7E72]">
                        Deploy / Switch Attendant:
                      </label>
                      <div className="flex items-center space-x-2">
                        <select
                          value={rosterAssignMap[lot._id] || (assignedAttendant ? assignedAttendant._id : "")}
                          onChange={(e) =>
                            setRosterAssignMap((prev) => ({
                              ...prev,
                              [lot._id]: e.target.value,
                            }))
                          }
                          className="flex-1 bg-white border border-[#D8CCBD] text-xs font-bold text-[#1C1815] px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-[#176B5B]"
                        >
                          <option value="">Select Staff...</option>
                          {attendants.map((a) => (
                            <option key={a._id} value={a._id}>
                              {a.name} ({a.email})
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          disabled={
                            isBusy ||
                            !rosterAssignMap[lot._id] ||
                            (assignedAttendant && rosterAssignMap[lot._id] === assignedAttendant._id)
                          }
                          onClick={() => {
                            const targetAttendantId = rosterAssignMap[lot._id];
                            if (targetAttendantId) {
                              handleAttendantAction(targetAttendantId, "reassign", lot._id);
                            }
                          }}
                          className="px-3 py-1.5 bg-[#176B5B] hover:bg-[#125448] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                          title="Assigns attendant to this facility and dispatches instant duty email notification"
                        >
                          <Send className="w-3 h-3" />
                          <span>Deploy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ATTENDANT PROFILES & DIRECT DUTY MANAGEMENT */}
          <div className="space-y-3">
            <h2 className="text-sm font-black text-[#1C1815] uppercase tracking-wider">
              All Registered Booth Attendants ({attendants.length})
            </h2>

            {attendants.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-[#E2D9CC] text-center text-xs text-[#706254]">
                No attendant accounts registered yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {attendants.map((att) => {
                  const isApproved =
                    att.isApprovedByAdmin === true && att.attendantApprovalStatus === "approved";
                  const isPending = !att.isApprovedByAdmin || att.attendantApprovalStatus === "pending";
                  const isBusy = processingId === att._id;
                  const currentAssignedLotId = att.assignedLotId?._id?.toString() || att.assignedLotId?.toString();
                  const selectedLotId = selectedLotMap[att._id] || currentAssignedLotId;
                  const isLotChanged = selectedLotId && selectedLotId !== currentAssignedLotId;

                  return (
                    <div
                      key={att._id}
                      className={`bg-white rounded-2xl border-2 p-5 transition-all shadow-xs space-y-4 ${
                        isPending ? "border-amber-300 bg-amber-50/20" : "border-[#E2D9CC]"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Attendant Info */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center space-x-2.5 flex-wrap">
                            <h3 className="font-black text-[#1C1815] text-base">
                              {att.name}
                            </h3>
                            {isApproved ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-[#EAF3EE] text-[#176B5B] border border-[#BCE0D2]">
                                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                                <span>Verified &amp; Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                <Clock className="w-3 h-3 stroke-[2.5]" />
                                <span>Under Admin Review</span>
                              </span>
                            )}

                            {att.assignedLotId && (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-[#FAF6EE] text-[#706254] border border-[#DFD1BD]">
                                <Building className="w-3 h-3 text-[#176B5B]" />
                                <span>Assigned to: <strong>{att.assignedLotId.name || "Facility"}</strong></span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-[#706254]">
                            <span className="flex items-center space-x-1 font-semibold">
                              <Mail className="w-3.5 h-3.5 text-[#8C7E72]" />
                              <span>{att.email}</span>
                            </span>
                            <span className="flex items-center space-x-1 font-semibold">
                              <Phone className="w-3.5 h-3.5 text-[#8C7E72]" />
                              <span>{att.phoneNumber || "No phone provided"}</span>
                            </span>
                            <span className="text-[11px] text-[#A09383]">
                              Joined: {new Date(att.createdAt).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                        </div>

                        {/* Facility Assignment Selector & Duty Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-end gap-3 shrink-0">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-[#8C7E72]">
                              Assign Parking Facility Station:
                            </label>
                            <select
                              value={selectedLotMap[att._id] || ""}
                              onChange={(e) =>
                                setSelectedLotMap((prev) => ({
                                  ...prev,
                                  [att._id]: e.target.value,
                                }))
                              }
                              className="bg-[#FAF7F2] border border-[#D8CCBD] text-xs font-bold text-[#1C1815] px-3 py-2 rounded-xl focus:outline-none focus:border-[#176B5B] w-full sm:w-56"
                            >
                              {lots.map((l) => (
                                <option key={l._id} value={l._id}>
                                  {l.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleAttendantAction(att._id, "approve")}
                                  className="py-2 px-3.5 bg-[#176B5B] hover:bg-[#125448] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                  title="Approves attendant and dispatches duty email"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>{isBusy ? "Deploying..." : "Approve & Deploy"}</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleAttendantAction(att._id, "reject")}
                                  className="py-2 px-3 bg-[#FAF7F2] hover:bg-red-50 text-[#706254] hover:text-red-700 border border-[#D8CCBD] hover:border-red-300 font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleAttendantAction(att._id, "reassign")}
                                  className={`py-2 px-3 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap ${
                                    isLotChanged
                                      ? "bg-[#176B5B] hover:bg-[#125448]"
                                      : "bg-[#2A5248] hover:bg-[#176B5B]"
                                  }`}
                                  title="Reassigns duty and sends official shift email to the attendant"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>{isBusy ? "Updating..." : isLotChanged ? "Save & Send Email" : "Notify Duty via Email"}</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleAttendantAction(att._id, "revoke")}
                                  className="py-2 px-3 bg-[#FAF7F2] hover:bg-amber-50 text-[#706254] hover:text-amber-800 border border-[#D8CCBD] hover:border-amber-300 font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                                  title="Suspends terminal booth access"
                                >
                                  <Ban className="w-3.5 h-3.5 stroke-[2.2]" />
                                  <span>{isBusy ? "..." : "Suspend"}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Optional Duty / Shift Instructions Input */}
                      <div className="pt-2 border-t border-[#EFE9DF] flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#8C7E72] shrink-0">
                          Shift Instructions (Optional):
                        </span>
                        <input
                          type="text"
                          value={dutyNotesMap[att._id] || ""}
                          onChange={(e) =>
                            setDutyNotesMap((prev) => ({
                              ...prev,
                              [att._id]: e.target.value,
                            }))
                          }
                          placeholder="e.g. Morning Shift: 07:00 AM - 03:00 PM. Please report on time for student rush."
                          className="flex-1 bg-[#FAF7F2] border border-[#D8CCBD] text-xs text-[#1C1815] px-3 py-1.5 rounded-xl focus:outline-none focus:border-[#176B5B]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= REGISTERED RIDERS TAB ================= */
        <div className="bg-white rounded-2xl border border-[#E2D9CC] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#E2D9CC] text-[#706254] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 font-bold">Rider Name</th>
                  <th className="p-3.5 font-bold">Email Address</th>
                  <th className="p-3.5 font-bold">Phone</th>
                  <th className="p-3.5 font-bold">Verification Status</th>
                  <th className="p-3.5 font-bold">Account Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DF]">
                {ridersList.map((rider) => (
                  <tr key={rider._id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                    <td className="p-3.5 font-black text-[#1C1815]">
                      {rider.name}
                    </td>
                    <td className="p-3.5 text-[#706254] font-medium">
                      {rider.email}
                    </td>
                    <td className="p-3.5 text-[#706254] font-mono">
                      {rider.phoneNumber || "N/A"}
                    </td>
                    <td className="p-3.5">
                      {rider.isVerified ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-[#EAF3EE] text-[#176B5B] border border-[#BCE0D2]">
                          <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                          <span>OTP Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          <Clock className="w-3 h-3 stroke-[2.5]" />
                          <span>Pending OTP</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-[#706254]">
                      {new Date(rider.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
