"use client";

import { useState, useEffect } from "react";
import { Grid, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";

export default function AdminSlotsPage() {
  const [slots, setSlots] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedLotId, setSelectedLotId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Add slot modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLotId, setAddLotId] = useState("");
  const [addZone, setAddZone] = useState("Zone A");
  const [addSlotNumber, setAddSlotNumber] = useState("");
  const [addStatus, setAddStatus] = useState("available");
  const [submittingSlot, setSubmittingSlot] = useState(false);

  const loadLots = () => {
    fetch("/api/parking-lots")
      .then((r) => r.json())
      .then((data) => {
        const lList = data.lots || [];
        setLots(lList);
        if (lList.length > 0 && !addLotId) {
          setAddLotId(lList[0].id || lList[0]._id);
        }
      });
  };

  const loadSlots = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedLotId) params.set("lotId", selectedLotId);
    if (selectedStatus) params.set("status", selectedStatus);

    fetch(`/api/admin/slots?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLots();
  }, []);

  useEffect(() => {
    loadSlots();
  }, [selectedLotId, selectedStatus]);

  const handleUpdateSlotStatus = async (slotId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;

    try {
      const res = await fetch(`/api/admin/slots/${slotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update slot status");
      }

      toast.success("Slot status updated successfully");
      loadSlots();
    } catch (err) {
      toast.error(err.message, { duration: 5000 });
      loadSlots();
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setSubmittingSlot(true);

    try {
      const res = await fetch("/api/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parkingLotId: addLotId,
          zone: addZone,
          slotNumber: addSlotNumber,
          status: addStatus,
          supportedVehicleTypes: ["motorcycle", "scooter", "electric_scooter", "moped"],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create slot");

      toast.success("Slot added successfully");
      setShowAddModal(false);
      setAddSlotNumber("");
      loadSlots();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingSlot(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
            Parking Slots Management
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            Configure numbered slot statuses. Active occupied slots cannot be marked available without session checkout.
          </p>
        </div>

        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Single Slot</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs flex flex-col sm:flex-row gap-3">
        <select
          value={selectedLotId}
          onChange={(e) => setSelectedLotId(e.target.value)}
          className="px-3 py-2 text-xs border border-border-subtle rounded-button focus:outline-none focus:ring-1 focus:ring-brand-500 text-ink-primary flex-1"
        >
          <option value="">All Parking Lots</option>
          {lots.map((l) => (
            <option key={l.id || l._id} value={l.id || l._id}>
              {l.name} ({l.city})
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs border border-border-subtle rounded-button focus:outline-none focus:ring-1 focus:ring-brand-500 text-ink-primary"
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="reserved">Reserved</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Slots Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-ink-secondary">
          Loading slots...
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-white p-8 rounded-card border border-border-subtle text-center text-xs text-ink-secondary">
          No parking slots match the selected criteria.
        </div>
      ) : (
        <div className="bg-white rounded-card border border-border-subtle shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/80 border-b border-border-subtle text-ink-secondary uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 font-semibold">Slot Number</th>
                  <th className="p-3.5 font-semibold">Zone</th>
                  <th className="p-3.5 font-semibold">Parking Lot</th>
                  <th className="p-3.5 font-semibold">Supported Types</th>
                  <th className="p-3.5 font-semibold">Current Status</th>
                  <th className="p-3.5 font-semibold text-right">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {slots.map((slot) => (
                  <tr key={slot._id} className="hover:bg-surface-subtle/40 transition-colors">
                    <td className="p-3.5 font-black text-ink-primary text-sm">
                      {slot.slotNumber}
                    </td>
                    <td className="p-3.5 font-medium text-ink-primary">
                      {slot.zone}
                    </td>
                    <td className="p-3.5 text-ink-secondary">
                      {slot.parkingLotId?.name || "N/A"}
                    </td>
                    <td className="p-3.5 text-ink-muted text-[11px]">
                      {slot.supportedVehicleTypes?.join(", ") || "All Two-Wheelers"}
                    </td>
                    <td className="p-3.5">
                      <Badge status={slot.status} />
                    </td>
                    <td className="p-3.5 text-right">
                      <select
                        value={slot.status}
                        onChange={(e) =>
                          handleUpdateSlotStatus(slot._id, e.target.value, slot.status)
                        }
                        className="px-2 py-1 border border-border-subtle rounded text-xs focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="reserved">Reserved</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-card border border-border-subtle shadow-lg p-6 space-y-4">
            <h3 className="text-base font-bold text-ink-primary">
              Add Individual Parking Slot
            </h3>

            <form onSubmit={handleCreateSlot} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Parking Lot *
                </label>
                <select
                  required
                  value={addLotId}
                  onChange={(e) => setAddLotId(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-brand-500"
                >
                  {lots.map((l) => (
                    <option key={l.id || l._id} value={l.id || l._id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Zone *
                </label>
                <input
                  type="text"
                  required
                  value={addZone}
                  onChange={(e) => setAddZone(e.target.value)}
                  placeholder="Zone A"
                  className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Slot Number *
                </label>
                <input
                  type="text"
                  required
                  value={addSlotNumber}
                  onChange={(e) => setAddSlotNumber(e.target.value)}
                  placeholder="A-17"
                  className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Initial Status
                </label>
                <select
                  value={addStatus}
                  onChange={(e) => setAddStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-1 focus:ring-brand-500"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border-subtle">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={submittingSlot}>
                  {submittingSlot ? "Adding..." : "Add Slot"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
