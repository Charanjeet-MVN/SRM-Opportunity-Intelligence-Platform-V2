"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Compass,
  ShieldCheck,
  BookmarkCheck,
  Search,
  LayoutDashboard,
  Send,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ElementType;
  tag: string;
  title: string;
  description: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  previewWidget: React.ReactNode;
  delay?: number;
  colSpan?: string;
}

export function ProductValueSection() {
  const features: FeatureCardProps[] = [
    {
      icon: Compass,
      tag: "01 · DISCOVERY",
      title: "Opportunity Discovery",
      description:
        "Vector relevance matching, domain tags, and department filters bring hackathons, internships, and research grants directly to your feed.",
      accentColor: "text-indigo-400",
      accentBg: "bg-indigo-500/10",
      accentBorder: "border-indigo-500/30",
      colSpan: "lg:col-span-2",
      previewWidget: (
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 font-mono text-[11px] space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Vector Match Score
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold">
              98% Fit
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Artificial Intelligence", "Python", "PyTorch", "2026 Hackathon"].map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      icon: BookmarkCheck,
      tag: "02 · TRACKING",
      title: "Personal Tracking",
      description:
        "Your private workspace status pipeline. Save, track, and monitor every opportunity from initial bookmark to final decision.",
      accentColor: "text-violet-400",
      accentBg: "bg-violet-500/10",
      accentBorder: "border-violet-500/30",
      colSpan: "lg:col-span-1",
      previewWidget: (
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
          {["Saved", "Applied", "Shortlisted", "Accepted"].map((s, i) => (
            <React.Fragment key={s}>
              <span
                className={`px-2.5 py-1 rounded-lg border ${
                  i <= 1
                    ? "bg-violet-500/15 border-violet-500/30 text-violet-300 font-semibold"
                    : "bg-zinc-950 border-zinc-800 text-zinc-500"
                }`}
              >
                {s}
              </span>
              {i < 3 && <ArrowRight className="w-3 h-3 text-zinc-700 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      ),
    },
    {
      icon: ShieldCheck,
      tag: "03 · TRUST",
      title: "Verified Organizations",
      description:
        "Multi-stage administrator verification ensures only official SRM club opportunities and faculty research programs are published.",
      accentColor: "text-emerald-400",
      accentBg: "bg-emerald-500/10",
      accentBorder: "border-emerald-500/30",
      colSpan: "lg:col-span-1",
      previewWidget: (
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 font-mono text-[11px] space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Next Tech Lab SRM
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
              Verified Club
            </span>
          </div>
          <p className="text-zinc-500 text-[10px]">Official Org ID: org_srm_ntl_2026</p>
        </div>
      ),
    },
    {
      icon: Search,
      tag: "04 · SEARCH",
      title: "Search & Filtering",
      description:
        "Instant query indexing with multi-attribute filtering across branch, semester, skill vector, and event mode (in-person / online).",
      accentColor: "text-sky-400",
      accentBg: "bg-sky-500/10",
      accentBorder: "border-sky-500/30",
      colSpan: "lg:col-span-2",
      previewWidget: (
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 font-mono text-[11px] space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-2 text-zinc-200">
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
              <span>Dept: CSE</span>
              <span className="text-zinc-600">•</span>
              <span>Mode: In-Person</span>
            </span>
            <span className="text-sky-400 font-bold">3 Results</span>
          </div>
        </div>
      ),
    },
    {
      icon: LayoutDashboard,
      tag: "05 · WORKSPACE",
      title: "Student Workspace",
      description:
        "Centralized personal dashboard featuring saved opportunities, application timelines, deadline alerts, and interest vector controls.",
      accentColor: "text-amber-400",
      accentBg: "bg-amber-500/10",
      accentBorder: "border-amber-500/30",
      colSpan: "lg:col-span-2",
      previewWidget: (
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 font-mono text-[11px] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-zinc-200 font-semibold">Active Workspace</div>
            <div className="text-zinc-500 text-[10px]">4 Saved · 2 Applied · 1 Pending</div>
          </div>
          <span className="px-2 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px]">
            Sync Active
          </span>
        </div>
      ),
    },
    {
      icon: Send,
      tag: "06 · PUBLISHING",
      title: "Club Opportunity Publishing",
      description:
        "Empower campus club leaders to draft, submit for admin review, and publish verified opportunities directly to SRM students.",
      accentColor: "text-rose-400",
      accentBg: "bg-rose-500/10",
      accentBorder: "border-rose-500/30",
      colSpan: "lg:col-span-1",
      previewWidget: (
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 font-mono text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-zinc-300">
            <span className="font-semibold">Draft Opportunity</span>
            <span className="text-rose-400 text-[10px]">Submitted for Review</span>
          </div>
          <div className="text-[10px] text-zinc-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> PostgreSQL RLS Secured
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="relative py-28 sm:py-36 border-t border-zinc-800/60 overflow-hidden bg-zinc-950">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Implemented Platform Features</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 leading-tight">
            Built Around Real Campus <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-200">
              Product Capabilities
            </span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
            Every feature on SRM Opportunity Intelligence V2 represents actual working database logic, verified workflows, and student tools.
          </p>
        </div>

        {/* Feature Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`group relative p-7 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl ${
                  feat.colSpan || ""
                }`}
              >
                {/* Subtle border illumination gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="space-y-5 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl ${feat.accentBg} border ${feat.accentBorder} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-5 h-5 ${feat.accentColor}`} />
                    </div>
                    <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${feat.accentColor}`}>
                      {feat.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 mb-2">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-800/60 relative z-10">
                  {feat.previewWidget}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
