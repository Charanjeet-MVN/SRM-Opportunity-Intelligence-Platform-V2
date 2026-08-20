"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ClubAnalyticsOverview } from "@/lib/clubs/analytics";
import { Club } from "@/types";
import SpatialCard3D from "@/components/3d/SpatialCard3D";
import VerificationBadge from "../clubs/VerificationBadge";
import {
  BarChart3,
  TrendingUp,
  Bookmark,
  Sparkles,
  ArrowRight,
  Layers,
  Activity,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Filter,
  Search,
  Users,
  Award,
  Clock,
  Plus,
  ShieldCheck,
  Percent,
} from "lucide-react";

interface ClubAnalyticsClientProps {
  club: Club;
  analytics: ClubAnalyticsOverview;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

type TimeframeOption = "all" | "90d" | "30d" | "7d";
type MetricView = "all" | "saves" | "registrations";

export default function ClubAnalyticsClient({ club, analytics }: ClubAnalyticsClientProps) {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("all");
  const [metricView, setMetricView] = useState<MetricView>("all");
  const [activeTab, setActiveTab] = useState<"campaigns" | "demographics" | "activity">("campaigns");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"registrations" | "saves" | "conversion" | "newest">("registrations");
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; saves: number; regs: number } | null>(null);

  const isVerified = club.verificationStatus === "verified";

  // Filter timelines by timeframe
  const filteredTimelineEvents = useMemo(() => {
    const now = new Date().getTime();
    const daysMap = { all: Infinity, "90d": 90, "30d": 30, "7d": 7 };
    const maxAgeMs = daysMap[timeframe] * 24 * 60 * 60 * 1000;

    const saves = analytics.savedTimeline.filter((s) => {
      if (timeframe === "all") return true;
      return now - new Date(s.date).getTime() <= maxAgeMs;
    });

    const registrations = analytics.registrationTimeline.filter((r) => {
      if (timeframe === "all") return true;
      return now - new Date(r.date).getTime() <= maxAgeMs;
    });

    return { saves, registrations };
  }, [analytics.savedTimeline, analytics.registrationTimeline, timeframe]);

  // Aggregate daily points for interactive chart
  const chartData = useMemo(() => {
    const dateMap: Record<string, { saves: number; regs: number }> = {};
    const datesSet = new Set<string>();

    filteredTimelineEvents.saves.forEach((s) => {
      const d = s.date.split("T")[0];
      datesSet.add(d);
      if (!dateMap[d]) dateMap[d] = { saves: 0, regs: 0 };
      dateMap[d].saves += 1;
    });

    filteredTimelineEvents.registrations.forEach((r) => {
      const d = r.date.split("T")[0];
      datesSet.add(d);
      if (!dateMap[d]) dateMap[d] = { saves: 0, regs: 0 };
      dateMap[d].regs += 1;
    });

    const sortedDates = Array.from(datesSet).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    let cumSaves = 0;
    let cumRegs = 0;

    return sortedDates.map((date) => {
      cumSaves += dateMap[date].saves;
      cumRegs += dateMap[date].regs;
      const d = new Date(date);
      return {
        date,
        label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        dailySaves: dateMap[date].saves,
        dailyRegs: dateMap[date].regs,
        cumSaves,
        cumRegs,
      };
    });
  }, [filteredTimelineEvents]);

