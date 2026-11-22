"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Bike,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function RegisterPage() {
  const [step, setStep] = useState("form"); // "form" | "verify"
  const [accountType, setAccountType] = useState("user"); // "user" | "attendant"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  // If already authenticated and user visits or backs into /register, redirect immediately
  useEffect(() => {
    let isMounted = true;
    const checkAuthStatus = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (isMounted && data.authenticated && data.user) {
          const role = data.user.role;
          const target = role === "admin" ? "/admin" : role === "attendant" ? "/attendant" : "/dashboard";
          router.replace(target);
        }
      } catch {
        // Not authenticated
      }
    };

    checkAuthStatus();

    const handlePageShow = (event) => {
      if (event.persisted) {
        checkAuthStatus();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      isMounted = false;
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [router]);

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
    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg("Please fill in all required fields");
      return;
    }

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
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
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
        body: JSON.stringify({ email: email.trim() }),
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

  return (
    <div className="h-screen w-full bg-[#FAF7F2] flex flex-col lg:flex-row overflow-hidden relative">
      
      {/* Decorative Dot Matrix in Top Right (Matches login page) */}
      <div className="absolute top-3 right-4 sm:top-5 sm:right-6 hidden sm:grid grid-cols-4 gap-1.5 opacity-80 z-0 pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#52FF00]" />
        ))}
      </div>

      {/* Decorative Organic Contour Curves in Bottom Right */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border border-[#52FF00]/30 pointer-events-none hidden sm:block" />
      <div className="absolute -bottom-36 -right-36 w-[420px] h-[420px] rounded-full border border-[#52FF00]/20 pointer-events-none hidden sm:block" />

      {/* Left Column: Seamless Hero Artwork - Full Bleed 100% Height */}
      <div className="hidden lg:block lg:w-[50%] xl:w-[54%] h-full relative overflow-hidden bg-[#FAF7F2] shrink-0">
        <img
          src="/images/login-hero-left.jpg"
          alt="Where Did I Park - Never lose your ride again!"
          className="w-full h-full object-cover object-left-bottom select-none pointer-events-none"
        />
      </div>

      {/* Right Column: Full Height Container with Balanced Vertical Fit */}
      <div className="w-full lg:w-[50%] xl:w-[46%] h-full flex flex-col justify-between items-center px-4 py-2.5 sm:px-6 lg:px-8 relative z-10 overflow-y-auto">
        
        {/* Subtle top spacer */}
        <div className="hidden lg:block shrink-0 h-1" />

        {/* Floating Auth Card */}
        <div className="w-full max-w-[440px] my-auto py-1">
          <div className="bg-[#FFFFFF] rounded-[24px] border border-[#EBE3D7] shadow-[0_15px_40px_rgba(28,24,21,0.06)] p-4 sm:p-5 md:p-5.5 space-y-2.5 sm:space-y-3">
            
            {step === "form" ? (
              <>
                {/* Top Brand Mark */}
                <div className="text-center space-y-0.5">
                  <div className="flex items-center justify-center space-x-1.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#2A0E28] flex items-center justify-center text-white shadow-sm">
                      <span className="font-black text-xs tracking-tighter">P</span>
                    </div>
                    <span className="text-base sm:text-lg font-black text-[#2A0E28] tracking-tight">
                      Where Did I Park?
                    </span>
                  </div>

                  <h1 className="text-lg sm:text-xl md:text-2xl font-black text-[#1C1815] tracking-tight pt-0.5">
                    Create an Account
                  </h1>
                  <p className="text-[11px] sm:text-xs font-medium text-[#706254]">
                    Join to reserve bays and find your parked ride
                  </p>
                </div>

                {/* Role Selector Pills */}
                <div className="space-y-1">
                  <div className="grid grid-cols-2 p-1 bg-[#FAF7F2] rounded-xl border border-[#E2D9CC] gap-1">
                    <button
                      type="button"
                      onClick={() => setAccountType("user")}
                      className={`flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        accountType === "user"
                          ? "bg-white text-[#0A2603] font-black shadow-sm border border-[#D8CFC2]"
                          : "text-[#706254] hover:text-[#1C1815] hover:bg-[#FAF7F2]"
                      }`}
                    >
                      <Bike className="w-3.5 h-3.5 stroke-[2.2] text-[#4EE30A]" />
                      <span>Rider Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountType("attendant")}
                      className={`flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        accountType === "attendant"
                          ? "bg-white text-[#0A2603] font-black shadow-sm border border-[#D8CFC2]"
                          : "text-[#706254] hover:text-[#1C1815] hover:bg-[#FAF7F2]"
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2] text-[#4EE30A]" />
                      <span>Booth Attendant</span>
                    </button>
                  </div>

                  {accountType === "attendant" && (
                    <div className="p-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-[10.5px] text-amber-800 font-semibold leading-snug">
                        Attendant accounts require email OTP verification followed by platform administrator onboarding.
                      </p>
                    </div>
                  )}
                </div>

                {/* Social Login */}
                <div className="w-full">
                  <GoogleSignInButton role={accountType} text="Continue with Google" />
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-0.5">
                  <div className="border-t border-[#E8DFC0]/70 w-full" />
                  <span className="bg-white px-2.5 text-[10.5px] font-semibold text-[#8C7E72] relative shrink-0">
                    Or register with email OTP
                  </span>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-2 bg-red-50 border border-red-300 rounded-lg flex items-center space-x-2 text-xs font-bold text-red-900">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 stroke-[2.5]" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleRegisterSubmit} className="space-y-2 pt-0.5">
                  {/* Full Name & Phone Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative">
                      <User className="w-4 h-4 text-[#7A6C5F] absolute left-3 top-2.5 sm:top-3 stroke-[2]" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full bg-[#FAF7F2] text-[#1C1815] font-medium text-xs sm:text-sm pl-9 pr-2.5 py-2 sm:py-2.5 border border-[#E2D9CC] rounded-xl focus:outline-none focus:border-[#52FF00] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#52FF00]/25 transition-all placeholder:text-[#9E9082]"
                      />
                    </div>

                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#7A6C5F] absolute left-3 top-2.5 sm:top-3 stroke-[2]" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Phone (Optional)"
                        className="w-full bg-[#FAF7F2] text-[#1C1815] font-medium text-xs sm:text-sm pl-9 pr-2.5 py-2 sm:py-2.5 border border-[#E2D9CC] rounded-xl focus:outline-none focus:border-[#52FF00] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#52FF00]/25 transition-all placeholder:text-[#9E9082]"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#7A6C5F] absolute left-3 top-2.5 sm:top-3 stroke-[2]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full bg-[#FAF7F2] text-[#1C1815] font-medium text-xs sm:text-sm pl-9 pr-3 py-2 sm:py-2.5 border border-[#E2D9CC] rounded-xl focus:outline-none focus:border-[#52FF00] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#52FF00]/25 transition-all placeholder:text-[#9E9082]"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#7A6C5F] absolute left-3 top-2.5 sm:top-3 stroke-[2]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create Password (Min 8 chars)"
                      className="w-full bg-[#FAF7F2] text-[#1C1815] font-medium text-xs sm:text-sm pl-9 pr-9 py-2 sm:py-2.5 border border-[#E2D9CC] rounded-xl focus:outline-none focus:border-[#52FF00] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#52FF00]/25 transition-all placeholder:text-[#9E9082]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 sm:top-3 text-[#7A6C5F] hover:text-[#1C1815] transition-colors p-0.5 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2]" />
                      )}
                    </button>
                  </div>

                  {/* Primary CTA Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 sm:py-3 px-5 bg-[#52FF00] hover:bg-[#46E000] text-[#0A2603] font-black text-xs sm:text-sm tracking-wide rounded-xl transition-all shadow-[0_8px_20px_rgba(82,255,0,0.30)] hover:shadow-[0_10px_24px_rgba(82,255,0,0.40)] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-1"
                  >
                    {loading ? (
                      <span>Setting Up Account...</span>
                    ) : (
                      <>
                        <span>Continue with Email Verification</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </button>
                </form>

                {/* Sign In prompt */}
                <div className="text-center pt-0.5">
                  <span className="text-[11px] sm:text-[11.5px] font-semibold text-[#66584B]">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-bold text-[#4EE30A] hover:text-[#3EC205] ml-1 transition-colors underline underline-offset-2"
                    >
                      Sign in here
                    </Link>
                  </span>
                </div>
              </>
            ) : (
              /* STEP 2: OTP Verification Screen */
              <div className="space-y-3">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#52FF00]/15 border border-[#52FF00]/40 flex items-center justify-center mx-auto text-[#0A2603] shadow-inner">
                    <KeyRound className="w-5 h-5 sm:w-6 sm:h-6 text-[#176B5B] stroke-[2.2]" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-[#1C1815] tracking-tight">
                    Verify Your Email
                  </h2>
                  <p className="text-xs font-semibold text-[#706254]">
                    We sent a 6-digit verification code to
                  </p>
                  <p className="text-xs font-black text-[#176B5B] bg-[#FAF7F2] py-1 px-2.5 rounded-lg border border-[#E2D9CC] inline-block">
                    {email}
                  </p>
                </div>

                {/* Dev Simulation Banner (if present) */}
                {devOtp && (
                  <div className="p-2 bg-amber-50 border border-amber-300 rounded-xl space-y-0.5 text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                      Development Mode Code
                    </span>
                    <span className="font-mono font-black text-sm tracking-widest text-[#176B5B] bg-white px-2.5 py-0.5 rounded border border-amber-300 inline-block">
                      {devOtp}
                    </span>
                  </div>
                )}

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-2 bg-red-50 border border-red-300 rounded-lg flex items-center space-x-2 text-xs font-bold text-red-900">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 stroke-[2.5]" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* OTP Form */}
                <form onSubmit={handleVerifySubmit} className="space-y-2.5">
                  <div>
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
                      className="w-full text-center text-xl sm:text-2xl font-mono font-black tracking-[0.35em] bg-[#FAF7F2] text-[#1C1815] py-2 sm:py-2.5 border border-[#E2D9CC] rounded-xl focus:outline-none focus:border-[#52FF00] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#52FF00]/25 transition-all placeholder:text-[#B5A89A]"
                    />
                    <p className="text-[10px] font-semibold text-[#7A6C5F] text-center mt-1">
                      Code is valid for 10 minutes
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={verifying || otp.length !== 6}
                    className="w-full py-2.5 sm:py-3 px-5 bg-[#52FF00] hover:bg-[#46E000] text-[#0A2603] font-black text-xs sm:text-sm tracking-wide rounded-xl transition-all shadow-[0_8px_20px_rgba(82,255,0,0.30)] hover:shadow-[0_10px_24px_rgba(82,255,0,0.40)] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
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
                <div className="flex flex-col items-center space-y-1 pt-1.5 border-t border-[#E8DFC0]/70">
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
                    className="text-[10.5px] font-bold text-[#66584B] hover:text-[#1C1815] underline underline-offset-2 cursor-pointer"
                  >
                    Change email address
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Integrated Clean Auth Footer at Bottom of Right Panel */}
        <footer className="w-full max-w-[440px] shrink-0 pt-1 pb-1 text-[10px] font-semibold text-[#8C7E72] flex items-center justify-between">
          <Link href="/" className="hover:text-[#176B5B] transition-colors">
            ← Return to Homepage
          </Link>
          <div className="flex items-center space-x-2">
            <Link href="/privacy" className="hover:text-[#176B5B] transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#176B5B] transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/support" className="hover:text-[#176B5B] transition-colors">Support</Link>
          </div>
        </footer>

      </div>
    </div>
  );
}
