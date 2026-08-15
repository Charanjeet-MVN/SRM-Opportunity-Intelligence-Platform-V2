"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { OpportunityAnalyticsData } from "@/lib/clubs/analytics";
import {
  Bookmark,
  UserCheck,
  Award,
  Activity,
  Sparkles,
  ArrowLeft,
  HelpCircle,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  Info,
} from "lucide-react";

interface OpportunityAnalyticsClientProps {
  analytics: OpportunityAnalyticsData;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// Dual Line SVG Chart (Saves + Registrations Timeline)
function DualLineChart({
  data,
}: {
  data: { date: string; saves: number; registrations: number }[];
}) {
  if (data.length < 2) {
    return (
      <div className="h-52 rounded-2xl bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center text-center p-4">
        <Activity className="w-8 h-8 text-zinc-700 mb-2 animate-pulse" />
        <p className="text-xs font-mono text-zinc-500">Insufficient timeline logs to render trend graph</p>
      </div>
    );
  }

  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const maxVal = Math.max(...data.map((d) => Math.max(d.saves, d.registrations)), 1);
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i * chartWidth) / (data.length - 1);
    const ySaves = height - paddingY - (d.saves * chartHeight) / maxVal;
    const yRegs = height - paddingY - (d.registrations * chartHeight) / maxVal;
    return { x, ySaves, yRegs, label: d.date };
  });

  const savesPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.ySaves}`).join(" ");
  const regsPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yRegs}`).join(" ");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
            <span className="text-zinc-300">Saves</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span className="text-zinc-300">Registrations</span>
          </div>
        </div>
        <span className="text-[10px] text-zinc-500">campaign metrics timeline</span>
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-900/60 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Grid Lines */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const y = paddingY + ratio * chartHeight;
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#27272a"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Saves Line */}
          <motion.path
            d={savesPath}
            fill="none"
            stroke="#6366f1"
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Registrations Line */}
          <motion.path
            d={regsPath}
            fill="none"
            stroke="#10b981"
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          />

          {/* X axis dates */}
          {points.map((p, idx) => {
            if (idx === 0 || idx === points.length - 1 || data.length <= 6) {
              const d = new Date(p.label);
              const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
              return (
                <text
                  key={idx}
                  x={p.x}
                  y={height - 8}
                  fill="#71717a"
                  fontSize={8}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {label}
                </text>
              );
            }
            return null;
          })}

          {/* Y Axis max */}
          <text x={paddingX - 10} y={paddingY + 4} fill="#71717a" fontSize={9} textAnchor="end" fontFamily="monospace">
            {maxVal}
          </text>
          <text x={paddingX - 10} y={height - paddingY + 4} fill="#71717a" fontSize={9} textAnchor="end" fontFamily="monospace">
            0
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function OpportunityAnalyticsClient({ analytics }: OpportunityAnalyticsClientProps) {
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  const { opportunity, savedCount, registeredCount, completedCount, impactScore, demographics, timeline, insights } =
    analytics;

  const totalEngagement = savedCount + registeredCount;
  const totalDemographicsCount = demographics.departments.reduce((acc, d) => acc + d.count, 0) || 1;
  const totalYearsCount = demographics.years.reduce((acc, y) => acc + y.count, 0) || 1;

  // Math variables for the score representation
  const savesPts = Math.min(40, savedCount * 4);
  const regsPts = Math.min(55, registeredCount * 10);
  const completedPts = Math.min(5, completedCount * 5);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* ── HEADER BANNER ── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/70 p-6 sm:p-8 space-y-4"
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Link href="/dashboard/club" className="text-zinc-500 hover:text-zinc-300">
                Club Command
              </Link>
              <span className="text-zinc-700">/</span>
              <Link href="/dashboard/club/analytics" className="text-zinc-500 hover:text-zinc-300">
                Analytics
              </Link>
              <span className="text-zinc-700">/</span>
              <span className="text-purple-400 font-bold uppercase tracking-wider text-[9px]">
                Opportunity Performance
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-100 line-clamp-1">
              Performance Audit: {opportunity.title}
            </h1>
            <p className="text-xs text-zinc-400 font-light max-w-lg leading-relaxed">
              Explore dynamic conversions, student academic departments breakdown, and performance impact scoring for this post.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/club/analytics"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-855 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-medium text-xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Analytics</span>
            </Link>
            <Link
              href={`/opportunities/${opportunity.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
            >
              <span>View Post</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── METRIC CARDS ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Saves Logged", value: savedCount, sub: "Student bookmarks", icon: Bookmark, accent: "text-indigo-400", bg: "bg-indigo-500/8 border-indigo-500/20" },
          { label: "Registrations", value: registeredCount, sub: "Form applications", icon: UserCheck, accent: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/20" },
          { label: "Completed (Attended)", value: completedCount, sub: "Verified attendance sheets", icon: Award, accent: "text-purple-400", bg: "bg-purple-500/8 border-purple-500/20" },
          { label: "Performance Score", value: `${impactScore}/100`, sub: "Deterministic reach rating", icon: Sparkles, accent: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/20" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`p-5 rounded-2xl ${card.bg} border space-y-2 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 font-medium">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.accent}`} />
              </div>
              <div className={`text-2xl font-black font-mono ${card.accent}`}>{card.value}</div>
              <p className="text-[10px] text-zinc-500 font-mono leading-none">{card.sub}</p>
            </div>
          );
        })}
      </motion.div>

      {/* ── EMPTY STATE OR FULL INTERACTION LAYOUT ── */}
      {totalEngagement === 0 ? (
        <motion.div
          variants={itemVariants}
          className="py-16 px-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto"
        >
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-600 flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-zinc-200">No Student Interactions Yet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Timelines, academic department breakdowns, and impact scoring will automatically render here as soon as students save or register for this opportunity.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Span 2): Impact score + Demographics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deterministic Opportunity Impact Score Explanation Card */}
            <motion.div
              variants={itemVariants}
              className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <h3 className="text-xs uppercase font-mono text-zinc-200 font-bold tracking-wider">
                    Ecosystem Impact Score
                  </h3>
                </div>
                <button
                  onClick={() => setShowFormulaInfo(!showFormulaInfo)}
                  className="text-xs font-mono font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>How is this calculated?</span>
                </button>
              </div>

              {/* Score breakdown visualization */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-zinc-950 border border-zinc-900/50">
                {/* Circular indicator */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="#1f1f22" strokeWidth="8" fill="transparent" />
                    <motion.circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke="url(#scoreCircleGrad)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={301.6}
                      initial={{ strokeDashoffset: 301.6 }}
                      animate={{ strokeDashoffset: 301.6 - (301.6 * impactScore) / 100 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="scoreCircleGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="50%" stopColor="#d946ef" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center font-mono">
                    <span className="text-2xl font-black text-zinc-100 leading-none">{impactScore}</span>
                    <span className="text-[9px] text-zinc-500 font-medium uppercase mt-0.5">pts</span>
                  </div>
                </div>

                {/* Horizontal progress breakdown */}
                <div className="flex-1 w-full space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">Student Saves contribution</span>
                      <span className="text-indigo-400 font-semibold">+{savesPts} pts / 40</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(savesPts / 40) * 100}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">Student Applications contribution</span>
                      <span className="text-emerald-400 font-semibold">+{regsPts} pts / 55</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(regsPts / 55) * 100}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">Verified Attendance contribution</span>
                      <span className="text-purple-400 font-semibold">+{completedPts} pts / 5</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(completedPts / 5) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Accordion Explanation */}
              <AnimatePresence>
                {showFormulaInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-zinc-950 border border-zinc-900 p-4 rounded-2xl text-xs font-mono text-zinc-400 space-y-2 leading-relaxed"
                  >
                    <p className="font-bold text-zinc-200">Mathematical Score System Transparency:</p>
                    <p>To eliminate artificial inflation, opportunity ratings are determined via a static weights formula:</p>
                    <div className="p-3 bg-zinc-900 rounded-xl space-y-1 text-[11px] leading-relaxed">
                      <div>1. **Student Save:** <code className="text-indigo-400 font-semibold">+4 points</code> per bookmark. capped at 10 bookmarks (<code className="text-zinc-400">40 points max</code>).</div>
                      <div>2. **Student Registration:** <code className="text-emerald-400 font-semibold">+10 points</code> per applicant. capped at 5.5 registration inputs (<code className="text-zinc-400">55 points max</code>).</div>
                      <div>3. **Event Attendance:** <code className="text-purple-400 font-semibold">+5 points</code> for student completion. (<code className="text-zinc-400">5 points max</code>).</div>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-light">Formula: Score = Math.min(100, (Saves * 4) + (Registrations * 10) + (Attendance * 5))</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Demographics Card */}
            <motion.div
              variants={itemVariants}
              className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl"
            >
              <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                Audience Academic demographics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Department distribution */}
                <div className="space-y-4">
                  <span className="text-[11px] font-mono text-zinc-500 block uppercase">Department breakdown</span>
                  {demographics.departments.length === 0 ? (
                    <div className="text-xs font-mono text-zinc-600">No departments logged.</div>
                  ) : (
                    <div className="space-y-3">
                      {demographics.departments.map((item) => (
                        <div key={item.name} className="space-y-1 text-xs">
                          <div className="flex justify-between font-mono">
                            <span className="text-zinc-300 truncate max-w-[150px]">{item.name}</span>
                            <span className="text-indigo-400 font-semibold">{item.count} students</span>
                          </div>
                          <div className="w-full h-1 rounded-full bg-zinc-950 overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${(item.count / totalDemographicsCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Years of study distribution */}
                <div className="space-y-4">
                  <span className="text-[11px] font-mono text-zinc-500 block uppercase">Study Year split</span>
                  {demographics.years.length === 0 ? (
                    <div className="text-xs font-mono text-zinc-600">No student study years logged.</div>
                  ) : (
                    <div className="space-y-3">
                      {demographics.years.map((item) => (
                        <div key={item.year} className="space-y-1 text-xs">
                          <div className="flex justify-between font-mono">
                            <span className="text-zinc-300">Academic Year {item.year}</span>
                            <span className="text-emerald-400 font-semibold">{item.count} students</span>
                          </div>
                          <div className="w-full h-1 rounded-full bg-zinc-950 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${(item.count / totalYearsCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Timelines & Insights */}
          <div className="space-y-6">
            {/* Chronological saves/registrations trend */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl">
              <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                Funnel Conversion Timeline
              </h3>
              <DualLineChart data={timeline} />
            </div>

            {/* Insights panel */}
            {insights.length > 0 && (
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                  <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                    Audience Analysis
                  </h3>
                </div>
                <div className="space-y-3">
                  {insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs font-light text-zinc-300 leading-relaxed flex items-start gap-2.5"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
