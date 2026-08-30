"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { StudentActivityTimelineItem, StudentActivityType, ActivityDateBucket } from "@/lib/engagement/actions";
import SpatialCard3D from "@/components/3d/SpatialCard3D";
import {
  Activity,
  Bookmark,
  Send,
  CheckCircle2,
  Award,
  Building2,
  Calendar,
  Clock,
  Search,
  Compass,
  Filter,
  ChevronRight,
  Layers,
} from "lucide-react";

interface StudentActivityWorkspaceClientProps {
  initialActivities: StudentActivityTimelineItem[];
}

type FilterOption = "all" | StudentActivityType;

const BUCKET_TITLES: Record<ActivityDateBucket, string> = {
  today: "TODAY",
  yesterday: "YESTERDAY",
  this_week: "THIS WEEK",
  earlier_this_month: "EARLIER THIS MONTH",
  past: "PAST HISTORY",
};

export default function StudentActivityWorkspaceClient({
  initialActivities,
}: StudentActivityWorkspaceClientProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activities] = useState<StudentActivityTimelineItem[]>(initialActivities);
  const [filterType, setFilterType] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Telemetry metrics
  const metrics = useMemo(() => {
    let saved = 0;
    let applied = 0;
    let registered = 0;
    let completed = 0;
    let joined = 0;

    activities.forEach((act) => {
      if (act.type === "saved") saved++;
      else if (act.type === "applied") applied++;
      else if (act.type === "registered") registered++;
      else if (act.type === "completed") completed++;
      else if (act.type === "joined_club") joined++;
    });

    return {
      total: activities.length,
      saved,
      applied,
      registered,
      completed,
      joined,
    };
  }, [activities]);

  // Filtered activity items
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Type filter
      if (filterType !== "all" && act.type !== filterType) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = act.title.toLowerCase().includes(q);
        const matchesOrg = act.organizer.toLowerCase().includes(q);
        const matchesDesc = act.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesOrg && !matchesDesc) return false;
      }

      return true;
    });
  }, [activities, filterType, searchQuery]);

  // Grouped by chronological date bucket
  const groupedActivities = useMemo(() => {
    const buckets: ActivityDateBucket[] = ["today", "yesterday", "this_week", "earlier_this_month", "past"];
    const groups: { bucket: ActivityDateBucket; title: string; items: StudentActivityTimelineItem[] }[] = [];

    buckets.forEach((bucket) => {
      const items = filteredActivities.filter((act) => act.dateBucket === bucket);
      if (items.length > 0) {
        groups.push({
          bucket,
          title: BUCKET_TITLES[bucket],
          items,
        });
      }
    });

    return groups;
  }, [filteredActivities]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.3,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const getActivityIcon = (type: StudentActivityType) => {
    switch (type) {
      case "saved":
        return Bookmark;
      case "applied":
        return Send;
      case "registered":
        return CheckCircle2;
      case "completed":
        return Award;
      case "joined_club":
        return Building2;
      default:
        return Activity;
    }
  };

  const getActivityStyle = (type: StudentActivityType) => {
    switch (type) {
      case "saved":
        return {
          iconClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          pillClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
          accentColor: "border-purple-500/40",
          dotColor: "bg-purple-400",
        };
      case "applied":
        return {
          iconClass: "bg-sky-500/10 text-sky-400 border-sky-500/30",
          pillClass: "bg-sky-500/15 text-sky-300 border-sky-500/30",
          accentColor: "border-sky-500/40",
          dotColor: "bg-sky-400",
        };
      case "registered":
        return {
          iconClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
          pillClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
          accentColor: "border-indigo-500/40",
          dotColor: "bg-indigo-400",
        };
      case "completed":
        return {
          iconClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          pillClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
          accentColor: "border-emerald-500/40",
          dotColor: "bg-emerald-400",
        };
      case "joined_club":
        return {
          iconClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          pillClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          accentColor: "border-amber-500/40",
          dotColor: "bg-amber-400",
        };
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-5xl mx-auto"
    >
      {/* ── HEADER BANNER ── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-2xl"
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
                Activity 2.0
              </span>
              <span className="text-zinc-700">•</span>
              <span className="text-zinc-400 text-[10px]">Student History Log</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              What have I done on SOIP?
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-2xl">
              Authentic chronological ledger of your opportunity bookmarks, application submissions, verified event participations, and campus organization actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Discover Opportunities</span>
            </Link>

            <Link
              href="/dashboard/student/calendar"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-xs transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Calendar</span>
            </Link>
          </div>
        </div>

        {/* ── METRIC STRIP ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-850">
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-indigo-400" /> Total Actions
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-zinc-200">{metrics.total}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Bookmark className="w-3 h-3 text-purple-400" /> Saved to Radar
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-purple-300">{metrics.saved}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Send className="w-3 h-3 text-sky-400" /> Applications & Passes
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-sky-300">
              {metrics.applied + metrics.registered}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Award className="w-3 h-3 text-emerald-400" /> Completed
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300">{metrics.completed}</div>
          </div>
        </div>
      </motion.div>

      {/* ── FILTER & SEARCH CONTROLS ── */}
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-850/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activity by opportunity title, club name, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {[
            { id: "all", label: "All Activity" },
            { id: "saved", label: "Saved" },
            { id: "applied", label: "Applied" },
            { id: "registered", label: "Registered" },
            { id: "completed", label: "Completed" },
          ].map((tab) => {
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as FilterOption)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-zinc-100 text-zinc-950 font-bold shadow"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── ACTIVITY TIMELINE CONTENT ── */}
      {activities.length === 0 ? (
        /* Genuine Zero Activity Empty State */
        <motion.div
          variants={itemVariants}
          className="py-20 px-6 rounded-3xl bg-zinc-950/60 border border-zinc-800 text-center space-y-5 max-w-md mx-auto shadow-2xl"
        >
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center mx-auto shadow-inner">
            <Activity className="w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 font-mono">No activity yet.</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Start exploring opportunities, bookmarking hackathons, or applying to events to build your activity history.
            </p>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Opportunities</span>
          </Link>
        </motion.div>
      ) : filteredActivities.length === 0 ? (
        /* Filter Empty Result */
        <motion.div
          variants={itemVariants}
          className="py-16 px-6 rounded-3xl bg-zinc-950/40 border border-zinc-850 text-center space-y-4 max-w-md mx-auto"
        >
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center mx-auto">
            <Filter className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-200 font-mono">No Matching Activity</h3>
            <p className="text-xs text-zinc-500 font-mono">
              Try adjusting your search query or active filter selector.
            </p>
          </div>
          <button
            onClick={() => {
              setFilterType("all");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-mono text-purple-300 font-semibold cursor-pointer transition-all"
          >
            Reset All Filters
          </button>
        </motion.div>
      ) : (
        /* Chronological Date Groups */
        <div className="space-y-10">
          {groupedActivities.map((group) => (
            <div key={group.bucket} className="space-y-4">
              {/* Natural Date Header */}
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  {group.title}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
                <span className="text-[10px] font-mono text-zinc-500">
                  {group.items.length} {group.items.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              {/* Timeline Chain */}
              <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-px before:bg-gradient-to-b before:from-indigo-500/60 before:via-purple-500/40 before:to-zinc-800/80">
                <AnimatePresence mode="popLayout">
                  {group.items.map((act) => {
                    const Icon = getActivityIcon(act.type);
                    const style = getActivityStyle(act.type);

                    return (
                      <motion.div
                        key={act.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="relative group"
                      >
                        {/* Timeline Node Dot */}
                        <div className="absolute -left-[27px] sm:-left-[35px] top-4 w-3.5 h-3.5 rounded-full bg-zinc-950 border-2 border-zinc-700 flex items-center justify-center group-hover:scale-125 transition-transform z-10">
                          <div className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />
                        </div>

                        {/* Activity Card */}
                        <SpatialCard3D depth={6} elevationZ={8}>
                          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 transition-all space-y-3 shadow-lg">
                            {/* Card Top Row: Type Pill, Organizer & Relative Time */}
                            <div className="flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${style.pillClass}`}
                                >
                                  <Icon className="w-3 h-3" />
                                  <span>{act.statusBadgeText}</span>
                                </span>

                                <div className="flex items-center gap-1 text-zinc-400 text-[11px]">
                                  <Building2 className="w-3 h-3 text-zinc-500 shrink-0" />
                                  <span className="truncate max-w-[200px]">{act.organizer}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]" title={new Date(act.timestamp).toLocaleString()}>
                                <Clock className="w-3 h-3" />
                                <span>{act.relativeTime}</span>
                              </div>
                            </div>

                            {/* Main Story & Title */}
                            <div className="space-y-1">
                              <Link
                                href={act.actionUrl}
                                className="text-sm sm:text-base font-bold text-zinc-100 hover:text-purple-300 transition-colors leading-snug line-clamp-2 block"
                              >
                                {act.title}
                              </Link>
                              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                                {act.description}
                              </p>
                            </div>

                            {/* Card Footer: Metadata & Action CTA */}
                            <div className="pt-2.5 border-t border-zinc-850/80 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
                              {act.metadata?.deadlineDate ? (
                                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-amber-400" />
                                  <span>Deadline: {new Date(act.metadata.deadlineDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-zinc-500">Verified student activity</span>
                              )}

                              <Link
                                href={act.actionUrl}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                <span>{act.actionLabel}</span>
                                <ChevronRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </SpatialCard3D>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
