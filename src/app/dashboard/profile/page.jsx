"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Shield } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-xs text-ink-secondary">Loading profile...</div>;
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
          Rider Profile
        </h1>
        <p className="text-xs text-ink-secondary mt-0.5">
          Account credentials and authenticated system role.
        </p>
      </div>

      <div className="bg-white p-6 rounded-card border border-border-subtle shadow-xs space-y-5">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-700 font-bold text-xl flex items-center justify-center">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <h2 className="text-base font-bold text-ink-primary">{user?.name}</h2>
            <span className="text-xs text-ink-secondary capitalize">
              Role: {user?.role === "admin" ? "System Administrator" : "Two-Wheeler Rider"}
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-border-subtle text-xs">
          <div className="flex items-center justify-between py-2 border-b border-border-subtle">
            <span className="text-ink-secondary flex items-center space-x-2">
              <Mail className="w-4 h-4 text-ink-muted" />
              <span>Email Address</span>
            </span>
            <span className="font-semibold text-ink-primary">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border-subtle">
            <span className="text-ink-secondary flex items-center space-x-2">
              <Phone className="w-4 h-4 text-ink-muted" />
              <span>Contact Phone</span>
            </span>
            <span className="font-semibold text-ink-primary">
              {user?.phoneNumber || "Not provided"}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-ink-secondary flex items-center space-x-2">
              <Shield className="w-4 h-4 text-ink-muted" />
              <span>Access Level</span>
            </span>
            <span className="font-semibold capitalize text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
