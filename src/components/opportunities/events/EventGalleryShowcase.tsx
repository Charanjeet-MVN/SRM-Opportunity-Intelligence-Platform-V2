"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Rocket,
  FlaskConical,
  ArrowRight,
  Flame,
  Layers,
} from "lucide-react";

interface EventGalleryShowcaseProps {
  onSelectCategory?: (category: string) => void;
}

export default function EventGalleryShowcase({
  onSelectCategory,
}: EventGalleryShowcaseProps) {
  const tracks = [
    {
      id: "hackathon",
      title: "National Hackathons & Code Sprints",
      subtitle: "24-48 Hour Intensive Build Challenges",
      desc: "Assemble multidisciplinary student squads, ship production-grade software, and compete for institutional prize pools.",
      icon: Trophy,
      tag: "Competitive Track",
      tagColor: "bg-purple-500/10 text-purple-300 border-purple-500/25",
      accent: "text-purple-400",
      gradient: "from-purple-950/40 via-zinc-900/90 to-zinc-950/90",
      border: "hover:border-purple-500/50",
      stats: "₹5L+ Prizes Pool",
    },
    {
      id: "workshop",
      title: "Hands-on Technical Bootcamps",
      subtitle: "Deep Dives in AI/ML, Cloud & Architecture",
      desc: "Learn directly from senior campus engineers and industry mentors with guided codebase building sessions.",
      icon: Rocket,
      tag: "Skill Mastery",
      tagColor: "bg-sky-500/10 text-sky-300 border-sky-500/25",
      accent: "text-sky-400",
      gradient: "from-sky-950/40 via-zinc-900/90 to-zinc-950/90",
      border: "hover:border-sky-500/50",
      stats: "50+ Masterclasses",
    },
    {
      id: "competition",
      title: "Campus Tournaments & Contests",
      subtitle: "Algorithmic Challenges & CTF Battles",
      desc: "Climb verified SRM skill leaderboards, benchmark speed and accuracy against university peers.",
      icon: Flame,
      tag: "Skill Benchmark",
      tagColor: "bg-red-500/10 text-red-300 border-red-500/25",
      accent: "text-red-400",
      gradient: "from-red-950/40 via-zinc-900/90 to-zinc-950/90",
      border: "hover:border-red-500/50",
      stats: "Live Leaderboards",
    },
    {
      id: "research",
      title: "Research Fellowships & Lab Grants",
      subtitle: "Faculty-Led Innovation & Research Papers",
      desc: "Publish novel research papers, access compute clusters, and earn lab mentorship credentials.",
      icon: FlaskConical,
      tag: "Academic Honors",
      tagColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/25",
      accent: "text-indigo-400",
      gradient: "from-indigo-950/40 via-zinc-900/90 to-zinc-950/90",
      border: "hover:border-indigo-500/50",
      stats: "Funded Grants",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-indigo-400 tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Campus Experiential Tracks</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            Curated Event Tracks & Formats
          </h2>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
          SRM Student Life
        </span>
      </div>

      {/* 4-Column Interactive Track Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tracks.map((track, idx) => {
          const Icon = track.icon;

          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.35 }}
              onClick={() => onSelectCategory && onSelectCategory(track.id)}
              className={`p-6 rounded-3xl bg-gradient-to-b ${track.gradient} border border-zinc-800/80 ${track.border} transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-xl cursor-pointer group relative overflow-hidden`}
            >
              {/* Specular illumination */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-zinc-700/0 to-transparent group-hover:via-indigo-500/50 transition-all duration-500" />

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <Icon className={`w-5 h-5 ${track.accent}`} />
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold ${track.tagColor}`}
                  >
                    {track.tag}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-white transition-colors leading-snug">
                    {track.title}
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400">
                    {track.subtitle}
                  </p>
                </div>

                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  {track.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
                <span className={`font-bold ${track.accent}`}>{track.stats}</span>
                <div className="text-zinc-500 group-hover:text-indigo-300 flex items-center gap-1 transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
