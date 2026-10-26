import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

export const metadata = {
  title: "Admin Panel | Where Did I Park?",
  description: "Facility administrator management for lots, slots, sessions, and incident resolution.",
};

export default async function AdminLayout({ children }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <DashboardSidebar user={session} isAdmin={true} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
