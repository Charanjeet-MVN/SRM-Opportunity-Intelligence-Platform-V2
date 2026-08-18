"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Building2,
  Trophy,
  Rocket,
  Users2,
} from "lucide-react";

interface ActivityItem {
  id: string;
  title: string;
  category: "hackathon" | "workshop" | "club" | "competition";
  organizer: string;
  date: string;
  status: "Completed" | "Registered" | "In Review" | "Shortlisted";
  description?: string;
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    title: "SRM National Hackathon Sprint 2026",
    category: "hackathon",
    organizer: "Directorate of Student Affairs",
    date: "March 2026",
    status: "Shortlisted",
    description: "48-hour national software sprint building AI-driven campus workflows.",
  },
  {
    id: "act-2",
    title: "Hands-on PyTorch & Vector Indices Bootcamp",
    category: "workshop",
    organizer: "Data Science & AI Community SRM",
    date: "February 2026",
    status: "Completed",
    description: "Deep dive into embeddings, vector databases, and similarity retrieval.",
  },
  {
    id: "act-3",
    title: "Core Technical Team Recruitment",
    category: "club",
    organizer: "SRM Developer Student Club",
    date: "January 2026",
    status: "Completed",
    description: "Recruited as Lead Full-Stack Engineer for open-source campus initiatives.",
  },
  {
    id: "act-4",
    title: "SRM Inter-Collegiate Algorithmic Tournament",
    category: "competition",
    organizer: "ACM Student Chapter SRM",
    date: "December 2025",
    status: "Completed",
    description: "Placed top 5% in campus-wide competitive programming tournament.",
  },
];

interface StudentActivityTimelineProps {
  activities?: ActivityItem[];
}

export default function StudentActivityTimeline({
  activities = DEFAULT_ACTIVITIES,
}: StudentActivityTimelineProps) {
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "hackathon":
        return Trophy;
      case "workshop":
        return Rocket;
      case "club":
        return Users2;
      default:
        return CalendarClock;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Shortlisted":
        return "bg-purple-500/10 text-purple-300 border-purple-500/20";
      case "Registered":
        return "bg-sky-500/10 text-sky-300 border-sky-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  return (
    <div className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-indigo-400 tracking-wider">
            <CalendarClock className="w-4 h-4" />
            <span>Campus Activity & Participation Timeline</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-100">
            Events, Hackathons & Club Engagements
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
          {activities.length} Recorded Milestones
        </span>
      </div>

      {/* Timeline Feed */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-purple-500/80 before:via-indigo-500/50 before:to-zinc-800">
        {activities.map((item, idx) => {
          const Icon = getCategoryIcon(item.category);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
              className="relative space-y-2 group"
            >
              {/* Timeline Indicator Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-zinc-950 border-2 border-purple-500 flex items-center justify-center group-hover:scale-125 transition-transform shadow-lg shadow-purple-500/30">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all space-y-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-purple-300 transition-colors">
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500">
                      {item.date}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{item.organizer}</span>
                </div>

                {item.description && (
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
