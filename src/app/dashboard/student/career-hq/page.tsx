import React from "react";
import { Layout } from "lucide-react";
import CareerHQClient from "@/components/dashboard/CareerHQClient";

export const metadata = {
  title: "Career HQ Flagship Command - SRM Opportunity Intelligence Platform",
  description: "Central command cockpit and Career Operating System (SOS). Tracks health diagnostics, success predictions, prioritizations, and calendars.",
};

export default function StudentCareerHQPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* ── HEADER BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/70 p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Layout className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-400 font-bold uppercase tracking-wider text-[9px]">
                Career Operating System
              </span>
              <span className="text-zinc-700">•</span>
              <span className="text-zinc-500 text-[10px]">Career HQ Central Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
              Career HQ Flagship Center
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-xl">
              Track overall career score diagnostics, view visual schedulers on the operating calendar, check priority planners, and interact with the AI Decision Center.
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN CAREER HQ Cockpit ── */}
      <CareerHQClient />
    </div>
  );
}
