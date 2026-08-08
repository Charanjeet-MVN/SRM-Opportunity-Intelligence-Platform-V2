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
import { Calendar, MapPin, ArrowRight, Clock } from "lucide-react";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="group rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-purple-500/40 p-6 flex flex-col justify-between transition-all duration-200 shadow-lg hover:shadow-2xl hover:shadow-purple-500/5 relative"
    >
      <div className="space-y-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
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
          <Link href={`/opportunities/${opportunity.slug}`} className="block group">
            <h3 className="text-base font-semibold text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
              {opportunity.title}
            </h3>
          </Link>
          {opportunity.club && (
            <p className="text-xs text-zinc-400 font-medium flex items-center gap-1">
              <span>by</span>
              <span className="text-zinc-300">{opportunity.club.name}</span>
            </p>
          )}
        </div>

        {/* Summary */}
        {opportunity.summary && (
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {opportunity.summary}
          </p>
        )}

        {/* Skill Vector Chips */}
        {opportunity.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {opportunity.requiredSkills.slice(0, 4).map((skill) => {
              const isMatched = relevance?.matchedSkills.includes(skill);
              return (
                <span
                  key={skill}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-colors ${
                    isMatched
                      ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                      : "bg-zinc-950 text-zinc-400 border-zinc-800"
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
      <div className="pt-5 mt-5 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
            <span className="capitalize">{opportunity.locationType.replace("_", " ")}</span>
          </span>

          {opportunity.applicationDeadline && (
            <span className={`flex items-center gap-1 ${isDeadlinePassed ? "text-red-400" : "text-zinc-400"}`}>
              <Clock className="w-3.5 h-3.5" />
              {isDeadlinePassed ? "Expired" : new Date(opportunity.applicationDeadline).toLocaleDateString()}
            </span>
          )}
        </div>

        <Link
          href={`/opportunities/${opportunity.slug}`}
          className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium text-xs group-hover:translate-x-0.5 transition-all"
        >
          <span>Evaluate Fit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
