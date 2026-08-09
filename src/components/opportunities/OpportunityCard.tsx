"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Opportunity } from "@/types";
import OpportunityTypeBadge from "./OpportunityTypeBadge";
import VerificationBadge from "../clubs/VerificationBadge";
import AnimatedMatchBadge from "./AnimatedMatchBadge";
import BookmarkButton from "./BookmarkButton";
import { RelevanceScoreResult } from "@/lib/relevance/scoring";
import { MapPin, ArrowRight, Clock } from "lucide-react";

interface OpportunityCardProps {
  opportunity: Opportunity;
  relevance?: RelevanceScoreResult;
  initialIsSaved?: boolean;
}

export default function OpportunityCard({
  opportunity,
  relevance,
  initialIsSaved = false,
}: OpportunityCardProps) {
  const isDeadlinePassed = opportunity.applicationDeadline
    ? new Date(opportunity.applicationDeadline) < new Date()
    : false;

  const isClosingSoon = opportunity.applicationDeadline && !isDeadlinePassed
    ? (new Date(opportunity.applicationDeadline).getTime() - new Date().getTime()) < 3 * 24 * 60 * 60 * 1000
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="group rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-indigo-500/40 p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 shadow-lg hover:shadow-2xl hover:shadow-indigo-950/20 relative overflow-hidden"
    >
      {/* Top Subtle Gradient Hover Accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/60 transition-all duration-300" />

      <div className="space-y-3.5">
        {/* Header Badges & Actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <OpportunityTypeBadge type={opportunity.type} />
            {relevance && (
              <AnimatedMatchBadge relevance={relevance} opportunity={opportunity} />
            )}
          </div>
          <div className="flex items-center gap-2">
            {opportunity.club && (
              <VerificationBadge status={opportunity.club.verificationStatus} showIcon={false} />
            )}
            <BookmarkButton opportunityId={opportunity.id} initialIsSaved={initialIsSaved} />
          </div>
        </div>

        {/* Title & Publisher */}
        <div className="space-y-1">
          <Link href={`/opportunities/${opportunity.slug}`} className="block group/link">
            <h3 className="text-base font-semibold text-zinc-100 group-hover/link:text-indigo-300 transition-colors line-clamp-2 leading-snug">
              {opportunity.title}
            </h3>
          </Link>
          {opportunity.club && (
            <div className="text-xs text-zinc-400 font-medium flex items-center gap-1">
              <span>by</span>
              <span className="text-zinc-200 font-medium">{opportunity.club.name}</span>
            </div>
          )}
        </div>

        {/* Summary Description */}
        {opportunity.summary && (
          <p className="text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed">
            {opportunity.summary}
          </p>
        )}

        {/* Skill Chips */}
        {opportunity.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {opportunity.requiredSkills.slice(0, 4).map((skill) => {
              const isMatched = relevance?.matchedSkills.includes(skill);
              return (
                <span
                  key={skill}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-colors ${
                    isMatched
                      ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30 font-semibold"
                      : "bg-zinc-950/80 text-zinc-400 border-zinc-800"
                  }`}
                >
                  {skill}
                </span>
              );
            })}
            {opportunity.requiredSkills.length > 4 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono text-zinc-500">
                +{opportunity.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Meta Row */}
      <div className="pt-4 mt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
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
                  ? "text-amber-400 font-semibold"
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

        <Link
          href={`/opportunities/${opportunity.slug}`}
          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium text-xs group-hover:translate-x-0.5 transition-all"
        >
          <span>Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
