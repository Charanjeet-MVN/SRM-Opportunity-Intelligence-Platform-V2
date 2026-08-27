"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { TrackerOpportunity } from "./StudentOpportunityTracker";
import { getDeadlineUrgency } from "@/lib/notifications/urgency";
import { updateOpportunityLifecycleStateAction, StudentLifecycleState } from "@/lib/engagement/actions";
import BookmarkButton from "./BookmarkButton";
import OpportunityTypeBadge from "./OpportunityTypeBadge";
import VerificationBadge from "../clubs/VerificationBadge";
import SpatialCard3D from "@/components/3d/SpatialCard3D";
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Flame,
  Search,
  Filter,
  ChevronRight,
  Compass,
  Building2,
  Calendar,
  Award,
  Layers,
  Check,
  AlertCircle,
} from "lucide-react";

export type MyOpportunitiesTab = "all" | "saved" | "tracking" | "applied" | "completed";

interface MyOpportunitiesWorkspaceClientProps {
  initialSaved: TrackerOpportunity[];
  initialRegistered: TrackerOpportunity[];
  initialTab?: MyOpportunitiesTab;
}

interface ProcessedWorkspaceItem extends TrackerOpportunity {
  lifecycleState: "saved" | "tracking" | "applied" | "completed" | "closed";
  lifecycleStepIndex: number; // 0: Discovered, 1: Saved, 2: Tracking, 3: Applied, 4: Completed
  urgency: ReturnType<typeof getDeadlineUrgency>;
  isExpired: boolean;
  statusLabel: string;
}

const LIFECYCLE_STEPS = [
  { id: "discovered", label: "Discovered" },
  { id: "saved", label: "Saved" },
  { id: "tracking", label: "Tracking" },
  { id: "applied", label: "Applied" },
  { id: "completed", label: "Completed" },
];

