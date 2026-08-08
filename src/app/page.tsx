import React from "react";
import { Compass, ShieldCheck, Sparkles, Database, Layers, ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-6 sm:p-12 md:p-16 max-w-5xl mx-auto">
      {/* Header Navigation */}
      <header className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-sm">
            V2
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-zinc-100 uppercase">
              SRM Opportunity Intelligence Platform
            </h1>
            <p className="text-xs text-zinc-500 font-mono">System Foundation v2.0.0-alpha</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Architecture Ready
          </span>
        </div>
      </header>

      {/* Main Vision Banner */}
      <main className="my-16 space-y-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Opportunity Intelligence System</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-100 max-w-3xl leading-tight">
            Stop scrolling through scattered groups. Discover what actually matters to you.
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl font-light leading-relaxed">
            A database-driven platform bringing clarity to hackathons, research positions, internships, and verified campus opportunities at SRM Institute of Science and Technology.
          </p>
        </div>

        {/* Architectural Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="p-2 w-fit rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">Personalized Discovery</h3>
            <p className="text-xs text-zinc-400 leading-normal">
              Replaces noisy event listings with intelligent relevance scoring based on individual student skill profiles.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">Strict Trust Model</h3>
            <p className="text-xs text-zinc-400 leading-normal">
              Official badges are reserved exclusively for verified SRM clubs through multi-step administrator authentication.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="p-2 w-fit rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">Database-Driven Metrics</h3>
            <p className="text-xs text-zinc-400 leading-normal">
              Zero hardcoded mock statistics or fake listings. Real-time statistics generated exclusively from validated database records.
            </p>
          </div>
        </div>

        {/* Phase Status Banner */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-indigo-950/30 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 tracking-wider uppercase">
              <Layers className="w-3.5 h-3.5" />
              Phase 1 Completed
            </div>
            <p className="text-sm text-zinc-300">
              Technical foundation, type definitions, and modular V2 architecture established.
            </p>
          </div>
          <div className="text-xs text-zinc-500 font-mono flex items-center gap-1 shrink-0">
            Task 1 Complete <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <p>© {new Date().getFullYear()} SRM Opportunity Intelligence Platform V2</p>
        <div className="flex items-center gap-4">
          <span>Supabase Auth Ready</span>
          <span>•</span>
          <span>PostgreSQL Architecture</span>
          <span>•</span>
          <span>Next.js 15 App Router</span>
        </div>
      </footer>
    </div>
  );
}
