"use client";

import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { AlertTriangle, CheckCircle, Clock, ShieldCheck, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  // Review modal state
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("under_review");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [savingResolution, setSavingResolution] = useState(false);

  const loadIncidents = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/incidents?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setIncidents(data.incidents || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadIncidents();
  }, [statusFilter]);

  const handleOpenReview = (inc) => {
    setSelectedIncident(inc);
    setReviewStatus(inc.status || "under_review");
    setResolutionNotes(inc.resolutionNotes || "");
  };

  const handleSaveResolution = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;

    setSavingResolution(true);
    try {
      const res = await fetch(`/api/incidents/${selectedIncident._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewStatus,
          resolutionNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update incident");

      toast.success("Incident status and resolution notes saved");
      setSelectedIncident(null);
      loadIncidents();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingResolution(false);
    }
  };

  const categoryNames = {
    theft: "Suspected Vehicle Theft",
    damage: "Vehicle Damage",
    unauthorized_parking: "Unauthorized Slot Occupancy",
    blocked_access: "Blocked Aisle / Access Obstruction",
    helmet_theft: "Helmet / Accessory Theft",
    other: "Other Facility Issue",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1C1815] tracking-tight">
            Security &amp; Parking Violations Queue
          </h1>
          <p className="text-xs text-[#706254] mt-0.5">
            Review reported rider incidents, inspect evidence, and record resolution notes.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2D9CC] shadow-xs flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-[#DFD1BD] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#176B5B] text-[#1C1815] bg-[#FAF7F2]"
        >
          <option value="">All Incident Statuses</option>
          <option value="open">Open (Awaiting Review)</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#706254]">
          Loading incident reports...
        </div>
      ) : incidents.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-[#E2D9CC] text-center text-xs text-[#706254]">
          No security incidents recorded.
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((inc) => (
            <div
              key={inc._id}
              className="bg-white p-5 rounded-2xl border border-[#E2D9CC] shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE9DF] pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-[#1C1815] text-sm">
                      {categoryNames[inc.category] || inc.category}
                    </span>
                    <Badge status={inc.status} />
                  </div>
                  <span className="text-xs text-[#706254]">
                    Reported by {inc.reportedBy?.name || "Rider"} ({inc.reportedBy?.email})
                    {inc.reportedBy?.phoneNumber ? ` • Ph: ${inc.reportedBy.phoneNumber}` : ""}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-[#706254]">
                    {new Date(inc.createdAt).toLocaleString("en-IN")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenReview(inc)}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#176B5B] hover:text-white bg-[#EAF3EE] hover:bg-[#176B5B] border border-[#B08528] rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Review / Resolve
                  </button>
                </div>
              </div>

              <div className="text-xs text-[#1C1815] whitespace-pre-wrap leading-relaxed">
                {inc.description}
              </div>

              {inc.evidenceUrl && (
                <div className="text-xs flex items-center space-x-1.5">
                  <span className="text-[#706254] font-medium">Evidence Reference:</span>
                  <a
                    href={inc.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#176B5B] hover:underline font-bold flex items-center"
                  >
                    <span>{inc.evidenceUrl}</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}

              {inc.resolutionNotes && (
                <div className="p-3.5 bg-[#FAF6EE] border border-[#DFD1BD] rounded-xl text-xs space-y-1">
                  <span className="font-bold text-[#1C1815] block uppercase text-[10.5px]">
                    Saved Resolution Notes:
                  </span>
                  <p className="text-[#706254]">{inc.resolutionNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-[#E2D9CC] shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-[#1C1815]">
              Review &amp; Resolve Security Incident
            </h3>

            <div className="p-3.5 bg-[#FAF6EE] border border-[#DFD1BD] rounded-xl text-xs space-y-1">
              <span className="font-bold text-[#1C1815] block">
                {categoryNames[selectedIncident.category] || selectedIncident.category}
              </span>
              <p className="text-[#706254] text-[11px] leading-relaxed">
                {selectedIncident.description}
              </p>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#1C1815] mb-1">
                  Incident Status
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFD1BD] rounded-xl text-xs bg-[#FAF7F2] text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
                >
                  <option value="open">Open (Pending Inspection)</option>
                  <option value="under_review">Under Review (Attendant checking bay)</option>
                  <option value="resolved">Resolved (Issue addressed)</option>
                  <option value="rejected">Rejected (Invalid or unverified report)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1C1815] mb-1">
                  Resolution Notes for Rider * (min 5 characters)
                </label>
                <textarea
                  required
                  rows={4}
                  minLength={5}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail the actions taken, e.g. checked CCTV footage, attendant moved obstructing scooter, etc..."
                  className="w-full px-3 py-2 border border-[#DFD1BD] rounded-xl bg-[#FAF7F2] text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#EFE9DF]">
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-2 border border-[#DFD1BD] text-[#706254] hover:text-[#1C1815] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer bg-[#FAF6EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingResolution}
                  className="px-4 py-2 bg-[#176B5B] hover:bg-[#125448] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {savingResolution ? "Saving..." : "Save Resolution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