export default function MyOpportunitiesWorkspaceClient({
  initialSaved = [],
  initialRegistered = [],
  initialTab = "all",
}: MyOpportunitiesWorkspaceClientProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<MyOpportunitiesTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"deadline" | "recent" | "title">("deadline");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Local state for optimistic lifecycle updates
  const [savedList, setSavedList] = useState<TrackerOpportunity[]>(initialSaved);
  const [registeredList, setRegisteredList] = useState<TrackerOpportunity[]>(initialRegistered);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Combine and derive real student lifecycle state for each opportunity
  const processedItems: ProcessedWorkspaceItem[] = useMemo(() => {
    const map = new Map<string, TrackerOpportunity & { isRegistered?: boolean; regStatus?: string }>();

    // 1. Ingest saved items
    savedList.forEach((item) => {
      map.set(item.id, { ...item });
    });

    // 2. Ingest registered items (merging details)
    registeredList.forEach((item) => {
      const existing = map.get(item.id);
      map.set(item.id, {
        ...(existing || item),
        ...item,
        isRegistered: true,
        regStatus: item.registrationStatus || "registered",
      });
    });

    const items = Array.from(map.values());

    return items.map((opp) => {
      const urgency = getDeadlineUrgency(opp.applicationDeadline);
      const isExpired = urgency.isExpired || opp.status === "archived";

      let lifecycleState: "saved" | "tracking" | "applied" | "completed" | "closed" = "saved";
      let lifecycleStepIndex = 1; // Saved

      if (opp.regStatus === "attended") {
        lifecycleState = "completed";
        lifecycleStepIndex = 4;
      } else if (opp.isRegistered || opp.regStatus === "registered") {
        lifecycleState = "applied";
        lifecycleStepIndex = 3;
      } else if (isExpired) {
        lifecycleState = "closed";
        lifecycleStepIndex = 1;
      } else if (opp.applicationDeadline && !urgency.isExpired) {
        // Saved opportunity with active closing horizon
        lifecycleState = "tracking";
        lifecycleStepIndex = 2;
      } else {
        lifecycleState = "saved";
        lifecycleStepIndex = 1;
      }

      let statusLabel = "Saved";
      if (lifecycleState === "completed") statusLabel = "Attended / Completed";
      else if (lifecycleState === "applied") statusLabel = "Applied / Registered";
      else if (lifecycleState === "tracking") statusLabel = "Tracking Deadline";
      else if (lifecycleState === "closed") statusLabel = "Closed / Expired";

      return {
        ...opp,
        lifecycleState,
        lifecycleStepIndex,
        urgency,
        isExpired,
        statusLabel,
      };
    });
  }, [savedList, registeredList]);

  // Statistics calculation across all student interactions
  const stats = useMemo(() => {
    const total = processedItems.length;
    let savedCount = 0;
    let trackingCount = 0;
    let appliedCount = 0;
    let completedCount = 0;
    let closingSoonCount = 0;

    processedItems.forEach((item) => {
      if (item.lifecycleState === "saved") savedCount++;
      if (item.lifecycleState === "tracking") trackingCount++;
      if (item.lifecycleState === "applied") appliedCount++;
      if (item.lifecycleState === "completed") completedCount++;
      if (item.urgency.isClosingSoon && !item.isExpired) closingSoonCount++;
    });

    return {
      total,
      saved: savedCount,
      tracking: trackingCount,
      applied: appliedCount,
      completed: completedCount,
      closingSoon: closingSoonCount,
    };
  }, [processedItems]);

  // Filtered and sorted workspace items
  const filteredItems = useMemo(() => {
    return processedItems
      .filter((item) => {
        // Tab filtering
        if (activeTab === "saved") {
          if (item.lifecycleState !== "saved" && item.lifecycleState !== "tracking") return false;
        } else if (activeTab === "tracking") {
          if (item.lifecycleState !== "tracking") return false;
        } else if (activeTab === "applied") {
          if (item.lifecycleState !== "applied") return false;
        } else if (activeTab === "completed") {
          if (item.lifecycleState !== "completed") return false;
        }

        // Category filter
        if (categoryFilter !== "all" && item.type !== categoryFilter) return false;

        // Search Query
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
        if (sortBy === "deadline") {
          const timeA = a.applicationDeadline ? new Date(a.applicationDeadline).getTime() : Infinity;
          const timeB = b.applicationDeadline ? new Date(b.applicationDeadline).getTime() : Infinity;
          return timeA - timeB;
        }
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [processedItems, activeTab, categoryFilter, searchQuery, sortBy]);

  // Lifecycle state transition handler
  const handleLifecycleTransition = async (item: ProcessedWorkspaceItem, targetState: StudentLifecycleState) => {
    setUpdatingId(item.id);
    try {
      const res = await updateOpportunityLifecycleStateAction(item.id, targetState);
      if (res.success) {
        if (targetState === "unsaved") {
          setSavedList((prev) => prev.filter((p) => p.id !== item.id));
          showToast(`Removed "${item.title}" from saved opportunities`);
        } else if (targetState === "registered") {
          setRegisteredList((prev) => {
            const exists = prev.some((p) => p.id === item.id);
            if (exists) {
              return prev.map((p) => (p.id === item.id ? { ...p, registrationStatus: "registered" } : p));
            }
            return [{ ...item, registrationStatus: "registered", registeredAt: new Date().toISOString() }, ...prev];
          });
          showToast(`Marked "${item.title}" as Applied / Registered`);
        } else if (targetState === "attended") {
          setRegisteredList((prev) => {
            const exists = prev.some((p) => p.id === item.id);
            if (exists) {
              return prev.map((p) => (p.id === item.id ? { ...p, registrationStatus: "attended" } : p));
            }
            return [{ ...item, registrationStatus: "attended", registeredAt: new Date().toISOString() }, ...prev];
          });
          showToast(`Marked "${item.title}" as Attended / Completed!`);
        }
      } else {
        showToast(res.error || "Failed to update state", "error");
      }
    } catch {
      showToast("Network error updating opportunity state", "error");
    } finally {
      setUpdatingId(null);
    }
  };

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
      transition: { duration: shouldReduceMotion ? 0.01 : 0.3, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Toast Alert */}
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

      {/* ── HEADER BANNER: MY OPPORTUNITIES 2.0 ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-2xl"
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-purple-400 font-bold uppercase tracking-wider text-[10px]">
                  My Opportunities 2.0
                </span>
                <span className="text-zinc-700">•</span>
                <span className="text-zinc-400 text-[10px]">Student Follow-Through Workspace</span>
              </div>

              {stats.closingSoon > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{stats.closingSoon} Closing Soon</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Opportunity Follow-Through
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-2xl">
              Track your saved bookmarks, active deadline horizons, submitted applications, and completed campus milestones across SRM.
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
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-xs transition-all"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Deadline Radar</span>
            </Link>
          </div>
        </div>

        {/* ── KPI TELEMETRY STRIP ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-zinc-850">
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-zinc-400" /> Total Pipeline
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-zinc-100">{stats.total}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Bookmark className="w-3 h-3 text-purple-400" /> Saved
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-purple-300">{stats.saved}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-amber-400" /> Tracking
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-300">{stats.tracking}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Applied
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-indigo-300">{stats.applied}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Award className="w-3 h-3 text-emerald-400" /> Completed
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300">{stats.completed}</div>
          </div>
        </div>
      </motion.div>

      {/* ── WORKSPACE TABS & CONTROLS ── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Real Supported State Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-950 border border-zinc-850 text-xs font-mono overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-zinc-850 text-white font-bold shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>ALL</span>
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-normal">
                {stats.total}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                activeTab === "saved"
                  ? "bg-zinc-850 text-purple-300 font-bold shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-400" />
              <span>SAVED</span>
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-normal">
                {stats.saved + stats.tracking}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("tracking")}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                activeTab === "tracking"
                  ? "bg-zinc-850 text-amber-300 font-bold shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>TRACKING</span>
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-normal">
                {stats.tracking}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("applied")}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                activeTab === "applied"
                  ? "bg-zinc-850 text-indigo-300 font-bold shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>APPLIED</span>
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-normal">
                {stats.applied}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                activeTab === "completed"
                  ? "bg-zinc-850 text-emerald-300 font-bold shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>COMPLETED</span>
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-normal">
                {stats.completed}
              </span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 self-end md:self-auto">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "deadline" | "recent" | "title")}
              aria-label="Sort workspace opportunities"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="deadline">Soonest Deadline</option>
              <option value="recent">Recently Added</option>
              <option value="title">Alphabetical Title</option>
            </select>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-850/80 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your tracked opportunities by title, club, or required skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

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

      {/* ── WORKSPACE CONTENT ── */}
      {processedItems.length === 0 ? (
        /* Empty Workspace Overall */
        <div className="py-20 px-6 rounded-3xl bg-zinc-950/60 border border-zinc-800 text-center space-y-5 max-w-md mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center mx-auto shadow-inner">
            <Bookmark className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 font-mono">No saved opportunities yet</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Start discovering verified hackathons, workshops, internships, and research roles across SRM to track them through your personal lifecycle.
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
        /* Empty Filter Tab State */
        <div className="py-16 px-6 rounded-3xl bg-zinc-950/40 border border-zinc-850 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center mx-auto">
            <Filter className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-200 font-mono">
              No opportunities in &ldquo;{activeTab.toUpperCase()}&rdquo;
            </h3>
            <p className="text-xs text-zinc-500 font-mono">
              {activeTab === "applied"
                ? "You have not marked any opportunities as applied yet."
                : activeTab === "completed"
                ? "You have not completed any campus milestones yet."
                : "No items match your active search or category filters."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setActiveTab("all");
                setCategoryFilter("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-mono text-purple-300 font-semibold cursor-pointer transition-all"
            >
              Reset Filters
            </button>
            <Link
              href="/opportunities"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-medium transition-all"
            >
              Discover More
            </Link>
          </div>
        </div>
      ) : (
        /* Opportunity Card Grid with Lifecycle Stepper */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          {filteredItems.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <SpatialCard3D depth={6} elevationZ={10}>
                <div
                  className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden h-full ${
                    item.lifecycleState === "closed"
                      ? "bg-zinc-950/50 border-zinc-850 opacity-70 hover:opacity-90"
                      : item.urgency.isCritical
                      ? "bg-zinc-950/90 border-rose-500/30 shadow-lg shadow-rose-500/5 hover:border-rose-500/50"
                      : item.urgency.isClosingSoon
                      ? "bg-zinc-950/90 border-amber-500/30 hover:border-amber-500/45"
                      : "bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  {/* Top Status Stripe */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 ${
                      item.lifecycleState === "closed"
                        ? "bg-zinc-800"
                        : item.lifecycleState === "completed"
                        ? "bg-emerald-500"
                        : item.lifecycleState === "applied"
                        ? "bg-indigo-500"
                        : item.urgency.isCritical
                        ? "bg-rose-500"
                        : item.urgency.isClosingSoon
                        ? "bg-amber-400"
                        : "bg-purple-500/50"
                    }`}
                  />

                  <div className="space-y-4 pt-1">
                    {/* Top Row: Type & Verification + Urgency Pill */}
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <OpportunityTypeBadge type={item.type} />
                        {item.club?.verificationStatus === "verified" && (
                          <VerificationBadge status="verified" />
                        )}
                      </div>

                      {/* Urgency / Status Pill */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1.5 ${
                          item.lifecycleState === "closed"
                            ? "bg-zinc-900 text-zinc-500 border-zinc-800"
                            : item.lifecycleState === "completed"
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : item.lifecycleState === "applied"
                            ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                            : item.urgency.isCritical
                            ? "bg-rose-500/15 text-rose-300 border-rose-500/35 animate-pulse"
                            : item.urgency.isClosingSoon
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            : "bg-zinc-900 text-zinc-300 border-zinc-800"
                        }`}
                      >
                        {item.lifecycleState === "completed" ? (
                          <Award className="w-3 h-3 text-emerald-400" />
                        ) : item.lifecycleState === "applied" ? (
                          <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                        ) : item.urgency.isCritical ? (
                          <Flame className="w-3 h-3 text-rose-400" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{item.urgency.countdownText}</span>
                      </span>
                    </div>

                    {/* Title & Organization */}
                    <div className="space-y-1.5">
                      <Link href={`/opportunities/${item.slug}`}>
                        <h3 className="text-base font-bold text-zinc-100 hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">{item.club?.name || "SRM Organization"}</span>
                      </div>
                    </div>

                    {/* Deadline Details */}
                    {item.applicationDeadline && (
                      <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-850 flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Deadline:
                        </span>
                        <span
                          className={`font-bold ${
                            item.isExpired ? "text-zinc-500 line-through" : "text-zinc-200"
                          }`}
                        >
                          {item.urgency.formattedDeadline}
                        </span>
                      </div>
                    )}

                    {/* ── OPPORTUNITY LIFECYCLE STEPPER ── */}
                    <div className="space-y-2 pt-2 border-t border-zinc-850/80">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        <span>Lifecycle Progress</span>
                        <span className="text-zinc-400 font-bold">{item.statusLabel}</span>
                      </div>

                      <div className="grid grid-cols-5 gap-1 pt-1">
                        {LIFECYCLE_STEPS.map((step, idx) => {
                          const isPassed = idx < item.lifecycleStepIndex;
                          const isCurrent = idx === item.lifecycleStepIndex;
                          return (
                            <div key={step.id} className="space-y-1.5 text-center">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  isCurrent
                                    ? item.lifecycleState === "completed"
                                      ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                                      : item.lifecycleState === "applied"
                                      ? "bg-indigo-400 shadow-sm shadow-indigo-400/50"
                                      : "bg-purple-400 shadow-sm shadow-purple-400/50"
                                    : isPassed
                                    ? "bg-purple-600/60"
                                    : "bg-zinc-850"
                                }`}
                              />
                              <span
                                className={`text-[9px] font-mono block truncate ${
                                  isCurrent
                                    ? "text-zinc-100 font-bold"
                                    : isPassed
                                    ? "text-zinc-400"
                                    : "text-zinc-600"
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ── CARD ACTION FOOTER ── */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-850/80 text-xs font-mono gap-2 flex-wrap">
                    {/* Left Actions: Lifecycle Step Progressions */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.lifecycleState === "saved" || item.lifecycleState === "tracking" ? (
                        <button
                          disabled={updatingId === item.id || item.isExpired}
                          onClick={() => handleLifecycleTransition(item, "registered")}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Mark Applied</span>
                        </button>
                      ) : item.lifecycleState === "applied" ? (
                        <button
                          disabled={updatingId === item.id}
                          onClick={() => handleLifecycleTransition(item, "attended")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Award className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Mark Completed</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </div>

                    {/* Right CTAs */}
                    <div className="flex items-center gap-2">
                      <BookmarkButton opportunityId={item.id} />

                      <Link
                        href={`/opportunities/${item.slug}`}
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </SpatialCard3D>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
