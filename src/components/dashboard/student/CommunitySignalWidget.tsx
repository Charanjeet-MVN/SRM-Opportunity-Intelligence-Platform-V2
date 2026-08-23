"use client";

import React from "react";
import Link from "next/link";
import { Opportunity } from "@/types";
import OpportunityTypeBadge from "@/components/opportunities/OpportunityTypeBadge";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import {
  Users,
  Building2,
  ArrowRight,
  Sparkles,
  Calendar,
  ChevronRight,
} from "lucide-react";

interface CommunitySignalWidgetProps {
  recentOpportunities: Opportunity[];
}

export default function CommunitySignalWidget({
  recentOpportunities,
}: CommunitySignalWidgetProps) {
  const signalItems = recentOpportunities.slice(0, 4);

  return (
    <div className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 relative overflow-hidden h-full flex flex-col justify-between">
      {/* Background Radial Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/5 blur-[90px] rounded-full pointer-events-none" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-zinc-800/70 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Campus Community Signal</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              Club Dispatches & Listings
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Newly published opportunities from official SRM technical & cultural clubs.
            </p>
          </div>

          <Link
            href="/clubs"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-mono font-medium text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span>Explore Clubs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Signals List */}
        {signalItems.length === 0 ? (
          <div className="py-10 px-4 text-center space-y-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-1 max-w-xs mx-auto">
              <h3 className="text-sm font-semibold text-zinc-200">No active club dispatches</h3>
              <p className="text-xs text-zinc-400 font-light">
                Verified SRM clubs post opportunities regularly. Explore registered clubs in the meantime.
              </p>
            </div>
            <Link
              href="/clubs"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-emerald-300 transition-colors"
            >
              <span>View Club Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3 relative z-10">
            {signalItems.map((item) => {
              const dateStr = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "New";

              return (
                <Link
                  key={item.id}
                  href={`/opportunities/${item.slug}`}
                  className="block p-3.5 sm:p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-emerald-500/30 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <OpportunityTypeBadge type={item.type} />
                        {item.club && (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                            <span className="truncate max-w-[140px]">{item.club.name}</span>
                            <VerificationBadge status={item.club.verificationStatus} showIcon={false} />
                          </div>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                        {item.title}
                      </h4>

                      {item.summary && (
                        <p className="text-[11px] text-zinc-400 font-light line-clamp-1">
                          {item.summary}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 block">
                        {dateStr}
                      </span>
                      <span className="text-emerald-400 group-hover:underline inline-flex items-center gap-0.5 text-xs font-mono font-medium">
                        View <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono text-zinc-500 relative z-10">
        <span>Verified Campus Network</span>
        <Link href="/clubs" className="text-zinc-400 hover:text-zinc-200 transition-colors">
          All Organizations →
        </Link>
      </div>
    </div>
  );
}
