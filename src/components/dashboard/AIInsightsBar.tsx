import React from "react";
import { generateAIStudentOverview } from "@/lib/ai/recommendations";
import { Opportunity, StudentProfile } from "@/types";
import { RelevanceScoreResult } from "@/lib/relevance/scoring";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AIInsightsBarProps {
  profile: StudentProfile | null;
  opportunities: (Opportunity & { relevance: RelevanceScoreResult })[];
}

export default function AIInsightsBar({ profile, opportunities }: AIInsightsBarProps) {
  const overview = generateAIStudentOverview(profile, opportunities);

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/30 via-zinc-900 to-indigo-950/30 border border-purple-500/20 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Personalized Intelligence Briefing
          </div>
          <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">
            {overview.headline}
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            {overview.summary}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right font-mono text-xs hidden sm:block">
            <span className="block text-purple-400 font-bold text-sm">
              {overview.topOpportunitiesCount} High Fit
            </span>
            <span className="text-[10px] text-zinc-500">
              {overview.urgentCount} Closing Soon
            </span>
          </div>

          <Link
            href="/opportunities"
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/20 transition-all inline-flex items-center gap-1.5"
          >
            <span>View Prioritized Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
