"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ParkingMap from "@/components/parking/ParkingMap";
import Button from "@/components/ui/Button";
import { Search, MapPin, Clock, ArrowRight } from "lucide-react";

export default function DashboardFindParkingPage() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedLotId, setSelectedLotId] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set("query", searchTerm);
    if (selectedCity) params.set("city", selectedCity);

    fetch(`/api/parking-lots?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setLots(data.lots || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [searchTerm, selectedCity]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
          Find Available Parking
        </h1>
        <p className="text-xs text-ink-secondary mt-0.5">
          Select a parking lot to view zone slots and allocate your two-wheeler.
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search lot by name or street..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-border-subtle rounded-button focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-3 py-2 text-xs border border-border-subtle rounded-button focus:outline-none focus:ring-1 focus:ring-brand-500 text-ink-primary"
        >
          <option value="">All Indian Cities</option>
          <option value="New Delhi">New Delhi</option>
          <option value="Bengaluru">Bengaluru</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Pune">Pune</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Chennai">Chennai</option>
        </select>
      </div>

      {/* Map & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <ParkingMap
            lots={lots}
            selectedLotId={selectedLotId}
            onSelectLot={(lot) => setSelectedLotId(lot.id || lot._id)}
            height="460px"
          />
        </div>

        <div className="lg:col-span-6 space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {loading ? (
            <div className="p-8 text-center text-xs text-ink-secondary">
              Searching available lots...
            </div>
          ) : lots.length === 0 ? (
            <div className="bg-white p-8 rounded-card border border-border-subtle text-center text-xs text-ink-secondary">
              No matching parking bays found.
            </div>
          ) : (
            lots.map((lot) => (
              <div
                key={lot.id || lot._id}
                onClick={() => setSelectedLotId(lot.id || lot._id)}
                className={`p-4 bg-white rounded-card border transition-all cursor-pointer ${
                  selectedLotId === (lot.id || lot._id)
                    ? "border-brand-500 ring-2 ring-brand-100 shadow-sm"
                    : "border-border-subtle hover:border-brand-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-ink-primary">{lot.name}</h3>
                    <p className="text-xs text-ink-secondary flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-ink-muted" />
                      <span>{lot.address}, {lot.city}</span>
                    </p>
                  </div>
                  <span className="font-bold text-brand-600 text-sm">
                    ₹{lot.hourlyRate}
                    <span className="text-[11px] font-normal text-ink-secondary">/hr</span>
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-xs">
                  <span
                    className={`font-semibold ${
                      lot.availableCount > 0 ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {lot.availableCount} of {lot.totalCapacity} slots available
                  </span>

                  <Link href={`/parking/${lot.id || lot._id}`}>
                    <Button size="sm" className="text-xs py-1 px-3">
                      <span>Select Slots</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
