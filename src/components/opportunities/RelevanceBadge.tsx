"use client";

import React, { useState } from "react";
import { RelevanceScoreResult } from "@/lib/relevance/scoring";
import { Sparkles, CheckCircle2, ChevronDown } from "lucide-react";

interface RelevanceBadgeProps {
  relevance: RelevanceScoreResult;
}

export default function RelevanceBadge({ relevance }: RelevanceBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    if (score >= 60) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    if (score >= 40) return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    return "bg-zinc-800 text-zinc-400 border-zinc-700";
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all cursor-pointer ${getScoreColor(
          relevance.totalScore
        )} hover:opacity-80`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{relevance.totalScore}% Match</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover Breakdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-xl bg-zinc-900 border border-zinc-800 p-4 shadow-xl z-30 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200">Relevance Rationale</span>
            <span className="font-mono text-purple-400 font-medium">{relevance.totalScore}% Score</span>
          </div>

          <div className="space-y-1.5">
            {relevance.rationale.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>

          {relevance.missingSkills.length > 0 && (
            <div className="pt-2 border-t border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">Skills to Learn:</span>
              <div className="flex flex-wrap gap-1">
                {relevance.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 text-[10px]"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
