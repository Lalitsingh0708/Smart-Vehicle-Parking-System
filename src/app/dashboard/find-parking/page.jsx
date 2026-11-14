"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ParkingMap from "@/components/parking/ParkingMap";
import Button from "@/components/ui/Button";
import {
  Search,
  MapPin,
  Clock,
  ArrowRight,
  Navigation,
  Compass,
  CheckCircle2,
  ExternalLink,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

// LPU Gate 1 Simulation Coordinates for campus testing
const LPU_GATE_1_SIMULATION = {
  lat: 31.2562,
  lng: 75.7032,
};

export default function DashboardFindParkingPage() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("Phagwara (LPU Campus)");
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set("query", searchTerm);
    if (selectedCity) params.set("city", selectedCity);

    fetch(`/api/parking-lots?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const list = data.lots || [];
        setLots(list);
        if (list.length > 0) {
          const stillExists = list.some((l) => (l.id || l._id) === selectedLotId);
          if (!stillExists) {
            setSelectedLotId(list[0].id || list[0]._id);
          }
        } else {
          setSelectedLotId(null);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [searchTerm, selectedCity]);

  // Detect Live Rider GPS Location
  const handleDetectLiveLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setDetectingLocation(false);
        toast.success("Live rider GPS location detected!");
      },
      (err) => {
        setDetectingLocation(false);
        // Fallback to LPU Main Gate 1
        setUserLocation(LPU_GATE_1_SIMULATION);
        toast("GPS permission denied or off-campus. Set to LPU Main Entrance Gate 1.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Quick switch to LPU Campus Simulation
  const handleSetLpuLocation = () => {
    setUserLocation(LPU_GATE_1_SIMULATION);
    toast.success("Rider location set to LPU Main Gate 1");
  };

  const selectedLot = lots.find((l) => (l.id || l._id) === selectedLotId);

  return (
    <div className="space-y-6">
      {/* Page Title & Location Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
            Campus Two-Wheeler Parking (LPU)
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            Select a parking lot to view zone slots, live occupancy, and live navigation directions.
          </p>
        </div>

        {/* Live Rider GPS Controls */}
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={handleDetectLiveLocation}
            disabled={detectingLocation}
            className="text-xs bg-[#176B5B] hover:bg-[#125448]"
          >
            <Compass className={`w-3.5 h-3.5 mr-1.5 ${detectingLocation ? "animate-spin" : ""}`} />
            <span>{detectingLocation ? "Locating..." : "Detect Live Location"}</span>
          </Button>

          <button
            type="button"
            onClick={handleSetLpuLocation}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-border-subtle bg-white text-ink-secondary hover:text-ink-primary hover:border-brand-500 transition-colors"
          >
            LPU Gate 1
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-card border border-border-subtle shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search LPU bay, block, hostel or gate..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-border-subtle rounded-button focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-3 py-2 text-xs font-semibold border border-border-subtle rounded-button focus:outline-none focus:ring-1 focus:ring-brand-500 text-ink-primary bg-white"
        >
          <option value="Phagwara (LPU Campus)">Phagwara (LPU Campus)</option>
          <option value="">All Locations</option>
          <option value="New Delhi">New Delhi</option>
          <option value="Bengaluru">Bengaluru</option>
          <option value="Mumbai">Mumbai</option>
        </select>
      </div>

      {/* Live Route Navigation Banner (Shown when userLocation & lot are chosen) */}
      {selectedLot && userLocation && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#176B5B] text-white flex items-center justify-center flex-shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 uppercase tracking-wider">
                  Live Navigation Route Active
                </span>
                {routeInfo?.distanceMeters && (
                  <span className="text-xs font-bold text-emerald-950">
                    {routeInfo.distanceMeters >= 1000
                      ? `${(routeInfo.distanceMeters / 1000).toFixed(1)} km`
                      : `${routeInfo.distanceMeters} meters`}
                    {" • "}
                    {Math.ceil((routeInfo.durationSeconds || 60) / 60)} min ride
                  </span>
                )}
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-emerald-950 mt-0.5">
                Route to: {selectedLot.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedLot.coordinates.latitude},${selectedLot.coordinates.longitude}&travelmode=two-wheeler`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#176B5B] hover:bg-[#125448] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <span>Turn-by-Turn GPS</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={() => setUserLocation(null)}
              className="p-1.5 rounded-lg text-emerald-800 hover:bg-emerald-200/50 transition-colors"
              title="Clear Route"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Map & List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Campus Map with Live Rider Marker & Polyline Route */}
        <div className="lg:col-span-7">
          <ParkingMap
            lots={lots}
            selectedLotId={selectedLotId}
            onSelectLot={(lot) => setSelectedLotId(lot.id || lot._id)}
            userLocation={userLocation}
            zoom={15}
            height="500px"
            onRouteCalculated={(info) => setRouteInfo(info)}
          />
        </div>

        {/* LPU Parking Facility Cards */}
        <div className="lg:col-span-5 space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {loading ? (
            <div className="p-8 text-center text-xs text-ink-secondary">
              Loading LPU campus facilities...
            </div>
          ) : lots.length === 0 ? (
            <div className="bg-white p-8 rounded-card border border-border-subtle text-center text-xs text-ink-secondary">
              No matching parking bays found in selected area.
            </div>
          ) : (
            lots.map((lot) => {
              const isSelected = selectedLotId === (lot.id || lot._id);
              return (
                <div
                  key={lot.id || lot._id}
                  onClick={() => setSelectedLotId(lot.id || lot._id)}
                  className={`p-4 bg-white rounded-card border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#176B5B] ring-2 ring-[#176B5B]/15 shadow-sm bg-[#FAF8F5]"
                      : "border-border-subtle hover:border-brand-300"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h2 className="text-sm font-bold text-ink-primary leading-snug">
                        {lot.name}
                      </h2>
                      <p className="text-xs text-ink-secondary flex items-start space-x-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-ink-muted flex-shrink-0 mt-0.5" />
                        <span>{lot.address}</span>
                      </p>
                    </div>
                    <span className="font-black text-[#176B5B] text-sm whitespace-nowrap">
                      ₹{lot.hourlyRate}
                      <span className="text-[11px] font-normal text-ink-secondary">/hr</span>
                    </span>
                  </div>

                  {/* Operational Status */}
                  <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-xs">
                    <span
                      className={`font-bold ${
                        lot.availableCount > 0 ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {lot.availableCount} of {lot.totalCapacity} bays vacant
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLotId(lot.id || lot._id);
                          if (!userLocation) handleSetLpuLocation();
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded border border-border-subtle bg-white hover:bg-slate-50 text-ink-primary transition-colors flex items-center space-x-1"
                      >
                        <Navigation className="w-3 h-3 text-[#176B5B]" />
                        <span>Route</span>
                      </button>

                      <Link href={`/parking/${lot.id || lot._id}`}>
                        <Button size="sm" className="text-xs py-1 px-3 bg-[#176B5B] hover:bg-[#125448]">
                          <span>Select Bays</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
