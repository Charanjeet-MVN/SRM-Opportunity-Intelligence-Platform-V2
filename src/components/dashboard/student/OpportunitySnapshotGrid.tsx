"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Compass,
  Bookmark,
  Calendar,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import SpatialCard3D from "@/components/3d/SpatialCard3D";

interface OpportunitySnapshotGridProps {
  totalAvailable: number;
  totalSaved: number;
  totalRegistered: number;
  deadlinesThisWeek: number;
}

export default function OpportunitySnapshotGrid({
  totalAvailable,
  totalSaved,
  totalRegistered,
  deadlinesThisWeek,
}: OpportunitySnapshotGridProps) {
  const cards = [
    {
      id: "available",
      label: "Relevant Opportunities",
      value: totalAvailable,
      subtitle: totalAvailable > 0 ? "Matched to your profile" : "Explore open listings",
      icon: Compass,
      href: "/opportunities",
      accent: "text-indigo-400",
      glowColor: "rgba(99, 102, 241, 0.18)",
      border: "hover:border-indigo-500/50",
      badge: totalAvailable > 0 ? "Active Feed" : "Explore",
      badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    },
    {
      id: "saved",
      label: "Saved on Radar",
      value: totalSaved,
      subtitle: totalSaved > 0 ? "Tracked for submission" : "No saved items yet",
      icon: Bookmark,
      href: "/dashboard/student/saved",
      accent: "text-purple-400",
      glowColor: "rgba(168, 85, 247, 0.18)",
      border: "hover:border-purple-500/50",
      badge: `${totalSaved} Saved`,
      badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    },
    {
      id: "deadlines",
      label: "Deadlines This Week",
      value: deadlinesThisWeek,
      subtitle: deadlinesThisWeek > 0 ? "Requires action" : "All caught up",
      icon: Clock,
      href: "/dashboard/student/calendar",
      accent: deadlinesThisWeek > 0 ? "text-amber-400" : "text-sky-400",
      glowColor: deadlinesThisWeek > 0 ? "rgba(245, 158, 11, 0.18)" : "rgba(56, 189, 248, 0.18)",
      border: deadlinesThisWeek > 0 ? "hover:border-amber-500/50" : "hover:border-sky-500/50",
      badge: deadlinesThisWeek > 0 ? "Urgent Action" : "On Track",
      badgeColor:
        deadlinesThisWeek > 0
          ? "bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse"
          : "bg-sky-500/10 text-sky-300 border-sky-500/20",
    },
    {
      id: "registered",
      label: "Active Applications",
      value: totalRegistered,
      subtitle: totalRegistered > 0 ? "Submissions & entries" : "No active submissions",
      icon: Calendar,
      href: "/dashboard/student/registrations",
      accent: "text-emerald-400",
      glowColor: "rgba(16, 185, 129, 0.18)",
      border: "hover:border-emerald-500/50",
      badge: totalRegistered > 0 ? "Registered" : "Available",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Link key={card.id} href={card.href} className="block h-full">
            <SpatialCard3D
              depth={6}
              elevationZ={14}
              glowColor={card.glowColor}
              className="h-full"
            >
              <div
                className={`group rounded-3xl bg-zinc-950/80 border border-zinc-800/80 ${card.border} p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 shadow-xl backdrop-blur-xl h-full relative overflow-hidden`}
              >
                {/* Specular illumination bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-zinc-700/0 to-transparent group-hover:via-indigo-500/50 transition-all duration-500" />

                {/* Top Row: Icon + Badge + Arrow */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                    <Icon className={`w-5 h-5 ${card.accent}`} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:border-zinc-700 transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Counter & Labels */}
                <div className="space-y-1">
                  <motion.div
                    key={String(card.value)}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`text-3xl sm:text-4xl font-black ${card.accent} font-mono tracking-tight`}
                  >
                    {card.value}
                  </motion.div>
                  <h3 className="text-xs font-bold text-zinc-100 group-hover:text-white transition-colors">
                    {card.label}
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </SpatialCard3D>
          </Link>
        );
      })}
    </div>
  );
}
