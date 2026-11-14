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
          <h1 className="text-2xl font-black text-[#1C1815] tracking-tight">
            Manage Parking Lots
          </h1>
          <p className="text-xs text-[#706254] mt-0.5">
            Configure two-wheeler bays, pricing rates in ₹, and capacity.
          </p>
        </div>

        <Link href="/admin/lots/new">
          <button
            type="button"
            className="px-4 py-2 bg-[#176B5B] hover:bg-[#125448] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Create Parking Lot</span>
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#706254]">
          Loading parking lots...
        </div>
      ) : lots.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-[#E2D9CC] text-center space-y-3">
          <Layers className="w-8 h-8 text-[#706254] mx-auto" />
          <h2 className="text-sm font-black text-[#1C1815]">
            No parking lots created yet
          </h2>
          <p className="text-xs text-[#706254] max-w-sm mx-auto">
            Get started by adding a parking lot with designated zones and slots.
          </p>
          <Link href="/admin/lots/new">
            <button
              type="button"
              className="px-4 py-2 bg-[#176B5B] hover:bg-[#125448] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>Create First Lot</span>
            </button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2D9CC] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#E2D9CC] text-[#706254] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 font-bold">Lot Name</th>
                  <th className="p-3.5 font-bold">City &amp; Address</th>
                  <th className="p-3.5 font-bold">Capacity</th>
                  <th className="p-3.5 font-bold">Available</th>
                  <th className="p-3.5 font-bold">Occupied</th>
                  <th className="p-3.5 font-bold">Rate</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DF]">
                {lots.map((lot) => (
                  <tr key={lot.id || lot._id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                    <td className="p-3.5 font-black text-[#1C1815]">
                      {lot.name}
                    </td>
                    <td className="p-3.5 text-[#706254]">
                      <div className="font-bold text-[#1C1815]">{lot.city}</div>
                      <div className="text-[11px] text-[#706254] truncate max-w-xs">{lot.address}</div>
                    </td>
                    <td className="p-3.5 font-bold text-[#1C1815]">
                      {lot.totalCapacity} slots
                    </td>
                    <td className="p-3.5 font-black text-[#176B5B]">
                      {lot.availableCount}
                    </td>
                    <td className="p-3.5 font-black text-[#C53030]">
                      {lot.occupiedCount}
                    </td>
                    <td className="p-3.5 font-black text-[#B08528] font-mono">
                      ₹{lot.hourlyRate} / hr
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleActive(lot.id || lot._id, lot.active)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider cursor-pointer border ${
                          lot.active
                            ? "bg-[#EAF3EE] text-[#176B5B] border-[#C5DDD2]"
                            : "bg-[#FAF6EE] text-[#706254] border-[#DFD1BD]"
                        }`}
                      >
                        {lot.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <Link
                        href={`/admin/lots/${lot.id || lot._id}`}
                        className="text-[#176B5B] hover:text-[#125448] font-bold"
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
