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
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar initialUser={session} />
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1536px] mx-auto items-start px-2 sm:px-4">
        <DashboardSidebar user={session} isAdmin={true} />
        <main className="flex-1 min-w-0 p-3 sm:p-5 md:p-6 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
