import { getAdminAnalyticsData } from "@/lib/analytics";
import AdminAnalyticsClient from "@/components/admin/AdminAnalyticsClient";

export const metadata = {
  title: "Admin Command Center | Where Did I Park?",
  description: "Real-time multi-location parking analytics and live vehicle telemetry.",
};

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  let initialData = null;
  try {
    const rawData = await getAdminAnalyticsData();
    initialData = rawData ? JSON.parse(JSON.stringify(rawData)) : null;
  } catch (err) {
    console.error("Server-side analytics prefetch error:", err);
  }

  return <AdminAnalyticsClient initialData={initialData} />;
}
