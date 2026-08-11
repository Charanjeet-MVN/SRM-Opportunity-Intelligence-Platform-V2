"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Compass, Sparkles, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export function FinalCtaSection() {
  return (
    <section className="py-28 sm:py-36 border-t border-zinc-800/60 relative overflow-hidden bg-zinc-950">
      {/* Background Accent Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(79,70,229,0.12),transparent)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-zinc-900/90 border border-zinc-800 text-indigo-300 shadow-xl"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>SRM Opportunity Intelligence Platform V2</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-6xl font-black tracking-tight text-zinc-100 max-w-4xl mx-auto leading-[1.08]"
        >
          Ready to Discover Your Next <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400">
            Campus Opportunity?
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed"
        >
          Stop relying on scattered chat messages. Explore real-time, database-verified hackathons, research grants, internships, and club recruitments tuned to your skills.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link
            href="/opportunities"
            className="group relative w-full sm:w-auto px-9 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2.5 shadow-2xl shadow-indigo-600/40 hover:shadow-indigo-500/50 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Compass className="w-4 h-4 text-indigo-200" />
            <span>Explore Opportunities</span>
            <ArrowUpRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          <Link
            href="/register"
            className="w-full sm:w-auto px-9 py-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-200 font-medium text-sm hover:bg-zinc-800/80 hover:text-white hover:border-zinc-700 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <UserPlus className="w-4 h-4 text-zinc-400" />
            <span>Create Student Account</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
