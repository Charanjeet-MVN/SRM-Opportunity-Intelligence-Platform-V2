"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Opportunity } from "@/types";
import OpportunityTypeBadge from "./OpportunityTypeBadge";
import VerificationBadge from "../clubs/VerificationBadge";
import BookmarkButton from "./BookmarkButton";
import {
  Bookmark,
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
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

/**
 * Deadline status calculation helper
 */
function getDeadlineStatus(deadlineStr?: string): {
  label: string;
  colorClass: string;
  isExpired: boolean;
} {
  if (!deadlineStr) {
    return { label: "No Deadline", colorClass: "text-zinc-500 bg-zinc-950 border-zinc-800", isExpired: false };
  }

  const now = new Date();
  const deadline = new Date(deadlineStr);
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return { label: "Deadline passed", colorClass: "text-red-400 bg-red-500/10 border-red-500/30", isExpired: true };
  }

  // Check if today
  const isToday =
    deadline.getDate() === now.getDate() &&
    deadline.getMonth() === now.getMonth() &&
    deadline.getFullYear() === now.getFullYear();

  if (isToday) {
    return { label: "Due today", colorClass: "text-amber-300 bg-amber-500/10 border-amber-500/30 animate-pulse", isExpired: false };
  }

  // Check if tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    deadline.getDate() === tomorrow.getDate() &&
    deadline.getMonth() === tomorrow.getMonth() &&
    deadline.getFullYear() === tomorrow.getFullYear();

  if (isTomorrow) {
    return { label: "Due tomorrow", colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/30", isExpired: false };
  }

  if (diffDays <= 7) {
    return { label: "Due this week", colorClass: "text-purple-300 bg-purple-500/10 border-purple-500/30", isExpired: false };
  }

  return {
    label: `Closes ${deadline.toLocaleDateString()}`,
    colorClass: "text-zinc-400 bg-zinc-950 border-zinc-800",
    isExpired: false,
  };
}

export default function StudentOpportunityTracker({
  initialSaved,
  initialRegistered,
  initialTab = "saved",
}: StudentOpportunityTrackerProps) {
  const [activeTab, setActiveTab] = useState<"saved" | "registered" | "upcoming">(initialTab);

  // Derive Upcoming Opportunities (Saved or Registered with active future deadlines)
  const allTrackerItems = [...initialSaved, ...initialRegistered];
  const uniqueItemsMap = new Map<string, TrackerOpportunity>();
  allTrackerItems.forEach((item) => uniqueItemsMap.set(item.id, item));
  const uniqueItems = Array.from(uniqueItemsMap.values());

  const upcomingOpportunities = uniqueItems
    .filter((opp) => opp.applicationDeadline && new Date(opp.applicationDeadline) > new Date())
    .sort((a, b) => new Date(a.applicationDeadline!).getTime() - new Date(b.applicationDeadline!).getTime());

  return (
    <div className="space-y-6">
      {/* Interactive Tracker Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("saved")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "saved"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved ({initialSaved.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("registered")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "registered"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Registered ({initialRegistered.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "upcoming"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Upcoming ({upcomingOpportunities.length})</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <AnimatePresence mode="wait">
        {/* SAVED TAB */}
        {activeTab === "saved" && (
          <motion.div
            key="saved-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {initialSaved.length === 0 ? (
              <div className="py-16 px-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
                  <Bookmark className="w-6 h-6 text-purple-400" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-base font-semibold text-zinc-200">Your opportunity list is empty.</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Bookmark interesting campus hackathons, internships, and workshops to track them here.
                  </p>
                </div>
                <Link
                  href="/opportunities"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md transition-all"
                >
                  <span>Explore Opportunities</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialSaved.map((opp) => (
                  <OpportunityTrackerCard key={opp.id} opportunity={opp} isSaved={true} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* REGISTERED TAB */}
        {activeTab === "registered" && (
          <motion.div
            key="registered-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {initialRegistered.length === 0 ? (
              <div className="py-16 px-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
                  <UserCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-base font-semibold text-zinc-200">Nothing registered yet.</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    When you click &quot;Register / Apply&quot; on a verified opportunity, your submission receipt will be tracked here.
                  </p>
                </div>
                <Link
                  href="/opportunities"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-all"
                >
                  <span>Find an Opportunity</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialRegistered.map((opp) => (
                  <OpportunityTrackerCard key={opp.id} opportunity={opp} isRegistered={true} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* UPCOMING TAB */}
        {activeTab === "upcoming" && (
          <motion.div
            key="upcoming-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {upcomingOpportunities.length === 0 ? (
              <div className="py-16 px-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-base font-semibold text-zinc-200">No upcoming deadlines.</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Save or register for active opportunities to get deadline reminders and proximity tracking.
                  </p>
                </div>
                <Link
                  href="/opportunities"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-md transition-all"
                >
                  <span>Explore Opportunities</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingOpportunities.map((opp) => (
                  <OpportunityTrackerCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OpportunityTrackerCard({
  opportunity,
  isSaved,
  isRegistered,
}: {
  opportunity: TrackerOpportunity;
  isSaved?: boolean;
  isRegistered?: boolean;
}) {
  const deadlineInfo = getDeadlineStatus(opportunity.applicationDeadline);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 flex flex-col justify-between space-y-4 transition-all hover:border-zinc-700 shadow-lg"
    >
      <div className="space-y-3">
        {/* Top Header */}
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

        {/* Title & Organizer */}
        <div className="space-y-1">
          <Link href={`/opportunities/${opportunity.slug}`} className="block group">
            <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
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

        {/* Deadline Proximity Badge */}
        <div className="pt-1">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono border ${deadlineInfo.colorClass}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{deadlineInfo.label}</span>
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs">
        <span className="capitalize font-mono text-[11px] text-zinc-500 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {opportunity.locationType.replace("_", " ")}
        </span>

        <Link
          href={`/opportunities/${opportunity.slug}`}
          className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium text-xs transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
