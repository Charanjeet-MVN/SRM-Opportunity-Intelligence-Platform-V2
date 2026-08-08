import React from "react";
import Link from "next/link";
import { getStudentTimelineAction } from "@/lib/engagement/actions";
import { Calendar, Clock, AlertTriangle, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default async function StudentCalendarPage() {
  const { events, error } = await getStudentTimelineAction();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-emerald-950/30 border border-zinc-800/80 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Calendar className="w-3.5 h-3.5" />
          Personal Campus Schedule
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          Impending Deadlines & Timeline
        </h1>
        <p className="text-xs text-zinc-400 max-w-xl">
          Chronological milestone schedule aggregating deadlines and event start times for your saved opportunities.
        </p>
      </div>

      {/* Timeline List or Zero State */}
      {events.length === 0 ? (
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-zinc-200">No Impending Deadlines</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You haven&apos;t bookmarked any opportunities with active deadlines yet. Browse the opportunity feed to populate your personal timeline.
            </p>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-all"
          >
            <span>Explore Opportunities Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
          {events.map((evt) => {
            const isPast = new Date(evt.date) < new Date();

            return (
              <div key={evt.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border flex items-center justify-center ${
                    evt.type === "deadline"
                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      evt.type === "deadline" ? "bg-red-400" : "bg-emerald-400"
                    }`}
                  />
                </div>

                <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                        {evt.opportunityType.replace("_", " ")}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">by {evt.clubName}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-zinc-100">{evt.title}</h3>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right font-mono text-xs">
                      <span className={`block font-semibold ${isPast ? "text-zinc-500" : "text-zinc-200"}`}>
                        {new Date(evt.date).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <Link
                      href={`/opportunities/${evt.opportunitySlug}`}
                      className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
