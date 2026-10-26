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
      toast.error(err.message);
    }
  };

  const handleAllocateSlot = async () => {
    if (!currentUser) {
      toast.error("Please sign in to allocate a parking slot");
      router.push("/login");
      return;
    }

    if (!selectedSlot) {
      toast.error("Please select an available parking slot from the grid");
      return;
    }

    if (!selectedVehicleId) {
      toast.error("Please select or register a vehicle first");
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
        throw new Error(data.error || "Failed to allocate parking slot");
      }

      toast.success("Parking slot allocated! Digital ticket generated.");
      router.push("/dashboard/my-parking");
    } catch (err) {
      toast.error(err.message);
      loadLot(); // Refresh live slots in case it was occupied
      setSelectedSlot(null);
    } finally {
      setAllocating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-bg">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full p-8 flex items-center justify-center">
          <div className="text-sm font-medium text-ink-secondary">
            Loading parking lot details...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!lotData) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-bg">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-ink-primary">Parking lot not found</h2>
          <p className="text-sm text-ink-secondary">
            The requested parking lot does not exist or has been deactivated.
          </p>
          <Link href="/parking">
            <Button size="sm">Browse Parking Lots</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lotData.coordinates?.latitude},${lotData.coordinates?.longitude}`;

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="text-xs text-ink-secondary flex items-center space-x-1.5">
          <Link href="/parking" className="hover:text-brand-500">
            Parking Lots
          </Link>
          <span>/</span>
          <span className="text-ink-primary font-medium">{lotData.name}</span>
        </div>

        {/* Lot Overview Header Card */}
        <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                  Two-Wheeler Facility
                </span>
                <span className="text-xs text-ink-secondary">
                  Last updated: {new Date(lotData.updatedAt || Date.now()).toLocaleTimeString("en-IN")}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-primary tracking-tight">
                {lotData.name}
              </h1>
              <p className="text-sm text-ink-secondary flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-ink-muted flex-shrink-0" />
                <span>{lotData.address}, {lotData.city}</span>
              </p>
              {lotData.description && (
                <p className="text-xs text-ink-secondary max-w-2xl leading-relaxed pt-1">
                  {lotData.description}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3">
              <div className="text-left md:text-right">
                <span className="text-2xl font-black text-brand-600">
                  ₹{lotData.hourlyRate}
                </span>
                <span className="text-xs text-ink-secondary block">per hour</span>
              </div>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="sm" className="text-xs">
                  <Navigation className="w-3.5 h-3.5 mr-1.5 text-brand-500" />
                  <span>Get Directions</span>
                </Button>
              </a>
            </div>
          </div>

          {/* Availability Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border-subtle text-center">
            <div className="p-3 bg-surface-subtle rounded-lg">
              <span className="text-xs text-ink-secondary block">Total Capacity</span>
              <span className="text-lg font-bold text-ink-primary">
                {lotData.totalCapacity}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-xs text-emerald-800 block font-medium">Available</span>
              <span className="text-lg font-black text-emerald-700">
                {lotData.availableCount}
              </span>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-xs text-red-800 block font-medium">Occupied</span>
              <span className="text-lg font-bold text-red-700">
                {lotData.occupiedCount}
              </span>
            </div>
            <div className="p-3 bg-surface-subtle rounded-lg">
              <span className="text-xs text-ink-secondary block">Operating Hours</span>
              <span className="text-sm font-semibold text-ink-primary flex items-center justify-center space-x-1 mt-1">
                <Clock className="w-3.5 h-3.5 text-ink-muted" />
                <span>{lotData.openingHours}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Allocation Flow Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Slot Grid Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink-primary">
                  Select a Parking Slot
                </h2>
                <p className="text-xs text-ink-secondary">
                  Click on an available green slot to allocate your spot
                </p>
              </div>
              {selectedSlot && (
                <div className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
                  Selected: {selectedSlot.slotNumber}
                </div>
              )}
            </div>

            <SlotGrid
              zones={zones}
              selectedSlotId={selectedSlot?.id || selectedSlot?._id}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
            />
          </div>

          {/* Allocation Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs space-y-5 sticky top-20">
              <div className="border-b border-border-subtle pb-3">
                <h3 className="text-base font-bold text-ink-primary">
                  Allocation Summary
                </h3>
                <span className="text-xs text-ink-secondary">
                  Complete your parking reservation
                </span>
              </div>

              {/* Slot chosen */}
              <div className="p-3 bg-surface-subtle rounded-lg space-y-1">
                <span className="text-xs text-ink-secondary block">Selected Slot</span>
                {selectedSlot ? (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-brand-600">
                      {selectedSlot.slotNumber}
                    </span>
                    <Badge status="available" text="Available" />
                  </div>
                ) : (
                  <span className="text-xs font-medium text-amber-700 italic">
                    Click any green slot in the grid to proceed
                  </span>
                )}
              </div>

              {/* Vehicle selector */}
              {currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-ink-primary">
                      Select Two-Wheeler
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddVehicle(!showAddVehicle)}
                      className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{showAddVehicle ? "Cancel" : "Add Vehicle"}</span>
                    </button>
                  </div>

                  {showAddVehicle ? (
                    <form
                      onSubmit={handleCreateVehicle}
                      className="p-3 bg-surface-subtle/80 border border-border-subtle rounded-lg space-y-2 text-xs"
                    >
                      <div>
                        <label className="block text-[11px] font-medium text-ink-secondary mb-0.5">
                          Registration Number
                        </label>
                        <input
                          type="text"
                          required
                          value={newRegNumber}
                          onChange={(e) => setNewRegNumber(e.target.value.toUpperCase())}
                          placeholder="DL01AB1234"
                          className="w-full px-2.5 py-1.5 border rounded focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-ink-secondary mb-0.5">
                            Make
                          </label>
                          <input
                            type="text"
                            required
                            value={newMake}
                            onChange={(e) => setNewMake(e.target.value)}
                            placeholder="Honda"
                            className="w-full px-2.5 py-1.5 border rounded focus:ring-1 focus:ring-brand-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-ink-secondary mb-0.5">
                            Model
                          </label>
                          <input
                            type="text"
                            required
                            value={newModel}
                            onChange={(e) => setNewModel(e.target.value)}
                            placeholder="Activa 6G"
                            className="w-full px-2.5 py-1.5 border rounded focus:ring-1 focus:ring-brand-500"
                          />
                        </div>
                      </div>
                      <Button size="sm" type="submit" className="w-full text-xs mt-1">
                        Save &amp; Select Vehicle
                      </Button>
                    </form>
                  ) : vehicles.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                      No vehicles registered yet. Click &quot;Add Vehicle&quot; above to add your motorcycle or scooter.
                    </div>
                  ) : (
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-border-subtle rounded-button focus:outline-none focus:ring-1 focus:ring-brand-500 text-ink-primary"
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
                <div className="p-3 bg-surface-subtle border border-border-subtle rounded-lg text-xs space-y-2">
                  <span className="font-semibold text-ink-primary block">
                    Account Required
                  </span>
                  <p className="text-ink-secondary">
                    You must be signed in to link your vehicle and receive a digital QR ticket.
                  </p>
                  <Link href="/login" className="block">
                    <Button variant="secondary" size="sm" className="w-full text-xs">
                      Sign In to Proceed
                    </Button>
                  </Link>
                </div>
              )}

              {/* Pricing breakdown */}
              <div className="space-y-1.5 text-xs text-ink-secondary pt-2 border-t border-border-subtle">
                <div className="flex justify-between">
                  <span>Standard Hourly Rate:</span>
                  <span className="font-semibold text-ink-primary">₹{lotData.hourlyRate} / hr</span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Billing:</span>
                  <span className="font-semibold text-ink-primary">1 hour</span>
                </div>
                <div className="flex justify-between text-ink-primary font-bold pt-1 border-t border-border-subtle text-sm">
                  <span>Pay upon exit:</span>
                  <span className="text-brand-600">Calculated on checkout</span>
                </div>
              </div>

              {/* Confirm Allocation Button */}
              <Button
                size="md"
                disabled={!selectedSlot || !selectedVehicleId || allocating || !currentUser}
                onClick={handleAllocateSlot}
                className="w-full"
              >
                {allocating ? (
                  "Allocating Slot..."
                ) : (
                  <>
                    <span>Confirm &amp; Generate Ticket</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-[11px] text-ink-muted text-center leading-relaxed">
                Atomic slot reservation guarantees your space and immediately updates live lot occupancy.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
