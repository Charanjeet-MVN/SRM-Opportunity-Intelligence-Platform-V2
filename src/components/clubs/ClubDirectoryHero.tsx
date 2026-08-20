"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  ShieldCheck,
  Layers,
  Search,
} from "lucide-react";

interface ClubDirectoryHeroProps {
  totalClubs: number;
  verifiedClubs: number;
  totalOpportunities: number;
  searchValue: string;
  onSearchChange: (val: string) => void;
}

export default function ClubDirectoryHero({
  totalClubs,
  verifiedClubs,
  totalOpportunities,
  searchValue,
  onSearchChange,
}: ClubDirectoryHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl bg-gradient-to-br from-zinc-900/95 via-zinc-950/90 to-purple-950/25 border border-zinc-800/80 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-2xl overflow-hidden space-y-8 group"
    >
      {/* Dynamic Ambient Aurora Lights */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/15 transition-all duration-700" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900/90 border border-zinc-800 text-zinc-300 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
          </span>
          <span className="text-purple-400 font-semibold uppercase tracking-wider text-[9px]">
            SRM Campus Ecosystem
          </span>
          <span className="text-zinc-600">•</span>
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-zinc-400 text-[10px]">Verified Student Bodies</span>
        </div>

        {/* Headline & Description */}
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            SRM Organizations & Student Chapters
          </h1>
          <p className="text-xs sm:text-sm sm:leading-relaxed text-zinc-300 font-light max-w-2xl">
            Discover authenticated technical chapters, coding societies, cultural collectives, and student leadership teams hosting hackathons, research summits, and recruitment drives.
          </p>
        </div>

        {/* Ecosystem Metric Pills Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs max-w-2xl">
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              Total Organizations
            </span>
            <span className="text-lg font-black text-zinc-100 font-mono">
              {totalClubs}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Bodies
            </span>
            <span className="text-lg font-black text-emerald-300 font-mono">
              {verifiedClubs}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Active Postings
            </span>
            <span className="text-lg font-black text-purple-300 font-mono">
              {totalOpportunities}
            </span>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative pt-2 max-w-2xl">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4.5 top-5.5 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search organizations by name, domain, or keywords..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all font-mono shadow-inner"
          />
        </div>
      </div>
    </motion.div>
  );
}
