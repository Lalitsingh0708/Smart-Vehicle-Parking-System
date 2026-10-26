import Link from "next/link";
import { Shield, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border-subtle mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
                P
              </div>
              <span className="font-semibold text-ink-primary tracking-tight">
                Where Did I Park?
              </span>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Two-wheeler parking management system. Designed for motorcycles, scooters, and electric bikes across India.
            </p>
            <div className="text-xs text-ink-muted">
              System-recorded occupancy &amp; slot tracking.
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              Parking Services
            </h4>
            <ul className="space-y-1.5 text-xs text-ink-secondary">
              <li>
                <Link href="/parking" className="hover:text-brand-500">
                  Find Available Parking
                </Link>
              </li>
              <li>
                <Link href="/dashboard/my-parking" className="hover:text-brand-500">
                  Active Parking Session
                </Link>
              </li>
              <li>
                <Link href="/dashboard/vehicle" className="hover:text-brand-500">
                  Register Two-Wheeler
                </Link>
              </li>
              <li>
                <Link href="/dashboard/history" className="hover:text-brand-500">
                  Parking History &amp; Receipts
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Support */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              Safety &amp; Compliance
            </h4>
            <ul className="space-y-1.5 text-xs text-ink-secondary">
              <li>
                <Link href="/dashboard/incidents" className="hover:text-brand-500">
                  Report Parking Incident
                </Link>
              </li>
              <li>
                <span className="text-ink-muted">
                  Theft, damage, or unauthorized parking reports
                </span>
              </li>
              <li>
                <span className="text-ink-muted">
                  Pricing rules in Indian Rupees (₹)
                </span>
              </li>
            </ul>
          </div>

          {/* Note / Disclaimer */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              Operational Note
            </h4>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Parking availability reflects system-recorded allocations and attendant confirmations. Incident reporting logs records for administrative review and does not substitute for police emergency response.
            </p>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-border-subtle flex flex-col sm:flex-row justify-between items-center text-xs text-ink-secondary">
          <p>© {new Date().getFullYear()} Where Did I Park? All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
