"use client";

import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import { Clock, Search, Bike, MapPin } from "lucide-react";

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadSessions = () => {
    setLoading(true);
    fetch("/api/admin/reports?type=sessions")
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const filteredSessions = sessions.filter((s) => {
    if (statusFilter && s.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTicket = s.ticketId?.toLowerCase().includes(q);
      const matchUser = s.userId?.name?.toLowerCase().includes(q);
      const matchReg = s.vehicleId?.registrationNumber?.toLowerCase().includes(q);
      return matchTicket || matchUser || matchReg;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1C1815] tracking-tight">
            Manage Parking Sessions
          </h1>
          <p className="text-xs text-[#706254] mt-0.5">
            Audit live entries, checkout receipts, and ticket identifiers.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2D9CC] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#706254] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticket ID, rider name, or vehicle number..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#DFD1BD] rounded-xl bg-[#FAF7F2] text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-[#DFD1BD] rounded-xl bg-[#FAF7F2] text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
        >
          <option value="">All Session Statuses</option>
          <option value="active">Active Only</option>
          <option value="completed">Completed Only</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#706254]">
          Loading parking sessions...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-[#E2D9CC] text-center text-xs text-[#706254]">
          No parking sessions recorded matching your query.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2D9CC] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#E2D9CC] text-[#706254] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 font-bold">Ticket ID</th>
                  <th className="p-3.5 font-bold">Rider</th>
                  <th className="p-3.5 font-bold">Vehicle</th>
                  <th className="p-3.5 font-bold">Facility &amp; Slot</th>
                  <th className="p-3.5 font-bold">Entry Time</th>
                  <th className="p-3.5 font-bold">Exit Time</th>
                  <th className="p-3.5 font-bold">Fee</th>
                  <th className="p-3.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DF]">
                {filteredSessions.map((s) => (
                  <tr key={s._id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                    <td className="p-3.5 font-mono font-black text-[#1C1815]">
                      {s.ticketId}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-[#1C1815] block">
                        {s.userId?.name || "Rider"}
                      </span>
                      <span className="text-[11px] text-[#706254]">{s.userId?.email}</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-[#1C1815]">
                      {s.vehicleId?.registrationNumber || "N/A"}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-[#1C1815] block">
                        {s.parkingLotId?.name}
                      </span>
                      <span className="text-[11px] text-[#176B5B] font-bold">
                        {s.parkingSlotId?.zone} • {s.parkingSlotId?.slotNumber}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px] text-[#706254]">
                      {new Date(s.entryTime).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                    <td className="p-3.5 text-[11px] text-[#706254]">
                      {s.exitTime
                        ? new Date(s.exitTime).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "short",
                          })
                        : "Parked (In Progress)"}
                    </td>
                    <td className="p-3.5 font-black text-[#B08528] font-mono text-sm">
                      ₹{s.fee || 0}
                    </td>
                    <td className="p-3.5">
                      <Badge status={s.status} />
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
