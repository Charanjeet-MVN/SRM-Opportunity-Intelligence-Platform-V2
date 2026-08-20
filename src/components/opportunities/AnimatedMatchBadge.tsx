"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RelevanceScoreResult } from "@/lib/relevance/scoring";
import { generateAIOpportunityAnalysis } from "@/lib/ai/recommendations";
import { Opportunity, StudentProfile } from "@/types";
import { Sparkles, CheckCircle2, Zap, ChevronDown } from "lucide-react";

interface AnimatedMatchBadgeProps {
  relevance: RelevanceScoreResult;
  opportunity: Opportunity;
  profile?: StudentProfile | null;
}

export default function AnimatedMatchBadge({
  relevance,
  opportunity,
  profile,
}: AnimatedMatchBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const analysis = generateAIOpportunityAnalysis(profile, opportunity, relevance);

  const getScoreTheme = (score: number) => {
    if (score >= 80) {
      return {
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        border: "border-purple-500/30 hover:border-purple-500/60",
        ring: "stroke-purple-500",
        glow: "shadow-purple-500/20",
        label: "Exceptional Match",
      };
    }
    if (score >= 60) {
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/30 hover:border-emerald-500/60",
        ring: "stroke-emerald-500",
        glow: "shadow-emerald-500/20",
        label: "Strong Fit",
      };
    }
    if (score >= 40) {
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/30 hover:border-blue-500/60",
        ring: "stroke-blue-500",
        glow: "shadow-blue-500/20",
        label: "Moderate Fit",
      };
    }
    return {
      bg: "bg-zinc-800/80",
      text: "text-zinc-400",
      border: "border-zinc-700 hover:border-zinc-600",
      ring: "stroke-zinc-500",
      glow: "shadow-zinc-500/10",
      label: "Open Fit",
    };
  };

  const theme = getScoreTheme(relevance.totalScore);

  return (
    <div className="relative inline-block text-left">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border transition-all cursor-pointer shadow-sm ${theme.bg} ${theme.text} ${theme.border} ${theme.glow}`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span className="font-bold">{relevance.totalScore}% Match</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3 h-3 opacity-75" />
        </motion.div>
      </motion.button>

      {/* AI Match Intelligence Modal Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 mt-2 w-80 rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 p-4 shadow-2xl z-40 space-y-3.5 text-xs text-zinc-200"
          >
            {/* Header Rationale */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${theme.bg} border ${theme.border}`} />
                <span className="font-semibold text-zinc-100">{analysis.headline}</span>
              </div>
              <span className="font-mono text-purple-400 font-bold">{relevance.totalScore}% Vector</span>
            </div>

            {/* AI Insights List */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider block">
                Match Rationale
              </span>
              {relevance.rationale.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-tight text-[11px]">{reason}</span>
                </div>
              ))}
            </div>

            {/* Strategic AI Advice */}
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="flex items-center gap-1 text-purple-400 font-mono text-[10px]">
                <Zap className="w-3 h-3" />
                <span>AI Recommendation</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-snug">
                {analysis.strategicAdvice}
              </p>
            </div>

            {/* Skill Gaps if any */}
            {relevance.missingSkills.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider block">
                  Recommended Skill Additions:
                </span>
                <div className="flex flex-wrap gap-1">
                  {relevance.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px] font-mono"
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
