"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Calendar, DollarSign, Filter } from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("sessions");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("type", reportType);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    fetch(`/api/admin/reports?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setReportData(data))
      .catch((err) => console.error("Error loading report:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleDownloadCsv = () => {
    const params = new URLSearchParams();
    params.set("type", reportType);
    params.set("format", "csv");
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    window.open(`/api/admin/reports?${params.toString()}`, "_blank");
    toast.success("CSV export initiated");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
            Reports &amp; Data Export
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            Generate and export parking sessions, revenue audit records, and security incident reports in CSV format.
          </p>
        </div>

        <Button size="sm" onClick={handleDownloadCsv}>
          <Download className="w-4 h-4 mr-1.5" />
          <span>Export to CSV</span>
        </Button>
      </div>

      {/* Filter and Date Bar */}
      <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              Report Subject
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 text-ink-primary"
            >
              <option value="sessions">Parking Sessions &amp; Revenue</option>
              <option value="incidents">Security Incidents &amp; Violations</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 text-ink-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 text-ink-primary"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button size="sm" variant="secondary" onClick={fetchReport}>
            <Filter className="w-3.5 h-3.5 mr-1" />
            <span>Apply Date Filter</span>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {reportData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs">
            <span className="text-xs text-ink-secondary block">Total Filtered Records</span>
            <span className="text-2xl font-bold text-ink-primary block mt-1">
              {reportData.count || 0}
            </span>
          </div>

          {reportType === "sessions" && (
            <div className="bg-white p-4 rounded-card border border-emerald-200 bg-emerald-50/20 shadow-xs">
              <span className="text-xs text-emerald-800 font-medium block">
                Total Accrued Revenue
              </span>
              <span className="text-2xl font-black text-emerald-700 block mt-1">
                ₹{reportData.totalRevenue || 0}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Data Preview Table */}
      <div className="bg-white rounded-card border border-border-subtle shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex justify-between items-center">
          <h3 className="text-sm font-bold text-ink-primary">
            {reportType === "sessions" ? "Parking Sessions Preview" : "Security Incidents Preview"}
          </h3>
          <span className="text-xs text-ink-secondary">
            Showing latest {reportType === "sessions" ? reportData?.sessions?.length || 0 : reportData?.incidents?.length || 0} records
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-ink-secondary">
            Generating report preview...
          </div>
        ) : reportType === "sessions" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/80 border-b border-border-subtle text-ink-secondary uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 font-semibold">Ticket ID</th>
                  <th className="p-3 font-semibold">Rider</th>
                  <th className="p-3 font-semibold">Facility</th>
                  <th className="p-3 font-semibold">Vehicle</th>
                  <th className="p-3 font-semibold">Fee</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {(reportData?.sessions || []).slice(0, 10).map((s) => (
                  <tr key={s._id} className="hover:bg-surface-subtle/40">
                    <td className="p-3 font-mono font-medium">{s.ticketId}</td>
                    <td className="p-3">{s.userId?.name || "Rider"}</td>
                    <td className="p-3">{s.parkingLotId?.name || "Lot"}</td>
                    <td className="p-3 font-mono">{s.vehicleId?.registrationNumber || "N/A"}</td>
                    <td className="p-3 font-bold">₹{s.fee || 0}</td>
                    <td className="p-3 capitalize">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/80 border-b border-border-subtle text-ink-secondary uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Reported By</th>
                  <th className="p-3 font-semibold">Description</th>
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {(reportData?.incidents || []).slice(0, 10).map((inc) => (
                  <tr key={inc._id} className="hover:bg-surface-subtle/40">
                    <td className="p-3 font-semibold capitalize">{inc.category.replace("_", " ")}</td>
                    <td className="p-3">{inc.reportedBy?.name || "Rider"}</td>
                    <td className="p-3 max-w-xs truncate">{inc.description}</td>
                    <td className="p-3 text-ink-secondary">{new Date(inc.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="p-3 capitalize">{inc.status.replace("_", " ")}</td>
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
