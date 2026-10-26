"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Plus, ShieldCheck, Clock, CheckCircle, FileText } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";

export default function SecurityIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);

  // Form states
  const [category, setCategory] = useState("damage");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadIncidents = () => {
    fetch("/api/incidents")
      .then((r) => r.json())
      .then((data) => setIncidents(data.incidents || []))
      .catch((err) => console.error("Error loading incidents:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description,
          evidenceUrl: evidenceUrl || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit report");

      toast.success("Incident report submitted. Administrators have been notified.");
      setShowReportForm(false);
      setDescription("");
      setEvidenceUrl("");
      loadIncidents();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const categoryNames = {
    theft: "Suspected Vehicle Theft",
    damage: "Vehicle Damage",
    unauthorized_parking: "Unauthorized Slot Occupancy",
    blocked_access: "Blocked Aisle or Access Bay",
    helmet_theft: "Helmet / Accessory Theft",
    other: "Other Parking Issue",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
            Security &amp; Incident Reports
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            Log security concerns, vehicle scratches, or unauthorized bay obstruction for facility review.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowReportForm(!showReportForm)}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>{showReportForm ? "Cancel" : "Report an Incident"}</span>
        </Button>
      </div>

      {/* Operational Disclaimer Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-card text-xs text-amber-900 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Important Operational Notice:</span>
          <p className="text-amber-800 leading-relaxed">
            Submitting a report logs the incident in our database for administrator inspection and facility attendants. This system does not automatically detect theft or dispatch emergency police response. If you are experiencing an immediate crime in progress, please contact local emergency authorities (112) immediately.
          </p>
        </div>
      </div>

      {/* Report Form */}
      {showReportForm && (
        <div className="bg-white p-6 rounded-card border border-border-subtle shadow-sm space-y-4">
          <div className="border-b border-border-subtle pb-3">
            <h2 className="text-sm font-bold text-ink-primary">
              Submit Incident or Violation Report
            </h2>
            <p className="text-xs text-ink-secondary">
              Provide specific facts regarding the location, damage, or unauthorized vehicle.
            </p>
          </div>

          <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Incident Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 text-ink-primary"
              >
                <option value="damage">Vehicle Damage (Scratches, Dent, Broken Mirror)</option>
                <option value="theft">Suspected Vehicle Theft</option>
                <option value="helmet_theft">Helmet or Accessory Theft</option>
                <option value="unauthorized_parking">Unauthorized Vehicle in Reserved Slot</option>
                <option value="blocked_access">Blocked Bay / Aisle Obstruction</option>
                <option value="other">Other Facility Issue</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Description of Incident * (min 10 characters)
              </label>
              <textarea
                required
                rows={4}
                minLength={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, exact parking bay, slot number, or any vehicle details observed..."
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Image or Evidence URL (Optional)
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://example.com/photos/damage_evidence.jpg"
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
              />
              <span className="text-[11px] text-ink-muted block mt-0.5">
                Paste a secure public link or cloud storage URL if you have photographic evidence.
              </span>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setShowReportForm(false)}
              >
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={submitting}>
                {submitting ? "Submitting Report..." : "Submit Incident Report"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Incidents Table */}
      {loading ? (
        <div className="p-8 text-center text-xs text-ink-secondary">
          Loading reports...
        </div>
      ) : incidents.length === 0 ? (
        <div className="bg-white p-8 rounded-card border border-border-subtle text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-surface-subtle text-ink-secondary flex items-center justify-center mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-ink-primary">
            No incident reports filed
          </h2>
          <p className="text-xs text-ink-secondary max-w-sm mx-auto">
            You have not submitted any parking incidents. Any reports you file will be tracked with administrator resolution notes here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((inc) => (
            <div
              key={inc._id}
              className="bg-white p-5 rounded-card border border-border-subtle shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-ink-primary text-sm">
                    {categoryNames[inc.category] || inc.category}
                  </span>
                  <span className="text-xs text-ink-muted">
                    Report #{inc._id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-ink-secondary">
                    {new Date(inc.createdAt).toLocaleString("en-IN")}
                  </span>
                  <Badge status={inc.status} />
                </div>
              </div>

              <p className="text-xs text-ink-primary leading-relaxed whitespace-pre-wrap">
                {inc.description}
              </p>

              {inc.evidenceUrl && (
                <div className="text-xs">
                  <span className="text-ink-secondary font-medium">Evidence Reference: </span>
                  <a
                    href={inc.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 hover:text-brand-600 underline"
                  >
                    View Attached Evidence Link
                  </a>
                </div>
              )}

              {/* Admin Resolution Section */}
              {inc.resolutionNotes ? (
                <div className="mt-2 p-3 bg-brand-50/70 border border-brand-200 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-brand-900 block flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5 text-brand-600" />
                    <span>Administrator Resolution Notes:</span>
                  </span>
                  <p className="text-brand-800 leading-relaxed">
                    {inc.resolutionNotes}
                  </p>
                </div>
              ) : (
                <div className="text-[11px] text-ink-muted italic pt-1">
                  Pending administrator review. Updates and resolution notes will be posted here.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
