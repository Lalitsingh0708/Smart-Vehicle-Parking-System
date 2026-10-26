import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, MapPin, Bike, ShieldCheck, ArrowRight, Clock, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "Where Did I Park? | Two-Wheeler Parking Management",
  description:
    "Find available parking lots, allocate two-wheeler slots, generate digital QR tickets, and retrieve your parked bike or scooter.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white border-b border-border-subtle py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-200 rounded-md text-brand-700 text-xs font-semibold mb-5">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                <span>Smart Two-Wheeler Parking Management</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-ink-primary tracking-tight leading-tight">
                Find available parking. Never lose your slot again.
              </h1>

              <p className="mt-4 text-base sm:text-lg text-ink-secondary leading-relaxed">
                Check database-backed parking availability across two-wheeler bays, reserve your designated slot, receive a digital QR ticket, and navigate directly back to your motorcycle or scooter.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/parking">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Search className="w-4 h-4 mr-2" />
                    <span>Find Available Parking</span>
                  </Button>
                </Link>

                <Link href="/dashboard/my-parking">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    <MapPin className="w-4 h-4 mr-2 text-brand-500" />
                    <span>Return to Your Parking Slot</span>
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-ink-secondary">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-status-available" />
                  <span>Conflict-free atomic slot allocation</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-status-available" />
                  <span>Scannable digital QR tickets</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-status-available" />
                  <span>Security incident reporting</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Connected Modules */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">
              Three connected modules for complete parking management
            </h2>
            <p className="mt-2 text-sm text-ink-secondary">
              From parking discovery on interactive maps to digital QR exit verification and security reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Module 1 */}
            <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-ink-primary">
                1. Parking Discovery
              </h3>
              <p className="mt-2 text-sm text-ink-secondary leading-relaxed flex-1">
                Browse registered parking lots on interactive OpenStreetMap with India-aware geocoding. View real-time database-backed occupancy counts, hourly fees in Indian Rupees, and filter by available capacity.
              </p>
              <div className="mt-6 pt-4 border-t border-border-subtle">
                <Link
                  href="/parking"
                  className="text-sm font-semibold text-brand-500 hover:text-brand-600 inline-flex items-center"
                >
                  <span>Explore parking lots</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Module 2 */}
            <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Bike className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-ink-primary">
                2. Parking Allocation
              </h3>
              <p className="mt-2 text-sm text-ink-secondary leading-relaxed flex-1">
                Register your bike or scooter registration number. Select available zones and numbered slots with atomic concurrency safeguards that prevent double-booking. Generate an official digital QR parking ticket.
              </p>
              <div className="mt-6 pt-4 border-t border-border-subtle">
                <Link
                  href="/dashboard/vehicle"
                  className="text-sm font-semibold text-brand-500 hover:text-brand-600 inline-flex items-center"
                >
                  <span>Register a vehicle</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Module 3 */}
            <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-ink-primary">
                3. Vehicle Retrieval &amp; Security
              </h3>
              <p className="mt-2 text-sm text-ink-secondary leading-relaxed flex-1">
                Access your active parking session with exact zone, slot number, and directions. Complete authorized checkout, update availability instantly, and report security incidents or damage directly to administrators.
              </p>
              <div className="mt-6 pt-4 border-t border-border-subtle">
                <Link
                  href="/dashboard/my-parking"
                  className="text-sm font-semibold text-brand-500 hover:text-brand-600 inline-flex items-center"
                >
                  <span>View active session</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick CTA */}
        <section className="bg-brand-500 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Ready to find or manage two-wheeler parking?
              </h2>
              <p className="text-brand-100 text-sm mt-1">
                Sign in to your rider account or manage parking lots as an administrator.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/register">
                <button className="bg-white text-brand-500 hover:bg-brand-50 font-semibold px-5 py-2.5 rounded-button text-sm transition-colors shadow-xs">
                  Create Rider Account
                </button>
              </Link>
              <Link href="/login">
                <button className="bg-brand-600 text-white hover:bg-brand-700 font-semibold px-5 py-2.5 rounded-button text-sm transition-colors border border-brand-400/40">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
