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
  ChevronRight,
  Flame,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { getDeadlineUrgency } from "@/lib/notifications/urgency";

interface UpcomingDeadlinesTimelineProps {
  trackedOpportunities: TrackerOpportunity[];
}

export default function UpcomingDeadlinesTimeline({
  trackedOpportunities,
}: UpcomingDeadlinesTimelineProps) {
  // Filter items that have deadlines and calculate urgency
  const deadlineItems = trackedOpportunities
    .filter((opp) => opp.applicationDeadline)
    .map((opp) => ({
      ...opp,
      urgency: getDeadlineUrgency(opp.applicationDeadline),
      deadlineDate: new Date(opp.applicationDeadline!),
    }))
    .filter((opp) => opp.urgency.status !== "expired")
    .sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime());

  return (
    <div className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-[90px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-zinc-800/70 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/25">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Deadline Intelligence Radar</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
            Approaching Deadlines & Attention Center
          </h2>
          <p className="text-xs text-zinc-400 font-mono">
            Real-time urgency radar across your saved applications and tracked opportunities.
          </p>
        </div>

        <Link
          href="/dashboard/student/calendar"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-mono font-medium text-amber-400 hover:text-amber-300 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <span>Calendar Timeline View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Deadline Items List */}
      {deadlineItems.length === 0 ? (
        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">You are all caught up!</h3>
              <p className="text-xs text-zinc-400 font-light">
                Zero impending deadlines requiring attention on your tracked opportunities right now.
              </p>
            </div>
          </div>

          <Link
            href="/opportunities"
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-indigo-300 flex items-center gap-1.5 transition-colors shrink-0"
          >
            <span>Explore Opportunities</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {deadlineItems.slice(0, 6).map((item, idx) => {
            const isDueToday = item.urgency.status === "due_today";
            const isDueTomorrow = item.urgency.status === "due_tomorrow";
            const isUrgent = item.urgency.daysLeft !== null && item.urgency.daysLeft <= 3;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                whileHover={{ y: -3, scale: 1.01 }}
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 relative group overflow-hidden ${
                  isDueToday
                    ? "bg-gradient-to-b from-rose-950/25 to-zinc-950 border-rose-500/40 shadow-lg shadow-rose-500/10"
                    : isDueTomorrow
                    ? "bg-gradient-to-b from-amber-950/20 to-zinc-950 border-amber-500/35 hover:border-amber-500/50 shadow-md"
                    : isUrgent
                    ? "bg-zinc-900/70 border-amber-500/25 hover:border-amber-500/40"
                    : "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                {/* Visual Priority Glow Indicator Stripe */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isDueToday
                      ? "bg-rose-500"
                      : isDueTomorrow
                      ? "bg-amber-400"
                      : isUrgent
                      ? "bg-amber-500/60"
                      : "bg-indigo-500/40"
                  }`}
                />

                <div className="space-y-2.5 pt-1">
                  {/* Status Pill & Type */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1.5 ${
                        isDueToday
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                          : isDueTomorrow
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : isUrgent
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-zinc-800/80 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      {isDueToday ? (
                        <Flame className="w-3 h-3 text-rose-400" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-400" />
                      )}
                      <span>{item.urgency.label}</span>
                    </span>

                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-medium">
                      {item.type.replace("_", " ")}
                    </span>
                  </div>

                  {/* Title */}
                  <Link href={`/opportunities/${item.slug}`}>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-100 hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </Link>

                  {/* Exact Date */}
                  <p className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>
                      {item.deadlineDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </p>
                </div>

                {/* Bottom Bar: Club Name + CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-850/70 text-xs font-mono">
                  <span className="text-zinc-400 truncate max-w-[140px] text-[11px]">
                    {item.club?.name || "SRM Organization"}
                  </span>
                  <Link
                    href={`/opportunities/${item.slug}`}
                    className="text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1 shrink-0 group/link"
                  >
                    <span>View & Apply</span>
                    <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
