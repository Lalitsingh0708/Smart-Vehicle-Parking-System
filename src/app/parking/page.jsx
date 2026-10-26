"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ParkingMap from "@/components/parking/ParkingMap";
import { Search, MapPin, SlidersHorizontal, ArrowUpDown, Clock, Check, Navigation, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ParkingDiscoveryPage() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState("capacity");
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);

  // Request user location with explicit policy explanation
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationDenied(false);
        setSortBy("distance");
      },
      () => {
        setLocationDenied(true);
      }
    );
  };

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set("query", searchTerm);
    if (selectedCity) params.set("city", selectedCity);
    if (maxRate) params.set("maxRate", maxRate);
    if (availableOnly) params.set("availableOnly", "true");
    params.set("sortBy", sortBy);
    if (userLocation) {
      params.set("lat", userLocation.lat);
      params.set("lng", userLocation.lng);
    }

    fetch(`/api/parking-lots?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setLots(data.lots || []);
      })
      .catch((err) => {
        console.error("Failed to load lots:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchTerm, selectedCity, maxRate, availableOnly, sortBy, userLocation]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-primary tracking-tight">
              Find Available Two-Wheeler Parking
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1">
              Search nearby motorcycle and scooter parking bays with database-recorded slot availability.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {!userLocation && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestLocation}
                className="text-xs"
              >
                <Navigation className="w-3.5 h-3.5 mr-1.5 text-brand-500" />
                <span>Use My Location (India)</span>
              </Button>
            )}
            {userLocation && (
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-medium flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Location Detected</span>
              </span>
            )}
          </div>
        </div>

        {locationDenied && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              Location permission was denied. You can manually search by city name, landmark, or street below.
            </span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search lot name, area, or street..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-border-subtle rounded-button focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* City Filter */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border-subtle rounded-button focus:outline-none focus:ring-1 focus:ring-brand-500 text-ink-primary"
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

            {/* Max Hourly Rate */}
            <div>
              <select
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border-subtle rounded-button focus:outline-none focus:ring-1 focus:ring-brand-500 text-ink-primary"
              >
                <option value="">Any Hourly Rate</option>
                <option value="20">Up to ₹20 / hour</option>
                <option value="30">Up to ₹30 / hour</option>
                <option value="50">Up to ₹50 / hour</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border-subtle rounded-button focus:outline-none focus:ring-1 focus:ring-brand-500 text-ink-primary"
              >
                <option value="capacity">Most Available Slots</option>
                <option value="rate_low">Lowest Price First</option>
                {userLocation && <option value="distance">Nearest to Me</option>}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="availOnly"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded text-brand-500 focus:ring-brand-500 w-3.5 h-3.5"
            />
            <label htmlFor="availOnly" className="text-xs text-ink-secondary cursor-pointer select-none">
              Only display lots with immediately available slots
            </label>
          </div>
        </div>

        {/* Dual Map and List View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Column */}
          <div className="lg:col-span-7">
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
                  Interactive Map
                </span>
                <span className="text-[11px] text-ink-secondary">
                  OpenStreetMap • India Viewport
                </span>
              </div>
              <ParkingMap
                lots={lots}
                selectedLotId={selectedLotId}
                onSelectLot={(lot) => setSelectedLotId(lot.id || lot._id)}
                userLocation={userLocation}
                height="480px"
              />
            </div>
          </div>

          {/* List Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
                Parking Lots ({lots.length})
              </span>
              <span className="text-xs text-ink-muted">
                System-recorded occupancy
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-white rounded-card border border-border-subtle animate-pulse p-4"
                  />
                ))}
              </div>
            ) : lots.length === 0 ? (
              <div className="bg-white p-8 rounded-card border border-border-subtle text-center space-y-3">
                <MapPin className="w-8 h-8 text-ink-muted mx-auto" />
                <h3 className="text-sm font-semibold text-ink-primary">
                  No parking lots found
                </h3>
                <p className="text-xs text-ink-secondary max-w-xs mx-auto">
                  Try widening your search terms, removing filters, or choosing a different city.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCity("");
                    setMaxRate("");
                    setAvailableOnly(false);
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {lots.map((lot) => {
                  const isAvailable = lot.availableCount > 0;
                  const isSelected = selectedLotId === (lot.id || lot._id);

                  return (
                    <div
                      key={lot.id || lot._id}
                      onClick={() => setSelectedLotId(lot.id || lot._id)}
                      className={`p-4 rounded-card border transition-all cursor-pointer bg-white ${
                        isSelected
                          ? "border-brand-500 ring-2 ring-brand-100 shadow-sm"
                          : "border-border-subtle hover:border-brand-300 shadow-2xs"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-ink-primary">
                            {lot.name}
                          </h3>
                          <p className="text-xs text-ink-secondary mt-0.5 flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-ink-muted flex-shrink-0" />
                            <span>{lot.address}, {lot.city}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-brand-600 block">
                            ₹{lot.hourlyRate}
                            <span className="text-[11px] font-normal text-ink-secondary">/hr</span>
                          </span>
                          {lot.distanceKm !== null && lot.distanceKm !== undefined && (
                            <span className="text-[11px] text-ink-secondary font-medium">
                              {lot.distanceKm} km away
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isAvailable
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
                            {lot.availableCount} of {lot.totalCapacity} Available
                          </span>
                          <span className="text-ink-secondary text-[11px] flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-ink-muted" />
                            <span>{lot.openingHours}</span>
                          </span>
                        </div>

                        <Link href={`/parking/${lot.id || lot._id}`}>
                          <Button size="sm" className="text-xs py-1 px-3">
                            View Slots
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
