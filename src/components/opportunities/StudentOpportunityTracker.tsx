"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Opportunity } from "@/types";
import OpportunityTypeBadge from "./OpportunityTypeBadge";
import VerificationBadge from "../clubs/VerificationBadge";
import BookmarkButton from "./BookmarkButton";
import { updateOpportunityTrackerColumnAction } from "@/lib/engagement/actions";
import {
  Bookmark,
  UserCheck,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Plus,
  Briefcase,
  Trophy,
  Loader2,
  Flame,
  Award,
} from "lucide-react";

export interface TrackerOpportunity extends Opportunity {
  savedAt?: string;
  registeredAt?: string;
  registrationStatus?: string;
  notes?: string;
  column?: string;
}

interface StudentOpportunityTrackerProps {
  initialSaved: TrackerOpportunity[];
  initialRegistered: TrackerOpportunity[];
  initialTab?: "saved" | "registered" | "upcoming"; // Unused in kanban, but kept for type compatibility
}

const COLUMNS = [
  { id: "Interested", label: "Interested", color: "border-zinc-800 text-zinc-400 bg-zinc-900/20 dot-zinc-400" },
  { id: "Saved", label: "Saved", color: "border-violet-500/20 text-violet-400 bg-violet-500/5 dot-violet-400" },
  { id: "Applied", label: "Applied", color: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5 dot-indigo-400" },
  { id: "Assessment", label: "Assessment", color: "border-amber-500/20 text-amber-400 bg-amber-500/5 dot-amber-400" },
  { id: "Interview", label: "Interview", color: "border-orange-500/20 text-orange-400 bg-orange-500/5 dot-orange-400" },
  { id: "Selected", label: "Selected", color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 dot-emerald-400" },
  { id: "Rejected", label: "Rejected", color: "border-rose-500/20 text-rose-400 bg-rose-500/5 dot-rose-400" },
];

function getDeadlineStatus(deadlineStr?: string) {
  if (!deadlineStr) {
    return { label: "No Deadline", colorClass: "text-zinc-500 bg-zinc-950 border-zinc-900", isExpired: false, isClosingSoon: false };
  }

  const now = new Date();
  const deadline = new Date(deadlineStr);
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return { label: "Passed", colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/30", isExpired: true, isClosingSoon: false };
  }

  const isToday =
    deadline.getDate() === now.getDate() &&
    deadline.getMonth() === now.getMonth() &&
    deadline.getFullYear() === now.getFullYear();

  if (isToday) {
    return { label: "Due Today", colorClass: "text-amber-300 bg-amber-500/10 border-amber-500/30 animate-pulse", isExpired: false, isClosingSoon: true };
  }

  if (diffDays <= 3) {
    return { label: `${diffDays}d left`, colorClass: "text-orange-400 bg-orange-500/10 border-orange-500/30 font-semibold", isExpired: false, isClosingSoon: true };
  }

  return {
    label: deadline.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    colorClass: "text-zinc-400 bg-zinc-950 border-zinc-800",
    isExpired: false,
    isClosingSoon: false,
  };
}

export default function StudentOpportunityTracker({
  initialSaved = [],
  initialRegistered = [],
}: StudentOpportunityTrackerProps) {
  const [cards, setCards] = useState<TrackerOpportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Parse and set cards state from DB initial props + merge localStorage mapping cache
  useEffect(() => {
    const allItems = [...initialSaved, ...initialRegistered];
    const uniqueMap = new Map<string, TrackerOpportunity>();

    // De-duplicate
    allItems.forEach((item) => {
      uniqueMap.set(item.id, item);
    });

    const parsedCards = Array.from(uniqueMap.values()).map((card) => {
      let col = "Saved";
      if (card.notes && COLUMNS.some((colDef) => colDef.id === card.notes)) {
        col = card.notes;
      } else if (initialRegistered.some((r) => r.id === card.id)) {
        col = card.registrationStatus === "attended" ? "Selected" : "Applied";
      } else {
        col = "Saved";
      }
      return {
        ...card,
        column: col,
      };
    });

    // Check localStorage cache
    try {
      const localMapping = localStorage.getItem("soip_kanban_columns");
      if (localMapping) {
        const mapping = JSON.parse(localMapping);
        parsedCards.forEach((c) => {
          if (mapping[c.id]) {
            c.column = mapping[c.id];
          }
        });
      }
    } catch (e) {
      console.error("Failed to load local storage columns cache", e);
    }

    setCards(parsedCards);
  }, [initialSaved, initialRegistered]);

  // Helper to show visual toast feedback
  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Drag and Drop event handlers
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData("text/plain", cardId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, colName: string) => {
    e.preventDefault();
    setDragOverColumn(colName);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, colName: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const cardId = e.dataTransfer.getData("text/plain");
    if (!cardId) return;

    const targetCard = cards.find((c) => c.id === cardId);
    if (!targetCard || targetCard.column === colName) return;

    // Optimistic state updates
    const oldCards = [...cards];
    const newCards = cards.map((c) => (c.id === cardId ? { ...c, column: colName } : c));
    setCards(newCards);

    // Save mappings in local storage for instant page loads
    try {
      const localMapping = localStorage.getItem("soip_kanban_columns") || "{}";
      const mapping = JSON.parse(localMapping);
      mapping[cardId] = colName;
      localStorage.setItem("soip_kanban_columns", JSON.stringify(mapping));
    } catch (err) {
      console.error(err);
    }

    // Call Supabase update action
    const res = await updateOpportunityTrackerColumnAction(cardId, colName);
    if (!res.success) {
      // Revert UI on failure
      setCards(oldCards);
      triggerToast(res.error || "Failed to update tracker column in database", "error");
    } else {
      triggerToast(`Moved opportunity to ${colName}`);
    }
  };

  // Filtered Cards matching query & type selector
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesSearch =
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (card.club?.name && card.club.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        card.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === "all" || card.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [cards, searchQuery, typeFilter]);

  // Statistics calculation (based on ALL cards in tracker)
  const stats = useMemo(() => {
    const total = cards.length;
    const selected = cards.filter((c) => c.column === "Selected").length;
    const rejected = cards.filter((c) => c.column === "Rejected").length;
    const interview = cards.filter((c) => c.column === "Interview").length;
    const assessment = cards.filter((c) => c.column === "Assessment").length;
    const applied = cards.filter((c) => c.column === "Applied").length;

    // Offer Rate = Selected / (Selected + Rejected + Applied + Assessment + Interview)
    const processed = selected + rejected + applied + assessment + interview;
    const offerRate = processed > 0 ? Math.round((selected / processed) * 100) : 0;

    // Action Required: Closing in 3 days
    let closingSoonCount = 0;
    cards.forEach((c) => {
      if (c.applicationDeadline && (c.column === "Saved" || c.column === "Interested")) {
        const dead = getDeadlineStatus(c.applicationDeadline);
        if (dead.isClosingSoon && !dead.isExpired) {
          closingSoonCount++;
        }
      }
    });

    return {
      total,
      selected,
      interview,
      offerRate,
      closingSoonCount,
    };
  }, [cards]);

  // List of unique opportunity types present in our tracker for the type filter dropdown
  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    cards.forEach((c) => types.add(c.type));
    return Array.from(types);
  }, [cards]);

  return (
    <div className="space-y-8">
      {/* Toast alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-24 right-8 z-50 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl text-xs font-semibold flex items-center gap-2 ${
              toast.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── METRICS SECTION ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          icon={<Layers className="w-4 h-4 text-purple-400" />}
          title="Total Tracked"
          value={stats.total}
          description="Opportunities cataloged"
        />
        <StatsCard
          icon={<Flame className="w-4 h-4 text-amber-500" />}
          title="Interviews Set"
          value={stats.interview}
          description="Live interview pipelines"
        />
        <StatsCard
          icon={<Award className="w-4 h-4 text-emerald-400" />}
          title="Conversion Rate"
          value={`${stats.offerRate}%`}
          description="Selected / Total applied"
        />
        <StatsCard
          icon={<Clock className="w-4 h-4 text-rose-400" />}
          title="Urgent Actions"
          value={stats.closingSoonCount}
          description="Deadlines in next 3 days"
          highlight={stats.closingSoonCount > 0}
        />
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-zinc-500" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search opportunities by title, club or skills..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-44">
            <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-8 pr-4 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer appearance-none"
            >
              <option value="all">All Category Types</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t} className="capitalize">
                  {t.replace("_", " ")}s
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || typeFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
              }}
              className="px-3.5 py-2 text-xs font-mono rounded-xl bg-zinc-850 border border-zinc-750 text-zinc-300 hover:bg-zinc-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── KANBAN BOARD ── */}
      <div className="flex gap-5 overflow-x-auto pb-6 pt-1 px-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {COLUMNS.map((column) => {
          const columnCards = filteredCards.filter((c) => c.column === column.id);
          const isOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className={`w-72 shrink-0 flex flex-col rounded-2xl bg-zinc-950/40 border transition-all duration-300 ${
                isOver ? "border-indigo-500/50 bg-indigo-500/5" : "border-zinc-900"
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${column.color.split(" ")[2]} shadow`} />
                  <h4 className="text-xs font-bold text-zinc-200 tracking-tight">{column.label}</h4>
                  <span className="px-1.5 py-0.5 rounded-md bg-zinc-900 text-[10px] text-zinc-500 font-mono">
                    {columnCards.length}
                  </span>
                </div>

                <Link
                  href="/opportunities"
                  className="p-1 rounded-lg text-zinc-650 hover:text-zinc-350 hover:bg-zinc-900 transition-colors"
                  title="Explore and bookmark opportunities"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Column Body (Cards List) */}
              <div className="p-3 flex-1 flex flex-col gap-3 min-h-[360px] overflow-y-auto max-h-[500px] scrollbar-none">
                <AnimatePresence mode="popLayout">
                  {columnCards.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-650 border border-dashed border-zinc-900/60 rounded-xl bg-zinc-900/10">
                      <Layers className="w-6 h-6 stroke-[1.2] opacity-40 mb-1" />
                      <span className="text-[10px] font-mono">No opportunities</span>
                    </div>
                  ) : (
                    columnCards.map((opp) => (
                      <KanbanOpportunityCard key={opp.id} card={opp} onDragStart={handleDragStart} />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────── METRIC CARD SUBCOMPONENT ─────────────── */
function StatsCard({
  icon,
  title,
  value,
  description,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-2xl bg-zinc-900/40 border transition-colors shadow-lg flex items-center gap-4 ${
        highlight
          ? "border-rose-500/30 hover:border-rose-500/40 bg-rose-950/5"
          : "border-zinc-800/80 hover:border-zinc-700/80"
      }`}
    >
      <div className={`p-2.5 rounded-xl border bg-zinc-950 shadow-inner ${
        highlight ? "border-rose-500/20" : "border-zinc-800/80"
      }`}>
        {icon}
      </div>
      <div>
        <span className="block text-[10px] text-zinc-500 font-mono tracking-wider uppercase">{title}</span>
        <h3 className={`text-xl font-black ${highlight ? "text-rose-400" : "text-zinc-100"}`}>{value}</h3>
        <span className="block text-[9px] text-zinc-500 truncate">{description}</span>
      </div>
    </div>
  );
}

/* ─────────────── KANBAN CARD SUBCOMPONENT ─────────────── */
function KanbanOpportunityCard({
  card,
  onDragStart,
}: {
  card: TrackerOpportunity;
  onDragStart: (e: React.DragEvent, cardId: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const deadlineInfo = getDeadlineStatus(card.applicationDeadline);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(-((y - centerY) / centerY) * 2.5);
    setRotateY(((x - centerX) / centerX) * 2.5);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      draggable
      onDragStart={(e: any) => onDragStart(e, card.id)}
      className="group p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-indigo-500/40 transition-colors cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg flex flex-col justify-between gap-3 relative overflow-hidden"
    >
      {/* Top border line glow on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/60 transition-all duration-300" />

      {/* Top Meta info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <OpportunityTypeBadge type={card.type} />
          <BookmarkButton opportunityId={card.id} initialIsSaved={card.column === "Saved" || card.column === "Interested"} />
        </div>

        {/* Title */}
        <div>
          <Link href={`/opportunities/${card.slug}`} className="block group/title">
            <h5 className="text-[12px] font-bold text-zinc-200 group-hover/title:text-indigo-400 transition-colors leading-snug line-clamp-2">
              {card.title}
            </h5>
          </Link>
          {card.club && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-500">
              <span className="truncate">by {card.club.name}</span>
              <VerificationBadge status={card.club.verificationStatus} showIcon={false} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Deadline & Details */}
      <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2">
        {card.applicationDeadline ? (
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono border ${deadlineInfo.colorClass}`}>
            {deadlineInfo.isClosingSoon ? (
              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
            ) : (
              <Clock className="w-2.5 h-2.5 shrink-0" />
            )}
            <span>{deadlineInfo.label}</span>
          </span>
        ) : (
          <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 shrink-0" />
            <span className="capitalize">{card.locationType.replace("_", " ")}</span>
          </span>
        )}

        <Link
          href={`/opportunities/${card.slug}`}
          className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 group/link"
        >
          <span>View</span>
          <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
