"use client";

import React from "react";
import { motion } from "framer-motion";
import { OpportunityType } from "@/types";
import {
  Sparkles,
  Trophy,
  Briefcase,
  FlaskConical,
  Award,
  Target,
  Rocket,
  Users,
  Building,
  BookOpen,
} from "lucide-react";

export interface CategoryPillConfig {
  value: OpportunityType | "all";
  label: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  glow: string;
}

export const CATEGORY_PILL_CONFIGS: CategoryPillConfig[] = [
  {
    value: "all",
    label: "All Opportunities",
    icon: Sparkles,
    color: "#6366f1",
    gradient: "from-indigo-600/30 to-purple-600/30",
    glow: "rgba(99, 102, 241, 0.25)",
  },
  {
    value: "hackathon",
    label: "Hackathons",
    icon: Trophy,
    color: "#a855f7",
    gradient: "from-purple-600/30 to-fuchsia-600/30",
    glow: "rgba(168, 85, 247, 0.25)",
  },
  {
    value: "internship",
    label: "Internships",
    icon: Briefcase,
    color: "#10b981",
    gradient: "from-emerald-600/30 to-teal-600/30",
    glow: "rgba(16, 185, 129, 0.25)",
  },
  {
    value: "research",
    label: "Research",
    icon: FlaskConical,
    color: "#3b82f6",
    gradient: "from-blue-600/30 to-indigo-600/30",
    glow: "rgba(59, 130, 246, 0.25)",
  },
  {
    value: "scholarship",
    label: "Scholarships",
    icon: Award,
    color: "#f59e0b",
    gradient: "from-amber-600/30 to-yellow-600/30",
    glow: "rgba(245, 158, 11, 0.25)",
  },
  {
    value: "competition",
    label: "Competitions",
    icon: Target,
    color: "#ef4444",
    gradient: "from-red-600/30 to-orange-600/30",
    glow: "rgba(239, 68, 68, 0.25)",
  },
  {
    value: "workshop",
    label: "Workshops",
    icon: Rocket,
    color: "#38bdf8",
    gradient: "from-sky-600/30 to-cyan-600/30",
    glow: "rgba(56, 189, 248, 0.25)",
  },
  {
    value: "club_recruitment",
    label: "Club Recruitments",
    icon: Users,
    color: "#ec4899",
    gradient: "from-pink-600/30 to-rose-600/30",
    glow: "rgba(236, 72, 153, 0.25)",
  },
  {
    value: "placement_drive",
    label: "Placement Drives",
    icon: Building,
    color: "#8b5cf6",
    gradient: "from-violet-600/30 to-purple-600/30",
    glow: "rgba(139, 92, 246, 0.25)",
  },
  {
    value: "conference",
    label: "Conferences",
    icon: BookOpen,
    color: "#14b8a6",
    gradient: "from-teal-600/30 to-emerald-600/30",
    glow: "rgba(20, 184, 166, 0.25)",
  },
];

interface DiscoveryCategoryPillsProps {
  selectedType: OpportunityType | "all";
  onSelectType: (type: OpportunityType | "all") => void;
  categoryCounts?: Record<string, number>;
}

export default function DiscoveryCategoryPills({
  selectedType,
  onSelectType,
  categoryCounts = {},
}: DiscoveryCategoryPillsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono">
      {CATEGORY_PILL_CONFIGS.map((config) => {
        const isSelected = selectedType === config.value;
        const Icon = config.icon;
        const count = categoryCounts[config.value];

        return (
          <button
            key={config.value}
            onClick={() => onSelectType(config.value)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
              isSelected
                ? `bg-gradient-to-r ${config.gradient} border-white/20 text-white shadow-lg`
                : "bg-zinc-950/70 text-zinc-400 hover:text-zinc-200 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60"
            }`}
            style={{
              boxShadow: isSelected ? `0 4px 20px ${config.glow}` : undefined,
            }}
          >
            <Icon
              className="w-3.5 h-3.5"
              style={{ color: isSelected ? "#ffffff" : config.color }}
            />
            <span>{config.label}</span>
            {count !== undefined && count > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
