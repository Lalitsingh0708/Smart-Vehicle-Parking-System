"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, Plus, MapPin, Edit, ToggleLeft, ToggleRight, Users, ChevronRight } from "lucide-react";
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
        <div className="bg-white rounded-2xl border border-[#E2D9CC] shadow-xs overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead className="bg-[#FAF7F2] border-b border-[#E2D9CC] text-[#706254] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Facility &amp; Location</th>
                  <th className="py-3.5 px-3 font-bold text-center">Bays Capacity</th>
                  <th className="py-3.5 px-3 font-bold text-center">Live Availability</th>
                  <th className="py-3.5 px-3 font-bold text-center">Pricing</th>
                  <th className="py-3.5 px-3 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DF]">
                {lots.map((lot) => (
                  <tr key={lot.id || lot._id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1C1815] text-sm">
                        {lot.name}
                      </div>
                      <div className="text-[11px] text-[#706254] flex items-center gap-1 mt-0.5 truncate max-w-sm">
                        <MapPin className="w-3 h-3 text-[#176B5B] shrink-0" />
                        <span>{lot.city} · {lot.address}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold text-[#1C1815] block">
                        {lot.totalCapacity} bays
                      </span>
                      <span className="text-[10px] text-[#706254]">Total capacity</span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 justify-center">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                          {lot.availableCount} Free
                        </span>
                        {lot.occupiedCount > 0 ? (
                          <span className="font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-xs">
                            {lot.occupiedCount} Occupied
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#706254] bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                            0 Occupied
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold text-[#176B5B] text-xs bg-[#EAF3EE] px-2.5 py-1 rounded-lg border border-[#C5DDD2] whitespace-nowrap">
                        {lot.hourlyRate ? `₹${lot.hourlyRate}/hr` : "Free Parking"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(lot.id || lot._id, lot.active)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider cursor-pointer border transition-colors ${
                          lot.active
                            ? "bg-[#EAF3EE] text-[#176B5B] border-[#C5DDD2] hover:bg-[#d5ece1]"
                            : "bg-[#FAF6EE] text-[#706254] border-[#DFD1BD] hover:bg-[#f0e7d5]"
                        }`}
                      >
                        {lot.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/lots/${lot.id || lot._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#176B5B] text-[#1C1815] hover:text-white border border-[#DFD1BD] rounded-xl text-xs font-bold transition-all shadow-xs group"
                      >
                        <Users className="w-3.5 h-3.5 text-[#176B5B] group-hover:text-white" />
                        <span>Users &amp; Details</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
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
