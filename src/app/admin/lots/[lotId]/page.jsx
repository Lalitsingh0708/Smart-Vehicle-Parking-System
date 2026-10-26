"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Grid } from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function AdminEditLotPage() {
  const { lotId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [hourlyRate, setHourlyRate] = useState(20);
  const [openingHours, setOpeningHours] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
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
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update lot");

      toast.success("Parking lot updated successfully");
      router.push("/admin/lots");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-ink-secondary">Loading lot details...</div>;
  }

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
          Edit Parking Facility
        </h1>
        <p className="text-xs text-ink-secondary mt-0.5">
          Update facility parameters, pricing in ₹, or active visibility.
        </p>
      </div>

      <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              Parking Facility Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                City
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Hourly Fee in Indian Rupees (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              Full Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
            />
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
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Active Status
              </label>
              <select
                value={active ? "true" : "false"}
                onChange={(e) => setActive(e.target.value === "true")}
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 text-ink-primary"
              >
                <option value="true">Active (Discoverable by riders)</option>
                <option value="false">Inactive (Hidden from discovery)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink-primary mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
