"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Shield, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      toast.success("Signed in successfully");
      if (data.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      setErrorMsg(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-card border border-border-subtle shadow-sm space-y-6">
          <div className="text-center space-y-1.5">
            <div className="w-10 h-10 rounded-md bg-brand-500 text-white font-bold text-lg flex items-center justify-center mx-auto mb-2">
              P
            </div>
            <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-ink-secondary">
              Access your two-wheeler parking sessions, tickets, and vehicles
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rider@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-border-subtle rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-border-subtle rounded-button focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2"
              size="md"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Quick Demo Credentials for Reviewers */}
          <div className="pt-4 border-t border-border-subtle">
            <span className="text-xs font-semibold text-ink-secondary block mb-2">
              Demo Credentials (Testing):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount("rider@example.com", "Rider@1234")}
                className="p-2 bg-surface-subtle border border-border-subtle rounded-md text-left hover:border-brand-400 transition-colors"
              >
                <div className="font-semibold text-ink-primary">Rider Account</div>
                <div className="text-ink-secondary text-[11px]">rider@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("admin@example.com", "Admin@1234")}
                className="p-2 bg-amber-50 border border-amber-200 rounded-md text-left hover:border-amber-400 transition-colors"
              >
                <div className="font-semibold text-amber-900 flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-amber-700" />
                  <span>Admin Account</span>
                </div>
                <div className="text-amber-800 text-[11px]">admin@example.com</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <span className="text-xs text-ink-secondary">
              Don't have an account?{" "}
              <Link href="/register" className="font-semibold text-brand-500 hover:text-brand-600">
                Register here
              </Link>
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
