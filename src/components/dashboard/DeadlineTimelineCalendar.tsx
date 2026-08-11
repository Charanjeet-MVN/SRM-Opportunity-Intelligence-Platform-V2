"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getDeadlineUrgency } from "@/lib/notifications/urgency";
import {
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  type: "deadline" | "event_start";
  opportunitySlug: string;
  clubName: string;
  opportunityType: string;
}

interface DeadlineTimelineCalendarProps {
  events: TimelineEvent[];
}

export default function DeadlineTimelineCalendar({ events }: DeadlineTimelineCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group events by deadline urgency
  const groupedEvents = {
    dueToday: [] as TimelineEvent[],
    dueTomorrow: [] as TimelineEvent[],
    dueThisWeek: [] as TimelineEvent[],
    upcoming: [] as TimelineEvent[],
    past: [] as TimelineEvent[],
  };

  events.forEach((evt) => {
    const urgency = getDeadlineUrgency(evt.date);
    if (urgency.status === "expired") {
      groupedEvents.past.push(evt);
    } else if (urgency.status === "due_today") {
      groupedEvents.dueToday.push(evt);
    } else if (urgency.status === "due_tomorrow") {
      groupedEvents.dueTomorrow.push(evt);
    } else if (urgency.status === "due_this_week") {
      groupedEvents.dueThisWeek.push(evt);
    } else {
      groupedEvents.upcoming.push(evt);
    }
  });

  // Calendar Grid helper
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  // Map of YYYY-MM-DD -> count of events
  const eventDateMap = new Map<string, TimelineEvent[]>();
  events.forEach((evt) => {
    const d = new Date(evt.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const list = eventDateMap.get(key) || [];
    list.push(evt);
    eventDateMap.set(key, list);
  });

  function handlePrevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function handleNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  return (
    <div className="space-y-8">
      {/* ── COMPACT MONTH CALENDAR PREVIEW ── */}
      <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
              Calendar Deadline Preview
            </h2>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-300 font-bold">{monthName}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-zinc-500 font-bold uppercase py-1 border-b border-zinc-800/60">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 rounded-xl bg-transparent" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const dayEvents = eventDateMap.get(dateKey) || [];

            const isToday =
              dayNum === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            const isSelected = selectedDate === dateKey;

            return (
              <motion.button
                key={dateKey}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                className={`relative h-11 rounded-xl border p-1 flex flex-col items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30"
                    : isToday
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40"
                    : dayEvents.length > 0
                    ? "bg-purple-500/10 text-purple-200 border-purple-500/30 hover:border-purple-500/60"
                    : "bg-zinc-900/40 text-zinc-400 border-zinc-800/60 hover:bg-zinc-800/60"
                }`}
              >
                <span className="text-[11px] font-mono font-bold leading-none">{dayNum}</span>

                {dayEvents.length > 0 && (
                  <div className="flex items-center gap-0.5">
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          e.type === "deadline" ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Selected Date Filtered Event Detail */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 border-t border-zinc-800/60 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-zinc-400 font-bold">
                  Events on {selectedDate}:
                </span>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono"
                >
                  Clear Selection
                </button>
              </div>

              {(eventDateMap.get(selectedDate) || []).length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono italic">No deadlines on this date.</p>
              ) : (
                <div className="space-y-2">
                  {(eventDateMap.get(selectedDate) || []).map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-bold text-zinc-100 truncate">{evt.title}</h4>
                        <p className="text-[10px] text-zinc-500 font-mono">by {evt.clubName}</p>
                      </div>
                      <Link
                        href={`/opportunities/${evt.opportunitySlug}`}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] shrink-0"
                      >
                        Open →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── DETERMINISTIC DEADLINE TIMELINE ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
              Chronological Opportunity Timeline
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {events.length} tracked {events.length === 1 ? "milestone" : "milestones"}
          </span>
        </div>

        {events.length === 0 ? (
          <div className="py-16 px-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-zinc-200">You&apos;re all caught up.</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Bookmark interesting hackathons, internships, or workshops to track their application deadlines here.
              </p>
            </div>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedEvents.dueToday.length > 0 && (
              <TimelineSection
                title="Due Today"
                badgeColor="text-amber-300 bg-amber-500/20 border-amber-500/40 animate-pulse font-bold"
                events={groupedEvents.dueToday}
              />
            )}

            {groupedEvents.dueTomorrow.length > 0 && (
              <TimelineSection
                title="Due Tomorrow"
                badgeColor="text-amber-400 bg-amber-500/10 border-amber-500/30 font-semibold"
                events={groupedEvents.dueTomorrow}
              />
            )}

            {groupedEvents.dueThisWeek.length > 0 && (
              <TimelineSection
                title="Due This Week"
                badgeColor="text-purple-300 bg-purple-500/10 border-purple-500/20 font-semibold"
                events={groupedEvents.dueThisWeek}
              />
            )}

            {groupedEvents.upcoming.length > 0 && (
              <TimelineSection
                title="Upcoming Milestones"
                badgeColor="text-sky-300 bg-sky-500/10 border-sky-500/20 font-semibold"
                events={groupedEvents.upcoming}
              />
            )}

            {groupedEvents.past.length > 0 && (
              <TimelineSection
                title="Past Milestones"
                badgeColor="text-zinc-500 bg-zinc-900 border-zinc-800"
                events={groupedEvents.past}
                isPast
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineSection({
  title,
  badgeColor,
  events,
  isPast,
}: {
  title: string;
  badgeColor: string;
  events: TimelineEvent[];
  isPast?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${badgeColor}`}>
          {title} ({events.length})
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {events.map((evt) => (
          <motion.div
            key={evt.id}
            whileHover={{ y: -2 }}
            className={`p-4 rounded-2xl bg-zinc-900/60 border flex flex-col justify-between space-y-3 transition-all ${
              isPast ? "border-zinc-800/60 opacity-60" : "border-zinc-800 hover:border-indigo-500/30 shadow-lg"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span className="uppercase">{evt.opportunityType.replace("_", " ")}</span>
                <span>{new Date(evt.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <Link href={`/opportunities/${evt.opportunitySlug}`}>
                <h4 className="text-xs font-bold text-zinc-100 hover:text-indigo-300 transition-colors leading-snug line-clamp-2">
                  {evt.title}
                </h4>
              </Link>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-zinc-800/60">
              <span className="truncate">by {evt.clubName}</span>
              <Link
                href={`/opportunities/${evt.opportunitySlug}`}
                className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 shrink-0"
              >
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
