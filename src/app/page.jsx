"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/brand/Logo";
import {
  Search,
  MapPin,
  Bike,
  ArrowRight,
  CheckCircle,
  X,
  Layers,
  Receipt,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";

export default function HomePage() {
  const [lots, setLots] = useState([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const router = useRouter();

  const fetchAuthUser = () => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));
  };

  useEffect(() => {
    fetchAuthUser();

    const handleFocus = () => fetchAuthUser();
    const handleAuthChange = () => fetchAuthUser();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setUserDropdownOpen(false);
      window.dispatchEvent(new Event("auth-changed"));
      toast.success("Signed out successfully");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  useEffect(() => {
    fetch("/api/parking-lots")
      .then((res) => res.json())
      .then((data) => {
        if (data.lots) setLots(data.lots);
      })
      .catch((err) => console.error("Error loading lots:", err))
      .finally(() => setLoadingLots(false));
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#DDE3E8",
        color: "#18212F",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: high-quality;
        }

        /* Hero Primary Button Hotspot & Focus */
        .hero-find-btn {
          position: absolute;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-decoration: none;
          background-color: #5EE819;
          color: #111111;
          outline: none;
          border-radius: 0px;
          border: none;
          box-sizing: border-box;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-find-btn:hover {
          background-color: #49DE0B !important;
          box-shadow: 0 0 28px rgba(94, 232, 25, 0.85) !important;
          transform: translateY(-1px);
        }

        .hero-find-btn:active {
          transform: translateY(0px) scale(0.99);
        }

        .hero-find-btn:focus-visible {
          outline: 3px solid #111111;
          outline-offset: 2px;
        }

        .hero-hotspot-nav:hover {
          background-color: rgba(94, 232, 25, 0.14);
          box-shadow: 0 0 0 2px rgba(94, 232, 25, 0.45);
        }

        .hero-hotspot-btn:hover {
          box-shadow: 0 0 24px rgba(94, 232, 25, 0.75), 0 0 0 2px #5EE819;
          transform: scale(1.015);
        }

        .hero-hotspot-radar:hover {
          background-color: rgba(94, 232, 25, 0.1);
          box-shadow: 0 0 20px rgba(94, 232, 25, 0.35);
        }

        .card-interface {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card-interface:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(43, 13, 40, 0.12);
        }

        .lot-card {
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .lot-card:hover {
          transform: translateY(-3px);
          border-color: #2B0D28 !important;
        }

        .navbar-link-item:hover {
          color: #49DE0B !important;
          transform: translateY(-1px);
        }

        .navbar-search-btn:hover {
          color: #49DE0B !important;
          transform: scale(1.1);
        }

        .navbar-signup-btn:hover {
          background-color: #43D800 !important;
          box-shadow: 0 0 20px rgba(94, 232, 25, 0.75) !important;
          transform: translateY(-1px) scale(1.02);
        }
      `}</style>

      {/* ═════════════════════════════════════════════════════════════════
          SEARCH MODAL OVERLAY
      ═════════════════════════════════════════════════════════════════ */}
      {searchOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(29, 12, 27, 0.78)",
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
              backgroundColor: "#1D0C1B",
              border: "2px solid #5EE819",
              width: "92%",
              maxWidth: "620px",
              padding: "24px",
              boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
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
                  color: "#5EE819",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
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
                  color: "#CCD5DC",
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
                placeholder="Search location, landmark, metro station, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    window.location.href = `/parking${
                      searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""
                    }`;
                  }
                }}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  backgroundColor: "#2B0D28",
                  border: "1px solid rgba(94, 232, 25, 0.4)",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "inherit",
                }}
                autoFocus
              />
              <Link
                href={`/parking${
                  searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""
                }`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 24px",
                  backgroundColor: "#5EE819",
                  color: "#111",
                  fontWeight: 900,
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Search
              </Link>
            </div>

            <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: "rgba(204,213,220,0.6)" }}>Quick:</span>
              {["Connaught Place", "Koramangala", "Bandra West", "Shivaji Nagar"].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSearchQuery(city);
                    window.location.href = `/parking?search=${encodeURIComponent(city)}`;
                  }}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#CCD5DC",
                    fontSize: "11px",
                    padding: "3px 8px",
                    cursor: "pointer",
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
          EXACT 4K HERO SECTION & NAVIGATION
          Fitted perfectly to 100vh viewport height without vertical overflow.
          Width and height managed directly to keep full visual in view.
      ═════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          backgroundColor: "#DDE3E8",
          borderBottom: "1px solid rgba(180,192,200,0.6)",
          overflow: "hidden",
        }}
      >
        {/* ═════════════════════════════════════════════════════════════════
            BOLD & CRISP PREMIUM TOP NAVBAR (HTML & CSS)
        ═════════════════════════════════════════════════════════════════ */}
        <header
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "64px",
            backgroundColor: "#DDE3E8",
            borderBottom: "1px solid rgba(180, 192, 200, 0.7)",
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 4vw",
          }}
        >
          {/* Brand Logo */}
          <div style={{ flexShrink: 0, marginRight: "32px" }}>
            <Logo size={36} />
          </div>

          {/* Navigation Links - Dynamic Auth Integration */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(16px, 2.5vw, 40px)",
            }}
          >
            <Link
              href="/"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "#49DE0B",
                textDecoration: "none",
                borderBottom: "2.5px solid #49DE0B",
                paddingBottom: "4px",
                transition: "color 0.15s ease",
              }}
            >
              Home
            </Link>

            <Link
              href="/parking"
              className="navbar-link-item"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "#2B0D28",
                textDecoration: "none",
                paddingBottom: "4px",
                transition: "color 0.15s ease",
              }}
            >
              Find Parking
            </Link>

            {currentUser ? (
              <>
                <Link
                  href="/dashboard/my-parking"
                  className="navbar-link-item"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "#2B0D28",
                    textDecoration: "none",
                    paddingBottom: "4px",
                    transition: "color 0.15s ease",
                  }}
                >
                  My Parking
                </Link>

                <Link
                  href="/dashboard"
                  className="navbar-link-item"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "#2B0D28",
                    textDecoration: "none",
                    paddingBottom: "4px",
                    transition: "color 0.15s ease",
                  }}
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <a
                  href="#how-it-works"
                  className="navbar-link-item"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "#2B0D28",
                    textDecoration: "none",
                    paddingBottom: "4px",
                    transition: "color 0.15s ease",
                  }}
                >
                  How It Works
                </a>

                <a
                  href="#features"
                  className="navbar-link-item"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "#2B0D28",
                    textDecoration: "none",
                    paddingBottom: "4px",
                    transition: "color 0.15s ease",
                  }}
                >
                  Features
                </a>

                <a
                  href="#facilities"
                  className="navbar-link-item"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "#2B0D28",
                    textDecoration: "none",
                    paddingBottom: "4px",
                    transition: "color 0.15s ease",
                  }}
                >
                  About
                </a>
              </>
            )}
          </nav>

          {/* Right Action Items: Search, Log In / User Profile Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(12px, 1.8vw, 24px)",
            }}
          >
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                background: "transparent",
                border: "none",
                color: "#2B0D28",
                cursor: "pointer",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.15s ease",
              }}
              className="navbar-search-btn"
              aria-label="Open search drawer"
              title="Search Parking Lots"
            >
              <Search style={{ width: "20px", height: "20px", strokeWidth: 2.4 }} />
            </button>

            {currentUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
                {/* User Profile Pill */}
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: "#FFFFFF",
                      border: "1.5px solid #2B0D28",
                      padding: "5px 12px 5px 6px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(43, 13, 40, 0.08)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        backgroundColor: "#2B0D28",
                        color: "#5EE819",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 900,
                        border: "1px solid #5EE819",
                        flexShrink: 0,
                      }}
                    >
                      {currentUser.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.1 }}>
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 900,
                          fontSize: "12px",
                          color: "#18212F",
                          maxWidth: "140px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {currentUser.name}
                      </span>
                      <span
                        style={{
                          fontSize: "9.5px",
                          fontWeight: 800,
                          color: "#176B5B",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginTop: "2px",
                        }}
                      >
                        {currentUser.role === "admin"
                          ? "Admin"
                          : currentUser.role === "attendant"
                          ? "Attendant"
                          : "Rider"}
                      </span>
                    </div>
                    <ChevronDown
                      style={{
                        width: "14px",
                        height: "14px",
                        color: "#2B0D28",
                        transform: userDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                        flexShrink: 0,
                      }}
                    />
                  </button>

                  {/* Luxury Dropdown Menu */}
                  {userDropdownOpen && (
                    <>
                      <div
                        style={{ position: "fixed", inset: 0, zIndex: 40 }}
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "calc(100% + 8px)",
                          width: "240px",
                          backgroundColor: "#FFFFFF",
                          border: "1.5px solid #2B0D28",
                          borderRadius: "14px",
                          boxShadow: "0 18px 36px rgba(43, 13, 40, 0.18)",
                          zIndex: 50,
                          padding: "10px",
                        }}
                      >
                        <div
                          style={{
                            padding: "8px 10px",
                            backgroundColor: "#F7F8FA",
                            borderRadius: "10px",
                            border: "1px solid #E2E8F0",
                            marginBottom: "8px",
                          }}
                        >
                          <p style={{ fontSize: "12px", fontWeight: 900, color: "#18212F", margin: 0 }}>
                            {currentUser.name}
                          </p>
                          <p style={{ fontSize: "10.5px", color: "#667085", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {currentUser.email}
                          </p>
                        </div>

                        <Link
                          href={currentUser.role === "admin" ? "/admin" : currentUser.role === "attendant" ? "/attendant" : "/dashboard"}
                          onClick={() => setUserDropdownOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#18212F",
                            textDecoration: "none",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F1F5F9")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <User style={{ width: "14px", height: "14px", color: "#176B5B" }} />
                          <span>Go to Dashboard</span>
                        </Link>

                        <Link
                          href="/dashboard/my-parking"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#18212F",
                            textDecoration: "none",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F1F5F9")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <MapPin style={{ width: "14px", height: "14px", color: "#176B5B" }} />
                          <span>My Active Parking</span>
                        </Link>

                        <Link
                          href="/dashboard/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#18212F",
                            textDecoration: "none",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F1F5F9")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <Shield style={{ width: "14px", height: "14px", color: "#176B5B" }} />
                          <span>Profile &amp; Settings</span>
                        </Link>

                        <div style={{ height: "1px", backgroundColor: "#E2E8F0", margin: "6px 0" }} />

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleLogout();
                          }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#DC2626",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FEE2E2")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <LogOut style={{ width: "14px", height: "14px" }} />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Direct Log Out Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "11px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "#2B0D28",
                    backgroundColor: "transparent",
                    border: "1.5px solid #2B0D28",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#DC2626";
                    e.currentTarget.style.borderColor = "#DC2626";
                    e.currentTarget.style.color = "#FFFFFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#2B0D28";
                    e.currentTarget.style.color = "#2B0D28";
                  }}
                  title="Log Out"
                >
                  <LogOut style={{ width: "13px", height: "13px" }} />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <>
                {/* Log In */}
                <Link
                  href="/login"
                  className="navbar-link-item"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "#2B0D28",
                    textDecoration: "none",
                    transition: "color 0.15s ease",
                  }}
                >
                  Log In
                </Link>

                {/* Sign Up CTA Button */}
                <Link
                  href="/register"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 24px",
                    backgroundColor: "#5EE819",
                    color: "#111",
                    fontWeight: 900,
                    fontSize: "12px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    borderRadius: "3px",
                    boxShadow: "0 2px 10px rgba(94, 232, 25, 0.4)",
                    transition: "all 0.2s ease",
                  }}
                  className="navbar-signup-btn"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </header>

        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Razor-sharp 2.5K / 4K composite visual - 100% Full Width */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/landing-design-2k.jpg?v=clean2"
            alt="Where Did I Park? - Find your spot. Remember where. Two-Wheeler Parking Management"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "fill",
              display: "block",
              userSelect: "none",
              imageRendering: "-webkit-optimize-contrast",
            }}
            loading="eager"
            decoding="sync"
          />

          {/* ═════════════════════════════════════════════════════
              CRISP 4K VECTOR ELEMENTS (100% Sharp Typography & Button)
          ═════════════════════════════════════════════════════ */}

          {/* 1. Vector Description Paragraph (Zero Compression Blur, Native Font Crispness) */}
          <p
            style={{
              position: "absolute",
              top: "62.93%",
              left: "6.25%",
              width: "22.5%",
              maxWidth: "470px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(12px, 0.94vw, 15px)",
              lineHeight: "1.52",
              color: "#18212F",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              userSelect: "none",
              zIndex: 24,
            }}
          >
            Check nearby parking lots, get a confirmed slot, save your vehicle location, and manage your parking sessions in one place.
          </p>

          {/* 2. Primary CTA Button: FIND PARKING → (100% Vector Crisp, Exact Match) */}
          <Link
            href="/parking"
            className="hero-find-btn"
            style={{
              top: "71.79%",
              left: "6.21%",
              width: "17.73%",
              minWidth: "240px",
              height: "6.16%",
              minHeight: "44px",
              padding: "0 clamp(18px, 1.8vw, 32px)",
              fontWeight: 900,
              fontSize: "clamp(11.5px, 0.82vw, 13.5px)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              zIndex: 25,
            }}
            aria-label="Find Parking - Browse Available Two-Wheeler Bays"
            title="Find Parking"
          >
            <span>Find Parking</span>
            <svg
              width="44"
              height="12"
              viewBox="0 0 44 12"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M0 6H40M40 6L33 1.5M40 6L33 10.5"
                stroke="#111111"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          {/* 3. Vector Tag: PARK SAVE RETRIEVE (Crisp Architectural Detail) */}
          <div
            style={{
              position: "absolute",
              top: "86.92%",
              left: "6.09%",
              display: "flex",
              alignItems: "stretch",
              gap: "14px",
              zIndex: 24,
              userSelect: "none",
            }}
          >
            <div
              style={{
                width: "2px",
                backgroundColor: "#8C9BA5",
                borderRadius: "1px",
              }}
            />
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(9px, 0.65vw, 11px)",
                fontWeight: 800,
                letterSpacing: "0.22em",
                lineHeight: "1.6",
                color: "#4A5568",
                textTransform: "uppercase",
              }}
            >
              Park<br />Save<br />Retrieve
            </div>
          </div>

          {/* E. DEDICATED CRISP RIGHT SIDEBAR (100% Vector HTML) */}
          <div
            style={{
              position: "absolute",
              top: "64px",
              bottom: 0,
              right: 0,
              width: "12.5%",
              minWidth: "125px",
              backgroundColor: "#DDE3E8",
              borderLeft: "1px solid rgba(180, 192, 200, 0.7)",
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "32px 12px 24px 12px",
            }}
          >
            {/* Location Saved & Radar */}
            <Link
              href="/dashboard/my-parking"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                textDecoration: "none",
                cursor: "pointer",
              }}
              aria-label="My Saved Location - Return to Your Slot"
              title="View Active Saved Location"
            >
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "10.5px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "#2B0D28",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                Location<br />Saved
              </div>

              {/* Sharp Vector Radar Target */}
              <div
                style={{
                  position: "relative",
                  width: "74px",
                  height: "74px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "2px solid rgba(94, 232, 25, 0.9)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: "11px",
                    borderRadius: "50%",
                    border: "1.5px dashed rgba(94, 232, 25, 0.6)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "-4px",
                    right: "-4px",
                    height: "1.5px",
                    backgroundColor: "rgba(94, 232, 25, 0.55)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "-4px",
                    bottom: "-4px",
                    width: "1.5px",
                    backgroundColor: "rgba(94, 232, 25, 0.55)",
                  }}
                />
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    backgroundColor: "#5EE819",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 16px rgba(94, 232, 25, 0.85)",
                    zIndex: 2,
                  }}
                >
                  <MapPin style={{ width: "15px", height: "15px", color: "#111", fill: "#111" }} />
                </div>
              </div>
            </Link>

            {/* 01 FIND PARK REMEMBER */}
            <div
              style={{
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  fontSize: "13px",
                  color: "#2B0D28",
                  fontFamily: "'Inter', monospace",
                  letterSpacing: "0.08em",
                }}
              >
                01
              </div>
              <div
                style={{
                  width: "22px",
                  height: "2px",
                  backgroundColor: "#2B0D28",
                  margin: "6px auto",
                }}
              />
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "10px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  color: "#2B0D28",
                  lineHeight: 1.9,
                }}
              >
                Find<br />Park<br />Remember
              </div>
            </div>

            {/* SAME CITY MORE FREEDOM */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: "3.5px",
                  height: "40px",
                  backgroundColor: "#5EE819",
                  borderRadius: "1px",
                }}
              />
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "10px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "#2B0D28",
                  lineHeight: 1.8,
                }}
              >
                Same City<br />More Freedom
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          HOW IT WORKS - 3 DEDICATED INTERFACES
          1) Rider (Book slots, QR pass)
          2) Gate Attendant (Number plate check-in / check-out)
          3) Administrator (City overview, live counts, slot status)
      ═════════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        style={{
          padding: "88px 36px",
          maxWidth: "1320px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "56px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#5EE819",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: "#2B0D28",
              }}
            >
              Complete Two-Wheeler Lifecycle
            </span>
          </div>
          <h2
            style={{
              fontWeight: 900,
              fontSize: "clamp(30px, 4.2vw, 50px)",
              color: "#2B0D28",
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            How The System Works
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#263238",
              fontWeight: 500,
              maxWidth: "680px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Three dedicated interfaces working simultaneously on top of MongoDB database records.
            Real-time availability, instant plate check-in, and multi-location management.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "28px",
          }}
        >
          {/* Card 1: Rider */}
          <div
            className="card-interface"
            style={{
              backgroundColor: "#fff",
              border: "2px solid #BAC4CC",
              padding: "36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: "#2B0D28",
                  }}
                >
                  01 &bull; Rider
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    backgroundColor: "#2B0D28",
                    color: "#5EE819",
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Mobile &amp; Web
                </span>
              </div>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  backgroundColor: "#2B0D28",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "22px",
                  borderRadius: "2px",
                }}
              >
                <Bike style={{ width: "24px", height: "24px", color: "#5EE819" }} />
              </div>
              <h3
                style={{
                  fontWeight: 900,
                  fontSize: "22px",
                  color: "#2B0D28",
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                Find &amp; Remember
              </h3>
              <p
                style={{
                  fontSize: "13.5px",
                  color: "#263238",
                  fontWeight: 500,
                  lineHeight: 1.65,
                  marginBottom: "24px",
                }}
              >
                Find vacant two-wheeler bays on live OpenStreetMap, book your designated slot,
                generate an encrypted QR pass, and save exact location markers to easily navigate
                back.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  borderTop: "1.5px solid #BAC4CC",
                  paddingTop: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[
                  "Interactive map slot availability",
                  "Conflict-free atomic slot booking",
                  "Digital QR ticket with return pin",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "12.5px",
                      color: "#18212F",
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle
                      style={{ width: "16px", height: "16px", color: "#5EE819", flexShrink: 0 }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ paddingTop: "24px", borderTop: "1.5px solid #BAC4CC", marginTop: "24px" }}>
              <Link
                href="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  backgroundColor: "#2B0D28",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderRadius: "2px",
                }}
              >
                <span>Open Rider Dashboard</span>
                <ArrowRight style={{ width: "16px", height: "16px" }} />
              </Link>
            </div>
          </div>

          {/* Card 2: Gate Attendant */}
          <div
            className="card-interface"
            style={{
              backgroundColor: "#1D0C1B",
              border: "2px solid #1D0C1B",
              padding: "36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                backgroundColor: "#5EE819",
              }}
            />
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: "#5EE819",
                  }}
                >
                  02 &bull; Gate Personnel
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    backgroundColor: "#5EE819",
                    color: "#111",
                    fontSize: "10px",
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Ground Station
                </span>
              </div>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  backgroundColor: "#5EE819",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "22px",
                }}
              >
                <Receipt style={{ width: "24px", height: "24px", color: "#111" }} />
              </div>
              <h3
                style={{
                  fontWeight: 900,
                  fontSize: "22px",
                  color: "#fff",
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                Booth Gate Check-In
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(204,213,220,0.85)",
                  lineHeight: 1.65,
                  marginBottom: "24px",
                }}
              >
                Dedicated gate terminal for facility attendants. Check in vehicles by number plate,
                automatically assign vacant slots, maintain live parked records, and calculate
                departure fees in ₹.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  borderTop: "1px solid #541D4C",
                  paddingTop: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[
                  "Rapid registration plate check-in",
                  "Real-time attendance of parked vehicles",
                  "Checkout receipt with duration & ₹ fees",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "12px",
                      color: "rgba(204,213,220,0.85)",
                      fontWeight: 500,
                    }}
                  >
                    <CheckCircle
                      style={{ width: "15px", height: "15px", color: "#5EE819", flexShrink: 0 }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ paddingTop: "24px", borderTop: "1px solid #541D4C", marginTop: "24px" }}>
              <Link
                href="/attendant"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  backgroundColor: "#5EE819",
                  color: "#111",
                  fontWeight: 900,
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                <span>Launch Booth Station</span>
                <ArrowRight style={{ width: "16px", height: "16px" }} />
              </Link>
            </div>
          </div>

          {/* Card 3: Administrator */}
          <div
            className="card-interface"
            style={{
              backgroundColor: "#fff",
              border: "2px solid #CDD5DC",
              padding: "36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: "#2B0D28",
                  }}
                >
                  03 &bull; Oversight
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    backgroundColor: "#2B0D28",
                    color: "#5EE819",
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Admin Center
                </span>
              </div>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  backgroundColor: "#2B0D28",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "22px",
                }}
              >
                <Layers style={{ width: "24px", height: "24px", color: "#5EE819" }} />
              </div>
              <h3
                style={{
                  fontWeight: 900,
                  fontSize: "22px",
                  color: "#2B0D28",
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                Command Center
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "rgba(43,13,40,0.72)",
                  lineHeight: 1.65,
                  marginBottom: "24px",
                }}
              >
                Multi-location facility supervision. Inspect live vehicle counts across city lots,
                verify which parking lots have vacancies or are full, adjust slot status, and review
                security incidents.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  borderTop: "1px solid #CDD5DC",
                  paddingTop: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[
                  "Multi-lot live occupancy breakdown",
                  "Inspect parked plate numbers in real time",
                  "Security incident audit & CSV reports",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "12px",
                      color: "#2B0D28",
                      fontWeight: 500,
                    }}
                  >
                    <CheckCircle
                      style={{ width: "15px", height: "15px", color: "#5EE819", flexShrink: 0 }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ paddingTop: "24px", borderTop: "1px solid #CDD5DC", marginTop: "24px" }}>
              <Link
                href="/admin"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  backgroundColor: "#2B0D28",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                <span>Open Command Center</span>
                <ArrowRight style={{ width: "16px", height: "16px" }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          ACTIVE PARKING LOTS (Live MongoDB Backend Data)
      ═════════════════════════════════════════════════════════════════ */}
      <section
        id="facilities"
        style={{
          padding: "88px 36px",
          backgroundColor: "#D4DAE0",
          borderTop: "1px solid #CDD5DC",
          borderBottom: "1px solid #CDD5DC",
        }}
      >
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: "48px",
              gap: "20px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  color: "rgba(43,13,40,0.6)",
                  marginBottom: "8px",
                }}
              >
                Database Records &bull; Two-Wheeler Facilities
              </div>
              <h2
                style={{
                  fontWeight: 900,
                  fontSize: "clamp(26px, 3.5vw, 42px)",
                  color: "#2B0D28",
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Active Parking Lots
              </h2>
              <p style={{ fontSize: "13px", color: "rgba(43,13,40,0.68)" }}>
                Verified locations across India with slot capacity and rates in Indian Rupees.
              </p>
            </div>
            <Link
              href="/parking"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#2B0D28",
                textDecoration: "none",
                padding: "8px 16px",
                border: "1.5px solid #2B0D28",
              }}
            >
              Explore All on Map <ArrowRight style={{ width: "15px", height: "15px" }} />
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {loadingLots ? (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  padding: "48px",
                  fontSize: "12px",
                  color: "rgba(43,13,40,0.5)",
                  fontFamily: "monospace",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Loading facility records...
              </div>
            ) : lots.length === 0 ? (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  padding: "48px",
                  fontSize: "12px",
                  color: "rgba(43,13,40,0.5)",
                  fontFamily: "monospace",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                No facilities found. Seed data is available at /api/seed.
              </div>
            ) : (
              lots.map((lot, idx) => (
                <div
                  key={lot._id || lot.id || `lot-${idx}`}
                  className="lot-card"
                  style={{
                    backgroundColor: "#fff",
                    border: "2px solid #CDD5DC",
                    padding: "26px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "14px",
                      }}
                    >
                      <span
                        style={{
                          padding: "3px 8px",
                          backgroundColor: "#2B0D28",
                          color: "#5EE819",
                          fontSize: "10px",
                          fontWeight: 800,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        {lot.city}
                      </span>
                      <span style={{ fontWeight: 900, fontSize: "14px", color: "#2B0D28" }}>
                        ₹{lot.hourlyRate}/hr
                      </span>
                    </div>
                    <h3
                      style={{
                        fontWeight: 900,
                        fontSize: "16px",
                        color: "#2B0D28",
                        marginBottom: "8px",
                        lineHeight: 1.3,
                      }}
                    >
                      {lot.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(43,13,40,0.65)",
                        marginBottom: "18px",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {lot.address}
                    </p>
                    <div
                      style={{
                        borderTop: "1px solid #CDD5DC",
                        paddingTop: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "11px",
                          fontFamily: "monospace",
                          color: "rgba(43,13,40,0.55)",
                        }}
                      >
                        <span>Total Bays:</span>
                        <span style={{ fontWeight: 800, color: "#2B0D28" }}>
                          {lot.totalCapacity} slots
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "11px",
                          fontFamily: "monospace",
                          color: "rgba(43,13,40,0.55)",
                        }}
                      >
                        <span>Hours:</span>
                        <span style={{ fontWeight: 800, color: "#2B0D28" }}>
                          {lot.openingHours}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: "22px" }}>
                    <Link
                      href={`/parking/${lot._id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "11px",
                        backgroundColor: "#2B0D28",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        textDecoration: "none",
                      }}
                    >
                      <MapPin style={{ width: "13px", height: "13px", color: "#5EE819" }} />
                      Select This Bay
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          FEATURES & INFRASTRUCTURE GUARANTEES
      ═════════════════════════════════════════════════════════════════ */}
      <section
        id="features"
        style={{
          padding: "88px 36px",
          maxWidth: "1320px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {[
            {
              Icon: ShieldCheck,
              title: "Atomic Allocation",
              desc: "Every slot claim uses MongoDB atomic operations. Duplicate bookings are impossible even during peak traffic.",
              green: false,
            },
            {
              Icon: MapPin,
              title: "Pin-Drop Location",
              desc: "Save your bike's exact parked coordinates. Never wander through crowded two-wheeler parking structures again.",
              green: true,
            },
            {
              Icon: Receipt,
              title: "Accurate ₹ Billing",
              desc: "Fair hourly tariffs computed precisely from entry to checkout timestamp. Digital receipt issued at gate clearance.",
              green: false,
            },
            {
              Icon: Layers,
              title: "Three Unified Roles",
              desc: "Riders, booth attendants, and city administrators all interact with the same synchronized dataset in real time.",
              green: true,
            },
          ].map(({ Icon, title, desc, green }) => (
            <div
              key={title}
              style={{
                padding: "28px",
                backgroundColor: "#fff",
                border: "2px solid #CDD5DC",
              }}
            >
              <Icon
                style={{
                  width: "28px",
                  height: "28px",
                  color: green ? "#5EE819" : "#2B0D28",
                  marginBottom: "16px",
                }}
              />
              <h4
                style={{
                  fontWeight: 900,
                  fontSize: "14px",
                  textTransform: "uppercase",
                  color: "#2B0D28",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                {title}
              </h4>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(43,13,40,0.72)",
                  lineHeight: 1.65,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          FOOTER
      ═════════════════════════════════════════════════════════════════ */}
      <footer
        style={{
          backgroundColor: "#1D0C1B",
          color: "#CCD5DC",
          borderTop: "1px solid #541D4C",
        }}
      >
        <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "64px 36px 40px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "36px",
              marginBottom: "48px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Logo variant="dark" size={34} />
              <p style={{ fontSize: "12px", color: "rgba(204,213,220,0.75)", lineHeight: 1.65 }}>
                Smart Two-Wheeler Parking Management System for riders, gate attendants, and city
                administrators across India.
              </p>
            </div>

            <div>
              <h5
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  color: "#5EE819",
                  marginBottom: "14px",
                }}
              >
                Portals
              </h5>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[
                  ["Rider Portal", "/dashboard"],
                  ["Attendant Gate Booth", "/attendant"],
                  ["Administrator Command Center", "/admin"],
                  ["Find Parking Map", "/parking"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      style={{
                        fontSize: "12px",
                        color: "rgba(204,213,220,0.75)",
                        textDecoration: "none",
                      }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  color: "#5EE819",
                  marginBottom: "14px",
                }}
              >
                Supported Regions
              </h5>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  fontSize: "12px",
                  color: "rgba(204,213,220,0.75)",
                }}
              >
                <li>Connaught Place, New Delhi</li>
                <li>Koramangala 5th Block, Bengaluru</li>
                <li>Bandra West Station, Mumbai</li>
                <li>Shivaji Nagar Metro, Pune</li>
              </ul>
            </div>

            <div>
              <h5
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  color: "#5EE819",
                  marginBottom: "14px",
                }}
              >
                Quick Access
              </h5>
              <Link
                href="/login"
                style={{
                  display: "inline-block",
                  padding: "11px 20px",
                  backgroundColor: "#5EE819",
                  color: "#111",
                  fontWeight: 900,
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                Sign In to Account &rarr;
              </Link>
            </div>
          </div>

          <div
            style={{
              paddingTop: "24px",
              borderTop: "1px solid #541D4C",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              fontSize: "11px",
              fontFamily: "monospace",
              color: "rgba(204,213,220,0.5)",
            }}
          >
            <span>&copy; {new Date().getFullYear()} Where Did I Park? All rights reserved.</span>
            <div style={{ display: "flex", gap: "24px" }}>
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
