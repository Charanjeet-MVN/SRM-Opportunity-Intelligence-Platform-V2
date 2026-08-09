"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Compass, Sparkles } from "lucide-react";

const SCROLL_SECTIONS = [
  {
    id: "discover",
    num: "01",
    label: "DISCOVER",
    headline: "Every verified campus opportunity, in one place.",
    body: "Hackathons, internships, research programs, competitions, workshops and scholarships — surfaced from the chaos of scattered groups into a structured, searchable intelligence feed.",
    visual: (
      <div className="space-y-2 font-mono text-[11px]">
        {[
          { cat: "Hackathon", title: "National AI Build Challenge", badge: "Verified", color: "text-indigo-400" },
          { cat: "Research", title: "Generative AI Assistantship", badge: "Faculty", color: "text-sky-400" },
          { cat: "Internship", title: "Summer Engineering Fellowship", badge: "Verified", color: "text-emerald-400" },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80"
          >
            <div className="flex items-center gap-2.5">
              <span className={`text-[10px] font-semibold ${item.color}`}>{item.cat}</span>
              <span className="text-zinc-300">{item.title}</span>
            </div>
            <span className="text-emerald-400 text-[10px] flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />{item.badge}
            </span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: "understand",
    num: "02",
    label: "UNDERSTAND",
    headline: "Structure from noise.",
    body: "The platform normalizes scattered opportunity data — eligibility, deadlines, required skills, team sizes — into a consistent, indexed format that&apos;s actually useful.",
    visual: (
      <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/60 font-mono text-[11px] space-y-3">
        {[
          { key: "type", val: "hackathon" },
          { key: "required_skills", val: '["Python", "ML", "PyTorch"]' },
          { key: "eligible_departments", val: '["CSE", "IT", "ECE"]' },
          { key: "application_deadline", val: "2026-09-15T00:00:00Z" },
          { key: "location_type", val: "in_person" },
          { key: "status", val: "published · verified" },
        ].map(({ key, val }) => (
          <div key={key} className="flex gap-3">
            <span className="text-indigo-400 shrink-0 w-36">{key}</span>
            <span className="text-emerald-300">{val}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "personalize",
    num: "03",
    label: "PERSONALIZE",
    headline: "Matches that actually fit.",
    body: "Skill vectors, academic profile, department and interests — the platform scores each opportunity for relevance and surfaces what genuinely matters to you.",
    visual: (
      <div className="space-y-3">
        {[
          { label: "AI / Machine Learning", score: 96, color: "from-indigo-500 to-violet-500" },
          { label: "Full Stack Development", score: 82, color: "from-sky-500 to-indigo-500" },
          { label: "Academic Research", score: 74, color: "from-emerald-500 to-sky-500" },
        ].map(({ label, score, color }) => (
          <div key={label} className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-zinc-300">{label}</span>
              <span className="text-zinc-400">{score}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${score}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full rounded-full bg-gradient-to-r ${color}`}
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "track",
    num: "04",
    label: "TRACK",
    headline: "Never miss a deadline.",
    body: "Your student workspace tracks every opportunity you&apos;ve saved, applied to, or been shortlisted for — with clear deadline visibility and status pipeline.",
    visual: (
      <div className="space-y-2">
        {[
          { title: "SRM AI Hackathon", status: "Applied", deadline: "3 days left", statusColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25" },
          { title: "Research Assistantship", status: "Shortlisted", deadline: "Interview Pending", statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" },
          { title: "Summer Fellowship", status: "Saved", deadline: "12 days left", statusColor: "text-zinc-400 bg-zinc-800/60 border-zinc-700" },
        ].map((item) => (
          <div key={item.title} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] font-mono">
            <div>
              <div className="text-zinc-200 font-semibold">{item.title}</div>
              <div className="text-zinc-500 mt-0.5">{item.deadline}</div>
            </div>
            <span className={`px-2 py-0.5 rounded-md border ${item.statusColor}`}>{item.status}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export function ScrollNarrativeSection() {
  return (
    <section className="relative py-28 sm:py-36 border-t border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 mb-5">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Platform Narrative
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-4">
            From Scattered Signals<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">to Structured Intelligence</span>
          </h2>
          <p className="text-base text-zinc-400 font-light max-w-xl mx-auto">
            The SRM Opportunity Intelligence Platform distils campus noise into clear, actionable opportunity intelligence.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-24 sm:space-y-32">
          {SCROLL_SECTIONS.map((sec, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={sec.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${!isEven ? "lg:[&>div:first-child]:order-2" : ""}`}
              >
                {/* Text */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-bold text-indigo-400 tracking-widest">
                      {sec.num}
                    </span>
                    <div className="h-px w-8 bg-indigo-500/40" />
                    <span className="text-[11px] font-mono font-bold text-indigo-400 tracking-widest uppercase">
                      {sec.label}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-zinc-100 leading-snug">
                    {sec.headline}
                  </h3>
                  <p className="text-sm text-zinc-400 font-light leading-relaxed max-w-sm"
                    dangerouslySetInnerHTML={{ __html: sec.body }}
                  />
                </div>

                {/* Visual */}
                <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 shadow-2xl">
                  {sec.visual}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Act — Final in scroll */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-24 sm:mt-32 text-center space-y-6"
        >
          <div className="text-[11px] font-mono font-bold text-indigo-400 tracking-widest uppercase">
            05 · ACT
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold text-zinc-100 leading-tight max-w-2xl mx-auto">
            Your next opportunity is already out there.
          </h3>
          <p className="text-base text-zinc-400 font-light max-w-lg mx-auto">
            Stop missing opportunities because they were buried in scattered groups. Find yours before the deadline.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/opportunities"
              className="group w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 active:scale-95"
            >
              <Compass className="w-4 h-4" />
              Explore Opportunities
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium text-sm hover:bg-zinc-800/80 hover:text-white transition-colors flex items-center justify-center active:scale-95"
            >
              Create Student Account
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
