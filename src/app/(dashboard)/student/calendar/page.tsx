import React from "react";
import { getStudentTimelineAction } from "@/lib/engagement/actions";
import DeadlineTimelineCalendar from "@/components/dashboard/DeadlineTimelineCalendar";
import { Calendar } from "lucide-react";

export default async function StudentCalendarPage() {
  const { events } = await getStudentTimelineAction();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-950/30 via-zinc-900 to-indigo-950/30 border border-purple-500/20 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Calendar className="w-3.5 h-3.5" />
          Personal Campus Schedule & Deadline Intelligence
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
          Impending Deadlines & Timeline
        </h1>
        <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
          Chronological milestone schedule aggregating deadlines and event start times for your saved and registered opportunities.
        </p>
      </div>

      <DeadlineTimelineCalendar events={events || []} />
    </div>
  );
}
