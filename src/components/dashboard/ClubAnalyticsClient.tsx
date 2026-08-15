"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ClubAnalyticsOverview } from "@/lib/clubs/analytics";
import { Club } from "@/types";
import {
  BarChart3,
  TrendingUp,
  Bookmark,
  Sparkles,
  ArrowRight,
  Layers,
  Award,
  Calendar,
  Activity,
  ChevronRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface ClubAnalyticsClientProps {
  club: Club;
  analytics: ClubAnalyticsOverview;
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

// Custom animated SVG line chart for Club campaigns
function ClubLineChart({ data, title }: { data: { label: string; value: number }[]; title: string }) {
  if (data.length < 2) {
    return (
      <div className="h-48 rounded-2xl bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center text-center p-4">
        <Activity className="w-8 h-8 text-zinc-600 mb-2 animate-pulse" />
        <p className="text-xs font-mono text-zinc-500">Insufficient historical data to show engagement trend</p>
      </div>
    );
  }

  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i * chartWidth) / (data.length - 1);
    const y = height - paddingY - (d.value * chartHeight) / maxVal;
    return { x, y, label: d.label, value: d.value };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-zinc-400 font-semibold">{title}</span>
        <span className="text-[10px] font-mono text-zinc-500">total interactions log</span>
      </div>
      <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-900/60 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="clubChartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="clubStrokeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#e879f9" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
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

          {/* Area */}
          <motion.path
            d={areaPath}
            fill="url(#clubChartGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />

          {/* Path line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="url(#clubStrokeGrad)"
            strokeWidth={3}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Circles */}
          {points.map((p, idx) => (
            <g key={idx} className="group/point">
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                className="fill-purple-400 stroke-zinc-950 stroke-2 cursor-pointer transition-all hover:r-6"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={10}
                className="fill-purple-500/0 hover:fill-purple-500/10 cursor-pointer"
              />
            </g>
          ))}

          {/* X Labels */}
          {points.map((p, idx) => {
            if (idx === 0 || idx === points.length - 1 || data.length <= 5) {
              return (
                <text
                  key={idx}
                  x={p.x}
                  y={height - 8}
                  fill="#71717a"
                  fontSize={9}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {p.label}
                </text>
              );
            }
            return null;
          })}

          {/* Y Max/Min */}
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

export default function ClubAnalyticsClient({ club, analytics }: ClubAnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState<"performance" | "timeline">("performance");

  const totalActions = analytics.totalSavedBookmarks + analytics.totalApplicationsRecorded;

  // Prepare line chart data by grouping saves and registrations chronologically
  const timelineMap: Record<string, number> = {};
  const sortedDates: string[] = [];

  const allEvents = [
    ...analytics.savedTimeline.map((s) => ({ date: s.date.split("T")[0] })),
    ...analytics.registrationTimeline.map((r) => ({ date: r.date.split("T")[0] })),
  ];

  allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let rollingCount = 0;
  allEvents.forEach((ev) => {
    if (!timelineMap[ev.date]) {
      timelineMap[ev.date] = 0;
      sortedDates.push(ev.date);
    }
    rollingCount += 1;
    timelineMap[ev.date] = rollingCount;
  });

  const chartData = sortedDates.map((date) => {
    const d = new Date(date);
    return {
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: timelineMap[date],
    };
  });

  const STAT_CARDS = [
    {
      label: "Active Campaigns",
      value: analytics.activeCount,
      sub: `${analytics.publishedCount} Published • ${analytics.expiredCount} Expired`,
      icon: Layers,
      accent: "text-purple-400",
      bg: "bg-purple-500/8 border-purple-500/20",
    },
    {
      label: "Total Saves",
      value: analytics.totalSavedBookmarks,
      sub: "Bookmarks by students",
      icon: Bookmark,
      accent: "text-indigo-400",
      bg: "bg-indigo-500/8 border-indigo-500/20",
    },
    {
      label: "Applications Received",
      value: analytics.totalApplicationsRecorded,
      sub: "Official registrations",
      icon: CheckCircle2,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/8 border-emerald-500/20",
    },
    {
      label: "Average Student Reach",
      value: analytics.publishedCount > 0
        ? Math.round(((analytics.totalSavedBookmarks + analytics.totalApplicationsRecorded) / analytics.publishedCount) * 10) / 10
        : 0,
      sub: "Interactions per post",
      icon: TrendingUp,
      accent: "text-amber-400",
      bg: "bg-amber-500/8 border-amber-500/20",
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* ── HEADER BANNER ── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/70 p-6 sm:p-8 space-y-4"
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-400 font-bold uppercase tracking-wider text-[9px]">
                Club Analytics Dashboard
              </span>
              <span className="text-zinc-700">•</span>
              <span className="text-zinc-400 text-[10px]">{club.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
              How are my opportunities performing?
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-lg">
              Monitor student engagement, bookmark trends, registration conversion, and skill prerequisites for opportunities published by {club.name}.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/club"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-medium text-xs transition-all"
            >
              <span>Back to Club Command</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── KPI GRID ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`p-5 rounded-2xl ${card.bg} border space-y-3 relative overflow-hidden`}>
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

      {/* ── INSIGHT PANEL ── */}
      {analytics.opportunityPerformance.length > 0 && (
        <motion.div variants={itemVariants} className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <h2 className="text-xs uppercase font-mono font-bold text-zinc-200 tracking-wider">
              Campaign Conversion Insights
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Conversion Insight */}
            {analytics.totalSavedBookmarks > 0 && (
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-xs font-light text-zinc-300 leading-relaxed flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                <span>
                  Average save-to-registration conversion rate across your opportunities is{" "}
                  <strong className="text-purple-400 font-mono">
                    {Math.round((analytics.totalApplicationsRecorded / analytics.totalSavedBookmarks) * 100) || 0}%
                  </strong>
                  .
                </span>
              </div>
            )}

            {/* Top Opportunity */}
            {(() => {
              const bestOpp = [...analytics.opportunityPerformance].sort((a, b) => b.savedCount - a.savedCount)[0];
              if (bestOpp && bestOpp.savedCount > 0) {
                return (
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-xs font-light text-zinc-300 leading-relaxed flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                    <span>
                      Opportunity <strong className="text-zinc-100 font-semibold">&quot;{bestOpp.title}&quot;</strong> has received the highest student interest with <strong className="text-indigo-400 font-mono">{bestOpp.savedCount} saves</strong>.
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            {/* Expired Campaign Warning */}
            {analytics.expiredCount > 0 && (
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-xs font-light text-zinc-300 leading-relaxed flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                <span>
                  You have <strong className="text-amber-400 font-mono">{analytics.expiredCount} expired listings</strong>. Consider archiving them to keep the student discovery feed clean.
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── WORKSPACE SPLIT: CAMPAIGN BREAKDOWN vs TIMELINES & CHART ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Tabbed Performance lists */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setActiveTab("performance")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold font-mono cursor-pointer transition-all ${
                activeTab === "performance" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Opportunity Performance breakdown
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold font-mono cursor-pointer transition-all ${
                activeTab === "timeline" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Ecosystem Activity logs
            </button>
          </div>

          {activeTab === "performance" ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl"
            >
              <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                Active Listings Conversion Breakdown
              </h3>

              {analytics.opportunityPerformance.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500 font-mono">
                  No campaigns published yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.opportunityPerformance.map((opp) => (
                    <div
                      key={opp.id}
                      className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900/80 hover:border-zinc-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs group"
                    >
                      <div className="space-y-1 min-w-0">
                        <Link href={`/dashboard/club/opportunities/${opp.slug}/analytics`}>
                          <h4 className="font-semibold text-zinc-200 hover:text-purple-400 truncate transition-colors">
                            {opp.title}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                          <span className="capitalize">{opp.type.replace("_", " ")}</span>
                          <span>•</span>
                          <span className={opp.status === "published" ? "text-emerald-400" : "text-amber-400"}>
                            {opp.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 font-mono text-right justify-between sm:justify-end">
                        <div className="space-y-0.5">
                          <span className="block font-bold text-indigo-400">{opp.savedCount} Saves</span>
                          <span className="block text-[10px] text-zinc-600">{opp.registeredCount} Regs</span>
                        </div>
                        <Link
                          href={`/dashboard/club/opportunities/${opp.slug}/analytics`}
                          className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold flex items-center gap-1 group-hover:text-purple-400 transition-colors"
                        >
                          <span>Analyze</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl"
            >
              <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                Recent Interactions Audit
              </h3>

              {totalActions === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500 font-mono">
                  No interactions captured yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                  {analytics.registrationTimeline.map((item, idx) => (
                    <div
                      key={`reg-${idx}`}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-between text-xs hover:border-zinc-800 transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold text-zinc-300 truncate max-w-sm sm:max-w-md">
                          Student registered for &quot;{item.opportunityTitle}&quot;
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-500">Status: {item.status}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-600 shrink-0">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}

                  {analytics.savedTimeline.map((item, idx) => (
                    <div
                      key={`save-${idx}`}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-between text-xs hover:border-zinc-800 transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold text-zinc-300 truncate max-w-sm sm:max-w-md">
                          Student saved &quot;{item.opportunityTitle}&quot;
                        </h4>
                        <span className="text-[10px] font-mono text-indigo-400">Bookmark Logged</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-600 shrink-0">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Column: Charts & Skill vectors */}
        <div className="space-y-6">
          {/* Timeline Chart */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl">
            <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
              Engagement timeline
            </h3>
            <ClubLineChart data={chartData} title="campaign reach performance" />
          </div>

          {/* Top Demand Skills */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                Requested Skills demand
              </h3>
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>

            {analytics.skillDemandDistribution.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-zinc-500">
                No skill demands logged.
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.skillDemandDistribution.map((item) => (
                  <div key={item.skill} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-300">{item.skill}</span>
                      <span className="text-purple-400 font-semibold">{item.count} posts</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (item.count / (analytics.publishedCount || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
