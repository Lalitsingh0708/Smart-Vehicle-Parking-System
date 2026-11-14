"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Clock,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Mail,
  MapPin,
  Calendar,
  Shield,
  ArrowRight,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AttendantUnderReview({ user, initialLotName = null }) {
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/attendant/check-approval-status");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to check status");
      }

      if (data.isApproved) {
        toast.success("Congratulations! Your account has been approved by the Administrator. Onboarding to Booth...", {
          duration: 4000,
        });
        setTimeout(() => {
          router.refresh();
          window.location.reload();
        }, 1200);
      } else {
        toast("Your account is currently under administrator review. We will onboard you once approved.", {
          icon: "⏳",
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to check status");
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="py-6 sm:py-12 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-[#E2D9CC] shadow-[0_20px_50px_-12px_rgba(60,45,30,0.12)] overflow-hidden">
        
        {/* Luxury Top Banner */}
        <div className="bg-gradient-to-r from-[#176B5B] via-[#125448] to-[#0D3E35] p-6 sm:p-8 text-white relative overflow-hidden">
          {/* Subtle Ambient Decorative Geometry */}
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute right-20 -bottom-16 w-36 h-36 rounded-full bg-[#D4AF37]/10 pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#E6C665] shadow-inner">
                <Clock className="w-6 h-6 stroke-[2.2] animate-pulse" />
              </div>
              <div>
                <span className="inline-block text-[10.5px] font-black uppercase tracking-[0.16em] text-[#D4AF37]">
                  Gate Staff Onboarding
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Booth Attendant Portal
                </h1>
              </div>
            </div>

            {/* Status Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-black uppercase tracking-wider self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Under Admin Review</span>
            </div>
          </div>
        </div>

        {/* Core Notice Area */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Main Notice Box */}
          <div className="bg-[#FAF7F2] border-2 border-[#E4D9CA] rounded-2xl p-5 sm:p-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#EDE4D8] border border-[#D8CCBD] flex items-center justify-center text-[#176B5B]">
              <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#1C1815] tracking-tight">
              Your Account is Under Administrator Review
            </h2>

            <p className="text-sm font-semibold text-[#66584B] max-w-lg mx-auto leading-relaxed">
              When your verification is approved by the platform administrator, you will be onboarded to manage parking operations.
            </p>
          </div>

          {/* Verification Details Card */}
          <div className="border border-[#EFE9DF] rounded-2xl p-5 bg-[#FCFAF7] space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#EFE9DF] pb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#66584B]">
                Staff Onboarding Credentials
              </span>
              <span className="text-[11px] font-bold text-[#176B5B] bg-[#EAF3EE] px-2.5 py-0.5 rounded-md border border-[#C5DED5]">
                Email Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#8C7E72] uppercase tracking-wider block">
                  Attendant Name
                </span>
                <span className="font-black text-[#1C1815] text-sm block">
                  {user?.name || "Booth Attendant"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#8C7E72] uppercase tracking-wider block">
                  Registered Email
                </span>
                <span className="font-bold text-[#1C1815] truncate block">
                  {user?.email || "N/A"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#8C7E72] uppercase tracking-wider block">
                  Phone Number
                </span>
                <span className="font-bold text-[#1C1815] block">
                  {user?.phoneNumber || "Not recorded"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#8C7E72] uppercase tracking-wider block">
                  Assigned Parking Facility
                </span>
                <span className="font-black text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-block text-[11px]">
                  {initialLotName || "Pending Admin Allocation"}
                </span>
              </div>

              <div className="space-y-1 sm:col-span-2 pt-2 border-t border-[#EFE9DF]">
                <span className="text-[11px] font-bold text-[#8C7E72] uppercase tracking-wider block">
                  Verification Authority
                </span>
                <span className="font-black text-[#176B5B] block">
                  Platform Administrator: lalitbaghel0708@gmail.com
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full py-3.5 px-5 bg-[#176B5B] hover:bg-[#115245] text-white font-black text-sm tracking-wide uppercase rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 stroke-[2.5] ${checking ? "animate-spin" : ""}`} />
              <span>{checking ? "Checking Approval Status..." : "Check Approval Status"}</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-3 px-5 bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#66584B] hover:text-[#1C1815] font-black text-xs tracking-wider uppercase rounded-xl border border-[#D8CFC2] transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4 stroke-[2.2]" />
              <span>Sign Out from Booth Station</span>
            </button>
          </div>

          {/* Security Assurance Note */}
          <p className="text-[11px] font-semibold text-[#8C7E72] text-center leading-relaxed">
            For campus safety and security compliance, gate check-in terminals and bay management tools are strictly gated until verified by Master Administrator Lalit Baghel.
          </p>
        </div>
      </div>
    </div>
  );
}
