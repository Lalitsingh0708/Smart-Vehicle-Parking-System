import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

export const metadata = {
  title: "Dashboard | Where Did I Park?",
  description: "Rider parking dashboard for two-wheeler allocations, sessions, and vehicles.",
};

export default async function DashboardLayout({ children }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <DashboardSidebar user={session} isAdmin={false} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
