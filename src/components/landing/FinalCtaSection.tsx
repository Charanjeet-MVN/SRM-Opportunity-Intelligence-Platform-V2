"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Compass, Sparkles } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="py-24 border-t border-zinc-800/60 relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-zinc-950 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>SRM Opportunity Intelligence Platform V2</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-100 max-w-3xl mx-auto leading-tight">
          Your next opportunity is already out there. Find it before you miss it.
        </h2>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
          Stop scrolling through scattered chat groups. Get personalized match scores for verified hackathons, internships, research projects, and campus recruitments.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/opportunities"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-95"
          >
            <Compass className="w-4 h-4 text-zinc-700" />
            <span>Explore Opportunities</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-500" />
          </Link>

          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium hover:bg-zinc-800/80 hover:text-white transition-colors flex items-center justify-center active:scale-95"
          >
            Create Student Account
          </Link>
        </div>
      </div>
    </section>
  );
}
