import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Page Not Found | Where Did I Park?",
  description: "The requested parking resource or page could not be found.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#18212F] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2D9CC] p-8 text-center shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[#E2D9CC] flex items-center justify-center mx-auto text-[#176B5B] shadow-inner">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#176B5B] font-bold">
            ERROR 404 // RESOURCE NOT FOUND
          </span>
          <h1 className="text-2xl font-black text-[#18212F] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-[#7A6C5F] leading-relaxed">
            The page or parking lot you are looking for does not exist or has been relocated.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#176B5B] hover:bg-[#125448] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
