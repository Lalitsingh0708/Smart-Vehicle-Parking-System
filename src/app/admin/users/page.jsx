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
            const lotId = a.assignedLotId?._id || a.assignedLotId || (attendantsRes.lots?.[0]?._id);
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

  const handleAttendantAction = async (attendantId, action) => {
    setProcessingId(attendantId);
    try {
      const assignedLotId = selectedLotMap[attendantId];
      const res = await fetch("/api/admin/attendants/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendantId,
          action,
          assignedLotId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      toast.success(data.message || "Attendant status updated successfully");

      // Update local attendant status
      setAttendants((prev) =>
        prev.map((att) => {
          if (att._id === attendantId) {
            const isApproved = action === "approve";
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

      // Recalculate pending
      setPendingCount((prev) => (action === "approve" ? Math.max(0, prev - 1) : prev));
    } catch (err) {
      toast.error(err.message || "Failed to update attendant");
    } finally {
      setProcessingId(null);
    }
  };

  const ridersList = users.filter((u) => u.role === "user");

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1C1815] tracking-tight">
            User Accounts &amp; Staff Verification
          </h1>
          <p className="text-xs text-[#706254] mt-0.5">
            Manage rider accounts and review booth attendant onboarding requests.
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
          <span>Booth Attendants &amp; Verification</span>
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
          Loading account records...
        </div>
      ) : activeTab === "attendants" ? (
        /* ================= ATTENDANTS MANAGEMENT TAB ================= */
        <div className="space-y-4">
          
          {/* Pending Banner Alert if any */}
          {pendingCount > 0 && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start space-x-3">
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

          {attendants.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#E2D9CC] text-center text-xs text-[#706254]">
              No attendant accounts registered yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {attendants.map((att) => {
                const isApproved =
                  att.isApprovedByAdmin === true && att.attendantApprovalStatus === "approved";
                const isPending =
                  !att.isApprovedByAdmin || att.attendantApprovalStatus === "pending";
                const isBusy = processingId === att._id;

                return (
                  <div
                    key={att._id}
                    className={`bg-white rounded-2xl border-2 p-5 transition-all shadow-xs space-y-4 ${
                      isPending ? "border-amber-300 bg-amber-50/20" : "border-[#E2D9CC]"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      {/* Attendant Info */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2.5">
                          <h3 className="font-black text-[#1C1815] text-base">
                            {att.name}
                          </h3>
                          {isApproved ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-[#EAF3EE] text-[#176B5B] border border-[#BCE0D2]">
                              <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                              <span>Approved &amp; Onboarded</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3 h-3 stroke-[2.5]" />
                              <span>Under Admin Review</span>
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
                            <span>{att.phoneNumber || "No phone"}</span>
                          </span>
                          <span className="text-[11px] text-[#A09383]">
                            Requested: {new Date(att.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Facility Assignment Selector */}
                      <div className="flex items-center space-x-2 self-start md:self-auto">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-[#8C7E72]">
                            Assigned Parking Facility
                          </label>
                          <select
                            value={selectedLotMap[att._id] || ""}
                            onChange={(e) =>
                              setSelectedLotMap((prev) => ({
                                ...prev,
                                [att._id]: e.target.value,
                              }))
                            }
                            className="bg-[#FAF7F2] border border-[#D8CCBD] text-xs font-bold text-[#1C1815] px-3 py-1.5 rounded-xl focus:outline-none focus:border-[#176B5B]"
                          >
                            {lots.map((l) => (
                              <option key={l._id} value={l._id}>
                                {l.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 flex items-center space-x-2">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleAttendantAction(att._id, "approve")}
                                className="py-2 px-3.5 bg-[#176B5B] hover:bg-[#125448] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>{isBusy ? "Saving..." : "Approve & Onboard"}</span>
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
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleAttendantAction(att._id, "revoke")}
                              className="py-2 px-3 bg-[#FAF7F2] hover:bg-amber-50 text-[#706254] hover:text-amber-800 border border-[#D8CCBD] hover:border-amber-300 font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                            >
                              <Ban className="w-3.5 h-3.5 stroke-[2.2]" />
                              <span>{isBusy ? "Saving..." : "Suspend Access"}</span>
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
      ) : (
        /* ================= REGISTERED RIDERS TAB ================= */
        <div className="bg-white rounded-2xl border border-[#E2D9CC] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#E2D9CC] text-[#706254] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 font-bold">Rider Name</th>
                  <th className="p-3.5 font-bold">Email</th>
                  <th className="p-3.5 font-bold">Phone</th>
                  <th className="p-3.5 font-bold">Vehicles</th>
                  <th className="p-3.5 font-bold">Active Sessions</th>
                  <th className="p-3.5 font-bold">Completed Sessions</th>
                  <th className="p-3.5 font-bold">Verification</th>
                  <th className="p-3.5 font-bold">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DF]">
                {ridersList.map((u) => (
                  <tr key={u._id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                    <td className="p-3.5 font-black text-[#1C1815]">
                      {u.name}
                    </td>
                    <td className="p-3.5 text-[#706254]">
                      {u.email}
                    </td>
                    <td className="p-3.5 text-[#706254]">
                      {u.phoneNumber || "N/A"}
                    </td>
                    <td className="p-3.5 font-bold text-[#1C1815]">
                      {u.vehicleCount || 0}
                    </td>
                    <td className="p-3.5">
                      <span className={`font-black ${u.sessions?.active > 0 ? "text-[#176B5B]" : "text-[#706254]"}`}>
                        {u.sessions?.active || 0}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-[#1C1815]">
                      {u.sessions?.completed || 0}
                    </td>
                    <td className="p-3.5">
                      {u.isVerified ? (
                        <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-[#EAF3EE] text-[#176B5B] border border-[#BCE0D2]">
                          OTP Verified
                        </span>
                      ) : (
                        <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          Pending OTP
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-[#706254] text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
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
