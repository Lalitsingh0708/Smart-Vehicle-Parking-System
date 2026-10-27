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
    <aside className="w-64 bg-white border-r border-border-subtle flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Sidebar header info */}
      <div className="p-4 border-b border-border-subtle bg-surface-subtle/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-semibold text-ink-primary truncate">
              {user?.name || "Rider Account"}
            </h3>
            <span className="inline-flex items-center text-[11px] font-medium text-ink-secondary">
              {isAdmin ? "System Administrator" : "Two-Wheeler Rider"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-button transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-500 font-semibold"
                  : "text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-500" : "text-ink-secondary"}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-500" />}
            </Link>
          );
        })}

        {/* Quick link between user and admin dashboards if role is admin */}
        {user?.role === "admin" && (
          <div className="pt-3 mt-3 border-t border-border-subtle">
            {isAdmin ? (
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-ink-secondary hover:text-ink-primary rounded-button bg-surface-subtle hover:bg-border-subtle/60"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Switch to Rider View</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-amber-800 rounded-button bg-amber-50 hover:bg-amber-100 border border-amber-200"
              >
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span>Switch to Admin Panel</span>
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Footer logout */}
      <div className="p-3 border-t border-border-subtle">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2.5 px-3 py-2 text-sm font-medium text-status-occupied hover:bg-status-occupiedBg rounded-button transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
