"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { MapPin, User, LogOut, Menu, X, Shield, Clock, Bike } from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
          setActiveSession(data.activeSession);
        } else {
          setCurrentUser(null);
          setActiveSession(null);
        }
      })
      .catch(() => {
        setCurrentUser(null);
      });
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setActiveSession(null);
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border-subtle shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-md bg-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-ink-primary tracking-tight text-base sm:text-lg">
                Where Did I Park?
              </span>
              <span className="text-[11px] text-ink-secondary -mt-1 hidden sm:inline">
                Two-Wheeler Parking Management
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/parking"
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith("/parking")
                  ? "text-brand-500"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              Find Parking
            </Link>

            {currentUser && (
              <>
                <Link
                  href="/dashboard/my-parking"
                  className={`text-sm font-medium transition-colors flex items-center space-x-1 ${
                    pathname === "/dashboard/my-parking"
                      ? "text-brand-500"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>My Parking</span>
                  {activeSession && (
                    <span className="w-2 h-2 rounded-full bg-status-available animate-pulse" />
                  )}
                </Link>

                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    pathname === "/dashboard"
                      ? "text-brand-500"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  Dashboard
                </Link>

                {(currentUser.role === "attendant" || currentUser.role === "admin") && (
                  <Link
                    href="/attendant"
                    className="text-sm font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center space-x-1 hover:bg-emerald-100"
                  >
                    <Bike className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Attendant Booth</span>
                  </Link>
                )}

                {currentUser.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center space-x-1 hover:bg-amber-100"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* User actions */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center space-x-2 text-sm text-ink-primary hover:text-brand-500"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-subtle border border-border-subtle flex items-center justify-center text-ink-secondary">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-ink-secondary hover:text-status-occupied rounded-md transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-ink-secondary hover:text-ink-primary px-3 py-2 rounded-button"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-button transition-colors shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-ink-secondary hover:text-ink-primary"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-subtle bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/parking"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-ink-secondary hover:text-ink-primary rounded-md"
          >
            Find Parking
          </Link>
          {currentUser ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-ink-secondary hover:text-ink-primary rounded-md"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/my-parking"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-ink-secondary hover:text-ink-primary rounded-md"
              >
                My Parking {activeSession && "(Active Session)"}
              </Link>
              <Link
                href="/dashboard/vehicle"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-ink-secondary hover:text-ink-primary rounded-md"
              >
                My Vehicles
              </Link>
              <Link
                href="/dashboard/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-ink-secondary hover:text-ink-primary rounded-md"
              >
                Parking History
              </Link>
              <Link
                href="/dashboard/incidents"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-ink-secondary hover:text-ink-primary rounded-md"
              >
                Security Incidents
              </Link>
              {(currentUser.role === "attendant" || currentUser.role === "admin") && (
                <Link
                  href="/attendant"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-emerald-800 bg-emerald-50 rounded-md"
                >
                  Attendant Booth
                </Link>
              )}
              {currentUser.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-amber-700 bg-amber-50 rounded-md"
                >
                  Admin Panel
                </Link>
              )}
              <div className="pt-2 border-t border-border-subtle flex justify-between items-center">
                <span className="text-sm font-medium text-ink-primary">
                  {currentUser.name}
                </span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-sm text-status-occupied font-medium"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-border-subtle flex flex-col space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center w-full py-2 border border-border-subtle rounded-button text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center w-full py-2 bg-brand-500 text-white rounded-button text-sm font-medium"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
