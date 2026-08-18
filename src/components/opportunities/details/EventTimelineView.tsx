"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  Flag,
  Users2,
  CalendarCheck,
} from "lucide-react";
import { Opportunity } from "@/types";

interface EventTimelineViewProps {
  opportunity: Opportunity;
}

interface TimelineStage {
  id: string;
  title: string;
  subtitle: string;
  dateStr: string;
  dateObj: Date | null;
  status: "completed" | "active" | "upcoming";
  icon: React.ElementType;
  description: string;
  badge?: string;
}

export default function EventTimelineView({ opportunity }: EventTimelineViewProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const now = new Date();

  // Parse Dates
  const createdDate = opportunity.createdAt ? new Date(opportunity.createdAt) : null;
  const deadlineDate = opportunity.applicationDeadline
    ? new Date(opportunity.applicationDeadline)
    : null;
  const startDate = opportunity.eventStartDate
    ? new Date(opportunity.eventStartDate)
    : null;
  const endDate = opportunity.eventEndDate
    ? new Date(opportunity.eventEndDate)
    : startDate
    ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
    : null;

  // Derive Shortlisting Date (between deadline and start date)
  let shortlistingDate: Date | null = null;
  if (deadlineDate && startDate && startDate > deadlineDate) {
    const diff = startDate.getTime() - deadlineDate.getTime();
    shortlistingDate = new Date(deadlineDate.getTime() + diff * 0.4);
  } else if (deadlineDate) {
    shortlistingDate = new Date(deadlineDate.getTime() + 2 * 24 * 60 * 60 * 1000);
  }

  // Determine stage statuses
  const getStageStatus = (
    stageDate: Date | null,
    nextDate: Date | null
  ): "completed" | "active" | "upcoming" => {
    if (!stageDate) return "upcoming";
    if (nextDate) {
      if (now < stageDate) return "upcoming";
      if (now >= stageDate && now < nextDate) return "active";
      return "completed";
    } else {
      if (now < stageDate) return "upcoming";
      return "active";
    }
  };

  const isRegistrationClosed = deadlineDate ? now > deadlineDate : false;
  const isEventStarted = startDate ? now >= startDate : false;
  const isEventConcluded = endDate ? now > endDate : false;

  const regStatus = getStageStatus(createdDate, deadlineDate);
  const deadlineStatus: "completed" | "active" | "upcoming" = isRegistrationClosed
    ? "completed"
    : now >= (createdDate || new Date(0))
    ? "active"
    : "upcoming";

  const shortlistStatus: "completed" | "active" | "upcoming" =
    isEventStarted
      ? "completed"
      : isRegistrationClosed && (!startDate || now < startDate)
      ? "active"
      : "upcoming";

  const eventStatus: "completed" | "active" | "upcoming" =
    isEventConcluded
      ? "completed"
      : isEventStarted
      ? "active"
      : "upcoming";

  const finaleStatus: "completed" | "active" | "upcoming" = isEventConcluded
    ? "completed"
    : "upcoming";

  const stages: TimelineStage[] = [
    {
      id: "reg-open",
      title: "Applications Open",
      subtitle: "Official Launch",
      dateStr: createdDate
        ? createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "Announced",
      dateObj: createdDate,
      status: regStatus === "active" && !deadlineDate ? "active" : "completed",
      icon: Sparkles,
      description: "Opportunity published and open for student submissions across SRM.",
      badge: "Stage 01",
    },
    {
      id: "reg-close",
      title: "Application Deadline",
      subtitle: isRegistrationClosed ? "Submissions Closed" : "Final Window",
      dateStr: deadlineDate
        ? deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
        : "Rolling Basis",
      dateObj: deadlineDate,
      status: deadlineStatus,
      icon: Clock,
      description: isRegistrationClosed
        ? "Registrations have officially closed for this cycle."
        : "Ensure your application and team details are submitted before this timestamp.",
      badge: isRegistrationClosed ? "Closed" : "Key Milestone",
    },
    {
      id: "shortlist",
      title: "Review & Shortlisting",
      subtitle: "Peer Screening",
      dateStr: shortlistingDate
        ? shortlistingDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Post Deadline",
      dateObj: shortlistingDate,
      status: shortlistStatus,
      icon: Users2,
      description: "Organizers evaluate candidate credentials, project proposals, or team profiles.",
      badge: "Stage 03",
    },
    {
      id: "event-start",
      title: "Event Kickoff",
      subtitle: "Opening Ceremony",
      dateStr: startDate
        ? startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "TBA by Club",
      dateObj: startDate,
      status: eventStatus,
      icon: Calendar,
      description: "Main event commences. Workshops, hackathon hacking phases, or rounds begin.",
      badge: "Main Event",
    },
    {
      id: "event-end",
      title: "Grand Finale & Results",
      subtitle: "Awards / Wrap-up",
      dateStr: endDate
        ? endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : startDate
        ? "Concluding Session"
        : "TBA",
      dateObj: endDate,
      status: finaleStatus,
      icon: Flag,
      description: "Final presentations, award distribution, and certificate issuance.",
      badge: "Stage 05",
    },
  ];

  // Calculate overall timeline percentage
  let completedCount = stages.filter((s) => s.status === "completed").length;
  if (stages.some((s) => s.status === "active")) {
    completedCount += 0.5;
  }
  const progressPercent = Math.min(100, Math.round((completedCount / stages.length) * 100));

  return (
    <div className="relative rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6 overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-zinc-800/70 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <CalendarCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Roadmap</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            Event Journey & Milestones
          </h2>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 px-4 py-2 rounded-2xl">
          <div className="text-right font-mono">
            <span className="text-[10px] text-zinc-500 block uppercase">Timeline Progress</span>
            <span className="text-xs font-bold text-indigo-300">{progressPercent}% Completed</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center font-mono text-xs font-black text-indigo-400">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Timeline Visual Cards (Desktop Horizontal Flow & Mobile Vertical Flow) */}
      <div className="relative pt-4">
        {/* Desktop Connected Progress Bar */}
        <div className="hidden lg:block absolute top-[68px] left-12 right-12 h-1 bg-zinc-800 rounded-full z-0">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full shadow-lg shadow-indigo-500/30"
          />
        </div>

        {/* Step Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative z-10">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = selectedStage === stage.id;
            const isCompleted = stage.status === "completed";
            const isActive = stage.status === "active";

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                className={`group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? "bg-gradient-to-b from-indigo-950/60 via-zinc-900/90 to-zinc-900/90 border-2 border-indigo-500/60 shadow-xl shadow-indigo-500/10"
                    : isCompleted
                    ? "bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700"
                    : "bg-zinc-950/60 hover:bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700/60 opacity-80 hover:opacity-100"
                }`}
              >
                {/* Status Dot / Icon Bubble */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 animate-pulse"
                        : isCompleted
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  {stage.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-semibold ${
                        isActive
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : isCompleted
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                      }`}
                    >
                      {stage.badge}
                    </span>
                  )}
                </div>

                {/* Stage Content */}
                <div className="space-y-1">
                  <h3
                    className={`text-sm font-bold transition-colors ${
                      isActive
                        ? "text-indigo-300"
                        : isCompleted
                        ? "text-zinc-200"
                        : "text-zinc-400 group-hover:text-zinc-300"
                    }`}
                  >
                    {stage.title}
                  </h3>

                  <p className="text-xs font-mono text-zinc-400">
                    {stage.dateStr}
                  </p>
                </div>

                {/* Micro Description */}
                <p className="text-[11px] text-zinc-400 leading-relaxed font-light mt-2 pt-2 border-t border-zinc-800/60">
                  {stage.description}
                </p>

                {/* Active Indicator Pulse bar */}
                {isActive && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono font-bold text-indigo-400">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                    <span>Current Active Stage</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
