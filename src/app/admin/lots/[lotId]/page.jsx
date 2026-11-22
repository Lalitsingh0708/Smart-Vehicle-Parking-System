"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Settings,
  Save,
  MapPin,
  Bike,
  Camera,
  AlertTriangle,
  ChevronRight,
  Search,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function AdminEditLotPage() {
  const { lotId } = useParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("users"); // "users" | "settings"
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Facility Form State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [openingHours, setOpeningHours] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [totalCapacity, setTotalCapacity] = useState(20);

  // Users in Facility State
  const [lotUsers, setLotUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadLotDetails = () => {
    fetch(`/api/parking-lots/${lotId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.lot) {
          setName(data.lot.name);
          setAddress(data.lot.address);
          setCity(data.lot.city);
          setHourlyRate(data.lot.hourlyRate);
          setOpeningHours(data.lot.openingHours || "");
          setDescription(data.lot.description || "");
          setActive(data.lot.active);
          setTotalCapacity(data.lot.totalCapacity || 20);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const loadLotUsers = () => {
    setLoadingUsers(true);
    fetch(`/api/admin/parking-lots/${lotId}/users`)
      .then((r) => r.json())
      .then((data) => {
        setLotUsers(data.users || []);
      })
      .catch((err) => {
        console.error("Error loading users for lot:", err);
      })
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => {
    loadLotDetails();
    loadLotUsers();
  }, [lotId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/parking-lots/${lotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          city,
          hourlyRate: parseFloat(hourlyRate),
          openingHours,
          description,
          active,
          totalCapacity: parseInt(totalCapacity, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update lot");

      toast.success("Parking lot updated successfully");
      loadLotDetails();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered users search
  const filteredUsers = lotUsers.filter((item) => {
    const q = searchQuery.toLowerCase();
    const uName = item.user?.name?.toLowerCase() || "";
    const uEmail = item.user?.email?.toLowerCase() || "";
    const uReg = item.recentVehicle?.registrationNumber?.toLowerCase() || "";
    const uSlot = item.activeSession?.slot?.slotNumber?.toLowerCase() || item.recentSlot?.slotNumber?.toLowerCase() || "";
    return uName.includes(q) || uEmail.includes(q) || uReg.includes(q) || uSlot.includes(q);
  });

  const activeParkedCount = lotUsers.filter((u) => Boolean(u.activeSession)).length;

  if (loading) {
    return <div className="text-xs text-[#706254] p-10 text-center">Loading parking facility details...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-[#706254]">
        <Link
          href="/admin/lots"
          className="hover:text-[#176B5B] transition-colors flex items-center space-x-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Lots</span>
        </Link>
        <span>&bull;</span>
        <span className="font-bold text-[#1C1815]">{name || "Facility"}</span>
      </div>

      {/* Facility Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2D9CC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${active ? "bg-[#176B5B]" : "bg-gray-400"}`} />
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#176B5B] font-bold">
              {active ? "OPERATIONAL FACILITY" : "INACTIVE FACILITY"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#1C1815] tracking-tight mt-1">
            {name}
          </h1>
          <p className="text-xs text-[#706254] flex items-center gap-1.5 mt-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#176B5B]" />
            <span>{address}, {city}</span>
            <span>&bull;</span>
            <span className="font-mono">Capacity: {totalCapacity} Two-Wheelers</span>
          </p>
        </div>

        {/* Quick Metric Badges */}
        <div className="flex items-center gap-2.5">
          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E2D9CC] text-center min-w-24">
            <span className="text-[10px] font-mono text-[#706254] block uppercase font-bold">
              USERS
            </span>
            <span className="text-lg font-black text-[#1C1815] font-mono block">
              {lotUsers.length}
            </span>
          </div>

          <div className="p-3 bg-[#EAF5F2] rounded-xl border border-[#176B5B]/30 text-center min-w-24">
            <span className="text-[10px] font-mono text-[#176B5B] block uppercase font-bold">
              ACTIVE PARKED
            </span>
            <span className="text-lg font-black text-[#176B5B] font-mono block">
              {activeParkedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E2D9CC] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-[#176B5B] text-white shadow-xs"
              : "text-[#706254] hover:text-[#1C1815] hover:bg-[#FAF7F2]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Parked Users &amp; Photos ({lotUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "settings"
              ? "bg-[#176B5B] text-white shadow-xs"
              : "text-[#706254] hover:text-[#1C1815] hover:bg-[#FAF7F2]"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Facility Settings &amp; Configuration</span>
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════
          TAB 1: PARKED USERS, LANDMARKS & COMPLAINTS LIST
      ═════════════════════════════════════════════════════════ */}
      {activeTab === "users" && (
        <div className="space-y-4">
          
          {/* Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E2D9CC] shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-[#706254] absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search user name, email, vehicle reg..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#DFD1BD] rounded-xl text-[#1C1815] focus:outline-none focus:ring-1 focus:ring-[#176B5B]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={loadLotUsers}
                className="p-2 rounded-xl border border-[#E2D9CC] hover:bg-[#FAF7F2] text-[#706254] hover:text-[#1C1815] transition-colors cursor-pointer"
                title="Refresh user list"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-[#706254] font-medium">
                Showing {filteredUsers.length} of {lotUsers.length} registered riders
              </span>
            </div>
          </div>

          {/* Users List Table / Cards */}
          {loadingUsers ? (
            <div className="p-12 text-center text-xs text-[#706254] bg-white rounded-2xl border border-[#E2D9CC]">
              Loading users for {name}...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#E2D9CC] space-y-2">
              <Users className="w-8 h-8 text-[#A89A8A] mx-auto" />
              <h3 className="text-sm font-black text-[#1C1815]">
                {searchQuery ? "No matching riders found" : "No users have parked in this facility yet"}
              </h3>
              <p className="text-xs text-[#706254] max-w-sm mx-auto">
                {searchQuery
                  ? "Try clearing your search query."
                  : "When riders allocate bays in this lot, their profiles, landmark photos, and activity will appear here."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2D9CC] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#E2D9CC] text-[#706254] uppercase tracking-wider text-[10.5px]">
                    <tr>
                      <th className="p-3.5 font-bold">Rider Info</th>
                      <th className="p-3.5 font-bold">Current / Recent Bay</th>
                      <th className="p-3.5 font-bold">Two-Wheeler</th>
                      <th className="p-3.5 font-bold">Landmark Photos</th>
                      <th className="p-3.5 font-bold">Complaints</th>
                      <th className="p-3.5 font-bold">Status</th>
                      <th className="p-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE3D7]">
                    {filteredUsers.map((item) => {
                      const u = item.user || {};
                      const isParked = Boolean(item.activeSession);
                      const currentSlot = item.activeSession?.slot || item.recentSlot;
                      const vehicle = item.activeSession?.vehicle || item.recentVehicle;

                      return (
                        <tr key={u._id} className="hover:bg-[#FAF7F2] transition-colors">
                          
                          {/* User Column */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#176B5B] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                                {u.name ? u.name[0].toUpperCase() : "U"}
                              </div>
                              <div>
                                <Link
                                  href={`/admin/lots/${lotId}/users/${u._id}`}
                                  className="font-black text-[#1C1815] hover:text-[#176B5B] hover:underline block leading-tight text-xs"
                                >
                                  {u.name || "Rider"}
                                </Link>
                                <span className="text-[11px] text-[#706254] block mt-0.5">
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Bay / Slot */}
                          <td className="p-3.5">
                            {currentSlot ? (
                              <div>
                                <span className="font-mono font-black text-[#176B5B] block text-xs">
                                  {currentSlot.zone || "Zone"} &bull; Bay {currentSlot.slotNumber || "Slot"}
                                </span>
                                {isParked && (
                                  <span className="text-[10px] text-[#B08528] font-bold block mt-0.5">
                                    Occupied Now
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#A89A8A] italic text-[11px]">Unassigned</span>
                            )}
                          </td>

                          {/* Vehicle */}
                          <td className="p-3.5">
                            {vehicle ? (
                              <div>
                                <span className="font-mono font-bold text-[#1C1815] block text-xs">
                                  {vehicle.registrationNumber}
                                </span>
                                <span className="text-[10.5px] text-[#706254] block">
                                  {vehicle.make} {vehicle.model}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#A89A8A] italic text-[11px]">No vehicle</span>
                            )}
                          </td>

                          {/* Landmark Photos Uploaded */}
                          <td className="p-3.5">
                            {item.landmarkPhotosCount > 0 ? (
                              <div className="flex items-center gap-2">
                                {item.recentLandmarkPhoto && (
                                  <img
                                    src={item.recentLandmarkPhoto}
                                    alt="Landmark thumbnail"
                                    className="w-8 h-8 rounded-lg object-cover border border-[#DFD1BD] shrink-0"
                                  />
                                )}
                                <div>
                                  <span className="font-mono font-black text-[#176B5B] text-xs">
                                    {item.landmarkPhotosCount} photo{item.landmarkPhotosCount > 1 ? "s" : ""}
                                  </span>
                                  {item.recentLandmarkNote && (
                                    <span className="text-[10.5px] text-[#706254] block truncate max-w-32">
                                      &ldquo;{item.recentLandmarkNote}&rdquo;
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[#A89A8A] text-[11px] italic">0 photos</span>
                            )}
                          </td>

                          {/* Complaints Filed */}
                          <td className="p-3.5">
                            {item.complaintsCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-200 text-[10.5px] font-bold font-mono">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                <span>{item.complaintsCount} reported</span>
                              </span>
                            ) : (
                              <span className="text-[#706254] text-[11px]">0 issues</span>
                            )}
                          </td>

                          {/* Occupancy Status */}
                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold uppercase ${
                              isParked
                                ? "bg-[#52FF00]/20 text-[#0A2603] border border-[#52FF00]"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isParked ? "bg-[#176B5B] animate-ping" : "bg-gray-400"}`} />
                              <span>{isParked ? "ACTIVE PARKED" : "CHECKED OUT"}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right">
                            <Link href={`/admin/lots/${lotId}/users/${u._id}`}>
                              <button
                                type="button"
                                className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#176B5B] text-[#1C1815] hover:text-white border border-[#DFD1BD] rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer group"
                              >
                                <span>Inspect Profile &amp; Photos</span>
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            </Link>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          TAB 2: FACILITY SETTINGS & EDIT
      ═════════════════════════════════════════════════════════ */}
      {activeTab === "settings" && (
        <div className="max-w-2xl bg-white p-6 rounded-2xl border border-[#E2D9CC] shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-black text-[#1C1815] tracking-tight">
              Edit Facility Parameters
            </h2>
            <p className="text-xs text-[#706254] mt-0.5">
              Update facility capacity, operating hours, tariff (₹0 for Free Campus), or active visibility.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#1C1815] mb-1">
                Parking Facility Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DFD1BD] rounded-xl text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#1C1815] mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DFD1BD] rounded-xl text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1C1815] mb-1">
                  Total Capacity (Two-Wheeler Bays)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DFD1BD] rounded-xl text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#1C1815] mb-1">
                Full Address / Campus Location
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DFD1BD] rounded-xl text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#1C1815] mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DFD1BD] rounded-xl text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1C1815] mb-1">
                  Active Status
                </label>
                <select
                  value={active ? "true" : "false"}
                  onChange={(e) => setActive(e.target.value === "true")}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DFD1BD] rounded-xl text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
                >
                  <option value="true">Active (Visible to riders)</option>
                  <option value="false">Inactive (Hidden from search)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#1C1815] mb-1">
                Tariff in ₹ (0 for Free Campus Parking)
              </label>
              <input
                type="number"
                required
                min="0"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DFD1BD] rounded-xl text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1C1815] mb-1">
                Description / Wayfinding Directions
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#DFD1BD] rounded-xl text-[#1C1815] focus:ring-1 focus:ring-[#176B5B]"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-[#EBE3D7]">
              <Button size="sm" type="submit" disabled={submitting} className="bg-[#176B5B] hover:bg-[#125448]">
                {submitting ? "Saving..." : "Save Facility Changes"}
              </Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
