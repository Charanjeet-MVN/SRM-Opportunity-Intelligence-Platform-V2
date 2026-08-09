"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, ShieldCheck, BookmarkCheck, Database, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.12 } },
};

interface Feature {
  icon: React.ElementType;
  tag: string;
  title: string;
  description: string;
  bullets: string[];
  accent: string;
  accentBg: string;
  accentBorder: string;
  section: string;
}

const FEATURES: Feature[] = [
  {
    icon: Compass,
    tag: "01 · DISCOVER",
    title: "Intelligent Discovery",
    description:
      "Natural language search, relevance scoring, and skill-vector matching guide each student toward the opportunities that fit them best.",
    bullets: [
      "Search across titles, skills and domain tags",
      "Relevance scoring matched to your academic profile",
      "Filter by branch, semester and location mode",
    ],
    accent: "text-indigo-400",
    accentBg: "bg-indigo-500/10",
    accentBorder: "border-indigo-500/30",
    section: "DISCOVER",
  },
  {
    icon: ShieldCheck,
    tag: "02 · TRUST",
    title: "Verified Ecosystem",
    description:
      "Strict administrator verification ensures only official SRM club opportunities and academic programs enter the platform.",
    bullets: [
      "Multi-step admin review for every public posting",
      "Verified badges for authenticated SRM organizations",
      "Supabase Row-Level Security protecting all data",
    ],
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    accentBorder: "border-emerald-500/30",
    section: "UNDERSTAND",
  },
  {
    icon: BookmarkCheck,
    tag: "03 · TRACK",
    title: "Personal Tracking",
    description:
      "Your own intelligence workspace — save, organize and track every opportunity across deadlines, status and progress.",
    bullets: [
      "Bookmark opportunities to your personal workspace",
      "Status pipeline: Saved → Applied → Shortlisted",
      "Deadline visibility and application timeline",
    ],
    accent: "text-violet-400",
    accentBg: "bg-violet-500/10",
    accentBorder: "border-violet-500/30",
    section: "TRACK",
  },
  {
    icon: Database,
    tag: "04 · INTELLIGENCE",
    title: "Opportunity Intelligence",
    description:
      "Transform scattered campus signals into a structured, indexed, searchable opportunity feed backed by real database records.",
    bullets: [
      "Normalized metadata across all opportunity categories",
      "Direct eligibility, team-size and submission links",
      "Zero fabricated listings — fully database-driven",
    ],
    accent: "text-sky-400",
    accentBg: "bg-sky-500/10",
    accentBorder: "border-sky-500/30",
    section: "ACT",
  },
];

export function ProductValueSection() {
  return (
    <section className="relative py-28 sm:py-36 border-t border-zinc-800/50 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="mb-20 max-w-2xl"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Product Architecture
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-100 leading-[1.1] mb-4">
            Engineered for<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Campus Clarity</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-base text-zinc-400 font-light leading-relaxed">
            Four intelligence layers designed to eliminate noise, surface verified signals, and guide students from discovery to participation.
          </motion.p>
        </motion.div>

        {/* Feature Grid — asymmetric layout */}
        <div className="space-y-6">
          {/* Row 1 — large left + small right */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Large feature card */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-3 group relative p-8 sm:p-10 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-indigo-500/30 transition-all duration-500 overflow-hidden"
            >
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2.5 rounded-xl ${FEATURES[0].accentBg} border ${FEATURES[0].accentBorder}`}>
                    <Compass className={`w-5 h-5 ${FEATURES[0].accent}`} />
                  </div>
                  <span className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${FEATURES[0].accent}`}>
                    {FEATURES[0].tag}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-3">{FEATURES[0].title}</h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed mb-8 max-w-lg">{FEATURES[0].description}</p>

                <div className="space-y-2.5">
                  {FEATURES[0].bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-zinc-400">
                      <span className={`w-1.5 h-1.5 rounded-full ${FEATURES[0].accent.replace("text-", "bg-")} mt-1.5 shrink-0`} />
                      {b}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini animated search console */}
              <div className="mt-8 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/60 font-mono text-[11px] space-y-2">
                <div className="flex items-center gap-2 text-zinc-500">
                  <span className="text-indigo-400">›</span>
                  <span className="text-zinc-300">search</span>
                  <span className="text-emerald-300">&quot;AI hackathons for CSE&quot;</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <span className="text-zinc-600">—</span>
                  <span>Matched 3 verified opportunities</span>
                  <span className="ml-auto text-indigo-400">Vector: 94%</span>
                </div>
              </div>
            </motion.div>

            {/* Small card */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="lg:col-span-2 group p-7 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-emerald-500/30 transition-all duration-500 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2.5 rounded-xl ${FEATURES[1].accentBg} border ${FEATURES[1].accentBorder}`}>
                  <ShieldCheck className={`w-5 h-5 ${FEATURES[1].accent}`} />
                </div>
                <span className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${FEATURES[1].accent}`}>
                  {FEATURES[1].tag}
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">{FEATURES[1].title}</h3>
              <p className="text-sm text-zinc-400 font-light leading-relaxed mb-6 flex-1">{FEATURES[1].description}</p>

              {/* Trust flow visual */}
              <div className="space-y-2 text-[11px] font-mono">
                {["Club submits opportunity", "Admin reviews & verifies", "Published with Verified badge"].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-zinc-400">{step}</span>
                    {i === 2 && <span className="ml-auto text-emerald-400">✓</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Row 2 — small left + large right */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-2 group p-7 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-violet-500/30 transition-all duration-500 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2.5 rounded-xl ${FEATURES[2].accentBg} border ${FEATURES[2].accentBorder}`}>
                  <BookmarkCheck className={`w-5 h-5 ${FEATURES[2].accent}`} />
                </div>
                <span className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${FEATURES[2].accent}`}>
                  {FEATURES[2].tag}
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">{FEATURES[2].title}</h3>
              <p className="text-sm text-zinc-400 font-light leading-relaxed mb-6 flex-1">{FEATURES[2].description}</p>

              {/* Timeline visual */}
              <div className="flex items-center gap-1 text-[10px] font-mono">
                {["Saved", "Applied", "Shortlisted", "Accepted"].map((s, i) => (
                  <React.Fragment key={s}>
                    <span className={`px-2 py-1 rounded-md border ${i <= 1 ? "bg-violet-500/15 border-violet-500/30 text-violet-300" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>
                      {s}
                    </span>
                    {i < 3 && <ArrowRight className="w-3 h-3 text-zinc-700 shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="lg:col-span-3 group relative p-8 sm:p-10 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-sky-500/30 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/10 transition-all duration-700" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2.5 rounded-xl ${FEATURES[3].accentBg} border ${FEATURES[3].accentBorder}`}>
                    <Database className={`w-5 h-5 ${FEATURES[3].accent}`} />
                  </div>
                  <span className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${FEATURES[3].accent}`}>
                    {FEATURES[3].tag}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-3">{FEATURES[3].title}</h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed mb-8 max-w-lg">{FEATURES[3].description}</p>

                <div className="space-y-2.5">
                  {FEATURES[3].bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-zinc-400">
                      <span className={`w-1.5 h-1.5 rounded-full ${FEATURES[3].accent.replace("text-", "bg-")} mt-1.5 shrink-0`} />
                      {b}
                    </div>
                  ))}
                </div>
              </div>

              {/* DB record visual */}
              <div className="mt-8 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/60 font-mono text-[11px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sky-400 font-semibold">opportunities.type</span>
                  <span className="text-zinc-500 text-[10px]">PostgreSQL · RLS Enabled</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["hackathon", "internship", "research", "competition", "workshop", "scholarship"].map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
