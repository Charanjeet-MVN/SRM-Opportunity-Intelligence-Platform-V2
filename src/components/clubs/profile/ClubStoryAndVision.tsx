"use client";

import React from "react";
import { motion } from "framer-motion";
import { PublicClubRecord } from "@/lib/clubs/actions";
import {
  Target,
  Zap,
  Users2,
  Rocket,
} from "lucide-react";

interface ClubStoryAndVisionProps {
  club: PublicClubRecord;
}

export default function ClubStoryAndVision({ club }: ClubStoryAndVisionProps) {
  const pillars = [
    {
      title: "Technical Excellence & Innovation",
      desc: "Cultivating cutting-edge technical projects, open-source repositories, and hands-on workshops for SRM students.",
      icon: Zap,
      accent: "text-indigo-400",
    },
    {
      title: "Skill Acceleration & Mentorship",
      desc: "Bridging classroom academia with industry-grade software, AI systems, and competitive problem-solving.",
      icon: Rocket,
      accent: "text-purple-400",
    },
    {
      title: "Peer Collaboration & Network",
      desc: "Fostering multidisciplinary student teams for national hackathons, research summits, and enterprise competitions.",
      icon: Users2,
      accent: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Mission & Vision Statement Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-indigo-400 tracking-wider">
            <Target className="w-4 h-4" />
            <span>Mission & Strategic Vision</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            SRM Student Chapter
          </span>
        </div>

        <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-light">
          {club.description ||
            `${club.name} is dedicated to fostering campus-wide innovation, experiential skill-building, and high-impact student opportunities at SRM Institute of Science and Technology.`}
        </p>
      </motion.div>

      {/* 2. Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;

          return (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.35 }}
              className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 shadow-xl backdrop-blur-xl group"
            >
              <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Icon className={`w-5 h-5 ${pillar.accent}`} />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
