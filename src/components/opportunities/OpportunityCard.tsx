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
import { MapPin, ArrowRight, Clock } from "lucide-react";

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
  const isDeadlinePassed = opportunity.applicationDeadline
    ? new Date(opportunity.applicationDeadline) < new Date()
    : false;

  const isClosingSoon =
    opportunity.applicationDeadline && !isDeadlinePassed
      ? new Date(opportunity.applicationDeadline).getTime() - new Date().getTime() <
        3 * 24 * 60 * 60 * 1000
      : false;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    if (onSelectDetail) {
      onSelectDetail(opportunity);
    }
  };

  return (
    <SpatialCard3D
      depth={8}
      elevationZ={20}
      glowColor="rgba(99, 102, 241, 0.18)"
      className={`h-full ${onSelectDetail ? "cursor-pointer" : ""}`}
    >
      <div
        onClick={handleCardClick}
        className="group rounded-3xl bg-zinc-950/80 border border-zinc-800/80 hover:border-indigo-500/50 p-6 flex flex-col justify-between transition-colors duration-300 shadow-xl relative overflow-hidden backdrop-blur-xl h-full preserve-3d"
      >
        {/* Top Border Specular Illumination */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/80 transition-all duration-500 pointer-events-none" />

        <div className="space-y-4 relative z-10 preserve-3d">
          {/* Header Badges & Bookmark (Elevated in 3D space) */}
          <div
            style={{ transform: "translateZ(28px)" }}
            className="flex items-center justify-between gap-2 flex-wrap preserve-3d"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <OpportunityTypeBadge type={opportunity.type} />
              {relevance && (
                <div style={{ transform: "translateZ(10px)" }}>
                  <AnimatedMatchBadge relevance={relevance} opportunity={opportunity} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {opportunity.club && (
                <VerificationBadge status={opportunity.club.verificationStatus} showIcon={false} />
              )}
              <BookmarkButton opportunityId={opportunity.id} initialIsSaved={initialIsSaved} />
            </div>
          </div>

          {/* Title & Publisher (Layer 2 Z-Depth) */}
          <div style={{ transform: "translateZ(18px)" }} className="space-y-1">
            <button
              onClick={() => onSelectDetail && onSelectDetail(opportunity)}
              className="text-left block w-full group/title focus:outline-none"
            >
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 group-hover/title:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                {opportunity.title}
              </h3>
            </button>

            {opportunity.club && (
              <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 pt-0.5">
                <span>by</span>
                <Link
                  href={`/clubs/${opportunity.club.slug || opportunity.club.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-zinc-200 hover:text-purple-300 font-semibold transition-colors underline decoration-zinc-700 underline-offset-2"
                >
                  {opportunity.club.name}
                </Link>
              </div>
            )}
          </div>

          {/* Summary */}
          {opportunity.summary && (
            <p
              style={{ transform: "translateZ(12px)" }}
              className="text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed"
            >
              {opportunity.summary}
            </p>
          )}

          {/* Skill Chips (Layer 3 Z-Depth) */}
          {opportunity.requiredSkills.length > 0 && (
            <div
              style={{ transform: "translateZ(22px)" }}
              className="flex flex-wrap gap-1.5 pt-1 preserve-3d"
            >
              {opportunity.requiredSkills.slice(0, 4).map((skill) => {
                const isMatched = relevance?.matchedSkills.includes(skill);
                return (
                  <span
                    key={skill}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-colors ${
                      isMatched
                        ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30 font-semibold shadow-sm"
                        : "bg-zinc-900/90 text-zinc-400 border-zinc-800"
                    }`}
                  >
                    {skill}
                  </span>
                );
              })}
              {opportunity.requiredSkills.length > 4 && (
                <span className="px-2 py-1 rounded-lg text-[10px] font-mono text-zinc-500">
                  +{opportunity.requiredSkills.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Meta Row (Layer 4 Z-Depth) */}
        <div
          style={{ transform: "translateZ(26px)" }}
          className="pt-4 mt-5 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 relative z-10 preserve-3d"
        >
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <span className="capitalize">{opportunity.locationType.replace("_", " ")}</span>
            </span>

            {opportunity.applicationDeadline && (
              <span
                className={`flex items-center gap-1 ${
                  isDeadlinePassed
                    ? "text-red-400"
                    : isClosingSoon
                    ? "text-amber-400 font-semibold animate-pulse"
                    : "text-zinc-400"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {isDeadlinePassed
                  ? "Expired"
                  : new Date(opportunity.applicationDeadline).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
              </span>
            )}
          </div>

          <button
            onClick={() => onSelectDetail && onSelectDetail(opportunity)}
            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium text-xs group-hover:translate-x-1 transition-all cursor-pointer font-mono"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </SpatialCard3D>
  );
}