  // Filtered and sorted campaign list
  const filteredCampaigns = useMemo(() => {
    return analytics.opportunityPerformance
      .filter((opp) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = opp.title.toLowerCase().includes(q);
          const matchesType = opp.type.toLowerCase().includes(q);
          if (!matchesTitle && !matchesType) return false;
        }

        if (typeFilter !== "all" && opp.type !== typeFilter) return false;
        if (statusFilter !== "all" && opp.status !== statusFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "registrations") return b.registeredCount - a.registeredCount;
        if (sortBy === "saves") return b.savedCount - a.savedCount;
        if (sortBy === "conversion") return b.conversionRate - a.conversionRate;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [analytics.opportunityPerformance, searchQuery, typeFilter, statusFilter, sortBy]);

  // Top performing campaign metrics
  const topCampaigns = useMemo(() => {
    if (analytics.opportunityPerformance.length === 0) return null;
    const sortedByRegs = [...analytics.opportunityPerformance].sort((a, b) => b.registeredCount - a.registeredCount);
    const sortedBySaves = [...analytics.opportunityPerformance].sort((a, b) => b.savedCount - a.savedCount);
    const sortedByConv = [...analytics.opportunityPerformance].filter((o) => o.savedCount >= 2).sort((a, b) => b.conversionRate - a.conversionRate);

    return {
      topRegistration: sortedByRegs[0]?.registeredCount > 0 ? sortedByRegs[0] : null,
      topBookmarked: sortedBySaves[0]?.savedCount > 0 ? sortedBySaves[0] : null,
      topConversion: sortedByConv[0]?.conversionRate > 0 ? sortedByConv[0] : null,
    };
  }, [analytics.opportunityPerformance]);

  const totalInteractions = analytics.totalSavedBookmarks + analytics.totalApplicationsRecorded;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* ── HEADER BANNER ── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl"
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-purple-400 font-bold uppercase tracking-wider text-[10px]">
                  Club Intelligence
                </span>
                <span className="text-zinc-700">•</span>
                <span className="text-zinc-300 font-medium">{club.name}</span>
              </div>

              <VerificationBadge status={club.verificationStatus} />
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Campaign & Student Analytics
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-2xl">
              Real-time intelligence on opportunity reach, bookmark demand, registration conversions, and student academic demographics for official events organized by{" "}
              <span className="text-zinc-200 font-medium">{club.name}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/dashboard/club/opportunities/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Opportunity</span>
            </Link>

            <Link
              href="/dashboard/club"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-xs transition-all"
            >
              <span>Club Command</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>

        {/* Verification Notice Banner if not approved */}
        {!isVerified && (
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200/90 font-mono">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Club verification is currently <strong className="uppercase">{club.verificationStatus}</strong>. Verified clubs receive prioritized discovery placement and official campus badges.
              </span>
            </div>
            <Link
              href="/dashboard/club/verification"
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-semibold shrink-0 transition-colors inline-flex items-center gap-1"
            >
              <span>Manage Verification</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </motion.div>

      {/* ── EXECUTIVE KPI METRIC CARDS ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Active Campaigns",
            value: analytics.activeCount,
            sub: `${analytics.publishedCount} Published • ${analytics.draftCount} Drafts`,
            icon: Layers,
            accent: "text-purple-400",
            border: "border-purple-500/20",
            bg: "bg-purple-500/5",
          },
          {
            label: "Total Registrations",
            value: analytics.totalApplicationsRecorded,
            sub: `${analytics.statusBreakdown.confirmed} Confirmed • ${analytics.totalAttendedCount} Attended`,
            icon: CheckCircle2,
            accent: "text-emerald-400",
            border: "border-emerald-500/20",
            bg: "bg-emerald-500/5",
          },
          {
            label: "Student Bookmarks",
            value: analytics.totalSavedBookmarks,
            sub: "Saved to student pipelines",
            icon: Bookmark,
            accent: "text-indigo-400",
            border: "border-indigo-500/20",
            bg: "bg-indigo-500/5",
          },
          {
            label: "Conversion Rate",
            value: `${analytics.overallConversionRate}%`,
            sub: "Bookmark to applicant conversion",
            icon: Percent,
            accent: "text-amber-400",
            border: "border-amber-500/20",
            bg: "bg-amber-500/5",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <SpatialCard3D key={card.label} depth={6} elevationZ={10}>
              <div
                className={`p-5 rounded-2xl ${card.bg} border ${card.border} space-y-3 relative overflow-hidden h-full flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400 font-medium">{card.label}</span>
                  <div className="w-8 h-8 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${card.accent}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${card.accent}`}>
                    {card.value}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono">{card.sub}</p>
                </div>
              </div>
            </SpatialCard3D>
          );
        })}
      </motion.div>

      {/* ── HIGHLIGHTED PERFORMANCE INSIGHTS (DERIVED FROM REAL DATA) ── */}
      {topCampaigns && (topCampaigns.topRegistration || topCampaigns.topBookmarked) && (
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-3xl border border-zinc-800/80 bg-zinc-950/60 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <h2 className="text-xs uppercase font-mono font-bold text-zinc-200 tracking-wider">
                Ecosystem Performance Highlights
              </h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              Computed from {analytics.publishedCount} active and past opportunities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topCampaigns.topRegistration && (
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Highest Registration
                  </span>
                  <span className="text-zinc-500">{topCampaigns.topRegistration.registeredCount} applicants</span>
                </div>
                <h3 className="text-xs font-semibold text-zinc-200 truncate">
                  {topCampaigns.topRegistration.title}
                </h3>
                <Link
                  href={`/dashboard/club/opportunities/${topCampaigns.topRegistration.slug}/analytics`}
                  className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                >
                  <span>Inspect Analytics</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {topCampaigns.topBookmarked && (
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-indigo-400 font-semibold flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5" /> Highest Student Demand
                  </span>
                  <span className="text-zinc-500">{topCampaigns.topBookmarked.savedCount} saves</span>
                </div>
                <h3 className="text-xs font-semibold text-zinc-200 truncate">
                  {topCampaigns.topBookmarked.title}
                </h3>
                <Link
                  href={`/dashboard/club/opportunities/${topCampaigns.topBookmarked.slug}/analytics`}
                  className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                >
                  <span>Inspect Analytics</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {topCampaigns.topConversion && (
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Top Conversion Star
                  </span>
                  <span className="text-zinc-500">{topCampaigns.topConversion.conversionRate}% conversion</span>
                </div>
                <h3 className="text-xs font-semibold text-zinc-200 truncate">
                  {topCampaigns.topConversion.title}
                </h3>
                <Link
                  href={`/dashboard/club/opportunities/${topCampaigns.topConversion.slug}/analytics`}
                  className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                >
                  <span>Inspect Analytics</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── INTERACTIVE TIMELINE & ENGAGEMENT CHARTS ── */}
      <motion.div
        variants={itemVariants}
        className="p-6 sm:p-7 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 space-y-6 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
                Student Engagement Timeline & Funnel
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-light">
              Interactive temporal visualization of saves, registrations, and confirmed attendance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Mode Filter */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono">
              <button
                onClick={() => setMetricView("all")}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                  metricView === "all" ? "bg-zinc-800 text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setMetricView("saves")}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                  metricView === "saves" ? "bg-indigo-600/30 text-indigo-300 font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Saves
              </button>
              <button
                onClick={() => setMetricView("registrations")}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                  metricView === "registrations" ? "bg-emerald-600/30 text-emerald-300 font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Registrations
              </button>
            </div>

            {/* Timeframe Filter */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono">
              {(["all", "90d", "30d", "7d"] as TimeframeOption[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all uppercase ${
                    timeframe === tf ? "bg-purple-600/30 text-purple-300 font-bold" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tf === "all" ? "All Time" : tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SVG Chart Rendering */}
        {chartData.length < 2 ? (
          <div className="h-64 rounded-2xl bg-zinc-900/30 border border-zinc-900 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <Activity className="w-5 h-5 animate-pulse text-purple-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-zinc-300 font-mono">
                {totalInteractions === 0 ? "No Student Interaction Logs Yet" : "Insufficient Data Points for Range"}
              </h3>
              <p className="text-[11px] text-zinc-500 max-w-sm leading-relaxed">
                As students save and register for your opportunities, daily interaction trajectories will automatically graph here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-900 p-4">
              {(() => {
                const width = 800;
                const height = 240;
                const padX = 50;
                const padY = 30;

                const maxVal = Math.max(
                  ...chartData.map((d) => {
                    if (metricView === "saves") return d.cumSaves;
                    if (metricView === "registrations") return d.cumRegs;
                    return Math.max(d.cumSaves, d.cumRegs);
                  }),
                  1
                );

                const cWidth = width - padX * 2;
                const cHeight = height - padY * 2;

                const points = chartData.map((d, i) => {
                  const x = padX + (i * cWidth) / (chartData.length - 1);
                  const ySaves = height - padY - (d.cumSaves * cHeight) / maxVal;
                  const yRegs = height - padY - (d.cumRegs * cHeight) / maxVal;
                  return { x, ySaves, yRegs, ...d };
                });

                const savesPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.ySaves}`).join(" ");
                const regsPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yRegs}`).join(" ");

                const savesArea = `${savesPath} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;
                const regsArea = `${regsPath} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

                return (
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                    <defs>
                      <linearGradient id="savesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="regsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                      const y = padY + r * cHeight;
                      return (
                        <line
                          key={idx}
                          x1={padX}
                          y1={y}
                          x2={width - padX}
                          y2={y}
                          stroke="#27272a"
                          strokeWidth={1}
                          strokeDasharray="3 3"
                        />
                      );
                    })}

                    {/* Saves Area & Line */}
                    {(metricView === "all" || metricView === "saves") && (
                      <>
                        <path d={savesArea} fill="url(#savesGrad)" />
                        <motion.path
                          d={savesPath}
                          fill="none"
                          stroke="#818cf8"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </>
                    )}

                    {/* Registrations Area & Line */}
                    {(metricView === "all" || metricView === "registrations") && (
                      <>
                        <path d={regsArea} fill="url(#regsGrad)" />
                        <motion.path
                          d={regsPath}
                          fill="none"
                          stroke="#34d399"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                        />
                      </>
                    )}

                    {/* Points & Hover triggers */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        {(metricView === "all" || metricView === "saves") && (
                          <circle
                            cx={p.x}
                            cy={p.ySaves}
                            r={4}
                            className="fill-indigo-400 stroke-zinc-950 stroke-2 hover:r-6 transition-all cursor-pointer"
                            onMouseEnter={() =>
                              setHoveredPoint({ x: p.x, y: p.ySaves, label: p.label, saves: p.cumSaves, regs: p.cumRegs })
                            }
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        )}

                        {(metricView === "all" || metricView === "registrations") && (
                          <circle
                            cx={p.x}
                            cy={p.yRegs}
                            r={4}
                            className="fill-emerald-400 stroke-zinc-950 stroke-2 hover:r-6 transition-all cursor-pointer"
                            onMouseEnter={() =>
                              setHoveredPoint({ x: p.x, y: p.yRegs, label: p.label, saves: p.cumSaves, regs: p.cumRegs })
                            }
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        )}
                      </g>
                    ))}

                    {/* X-axis date labels */}
                    {points.map((p, idx) => {
                      if (idx === 0 || idx === points.length - 1 || idx % Math.ceil(points.length / 6) === 0) {
                        return (
                          <text
                            key={idx}
                            x={p.x}
                            y={height - 10}
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

                    {/* Y-axis values */}
                    <text x={padX - 10} y={padY + 4} fill="#71717a" fontSize={9} textAnchor="end" fontFamily="monospace">
                      {maxVal}
                    </text>
                    <text x={padX - 10} y={height - padY + 4} fill="#71717a" fontSize={9} textAnchor="end" fontFamily="monospace">
                      0
                    </text>
                  </svg>
                );
              })()}

              {/* Hover tooltip */}
              {hoveredPoint && (
                <div
                  className="absolute p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl text-xs font-mono space-y-1 pointer-events-none z-20"
                  style={{
                    left: `${(hoveredPoint.x / 800) * 100}%`,
                    top: "10px",
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="text-zinc-400 font-bold border-b border-zinc-800 pb-1">{hoveredPoint.label}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-400">{hoveredPoint.saves} Saves</span>
                    <span className="text-emerald-400">{hoveredPoint.regs} Registrations</span>
                  </div>
                </div>
              )}
            </div>

            {/* Legend bar */}
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span>Cumulative Saves ({analytics.totalSavedBookmarks})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Cumulative Registrations ({analytics.totalApplicationsRecorded})</span>
                </div>
              </div>

              <span className="text-[11px] text-zinc-500">Hover data points to inspect daily aggregates</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── WORKSPACE TABS: CAMPAIGN BREAKDOWN vs AUDIENCE DEMOGRAPHICS vs ACTIVITY ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 pb-3 flex-wrap">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono cursor-pointer transition-all ${
                activeTab === "campaigns" ? "bg-zinc-800 text-zinc-100 shadow" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Opportunity Matrix ({analytics.opportunityPerformance.length})
            </button>
            <button
              onClick={() => setActiveTab("demographics")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono cursor-pointer transition-all ${
                activeTab === "demographics" ? "bg-zinc-800 text-zinc-100 shadow" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Audience & Skills
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono cursor-pointer transition-all ${
                activeTab === "activity" ? "bg-zinc-800 text-zinc-100 shadow" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Recent Logs ({totalInteractions})
            </button>
          </div>

          {activeTab === "campaigns" && (
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "registrations" | "saves" | "conversion" | "newest")}
                aria-label="Sort campaigns by"
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono focus:outline-none focus:border-purple-500"
              >
                <option value="registrations">Most Registrations</option>
                <option value="saves">Most Saves</option>
                <option value="conversion">Highest Conversion</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: CAMPAIGN MATRIX & COMPARISON */}
        {activeTab === "campaigns" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Filter controls */}
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter campaign by title or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  aria-label="Filter campaigns by opportunity type"
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="workshop">Workshop</option>
                  <option value="competition">Competition</option>
                  <option value="internship">Internship</option>
                  <option value="research">Research</option>
                  <option value="conference">Conference</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter campaigns by status"
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {filteredCampaigns.length === 0 ? (
              <div className="py-16 px-4 rounded-3xl bg-zinc-950/40 border border-zinc-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center mx-auto">
                  <Filter className="w-5 h-5 text-purple-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-zinc-200 font-mono">No Matching Campaigns Found</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    {analytics.opportunityPerformance.length === 0
                      ? "You haven't posted any opportunities yet. Click 'Post Opportunity' above to create your first event."
                      : "Try clearing your search query or adjusting your type/status filters."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCampaigns.map((opp) => {
                  return (
                    <div
                      key={opp.id}
                      className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group shadow-lg"
                    >
                      {/* Left: Info */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 uppercase tracking-wider text-purple-300 font-bold">
                            {opp.type.replace("_", " ")}
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span
                            className={
                              opp.status === "published" ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"
                            }
                          >
                            {opp.status.toUpperCase()}
                          </span>
                          {opp.deadline && (
                            <>
                              <span className="text-zinc-600">•</span>
                              <span className="text-zinc-400">
                                Deadline: {new Date(opp.deadline).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>

                        <Link
                          href={`/dashboard/club/opportunities/${opp.slug}/analytics`}
                          className="block font-bold text-sm sm:text-base text-zinc-100 hover:text-purple-400 transition-colors truncate"
                        >
                          {opp.title}
                        </Link>
                      </div>

                      {/* Middle: Metrics comparison */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 text-xs font-mono shrink-0">
                        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-900 space-y-0.5 text-center">
                          <span className="text-[10px] text-zinc-500 block uppercase">Saves</span>
                          <span className="font-bold text-indigo-400 text-sm">{opp.savedCount}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-900 space-y-0.5 text-center">
                          <span className="text-[10px] text-zinc-500 block uppercase">Applicants</span>
                          <span className="font-bold text-emerald-400 text-sm">{opp.registeredCount}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-900 space-y-0.5 text-center">
                          <span className="text-[10px] text-zinc-500 block uppercase">Conversion</span>
                          <span className="font-bold text-amber-400 text-sm">{opp.conversionRate}%</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-900 space-y-0.5 text-center hidden sm:block">
                          <span className="text-[10px] text-zinc-500 block uppercase">Attendance</span>
                          <span className="font-bold text-purple-400 text-sm">{opp.completedCount}</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-900 justify-end">
                        <Link
                          href={`/dashboard/club/opportunities/${opp.slug}/analytics`}
                          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-mono font-semibold hover:text-purple-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Deep Dive</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: AUDIENCE DEMOGRAPHICS & SKILL DEMAND */}
        {activeTab === "demographics" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real Department Breakdown */}
            <div className="p-6 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-xs uppercase font-mono font-bold text-zinc-200 tracking-wider">
                    Department Representation
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Academic branch of interacting students
                  </span>
                </div>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>

              {analytics.departmentDistribution.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-zinc-500">
                  No department demographics logged yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.departmentDistribution.map((item) => {
                    const totalDeptCount = analytics.departmentDistribution.reduce((acc, d) => acc + d.count, 0) || 1;
                    const pct = Math.round((item.count / totalDeptCount) * 100);

                    return (
                      <div key={item.department} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-300 truncate max-w-[180px]">{item.department}</span>
                          <span className="text-indigo-400 font-semibold">{item.count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Academic Year Distribution */}
            <div className="p-6 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-xs uppercase font-mono font-bold text-zinc-200 tracking-wider">
                    Study Year Split
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Distribution across SRM study cohorts
                  </span>
                </div>
                <Calendar className="w-4 h-4 text-emerald-400" />
              </div>

              {analytics.yearDistribution.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-zinc-500">
                  No study year data logged yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.yearDistribution.map((item) => {
                    const totalYearCount = analytics.yearDistribution.reduce((acc, y) => acc + y.count, 0) || 1;
                    const pct = Math.round((item.count / totalYearCount) * 100);

                    return (
                      <div key={item.year} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-300">Academic Year {item.year}</span>
                          <span className="text-emerald-400 font-semibold">{item.count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Requested Skills in Club Posts */}
            <div className="p-6 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-xs uppercase font-mono font-bold text-zinc-200 tracking-wider">
                    Prerequisite Skills Demand
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Most requested skills in club opportunities
                  </span>
                </div>
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              </div>

              {analytics.skillDemandDistribution.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-zinc-500">
                  No skills listed in posted opportunities.
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.skillDemandDistribution.map((item) => (
                    <div key={item.skill} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-300">{item.skill}</span>
                        <span className="text-purple-400 font-semibold">{item.count} posts</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
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
          </motion.div>
        )}

        {/* TAB 3: RECENT AUDIT LOGS */}
        {activeTab === "activity" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                Chronological Student Interaction Stream
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">
                Total logged interactions: {totalInteractions}
              </span>
            </div>

            {totalInteractions === 0 ? (
              <div className="py-16 text-center text-xs text-zinc-500 font-mono space-y-2">
                <Clock className="w-6 h-6 text-zinc-600 mx-auto" />
                <p>No student actions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                {analytics.registrationTimeline.map((item, idx) => (
                  <div
                    key={`reg-${idx}`}
                    className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs hover:border-zinc-700 transition-colors gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-semibold text-zinc-200 truncate">
                        Student registered for &quot;{item.opportunityTitle}&quot;
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-400">Status: {item.status}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}

                {analytics.savedTimeline.map((item, idx) => (
                  <div
                    key={`save-${idx}`}
                    className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs hover:border-zinc-700 transition-colors gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-semibold text-zinc-200 truncate">
                        Student bookmarked &quot;{item.opportunityTitle}&quot;
                      </h4>
                      <span className="text-[10px] font-mono text-indigo-400">Added to Pipeline</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
