"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TicketCard from "@/components/parking/TicketCard";
import ParkingMap from "@/components/parking/ParkingMap";
import Button from "@/components/ui/Button";
import {
  MapPin,
  Clock,
  Bike,
  Navigation,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Receipt,
} from "lucide-react";
import toast from "react-hot-toast";

export default function MyParkingPage() {
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutReceipt, setCheckoutReceipt] = useState(null);

  const fetchActive = () => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setActiveSession(data.activeSession);
        }
      })
      .catch((err) => console.error("Error fetching active session:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchActive();
  }, []);

  const handleCheckout = async () => {
    if (!activeSession) return;

    const confirmed = window.confirm(
      "Are you sure you want to check out of this parking slot? Your parking fee will be calculated and the slot will be marked available."
    );
    if (!confirmed) return;

    setCheckingOut(true);

    try {
      const res = await fetch(`/api/parking-sessions/${activeSession._id}/checkout`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to check out");

      toast.success("Checkout completed! Slot is now available.");
      setCheckoutReceipt(data);
      setActiveSession(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-white rounded animate-pulse" />
        <div className="h-64 bg-white rounded-card border border-border-subtle animate-pulse" />
      </div>
    );
  }

  // Completed checkout receipt view
  if (checkoutReceipt) {
    const summary = checkoutReceipt.summary;
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-card border border-border-subtle shadow-sm space-y-5 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-ink-primary">
            Checkout Completed Successfully
          </h1>
          <p className="text-xs text-ink-secondary">
            Your parking session is complete and your slot has been made available for other riders.
          </p>

          <div className="p-4 bg-surface-subtle rounded-lg text-left text-xs space-y-2 border border-border-subtle">
            <div className="flex justify-between">
              <span className="text-ink-secondary">Entry Time:</span>
              <span className="font-medium text-ink-primary">
                {new Date(summary.entryTime).toLocaleTimeString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">Exit Time:</span>
              <span className="font-medium text-ink-primary">
                {new Date(summary.exitTime).toLocaleTimeString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">Duration:</span>
              <span className="font-medium text-ink-primary">
                {summary.durationMinutes} minutes ({summary.billedHours} hr billed)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">Rate:</span>
              <span className="font-medium text-ink-primary">
                ₹{summary.hourlyRate} / hour
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border-subtle text-sm font-bold text-ink-primary">
              <span>Total Fee Paid:</span>
              <span className="text-brand-600">₹{summary.totalFee}</span>
            </div>
          </div>

          <div className="flex space-x-3 justify-center pt-2">
            <Link href="/dashboard/history">
              <Button size="sm" variant="secondary">
                View Parking History
              </Button>
            </Link>
            <Link href="/dashboard/find-parking">
              <Button size="sm">
                Find Parking
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
            Active Parking Session
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            Retrieve your parked bike, view your digital ticket, or complete authorized checkout.
          </p>
        </div>

        <div className="bg-white p-10 rounded-card border border-border-subtle shadow-xs text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-surface-subtle text-ink-secondary flex items-center justify-center mx-auto">
            <Bike className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-ink-primary">
            No active parking session found
          </h2>
          <p className="text-xs text-ink-secondary leading-relaxed">
            You do not currently have a two-wheeler parked in any lot. When you allocate a slot, your digital ticket, exact slot location, and checkout options will appear here.
          </p>
          <div className="pt-2">
            <Link href="/dashboard/find-parking">
              <Button size="sm">
                Find Available Parking
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const lot = activeSession.parkingLotId || {};
  const slot = activeSession.parkingSlotId || {};
  const vehicle = activeSession.vehicleId || {};
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lot.coordinates?.latitude},${lot.coordinates?.longitude}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
            Your Active Parking Session
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            Vehicle location, assigned slot, and live ticket receipt.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" size="sm" className="text-xs">
              <Navigation className="w-3.5 h-3.5 mr-1.5 text-brand-500" />
              <span>Navigate to Lot</span>
            </Button>
          </a>

          <Button
            variant="danger"
            size="sm"
            disabled={checkingOut}
            onClick={handleCheckout}
            className="text-xs"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            <span>{checkingOut ? "Checking out..." : "Complete Checkout"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket Details & Location Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Summary Card */}
          <div className="bg-white p-5 rounded-card border border-border-subtle shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                Saved Parking Location
              </span>
              <Link
                href="/dashboard/incidents"
                className="text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center space-x-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report Incident for this Slot</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-surface-subtle rounded-lg">
                <span className="text-ink-secondary block">Assigned Bay:</span>
                <span className="font-bold text-ink-primary text-sm truncate block">
                  {lot.name}
                </span>
              </div>
              <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg">
                <span className="text-brand-800 block">Exact Slot:</span>
                <span className="font-black text-brand-700 text-base">
                  {slot.zone} • {slot.slotNumber}
                </span>
              </div>
              <div className="p-3 bg-surface-subtle rounded-lg">
                <span className="text-ink-secondary block">Vehicle:</span>
                <span className="font-bold text-ink-primary text-sm truncate block">
                  {vehicle.registrationNumber}
                </span>
              </div>
            </div>

            {/* Saved Location Map */}
            {lot.coordinates && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-ink-primary block mb-2">
                  Map Location:
                </span>
                <ParkingMap
                  lots={[lot]}
                  selectedLotId={lot._id}
                  height="260px"
                  zoom={15}
                />
              </div>
            )}
          </div>
        </div>

        {/* Digital Ticket Column */}
        <div className="lg:col-span-5">
          <TicketCard session={activeSession} />
        </div>
      </div>
    </div>
  );
}
