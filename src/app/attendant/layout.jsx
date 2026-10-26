import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { ShieldCheck, LogOut, Bike, MapPin } from "lucide-react";

export const metadata = {
  title: "Attendant Booth | Where Did I Park?",
  description: "Parking attendant entrance & exit station for vehicle check-in and checkout.",
};

export default async function AttendantLayout({ children }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "attendant" && session.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      {/* Attendant Station Header */}
      <header className="bg-brand-500 text-white border-b border-brand-600 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-md bg-white text-brand-600 font-black text-lg flex items-center justify-center shadow-xs">
              P
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">
                  Where Did I Park?
                </span>
                <span className="text-[10px] bg-brand-600 px-2 py-0.5 rounded font-semibold uppercase tracking-wider text-brand-100 border border-brand-400/30">
                  Attendant Station
                </span>
              </div>
              <p className="text-[11px] text-brand-100">
                Entrance &amp; Exit Booth • Number Plate Verification
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col text-right text-xs">
              <span className="font-semibold text-white">{session.name}</span>
              <span className="text-[11px] text-brand-200 capitalize">
                Staff ID: {session.userId.slice(-6).toUpperCase()}
              </span>
            </div>

            {session.role === "admin" && (
              <Link
                href="/admin"
                className="text-xs bg-amber-400 text-amber-950 font-semibold px-2.5 py-1 rounded hover:bg-amber-300 transition-colors"
              >
                Admin Panel
              </Link>
            )}

            <Link
              href="/api/auth/logout"
              className="text-xs text-brand-100 hover:text-white flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
