"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { StudentProfile } from "@/types";
import { TrackerOpportunity } from "@/components/opportunities/StudentOpportunityTracker";
import { calculateOpportunityRelevance, RelevanceScoreResult } from "@/lib/relevance/scoring";
import { getDeadlineUrgency } from "@/lib/notifications/urgency";
import BookmarkButton from "@/components/opportunities/BookmarkButton";
import SpatialCard3D from "@/components/3d/SpatialCard3D";
import {
  Clock,
  Calendar,
  CheckCircle2,
  Flame,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Layers,
  Compass,
  Bookmark,
  CalendarDays,
  Check,
  Building2,
  Zap,
} from "lucide-react";

export interface TimelineMilestone {
  id: string;
  title: string;
  date: string;
  type: "deadline" | "event_start";
  opportunitySlug: string;
  clubName: string;
  opportunityType: string;
}

type ViewMode = "radar" | "calendar" | "kanban";
type UrgencyBand = "all" | "urgent" | "soon" | "upcoming" | "expired";
type TrackingFilter = "all" | "saved" | "registered";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

interface ProcessedRadarItem extends TrackerOpportunity {
  urgency: ReturnType<typeof getDeadlineUrgency>;
  relevance: RelevanceScoreResult;
  urgencyBand: "urgent" | "soon" | "upcoming" | "expired" | "no_deadline";
  trackingState: "saved" | "registered" | "attended";
  priorityScore: number;
  remainingText: string;
}

interface DeadlineRadarClientProps {
  savedOpportunities: TrackerOpportunity[];
  registeredOpportunities: TrackerOpportunity[];
  timelineEvents?: TimelineMilestone[];
  studentProfile: StudentProfile | null;
}

