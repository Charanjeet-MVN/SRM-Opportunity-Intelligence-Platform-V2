import React from "react";
import Link from "next/link";
import { Compass, ArrowLeft, Search, ShieldAlert } from "lucide-react";

export default function OpportunityNotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full rounded-3xl bg-zinc-900/60 border border-zinc-800 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Opportunity Unavailable
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
            The requested opportunity could not be found, has been archived, or is no longer accessible on the platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/opportunities"
            className="flex-1 py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Compass className="w-4 h-4" />
            <span>Back to Discover</span>
          </Link>
          <Link
            href="/dashboard/student"
            className="flex-1 py-3 px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
