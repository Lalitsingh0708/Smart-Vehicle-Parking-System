"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Logo from "@/components/brand/Logo";
import {
  Search,
  X,
  Menu,
  User,
  LogOut,
  MapPin,
  Bike,
  Shield,
  Clock,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const fetchAuthUser = () => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setActiveSession(data.activeSession || null);
        } else {
          setCurrentUser(null);
          setActiveSession(null);
        }
      })
      .catch(() => {
        setCurrentUser(null);
        setActiveSession(null);
      });
  };

  useEffect(() => {
    fetchAuthUser();
    setUserDropdownOpen(false);

    const handleFocus = () => fetchAuthUser();
    const handleAuthChange = () => fetchAuthUser();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setActiveSession(null);
      setUserDropdownOpen(false);
      window.dispatchEvent(new Event("auth-changed"));
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const handleSearchSubmit = (query) => {
    const term = query !== undefined ? query : searchQuery;
    setSearchOpen(false);
    setMobileMenuOpen(false);
    router.push(`/parking${term ? `?search=${encodeURIComponent(term)}` : ""}`);
  };

  const isHome = pathname === "/";
  const isFindParking = pathname.startsWith("/parking");
  const isMyParking = pathname === "/dashboard/my-parking";
  const isDashboard = pathname.startsWith("/dashboard") && !isMyParking;

  return (
    <>
      {/* ═════════════════════════════════════════════════════════════════
          SEARCH MODAL OVERLAY (Luxury Warm Beige & Forest Green)
      ═════════════════════════════════════════════════════════════════ */}
      {searchOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(28, 24, 21, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "90px",
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FAF7F2",
              border: "1.5px solid #B08528",
              width: "92%",
              maxWidth: "620px",
              padding: "24px",
              boxShadow: "0 24px 48px rgba(28, 24, 21, 0.25)",
              borderRadius: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#176B5B",
                  fontSize: "11px",
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <Search style={{ width: "16px", height: "16px" }} />
                <span>Search Two-Wheeler Parking</span>
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#706254",
                  cursor: "pointer",
                  padding: "4px",
                }}
                aria-label="Close search"
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Search by lot name, campus gate, block, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit();
                  }
                }}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #DFD1BD",
                  color: "#1C1815",
                  fontSize: "14px",
                  borderRadius: "10px",
                  outline: "none",
                  fontFamily: "'Inter', sans-serif",
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 22px",
                  backgroundColor: "#176B5B",
                  color: "#FFFFFF",
                  fontWeight: 900,
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: "0 2px 8px rgba(23, 107, 91, 0.3)",
                }}
              >
                Search
              </button>
            </div>

            <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#706254", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Quick:
              </span>
              {["Main Gate LPU", "34 Block LPU", "Phagwara", "Connaught Place", "Koramangala", "Bandra West"].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setSearchQuery(city);
                    handleSearchSubmit(city);
                  }}
                  style={{
                    background: "#FAF6EE",
                    border: "1px solid #DFD1BD",
                    color: "#1C1815",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          LUXURY MASTER NAVBAR (Warm Beige #FAF7F2, Forest Green #176B5B, Gold #D4AF37)
      ═════════════════════════════════════════════════════════════════ */}
      <header
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          height: "68px",
          backgroundColor: "#FAF7F2",
          borderBottom: "1px solid #E2D9CC",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(16px, 3.5vw, 48px)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Left: Brand Logo */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          <Logo size={42} />
        </div>

        {/* Center: Desktop Navigation Links (Centered in Navbar) */}
        <nav
          className="hidden md:flex"
          style={{
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(16px, 2.2vw, 36px)",
            flex: 1,
            margin: "0 24px",
          }}
        >
          {/* Visitor Landing Navigation (When logged out) */}
          {!currentUser ? (
            <>
              {/* HOME */}
              <Link
                href="/"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: isHome ? "#176B5B" : "#706254",
                  textDecoration: "none",
                  borderBottom: isHome ? "2px solid #D4AF37" : "2px solid transparent",
                  paddingBottom: "4px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isHome) e.currentTarget.style.color = "#176B5B";
                }}
                onMouseLeave={(e) => {
                  if (!isHome) e.currentTarget.style.color = "#706254";
                }}
              >
                Home
              </Link>

              {/* FIND PARKING */}
              <Link
                href="/parking"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: isFindParking ? "#176B5B" : "#706254",
                  textDecoration: "none",
                  borderBottom: isFindParking ? "2px solid #D4AF37" : "2px solid transparent",
                  paddingBottom: "4px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isFindParking) e.currentTarget.style.color = "#176B5B";
                }}
                onMouseLeave={(e) => {
                  if (!isFindParking) e.currentTarget.style.color = "#706254";
                }}
              >
                Find Parking
              </Link>

              {/* HOW IT WORKS */}
              <Link
                href="/#how-it-works"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#706254",
                  textDecoration: "none",
                  borderBottom: "2px solid transparent",
                  paddingBottom: "4px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#176B5B")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#706254")}
              >
                How It Works
              </Link>

              {/* FEATURES */}
              <Link
                href="/#features"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#706254",
                  textDecoration: "none",
                  borderBottom: "2px solid transparent",
                  paddingBottom: "4px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#176B5B")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#706254")}
              >
                Features
              </Link>

              {/* ABOUT */}
              <Link
                href="/#facilities"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#706254",
                  textDecoration: "none",
                  borderBottom: "2px solid transparent",
                  paddingBottom: "4px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#176B5B")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#706254")}
              >
                About
              </Link>
            </>
          ) : (
            /* Logged In Operational Navigation (Clean, Spacious, Uncluttered) */
            <>
              {/* HOME */}
              <Link
                href="/"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: isHome ? "#176B5B" : "#706254",
                  textDecoration: "none",
                  borderBottom: isHome ? "2px solid #D4AF37" : "2px solid transparent",
                  paddingBottom: "4px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isHome) e.currentTarget.style.color = "#176B5B";
                }}
                onMouseLeave={(e) => {
                  if (!isHome) e.currentTarget.style.color = "#706254";
                }}
              >
                Home
              </Link>

              {/* FIND PARKING */}
              <Link
                href="/parking"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: isFindParking ? "#176B5B" : "#706254",
                  textDecoration: "none",
                  borderBottom: isFindParking ? "2px solid #D4AF37" : "2px solid transparent",
                  paddingBottom: "4px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isFindParking) e.currentTarget.style.color = "#176B5B";
                }}
                onMouseLeave={(e) => {
                  if (!isFindParking) e.currentTarget.style.color = "#706254";
                }}
              >
                Find Parking
              </Link>

              {/* MY PARKING (with live pulsing dot if parked) */}
              <Link
                href="/dashboard/my-parking"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: isMyParking ? "#176B5B" : "#706254",
                  textDecoration: "none",
                  borderBottom: isMyParking ? "2px solid #D4AF37" : "2px solid transparent",
                  paddingBottom: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isMyParking) e.currentTarget.style.color = "#176B5B";
                }}
                onMouseLeave={(e) => {
                  if (!isMyParking) e.currentTarget.style.color = "#706254";
                }}
              >
                <span>My Parking</span>
                {activeSession && (
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#176B5B",
                      display: "inline-block",
                      boxShadow: "0 0 6px rgba(23, 107, 91, 0.8)",
                    }}
                  />
                )}
              </Link>

              {/* DASHBOARD */}
              <Link
                href="/dashboard"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: isDashboard ? "#176B5B" : "#706254",
                  textDecoration: "none",
                  borderBottom: isDashboard ? "2px solid #D4AF37" : "2px solid transparent",
                  paddingBottom: "4px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isDashboard) e.currentTarget.style.color = "#176B5B";
                }}
                onMouseLeave={(e) => {
                  if (!isDashboard) e.currentTarget.style.color = "#706254";
                }}
              >
                Dashboard
              </Link>

              {/* Attendant Booth Shortcut if attendant or admin */}
              {(currentUser.role === "attendant" || currentUser.role === "admin") && (
                <Link
                  href="/attendant"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: pathname.startsWith("/attendant") ? "#FFFFFF" : "#176B5B",
                    backgroundColor: pathname.startsWith("/attendant") ? "#176B5B" : "#EAF3EE",
                    border: "1px solid #B08528",
                    padding: "5px 12px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!pathname.startsWith("/attendant")) {
                      e.currentTarget.style.backgroundColor = "#176B5B";
                      e.currentTarget.style.color = "#FFFFFF";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!pathname.startsWith("/attendant")) {
                      e.currentTarget.style.backgroundColor = "#EAF3EE";
                      e.currentTarget.style.color = "#176B5B";
                    }
                  }}
                >
                  Booth
                </Link>
              )}

              {/* Admin Console Shortcut if admin */}
              {currentUser.role === "admin" && (
                <Link
                  href="/admin"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: pathname.startsWith("/admin") ? "#FFFFFF" : "#854D0E",
                    backgroundColor: pathname.startsWith("/admin") ? "#854D0E" : "#FEF3C7",
                    border: "1px solid #D97706",
                    padding: "5px 12px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right Action Items: Search, Log In, Sign Up / User Dropdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(12px, 1.8vw, 20px)",
            flexShrink: 0,
          }}
        >
          {/* Universal Search Trigger */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            style={{
              background: "#FAF6EE",
              border: "1px solid #DFD1BD",
              color: "#1C1815",
              cursor: "pointer",
              padding: "7px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
            aria-label="Open search drawer"
            title="Search Two-Wheeler Parking"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#176B5B";
              e.currentTarget.style.borderColor = "#176B5B";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#1C1815";
              e.currentTarget.style.borderColor = "#DFD1BD";
            }}
          >
            <Search style={{ width: "18px", height: "18px", strokeWidth: 2.2 }} />
          </button>

          {/* Conditional Auth Elements: Prominent Logged-In User Badge or Login/Sign Up */}
          {currentUser ? (
            <div className="relative flex items-center gap-2 sm:gap-2.5">
              {/* User Profile Dropdown Pill (Prominent Name Display) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-[#FAF6EE] hover:bg-white border border-[#DFD1BD] hover:border-[#176B5B] px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer group"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#176B5B] text-white flex items-center justify-center font-black text-xs border border-[#D4AF37] shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    {currentUser.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="font-black text-xs sm:text-[13px] text-[#1C1815] max-w-[130px] sm:max-w-[170px] truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] font-extrabold text-[#176B5B] uppercase tracking-wider mt-0.5">
                      {currentUser.role === "admin"
                        ? "Admin"
                        : currentUser.role === "attendant"
                        ? "Attendant"
                        : "Rider"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#706254] transition-transform duration-200 shrink-0 ${
                      userDropdownOpen ? "rotate-180 text-[#176B5B]" : ""
                    }`}
                  />
                </button>

                {/* Luxury Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-[#E2D9CC] rounded-2xl shadow-2xl z-50 p-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2.5 bg-[#FAF7F2] rounded-xl border border-[#EFE9DF] mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-lg bg-[#176B5B] text-white flex items-center justify-center font-black text-xs border border-[#D4AF37]">
                            {currentUser.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-black text-[#1C1815] truncate">
                              {currentUser.name}
                            </p>
                            <p className="text-[10.5px] font-medium text-[#706254] truncate">
                              {currentUser.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          href={
                            currentUser.role === "admin"
                              ? "/admin"
                              : currentUser.role === "attendant"
                              ? "/attendant"
                              : "/dashboard"
                          }
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[#1C1815] hover:bg-[#FAF6EE] hover:text-[#176B5B] transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-[#176B5B]" />
                          <span>Go to Dashboard</span>
                        </Link>

                        <Link
                          href="/dashboard/my-parking"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[#1C1815] hover:bg-[#FAF6EE] hover:text-[#176B5B] transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#176B5B]" />
                          <span>My Active Parking</span>
                        </Link>

                        <Link
                          href="/dashboard/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-[#1C1815] hover:bg-[#FAF6EE] hover:text-[#176B5B] transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5 text-[#176B5B]" />
                          <span>Profile &amp; Settings</span>
                        </Link>
                      </div>

                      <div className="border-t border-[#F0EBE1] my-1.5" />

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Direct Quick 1-Click Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DFD1BD] bg-[#FAF6EE] hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-[11px] font-black uppercase tracking-wider text-[#706254] transition-all cursor-pointer shadow-xs shrink-0"
                title="Log Out of your account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 1.5vw, 18px)" }}>
              {/* Log In Link */}
              <Link
                href="/login"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#1C1815",
                  textDecoration: "none",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#176B5B")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#1C1815")}
              >
                Log In
              </Link>

              {/* Sign Up Luxury Forest Green Button */}
              <Link
                href="/register"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 18px",
                  backgroundColor: "#176B5B",
                  color: "#FFFFFF",
                  fontWeight: 900,
                  fontSize: "11.5px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderRadius: "8px",
                  border: "1px solid #125448",
                  boxShadow: "0 2px 8px rgba(23, 107, 91, 0.25)",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#125448";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#176B5B";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="flex md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: "#FAF6EE",
              border: "1px solid #DFD1BD",
              color: "#1C1815",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "8px",
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X style={{ width: "22px", height: "22px" }} />
            ) : (
              <Menu style={{ width: "22px", height: "22px" }} />
            )}
          </button>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════
          MOBILE MENU ACCORDION (Warm Beige Luxury Theme)
      ═════════════════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div
          className="flex md:hidden flex-col"
          style={{
            position: "sticky",
            top: "68px",
            left: 0,
            right: 0,
            backgroundColor: "#FAF7F2",
            borderBottom: "2px solid #176B5B",
            zIndex: 39,
            padding: "16px 20px 24px 20px",
            gap: "14px",
            boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
          }}
        >
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: isHome ? "#176B5B" : "#1C1815",
              textDecoration: "none",
            }}
          >
            Home
          </Link>

          <Link
            href="/parking"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: isFindParking ? "#176B5B" : "#1C1815",
              textDecoration: "none",
            }}
          >
            Find Parking
          </Link>

          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#706254",
              textDecoration: "none",
            }}
          >
            How It Works
          </Link>

          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#706254",
              textDecoration: "none",
            }}
          >
            Features
          </Link>

          <Link
            href="/#facilities"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#706254",
              textDecoration: "none",
            }}
          >
            About
          </Link>

          {currentUser ? (
            <div style={{ paddingTop: "12px", borderTop: "1px solid #E2D9CC", display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Mobile User Header */}
              <div className="flex items-center gap-2.5 pb-2 border-b border-[#E2D9CC]">
                <div className="w-8 h-8 rounded-lg bg-[#176B5B] text-white flex items-center justify-center font-black text-sm border border-[#D4AF37]">
                  {currentUser.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-[#1C1815] truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] font-bold text-[#176B5B] uppercase tracking-wider">
                    {currentUser.role === "admin"
                      ? "Admin"
                      : currentUser.role === "attendant"
                      ? "Attendant"
                      : "Rider"}
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/my-parking"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: isMyParking ? "#176B5B" : "#1C1815",
                  textDecoration: "none",
                }}
              >
                My Parking {activeSession && "●"}
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#1C1815",
                  textDecoration: "none",
                }}
              >
                Dashboard
              </Link>
              {(currentUser.role === "attendant" || currentUser.role === "admin") && (
                <Link
                  href="/attendant"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "#176B5B",
                    textDecoration: "none",
                  }}
                >
                  Attendant Booth
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                style={{
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#BA2D2D",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ paddingTop: "12px", borderTop: "1px solid #E2D9CC", display: "flex", gap: "12px" }}>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "8px 16px",
                  border: "1px solid #DFD1BD",
                  color: "#1C1815",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 800,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderRadius: "8px",
                  backgroundColor: "#FAF6EE",
                }}
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "8px 16px",
                  backgroundColor: "#176B5B",
                  color: "#FFFFFF",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 900,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderRadius: "8px",
                }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
