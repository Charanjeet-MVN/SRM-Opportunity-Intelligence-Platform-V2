"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PublicClubRecord } from "@/lib/clubs/actions";
import {
  Trophy,
  Calendar,
  ShieldCheck,
  Building2,
  Tag,
} from "lucide-react";

interface ClubAchievementsSectionProps {
  club: PublicClubRecord;
}

export default function ClubAchievementsSection({
  club,
}: ClubAchievementsSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const isVerified = club.verificationStatus === "verified";

  const stats = [
    {
      label: "Published Opportunities",
      value: `${club.opportunityCount}`,
      subtitle: club.opportunityCount === 1 ? "Active Platform Listing" : "Active Platform Listings",
      icon: Calendar,
      accent: "text-indigo-400",
    },
    {
      label: "Institutional Standing",
      value: isVerified ? "Verified" : "Registered",
      subtitle: isVerified ? "Official SRM Accreditation" : "Standard Campus Charter",
      icon: ShieldCheck,
      accent: isVerified ? "text-emerald-400" : "text-amber-400",
    },
    {
      label: "Domain Focus",
      value: club.category ? club.category.charAt(0).toUpperCase() + club.category.slice(1) : "Technical",
      subtitle: "Primary Organization Category",
      icon: Tag,
      accent: "text-purple-400",
    },
  ];

  const milestones = [
    {
      title: isVerified ? "Official SRM Organization Charter" : "Campus Organization Registration",
      desc: isVerified
        ? `Officially recognized and authenticated by the SRM Opportunity Intelligence Platform${club.verifiedAt ? ` on ${new Date(club.verifiedAt).toLocaleDateString()}` : ""}.`
        : "Registered on the SRM Opportunity Intelligence Platform under standard campus moderation guidelines.",
      date: isVerified ? "Audited & Verified" : "Active Collective",
      badge: isVerified ? "Official Charter" : "Campus Charter",
      accent: isVerified ? "text-emerald-400" : "text-zinc-400",
    },
    {
      title: "Opportunity Publisher Network",
      desc: club.opportunityCount > 0
        ? `Actively hosting ${club.opportunityCount} campus opportunity ${club.opportunityCount === 1 ? "initiative" : "initiatives"} for student skill acceleration and national participation.`
        : "Student leadership team preparing upcoming hackathons, technical workshops, and campus recruitments.",
      date: club.opportunityCount > 0 ? "Active Publisher" : "Upcoming Horizons",
      badge: "Platform Network",
      accent: "text-indigo-400",
    },
    {
      title: "Verified Student Communication",
      desc: club.officialEmail
        ? `Official institutional channel active at ${club.officialEmail} for student queries and recruitment applications.`
        : "Official campus opportunities published directly to student dashboard feeds and discover channels.",
      date: "Direct Channel",
      badge: "Governance",
      accent: "text-purple-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-amber-400 tracking-wider">
          <Trophy className="w-4 h-4" />
          <span>Organization Metrics & Accreditation</span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Real Database Signals
        </span>
      </div>

      {/* 1. Measurable Data Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
              className="p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-4 shadow-xl backdrop-blur-xl"
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

      {/* 2. Real Milestone Portfolio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {milestones.map((milestone, idx) => (
          <motion.div
            key={milestone.title}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
            className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 shadow-xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold">
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

            <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
              <Building2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>{club.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
