"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/brand/Logo";
import {
  User,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  KeyRound,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  Bike,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function RegisterPage() {
  const [step, setStep] = useState("form"); // "form" | "verify"
  const [accountType, setAccountType] = useState("user"); // "user" | "attendant"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  // Cooldown countdown effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phoneNumber, accountType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      if (data.requiresVerification) {
        setStep("verify");
        setResendCooldown(30);
        if (data.simulated && data.devOtp) {
          setDevOtp(data.devOtp);
        }
        toast.success("Verification code sent to your email");
      } else {
        toast.success("Account registered successfully");
        const target = accountType === "attendant" ? "/attendant" : "/dashboard";
        router.push(target);
        router.refresh();
      }
    } catch (err) {
      setErrorMsg(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code");
      return;
    }

    setVerifying(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      toast.success(data.message || "Account activated successfully!");
      const target = data.redirect || (accountType === "attendant" ? "/attendant" : "/dashboard");
      window.location.href = target;
    } catch (err) {
      setErrorMsg(err.message);
      toast.error(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend verification code");
      }

      setResendCooldown(45);
      if (data.simulated && data.devOtp) {
        setDevOtp(data.devOtp);
      }
      toast.success("New verification code sent to your email");
    } catch (err) {
      setErrorMsg(err.message);
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  const isMasterAdminEmail = email.toLowerCase().trim() === "lalitbaghel0708@gmail.com";

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0E8] text-[#1E1B18]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-3 sm:py-5">
        <div className="w-full max-w-[490px]">
          <div className="bg-[#FFFFFF] rounded-2xl border-2 border-[#E2D9CC] shadow-[0_12px_36px_-6px_rgba(60,45,30,0.08)] p-5 sm:p-6 space-y-3.5">
            
            {step === "form" ? (
              <>
                {/* Header */}
                <div className="text-center space-y-1">
                  <LogoMark size={36} className="mx-auto" />
                  <h1 className="text-xl sm:text-2xl font-black text-[#1C1815] tracking-tight">
                    Create New Account
                  </h1>
                  <p className="text-xs font-semibold text-[#66584B]">
                    Select your registration role to set up your profile
                  </p>
                </div>

                {/* Account Type Selector */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#2A231E]">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 p-1 bg-[#EDE4D8] rounded-xl border border-[#D8CCBD] gap-1">
                    <button
                      type="button"
                      onClick={() => setAccountType("user")}
                      className={`flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        accountType === "user"
                          ? "bg-white text-[#176B5B] shadow-sm border border-[#D9CEBF]"
                          : "text-[#5C5046] hover:text-[#1C1815] hover:bg-[#E3D8CA]/60"
                      }`}
                    >
                      <Bike className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>Rider Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountType("attendant")}
                      className={`flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        accountType === "attendant"
                          ? "bg-white text-[#176B5B] shadow-sm border border-[#D9CEBF]"
                          : "text-[#5C5046] hover:text-[#1C1815] hover:bg-[#E3D8CA]/60"
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>Booth Attendant</span>
                    </button>
                  </div>

                  {accountType === "attendant" && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-[11px] text-amber-800 font-semibold leading-snug">
                        Booth Attendant accounts require email OTP verification followed by platform administrator onboarding by Lalit Baghel.
                      </p>
                    </div>
                  )}
                </div>

                {/* Google Identity Services / One Tap / Sign Up */}
                <div className="space-y-2">
                  <GoogleSignInButton role={accountType} text="Sign up with Google" />

                  <div className="relative flex items-center justify-center my-1.5">
                    <div className="border-t border-[#E2D9CC] w-full" />
                    <span className="bg-white px-2.5 text-[10.5px] font-bold text-[#8C7E72] uppercase tracking-wider relative shrink-0">
                      Or register with email OTP
                    </span>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-2.5 bg-red-50 border-2 border-red-300 rounded-xl flex items-center space-x-2 text-xs font-bold text-red-900">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 stroke-[2.5]" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Registration Form - Responsive Grid */}
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-[#2A231E] mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#7A6C5F] absolute left-3 top-3 stroke-[2.2]" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Aarav Sharma"
                          className="w-full bg-[#FAF7F2] text-[#1C1815] font-bold text-xs sm:text-sm pl-9 pr-3 py-2.5 border-2 border-[#D8CFC2] rounded-xl focus:outline-none focus:border-[#176B5B] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#176B5B]/15 transition-all placeholder:text-[#9E9082] placeholder:font-medium"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-[#2A231E] mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#7A6C5F] absolute left-3 top-3 stroke-[2.2]" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="9876543210"
                          pattern="[6-9][0-9]{9}"
                          className="w-full bg-[#FAF7F2] text-[#1C1815] font-bold text-xs sm:text-sm pl-9 pr-3 py-2.5 border-2 border-[#D8CFC2] rounded-xl focus:outline-none focus:border-[#176B5B] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#176B5B]/15 transition-all placeholder:text-[#9E9082] placeholder:font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Email Address */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-black uppercase tracking-wider text-[#2A231E]">
                          Email Address
                        </label>
                        {isMasterAdminEmail && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-[#176B5B] text-white px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#7A6C5F] absolute left-3 top-3 stroke-[2.2]" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@gmail.com"
                          className="w-full bg-[#FAF7F2] text-[#1C1815] font-bold text-xs sm:text-sm pl-9 pr-3 py-2.5 border-2 border-[#D8CFC2] rounded-xl focus:outline-none focus:border-[#176B5B] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#176B5B]/15 transition-all placeholder:text-[#9E9082] placeholder:font-medium"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-[#2A231E] mb-1">
                        Password (min 8)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#7A6C5F] absolute left-3 top-3 stroke-[2.2]" />
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#FAF7F2] text-[#1C1815] font-bold text-xs sm:text-sm pl-9 pr-3 py-2.5 border-2 border-[#D8CFC2] rounded-xl focus:outline-none focus:border-[#176B5B] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#176B5B]/15 transition-all placeholder:text-[#9E9082] placeholder:font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-[#176B5B] hover:bg-[#115245] text-white font-black text-xs sm:text-sm tracking-wide uppercase rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <span>Sending Verification Code...</span>
                    ) : (
                      <>
                        <span>Continue with Email Verification</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2 border-t-2 border-[#EFE9DF]">
                  <span className="text-xs font-bold text-[#66584B]">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-black text-[#176B5B] hover:text-[#115245] underline underline-offset-2 ml-1"
                    >
                      Sign in here
                    </Link>
                  </span>
                </div>
              </>
            ) : (
              /* OTP Verification Step */
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-11 h-11 mx-auto rounded-xl bg-[#EDE4D8] border border-[#D8CCBD] flex items-center justify-center text-[#176B5B]">
                    <KeyRound className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#1C1815] tracking-tight">
                    Verify Your Email
                  </h1>
                  <p className="text-xs font-semibold text-[#66584B] max-w-sm mx-auto">
                    We sent a 6-digit verification code to:
                  </p>
                  <div className="inline-block bg-[#FAF7F2] border border-[#E2D9CC] px-2.5 py-0.5 rounded-lg text-xs font-black text-[#176B5B]">
                    {email}
                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-2.5 bg-red-50 border-2 border-red-300 rounded-xl flex items-center space-x-2 text-xs font-bold text-red-900">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 stroke-[2.5]" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Dev OTP Callout if simulated */}
                {devOtp && (
                  <div className="p-2.5 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-0.5">
                    <div className="flex items-center space-x-1.5 text-xs font-black text-amber-900">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-700 stroke-[2.5]" />
                      <span>Development Mode (SMTP Simulation)</span>
                    </div>
                    <p className="text-xs text-amber-800 font-semibold">
                      Your 6-digit OTP code is:{" "}
                      <span className="font-mono font-black text-sm tracking-widest text-[#176B5B] bg-white px-2 py-0.5 rounded border border-amber-300 ml-1">
                        {devOtp}
                      </span>
                    </p>
                  </div>
                )}

                {/* OTP Form */}
                <form onSubmit={handleVerifySubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-[#2A231E] mb-1.5 text-center">
                      Enter 6-Digit Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoFocus
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setOtp(val);
                      }}
                      placeholder="••••••"
                      className="w-full text-center text-2xl font-mono font-black tracking-[0.35em] bg-[#FAF7F2] text-[#1C1815] py-2.5 border-2 border-[#D8CFC2] rounded-xl focus:outline-none focus:border-[#176B5B] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#176B5B]/15 transition-all placeholder:text-[#B5A89A]"
                    />
                    <p className="text-[10.5px] font-semibold text-[#7A6C5F] text-center mt-1">
                      Code is valid for 10 minutes
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={verifying || otp.length !== 6}
                    className="w-full py-2.5 px-4 bg-[#176B5B] hover:bg-[#115245] text-white font-black text-xs sm:text-sm tracking-wide uppercase rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {verifying ? (
                      <span>Verifying Code...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>Verify &amp; Activate Account</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Resend and Change Email options */}
                <div className="flex flex-col items-center space-y-2 pt-2 border-t-2 border-[#EFE9DF]">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || resending}
                    className="text-xs font-bold text-[#176B5B] hover:text-[#115245] disabled:text-[#8C7E72] flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                    <span>
                      {resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : resending
                        ? "Sending new code..."
                        : "Didn't receive code? Resend"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("form");
                      setOtp("");
                      setErrorMsg("");
                    }}
                    className="text-[11px] font-bold text-[#66584B] hover:text-[#1C1815] underline underline-offset-2 cursor-pointer"
                  >
                    Change email address
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-2.5 px-4 border-t border-[#E2D9CC] bg-[#EFE9DF]/60 text-[11px] font-semibold text-[#7A6C5F]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center">
          <span>© {new Date().getFullYear()} Where Did I Park? • Two-Wheeler Parking Management</span>
          <div className="flex items-center space-x-3 text-[11px]">
            <Link href="/privacy" className="hover:text-[#176B5B]">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#176B5B]">Terms</Link>
            <span>•</span>
            <Link href="/support" className="hover:text-[#176B5B]">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
