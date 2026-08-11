"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Compass, Sparkles, ShieldCheck, Cpu, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { ProblemSolutionSection } from "@/components/landing/ProblemSolutionSection";
import { OpportunityNetworkViz } from "@/components/landing/OpportunityNetworkViz";
import { ProductValueSection } from "@/components/landing/ProductValueSection";
import { ScrollNarrativeSection } from "@/components/landing/ScrollNarrativeSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePos({
      x: (clientX / innerWidth - 0.5) * 20,
      y: (clientY / innerHeight - 0.5) * 20,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden font-sans"
    >
      {/* Fixed Top Header */}
      <LandingHeader />

      <main>
        {/* ─────────────── HERO SECTION ─────────────── */}
        <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden pt-24 pb-16">
          {/* Atmospheric background gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(79,70,229,0.18),transparent)] pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          {/* Futuristic grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(99,102,241,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.6) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-12">
            {/* Hero Copy */}
            <div className="text-center max-w-4xl mx-auto space-y-6 mb-16 relative">
              {/* System status pill */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-950/90 border border-zinc-800 text-xs font-mono text-zinc-300 shadow-2xl backdrop-blur-md"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-emerald-400 font-semibold tracking-wider uppercase text-[10px]">
                  Opportunity Intelligence V2
                </span>
                <span className="text-zinc-700">•</span>
                <span className="text-zinc-400 text-[11px]">SRM Student Ecosystem</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05]"
              >
                <span className="text-zinc-100">SRM&apos;s Opportunity Ecosystem,</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400">
                  Intelligently Organized.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-base sm:text-xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed"
              >
                Verified hackathons, internships, research grants, and campus recruitments indexed into one high-clarity discovery engine.
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
                  className="group relative w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2.5 shadow-2xl shadow-indigo-600/35 hover:shadow-indigo-500/50 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Compass className="w-4 h-4 text-indigo-200" />
                  <span>Explore Opportunities</span>
                  <ArrowUpRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-medium text-sm hover:bg-zinc-900 hover:text-white hover:border-zinc-700 transition-all flex items-center justify-center active:scale-95"
                >
                  Create Student Account
                </Link>
              </motion.div>
            </div>

            {/* Floating UI Elements Container */}
            <div className="relative w-full max-w-5xl mx-auto">
              {/* Floating Element 1: Opportunity Card */}
              <motion.div
                style={{ x: mousePos.x * 0.4, y: mousePos.y * 0.4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="hidden lg:flex absolute -left-12 top-10 z-20 p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-2xl backdrop-blur-xl max-w-[240px] font-mono text-[11px] space-y-2 pointer-events-none hover:border-indigo-500/40 transition-colors"
              >
                <div className="flex items-center justify-between text-indigo-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Hackathon 2026
                  </span>
                </div>
                <div className="text-zinc-300 font-sans font-semibold text-xs">National AI Build Challenge</div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                  <span className="text-emerald-400 font-semibold">98% Match</span>
                  <span>4 Days Left</span>
                </div>
              </motion.div>

              {/* Floating Element 2: Skill Vectors Card */}
              <motion.div
                style={{ x: -mousePos.x * 0.4, y: -mousePos.y * 0.4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="hidden lg:flex absolute -right-12 top-16 z-20 p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-2xl backdrop-blur-xl max-w-[220px] font-mono text-[11px] space-y-2 pointer-events-none hover:border-violet-500/40 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-violet-400 font-bold">
                  <Cpu className="w-3.5 h-3.5" /> Student Vectors
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30">
                    PyTorch
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    Full Stack
                  </span>
                </div>
              </motion.div>

              {/* Floating Element 3: Student Profile Card */}
              <motion.div
                style={{ x: mousePos.x * 0.3, y: mousePos.y * 0.3 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="hidden lg:flex absolute -left-8 bottom-8 z-20 p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 shadow-2xl backdrop-blur-xl font-mono text-[11px] items-center gap-2.5 pointer-events-none"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-zinc-200 font-semibold font-sans">CSE Student Profile</div>
                  <div className="text-[10px] text-zinc-500">4 Bookmarked · 2 Applied</div>
                </div>
              </motion.div>

              {/* Floating Element 4: Verified Club Badge */}
              <motion.div
                style={{ x: -mousePos.x * 0.3, y: -mousePos.y * 0.3 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="hidden lg:flex absolute -right-8 bottom-12 z-20 p-3 rounded-xl bg-zinc-950/90 border border-zinc-800 shadow-2xl backdrop-blur-xl font-mono text-[11px] items-center gap-2.5 pointer-events-none"
              >
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-zinc-200 font-semibold font-sans">Next Tech Lab & IEEE</div>
                  <div className="text-[10px] text-indigo-400 font-semibold">Verified SRM Clubs</div>
                </div>
              </motion.div>

              {/* Main Interactive Opportunity Network Component */}
              <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-full relative z-10"
              >
                <OpportunityNetworkViz />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─────────────── PRODUCT STORY NARRATIVE ─────────────── */}

        {/* 1. Problem & Solution Narrative */}
        <ProblemSolutionSection />

        {/* 2. Interactive Feature Cards Bento */}
        <ProductValueSection />

        {/* 3. Cinematic Scroll Narrative */}
        <ScrollNarrativeSection />

        {/* 4. Trust & Security Section */}
        <TrustSection />

        {/* 5. Final CTA Section */}
        <FinalCtaSection />
      </main>

      <LandingFooter />
    </div>
  );
}
