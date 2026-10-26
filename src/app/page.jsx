"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Bike,
  Shield,
  ArrowRight,
  Clock,
  CheckCircle,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  LogIn,
  Layers,
  Activity,
  Receipt,
} from "lucide-react";

export default function HomePage() {
  const [lots, setLots] = useState([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Local time updater
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/parking-lots")
      .then((res) => res.json())
      .then((data) => {
        if (data.lots) {
          setLots(data.lots);
        }
      })
      .catch((err) => console.error("Error loading lots:", err))
      .finally(() => setLoadingLots(false));
  }, []);

  // Columns for the sliced architectural hero visual
  const heroColumns = [0, 1, 2, 3, 4, 5];

  return (
    <div className="min-h-screen bg-[#EAEFF2] text-[#3A0F34] font-sans selection:bg-[#EAAA00] selection:text-[#3A0F34]">
      {/* Top Architectural Header */}
      <header className="sticky top-0 z-50 bg-[#EAEFF2]/95 backdrop-blur-md border-b border-[#CCD5DC]">
        <div className="w-full grid grid-cols-12 h-16 sm:h-20">
          {/* Brand Col */}
          <div className="col-span-8 sm:col-span-4 lg:col-span-3 border-r border-[#CCD5DC] px-4 sm:px-8 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-sm bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center font-bold text-sm tracking-wider border border-[#541D4C]">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-sm text-[#3A0F34] uppercase">
                  Where Did I Park?
                </span>
                <span className="text-[10px] text-[#75456E] tracking-widest uppercase font-mono">
                  Two-Wheeler Mobility
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links Aligned Across Columns */}
          <nav className="hidden lg:flex col-span-6 items-center divide-x divide-[#CCD5DC]">
            <Link
              href="/parking"
              className="px-6 h-full flex items-center text-xs font-bold uppercase tracking-widest text-[#3A0F34] hover:text-[#EAAA00] transition-colors"
            >
              01 Explore
            </Link>
            <a
              href="#portals"
              className="px-6 h-full flex items-center text-xs font-bold uppercase tracking-widest text-[#3A0F34] hover:text-[#EAAA00] transition-colors"
            >
              02 Three Interfaces
            </a>
            <a
              href="#facilities"
              className="px-6 h-full flex items-center text-xs font-bold uppercase tracking-widest text-[#3A0F34] hover:text-[#EAAA00] transition-colors"
            >
              03 Facilities
            </a>
            <Link
              href="/attendant"
              className="px-6 h-full flex items-center text-xs font-bold uppercase tracking-widest text-[#3A0F34] hover:text-[#EAAA00] transition-colors"
            >
              Booth Portal
            </Link>
          </nav>

          {/* Right Action & Clock Col */}
          <div className="col-span-4 sm:col-span-8 lg:col-span-3 flex items-center justify-end px-4 sm:px-8 space-x-3 border-l border-[#CCD5DC]">
            <div className="hidden sm:flex flex-col items-end mr-3">
              <span className="text-[10px] uppercase font-mono text-[#75456E] tracking-wider">
                IST Time
              </span>
              <span className="text-xs font-mono font-bold text-[#3A0F34]">
                {currentTime || "00:00:00"}
              </span>
            </div>

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 bg-[#3A0F34] text-[#DDE3E8] hover:bg-[#260722] hover:text-[#EAAA00] transition-all rounded-sm text-xs font-semibold uppercase tracking-wider"
            >
              <LogIn className="w-3.5 h-3.5 text-[#EAAA00]" />
              <span>Sign In</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#3A0F34] hover:bg-[#DDE3E8] rounded-sm"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#EAEFF2] border-b border-[#CCD5DC] px-6 py-4 space-y-3">
            <Link
              href="/parking"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold uppercase tracking-widest text-[#3A0F34] hover:text-[#EAAA00]"
            >
              01 Explore Parking
            </Link>
            <a
              href="#portals"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold uppercase tracking-widest text-[#3A0F34] hover:text-[#EAAA00]"
            >
              02 Three Interfaces (Rider / Booth / Admin)
            </a>
            <a
              href="#facilities"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold uppercase tracking-widest text-[#3A0F34] hover:text-[#EAAA00]"
            >
              03 Facilities & Availability
            </a>
            <Link
              href="/attendant"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold uppercase tracking-widest text-[#3A0F34] hover:text-[#EAAA00]"
            >
              Attendant Booth Portal
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold uppercase tracking-widest text-[#3A0F34] hover:text-[#EAAA00]"
            >
              Admin Command Center
            </Link>
            <div className="pt-3 border-t border-[#CCD5DC]">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#3A0F34] text-[#EAAA00] font-semibold text-xs uppercase tracking-wider rounded-sm"
              >
                <span>Access Portals / Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION: High-End Architectural Grid Layout (Matching User Reference) */}
      <section className="relative border-b border-[#CCD5DC] overflow-hidden">
        {/* Full Viewport 10-Column Structural Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-5rem)]">
          
          {/* Left Column Group: Typography & Mission (Cols 1-5) */}
          <div className="lg:col-span-5 p-6 sm:p-10 lg:p-14 border-r border-[#CCD5DC] flex flex-col justify-between z-10 bg-[#EAEFF2]/90 backdrop-blur-xs">
            <div>
              {/* Category / Approach tag */}
              <div className="flex items-center space-x-2.5 mb-6 sm:mb-10">
                <span className="w-2 h-2 rounded-full bg-[#EAAA00] animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#75456E] font-semibold">
                  A Systematic Urban Approach
                </span>
              </div>

              {/* Monumental Kinetic Headline */}
              <div className="space-y-1 mb-8">
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-[#3A0F34] tracking-tight leading-[0.9] uppercase select-none">
                  Space
                </h1>
                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#3A0F34]/90 tracking-tight leading-[0.9] lowercase italic font-serif">
                  is a new
                </h2>
                <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black text-[#3A0F34] tracking-tight leading-[0.9] uppercase select-none">
                  power
                </h2>
              </div>

              {/* Functional Subtitle */}
              <p className="text-sm sm:text-base text-[#3A0F34]/80 leading-relaxed max-w-md mb-8">
                Conflict-free slot booking for riders, fast gate check-in by registration number for attendants, and unified multi-location facility oversight for city administrators.
              </p>

              {/* Circular Reference CTA & Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/parking"
                  className="group inline-flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-[#3A0F34] hover:text-[#EAAA00] transition-colors"
                >
                  <div className="w-12 h-12 rounded-full border border-[#3A0F34] group-hover:border-[#EAAA00] group-hover:bg-[#3A0F34] flex items-center justify-center transition-all">
                    <ArrowRight className="w-4 h-4 text-[#3A0F34] group-hover:text-[#EAAA00] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <span>Explore The Parking Lots</span>
                </Link>

                <Link
                  href="/dashboard/my-parking"
                  className="px-4 py-3 bg-[#DDE3E8] border border-[#CCD5DC] hover:border-[#3A0F34] text-[#3A0F34] text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
                >
                  Active Session Ticket
                </Link>
              </div>
            </div>

            {/* Bottom Meta in Left Col */}
            <div className="pt-8 mt-8 border-t border-[#CCD5DC]/70 grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] uppercase text-[#75456E] block">Architecture</span>
                <span className="font-bold text-[#3A0F34]">Atomic Allocation</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#75456E] block">Surveillance</span>
                <span className="font-bold text-[#3A0F34]">Scannable QR Gates</span>
              </div>
            </div>
          </div>

          {/* Middle & Right Column Group: Sliced Visual Art (Cols 6-11) */}
          <div className="lg:col-span-6 relative border-r border-[#CCD5DC] min-h-[400px] lg:min-h-full overflow-hidden bg-[#3A0F34]">
            {/* Sliced Column Artwork (Motorcycle with glowing Marigold trails) */}
            <div className="absolute inset-0 grid grid-cols-6 h-full w-full">
              {heroColumns.map((colIndex) => (
                <div
                  key={colIndex}
                  className="relative h-full border-r border-[#CCD5DC]/20 overflow-hidden"
                  style={{
                    transform: `translateY(${colIndex % 2 === 0 ? "0px" : "-6px"})`,
                  }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center h-full w-[600%] transition-transform duration-700 hover:scale-105"
                    style={{
                      backgroundImage: "url('/images/hero-art.jpg')",
                      left: `-${colIndex * 100}%`,
                    }}
                  />
                  {/* Subtle aubergine color grade overlay */}
                  <div className="absolute inset-0 bg-[#3A0F34]/25 hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>

            {/* Floating Editorial Badge on Artwork */}
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#3A0F34]/90 backdrop-blur-md border border-[#541D4C] text-[#DDE3E8] flex items-center justify-between z-20">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EAAA00] animate-ping" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#EAAA00]">
                    Delhi &bull; Bengaluru &bull; Mumbai &bull; Pune
                  </div>
                  <div className="text-[11px] text-[#CCD5DC] font-mono">
                    High-Density Two-Wheeler Urban Infrastructure
                  </div>
                </div>
              </div>
              <Link
                href="/parking"
                className="px-3 py-1.5 bg-[#EAAA00] text-[#3A0F34] font-bold text-[11px] uppercase tracking-wider hover:bg-[#D69700] transition-colors rounded-sm"
              >
                Find Slots
              </Link>
            </div>
          </div>

          {/* Rightmost Narrow Editorial Column (Col 12) */}
          <div className="hidden lg:flex lg:col-span-1 p-6 flex-col justify-between items-center text-center bg-[#EAEFF2]">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#75456E] [writing-mode:vertical-rl] rotate-180">
              RIDERS &bull; ATTENDANTS &bull; SUPERVISORS
            </div>

            <div className="space-y-2 flex flex-col items-center">
              <span className="w-1 h-12 bg-[#3A0F34]" />
              <span className="text-xs font-mono font-bold text-[#3A0F34]">01</span>
              <span className="text-[10px] font-mono text-[#75456E]">/ 03</span>
            </div>

            <div className="w-6 h-6 rounded-full border border-[#3A0F34] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#EAAA00]" />
            </div>
          </div>

        </div>
      </section>

      {/* REAL-TIME STATUS TICKER BAR */}
      <section className="bg-[#3A0F34] text-[#DDE3E8] border-b border-[#541D4C] py-3 px-4 sm:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs font-mono gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#EAAA00]" />
            <span className="uppercase text-[#EAAA00] font-bold tracking-wider">
              Live System Status:
            </span>
            <span className="text-[#DDE3E8]">
              {lots.length > 0 ? `${lots.length} Urban Facilities Active` : "Syncing network..."}
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-[#CCD5DC]">
            <span>&bull; Atomic Slot Claim</span>
            <span>&bull; Digital QR Exit</span>
            <span>&bull; Indian Rupees (₹) Real Rates</span>
            <span>&bull; Ground Attendant Booths</span>
          </div>

          <div className="text-[11px] text-[#EAAA00] font-bold">
            Average Gate Clearance: 18 Seconds
          </div>
        </div>
      </section>

      {/* THE THREE INTERFACES SECTION (As Requested by User) */}
      <section id="portals" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="mb-14">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-[#75456E] mb-2">
            <span>Section 02</span>
            <span>&bull;</span>
            <span className="text-[#EAAA00] font-bold">Connected Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#3A0F34] tracking-tight uppercase">
            Three Synchronized Interfaces
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#3A0F34]/80 max-w-2xl leading-relaxed">
            Every feature connects directly to the central MongoDB database. Changes made by riders or attendants reflect instantaneously across the entire system.
          </p>
        </div>

        {/* 3 Structural Bays / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Rider Interface */}
          <div className="bg-[#DDE3E8] border border-[#CCD5DC] hover:border-[#3A0F34] p-8 flex flex-col justify-between transition-all duration-300 group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#75456E]">
                  Interface 01
                </span>
                <span className="px-2.5 py-1 bg-[#3A0F34] text-[#EAAA00] font-mono text-[10px] uppercase font-bold tracking-wider rounded-sm">
                  Riders
                </span>
              </div>

              <div className="w-12 h-12 bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center rounded-sm mb-6">
                <Bike className="w-6 h-6" />
              </div>

              <h3 className="text-2xl font-black text-[#3A0F34] tracking-tight uppercase mb-3">
                Book &amp; Navigate
              </h3>
              <p className="text-xs sm:text-sm text-[#3A0F34]/80 leading-relaxed mb-6">
                Search available parking on interactive maps, book your exact bay slot, receive an encrypted QR ticket on your mobile, and follow pin-drop navigation back to your vehicle.
              </p>

              <ul className="space-y-2 text-xs text-[#3A0F34] font-medium border-t border-[#CCD5DC] pt-4 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#3A0F34]" />
                  <span>Real-time slot availability map</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#3A0F34]" />
                  <span>Conflict-free atomic reservation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#3A0F34]" />
                  <span>Digital QR ticket &amp; return directions</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-[#CCD5DC]">
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-between px-4 py-3 bg-[#3A0F34] text-[#EAAA00] font-bold text-xs uppercase tracking-wider hover:bg-[#260722] transition-colors rounded-sm"
              >
                <span>Enter Rider Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Parking Attendant Booth Interface */}
          <div className="bg-[#3A0F34] text-[#DDE3E8] border border-[#541D4C] p-8 flex flex-col justify-between transition-all duration-300 relative shadow-xl">
            {/* Highlight Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#EAAA00]" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#EAAA00]">
                  Interface 02
                </span>
                <span className="px-2.5 py-1 bg-[#EAAA00] text-[#3A0F34] font-mono text-[10px] uppercase font-bold tracking-wider rounded-sm">
                  Gate Attendant
                </span>
              </div>

              <div className="w-12 h-12 bg-[#EAAA00] text-[#3A0F34] flex items-center justify-center rounded-sm mb-6">
                <Receipt className="w-6 h-6" />
              </div>

              <h3 className="text-2xl font-black text-[#DDE3E8] tracking-tight uppercase mb-3">
                Booth Gate Check-In
              </h3>
              <p className="text-xs sm:text-sm text-[#CCD5DC] leading-relaxed mb-6">
                Stationed attendant interface at the parking entrance. Logs vehicle arrival by registration number plate, automatically assigns a vacant slot, and prints departure receipts with ₹ fee calculation.
              </p>

              <ul className="space-y-2 text-xs text-[#CCD5DC] font-medium border-t border-[#541D4C] pt-4 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#EAAA00]" />
                  <span>Plate number lookup &amp; check-in</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#EAAA00]" />
                  <span>Live parked vehicles attendance table</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#EAAA00]" />
                  <span>Exit duration &amp; Indian Rupee billing</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-[#541D4C]">
              <Link
                href="/attendant"
                className="w-full inline-flex items-center justify-between px-4 py-3 bg-[#EAAA00] text-[#3A0F34] font-black text-xs uppercase tracking-wider hover:bg-[#D69700] transition-colors rounded-sm"
              >
                <span>Launch Booth Station</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: Administrator Command Center */}
          <div className="bg-[#DDE3E8] border border-[#CCD5DC] hover:border-[#3A0F34] p-8 flex flex-col justify-between transition-all duration-300 group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#75456E]">
                  Interface 03
                </span>
                <span className="px-2.5 py-1 bg-[#3A0F34] text-[#EAAA00] font-mono text-[10px] uppercase font-bold tracking-wider rounded-sm">
                  Supervision
                </span>
              </div>

              <div className="w-12 h-12 bg-[#3A0F34] text-[#EAAA00] flex items-center justify-center rounded-sm mb-6">
                <Layers className="w-6 h-6" />
              </div>

              <h3 className="text-2xl font-black text-[#3A0F34] tracking-tight uppercase mb-3">
                Command Center
              </h3>
              <p className="text-xs sm:text-sm text-[#3A0F34]/80 leading-relaxed mb-6">
                City-wide multi-location surveillance. Monitor currently parked vehicles at each facility, identify vacancies vs full lots, adjust slot states, and review incident reports.
              </p>

              <ul className="space-y-2 text-xs text-[#3A0F34] font-medium border-t border-[#CCD5DC] pt-4 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#3A0F34]" />
                  <span>Multi-lot live occupancy monitors</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#3A0F34]" />
                  <span>Inspect parked plates across facilities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#3A0F34]" />
                  <span>CSV audit export &amp; security workflow</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-[#CCD5DC]">
              <Link
                href="/admin"
                className="w-full inline-flex items-center justify-between px-4 py-3 bg-[#3A0F34] text-[#EAAA00] font-bold text-xs uppercase tracking-wider hover:bg-[#260722] transition-colors rounded-sm"
              >
                <span>Open Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* LIVE REGISTERED FACILITIES SECTION */}
      <section id="facilities" className="py-20 bg-[#DDE3E8] border-t border-b border-[#CCD5DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-[#75456E] mb-2">
                <span>Section 03</span>
                <span>&bull;</span>
                <span className="text-[#EAAA00] font-bold">Real Data</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#3A0F34] tracking-tight uppercase">
                Registered Parking Facilities
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#3A0F34]/80">
                Database-verified locations with active surveillance and slot counters.
              </p>
            </div>

            <Link
              href="/parking"
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#3A0F34] hover:text-[#EAAA00]"
            >
              <span>View Interactive Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Lots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingLots ? (
              <div className="col-span-full py-12 text-center text-xs font-mono text-[#75456E]">
                Fetching active facilities from MongoDB...
              </div>
            ) : lots.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs font-mono text-[#75456E]">
                No facilities registered currently.
              </div>
            ) : (
              lots.map((lot) => (
                <div
                  key={lot._id}
                  className="bg-[#EAEFF2] border border-[#CCD5DC] hover:border-[#3A0F34] p-5 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 bg-[#3A0F34] text-[#EAAA00] text-[10px] font-mono uppercase font-bold tracking-wider rounded-sm">
                        {lot.city}
                      </span>
                      <span className="text-xs font-bold text-[#3A0F34]">
                        ₹{lot.hourlyRate}/hr
                      </span>
                    </div>

                    <h3 className="font-extrabold text-[#3A0F34] text-base leading-snug mb-2">
                      {lot.name}
                    </h3>
                    <p className="text-xs text-[#3A0F34]/70 line-clamp-2 mb-4">
                      {lot.address}
                    </p>

                    <div className="space-y-1.5 text-[11px] font-mono text-[#75456E] border-t border-[#CCD5DC] pt-3">
                      <div className="flex justify-between">
                        <span>Total Bays:</span>
                        <span className="font-bold text-[#3A0F34]">{lot.totalCapacity} slots</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Operating Hours:</span>
                        <span className="font-bold text-[#3A0F34]">{lot.openingHours}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#CCD5DC]">
                    <Link
                      href={`/parking/${lot._id}`}
                      className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-[#3A0F34] text-[#DDE3E8] hover:text-[#EAAA00] text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#EAAA00]" />
                      <span>Select This Lot</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ARCHITECTURAL FOOTER */}
      <footer className="bg-[#3A0F34] text-[#DDE3E8] border-t border-[#541D4C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Col 1 */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-sm bg-[#EAAA00] text-[#3A0F34] flex items-center justify-center font-bold text-sm">
                  P
                </div>
                <span className="font-black text-sm uppercase tracking-tight text-[#DDE3E8]">
                  Where Did I Park?
                </span>
              </div>
              <p className="text-xs text-[#CCD5DC] leading-relaxed">
                Smart Two-Wheeler Parking Management System. Engineered for motorcycle and scooter riders, gate attendants, and city administrators across India.
              </p>
              <div className="text-[10px] font-mono text-[#EAAA00]">
                ICE SILVER &bull; DEEP AUBERGINE &bull; MARIGOLD
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#EAAA00] font-bold">
                Portals &amp; Roles
              </h4>
              <ul className="space-y-2 text-xs text-[#CCD5DC]">
                <li>
                  <Link href="/dashboard" className="hover:text-[#EAAA00]">
                    Rider Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/attendant" className="hover:text-[#EAAA00]">
                    Parking Attendant Booth
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-[#EAAA00]">
                    Administrator Command Center
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/my-parking" className="hover:text-[#EAAA00]">
                    Active QR Ticket
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#EAAA00] font-bold">
                Locations
              </h4>
              <ul className="space-y-2 text-xs text-[#CCD5DC]">
                <li>Connaught Place, New Delhi</li>
                <li>Koramangala 5th Block, Bengaluru</li>
                <li>Bandra West Station, Mumbai</li>
                <li>Shivaji Nagar Metro, Pune</li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#EAAA00] font-bold">
                Security &amp; Integrity
              </h4>
              <p className="text-xs text-[#CCD5DC] leading-relaxed">
                Atomic database slot transactions prevent double booking. All pricing reflects registered Indian Rupee (₹) rates.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-block px-3 py-1.5 bg-[#541D4C] text-[#EAAA00] hover:bg-[#EAAA00] hover:text-[#3A0F34] transition-colors rounded-sm text-xs font-mono uppercase font-bold"
                >
                  Authorized Login &rarr;
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#541D4C] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#CCD5DC]/70">
            <div>
              &copy; {new Date().getFullYear()} Where Did I Park? Two-Wheeler Management. All rights reserved.
            </div>
            <div className="mt-3 sm:mt-0 flex space-x-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Audit Log</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
