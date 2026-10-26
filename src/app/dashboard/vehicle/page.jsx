"use client";

import { useState, useEffect } from "react";
import { Bike, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function VehicleManagementPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [regNumber, setRegNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("motorcycle");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadVehicles = () => {
    fetch("/api/vehicles")
      .then((r) => r.json())
      .then((data) => setVehicles(data.vehicles || []))
      .catch((err) => console.error("Error loading vehicles:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleRegisterVehicle = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber: regNumber,
          vehicleType,
          make,
          model,
          color,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register vehicle");

      toast.success("Two-wheeler registered successfully");
      setShowAddForm(false);
      setRegNumber("");
      setMake("");
      setModel("");
      setColor("");
      loadVehicles();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id, reg) => {
    const confirmed = window.confirm(`Remove vehicle ${reg} from your account?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove vehicle");

      toast.success("Vehicle removed successfully");
      loadVehicles();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
            Registered Vehicles
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            Add your bikes, scooters, or electric two-wheelers for slot allocations.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>{showAddForm ? "Cancel" : "Register New Two-Wheeler"}</span>
        </Button>
      </div>

      {/* Registration Form Modal / Panel */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-card border border-border-subtle shadow-sm space-y-4">
          <div className="border-b border-border-subtle pb-3">
            <h2 className="text-sm font-bold text-ink-primary">
              Register Two-Wheeler Vehicle
            </h2>
            <p className="text-xs text-ink-secondary">
              Enter Indian vehicle registration number (e.g. DL01AB1234 or 22BH1234AA)
            </p>
          </div>

          <form onSubmit={handleRegisterVehicle} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                  placeholder="MH02CL9988"
                  className="w-full px-3 py-2 border border-border-subtle rounded-button font-mono uppercase focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Vehicle Type *
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 text-ink-primary"
                >
                  <option value="motorcycle">Motorcycle / Bike</option>
                  <option value="scooter">Scooter (Petrol)</option>
                  <option value="electric_scooter">Electric Scooter</option>
                  <option value="moped">Moped</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Manufacturer / Make *
                </label>
                <input
                  type="text"
                  required
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="Royal Enfield / Honda / Ather"
                  className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Model *
                </label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Classic 350 / Activa 6G / 450X"
                  className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Color (Optional)
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Matte Black / Pearl White"
                  className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Vehicle"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicles List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-ink-secondary">
          Loading vehicles...
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white p-8 rounded-card border border-border-subtle text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-surface-subtle text-ink-secondary flex items-center justify-center mx-auto">
            <Bike className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-ink-primary">
            No two-wheelers registered yet
          </h2>
          <p className="text-xs text-ink-secondary max-w-sm mx-auto">
            Register your bike or scooter registration number to allocate slots and receive tickets.
          </p>
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add Your First Two-Wheeler</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <div
              key={v._id}
              className="bg-white p-5 rounded-card border border-border-subtle shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <button
                  onClick={() => handleDeleteVehicle(v._id, v.registrationNumber)}
                  className="p-1.5 text-ink-muted hover:text-status-occupied rounded transition-colors"
                  title="Remove vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <span className="font-mono text-base font-bold text-ink-primary tracking-wide block">
                  {v.registrationNumber}
                </span>
                <span className="text-xs text-ink-secondary font-medium">
                  {v.make} {v.model} {v.color ? `• ${v.color}` : ""}
                </span>
              </div>

              <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-ink-secondary">
                <span className="capitalize bg-surface-subtle px-2 py-0.5 rounded">
                  {v.vehicleType.replace("_", " ")}
                </span>
                <span>
                  Registered {new Date(v.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
