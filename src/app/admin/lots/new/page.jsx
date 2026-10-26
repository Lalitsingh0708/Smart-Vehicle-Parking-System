"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function NewParkingLotPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("New Delhi");
  const [latitude, setLatitude] = useState("28.6139");
  const [longitude, setLongitude] = useState("77.2090");
  const [hourlyRate, setHourlyRate] = useState("20");
  const [openingHours, setOpeningHours] = useState("06:00 - 23:00");
  const [description, setDescription] = useState("");
  const [initialSlotsCount, setInitialSlotsCount] = useState("16");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/parking-lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          city,
          coordinates: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          },
          hourlyRate: parseFloat(hourlyRate),
          openingHours,
          description,
          initialSlotsCount: parseInt(initialSlotsCount, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create parking lot");

      toast.success(`Lot created successfully with ${data.slotsCreated || 0} initial slots`);
      router.push("/admin/lots");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center space-x-2">
        <Link
          href="/admin/lots"
          className="text-xs text-ink-secondary hover:text-ink-primary flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Lots</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
          Create New Parking Lot
        </h1>
        <p className="text-xs text-ink-secondary mt-0.5">
          Add a new two-wheeler parking facility with initial numbered slots and hourly pricing.
        </p>
      </div>

      <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              Parking Facility Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Connaught Place Metro Bay 1"
              className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                City *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 text-ink-primary"
              >
                <option value="New Delhi">New Delhi</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Hourly Fee in Indian Rupees (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="20"
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              Full Street Address *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Block B, Radial Road 2, Near Gate 4"
              className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Latitude (e.g. 28.6315) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Longitude (e.g. 77.2167) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="06:00 - 23:00"
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Initial Number of Slots to Generate
              </label>
              <input
                type="number"
                min="2"
                max="100"
                value={initialSlotsCount}
                onChange={(e) => setInitialSlotsCount(e.target.value)}
                placeholder="16"
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
              />
              <span className="text-[11px] text-ink-muted block mt-0.5">
                Automatically divides slots across Zone A and Zone B.
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Covered basement parking bay with security guard station..."
              className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-border-subtle">
            <Link href="/admin/lots">
              <Button variant="secondary" size="sm">
                Cancel
              </Button>
            </Link>
            <Button size="sm" type="submit" disabled={submitting}>
              {submitting ? "Creating Lot..." : "Create Lot & Generate Slots"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
