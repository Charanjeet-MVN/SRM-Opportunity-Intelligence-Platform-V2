import React from "react";
import ResumeLabClient from "@/components/dashboard/ResumeLabClient";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "AI Resume Lab & Portfolio Studio | SRM Opportunity Intelligence",
  description: "Upload your resume for ATS screening, skill extraction, and construct a professional shareable developer portfolio.",
};

export default async function ResumeLabPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-purple-950/30 border border-zinc-800/80 space-y-2 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Intelligence Lab</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
          Resume Lab & Portfolio Studio
        </h1>
        <p className="text-xs text-zinc-400 max-w-xl leading-relaxed font-mono">
          Screen your resume using AI algorithms, identify missing skill vectors, track your credentials, and showcase yourself with a clean professional portfolio.
        </p>
      </div>

      {/* Main client application */}
      <ResumeLabClient />
    </div>
  );
}
