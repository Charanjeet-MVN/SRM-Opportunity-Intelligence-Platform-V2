"use client";

import React, { useState, useRef } from "react";
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
  onSelectDetail?: (opp: Opportunity) => void;
}

export default function OpportunityCard({
  opportunity,
  relevance,
  initialIsSaved = false,
  onSelectDetail,
}: OpportunityCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const isDeadlinePassed = opportunity.applicationDeadline
    ? new Date(opportunity.applicationDeadline) < new Date()
    : false;

  const isClosingSoon =
    opportunity.applicationDeadline && !isDeadlinePassed
      ? new Date(opportunity.applicationDeadline).getTime() - new Date().getTime() <
        3 * 24 * 60 * 60 * 1000
      : false;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Restrained 3D tilt (max 4 deg)
    const rotX = -((y - centerY) / centerY) * 4;
    const rotY = ((x - centerX) / centerX) * 4;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    if (onSelectDetail) {
      onSelectDetail(opportunity);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      className={`group rounded-3xl bg-zinc-900/50 border border-zinc-800/80 hover:border-indigo-500/50 p-6 flex flex-col justify-between transition-colors duration-300 shadow-xl hover:shadow-2xl hover:shadow-indigo-950/40 relative overflow-hidden ${
        onSelectDetail ? "cursor-pointer" : ""
      }`}
    >
      {/* Top Border Illumination Line on Hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/80 transition-all duration-500" />

      <div className="space-y-4 relative z-10">
        {/* Header Badges & Bookmark */}
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
              <span className="text-zinc-200 font-semibold">{opportunity.club.name}</span>
            </div>
          )}
        </div>

        {/* Summary */}
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
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-colors ${
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
              <span className="px-2 py-1 rounded-lg text-[10px] font-mono text-zinc-500">
                +{opportunity.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Meta Row */}
      <div className="pt-4 mt-5 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 relative z-10">
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
          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium text-xs group-hover:translate-x-0.5 transition-all cursor-pointer font-mono"
        >
          <span>Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
