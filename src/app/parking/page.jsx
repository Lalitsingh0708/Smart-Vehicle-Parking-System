"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ParkingMap from "@/components/parking/ParkingMap";
import { Search, MapPin, SlidersHorizontal, ArrowUpDown, Clock, Check, Navigation, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ParkingFinderPage() {
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
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1815] relative overflow-x-hidden">
      {/* Decorative Gold Dot Matrix (Top Right) */}
      <div className="absolute top-20 right-6 sm:top-24 sm:right-12 hidden sm:grid grid-cols-4 gap-2 opacity-60 z-0 pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
        ))}
      </div>

      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E2D9CC]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#176B5B]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#176B5B]">
                Live Campus Discovery
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1C1815] tracking-tight mt-1">
              Find Available Two-Wheeler Parking
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#706254] mt-0.5">
              Search nearby motorcycle and scooter parking bays with database-recorded slot availability.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            {!userLocation && (
              <button
                type="button"
                onClick={handleRequestLocation}
                className="flex items-center space-x-2 px-4 py-2 bg-[#FFFFFF] hover:bg-[#FAF6EE] text-[#176B5B] border border-[#DFD1BD] hover:border-[#176B5B] rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-[#176B5B]" />
                <span>Use My Location (India)</span>
              </button>
            )}
            {userLocation && (
              <span className="text-xs bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 shadow-xs">
                <Check className="w-3.5 h-3.5 text-[#059669]" />
                <span>Location Detected</span>
              </span>
            )}
          </div>
        </div>

        {locationDenied && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-semibold text-amber-900 flex items-center space-x-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              Location permission was denied. You can manually search by campus gate, landmark, or block below.
            </span>
          </div>
        )}

        {/* Luxury Filter Bar (Warm Beige, Cream, and Forest Green Accents) */}
        <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#DFD1BD] shadow-[0_8px_30px_rgba(28,24,21,0.05)] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C7E72] absolute left-3.5 top-3 stroke-[2.2]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search lot name, gate, or block..."
                className="w-full bg-[#FAF7F2] pl-10 pr-3 py-2.5 text-xs font-semibold text-[#1C1815] border border-[#E2D9CC] rounded-xl focus:outline-none focus:border-[#176B5B] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#176B5B]/15 transition-all placeholder:text-[#9E9082]"
              />
            </div>

            {/* City / Campus Filter */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-semibold text-[#1C1815] bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl focus:outline-none focus:border-[#176B5B] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#176B5B]/15 transition-all cursor-pointer"
              >
                <option value="Phagwara (LPU Campus)">Phagwara (LPU Campus)</option>
                <option value="">All Locations</option>
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
                className="w-full px-3 py-2.5 text-xs font-semibold text-[#1C1815] bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl focus:outline-none focus:border-[#176B5B] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#176B5B]/15 transition-all cursor-pointer"
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
                className="w-full px-3 py-2.5 text-xs font-semibold text-[#1C1815] bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl focus:outline-none focus:border-[#176B5B] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#176B5B]/15 transition-all cursor-pointer"
              >
                <option value="capacity">Most Available Slots</option>
                <option value="rate_low">Lowest Price First</option>
                {userLocation && <option value="distance">Nearest to Me</option>}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1 border-t border-[#F0EBE1]">
            <input
              type="checkbox"
              id="availOnly"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded border-[#D8CFC2] text-[#176B5B] focus:ring-[#176B5B] w-4 h-4 cursor-pointer accent-[#176B5B]"
            />
            <label htmlFor="availOnly" className="text-xs font-semibold text-[#66584B] cursor-pointer select-none">
              Only display lots with immediately available slots
            </label>
          </div>
        </div>

        {/* Dual Map and List View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Column */}
          <div className="lg:col-span-7">
            <div className="sticky top-24 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#176B5B] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                  Interactive Map
                </span>
                <span className="text-[10.5px] font-bold text-[#8C7E72] bg-[#FAF6EE] border border-[#DFD1BD] px-2.5 py-0.5 rounded-md">
                  OpenStreetMap • India Viewport
                </span>
              </div>
              <div className="rounded-2xl border-2 border-[#DFD1BD] ring-1 ring-[#D4AF37]/30 shadow-md overflow-hidden bg-white">
                <ParkingMap
                  lots={lots}
                  selectedLotId={selectedLotId}
                  onSelectLot={(lot) => setSelectedLotId(lot.id || lot._id)}
                  userLocation={userLocation}
                  height="490px"
                />
              </div>
            </div>
          </div>

          {/* List Column */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#176B5B] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#176B5B]" />
                Parking Lots ({lots.length})
              </span>
              <span className="text-[10.5px] font-bold text-[#8C7E72] bg-[#FAF6EE] border border-[#DFD1BD] px-2.5 py-0.5 rounded-md">
                System-recorded occupancy
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-white rounded-2xl border border-[#DFD1BD] animate-pulse p-4"
                  />
                ))}
              </div>
            ) : lots.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-[#DFD1BD] text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#FAF6EE] border border-[#DFD1BD] flex items-center justify-center mx-auto text-[#8C7E72]">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-[#1C1815]">
                  No parking lots found
                </h3>
                <p className="text-xs font-medium text-[#706254] max-w-xs mx-auto">
                  Try widening your search terms, removing filters, or choosing a different campus gate.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCity("");
                    setMaxRate("");
                    setAvailableOnly(false);
                  }}
                  className="px-4 py-2 bg-[#FAF6EE] hover:bg-[#176B5B] text-[#176B5B] hover:text-white border border-[#DFD1BD] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[530px] overflow-y-auto pr-1">
                {lots.map((lot) => {
                  const isAvailable = lot.availableCount > 0;
                  const isSelected = selectedLotId === (lot.id || lot._id);

                  return (
                    <div
                      key={lot.id || lot._id}
                      onClick={() => setSelectedLotId(lot.id || lot._id)}
                      className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer bg-white ${
                        isSelected
                          ? "border-[#176B5B] ring-2 ring-[#176B5B]/20 shadow-[0_12px_28px_rgba(23,107,91,0.12)] bg-[#FAFDFC]"
                          : "border-[#E8DFC0] hover:border-[#D4AF37] shadow-[0_4px_16px_rgba(28,24,21,0.04)] hover:shadow-[0_8px_24px_rgba(28,24,21,0.08)]"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                            <h3 className="text-sm font-black text-[#1C1815] tracking-tight">
                              {lot.name}
                            </h3>
                          </div>
                          <p className="text-xs font-medium text-[#706254] mt-1 flex items-center space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#176B5B] flex-shrink-0 stroke-[2.2]" />
                            <span>
                              {lot.address}, {lot.city}
                            </span>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-block bg-[#EAF4F1] border border-[#BDE0D8] text-[#176B5B] font-black text-sm sm:text-base px-2.5 py-1 rounded-xl shadow-xs">
                            ₹{lot.hourlyRate}
                            <span className="text-[10.5px] font-semibold text-[#547E75]">/hr</span>
                          </span>
                          {lot.distanceKm !== null && lot.distanceKm !== undefined && (
                            <span className="text-[10.5px] text-[#706254] font-bold block mt-0.5">
                              {lot.distanceKm} km away
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#F0EBE1] flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black ${
                              isAvailable
                                ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                isAvailable ? "bg-[#059669] animate-pulse" : "bg-red-600"
                              }`}
                            />
                            {lot.availableCount} of {lot.totalCapacity} Available
                          </span>

                          <span className="text-[#706254] text-[11px] font-semibold flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-[#8C7E72]" />
                            <span>{lot.openingHours}</span>
                          </span>
                        </div>

                        <Link href={`/parking/${lot.id || lot._id}`} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="bg-[#176B5B] hover:bg-[#125448] text-white font-black text-xs py-1.5 px-3.5 rounded-xl border border-[#0F473D] shadow-[0_4px_12px_rgba(23,107,91,0.22)] hover:shadow-[0_6px_16px_rgba(23,107,91,0.32)] transition-all cursor-pointer whitespace-nowrap"
                          >
                            View Slots
                          </button>
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
