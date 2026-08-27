"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { StudentProfile } from "@/types";
import { TrackerOpportunity } from "@/components/opportunities/StudentOpportunityTracker";
import { calculateOpportunityRelevance, RelevanceScoreResult } from "@/lib/relevance/scoring";
import { getDeadlineUrgency, UrgencyLevel, DeadlineUrgencyResult } from "@/lib/notifications/urgency";
import { updateOpportunityLifecycleStateAction, StudentLifecycleState } from "@/lib/engagement/actions";
import BookmarkButton from "@/components/opportunities/BookmarkButton";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import SpatialCard3D from "@/components/3d/SpatialCard3D";
import {
  Clock,
  Calendar,
  CheckCircle2,
  Flame,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Compass,
  Bookmark,
  CalendarDays,
  Check,
  Building2,
  Zap,
  Award,
  AlertCircle,
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

type ViewMode = "radar" | "calendar";
type UrgencyBandFilter = "all" | "critical" | "urgent" | "upcoming" | "later" | "closed";
type TrackingFilter = "all" | "saved" | "applied" | "completed";

export interface ProcessedRadarItem extends TrackerOpportunity {
  urgency: DeadlineUrgencyResult;
  relevance: RelevanceScoreResult;
  urgencyLevel: UrgencyLevel;
  trackingState: "saved" | "tracking" | "applied" | "completed" | "closed";
  statusText: string;
  priorityScore: number;
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
  const shouldReduceMotion = useReducedMotion();
  const [viewMode, setViewMode] = useState<ViewMode>("radar");
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyBandFilter>("all");
  const [trackingFilter, setTrackingFilter] = useState<TrackingFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"priority" | "deadline" | "relevance" | "newest">("priority");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Month Calendar specific state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Combine and deduplicate tracked opportunities with real Supabase urgency & tracking status
  const processedItems: ProcessedRadarItem[] = useMemo(() => {
    const map = new Map<string, TrackerOpportunity & { isRegistered?: boolean; regStatus?: string }>();

    // 1. Ingest saved
    savedOpportunities.forEach((opp) => {
      map.set(opp.id, { ...opp });
    });

    // 2. Ingest registered
    registeredOpportunities.forEach((opp) => {
      const existing = map.get(opp.id);
      map.set(opp.id, {
        ...(existing || opp),
        ...opp,
        isRegistered: true,
        regStatus: opp.registrationStatus || "registered",
      });
    });

    const list = Array.from(map.values());

    return list.map((opp) => {
      const urgency = getDeadlineUrgency(opp.applicationDeadline);
      const relevance = calculateOpportunityRelevance(studentProfile, opp);

      // Determine real tracking state
      let trackingState: "saved" | "tracking" | "applied" | "completed" | "closed" = "saved";
      if (opp.regStatus === "attended") {
        trackingState = "completed";
      } else if (opp.isRegistered || opp.regStatus === "registered") {
        trackingState = "applied";
      } else if (urgency.isExpired) {
        trackingState = "closed";
      } else if (opp.applicationDeadline) {
        trackingState = "tracking";
      } else {
        trackingState = "saved";
      }

      let statusText = "Saved";
      if (trackingState === "completed") statusText = "Completed";
      else if (trackingState === "applied") statusText = "Applied";
      else if (trackingState === "tracking") statusText = "Tracking";
      else if (trackingState === "closed") statusText = "Closed";

      // Deterministic Priority Score (0 - 100):
      // Urgency Weight: 60 pts max (Critical = 60, Urgent = 50, Upcoming = 35, Later = 15, Expired = 0)
      // Relevance Weight: 40 pts max (relevanceScore / 100 * 40)
      let urgencyPts = 15;
      if (urgency.urgencyLevel === "expired") urgencyPts = 0;
      else if (urgency.urgencyLevel === "critical") urgencyPts = 60;
      else if (urgency.urgencyLevel === "urgent") urgencyPts = 50;
      else if (urgency.urgencyLevel === "upcoming") urgencyPts = 35;

      const relevancePts = Math.round((relevance.totalScore / 100) * 40);
      const priorityScore = Math.min(100, urgencyPts + relevancePts);

      return {
        ...opp,
        urgency,
        relevance,
        urgencyLevel: urgency.urgencyLevel,
        trackingState,
        statusText,
        priorityScore,
      };
    });
  }, [savedOpportunities, registeredOpportunities, studentProfile]);

  // Telemetry counts
  const counts = useMemo(() => {
    let critical = 0;
    let urgent = 0;
    let upcoming = 0;
    let later = 0;
    let closed = 0;
    let saved = 0;
    let applied = 0;
    let completed = 0;

    processedItems.forEach((item) => {
      if (item.urgencyLevel === "critical") critical++;
      else if (item.urgencyLevel === "urgent") urgent++;
      else if (item.urgencyLevel === "upcoming") upcoming++;
      else if (item.urgencyLevel === "later") later++;
      else if (item.urgencyLevel === "expired") closed++;

      if (item.trackingState === "saved" || item.trackingState === "tracking") saved++;
      else if (item.trackingState === "applied") applied++;
      else if (item.trackingState === "completed") completed++;
    });

    return {
      total: processedItems.length,
      critical,
      urgent,
      upcoming,
      later,
      closed,
      saved,
      applied,
      completed,
    };
  }, [processedItems]);

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    return processedItems
      .filter((item) => {
        // Urgency filter
        if (urgencyFilter === "critical" && item.urgencyLevel !== "critical") return false;
        if (urgencyFilter === "urgent" && item.urgencyLevel !== "urgent") return false;
        if (urgencyFilter === "upcoming" && item.urgencyLevel !== "upcoming") return false;
        if (urgencyFilter === "later" && item.urgencyLevel !== "later") return false;
        if (urgencyFilter === "closed" && item.urgencyLevel !== "expired") return false;

        // Tracking filter
        if (trackingFilter === "saved" && item.trackingState !== "saved" && item.trackingState !== "tracking") return false;
        if (trackingFilter === "applied" && item.trackingState !== "applied") return false;
        if (trackingFilter === "completed" && item.trackingState !== "completed") return false;

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

  // Grouped by standardized urgency bands
  const bandGrouped = useMemo(() => {
    return {
      critical: filteredItems.filter((i) => i.urgencyLevel === "critical"),
      urgent: filteredItems.filter((i) => i.urgencyLevel === "urgent"),
      upcoming: filteredItems.filter((i) => i.urgencyLevel === "upcoming"),
      later: filteredItems.filter((i) => i.urgencyLevel === "later" || i.urgencyLevel === "no_deadline"),
      closed: filteredItems.filter((i) => i.urgencyLevel === "expired"),
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

  const handleAction = async (item: ProcessedRadarItem, targetState: StudentLifecycleState) => {
    setUpdatingId(item.id);
    try {
      const res = await updateOpportunityLifecycleStateAction(item.id, targetState);
      if (res.success) {
        showToast(`Updated status for "${item.title}"`);
      } else {
        showToast(res.error || "Failed to update status", "error");
      }
    } catch {
      showToast("Network error updating status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.01 : 0.35, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 font-mono text-xs ${
              toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
                : "bg-rose-950/90 border-rose-500/40 text-rose-200"
            } backdrop-blur-xl`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER BANNER: DEADLINE RADAR ── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-2xl"
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                  Deadline Radar
                </span>
                <span className="text-zinc-700">•</span>
                <span className="text-zinc-400 text-[10px]">Urgency Intelligence</span>
              </div>

              {(counts.critical > 0 || counts.urgent > 0) && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>{counts.critical + counts.urgent} Action Required Imminently</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              What do I need to act on soon?
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-2xl">
              Deterministic radar ranking upcoming closing deadlines, application cutoffs, and scheduled milestones across your tracked opportunities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setViewMode(viewMode === "radar" ? "calendar" : "radar")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-xs transition-all cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
              <span>{viewMode === "radar" ? "Open Calendar" : "Open Radar"}</span>
            </button>

            <Link
              href="/dashboard/student/saved"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>My Opportunities</span>
            </Link>
          </div>
        </div>

        {/* ── KPI TELEMETRY STRIP ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-zinc-850">
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-rose-400" /> Critical (Today)
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-300">{counts.critical}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-amber-400" /> Urgent (Tomorrow)
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-300">{counts.urgent}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-sky-400" /> Upcoming (3–7d)
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-sky-300">{counts.upcoming}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3 text-indigo-400" /> Later (&gt;7d)
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-indigo-300">{counts.later}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-zinc-400" /> Closed / Past
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-zinc-400">{counts.closed}</div>
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
              <option value="priority">Priority (Urgency + Match)</option>
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
              onChange={(e) => setUrgencyFilter(e.target.value as UrgencyBandFilter)}
              aria-label="Filter by urgency"
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Urgency Bands</option>
              <option value="critical">Critical (Today)</option>
              <option value="urgent">Urgent (Tomorrow)</option>
              <option value="upcoming">Upcoming (3–7d)</option>
              <option value="later">Later (&gt;7d)</option>
              <option value="closed">Closed / Expired</option>
            </select>

            {/* Tracking State Filter */}
            <select
              value={trackingFilter}
              onChange={(e) => setTrackingFilter(e.target.value as TrackingFilter)}
              aria-label="Filter by tracking status"
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="saved">Saved / Tracking</option>
              <option value="applied">Applied</option>
              <option value="completed">Completed</option>
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
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 font-mono">No upcoming deadlines</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              You&apos;re all caught up! Bookmark interesting hackathons, workshops, internships, or campus competitions to track their cutoffs here.
            </p>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Opportunities</span>
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty filter result */
        <div className="py-16 px-6 rounded-3xl bg-zinc-950/40 border border-zinc-850 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center mx-auto">
            <Filter className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-200 font-mono">No Matching Deadlines</h3>
            <p className="text-xs text-zinc-500 font-mono">
              Try adjusting your search query, urgency band, or category selector.
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
          {/* VIEW 1: PRIORITY RADAR BY URGENCY BANDS */}
          {viewMode === "radar" && (
            <div className="space-y-8">
              {/* CRITICAL BAND (TODAY / <24H) */}
              {bandGrouped.critical.length > 0 && (
                <RadarBandSection
                  title="CRITICAL — Deadline Today"
                  badgeText={`${bandGrouped.critical.length} Critical`}
                  badgeClass="bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                  glowClass="from-rose-950/30 via-zinc-950 to-zinc-950"
                  icon={Flame}
                  items={bandGrouped.critical}
                  onAction={handleAction}
                  updatingId={updatingId}
                />
              )}

              {/* URGENT BAND (TOMORROW / <48H) */}
              {bandGrouped.urgent.length > 0 && (
                <RadarBandSection
                  title="URGENT — Deadline Tomorrow"
                  badgeText={`${bandGrouped.urgent.length} Urgent`}
                  badgeClass="bg-amber-500/20 text-amber-300 border-amber-500/40"
                  glowClass="from-amber-950/20 via-zinc-950 to-zinc-950"
                  icon={Clock}
                  items={bandGrouped.urgent}
                  onAction={handleAction}
                  updatingId={updatingId}
                />
              )}

              {/* UPCOMING BAND (3–7 DAYS) */}
              {bandGrouped.upcoming.length > 0 && (
                <RadarBandSection
                  title="UPCOMING — Deadline Next Several Days"
                  badgeText={`${bandGrouped.upcoming.length} Upcoming`}
                  badgeClass="bg-sky-500/20 text-sky-300 border-sky-500/30"
                  glowClass="from-sky-950/15 via-zinc-950 to-zinc-950"
                  icon={Calendar}
                  items={bandGrouped.upcoming}
                  onAction={handleAction}
                  updatingId={updatingId}
                />
              )}

              {/* LATER BAND (>7 DAYS) */}
              {bandGrouped.later.length > 0 && (
                <RadarBandSection
                  title="LATER — Future Deadlines"
                  badgeText={`${bandGrouped.later.length} Scheduled`}
                  badgeClass="bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                  glowClass="from-indigo-950/15 via-zinc-950 to-zinc-950"
                  icon={CalendarDays}
                  items={bandGrouped.later}
                  onAction={handleAction}
                  updatingId={updatingId}
                />
              )}

              {/* CLOSED BAND */}
              {bandGrouped.closed.length > 0 && (
                <RadarBandSection
                  title="CLOSED — Deadline Passed"
                  badgeText={`${bandGrouped.closed.length} Closed`}
                  badgeClass="bg-zinc-800 text-zinc-500 border-zinc-700"
                  glowClass="from-zinc-900/40 to-zinc-950"
                  icon={CheckCircle2}
                  items={bandGrouped.closed}
                  onAction={handleAction}
                  updatingId={updatingId}
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
                            <DeadlineCard key={item.id} item={item} onAction={handleAction} updatingId={updatingId} />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ──────────────── RADAR BAND SECTION COMPONENT ──────────────── */
function RadarBandSection({
  title,
  badgeText,
  badgeClass,
  glowClass,
  icon: Icon,
  items,
  onAction,
  updatingId,
  isExpired = false,
}: {
  title: string;
  badgeText: string;
  badgeClass: string;
  glowClass: string;
  icon: React.ElementType;
  items: ProcessedRadarItem[];
  onAction: (item: ProcessedRadarItem, targetState: StudentLifecycleState) => void;
  updatingId: string | null;
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
          <DeadlineCard
            key={item.id}
            item={item}
            isExpired={isExpired}
            onAction={onAction}
            updatingId={updatingId}
          />
        ))}
      </div>
    </div>
  );
}

/* ──────────────── STANDARDIZED DEADLINE CARD COMPONENT ──────────────── */
function DeadlineCard({
  item,
  isExpired = false,
  onAction,
  updatingId,
}: {
  item: ProcessedRadarItem;
  isExpired?: boolean;
  onAction: (item: ProcessedRadarItem, targetState: StudentLifecycleState) => void;
  updatingId: string | null;
}) {
  const isCritical = item.urgency.isCritical;
  const isUrgent = item.urgencyLevel === "urgent";

  return (
    <SpatialCard3D depth={8} elevationZ={12}>
      <div
        className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden h-full ${
          isCritical && !isExpired
            ? "bg-zinc-950/90 border-rose-500/35 shadow-lg shadow-rose-500/5 hover:border-rose-500/50"
            : isUrgent && !isExpired
            ? "bg-zinc-950/90 border-amber-500/30 shadow-md hover:border-amber-500/45"
            : isExpired
            ? "bg-zinc-950/50 border-zinc-850 opacity-60 hover:opacity-80"
            : "bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700"
        }`}
      >
        {/* Urgency Top Accent Stripe */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isCritical && !isExpired
              ? "bg-rose-500"
              : isUrgent && !isExpired
              ? "bg-amber-400"
              : isExpired
              ? "bg-zinc-800"
              : "bg-indigo-500/40"
          }`}
        />

        <div className="space-y-3 pt-1">
          {/* Top Pill Row: Urgency Countdown + Match Score */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] font-mono">
            <span
              className={`px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1.5 ${
                isCritical && !isExpired
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                  : isUrgent && !isExpired
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : isExpired
                  ? "bg-zinc-850 text-zinc-500 border-zinc-750"
                  : "bg-zinc-850 text-zinc-300 border-zinc-750"
              }`}
            >
              {isCritical && !isExpired ? (
                <Flame className="w-3 h-3 text-rose-400" />
              ) : (
                <Clock className="w-3 h-3 text-amber-400" />
              )}
              <span>{item.urgency.countdownText}</span>
            </span>

            {/* Profile Match Score Tag */}
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
              {item.relevance.totalScore}% Match
            </span>
          </div>

          {/* Title & Organizer */}
          <div className="space-y-1">
            <Link href={`/opportunities/${item.slug}`}>
              <h3 className="text-sm font-bold text-zinc-100 hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
                {item.title}
              </h3>
            </Link>

            <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
              <Building2 className="w-3 h-3 text-zinc-500 shrink-0" />
              <span className="truncate">{item.club?.name || "SRM Organization"}</span>
              {item.club?.verificationStatus === "verified" && (
                <VerificationBadge status="verified" />
              )}
            </div>
          </div>

          {/* Deadline Date Display */}
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850/80 flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-500 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-400" /> Deadline:
            </span>
            <span className={`font-bold ${isExpired ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
              {item.urgency.formattedDeadline}
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <span className="text-[10px] text-zinc-500">Status:</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                item.trackingState === "completed"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : item.trackingState === "applied"
                  ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
                  : item.trackingState === "closed"
                  ? "bg-zinc-900 text-zinc-500 border-zinc-800"
                  : "bg-purple-500/10 text-purple-300 border-purple-500/25"
              }`}
            >
              {item.statusText}
            </span>
          </div>
        </div>

        {/* Card Footer: Primary Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-850/80 text-xs font-mono gap-2">
          {/* Quick Action Button */}
          <div>
            {item.trackingState === "saved" || item.trackingState === "tracking" ? (
              <button
                disabled={updatingId === item.id || isExpired}
                onClick={() => onAction(item, "registered")}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold text-[10px] flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                <span>Apply</span>
              </button>
            ) : item.trackingState === "applied" ? (
              <button
                disabled={updatingId === item.id}
                onClick={() => onAction(item, "attended")}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-[10px] flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
              >
                <Award className="w-3 h-3 text-emerald-400" />
                <span>Mark Completed</span>
              </button>
            ) : item.trackingState === "completed" ? (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Done
              </span>
            ) : (
              <span className="text-[10px] text-zinc-500">Passed</span>
            )}
          </div>

          {/* Primary CTAs */}
          <div className="flex items-center gap-1.5">
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
