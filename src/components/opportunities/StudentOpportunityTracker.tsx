"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Opportunity } from "@/types";
import OpportunityTypeBadge from "./OpportunityTypeBadge";
import VerificationBadge from "../clubs/VerificationBadge";
import BookmarkButton from "./BookmarkButton";
import {
  Bookmark,
  UserCheck,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Calendar,
} from "lucide-react";

export interface TrackerOpportunity extends Opportunity {
  savedAt?: string;
  registeredAt?: string;
  registrationStatus?: string;
}

interface StudentOpportunityTrackerProps {
  initialSaved: TrackerOpportunity[];
  initialRegistered: TrackerOpportunity[];
  initialTab?: "saved" | "registered" | "upcoming";
}

function getDeadlineStatus(deadlineStr?: string): {
  label: string;
  colorClass: string;
  isExpired: boolean;
  urgency: "none" | "low" | "medium" | "high" | "critical";
} {
  if (!deadlineStr) {
    return { label: "No Deadline", colorClass: "text-zinc-500 bg-zinc-950 border-zinc-800", isExpired: false, urgency: "none" };
  }

  const now = new Date();
  const deadline = new Date(deadlineStr);
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return { label: "Deadline passed", colorClass: "text-red-400 bg-red-500/10 border-red-500/30", isExpired: true, urgency: "none" };
  }

  const isToday =
    deadline.getDate() === now.getDate() &&
    deadline.getMonth() === now.getMonth() &&
    deadline.getFullYear() === now.getFullYear();

  if (isToday) {
    return { label: "Due today", colorClass: "text-amber-300 bg-amber-500/10 border-amber-500/30 animate-pulse", isExpired: false, urgency: "critical" };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    deadline.getDate() === tomorrow.getDate() &&
    deadline.getMonth() === tomorrow.getMonth() &&
    deadline.getFullYear() === tomorrow.getFullYear();

  if (isTomorrow) {
    return { label: "Due tomorrow", colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/30", isExpired: false, urgency: "high" };
  }

  if (diffDays <= 7) {
    return { label: `${diffDays}d remaining`, colorClass: "text-purple-300 bg-purple-500/10 border-purple-500/30", isExpired: false, urgency: "medium" };
  }

  return {
    label: `Closes ${deadline.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
    colorClass: "text-zinc-400 bg-zinc-950 border-zinc-800",
    isExpired: false,
    urgency: "low",
  };
}

export default function StudentOpportunityTracker({
  initialSaved,
  initialRegistered,
  initialTab = "saved",
}: StudentOpportunityTrackerProps) {
  const [activeTab, setActiveTab] = useState<"saved" | "registered" | "upcoming">(initialTab);

  const allTrackerItems = [...initialSaved, ...initialRegistered];
  const uniqueItemsMap = new Map<string, TrackerOpportunity>();
  allTrackerItems.forEach((item) => uniqueItemsMap.set(item.id, item));
  const uniqueItems = Array.from(uniqueItemsMap.values());

  const upcomingOpportunities = uniqueItems
    .filter((opp) => opp.applicationDeadline && new Date(opp.applicationDeadline) > new Date())
    .sort((a, b) => new Date(a.applicationDeadline!).getTime() - new Date(b.applicationDeadline!).getTime());

  const TABS = [
    { id: "saved" as const, label: "Saved", count: initialSaved.length, icon: Bookmark, activeColor: "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25" },
    { id: "registered" as const, label: "Registered", count: initialRegistered.length, icon: UserCheck, activeColor: "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25" },
    { id: "upcoming" as const, label: "Upcoming", count: upcomingOpportunities.length, icon: Clock, activeColor: "bg-amber-600 text-white shadow-lg shadow-amber-600/25" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Premium Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive ? tab.activeColor : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  isActive ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {tab.count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "saved" && (
          <motion.div
            key="saved-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {initialSaved.length === 0 ? (
              <EmptyState
                icon={<Bookmark className="w-6 h-6 text-indigo-400" />}
                title="No saved opportunities yet."
                description="Browse verified SRM hackathons, internships, and workshops, then bookmark what interests you."
                ctaLabel="Explore Opportunities"
                ctaHref="/opportunities"
                accentColor="bg-indigo-600 hover:bg-indigo-500"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {initialSaved.map((opp, i) => (
                    <OpportunityTrackerCard key={opp.id} opportunity={opp} isSaved={true} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "registered" && (
          <motion.div
            key="registered-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {initialRegistered.length === 0 ? (
              <EmptyState
                icon={<UserCheck className="w-6 h-6 text-emerald-400" />}
                title="Nothing registered yet."
                description="When you submit an application through a verified opportunity, your receipt will appear here."
                ctaLabel="Find an Opportunity"
                ctaHref="/opportunities"
                accentColor="bg-emerald-600 hover:bg-emerald-500"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {initialRegistered.map((opp, i) => (
                    <OpportunityTrackerCard key={opp.id} opportunity={opp} isRegistered={true} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "upcoming" && (
          <motion.div
            key="upcoming-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {upcomingOpportunities.length === 0 ? (
              <EmptyState
                icon={<Clock className="w-6 h-6 text-amber-400" />}
                title="No upcoming deadlines."
                description="Save or register for opportunities with active deadlines to see your timeline here."
                ctaLabel="Discover Opportunities"
                ctaHref="/opportunities"
                accentColor="bg-amber-600 hover:bg-amber-500"
              />
            ) : (
              <div className="space-y-3">
                {upcomingOpportunities.map((opp, i) => (
                  <UpcomingDeadlineRow key={opp.id} opportunity={opp} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  accentColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  accentColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="py-16 px-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto"
    >
      <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto shadow-inner">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-zinc-200">{title}</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
      </div>
      <Link
        href={ctaHref}
        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl ${accentColor} text-white font-medium text-xs shadow-md transition-all`}
      >
        <span>{ctaLabel}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}

function OpportunityTrackerCard({
  opportunity,
  isSaved,
  isRegistered,
  index,
}: {
  opportunity: TrackerOpportunity;
  isSaved?: boolean;
  isRegistered?: boolean;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const deadlineInfo = getDeadlineStatus(opportunity.applicationDeadline);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(-((y - centerY) / centerY) * 3);
    setRotateY(((x - centerX) / centerX) * 3);
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      className="group rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-indigo-500/40 p-5 flex flex-col justify-between space-y-4 shadow-lg hover:shadow-xl hover:shadow-indigo-950/30 relative overflow-hidden"
    >
      {/* Top border illumination */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/70 transition-all duration-500" />

      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <OpportunityTypeBadge type={opportunity.type} />
          <div className="flex items-center gap-1.5">
            {isRegistered && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Registered
              </span>
            )}
            <BookmarkButton opportunityId={opportunity.id} initialIsSaved={isSaved ?? true} />
          </div>
        </div>

        <div className="space-y-1">
          <Link href={`/opportunities/${opportunity.slug}`} className="block group/title">
            <h3 className="text-sm font-semibold text-zinc-100 group-hover/title:text-indigo-300 transition-colors line-clamp-2 leading-snug">
              {opportunity.title}
            </h3>
          </Link>
          {opportunity.club && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span>by {opportunity.club.name}</span>
              <VerificationBadge status={opportunity.club.verificationStatus} showIcon={false} />
            </div>
          )}
        </div>

        <div className="pt-0.5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono border ${deadlineInfo.colorClass}`}>
            {deadlineInfo.urgency === "critical" || deadlineInfo.urgency === "high" ? (
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Clock className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{deadlineInfo.label}</span>
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs relative z-10">
        <span className="capitalize font-mono text-[11px] text-zinc-500 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-zinc-600" />
          {opportunity.locationType.replace("_", " ")}
        </span>

        <Link
          href={`/opportunities/${opportunity.slug}`}
          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium text-xs transition-colors group-hover:translate-x-0.5"
        >
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

function UpcomingDeadlineRow({
  opportunity,
  index,
}: {
  opportunity: TrackerOpportunity;
  index: number;
}) {
  const deadlineInfo = getDeadlineStatus(opportunity.applicationDeadline);
  const deadline = opportunity.applicationDeadline ? new Date(opportunity.applicationDeadline) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: "easeOut" }}
      className="group flex items-center gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all"
    >
      {/* Date Badge */}
      <div className="shrink-0 w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center font-mono group-hover:border-indigo-500/30 transition-colors">
        {deadline ? (
          <>
            <span className="text-[10px] text-zinc-500 uppercase">{deadline.toLocaleDateString(undefined, { month: "short" })}</span>
            <span className="text-lg font-bold text-zinc-200 leading-none">{deadline.getDate()}</span>
          </>
        ) : (
          <Calendar className="w-5 h-5 text-zinc-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <Link href={`/opportunities/${opportunity.slug}`} className="block">
          <h3 className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-300 transition-colors truncate leading-snug">
            {opportunity.title}
          </h3>
        </Link>
        {opportunity.club && (
          <p className="text-[11px] text-zinc-500 truncate font-mono mt-0.5">
            {opportunity.club.name}
          </p>
        )}
      </div>

      <span className={`shrink-0 text-[11px] px-2.5 py-1 rounded-lg font-mono border ${deadlineInfo.colorClass}`}>
        {deadlineInfo.label}
      </span>
    </motion.div>
  );
}
