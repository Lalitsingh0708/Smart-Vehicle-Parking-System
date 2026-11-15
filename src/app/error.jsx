"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#18212F] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2D9CC] p-8 text-center shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700 shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-amber-700 font-bold">
            APPLICATION RUNTIME NOTICE
          </span>
          <h1 className="text-2xl font-black text-[#18212F] tracking-tight">
            Something Went Wrong
          </h1>
          <p className="text-xs text-[#7A6C5F] leading-relaxed">
            An unexpected error occurred while rendering this interface. You can try refreshing the component or return to the homepage.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#176B5B] hover:bg-[#125448] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FAF7F2] hover:bg-[#EFE7D8] text-[#18212F] border border-[#E2D9CC] text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#176B5B]" />
            <span>Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
