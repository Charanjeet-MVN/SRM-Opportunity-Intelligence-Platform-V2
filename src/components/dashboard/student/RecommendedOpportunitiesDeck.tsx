"use client";

import React from "react";
import Link from "next/link";
import { Opportunity } from "@/types";
import OpportunityTypeBadge from "@/components/opportunities/OpportunityTypeBadge";
import BookmarkButton from "@/components/opportunities/BookmarkButton";
import {
  Sparkles,
  ArrowRight,
  Building2,
} from "lucide-react";
import SpatialCard3D from "@/components/3d/SpatialCard3D";

interface RecommendedOpportunitiesDeckProps {
  recommendations: (Opportunity & { aiExplanation?: string; relevanceScore?: number })[];
}

export default function RecommendedOpportunitiesDeck({
  recommendations,
}: RecommendedOpportunitiesDeckProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/25">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Opportunity Intelligence Fit</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            Recommended Opportunities For Your Vector
          </h2>
        </div>

        <Link
          href="/opportunities"
          className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <span>Explore All Matches</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Cards Grid with Spatial 3D effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendations.slice(0, 3).map((rec) => {
          return (
            <SpatialCard3D
              key={rec.id}
              depth={6}
              elevationZ={15}
              glowColor="rgba(168, 85, 247, 0.2)"
              className="h-full"
            >
              <div className="group rounded-3xl bg-zinc-950/85 border border-purple-500/25 hover:border-purple-500/50 p-6 flex flex-col justify-between transition-all duration-300 shadow-2xl backdrop-blur-xl h-full space-y-4 relative overflow-hidden">
                {/* Specular illumination */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/0 to-transparent group-hover:via-purple-500/70 transition-all duration-500" />

                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <OpportunityTypeBadge type={rec.type} />
                    <BookmarkButton opportunityId={rec.id} />
                  </div>

                  {/* AI Explanation Pill */}
                  {rec.aiExplanation && (
                    <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-mono flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">{rec.aiExplanation}</span>
                    </div>
                  )}

                  {/* Title */}
                  <Link href={`/opportunities/${rec.slug}`}>
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                      {rec.title}
                    </h3>
                  </Link>

                  {/* Summary */}
                  {rec.summary && (
                    <p className="text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed">
                      {rec.summary}
                    </p>
                  )}

                  {/* Required Skills */}
                  {rec.requiredSkills && rec.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rec.requiredSkills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {rec.requiredSkills.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-500">
                          +{rec.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-zinc-800/70 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-zinc-400 truncate max-w-[150px]">
                    <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{rec.club?.name || "SRM Organization"}</span>
                  </div>

                  <Link
                    href={`/opportunities/${rec.slug}`}
                    className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 group/btn shrink-0"
                  >
                    <span>View Match</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </SpatialCard3D>
          );
        })}
      </div>
    </div>
  );
}
