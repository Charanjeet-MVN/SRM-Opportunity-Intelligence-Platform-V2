"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { TrackerOpportunity } from "@/components/opportunities/StudentOpportunityTracker";
import {
  Activity,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

interface ActivitySnapshotWidgetProps {
  savedOpportunities: TrackerOpportunity[];
  registeredOpportunities: TrackerOpportunity[];
}

export default function ActivitySnapshotWidget({
  savedOpportunities,
  registeredOpportunities,
}: ActivitySnapshotWidgetProps) {
  const activities = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      clubName: string;
      actionType: "saved" | "registered" | "attended";
      description: string;
      date: Date;
      timeStr: string;
      slug: string;
    }> = [];

    // Registered entries
    registeredOpportunities.forEach((reg) => {
      const date = reg.registeredAt ? new Date(reg.registeredAt) : new Date();
      list.push({
        id: `reg-${reg.id}`,
        title: reg.title,
        clubName: reg.club?.name || "SRM Organization",
        actionType: reg.registrationStatus === "attended" ? "attended" : "registered",
        description:
          reg.registrationStatus === "attended"
            ? "Completed participation / attendance recorded."
            : `Confirmed attendee registration (${reg.notes || "Applied"}).`,
        date,
        timeStr: reg.registeredAt
          ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "Recent",
        slug: reg.slug,
      });
    });

    // Saved entries
    savedOpportunities.forEach((saved) => {
      const date = saved.savedAt ? new Date(saved.savedAt) : new Date();
      list.push({
        id: `saved-${saved.id}`,
        title: saved.title,
        clubName: saved.club?.name || "SRM Organization",
        actionType: "saved",
        description: "Added to your personal opportunity radar for review.",
        date,
        timeStr: saved.savedAt
          ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "Recent",
        slug: saved.slug,
      });
    });

    // Sort newest first
    return list.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 4);
  }, [savedOpportunities, registeredOpportunities]);

  return (
    <div className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 relative overflow-hidden h-full flex flex-col justify-between">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-600/5 blur-[90px] rounded-full pointer-events-none" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-zinc-800/70 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Activity Snapshot</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              Recent Activity
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Genuine history of your bookmarks, submissions, and events.
            </p>
          </div>

          <Link
            href="/dashboard/student/registrations"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-mono font-medium text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span>View all activity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Activity Items */}
        {activities.length === 0 ? (
          <div className="py-10 px-4 text-center space-y-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="space-y-1 max-w-xs mx-auto">
              <h3 className="text-sm font-semibold text-zinc-200">No recent activity</h3>
              <p className="text-xs text-zinc-400 font-light">
                Start bookmarking and applying to opportunities to build your activity history.
              </p>
            </div>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-indigo-300 transition-colors"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3 relative z-10">
            {activities.map((act) => {
              const isReg = act.actionType === "registered" || act.actionType === "attended";
              const Icon = isReg ? CheckCircle2 : Bookmark;

              return (
                <Link
                  key={act.id}
                  href={`/opportunities/${act.slug}`}
                  className="block p-3.5 sm:p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-indigo-500/30 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                        isReg
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors truncate">
                          {act.title}
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                          {act.timeStr}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 font-light leading-snug line-clamp-1">
                        {act.description}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-zinc-500">
                        <span>{act.clubName}</span>
                        <span className="text-indigo-400 group-hover:underline inline-flex items-center gap-0.5">
                          View details <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono text-zinc-500 relative z-10">
        <span>Verified Log: Real-time</span>
        <Link
          href="/dashboard/student/registrations"
          className="text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          My Submissions →
        </Link>
      </div>
    </div>
  );
}
