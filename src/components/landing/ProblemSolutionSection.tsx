"use client";

import React from "react";
import { motion } from "framer-motion";
import { XCircle, CheckCircle2, AlertTriangle, Zap, ArrowRight, ShieldCheck } from "lucide-react";

export function ProblemSolutionSection() {
  const painPoints = [
    "Scattered notices across hundreds of informal WhatsApp/Telegram groups",
    "Missed deadlines due to chaotic feeds and buried messages",
    "Unverified spam, fake hackathon posts, and untrusted links",
    "No way to filter by your actual branch, semester, or skill vector",
  ];

  const solutionPoints = [
    "Single authenticated database feed with verified SRM club listings",
    "Real-time status tracking (Saved → Applied → Shortlisted)",
    "Strict admin verification & Supabase PostgreSQL Row-Level Security",
    "Relevance matching tuned to your skills, department, and interests",
  ];

  return (
    <section className="relative py-24 sm:py-32 border-t border-zinc-800/60 overflow-hidden bg-zinc-950/60">
      {/* Subtle atmospheric glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Narrative Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-indigo-400"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Product Purpose</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 leading-tight"
          >
            From Campus Noise to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400">
              Structured Career Intelligence
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto"
          >
            Students miss career-defining opportunities not because they lack talent, but because campus information is fragmented across disconnected channels.
          </motion.p>
        </div>

        {/* Comparison Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Problem Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="p-8 rounded-3xl bg-red-950/10 border border-red-500/20 flex flex-col justify-between relative overflow-hidden group hover:border-red-500/35 transition-colors"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <AlertTriangle className="w-32 h-32 text-red-500" />
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest">
                    The Problem
                  </span>
                  <h3 className="text-xl font-bold text-zinc-100">Fragmented & Unverified Feeds</h3>
                </div>
              </div>

              <div className="space-y-4">
                {painPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-red-500/15 flex items-center justify-between text-xs font-mono text-red-400/80">
              <span>Status: High Friction & Missed Deadlines</span>
              <span className="font-bold">Chaos</span>
            </div>
          </motion.div>

          {/* Solution Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="p-8 rounded-3xl bg-indigo-950/15 border border-indigo-500/30 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/50 shadow-2xl shadow-indigo-950/30 transition-all"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ShieldCheck className="w-32 h-32 text-indigo-400" />
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest">
                    The Solution
                  </span>
                  <h3 className="text-xl font-bold text-zinc-100">SRM Opportunity Intelligence V2</h3>
                </div>
              </div>

              <div className="space-y-4">
                {solutionPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-zinc-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-indigo-500/20 flex items-center justify-between text-xs font-mono text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Database-Verified Pipeline Active
              </span>
              <span className="font-bold flex items-center gap-1">
                Clarity <ArrowRight className="w-3 h-3 text-indigo-400" />
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
