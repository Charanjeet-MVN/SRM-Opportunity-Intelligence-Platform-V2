"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { StudentAnalyticsOverview } from "@/lib/students/analytics";
import { StudentProfile } from "@/types";
import {
  Bookmark,
  UserCheck,
  Clock,
  Compass,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BarChart3,
  Calendar,
  Activity,
  Award,
  Layers,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

interface StudentAnalyticsClientProps {
  profile: StudentProfile | null;
  analytics: StudentAnalyticsOverview;
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

// Premium SVG Line Chart
function SleekLineChart({ data, title }: { data: { label: string; value: number }[]; title: string }) {
  if (data.length < 2) {
    return (
      <div className="h-48 rounded-2xl bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center text-center p-4">
        <Activity className="w-8 h-8 text-zinc-600 mb-2 animate-pulse" />
        <p className="text-xs font-mono text-zinc-500">Insufficient activity logs to render line trend</p>
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
        <span className="text-[10px] font-mono text-zinc-500">cumulative history</span>
      </div>
      <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-900/60 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#6366f1" />
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

          {/* Area under the line */}
          <motion.path
            d={areaPath}
            fill="url(#chartGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />

          {/* Path line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth={3}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Data points/circles */}
          {points.map((p, idx) => (
            <g key={idx} className="group/point">
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                className="fill-indigo-400 stroke-zinc-950 stroke-2 cursor-pointer transition-all hover:r-6"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={10}
                className="fill-indigo-500/0 hover:fill-indigo-500/10 cursor-pointer"
              />
            </g>
          ))}

          {/* X axis labels */}
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

          {/* Y Axis max label */}
          <text
            x={paddingX - 10}
            y={paddingY + 4}
            fill="#71717a"
            fontSize={9}
            textAnchor="end"
            fontFamily="monospace"
          >
            {maxVal}
          </text>
          <text
            x={paddingX - 10}
            y={height - paddingY + 4}
            fill="#71717a"
            fontSize={9}
            textAnchor="end"
            fontFamily="monospace"
          >
            0
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function StudentAnalyticsClient({ profile, analytics }: StudentAnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState<"journey" | "timeline">("journey");

  const totalInteractions = analytics.savedCount + analytics.registeredCount;

  // Prepare chart data (group by date)
  const timelineMap: Record<string, number> = {};
  const sortedDates: string[] = [];

  // Gather unique dates in chronological order
  const allEvents = [
    ...analytics.savedTimeline.map((s) => ({ date: s.date.split("T")[0] })),
    ...analytics.registrationTimeline.map((r) => ({ date: r.date.split("T")[0] })),
  ];

  allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let rollingSum = 0;
  allEvents.forEach((ev) => {
    if (!timelineMap[ev.date]) {
      timelineMap[ev.date] = 0;
      sortedDates.push(ev.date);
    }
    rollingSum += 1;
    timelineMap[ev.date] = rollingSum;
  });

  const chartData = sortedDates.map((date) => {
    const d = new Date(date);
    return {
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: timelineMap[date],
    };
  });

  // Journey States
  const journeyStates = [
    {
      id: "discovered",
      label: "Discovered",
      count: analytics.journey.discoveredCount,
      desc: "Live verified opportunities published on platform",
      icon: Compass,
      color: "text-zinc-400 bg-zinc-900 border-zinc-800",
    },
    {
      id: "saved",
      label: "Saved",
      count: analytics.journey.savedCount,
      desc: "Opportunities bookmarked in your private dashboard",
      icon: Bookmark,
      color: "text-indigo-400 bg-indigo-500/8 border-indigo-500/20",
    },
    {
      id: "tracking",
      label: "Tracking",
      count: analytics.journey.trackingCount,
      desc: "Active saved/registered items with active deadlines",
      icon: Clock,
      color: "text-amber-400 bg-amber-500/8 border-amber-500/20",
    },
    {
      id: "applied",
      label: "Applied",
      count: analytics.journey.appliedCount,
      desc: "Registrations logged with official verification codes",
      icon: UserCheck,
      color: "text-emerald-400 bg-emerald-500/8 border-emerald-500/20",
    },
    {
      id: "completed",
      label: "Completed",
      count: analytics.journey.completedCount,
      desc: "Events marked attended by organization reps",
      icon: Award,
      color: "text-purple-400 bg-purple-500/8 border-purple-500/20",
    },
  ];

  // Dynamic Insight Panel Generation
  const insights: string[] = [];
  if (profile) {
    const completeness =
      (profile.fullName ? 20 : 0) +
      (profile.department ? 15 : 0) +
      (profile.yearOfStudy ? 10 : 0) +
      (profile.skills.length > 0 ? 20 : 0) +
      (profile.interests.length > 0 ? 10 : 0) +
      (profile.careerGoals ? 10 : 0) +
      (profile.registerNumber ? 15 : 0);

    if (completeness < 100) {
      insights.push(
        `Your student profile is ${completeness}% complete. Fill out the remaining fields to enhance the accuracy of your personalized AI recommendations.`
      );
    }
  }

  if (analytics.savedCount > 0 && analytics.registeredCount === 0) {
    insights.push("You have saved opportunities but haven't registered for any yet. Review your deadlines to submit applications before they close.");
  } else if (analytics.savedCount > 0 && analytics.registeredCount > 0) {
    const convRate = Math.round((analytics.registeredCount / analytics.savedCount) * 100);
    insights.push(`Your bookmark-to-application conversion rate is ${convRate}%. You are actively pursuing ${analytics.registeredCount} opportunities.`);
  }

  // Type-specific insight
  if (analytics.typeDistribution.length > 0) {
    const topType = analytics.typeDistribution[0].type.replace("_", " ");
    insights.push(
      `You show a strong preference for ${topType} opportunities, which account for the majority of your dashboard interactions.`
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* ── HEADER BANNER ── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/70 p-6 sm:p-8 space-y-4"
      >
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-indigo-400 font-bold uppercase tracking-wider text-[9px]">
                Student Impact Center
              </span>
              <span className="text-zinc-700">•</span>
              <span className="text-zinc-500 text-[10px]">Real-Time Interaction Data</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
              How am I engaging with opportunities?
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-lg">
              Analyze your discovery funnel, saved campaigns, application timelines, and category preferences across the SRM ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/student"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-medium text-xs transition-all"
            >
              <span>Back to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── KPI HIGHLIGHTS ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Saves Logged", value: analytics.savedCount, desc: "Total bookmarked items", icon: Bookmark, accent: "text-indigo-400", bg: "bg-indigo-500/8 border-indigo-500/20" },
          { label: "Applications Logged", value: analytics.registeredCount, desc: "Successful registrations", icon: UserCheck, accent: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/20" },
          { label: "Completed Events", value: analytics.completedCount, desc: "Verified attendance sheets", icon: Award, accent: "text-purple-400", bg: "bg-purple-500/8 border-purple-500/20" },
          { label: "Interaction Activity", value: totalInteractions, desc: "Combined funnel actions", icon: Activity, accent: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/20" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`p-5 rounded-2xl ${card.bg} border space-y-3 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 font-medium">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.accent}`} />
              </div>
              <div className={`text-2xl font-black font-mono ${card.accent}`}>{card.value}</div>
              <p className="text-[10px] text-zinc-500 font-mono leading-none">{card.desc}</p>
            </div>
          );
        })}
      </motion.div>

      {/* ── DYNAMIC INSIGHTS PANEL ── */}
      {insights.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs uppercase font-mono font-bold text-zinc-200 tracking-wider">
              Student Engagement Insights
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-xs font-light text-zinc-300 leading-relaxed flex items-start gap-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── MAIN WORKSPACE CONTENT: JOURNEY VISUALIZATION & CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Journey Visualization & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Journey Header Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setActiveTab("journey")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold font-mono cursor-pointer transition-all ${
                activeTab === "journey" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Engagement Funnel Journey
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold font-mono cursor-pointer transition-all ${
                activeTab === "timeline" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Activity Interaction Logs
            </button>
          </div>

          {activeTab === "journey" ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                  Personal Funnel Pipeline
                </h3>
                <span className="text-[10px] font-mono text-zinc-500">discovered → completed</span>
              </div>

              {/* Journey Funnel Pipeline */}
              <div className="flex flex-col space-y-4">
                {journeyStates.map((state, index) => {
                  const Icon = state.icon;
                  const isLast = index === journeyStates.length - 1;
                  return (
                    <React.Fragment key={state.id}>
                      <div
                        className={`p-4 rounded-2xl border ${state.color} flex items-center justify-between gap-4 transition-all hover:scale-[1.005]`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-semibold text-zinc-100">{state.label}</h4>
                            <p className="text-[10px] text-zinc-500 font-light leading-relaxed max-w-md sm:max-w-xl">
                              {state.desc}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-base font-black font-mono text-zinc-100">
                            {state.count}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500 block">items</span>
                        </div>
                      </div>
                      {!isLast && (
                        <div className="flex justify-center py-0.5">
                          <ChevronRight className="w-4 h-4 text-zinc-700 rotate-90" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl"
            >
              <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                Interaction History Audit Logs
              </h3>

              {totalInteractions === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Activity className="w-8 h-8 text-zinc-700 mx-auto animate-pulse" />
                  <p className="text-xs font-mono text-zinc-500">No interaction events logged yet.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                  {analytics.registrationTimeline.map((item, idx) => (
                    <div
                      key={`reg-${idx}`}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900/80 flex items-center justify-between gap-4 text-xs hover:border-zinc-800 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <Link href={`/opportunities/${item.opportunitySlug}`}>
                          <h4 className="font-semibold text-zinc-200 hover:text-indigo-400 truncate transition-colors">
                            {item.title}
                          </h4>
                        </Link>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Registered via {item.clubName}
                        </p>
                      </div>
                      <div className="text-right shrink-0 font-mono space-y-0.5">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          {item.status}
                        </span>
                        <span className="block text-[9px] text-zinc-600">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}

                  {analytics.savedTimeline.map((item, idx) => (
                    <div
                      key={`save-${idx}`}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900/80 flex items-center justify-between gap-4 text-xs hover:border-zinc-800 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <Link href={`/opportunities/${item.opportunitySlug}`}>
                          <h4 className="font-semibold text-zinc-200 hover:text-indigo-400 truncate transition-colors">
                            {item.title}
                          </h4>
                        </Link>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Bookmarked under {item.clubName}
                        </p>
                      </div>
                      <div className="text-right shrink-0 font-mono space-y-0.5">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                          bookmarked
                        </span>
                        <span className="block text-[9px] text-zinc-600">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right 1 Column: Growth trends & type distributions */}
        <div className="space-y-6">
          {/* Trend Growth Chart */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl">
            <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
              Engagement Trend Line
            </h3>
            <SleekLineChart data={chartData} title="funnel interactions progress" />
          </div>

          {/* Type Distribution */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                Type Preferences
              </h3>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>

            {analytics.typeDistribution.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-zinc-500">
                No preferences logged yet.
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.typeDistribution.map((item) => (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-300 capitalize">{item.type.replace("_", " ")}</span>
                      <span className="text-indigo-400 font-semibold">{item.count} items</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (item.count / totalInteractions) * 100)}%`,
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