export default function DeadlineRadarClient({
  savedOpportunities,
  registeredOpportunities,
  studentProfile,
}: DeadlineRadarClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("radar");
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyBand>("all");
  const [trackingFilter, setTrackingFilter] = useState<TrackingFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"priority" | "deadline" | "relevance" | "newest">("priority");

  // Calendar specific state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);

  // Combine and deduplicate tracked opportunities with computed real metrics
  const processedItems: ProcessedRadarItem[] = useMemo(() => {
    const map = new Map<string, TrackerOpportunity & { trackingState: "saved" | "registered" | "attended" }>();

    // Add saved
    savedOpportunities.forEach((opp) => {
      map.set(opp.id, { ...opp, trackingState: "saved" });
    });

    // Add registered (overrides tracking state to registered/attended)
    registeredOpportunities.forEach((opp) => {
      const state = opp.registrationStatus === "attended" ? "attended" : "registered";
      const existing = map.get(opp.id);
      map.set(opp.id, {
        ...(existing || opp),
        ...opp,
        trackingState: state,
      });
    });

    const list = Array.from(map.values());

    return list.map((opp) => {
      const urgency = getDeadlineUrgency(opp.applicationDeadline);
      const relevance = calculateOpportunityRelevance(studentProfile, opp);

      // Determine deterministic Urgency Band
      let urgencyBand: "urgent" | "soon" | "upcoming" | "expired" | "no_deadline" = "no_deadline";
      if (urgency.status === "expired") {
        urgencyBand = "expired";
      } else if (urgency.status === "due_today" || urgency.status === "due_tomorrow" || (urgency.daysLeft !== null && urgency.daysLeft <= 2)) {
        urgencyBand = "urgent";
      } else if (urgency.daysLeft !== null && urgency.daysLeft <= 7) {
        urgencyBand = "soon";
      } else if (opp.applicationDeadline) {
        urgencyBand = "upcoming";
      }

      // Remaining text formatting
      let remainingText = urgency.label;
      if (opp.applicationDeadline) {
        const diffMs = new Date(opp.applicationDeadline).getTime() - Date.now();
        if (diffMs > 0) {
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          if (hours < 24) {
            remainingText = `Closes in ${hours} hour${hours === 1 ? "" : "s"}`;
          } else if (urgency.daysLeft === 1) {
            remainingText = "Closes tomorrow";
          } else if (urgency.daysLeft !== null && urgency.daysLeft <= 7) {
            remainingText = `${urgency.daysLeft} days remaining`;
          } else {
            remainingText = `Closes ${new Date(opp.applicationDeadline).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}`;
          }
        }
      }

      // Deterministic Priority Score (0 - 100):
      // Urgency Weight: 60 pts max (closes in <24h = 60, <48h = 50, <7d = 35, upcoming = 15, expired = 0)
      // Relevance Weight: 40 pts max (relevanceScore / 100 * 40)
      let urgencyPts = 15;
      if (urgencyBand === "expired") urgencyPts = 0;
      else if (urgency.status === "due_today") urgencyPts = 60;
      else if (urgency.status === "due_tomorrow" || urgencyBand === "urgent") urgencyPts = 50;
      else if (urgencyBand === "soon") urgencyPts = 35;

      const relevancePts = Math.round((relevance.totalScore / 100) * 40);
      const priorityScore = Math.min(100, urgencyPts + relevancePts);

      return {
        ...opp,
        urgency,
        relevance,
        urgencyBand,
        priorityScore,
        remainingText,
      };
    });
  }, [savedOpportunities, registeredOpportunities, studentProfile]);

  // Metric counts
  const counts = useMemo(() => {
    let urgent = 0;
    let soon = 0;
    let upcoming = 0;
    let expired = 0;
    let saved = 0;
    let registered = 0;

    processedItems.forEach((item) => {
      if (item.urgencyBand === "urgent") urgent++;
      else if (item.urgencyBand === "soon") soon++;
      else if (item.urgencyBand === "upcoming") upcoming++;
      else if (item.urgencyBand === "expired") expired++;

      if (item.trackingState === "saved") saved++;
      else if (item.trackingState === "registered" || item.trackingState === "attended") registered++;
    });

    return {
      total: processedItems.length,
      urgent,
      soon,
      upcoming,
      expired,
      saved,
      registered,
    };
  }, [processedItems]);

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    return processedItems
      .filter((item) => {
        // Urgency filter
        if (urgencyFilter !== "all" && item.urgencyBand !== urgencyFilter) {
          return false;
        }

        // Tracking filter
        if (trackingFilter === "saved" && item.trackingState !== "saved") return false;
        if (trackingFilter === "registered" && item.trackingState !== "registered" && item.trackingState !== "attended") return false;

        // Category filter
        if (categoryFilter !== "all" && item.type !== categoryFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = item.title.toLowerCase().includes(q);
          const matchesClub = item.club?.name?.toLowerCase().includes(q);
          const matchesSkill = item.requiredSkills?.some((s) => s.toLowerCase().includes(q));
          if (!matchesTitle && !matchesClub && !matchesSkill) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priority") return b.priorityScore - a.priorityScore;
        if (sortBy === "relevance") return b.relevance.totalScore - a.relevance.totalScore;
        if (sortBy === "deadline") {
          const dateA = a.applicationDeadline ? new Date(a.applicationDeadline).getTime() : Infinity;
          const dateB = b.applicationDeadline ? new Date(b.applicationDeadline).getTime() : Infinity;
          return dateA - dateB;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [processedItems, urgencyFilter, trackingFilter, categoryFilter, searchQuery, sortBy]);

  // Grouped by bands for Radar / Chrono view
  const bandGrouped = useMemo(() => {
    return {
      urgent: filteredItems.filter((i) => i.urgencyBand === "urgent"),
      soon: filteredItems.filter((i) => i.urgencyBand === "soon"),
      upcoming: filteredItems.filter((i) => i.urgencyBand === "upcoming" || i.urgencyBand === "no_deadline"),
      expired: filteredItems.filter((i) => i.urgencyBand === "expired"),
    };
  }, [filteredItems]);

  // Calendar date mapping
  const calendarEventMap = useMemo(() => {
    const map = new Map<string, ProcessedRadarItem[]>();
    processedItems.forEach((item) => {
      if (item.applicationDeadline) {
        const d = new Date(item.applicationDeadline);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const list = map.get(key) || [];
        list.push(item);
        map.set(key, list);
      }
      if (item.eventStartDate) {
        const d = new Date(item.eventStartDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const list = map.get(key) || [];
        if (!list.some((existing) => existing.id === item.id)) {
          list.push(item);
          map.set(key, list);
        }
      }
    });
    return map;
  }, [processedItems]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      {/* ── HEADER BANNER: RADAR TELEMETRY ── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-2xl"
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                  Deadline Radar
                </span>
                <span className="text-zinc-700">•</span>
                <span className="text-zinc-400 text-[10px]">Real-time Tracking Intelligence</span>
              </div>

              {counts.urgent > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-rose-500/15 border border-rose-500/30 text-rose-300 animate-pulse font-bold">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>{counts.urgent} Closing Imminently</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Opportunity Deadline Intelligence
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-2xl">
              Chronological radar mapping application cutoffs, hackathon registrations, and campus milestones for opportunities you are actively tracking across SRM.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Opportunities</span>
            </Link>

            <Link
              href="/dashboard/student"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-xs transition-all"
            >
              <span>Student Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>

        {/* ── KPI TELEMETRY STRIP ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-850">
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-rose-400" /> Urgent (&lt;48h)
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-300">{counts.urgent}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-amber-400" /> Closing This Week
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-300">{counts.soon}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Bookmark className="w-3 h-3 text-indigo-400" /> Saved Pipeline
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-indigo-300">{counts.saved}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Registered
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300">{counts.registered}</div>
          </div>
        </div>
      </motion.div>

      {/* ── CONTROLS: VIEW SWITCHER + SEARCH + FILTERS ── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-950 border border-zinc-850 text-xs font-mono">
            <button
              onClick={() => setViewMode("radar")}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                viewMode === "radar"
                  ? "bg-zinc-850 text-white font-bold shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Priority Radar</span>
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                viewMode === "calendar"
                  ? "bg-zinc-850 text-white font-bold shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
              <span>Month Calendar</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                viewMode === "kanban"
                  ? "bg-zinc-850 text-white font-bold shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Tracking Pipeline</span>
            </button>
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 self-end md:self-auto">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "priority" | "deadline" | "relevance" | "newest")}
              aria-label="Sort opportunities by"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="priority">Top Priority (Urgency + Match)</option>
              <option value="deadline">Soonest Deadline First</option>
              <option value="relevance">Highest Profile Match</option>
              <option value="newest">Recently Tracked</option>
            </select>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-850/80 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tracked opportunities by title, club, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          {/* Urgency Band Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value as UrgencyBand)}
              aria-label="Filter by urgency"
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Timelines</option>
              <option value="urgent">Urgent (&lt;48h)</option>
              <option value="soon">Closing This Week</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Past / Expired</option>
            </select>

            {/* Tracking State Filter */}
            <select
              value={trackingFilter}
              onChange={(e) => setTrackingFilter(e.target.value as TrackingFilter)}
              aria-label="Filter by tracking status"
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All States</option>
              <option value="saved">Saved Only</option>
              <option value="registered">Registered Only</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="hackathon">Hackathons</option>
              <option value="workshop">Workshops</option>
              <option value="competition">Competitions</option>
              <option value="internship">Internships</option>
              <option value="research">Research</option>
              <option value="scholarship">Scholarships</option>
              <option value="conference">Conferences</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── EMPTY STATE IF ZERO ITEMS TRACKED ── */}
      {processedItems.length === 0 ? (
        <div className="py-20 px-6 rounded-3xl bg-zinc-950/60 border border-zinc-800 text-center space-y-5 max-w-md mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 font-mono">Nothing on your radar yet</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Bookmark interesting hackathons, workshops, internships, or campus competitions. Their closing deadlines and event schedules will automatically plot on this radar.
            </p>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Campus Opportunities</span>
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty filter result */
        <div className="py-16 px-6 rounded-3xl bg-zinc-950/40 border border-zinc-850 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center mx-auto">
            <Filter className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-200 font-mono">No Matching Tracked Items</h3>
            <p className="text-xs text-zinc-500 font-mono">
              Try adjusting your search query, urgency filter, or category selector.
            </p>
          </div>
          <button
            onClick={() => {
              setUrgencyFilter("all");
              setTrackingFilter("all");
              setCategoryFilter("all");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-mono text-purple-300 font-semibold cursor-pointer transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* ── VIEW MODES ── */
        <div>
          {/* VIEW 1: PRIORITY RADAR & BANDS */}
          {viewMode === "radar" && (
            <div className="space-y-8">
              {/* URGENT BAND (<48h) */}
              {bandGrouped.urgent.length > 0 && (
                <RadarBandSection
                  title="Imminent Attention (Closing < 48 Hours)"
                  badgeText={`${bandGrouped.urgent.length} Critical`}
                  badgeClass="bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                  glowClass="from-rose-950/30 via-zinc-950 to-zinc-950"
                  icon={Flame}
                  items={bandGrouped.urgent}
                />
              )}

              {/* SOON BAND (<7 days) */}
              {bandGrouped.soon.length > 0 && (
                <RadarBandSection
                  title="Approaching Milestones (Closing This Week)"
                  badgeText={`${bandGrouped.soon.length} Soon`}
                  badgeClass="bg-amber-500/20 text-amber-300 border-amber-500/40"
                  glowClass="from-amber-950/20 via-zinc-950 to-zinc-950"
                  icon={Clock}
                  items={bandGrouped.soon}
                />
              )}

              {/* UPCOMING BAND (>7 days) */}
              {bandGrouped.upcoming.length > 0 && (
                <RadarBandSection
                  title="Upcoming Opportunity Horizons"
                  badgeText={`${bandGrouped.upcoming.length} Scheduled`}
                  badgeClass="bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                  glowClass="from-indigo-950/15 via-zinc-950 to-zinc-950"
                  icon={Calendar}
                  items={bandGrouped.upcoming}
                />
              )}

              {/* EXPIRED BAND */}
              {bandGrouped.expired.length > 0 && (
                <RadarBandSection
                  title="Past / Closed Horizons"
                  badgeText={`${bandGrouped.expired.length} Expired`}
                  badgeClass="bg-zinc-800 text-zinc-500 border-zinc-700"
                  glowClass="from-zinc-900/40 to-zinc-950"
                  icon={CheckCircle2}
                  items={bandGrouped.expired}
                  isExpired
                />
              )}
            </div>
          )}

          {/* VIEW 2: MONTH CALENDAR MATRIX */}
          {viewMode === "calendar" && (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 space-y-6 shadow-2xl">
                {/* Month Navigator Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
                      Opportunity Schedule Matrix
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-zinc-200 font-bold">
                      {calendarDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))
                        }
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))
                        }
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                        aria-label="Next month"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Day Columns Header */}
                <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-zinc-500 font-bold uppercase py-1 border-b border-zinc-800/60">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                {/* Month Grid */}
                {(() => {
                  const y = calendarDate.getFullYear();
                  const m = calendarDate.getMonth();
                  const firstDay = new Date(y, m, 1).getDay();
                  const totalDays = new Date(y, m + 1, 0).getDate();

                  return (
                    <div className="grid grid-cols-7 gap-1.5">
                      {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`cal-pad-${i}`} className="h-12 rounded-xl bg-transparent" />
                      ))}

                      {Array.from({ length: totalDays }).map((_, i) => {
                        const day = i + 1;
                        const dateKey = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const dayEvents = calendarEventMap.get(dateKey) || [];

                        const isToday =
                          day === new Date().getDate() &&
                          m === new Date().getMonth() &&
                          y === new Date().getFullYear();

                        const isSelected = selectedCalendarDay === dateKey;

                        return (
                          <button
                            key={dateKey}
                            onClick={() => setSelectedCalendarDay(isSelected ? null : dateKey)}
                            className={`h-12 rounded-xl border p-1.5 flex flex-col justify-between transition-all cursor-pointer relative ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30"
                                : isToday
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40"
                                : dayEvents.length > 0
                                ? "bg-purple-500/10 text-purple-200 border-purple-500/30 hover:border-purple-500/60"
                                : "bg-zinc-900/40 text-zinc-400 border-zinc-800/60 hover:bg-zinc-800/60"
                            }`}
                          >
                            <span className="text-[11px] font-mono font-bold leading-none">{day}</span>

                            {dayEvents.length > 0 && (
                              <div className="flex items-center gap-0.5 justify-end">
                                <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-300 font-bold">
                                  {dayEvents.length}
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Selected Day Event Inspection Panel */}
                <AnimatePresence>
                  {selectedCalendarDay && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 border-t border-zinc-800/80 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-300 font-bold">
                          Events closing on {selectedCalendarDay}:
                        </span>
                        <button
                          onClick={() => setSelectedCalendarDay(null)}
                          className="text-[10px] text-zinc-500 hover:text-zinc-300"
                        >
                          Clear Selection
                        </button>
                      </div>

                      {(calendarEventMap.get(selectedCalendarDay) || []).length === 0 ? (
                        <p className="text-xs text-zinc-500 font-mono italic">No deadlines logged for this date.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(calendarEventMap.get(selectedCalendarDay) || []).map((item) => (
                            <RadarOpportunityCard key={item.id} item={item} />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* VIEW 3: TRACKING KANBAN PIPELINE */}
          {viewMode === "kanban" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Saved Bookmarks */}
              <div className="space-y-4 p-5 rounded-3xl bg-zinc-950/70 border border-zinc-850">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs uppercase font-mono font-bold text-zinc-200">
                      Saved Bookmarks
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {filteredItems.filter((i) => i.trackingState === "saved").length}
                  </span>
                </div>

                <div className="space-y-3">
                  {filteredItems
                    .filter((i) => i.trackingState === "saved")
                    .map((item) => (
                      <RadarOpportunityCard key={item.id} item={item} compact />
                    ))}
                </div>
              </div>

              {/* Column 2: Registered / In Progress */}
              <div className="space-y-4 p-5 rounded-3xl bg-zinc-950/70 border border-zinc-850">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs uppercase font-mono font-bold text-zinc-200">
                      Official Applications
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {filteredItems.filter((i) => i.trackingState === "registered").length}
                  </span>
                </div>

                <div className="space-y-3">
                  {filteredItems
                    .filter((i) => i.trackingState === "registered")
                    .map((item) => (
                      <RadarOpportunityCard key={item.id} item={item} compact />
                    ))}
                </div>
              </div>

              {/* Column 3: Completed / Attended */}
              <div className="space-y-4 p-5 rounded-3xl bg-zinc-950/70 border border-zinc-850">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs uppercase font-mono font-bold text-zinc-200">
                      Attended / Completed
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {filteredItems.filter((i) => i.trackingState === "attended").length}
                  </span>
                </div>

                <div className="space-y-3">
                  {filteredItems
                    .filter((i) => i.trackingState === "attended")
                    .map((item) => (
                      <RadarOpportunityCard key={item.id} item={item} compact />
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ──────────────── BAND SECTION COMPONENT ──────────────── */
function RadarBandSection({
  title,
  badgeText,
  badgeClass,
  glowClass,
  icon: Icon,
  items,
  isExpired = false,
}: {
  title: string;
  badgeText: string;
  badgeClass: string;
  glowClass: string;
  icon: React.ElementType;
  items: ProcessedRadarItem[];
  isExpired?: boolean;
}) {
  return (
    <div className={`p-6 sm:p-7 rounded-3xl bg-gradient-to-b ${glowClass} border border-zinc-800/80 space-y-5 shadow-xl`}>
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm sm:text-base font-bold text-zinc-100 font-mono tracking-tight">
            {title}
          </h2>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-bold ${badgeClass}`}>
          {badgeText}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <RadarOpportunityCard key={item.id} item={item} isExpired={isExpired} />
        ))}
      </div>
    </div>
  );
}

/* ──────────────── RADAR OPPORTUNITY CARD COMPONENT ──────────────── */
function RadarOpportunityCard({
  item,
  isExpired = false,
  compact = false,
}: {
  item: ProcessedRadarItem;
  isExpired?: boolean;
  compact?: boolean;
}) {
  const isUrgent = item.urgencyBand === "urgent";
  const isSoon = item.urgencyBand === "soon";

  return (
    <SpatialCard3D depth={compact ? 4 : 8} elevationZ={compact ? 8 : 12}>
      <div
        className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden h-full ${
          isUrgent && !isExpired
            ? "bg-zinc-950/90 border-rose-500/35 shadow-lg shadow-rose-500/5 hover:border-rose-500/50"
            : isSoon && !isExpired
            ? "bg-zinc-950/90 border-amber-500/30 shadow-md hover:border-amber-500/45"
            : isExpired
            ? "bg-zinc-950/50 border-zinc-850 opacity-60 hover:opacity-80"
            : "bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700"
        }`}
      >
        {/* Top Priority Top Stripe Indicator */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isUrgent && !isExpired
              ? "bg-rose-500"
              : isSoon && !isExpired
              ? "bg-amber-400"
              : isExpired
              ? "bg-zinc-800"
              : "bg-indigo-500/40"
          }`}
        />

        <div className="space-y-3 pt-1">
          {/* Urgency Pill + Match Score */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] font-mono">
            <span
              className={`px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1.5 ${
                isUrgent && !isExpired
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                  : isSoon && !isExpired
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : isExpired
                  ? "bg-zinc-850 text-zinc-500 border-zinc-750"
                  : "bg-zinc-850 text-zinc-300 border-zinc-750"
              }`}
            >
              {isUrgent && !isExpired ? (
                <Flame className="w-3 h-3 text-rose-400" />
              ) : (
                <Clock className="w-3 h-3 text-amber-400" />
              )}
              <span>{item.remainingText}</span>
            </span>

            {/* Profile Match Score Tag */}
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
              {item.relevance.totalScore}% Match
            </span>
          </div>

          {/* Title & Organization */}
          <div className="space-y-1">
            <Link href={`/opportunities/${item.slug}`}>
              <h3 className="text-sm font-bold text-zinc-100 hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
                {item.title}
              </h3>
            </Link>

            <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
              <Building2 className="w-3 h-3 text-zinc-500 shrink-0" />
              <span className="truncate">{item.club?.name || "SRM Organization"}</span>
            </div>
          </div>

          {/* Skill Tag Pills */}
          {!compact && item.requiredSkills && item.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.requiredSkills.slice(0, 3).map((skill) => {
                const isMatched = item.relevance.matchedSkills.includes(skill);
                return (
                  <span
                    key={skill}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-md border ${
                      isMatched
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 font-semibold"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    }`}
                  >
                    {skill}
                  </span>
                );
              })}
              {item.requiredSkills.length > 3 && (
                <span className="text-[9px] font-mono text-zinc-500 self-center">
                  +{item.requiredSkills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Footer: State Tag + Quick CTAs */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-850/80 text-xs font-mono gap-2">
          <div className="flex items-center gap-1.5">
            {item.trackingState === "registered" || item.trackingState === "attended" ? (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Registered
              </span>
            ) : (
              <span className="text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5" /> Bookmarked
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <BookmarkButton opportunityId={item.id} />
            <Link
              href={`/opportunities/${item.slug}`}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </SpatialCard3D>
  );
}
