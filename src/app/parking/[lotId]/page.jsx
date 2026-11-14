"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SlotGrid from "@/components/parking/SlotGrid";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  MapPin,
  Clock,
  Navigation,
  Bike,
  ShieldCheck,
  AlertCircle,
  Plus,
  ArrowRight,
  CheckCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ParkingLotDetailPage() {
  const { lotId } = useParams();
  const router = useRouter();

  const [lotData, setLotData] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [allocating, setAllocating] = useState(false);

  // Quick inline vehicle add state
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newRegNumber, setNewRegNumber] = useState("");
  const [newVehicleType, setNewVehicleType] = useState("motorcycle");
  const [newMake, setNewMake] = useState("");
  const [newModel, setNewModel] = useState("");

  const loadLot = () => {
    fetch(`/api/parking-lots/${lotId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.lot) {
          setLotData(data.lot);
          setZones(data.zones || []);
        }
      })
      .catch((err) => console.error("Error loading lot:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLot();

    // Fetch user and user's vehicles
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
          fetch("/api/vehicles")
            .then((r) => r.json())
            .then((vData) => {
              const list = vData.vehicles || [];
              setVehicles(list);
              if (list.length > 0) {
                setSelectedVehicleId(list[0]._id);
              }
            });
        }
      });
  }, [lotId]);

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber: newRegNumber,
          vehicleType: newVehicleType,
          make: newMake,
          model: newModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register vehicle");

      toast.success("Vehicle registered successfully");
      setVehicles((prev) => [data.vehicle, ...prev]);
      setSelectedVehicleId(data.vehicle._id);
      setShowAddVehicle(false);
      setNewRegNumber("");
      setNewMake("");
      setNewModel("");
    } catch (err) {
      toast.error(err.message || "Failed to add vehicle");
    }
  };

  const handleAllocateSlot = async () => {
    if (!currentUser) {
      toast.error("Please sign in to allocate a parking slot");
      router.push("/login");
      return;
    }

    if (!selectedSlot) {
      toast.error("Please select an available parking bay from the grid");
      return;
    }

    if (!selectedVehicleId) {
      toast.error("Please select a two-wheeler to link with this ticket");
      return;
    }

    setAllocating(true);
    try {
      const res = await fetch("/api/parking-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parkingLotId: lotId,
          parkingSlotId: selectedSlot.id || selectedSlot._id,
          vehicleId: selectedVehicleId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to allocate slot");
      }

      toast.success("Slot allocated! Boarding ticket pass generated.");
      router.push("/dashboard/my-parking");
    } catch (err) {
      toast.error(err.message || "Failed to complete allocation");
      loadLot(); // Refresh to catch updated occupancy
    } finally {
      setAllocating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F0E8] text-[#1E1B18]">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full p-8 flex items-center justify-center">
          <div className="text-sm font-bold text-[#66584B] flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#176B5B] animate-ping" />
            <span>Loading campus parking facility details...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!lotData) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F0E8] text-[#1E1B18]">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <h2 className="text-xl font-black text-[#1C1815]">Parking facility not found</h2>
          <p className="text-sm font-semibold text-[#66584B]">
            The requested parking lot does not exist or has been archived.
          </p>
          <Link href="/parking">
            <Button size="sm" className="bg-[#176B5B] hover:bg-[#125448]">Browse Campus Lots</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lotData.coordinates?.latitude},${lotData.coordinates?.longitude}&travelmode=two-wheeler`;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0E8] text-[#1E1B18]">
      {/* Universal Luxury Navbar */}
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="text-xs font-bold text-[#7A6C5F] flex items-center space-x-2">
          <Link href="/parking" className="hover:text-[#176B5B] transition-colors">
            Parking Lots
          </Link>
          <span>/</span>
          <span className="text-[#176B5B] font-black">{lotData.name}</span>
        </div>

        {/* ═════════════════════════════════════════════════════════
            1. LUXURY LOT OVERVIEW HERO CARD (Beige, Forest Green, Gold)
        ═════════════════════════════════════════════════════════ */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border-2 border-[#E2D9CC] shadow-[0_12px_36px_-6px_rgba(60,45,30,0.08)]">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2.5">
              {/* Luxury Tags & Status */}
              <div className="flex items-center flex-wrap gap-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-[#916E28] bg-[#FAF3E8] border border-[#E0D0B5] px-3 py-1 rounded-lg">
                  Two-Wheeler Campus Facility
                </span>
                <span className="text-xs font-semibold text-[#7A6C5F]">
                  Last audited: {new Date(lotData.updatedAt || Date.now()).toLocaleTimeString("en-IN")}
                </span>
              </div>

              {/* Title & Location */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1C1815] tracking-tight">
                {lotData.name}
              </h1>
              <p className="text-sm font-semibold text-[#5C5046] flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-[#176B5B] flex-shrink-0" />
                <span>{lotData.address}, {lotData.city}</span>
              </p>
              {lotData.description && (
                <p className="text-xs font-medium text-[#706254] max-w-2xl leading-relaxed pt-1">
                  {lotData.description}
                </p>
              )}
            </div>

            {/* Rate & Directions */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
              <div className="text-left md:text-right bg-[#FAF6EE] p-3 rounded-xl border border-[#E5DACB]">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-[#B08528] tracking-tight">
                    ₹{lotData.hourlyRate}
                  </span>
                  <span className="text-xs font-bold text-[#7A6C5F]">/ hour</span>
                </div>
                <span className="text-[11px] font-semibold text-[#916E28] block">Standard Campus Tariff</span>
              </div>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button
                  type="button"
                  className="px-4 py-2 bg-[#FAF6EE] hover:bg-[#EFE7D8] text-[#176B5B] border-2 border-[#D9C49D] text-xs font-black rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#176B5B]" />
                  <span>Get Turn-by-Turn GPS</span>
                  <ExternalLink className="w-3 h-3 text-[#916E28]" />
                </button>
              </a>
            </div>
          </div>

          {/* Availability Metrics Strip (Refined Ivory, Gold & Forest Green) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t-2 border-[#EFE9DF] text-center">
            {/* Total Capacity */}
            <div className="p-3.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl">
              <span className="text-xs font-bold text-[#7A6C5F] block uppercase tracking-wider">Total Capacity</span>
              <span className="text-xl font-black text-[#1C1815] mt-0.5 block">
                {lotData.totalCapacity} Bays
              </span>
            </div>

            {/* Available Vacant */}
            <div className="p-3.5 bg-[#F0F8F5] border-2 border-[#A3D9C9] rounded-xl shadow-xs">
              <span className="text-xs font-black text-[#176B5B] block uppercase tracking-wider">Available Bays</span>
              <span className="text-2xl font-black text-[#176B5B] mt-0.5 block">
                {lotData.availableCount}
              </span>
            </div>

            {/* Occupied */}
            <div className="p-3.5 bg-[#FFF5F5] border-2 border-[#FBC4C4] rounded-xl">
              <span className="text-xs font-black text-[#C53030] block uppercase tracking-wider">Occupied</span>
              <span className="text-xl font-black text-[#C53030] mt-0.5 block">
                {lotData.occupiedCount}
              </span>
            </div>

            {/* Operating Hours */}
            <div className="p-3.5 bg-[#FAF6EE] border border-[#E5DACB] rounded-xl">
              <span className="text-xs font-bold text-[#7A6C5F] block uppercase tracking-wider">Operating Hours</span>
              <span className="text-xs font-black text-[#1C1815] flex items-center justify-center space-x-1 mt-1.5">
                <Clock className="w-3.5 h-3.5 text-[#916E28]" />
                <span>{lotData.openingHours}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════
            2. ALLOCATION FLOW SECTION (Grid & Summary Dock)
        ═════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Slot Matrix Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between bg-[#FFFFFF] p-4 rounded-xl border border-[#E2D9CC] shadow-xs">
              <div>
                <h2 className="text-base font-black text-[#1C1815] tracking-tight">
                  Select a Parking Bay
                </h2>
                <p className="text-xs font-semibold text-[#66584B]">
                  Click on an available green slot to allocate your spot in real time
                </p>
              </div>

              {selectedSlot ? (
                <div className="text-xs font-black text-[#176B5B] bg-[#FAF3E8] px-3.5 py-1.5 rounded-lg border-2 border-[#D4AF37] shadow-xs">
                  Bay Chosen: {selectedSlot.slotNumber}
                </div>
              ) : (
                <div className="text-xs font-bold text-[#916E28] bg-[#FAF6EE] px-3 py-1 rounded-lg border border-[#E0D0B5]">
                  Select Bay Below
                </div>
              )}
            </div>

            {/* 2D Architectural Slot Grid Component */}
            <SlotGrid
              zones={zones}
              selectedSlotId={selectedSlot?.id || selectedSlot?._id}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
            />
          </div>

          {/* Allocation Sidebar: Luxury Reservation Dock */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border-2 border-[#E2D9CC] shadow-[0_12px_36px_-6px_rgba(60,45,30,0.08)] space-y-5">
              
              {/* Header with Golden Accent */}
              <div className="border-b-2 border-[#EFE9DF] pb-3.5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#1C1815] tracking-tight">
                    Allocation Summary
                  </h3>
                  <span className="text-xs font-semibold text-[#7A6C5F]">
                    Confirmed Two-Wheeler Reservation
                  </span>
                </div>
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </div>

              {/* Slot chosen preview box */}
              <div className="p-4 bg-[#FAF6EE] rounded-xl border-2 border-[#DFD1BD] space-y-1 shadow-xs">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#7A6C5F] block">
                  Designated Bay
                </span>
                {selectedSlot ? (
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-2xl font-black text-[#176B5B]">
                      Bay {selectedSlot.slotNumber}
                    </span>
                    <span className="text-xs font-black text-[#176B5B] bg-[#E3F4ED] border border-[#176B5B] px-2.5 py-0.5 rounded-md">
                      Available (Free)
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-[#A87922] italic block pt-1">
                    Click any green demarcated bay in the floor plan to proceed
                  </span>
                )}
              </div>

              {/* Two-Wheeler Vehicle Selector */}
              {currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-[#2A231E]">
                      Select Two-Wheeler
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddVehicle(!showAddVehicle)}
                      className="text-xs font-black text-[#176B5B] hover:text-[#115245] flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showAddVehicle ? "Cancel" : "Add Vehicle"}</span>
                    </button>
                  </div>

                  {showAddVehicle ? (
                    <form
                      onSubmit={handleCreateVehicle}
                      className="p-3.5 bg-[#FAF6EE] border-2 border-[#DFD1BD] rounded-xl space-y-2.5 text-xs"
                    >
                      <div>
                        <label className="block text-[11px] font-black text-[#2A231E] uppercase mb-0.5">
                          Registration Number
                        </label>
                        <input
                          type="text"
                          required
                          value={newRegNumber}
                          onChange={(e) => setNewRegNumber(e.target.value.toUpperCase())}
                          placeholder="PB08AB1234"
                          className="w-full px-3 py-2 bg-white text-[#1C1815] font-bold border-2 border-[#D8CFC2] rounded-lg focus:border-[#176B5B]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-black text-[#2A231E] uppercase mb-0.5">
                            Make
                          </label>
                          <input
                            type="text"
                            required
                            value={newMake}
                            onChange={(e) => setNewMake(e.target.value)}
                            placeholder="Royal Enfield / Honda"
                            className="w-full px-2.5 py-1.5 bg-white text-[#1C1815] font-bold border-2 border-[#D8CFC2] rounded-lg focus:border-[#176B5B]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-[#2A231E] uppercase mb-0.5">
                            Model
                          </label>
                          <input
                            type="text"
                            required
                            value={newModel}
                            onChange={(e) => setNewModel(e.target.value)}
                            placeholder="Classic 350 / Activa"
                            className="w-full px-2.5 py-1.5 bg-white text-[#1C1815] font-bold border-2 border-[#D8CFC2] rounded-lg focus:border-[#176B5B]"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-[#176B5B] hover:bg-[#115245] text-white font-bold text-xs rounded-lg shadow-xs mt-1 cursor-pointer"
                      >
                        Save &amp; Select Vehicle
                      </button>
                    </form>
                  ) : vehicles.length === 0 ? (
                    <div className="p-3 bg-[#FAF3E8] border-2 border-[#E0D0B5] rounded-xl text-xs font-semibold text-[#8C6B28]">
                      No vehicles registered yet. Click &quot;Add Vehicle&quot; above to link your motorcycle or scooter.
                    </div>
                  ) : (
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] text-[#1C1815] font-bold text-xs border-2 border-[#D8CFC2] rounded-xl focus:outline-none focus:border-[#176B5B] focus:bg-white"
                    >
                      {vehicles.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.registrationNumber} ({v.make} {v.model})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="p-3.5 bg-[#FAF6EE] border-2 border-[#DFD1BD] rounded-xl text-xs space-y-2">
                  <span className="font-black text-[#1C1815] block">
                    Account Required
                  </span>
                  <p className="font-semibold text-[#66584B]">
                    Please sign in to link your two-wheeler and receive your digital ticket pass.
                  </p>
                  <Link href="/login" className="block pt-1">
                    <button
                      type="button"
                      className="w-full py-2 bg-[#FAF3E8] hover:bg-[#EFE5D5] text-[#176B5B] border border-[#D9C49D] font-black text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Sign In to Proceed &rarr;
                    </button>
                  </Link>
                </div>
              )}

              {/* Pricing breakdown (Golden & Forest Green Accents) */}
              <div className="space-y-2 text-xs font-semibold text-[#66584B] pt-2 border-t-2 border-[#EFE9DF]">
                <div className="flex justify-between">
                  <span>Standard Hourly Rate:</span>
                  <span className="font-black text-[#1C1815]">₹{lotData.hourlyRate} / hr</span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Billing:</span>
                  <span className="font-black text-[#1C1815]">1 hour</span>
                </div>
                <div className="flex justify-between text-[#1C1815] font-black pt-1.5 border-t border-[#EFE9DF] text-sm">
                  <span>Pay Upon Exit:</span>
                  <span className="text-[#B08528] font-black">Calculated on checkout</span>
                </div>
              </div>

              {/* Peak Rush Administrative Notice */}
              {lotData.allowCheckIn === false && (
                <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl text-xs text-red-900 space-y-1">
                  <div className="flex items-center space-x-1.5 font-black text-red-800">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Check-In Paused for Peak Rush</span>
                  </div>
                  <p className="text-[11px] font-semibold text-red-700 leading-snug">
                    New bay allocations are temporarily paused by administration. Check-outs remain active.
                  </p>
                </div>
              )}

              {/* Confirm Allocation Button: Ultra-Luxury Forest Green with Gold Trim */}
              <button
                type="button"
                disabled={!selectedSlot || !selectedVehicleId || allocating || !currentUser || lotData.allowCheckIn === false}
                onClick={handleAllocateSlot}
                className="w-full py-3.5 px-4 bg-[#176B5B] hover:bg-[#10473C] text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg border-2 border-[#D4AF37]/50 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {lotData.allowCheckIn === false ? (
                  "Check-in Paused (Peak Rush)"
                ) : allocating ? (
                  <span>Allocating Bay...</span>
                ) : (
                  <>
                    <span>Confirm &amp; Generate Ticket</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              <p className="text-[11px] font-medium text-[#7A6C5F] text-center leading-relaxed">
                Atomic slot reservation guarantees your space and immediately updates campus bay occupancy.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
