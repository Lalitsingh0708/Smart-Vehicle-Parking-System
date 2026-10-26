"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Clock, MapPin, Bike, Calendar, Receipt, Search } from "lucide-react";

export default function ParkingHistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetch("/api/parking-sessions")
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions || []))
      .catch((err) => console.error("Error loading history:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
            Parking History &amp; Receipts
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            View completed and previous two-wheeler parking allocations with billing breakdowns.
          </p>
        </div>

        <Link href="/dashboard/find-parking">
          <Button size="sm">
            <Search className="w-3.5 h-3.5 mr-1.5" />
            <span>Find New Parking</span>
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-ink-secondary">
          Loading parking history...
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white p-10 rounded-card border border-border-subtle text-center space-y-3">
          <Clock className="w-8 h-8 text-ink-muted mx-auto" />
          <h2 className="text-sm font-bold text-ink-primary">
            No parking history yet
          </h2>
          <p className="text-xs text-ink-secondary max-w-sm mx-auto">
            Your completed parking sessions and fee receipts will be listed here after you check out of parking slots.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-border-subtle shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/80 border-b border-border-subtle text-ink-secondary uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 font-semibold">Ticket ID</th>
                  <th className="p-3.5 font-semibold">Parking Bay</th>
                  <th className="p-3.5 font-semibold">Slot &amp; Zone</th>
                  <th className="p-3.5 font-semibold">Vehicle</th>
                  <th className="p-3.5 font-semibold">Entry / Exit</th>
                  <th className="p-3.5 font-semibold">Fee Paid</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {sessions.map((session) => {
                  const entryDate = new Date(session.entryTime);
                  const exitDate = session.exitTime ? new Date(session.exitTime) : null;

                  return (
                    <tr key={session._id} className="hover:bg-surface-subtle/40 transition-colors">
                      <td className="p-3.5 font-mono font-medium text-ink-primary">
                        {session.ticketId}
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-ink-primary block">
                          {session.parkingLotId?.name || "Lot"}
                        </span>
                        <span className="text-[11px] text-ink-secondary">
                          {session.parkingLotId?.city || "India"}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium">
                        {session.parkingSlotId?.zone} • {session.parkingSlotId?.slotNumber}
                      </td>
                      <td className="p-3.5 font-mono">
                        {session.vehicleId?.registrationNumber || "N/A"}
                      </td>
                      <td className="p-3.5 text-[11px] text-ink-secondary">
                        <div>In: {entryDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}</div>
                        {exitDate && (
                          <div>Out: {exitDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}</div>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-ink-primary">
                        ₹{session.fee || 0}
                      </td>
                      <td className="p-3.5">
                        <Badge status={session.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedSession(session)}
                          className="text-brand-500 hover:text-brand-600 font-semibold underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Itemized Receipt Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-card border border-border-subtle shadow-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
              <h3 className="text-base font-bold text-ink-primary flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-brand-500" />
                <span>Parking Session Receipt</span>
              </h3>
              <Badge status={selectedSession.status} />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-secondary">Ticket Identifier:</span>
                <span className="font-mono font-bold text-ink-primary">
                  {selectedSession.ticketId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Parking Lot:</span>
                <span className="font-medium text-ink-primary">
                  {selectedSession.parkingLotId?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Zone &amp; Slot:</span>
                <span className="font-medium text-ink-primary">
                  {selectedSession.parkingSlotId?.zone} • {selectedSession.parkingSlotId?.slotNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Vehicle:</span>
                <span className="font-mono font-medium text-ink-primary">
                  {selectedSession.vehicleId?.registrationNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Entry Time:</span>
                <span className="font-medium text-ink-primary">
                  {new Date(selectedSession.entryTime).toLocaleString("en-IN")}
                </span>
              </div>
              {selectedSession.exitTime && (
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Exit Time:</span>
                  <span className="font-medium text-ink-primary">
                    {new Date(selectedSession.exitTime).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border-subtle font-bold text-sm">
                <span>Total Fee Paid:</span>
                <span className="text-brand-600">₹{selectedSession.fee || 0}</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <Button size="sm" onClick={() => setSelectedSession(null)}>
                Close Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
