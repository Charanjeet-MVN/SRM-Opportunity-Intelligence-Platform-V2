"use client";

import React from "react";
import Link from "next/link";
import { Opportunity, StudentProfile } from "@/types";
import OpportunityTypeBadge from "@/components/opportunities/OpportunityTypeBadge";
import BookmarkButton from "@/components/opportunities/BookmarkButton";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import {
  Sparkles,
  ArrowRight,
  Building2,
  Clock,
  CheckCircle2,
  Flame,
  Compass,
} from "lucide-react";
import SpatialCard3D from "@/components/3d/SpatialCard3D";
import { RelevanceScoreResult } from "@/lib/relevance/scoring";

interface RecommendedOpportunitiesDeckProps {
  opportunities: (Opportunity & { relevance?: RelevanceScoreResult })[];
  studentProfile?: StudentProfile | null;
  savedIds?: Set<string>;
}

function getMatchBadge(score?: number) {
  if (score === undefined) return { label: "Recommended", color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/25" };
  if (score >= 75) return { label: "Strong Match", color: "bg-purple-500/15 text-purple-300 border-purple-500/35" };
  if (score >= 50) return { label: "Good Match", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35" };
  if (score >= 30) return { label: "Department Fit", color: "bg-sky-500/15 text-sky-300 border-sky-500/35" };
  return { label: "Open Listing", color: "bg-zinc-800 text-zinc-400 border-zinc-700" };
}

function formatDeadlineText(deadlineStr?: string) {
  if (!deadlineStr) return { text: "Open deadline", isUrgent: false, isCritical: false };
  const deadline = new Date(deadlineStr);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) return { text: "Application closed", isUrgent: false, isCritical: false };
  if (diffDays <= 1) return { text: "Deadline today", isUrgent: true, isCritical: true };
  if (diffDays <= 2) return { text: "Deadline tomorrow", isUrgent: true, isCritical: false };
  if (diffDays <= 7) return { text: `Deadline in ${diffDays} days`, isUrgent: true, isCritical: false };

  return {
    text: `Deadline: ${deadline.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    isUrgent: false,
    isCritical: false,
  };
}

export default function RecommendedOpportunitiesDeck({
  opportunities,
  studentProfile,
  savedIds = new Set(),
}: RecommendedOpportunitiesDeckProps) {
  const topRecommendations = opportunities.slice(0, 4);

  return (
    <div className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 relative overflow-hidden h-full flex flex-col justify-between">
      {/* Background Radial Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-zinc-800/70 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/25">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Primary Decision Surface</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              Recommended For You
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Deterministic matching based on your verified skills, department, and academic year.
            </p>
          </div>

          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-mono font-medium text-purple-400 hover:text-purple-300 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span>Explore All Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Recommended Opportunities List / Cards */}
        {topRecommendations.length === 0 ? (
          <div className="py-14 px-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 text-center space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6 text-purple-400" />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="text-sm font-semibold text-zinc-200">
                No recommendations yet.
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Complete your profile skills and academic department to enable real-time opportunity matching.
              </p>
            </div>
            <Link
              href="/dashboard/student/profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md transition-all"
            >
              <span>Complete Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
            {topRecommendations.map((opp) => {
              const relevance = opp.relevance;
              const matchBadge = getMatchBadge(relevance?.totalScore);
              const deadline = formatDeadlineText(opp.applicationDeadline);
              const isSaved = savedIds.has(opp.id);

              // Extract concise rationale items
              const rationaleList = relevance?.rationale && relevance.rationale.length > 0
                ? relevance.rationale.slice(0, 3)
                : [
                    relevance?.matchedSkills && relevance.matchedSkills.length > 0
                      ? `Matches skills: ${relevance.matchedSkills.slice(0, 2).join(", ")}`
                      : "Open for all SRM students",
                    relevance?.isDepartmentEligible && studentProfile?.department
                      ? `Eligible for ${studentProfile.department}`
                      : "Campus-wide participation",
                  ];

              return (
                <SpatialCard3D
                  key={opp.id}
                  depth={6}
                  elevationZ={14}
                  glowColor="rgba(168, 85, 247, 0.15)"
                  className="h-full"
                >
                  <div className="group rounded-3xl bg-zinc-950/90 border border-zinc-800/80 hover:border-purple-500/40 p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 shadow-xl backdrop-blur-xl h-full space-y-4 relative overflow-hidden">
                    {/* Specular illumination bar */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/0 to-transparent group-hover:via-purple-500/60 transition-all duration-500" />

                    <div className="space-y-3.5">
                      {/* Top Badges & Actions */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <OpportunityTypeBadge type={opp.type} />
                          <span
                            className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${matchBadge.color}`}
                          >
                            {matchBadge.label}
                          </span>
                        </div>
                        <BookmarkButton opportunityId={opp.id} initialIsSaved={isSaved} />
                      </div>

                      {/* Title & Organization */}
                      <div className="space-y-1">
                        <Link href={`/opportunities/${opp.slug}`}>
                          <h3 className="text-sm sm:text-base font-bold text-zinc-100 hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                            {opp.title}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                          <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate">{opp.club?.name || "SRM Organization"}</span>
                          {opp.club && (
                            <VerificationBadge
                              status={opp.club.verificationStatus}
                              showIcon={false}
                            />
                          )}
                        </div>
                      </div>

                      {/* "Why this opportunity" Section */}
                      <div className="p-3 rounded-2xl bg-purple-500/5 border border-purple-500/15 space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 block">
                          Why this is recommended:
                        </span>
                        <div className="space-y-1">
                          {rationaleList.map((reason, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-300 font-mono">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-1 leading-tight">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Deadline indicator */}
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        {deadline.isCritical ? (
                          <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span
                          className={`${
                            deadline.isCritical
                              ? "text-rose-300 font-bold"
                              : deadline.isUrgent
                              ? "text-amber-300 font-semibold"
                              : "text-zinc-400"
                          }`}
                        >
                          {deadline.text}
                        </span>
                      </div>
                    </div>

                    {/* Bottom CTA Button */}
                    <div className="pt-3 border-t border-zinc-800/70 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-500 text-[11px] capitalize">
                        {opp.locationType.replace("_", " ")}
                      </span>

                      <Link
                        href={`/opportunities/${opp.slug}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all group/btn shrink-0"
                      >
                        <span>View Opportunity</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </SpatialCard3D>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
