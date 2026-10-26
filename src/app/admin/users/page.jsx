"use client";

import { useState, useEffect } from "react";
import { Users, Mail, Phone, Bike, Clock } from "lucide-react";
import Badge from "@/components/ui/Badge";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
          Registered Users &amp; Riders
        </h1>
        <p className="text-xs text-ink-secondary mt-0.5">
          View all registered accounts, vehicle counts, and parking activity.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-ink-secondary">
          Loading user records...
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white p-8 rounded-card border border-border-subtle text-center text-xs text-ink-secondary">
          No registered user accounts found.
        </div>
      ) : (
        <div className="bg-white rounded-card border border-border-subtle shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/80 border-b border-border-subtle text-ink-secondary uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 font-semibold">User Name</th>
                  <th className="p-3.5 font-semibold">Email</th>
                  <th className="p-3.5 font-semibold">Phone</th>
                  <th className="p-3.5 font-semibold">Vehicles</th>
                  <th className="p-3.5 font-semibold">Active Sessions</th>
                  <th className="p-3.5 font-semibold">Completed Sessions</th>
                  <th className="p-3.5 font-semibold">Role</th>
                  <th className="p-3.5 font-semibold">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-surface-subtle/40 transition-colors">
                    <td className="p-3.5 font-bold text-ink-primary">
                      {u.name}
                    </td>
                    <td className="p-3.5 text-ink-secondary">
                      {u.email}
                    </td>
                    <td className="p-3.5 text-ink-secondary">
                      {u.phoneNumber || "N/A"}
                    </td>
                    <td className="p-3.5 font-semibold text-ink-primary">
                      {u.vehicleCount || 0}
                    </td>
                    <td className="p-3.5">
                      <span className={`font-bold ${u.sessions?.active > 0 ? "text-brand-600" : "text-ink-secondary"}`}>
                        {u.sessions?.active || 0}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-ink-primary">
                      {u.sessions?.completed || 0}
                    </td>
                    <td className="p-3.5">
                      <span className="capitalize font-semibold text-[11px] px-2 py-0.5 rounded bg-surface-subtle border border-border-subtle">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-ink-secondary text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
