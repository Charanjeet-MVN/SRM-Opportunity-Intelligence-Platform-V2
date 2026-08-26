"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Opportunity, StudentProfile } from "@/types";
import { RelevanceScoreResult, calculateOpportunityRelevance } from "@/lib/relevance/scoring";
import RegisterApplyButton from "../RegisterApplyButton";
import BookmarkButton from "../BookmarkButton";
import OpportunityTrackerSelector from "./OpportunityTrackerSelector";
import ShareOpportunityButton from "./ShareOpportunityButton";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  ExternalLink,
  ArrowRight,
  UserCheck,
} from "lucide-react";

interface OpportunityDecisionSidebarProps {
  opportunity: Opportunity;
  profile: StudentProfile | null;
  isAuthenticated: boolean;
  isRegistered: boolean;
  isSaved: boolean;
  trackerColumn?: string;
}

export default function OpportunityDecisionSidebar({
  opportunity,
  profile,
  isAuthenticated,
  isRegistered,
  isSaved,
  trackerColumn,
}: OpportunityDecisionSidebarProps) {
  // Compute deterministic relevance
  const relevance: RelevanceScoreResult = calculateOpportunityRelevance(profile, opportunity);

  // Deadline calculations
  const now = new Date();
  const deadlineDate = opportunity.applicationDeadline
    ? new Date(opportunity.applicationDeadline)
    : null;
  const isDeadlinePassed = deadlineDate ? deadlineDate < now : false;

  let urgencyLevel: "critical" | "urgent" | "upcoming" | "future" | "closed" | "rolling" = "rolling";
  let deadlineLabel = "Rolling / Open";
  let deadlineRemainingText = "Applications are currently open";

  if (isDeadlinePassed) {
    urgencyLevel = "closed";
    deadlineLabel = "APPLICATION CLOSED";
    deadlineRemainingText = "This opportunity is no longer accepting applications";
  } else if (deadlineDate) {
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays <= 0) {
      urgencyLevel = "critical";
      deadlineLabel = "CRITICAL DEADLINE";
      deadlineRemainingText = `Closing in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
    } else if (diffDays <= 3) {
      urgencyLevel = "urgent";
      deadlineLabel = "URGENT DEADLINE";
      deadlineRemainingText = `${diffDays} day${diffDays === 1 ? "" : "s"} remaining`;
    } else if (diffDays <= 7) {
      urgencyLevel = "upcoming";
      deadlineLabel = "UPCOMING DEADLINE";
      deadlineRemainingText = `${diffDays} days remaining`;
    } else {
      urgencyLevel = "future";
      deadlineLabel = "OPEN WINDOW";
      deadlineRemainingText = `${diffDays} days remaining`;
    }
  }

  // Match Tier
  let matchTier = {
    label: "Strong Match",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/20",
    icon: CheckCircle2,
  };

  if (!isAuthenticated || !profile) {
    matchTier = {
      label: "SRM Student Match",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/30",
      badgeBg: "bg-indigo-500/20",
      icon: Sparkles,
    };
  } else if (relevance.totalScore < 45) {
    matchTier = {
      label: "Low Match",
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      badgeBg: "bg-rose-500/20",
      icon: XCircle,
    };
  } else if (relevance.totalScore < 75) {
    matchTier = {
      label: "Partial Match",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      badgeBg: "bg-amber-500/20",
      icon: AlertTriangle,
    };
  }

  const MatchIcon = matchTier.icon;

  return (
    <div className="space-y-6">
      {/* 1. Main Intelligent Decision Box */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-zinc-950 border border-zinc-800 p-6 sm:p-7 backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Opportunity Decision Intel</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            SOIP Intelligence V2
          </span>
        </div>

        {/* Relevance Score Indicator */}
        {isAuthenticated && profile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-zinc-400 block font-semibold">
                  Personalized Match
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {relevance.totalScore}
                  </span>
                  <span className="text-sm font-mono text-zinc-500">/ 100</span>
                </div>
              </div>

              {/* Match Badge */}
              <div
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${matchTier.bg} ${matchTier.border} ${matchTier.color}`}
              >
                <MatchIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{matchTier.label}</span>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${relevance.totalScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  relevance.totalScore >= 75
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : relevance.totalScore >= 45
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                    : "bg-gradient-to-r from-rose-500 to-red-400"
                }`}
              />
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-indigo-500/20 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>Personalized Match Available</span>
            </div>
            <p className="text-zinc-400 leading-relaxed font-light">
              Sign in and complete your SRM student profile to calculate your deterministic skill and department match score.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-mono font-medium pt-1"
            >
              <span>Get started with SRM ID</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* "Why This Matches You" Grounded Signals */}
        {isAuthenticated && profile && (
          <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
              Why This Matches You
            </span>

            <div className="space-y-2">
              {/* Skill signal */}
              {relevance.matchedSkills.length > 0 ? (
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Matches your skill:{" "}
                    <strong className="text-emerald-300 font-medium">
                      {relevance.matchedSkills.slice(0, 3).join(", ")}
                    </strong>
                  </span>
                </div>
              ) : opportunity.requiredSkills.length > 0 ? (
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-2 text-xs text-zinc-400">
                  <span className="text-zinc-500 font-mono">○</span>
                  <span>
                    Requires {opportunity.requiredSkills.slice(0, 2).join(", ")} (Great opportunity to learn)
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>No prerequisite skill restrictions</span>
                </div>
              )}

              {/* Department signal */}
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-2 text-xs text-zinc-300">
                {relevance.isDepartmentEligible ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>
                  {relevance.isDepartmentEligible
                    ? `Department eligible (${profile.department || "All SRM"})`
                    : `Restricted to ${opportunity.eligibleDepartments.join(", ")}`}
                </span>
              </div>

              {/* Year signal */}
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-2 text-xs text-zinc-300">
                {relevance.isYearEligible ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>
                  {relevance.isYearEligible
                    ? `Year ${profile.yearOfStudy || "1-4"} eligible`
                    : `Restricted to Year ${opportunity.eligibleYears.join(", ")}`}
                </span>
              </div>

              {/* Deadline urgency signal */}
              {deadlineDate && !isDeadlinePassed && (
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-2 text-xs text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Deadline:{" "}
                    <strong className="text-amber-300 font-medium">
                      {deadlineRemainingText}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Deadline Intelligence Bar */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 uppercase font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Application Deadline</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                urgencyLevel === "closed"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : urgencyLevel === "critical"
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                  : urgencyLevel === "urgent"
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30 font-semibold"
                  : urgencyLevel === "upcoming"
                  ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
                  : "bg-zinc-800 text-zinc-300 border-zinc-700"
              }`}
            >
              {deadlineLabel}
            </span>
          </div>

          <div className="text-sm font-semibold text-zinc-100">
            {deadlineDate
              ? deadlineDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Rolling Admissions / Open Application"}
          </div>

          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            {deadlineRemainingText}
          </p>
        </div>

        {/* 3. Primary Action Area */}
        <div className="space-y-3 pt-2 border-t border-zinc-800/80">
          {/* Main Apply / Register Button */}
          <div className="w-full">
            {isDeadlinePassed ? (
              <button
                disabled
                className="w-full py-3 px-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 font-semibold text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
              >
                <XCircle className="w-4 h-4 text-zinc-500" />
                <span>Application Closed</span>
              </button>
            ) : (
              <RegisterApplyButton
                opportunityId={opportunity.id}
                externalUrl={opportunity.externalUrl}
                initialIsRegistered={isRegistered}
              />
            )}
          </div>

          {/* Quick Actions Row (Bookmark, Track Selector, Share) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-2">
              <BookmarkButton
                opportunityId={opportunity.id}
                initialIsSaved={isSaved}
              />
              <ShareOpportunityButton title={opportunity.title} />
            </div>

            {/* Tracker status dropdown */}
            <OpportunityTrackerSelector
              opportunityId={opportunity.id}
              initialColumn={trackerColumn}
            />
          </div>
        </div>
      </motion.div>

      {/* 4. Verified SRM Campus Assurance */}
      <div className="rounded-3xl bg-zinc-950/70 border border-zinc-800/80 p-5 backdrop-blur-xl space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>SRM Campus Verified Entry</span>
        </div>
        <p className="text-xs text-zinc-400 font-light leading-relaxed">
          {opportunity.club?.verificationStatus === "verified"
            ? "Published by an Official SRM Verified Club. Registration records and certificate eligibility are tracked on SOIP."
            : "Direct student campus post. Check requirements and contact the organizing committee for clarifications."}
        </p>
      </div>

      {/* 5. Organizer Spotlight Mini-Card */}
      {opportunity.club && (
        <div className="rounded-3xl bg-zinc-950/70 border border-zinc-800/80 p-5 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500 uppercase font-semibold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Organizer</span>
            </span>
            <span className="text-[10px] text-zinc-400">
              {opportunity.club.category || "SRM Organization"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-indigo-400 text-sm overflow-hidden shrink-0 shadow-md">
              {opportunity.club.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={opportunity.club.logoUrl}
                  alt={opportunity.club.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                opportunity.club.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-0.5 min-w-0 flex-1">
              <Link
                href={`/clubs/${opportunity.club.slug || opportunity.club.id}`}
                className="text-sm font-bold text-zinc-100 hover:text-indigo-300 transition-colors truncate block"
              >
                {opportunity.club.name}
              </Link>
              <span className="text-[11px] font-mono text-zinc-400 block truncate">
                {opportunity.club.verificationStatus === "verified"
                  ? "Official SRM Club ✓"
                  : "Campus Student Organization"}
              </span>
            </div>

            <Link
              href={`/clubs/${opportunity.club.slug || opportunity.club.id}`}
              className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors shrink-0"
              title="View Club Profile"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
