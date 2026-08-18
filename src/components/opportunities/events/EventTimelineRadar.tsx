"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Users2,
  CheckCircle2,
  Award,
  Clock,
  Flame,
} from "lucide-react";

export default function EventTimelineRadar() {
  const steps = [
    {
      step: "01",
      title: "Registration & Team Formation",
      timeline: "Days 1–14",
      desc: "Browse verified opportunities, form cross-departmental teams, submit registrations, and secure eligibility clearance.",
      icon: Users2,
      status: "Active Stage",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      step: "02",
      title: "Selection & Problem Statements",
      timeline: "48h Before Kickoff",
      desc: "Problem statements, API keys, and workspace resources unlocked by organizers for verified teams.",
      icon: Clock,
      status: "Automated Dispatch",
      statusColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      step: "03",
      title: "Event Day & Intensive Build",
      timeline: "Day of Event",
      desc: "In-person & hybrid sprint sessions, mentor checkpoints, hardware lab access, and live checkpoint submissions.",
      icon: Flame,
      status: "Live Experience",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      step: "04",
      title: "Jury Evaluation & Awards",
      timeline: "Grand Finale",
      desc: "Project pitches before industry juries, instant leaderboard rankings, institutional certificates, and prize disbursements.",
      icon: Award,
      status: "Certificate Verified",
      statusColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-sky-400 tracking-wider">
            <CalendarClock className="w-4 h-4" />
            <span>Event Roadmap & Lifecycle</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-100">
            How Campus Events Unfold on SRM Platform
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
          Standard Operating Framework
        </span>
      </div>

      {/* 4-Step Interactive Roadmap Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((item, idx) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
              className="p-4 sm:p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black font-mono text-zinc-600">
                    {item.step}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${item.statusColor}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-zinc-200" />
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    {item.timeline}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-100">
                    {item.title}
                  </h4>
                </div>

                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/50 flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Standard Milestone</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
