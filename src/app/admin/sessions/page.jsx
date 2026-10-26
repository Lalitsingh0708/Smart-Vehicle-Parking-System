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
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
            Manage Parking Sessions
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            Audit live entries, checkout receipts, and ticket identifiers.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticket ID, rider name, or vehicle number..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 text-ink-primary"
        >
          <option value="">All Session Statuses</option>
          <option value="active">Active Only</option>
          <option value="completed">Completed Only</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-ink-secondary">
          Loading parking sessions...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white p-8 rounded-card border border-border-subtle text-center text-xs text-ink-secondary">
          No parking sessions recorded matching your query.
        </div>
      ) : (
        <div className="bg-white rounded-card border border-border-subtle shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/80 border-b border-border-subtle text-ink-secondary uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 font-semibold">Ticket ID</th>
                  <th className="p-3.5 font-semibold">Rider</th>
                  <th className="p-3.5 font-semibold">Vehicle</th>
                  <th className="p-3.5 font-semibold">Facility &amp; Slot</th>
                  <th className="p-3.5 font-semibold">Entry Time</th>
                  <th className="p-3.5 font-semibold">Exit Time</th>
                  <th className="p-3.5 font-semibold">Fee</th>
                  <th className="p-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredSessions.map((s) => (
                  <tr key={s._id} className="hover:bg-surface-subtle/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-ink-primary">
                      {s.ticketId}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-ink-primary block">
                        {s.userId?.name || "Rider"}
                      </span>
                      <span className="text-[11px] text-ink-secondary">{s.userId?.email}</span>
                    </td>
                    <td className="p-3.5 font-mono">
                      {s.vehicleId?.registrationNumber || "N/A"}
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-ink-primary block">
                        {s.parkingLotId?.name}
                      </span>
                      <span className="text-[11px] text-brand-600 font-semibold">
                        {s.parkingSlotId?.zone} • {s.parkingSlotId?.slotNumber}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px] text-ink-secondary">
                      {new Date(s.entryTime).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                    <td className="p-3.5 text-[11px] text-ink-secondary">
                      {s.exitTime
                        ? new Date(s.exitTime).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "short",
                          })
                        : "Parked (In Progress)"}
                    </td>
                    <td className="p-3.5 font-bold text-ink-primary">
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
