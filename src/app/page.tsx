"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { OpportunityNetworkViz } from "@/components/landing/OpportunityNetworkViz";
import { ProductValueSection } from "@/components/landing/ProductValueSection";
import { ScrollNarrativeSection } from "@/components/landing/ScrollNarrativeSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden font-sans">
      {/* Fixed Top Header */}
      <LandingHeader />

      <main>
        {/* ─────────────── HERO ─────────────── */}
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16">
          {/* Atmospheric backgrounds */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(79,70,229,0.15),transparent)] pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />

          <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full relative z-10 py-16 sm:py-20">
            {/* Hero copy — centered */}
            <div className="text-center max-w-5xl mx-auto space-y-6 mb-12">
              {/* System status */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400 shadow-2xl shadow-black/50 backdrop-blur-sm"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-emerald-400 font-semibold tracking-widest uppercase text-[10px]">
                  Opportunity Intelligence Online
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-500">Built for SRM students</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05]"
              >
                <span className="text-zinc-100">Stop Missing the</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300">
                  Opportunities
                </span>
                <br />
                <span className="text-zinc-100">That Move Your</span>
                <br />
                <span className="text-zinc-300 font-bold">Career Forward.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-base sm:text-lg text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed"
              >
                SRM Opportunity Intelligence Platform brings verified hackathons, internships, research programs, competitions, workshops and campus opportunities into one intelligent discovery system.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
              >
                <Link
                  href="/opportunities"
                  className="group relative w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2.5 shadow-2xl shadow-indigo-600/30 hover:shadow-indigo-500/40 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Compass className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Explore Opportunities</span>
                  <ArrowUpRight className="w-4 h-4 relative z-10 text-indigo-200" />
                </Link>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-medium text-sm hover:bg-zinc-900/80 hover:text-white hover:border-zinc-700 transition-all flex items-center justify-center active:scale-95"
                >
                  Create Student Account
                </Link>
              </motion.div>
            </div>

            {/* 3D Network Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-4xl mx-auto"
            >
              {/* Frame */}
              <div className="relative rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-[0_0_80px_rgba(99,102,241,0.08)] overflow-hidden backdrop-blur-sm">
                {/* Top chrome bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <span className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-zinc-800" />
                      <span className="w-3 h-3 rounded-full bg-zinc-800" />
                      <span className="w-3 h-3 rounded-full bg-zinc-800" />
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    <span>Opportunity Intelligence Network — Live</span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-600">srm-oip-v2</div>
                </div>

                {/* Network canvas */}
                <OpportunityNetworkViz />

                {/* Bottom status bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-800/60 text-[10px] font-mono text-zinc-600">
                  <span className="flex items-center gap-1.5 text-emerald-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Database-backed verified feed
                  </span>
                  <span>Student → Skills → Intelligence → Action</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600"
          >
            <span className="text-[10px] font-mono tracking-widest uppercase">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent animate-pulse" />
          </motion.div>
        </section>

        {/* Product Value / Feature Bento */}
        <ProductValueSection />

        {/* Cinematic Scroll Narrative */}
        <ScrollNarrativeSection />

        {/* Trust Section */}
        <TrustSection />
      </main>

      <LandingFooter />
    </div>
  );
}
