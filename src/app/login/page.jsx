"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

function AppleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 170 170" fill="currentColor">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.85-11.71-14.43-5.74-9.16-10.22-19.68-13.43-31.56-3.21-11.87-4.82-22.95-4.82-33.24 0-14.82 3.73-27.18 11.2-37.08 7.46-9.9 16.9-14.92 28.32-15.07 4.9 0 10.33 1.25 16.29 3.74 5.96 2.49 9.87 3.79 11.73 3.91 1.5.12 5.67-1.28 12.5-4.22 6.84-2.93 12.7-4.26 17.58-3.98 13.06.63 23.42 4.98 31.08 13.04-11.51 6.96-17.15 16.65-16.92 29.07.24 9.99 4.13 18.25 11.67 24.77 5.76 5.09 12.39 8.24 19.89 9.47-2.61 7.9-6.09 16.14-10.45 24.71zM119.22 33.15c0-7.22 2.65-14.28 7.96-21.18 5.3-6.9 11.96-11.39 19.98-13.47.24 1.1.36 2.05.36 2.87 0 7.22-2.77 14.38-8.31 21.48-5.54 7.1-12.39 11.38-20.55 12.84-.48-.84-.72-1.74-.72-2.71z" />
    </svg>
  );
}

const ROLES = [
  {
    id: "user",
    title: "Rider",
    placeholder: "Email Address",
    presetEmail: "",
  },
  {
    id: "attendant",
    title: "Attendant",
    placeholder: "Attendant Email",
    presetEmail: "",
  },
  {
    id: "admin",
    title: "Admin",
    placeholder: "lalitbaghel0708@gmail.com",
    presetEmail: "lalitbaghel0708@gmail.com",
  },
];

