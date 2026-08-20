"use client";

import React from "react";
import SpatialCard3D from "@/components/3d/SpatialCard3D";
import {
  Trophy,
  Bookmark,
  Zap,
  Rocket,
} from "lucide-react";

interface StudentParticipationStatsProps {
  eventsRegistered?: number;
  workshopsJoined?: number;
  opportunitiesSaved?: number;
  activityScore?: number;
}

export default function StudentParticipationStats({
  eventsRegistered = 4,
  workshopsJoined = 3,
  opportunitiesSaved = 6,
  activityScore = 185,
}: StudentParticipationStatsProps) {
  const cards = [
    {
      label: "Events & Hackathons",
      value: eventsRegistered,
      subtitle: "Active Registrations",
      icon: Trophy,
      accent: "text-purple-400",
      glowColor: "rgba(168, 85, 247, 0.18)",
    },
    {
      label: "Workshops Joined",
      value: workshopsJoined,
      subtitle: "Hands-on Masterclasses",
      icon: Rocket,
      accent: "text-sky-400",
      glowColor: "rgba(56, 189, 248, 0.18)",
    },
    {
      label: "Saved Opportunities",
      value: opportunitiesSaved,
      subtitle: "In Personal Watchlist",
      icon: Bookmark,
      accent: "text-amber-400",
      glowColor: "rgba(245, 158, 11, 0.18)",
    },
    {
      label: "Campus Activity Score",
      value: `${activityScore} Pts`,
      subtitle: "Overall Engagement",
      icon: Zap,
      accent: "text-emerald-400",
      glowColor: "rgba(16, 185, 129, 0.18)",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <SpatialCard3D
            key={card.label}
            depth={8}
            elevationZ={15}
            glowColor={card.glowColor}
            className="h-full"
          >
            <div className="p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-xl h-full transition-all group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Icon className={`w-5 h-5 ${card.accent}`} />
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Telemetry
                </span>
              </div>

              <div className="space-y-0.5">
                <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${card.accent}`}>
                  {card.value}
                </div>
                <div className="text-xs font-bold text-zinc-200">
                  {card.label}
                </div>
                <div className="text-[11px] font-mono text-zinc-500">
                  {card.subtitle}
                </div>
              </div>
            </div>
          </SpatialCard3D>
        );
      })}
    </div>
  );
}
