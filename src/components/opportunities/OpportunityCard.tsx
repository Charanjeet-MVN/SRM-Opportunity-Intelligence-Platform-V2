"use client";

import React from "react";
import Link from "next/link";
import { Opportunity } from "@/types";
import OpportunityTypeBadge from "./OpportunityTypeBadge";
import VerificationBadge from "../clubs/VerificationBadge";
import AnimatedMatchBadge from "./AnimatedMatchBadge";
import BookmarkButton from "./BookmarkButton";
import SpatialCard3D from "@/components/3d/SpatialCard3D";
import { RelevanceScoreResult } from "@/lib/relevance/scoring";
import {
  MapPin,
  ArrowRight,
  Clock,
  AlertTriangle,
  Flame,
  Building2,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface OpportunityCardProps {
  opportunity: Opportunity;
  relevance?: RelevanceScoreResult;
  initialIsSaved?: boolean;
  onSelectDetail?: (opp: Opportunity) => void;
}

export default function OpportunityCard({
  opportunity,
  relevance,
  initialIsSaved = false,
  onSelectDetail,
}: OpportunityCardProps) {
  // Deadline & Semantic Urgency Calculation
  const now = new Date();
  const deadlineDate = opportunity.applicationDeadline
    ? new Date(opportunity.applicationDeadline)
    : null;
  const isDeadlinePassed = deadlineDate ? deadlineDate < now : false;

  let urgencyLevel: "critical" | "urgent" | "upcoming" | "rolling" | "expired" =
    "rolling";
  let urgencyLabel = "Rolling Entry";
  let urgencyColor = "text-zinc-400 bg-zinc-900 border-zinc-800";
  let UrgencyIcon = Clock;

  if (isDeadlinePassed) {
    urgencyLevel = "expired";
    urgencyLabel = "Deadline Passed";
    urgencyColor = "text-zinc-500 bg-zinc-900/80 border-zinc-800";
    UrgencyIcon = Clock;
  } else if (deadlineDate) {
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

    if (diffHours <= 24) {
      urgencyLevel = "critical";
      urgencyLabel = diffHours <= 1 ? "Closing in < 1h" : `Closing in ${diffHours}h`;
      urgencyColor = "text-rose-300 bg-rose-500/15 border-rose-500/30";
      UrgencyIcon = AlertTriangle;
    } else if (diffDays === 1) {
      urgencyLevel = "critical";
      urgencyLabel = "Deadline Tomorrow";
      urgencyColor = "text-amber-300 bg-amber-500/15 border-amber-500/30";
      UrgencyIcon = AlertTriangle;
    } else if (diffDays <= 3) {
      urgencyLevel = "urgent";
      urgencyLabel = `${diffDays} days left`;
      urgencyColor = "text-amber-300 bg-amber-500/15 border-amber-500/30";
      UrgencyIcon = Flame;
    } else if (diffDays <= 7) {
      urgencyLevel = "urgent";
      urgencyLabel = "Closing This Week";
      urgencyColor = "text-amber-300 bg-amber-500/10 border-amber-500/25";
      UrgencyIcon = Clock;
    } else {
      urgencyLevel = "upcoming";
      urgencyLabel = deadlineDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      urgencyColor = "text-zinc-300 bg-zinc-900/90 border-zinc-800";
      UrgencyIcon = Calendar;
    }
  }

  return (
    <SpatialCard3D
      depth={6}
      elevationZ={14}
      glowColor="rgba(99, 102, 241, 0.16)"
      className="h-full"
    >
      <article
        data-urgency={urgencyLevel}
        aria-label={`Opportunity: ${opportunity.title}`}
        className="group rounded-3xl bg-zinc-950/85 border border-zinc-800/80 hover:border-indigo-500/50 p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 shadow-xl relative overflow-hidden backdrop-blur-xl h-full preserve-3d"
      >
        {/* Top Border Specular Illumination */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/80 transition-all duration-500 pointer-events-none" />

        <div className="space-y-4 relative z-10 preserve-3d">
          {/* Header Row: Category Badge, Organizer Verification & Bookmark Action */}
          <div
            style={{ transform: "translateZ(20px)" }}
            className="flex items-center justify-between gap-2 flex-wrap preserve-3d"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <OpportunityTypeBadge type={opportunity.type} />
              {opportunity.club && (
                <VerificationBadge
                  status={opportunity.club.verificationStatus}
                  showIcon={false}
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <BookmarkButton
                opportunityId={opportunity.id}
                initialIsSaved={initialIsSaved}
              />
            </div>
          </div>

          {/* Organizer Brand Info */}
          {opportunity.club && (
            <div
              style={{ transform: "translateZ(14px)" }}
              className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono"
            >
              <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="text-zinc-500 text-[11px]">by</span>
              <Link
                href={`/clubs/${opportunity.club.slug || opportunity.club.id}`}
                className="text-zinc-300 hover:text-indigo-300 font-medium transition-colors truncate max-w-[200px]"
              >
                {opportunity.club.name}
              </Link>
            </div>
          )}

          {/* Title (Dominant visual hierarchy) */}
          <div style={{ transform: "translateZ(22px)" }} className="space-y-1.5">
            <Link
              href={`/opportunities/${opportunity.slug}`}
              className="block group/title focus:outline-none"
            >
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 group-hover/title:text-indigo-300 transition-colors line-clamp-2 leading-snug font-sans">
                {opportunity.title}
              </h3>
            </Link>

            {opportunity.summary && (
              <p className="text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed font-sans">
                {opportunity.summary}
              </p>
            )}
          </div>

          {/* Relevance & Match Breakdown Strip (If Available) */}
          {relevance && relevance.totalScore > 0 && (
            <div
              style={{ transform: "translateZ(18px)" }}
              className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <AnimatedMatchBadge
                  relevance={relevance}
                  opportunity={opportunity}
                />

                {relevance.isDepartmentEligible && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Dept Eligible</span>
                  </span>
                )}
              </div>

              {/* Match Rationale Highlights */}
              {relevance.rationale.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {relevance.rationale.slice(0, 2).map((reason, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-indigo-500/10 text-indigo-300/90 border border-indigo-500/20 truncate max-w-[260px]"
                    >
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skills & Eligibility Chips */}
          {opportunity.requiredSkills.length > 0 && (
            <div
              style={{ transform: "translateZ(14px)" }}
              className="flex flex-wrap gap-1.5 pt-0.5 preserve-3d"
            >
              {opportunity.requiredSkills.slice(0, 3).map((skill) => {
                const isMatched = relevance?.matchedSkills.includes(skill);
                return (
                  <span
                    key={skill}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-colors ${
                      isMatched
                        ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30 font-semibold"
                        : "bg-zinc-900/80 text-zinc-400 border-zinc-800"
                    }`}
                  >
                    {skill}
                  </span>
                );
              })}
              {opportunity.requiredSkills.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-mono text-zinc-500">
                  +{opportunity.requiredSkills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Meta & Actions */}
        <div
          style={{ transform: "translateZ(24px)" }}
          className="pt-4 mt-4 border-t border-zinc-800/70 flex items-center justify-between gap-2 relative z-10 preserve-3d"
        >
          {/* Urgency Badge & Location Mode */}
          <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${urgencyColor}`}
            >
              <UrgencyIcon className="w-3 h-3 shrink-0" />
              <span>{urgencyLabel}</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-zinc-400">
              <MapPin className="w-3 h-3 text-zinc-500" />
              <span className="capitalize">
                {opportunity.locationType.replace("_", " ")}
              </span>
            </span>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-1.5">
            {onSelectDetail && (
              <button
                type="button"
                onClick={() => onSelectDetail(opportunity)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                Preview
              </button>
            )}

            <Link
              href={`/opportunities/${opportunity.slug}`}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500 text-xs font-mono font-medium transition-all shadow-sm group-hover:translate-x-0.5"
            >
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </article>
    </SpatialCard3D>
  );
}