function LoginFormContent() {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // OTP Verification Modal/Screen State for unverified users
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for error in query params
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setErrorMsg(errorParam);
    }
  }, [searchParams]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role.id === "admin") {
      setEmail("lalitbaghel0708@gmail.com");
    } else if (email === "lalitbaghel0708@gmail.com") {
      setEmail("");
    }
    setErrorMsg("");
    setShowOtpScreen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both your email address and password");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      // Check if login requires OTP verification
      if (data.requiresOtp || (res.status === 403 && data.requiresVerification)) {
        setShowOtpScreen(true);
        setResendCooldown(30);
        toast.success(data.message || `Verification code sent to ${email}`);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      const userRole = data.user?.role;
      const userName = data.user?.name || "User";

      toast.success(`Welcome back, ${userName}!`);

      if (userRole === "admin") {
        router.push("/admin");
      } else if (userRole === "attendant") {
        router.push("/attendant");
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setErrorMsg("Please enter the complete 6-digit code");
      return;
    }

    setVerifyingOtp(true);
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

      toast.success(data.message || "Email verified! Logging in...");
      const target = data.redirect || "/dashboard";
      window.location.href = target;
    } catch (err) {
      setErrorMsg(err.message);
      toast.error(err.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendingOtp) return;

    setResendingOtp(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      setResendCooldown(45);
      toast.success(`Fresh verification code sent to ${email}`);
    } catch (err) {
      setErrorMsg(err.message);
      toast.error(err.message);
    } finally {
      setResendingOtp(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] z-10 my-auto">
      <div className="bg-[#FFFFFF] rounded-[24px] border border-[#EBE3D7] shadow-[0_15px_40px_rgba(28,24,21,0.06)] p-5 sm:p-6 space-y-3">
        
        {!showOtpScreen ? (
          <>
            {/* Top Brand Mark */}
            <div className="text-center space-y-0.5">
              <div className="flex items-center justify-center space-x-1.5">
                <div className="w-7 h-7 rounded-full bg-[#2A0E28] flex items-center justify-center text-white shadow-sm">
                  <span className="font-black text-xs tracking-tighter">P</span>
                </div>
                <span className="text-lg font-black text-[#2A0E28] tracking-tight">
                  Where Did I Park?
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#1C1815] tracking-tight pt-0.5">
                Welcome Back!
              </h1>
              <p className="text-[11.5px] sm:text-xs font-medium text-[#706254]">
                Login to continue your journey
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-2 bg-red-50 border border-red-300 rounded-lg flex items-center space-x-2 text-xs font-bold text-red-900">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 stroke-[2.5]" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5 pt-0.5">
              {/* Email Address */}
              <div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7A6C5F] absolute left-3.5 top-3 stroke-[2]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole.placeholder}
                    className="w-full bg-[#FAF7F2] text-[#1C1815] font-medium text-xs sm:text-sm pl-10 pr-3 py-2.5 border border-[#E2D9CC] rounded-xl focus:outline-none focus:border-[#52FF00] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#52FF00]/25 transition-all placeholder:text-[#9E9082]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7A6C5F] absolute left-3.5 top-3 stroke-[2]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-[#FAF7F2] text-[#1C1815] font-medium text-xs sm:text-sm pl-10 pr-10 py-2.5 border border-[#E2D9CC] rounded-xl focus:outline-none focus:border-[#52FF00] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#52FF00]/25 transition-all placeholder:text-[#9E9082]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#7A6C5F] hover:text-[#1C1815] transition-colors p-0.5 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 stroke-[2]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[2]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-[11.5px] pt-0.5">
                <label className="flex items-center space-x-1.5 text-[#574B3F] font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#D8CFC2] text-[#52FF00] focus:ring-[#52FF00] accent-[#52FF00]"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    toast("Please contact Platform Administrator (lalitbaghel0708@gmail.com) to reset credentials.")
                  }
                  className="font-bold text-[#4EE30A] hover:text-[#3EC205] transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Primary CTA Button (Bright Electric Lime matching reference image) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 px-5 bg-[#52FF00] hover:bg-[#46E000] text-[#0A2603] font-black text-sm tracking-wide rounded-xl transition-all shadow-[0_8px_20px_rgba(82,255,0,0.30)] hover:shadow-[0_10px_24px_rgba(82,255,0,0.40)] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-[#E8DFC0]/70 w-full" />
              <span className="bg-white px-2.5 text-[11px] font-semibold text-[#8C7E72] relative shrink-0">
                Or continue with
              </span>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-2">
              <div className="w-full">
                <GoogleSignInButton role={selectedRole.id} text="Google" />
              </div>

              <button
                type="button"
                onClick={() => toast("Apple Sign-in is available in the upcoming native iOS app.")}
                className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl border border-[#D8CFC2] bg-white hover:bg-[#FAF7F2] text-xs font-bold text-[#1C1815] transition-all cursor-pointer shadow-sm hover:border-[#B5A89A]"
              >
                <AppleIcon className="w-3.5 h-3.5 fill-current text-[#1C1815]" />
                <span className="truncate">Continue with Apple</span>
              </button>
            </div>

            {/* Role switchers & Sign Up prompt */}
            <div className="text-center pt-1 space-y-1">
              <span className="text-[11.5px] font-semibold text-[#66584B] block">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#4EE30A] hover:text-[#3EC205] ml-1 transition-colors underline underline-offset-2"
                >
                  Sign Up
                </Link>
              </span>

              {/* Discreet portal switcher for admin/attendant */}
              <div className="flex items-center justify-center space-x-1 text-[10.5px] text-[#8C7E72]">
                <span>Portal:</span>
                <button
                  type="button"
                  onClick={() => handleRoleSelect(ROLES[0])}
                  className={`font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    selectedRole.id === "user"
                      ? "bg-[#52FF00]/25 text-[#176B5B]"
                      : "hover:text-[#1C1815]"
                  }`}
                >
                  Rider
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleRoleSelect(ROLES[1])}
                  className={`font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    selectedRole.id === "attendant"
                      ? "bg-[#52FF00]/25 text-[#176B5B]"
                      : "hover:text-[#1C1815]"
                  }`}
                >
                  Attendant
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleRoleSelect(ROLES[2])}
                  className={`font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    selectedRole.id === "admin"
                      ? "bg-[#52FF00]/25 text-[#176B5B]"
                      : "hover:text-[#1C1815]"
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Two-Factor OTP Verification Screen */
          <div className="space-y-3">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#EDE4D8] border border-[#D8CCBD] flex items-center justify-center text-[#176B5B]">
                <KeyRound className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-[#1C1815] tracking-tight pt-0.5">
                Two-Factor Verification
              </h1>
              <p className="text-[11.5px] font-semibold text-[#66584B] max-w-sm mx-auto">
                Enter the 6-digit code sent to:
              </p>
              <div className="inline-block bg-[#FAF7F2] border border-[#E2D9CC] px-2 py-0.5 rounded-lg text-xs font-black text-[#176B5B]">
                {email}
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-2 bg-red-50 border border-red-300 rounded-lg flex items-center space-x-2 text-xs font-bold text-red-900">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 stroke-[2.5]" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-2.5">
              <div>
                <label className="block text-[10.5px] font-black uppercase tracking-wider text-[#2A231E] mb-1 text-center">
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
                  className="w-full text-center text-xl font-mono font-black tracking-[0.35em] bg-[#FAF7F2] text-[#1C1815] py-2 border-2 border-[#D8CFC2] rounded-xl focus:outline-none focus:border-[#52FF00] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#52FF00]/20 transition-all placeholder:text-[#B5A89A]"
                />
                <p className="text-[10px] font-semibold text-[#7A6C5F] text-center mt-0.5">
                  Code is valid for 10 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={verifyingOtp || otp.length !== 6}
                className="w-full py-2.5 px-4 bg-[#52FF00] hover:bg-[#46E000] text-[#0A2603] font-black text-xs sm:text-sm tracking-wide uppercase rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {verifyingOtp ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <span>Verify Code &amp; Enter Dashboard</span>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Resend and Return options */}
            <div className="flex flex-col items-center space-y-1.5 pt-1.5 border-t border-[#EFE9DF]">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resendingOtp}
                className="text-xs font-bold text-[#176B5B] hover:text-[#115245] disabled:text-[#8C7E72] flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendingOtp ? "animate-spin" : ""}`} />
                <span>
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : resendingOtp
                    ? "Sending new code..."
                    : "Didn't receive code? Resend"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowOtpScreen(false);
                  setOtp("");
                  setErrorMsg("");
                }}
                className="text-[10.5px] font-bold text-[#66584B] hover:text-[#1C1815] underline underline-offset-2 cursor-pointer"
              >
                Back to login form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="h-screen max-h-screen w-full bg-[#FAF7F2] flex flex-col justify-between overflow-hidden relative">
      
      {/* Decorative Dot Matrix in Top Right (Matches reference image) */}
      <div className="absolute top-4 right-5 sm:top-6 sm:right-8 hidden sm:grid grid-cols-4 gap-1.5 opacity-80 z-0 pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#52FF00]" />
        ))}
      </div>

      {/* Decorative Organic Contour Curve in Bottom Right (Matches reference image) */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border border-[#52FF00]/30 pointer-events-none hidden sm:block" />
      <div className="absolute -bottom-36 -right-36 w-[420px] h-[420px] rounded-full border border-[#52FF00]/20 pointer-events-none hidden sm:block" />

      {/* Main Full-Height Split Screen Container */}
      <main className="flex-1 w-full flex flex-col lg:flex-row items-stretch min-h-0 overflow-hidden z-10">
        
        {/* Left Column: Seamless Hero Artwork (Full bleed, matches reference image) */}
        <div className="hidden lg:flex lg:w-[54%] xl:w-[58%] h-full relative items-center justify-center overflow-hidden bg-[#FAF7F2]">
          <img
            src="/images/login-hero-left.jpg"
            alt="Where Did I Park - Never lose your ride again!"
            className="w-full h-full object-cover object-left select-none pointer-events-none"
          />
        </div>

        {/* Right Column: Centered Floating Card */}
        <div className="w-full lg:w-[46%] xl:w-[42%] h-full flex flex-col items-center justify-center px-4 py-2 sm:px-6 lg:px-8 relative min-h-0 overflow-y-auto lg:overflow-hidden">
          <Suspense fallback={<div className="p-8 text-center text-xs text-[#706254]">Loading portal...</div>}>
            <LoginFormContent />
          </Suspense>
        </div>

      </main>

      {/* Sleek Minimal Auth Footer */}
      <footer className="w-full h-7 shrink-0 px-6 z-10 text-[10px] font-semibold text-[#8C7E72] flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Link href="/" className="hover:text-[#176B5B] transition-colors">
            ← Return to Homepage
          </Link>
          <span>•</span>
          <span>© {new Date().getFullYear()} Where Did I Park?</span>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/privacy" className="hover:text-[#176B5B] transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-[#176B5B] transition-colors">Terms</Link>
          <Link href="/support" className="hover:text-[#176B5B] transition-colors">Help &amp; Support</Link>
        </div>
      </footer>
    </div>
  );
}
