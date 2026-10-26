"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, Plus, MapPin, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function AdminLotsPage() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLots = () => {
    fetch("/api/parking-lots")
      .then((r) => r.json())
      .then((data) => setLots(data.lots || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLots();
  }, []);

  const handleToggleActive = async (lotId, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/parking-lots/${lotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      toast.success(`Parking lot is now ${!currentStatus ? "active" : "inactive"}`);
      loadLots();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
            Manage Parking Lots
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            Configure two-wheeler bays, pricing rates in ₹, and capacity.
          </p>
        </div>

        <Link href="/admin/lots/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create Parking Lot</span>
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-ink-secondary">
          Loading parking lots...
        </div>
      ) : lots.length === 0 ? (
        <div className="bg-white p-8 rounded-card border border-border-subtle text-center space-y-3">
          <Layers className="w-8 h-8 text-ink-muted mx-auto" />
          <h2 className="text-sm font-bold text-ink-primary">
            No parking lots created yet
          </h2>
          <p className="text-xs text-ink-secondary max-w-sm mx-auto">
            Get started by adding a parking lot with designated zones and slots.
          </p>
          <Link href="/admin/lots/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Create First Lot</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-border-subtle shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/80 border-b border-border-subtle text-ink-secondary uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 font-semibold">Lot Name</th>
                  <th className="p-3.5 font-semibold">City &amp; Address</th>
                  <th className="p-3.5 font-semibold">Capacity</th>
                  <th className="p-3.5 font-semibold">Available</th>
                  <th className="p-3.5 font-semibold">Occupied</th>
                  <th className="p-3.5 font-semibold">Rate</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {lots.map((lot) => (
                  <tr key={lot.id || lot._id} className="hover:bg-surface-subtle/40 transition-colors">
                    <td className="p-3.5 font-bold text-ink-primary">
                      {lot.name}
                    </td>
                    <td className="p-3.5 text-ink-secondary">
                      <div>{lot.city}</div>
                      <div className="text-[11px] text-ink-muted truncate max-w-xs">{lot.address}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-ink-primary">
                      {lot.totalCapacity} slots
                    </td>
                    <td className="p-3.5 font-bold text-emerald-600">
                      {lot.availableCount}
                    </td>
                    <td className="p-3.5 font-bold text-red-600">
                      {lot.occupiedCount}
                    </td>
                    <td className="p-3.5 font-semibold text-ink-primary">
                      ₹{lot.hourlyRate} / hr
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleActive(lot.id || lot._id, lot.active)}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          lot.active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {lot.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <Link
                        href={`/admin/lots/${lot.id || lot._id}`}
                        className="text-brand-500 hover:text-brand-600 font-semibold"
                      >
                        Edit
                      </Link>
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
