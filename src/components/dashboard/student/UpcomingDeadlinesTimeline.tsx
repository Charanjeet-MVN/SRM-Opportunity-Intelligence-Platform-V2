"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrackerOpportunity } from "@/components/opportunities/StudentOpportunityTracker";
import {
  Clock,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Flame,
} from "lucide-react";
import { getDeadlineUrgency } from "@/lib/notifications/urgency";

interface UpcomingDeadlinesTimelineProps {
  trackedOpportunities: TrackerOpportunity[];
}

export default function UpcomingDeadlinesTimeline({
  trackedOpportunities,
}: UpcomingDeadlinesTimelineProps) {
  // Filter items that have deadlines and calculate urgency
  const now = new Date();
  const deadlineItems = trackedOpportunities
    .filter((opp) => opp.applicationDeadline)
    .map((opp) => ({
      ...opp,
      urgency: getDeadlineUrgency(opp.applicationDeadline),
      deadlineDate: new Date(opp.applicationDeadline!),
    }))
    .filter((opp) => opp.deadlineDate.getTime() > now.getTime() && opp.urgency.status !== "expired")
    .sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime())
    .slice(0, 5);

  return (
    <div className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 relative overflow-hidden h-full flex flex-col justify-between">
      {/* Background Radial Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-[90px] rounded-full pointer-events-none" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-zinc-800/70 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/25">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Deadline Intelligence</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              Action Required
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Impending closing dates across your tracked listings.
            </p>
          </div>

          <Link
            href="/dashboard/student/calendar"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-mono font-medium text-amber-400 hover:text-amber-300 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span>View all deadlines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Deadline Items List */}
        {deadlineItems.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col items-center justify-center text-center space-y-3 relative z-10 py-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h3 className="text-sm font-bold text-zinc-100">You are all caught up!</h3>
              <p className="text-xs text-zinc-400 font-light">
                No impending deadlines requiring immediate attention right now.
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
            {deadlineItems.map((item, idx) => {
              const diffMs = item.deadlineDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              const isDueToday = diffDays <= 1 || item.urgency.status === "due_today";
              const isDueTomorrow = diffDays === 2 || item.urgency.status === "due_tomorrow";
              const isUrgent = diffDays <= 3;

              let tierLabel = "UPCOMING";
              let tierColor = "bg-sky-500/10 text-sky-300 border-sky-500/25";
              if (isDueToday) {
                tierLabel = "CRITICAL";
                tierColor = "bg-rose-500/15 text-rose-300 border-rose-500/35 animate-pulse";
              } else if (isDueTomorrow || isUrgent) {
                tierLabel = "URGENT";
                tierColor = "bg-amber-500/15 text-amber-300 border-amber-500/35";
              }

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.25 }}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-2.5 relative overflow-hidden group ${
                    isDueToday
                      ? "bg-rose-950/20 border-rose-500/35 hover:border-rose-500/60"
                      : isUrgent
                      ? "bg-amber-950/15 border-amber-500/30 hover:border-amber-500/50"
                      : "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  {/* Left urgency indicator strip */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      isDueToday
                        ? "bg-rose-500"
                        : isUrgent
                        ? "bg-amber-400"
                        : "bg-indigo-500/50"
                    }`}
                  />

                  <div className="flex items-center justify-between gap-2 flex-wrap pl-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${tierColor}`}
                      >
                        {tierLabel}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                        {isDueToday ? (
                          <Flame className="w-3 h-3 text-rose-400" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{item.urgency.label}</span>
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      {item.type.replace("_", " ")}
                    </span>
                  </div>

                  <div className="pl-1.5 space-y-1">
                    <Link href={`/opportunities/${item.slug}`}>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-1 leading-snug">
                        {item.title}
                      </h4>
                    </Link>
                    <p className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span>
                        {item.deadlineDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="truncate max-w-[130px] text-zinc-400">
                        {item.club?.name || "SRM Organization"}
                      </span>
                    </p>
                  </div>

                  <div className="pl-1.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-zinc-500">
                      {diffDays <= 0 ? "Closing today" : `${diffDays} days remaining`}
                    </span>

                    <Link
                      href={`/opportunities/${item.slug}`}
                      className="text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1 group/btn"
                    >
                      <span>View & Apply</span>
                      <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subtle Footer Note */}
      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono text-zinc-500 relative z-10">
        <span>Calendar Sync: Automatic</span>
        <Link
          href="/dashboard/student/calendar"
          className="text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          Full Timeline →
        </Link>
      </div>
    </div>
  );
}
