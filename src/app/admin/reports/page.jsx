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
          <h1 className="text-2xl font-black text-[#1C1815] tracking-tight">
            Reports &amp; Data Export
          </h1>
          <p className="text-xs text-[#706254] mt-0.5">
            Generate and export parking sessions, revenue audit records, and security incident reports in CSV format.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="px-4 py-2 bg-[#176B5B] hover:bg-[#125448] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4 mr-1" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filter and Date Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2D9CC] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-[#1C1815] mb-1">
              Report Subject
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-[#DFD1BD] rounded-xl bg-[#FAF7F2] text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
            >
              <option value="sessions">Parking Sessions &amp; Revenue</option>
              <option value="incidents">Security Incidents &amp; Violations</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#1C1815] mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#DFD1BD] rounded-xl bg-[#FAF7F2] text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1C1815] mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#DFD1BD] rounded-xl bg-[#FAF7F2] text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={fetchReport}
            className="px-4 py-2 bg-[#FAF6EE] hover:bg-[#EAF3EE] text-[#176B5B] border border-[#DFD1BD] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 mr-1" />
            <span>Apply Date Filter</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {reportData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E2D9CC] shadow-xs">
            <span className="text-[11px] font-bold text-[#706254] uppercase tracking-wider block">Total Filtered Records</span>
            <span className="text-2xl font-black text-[#1C1815] block mt-1">
              {reportData.count || 0}
            </span>
          </div>

          {reportType === "sessions" && (
            <div className="bg-[#F0F8F5] p-4 rounded-2xl border border-[#C5DDD2] shadow-xs">
              <span className="text-[11px] text-[#176B5B] font-bold uppercase tracking-wider block">
                Total Accrued Revenue
              </span>
              <span className="text-2xl font-black text-[#176B5B] block mt-1 font-mono">
                ₹{reportData.totalRevenue || 0}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Data Preview Table */}
      <div className="bg-white rounded-2xl border border-[#E2D9CC] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#EFE9DF] bg-[#FAF6EE] flex justify-between items-center">
          <h3 className="text-sm font-black text-[#1C1815]">
            {reportType === "sessions" ? "Parking Sessions Preview" : "Security Incidents Preview"}
          </h3>
          <span className="text-xs text-[#706254] font-medium">
            Showing latest {reportType === "sessions" ? reportData?.sessions?.length || 0 : reportData?.incidents?.length || 0} records
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#706254]">
            Generating report preview...
          </div>
        ) : reportType === "sessions" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#E2D9CC] text-[#706254] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 font-bold">Ticket ID</th>
                  <th className="p-3.5 font-bold">Rider</th>
                  <th className="p-3.5 font-bold">Facility</th>
                  <th className="p-3.5 font-bold">Vehicle</th>
                  <th className="p-3.5 font-bold">Fee</th>
                  <th className="p-3.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DF]">
                {(reportData?.sessions || []).slice(0, 10).map((s) => (
                  <tr key={s._id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                    <td className="p-3.5 font-mono font-black text-[#1C1815]">{s.ticketId}</td>
                    <td className="p-3.5 font-bold text-[#1C1815]">{s.userId?.name || "Rider"}</td>
                    <td className="p-3.5 text-[#706254]">{s.parkingLotId?.name || "Lot"}</td>
                    <td className="p-3.5 font-mono text-[#1C1815]">{s.vehicleId?.registrationNumber || "N/A"}</td>
                    <td className="p-3.5 font-black text-[#B08528] font-mono">₹{s.fee || 0}</td>
                    <td className="p-3.5 capitalize font-bold text-[11px] text-[#176B5B]">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#E2D9CC] text-[#706254] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 font-bold">Category</th>
                  <th className="p-3.5 font-bold">Reported By</th>
                  <th className="p-3.5 font-bold">Description</th>
                  <th className="p-3.5 font-bold">Date</th>
                  <th className="p-3.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DF]">
                {(reportData?.incidents || []).slice(0, 10).map((inc) => (
                  <tr key={inc._id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                    <td className="p-3.5 font-bold capitalize text-[#1C1815]">{inc.category.replace("_", " ")}</td>
                    <td className="p-3.5 text-[#706254]">{inc.reportedBy?.name || "Rider"}</td>
                    <td className="p-3.5 max-w-xs truncate text-[#706254]">{inc.description}</td>
                    <td className="p-3.5 text-[#706254] text-[11px]">{new Date(inc.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="p-3.5 capitalize font-bold text-[11px] text-[#D97706]">{inc.status.replace("_", " ")}</td>
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
