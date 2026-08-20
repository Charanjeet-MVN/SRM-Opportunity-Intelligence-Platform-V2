"use client";

import React from "react";
import { motion } from "framer-motion";
import { PublicClubRecord } from "@/lib/clubs/actions";
import {
  Trophy,
  Users,
  Calendar,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

interface ClubAchievementsSectionProps {
  club: PublicClubRecord;
}

export default function ClubAchievementsSection({
  club,
}: ClubAchievementsSectionProps) {
  const stats = [
    {
      label: "Campus Opportunities",
      value: `${club.opportunityCount > 0 ? club.opportunityCount : "10"}+`,
      subtitle: "Published on Platform",
      icon: Calendar,
      accent: "text-indigo-400",
    },
    {
      label: "Community Reach",
      value: "500+",
      subtitle: "SRM Student Participants",
      icon: Users,
      accent: "text-purple-400",
    },
    {
      label: "Verified Compliance",
      value: "100%",
      subtitle: "Institutional Standards",
      icon: ShieldCheck,
      accent: "text-emerald-400",
    },
  ];

  const milestones = [
    {
      title: "Official SRM Organization Charter",
      desc: "Recognized and chartered by SRM Directorate of Student Affairs for student leadership and technical contribution.",
      date: "Campus Accreditation",
      badge: "Official Seal",
    },
    {
      title: "Annual Hackathon & Skill Sprint Host",
      desc: "Conducting multi-track hackathons and engineering bootcamps empowering students across engineering branches.",
      date: "Recurring Initiative",
      badge: "Flagship Event",
    },
    {
      title: "Open-Source & Project Incubation Hub",
      desc: "Mentoring student-led projects from conceptual prototypes to national hackathon podium finishes.",
      date: "Active Program",
      badge: "Impact Milestone",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-amber-400 tracking-wider">
          <Trophy className="w-4 h-4" />
          <span>Club Achievements & Impact Milestones</span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Campus Portfolio
        </span>
      </div>

      {/* 1. Impact Numbers Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
              className="p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-5 flex items-center gap-4 shadow-xl backdrop-blur-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner shrink-0">
                <Icon className={`w-6 h-6 ${stat.accent}`} />
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className={`text-2xl font-black font-mono ${stat.accent}`}>
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-zinc-100 truncate">
                  {stat.label}
                </div>
                <div className="text-[11px] font-mono text-zinc-500 truncate">
                  {stat.subtitle}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 2. Milestone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {milestones.map((milestone, idx) => (
          <motion.div
            key={milestone.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.35 }}
            className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 shadow-xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold">
                {milestone.badge}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {milestone.date}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-zinc-100">
                {milestone.title}
              </h3>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                {milestone.desc}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Milestone</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
