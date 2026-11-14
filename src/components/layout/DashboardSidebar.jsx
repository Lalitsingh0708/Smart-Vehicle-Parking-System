"use client";
// Import Next.js navigation utilities
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Import icons used in the sidebar navigation
import {
  LayoutDashboard,
  Search,
  MapPin,
  Bike,
  Clock,
  AlertTriangle,
  User,
  Shield,
  Layers,
  Grid,
  Users,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardSidebar({ isAdmin = false, user }) {
  const pathname = usePathname();
  const router = useRouter();

  const userNav = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Find Parking", href: "/dashboard/find-parking", icon: Search },
    { name: "My Parking", href: "/dashboard/my-parking", icon: MapPin },
    { name: "My Vehicles", href: "/dashboard/vehicle", icon: Bike },
    { name: "Parking History", href: "/dashboard/history", icon: Clock },
    { name: "Security Incidents", href: "/dashboard/incidents", icon: AlertTriangle },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  const adminNav = [
    { name: "Analytics Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Parking Lots", href: "/admin/lots", icon: Layers },
    { name: "Parking Slots", href: "/admin/slots", icon: Grid },
    { name: "Parking Sessions", href: "/admin/sessions", icon: Clock },
    { name: "Registered Users", href: "/admin/users", icon: Users },
    { name: "Security Incidents", href: "/admin/incidents", icon: AlertTriangle },
    { name: "Reports & Export", href: "/admin/reports", icon: FileText },
  ];

  const navItems = isAdmin ? adminNav : userNav;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-[#E2D9CC] flex-col min-h-[calc(100vh-4.25rem)] shrink-0">
      {/* Sidebar header info */}
      <div className="p-4 border-b border-[#EFE9DF] bg-[#FAF6EE]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#176B5B] text-white border border-[#D4AF37] flex items-center justify-center font-black text-sm shadow-xs">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-black text-[#1C1815] truncate">
              {user?.name || "Rider Account"}
            </h3>
            <span className="inline-flex items-center text-[10.5px] font-bold text-[#B08528] uppercase tracking-wider">
              {isAdmin ? "System Administrator" : "Two-Wheeler Rider"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wider font-bold rounded-xl transition-all ${
                isActive
                  ? "bg-[#EAF3EE] text-[#176B5B] border-l-3 border-[#176B5B] shadow-xs"
                  : "text-[#706254] hover:text-[#176B5B] hover:bg-[#FAF6EE]"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-[#176B5B]" : "text-[#706254]"}`} />
                <span className={isActive ? "font-black" : "font-bold"}>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#176B5B]" />}
            </Link>
          );
        })}

        {/* Quick link between user and admin dashboards if role is admin */}
        {user?.role === "admin" && (
          <div className="pt-3 mt-3 border-t border-[#EFE9DF]">
            {isAdmin ? (
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 text-xs font-bold text-[#706254] hover:text-[#176B5B] rounded-xl bg-[#FAF6EE] hover:bg-[#EAF3EE] border border-[#DFD1BD] transition-all"
              >
                <Bike className="w-3.5 h-3.5 text-[#176B5B]" />
                <span>Switch to Rider View</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                className="flex items-center space-x-2 px-3 py-2 text-xs font-bold text-[#854D0E] rounded-xl bg-[#FAF6EE] hover:bg-[#FEF3C7] border border-[#DFD1BD] transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Switch to Admin Panel</span>
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Footer logout */}
      <div className="p-3 border-t border-[#EFE9DF]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#BA2D2D] hover:bg-[#FFF5F5] rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
