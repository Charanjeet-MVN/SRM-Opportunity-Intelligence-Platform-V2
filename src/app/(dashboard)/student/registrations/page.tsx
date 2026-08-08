import React from "react";
import Link from "next/link";
import { UserCheck, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function StudentRegistrationsPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-blue-950/30 border border-zinc-800/80 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <UserCheck className="w-3.5 h-3.5" />
          Participation Tracker
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          Application & Registration Audit
        </h1>
        <p className="text-xs text-zinc-400 max-w-xl">
          Track official application submissions, attendance confirmations, and internal registration records.
        </p>
      </div>

      {/* Zero-Mock Registrations State */}
      <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
          <UserCheck className="w-6 h-6 text-blue-400" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-zinc-200">No Registrations Recorded Yet</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            As you apply to verified campus opportunities and hackathons, your attendance receipts and status updates will be logged here.
          </p>
        </div>
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition-all"
        >
          <span>Explore Verified Opportunities</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
