"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Sparkles,
  CheckCircle2,
  Trophy,
  BookOpen,
  Briefcase,
  ShieldCheck,
  Zap
} from "lucide-react";

interface SkillNode {
  id: string;
  label: string;
  category: string;
}

interface OpportunityNode {
  id: string;
  title: string;
  type: string;
  org: string;
  badgeText: string;
  matchScore: number;
  icon: React.ElementType;
  skills: string[];
  deadline: string;
}

const SKILL_NODES: SkillNode[] = [
  { id: "ai", label: "AI / Machine Learning", category: "Core Vector" },
  { id: "web", label: "Full Stack Web", category: "Development" },
  { id: "research", label: "Academic Research", category: "Publication" },
  { id: "robotics", label: "Embedded Systems", category: "Hardware" }
];

const OPPORTUNITIES: OpportunityNode[] = [
  {
    id: "op-1",
    title: "SRM National AI Hackathon 2026",
    type: "Hackathon",
    org: "Next Tech Lab & IEEE SRM",
    badgeText: "Verified Club",
    matchScore: 98,
    icon: Trophy,
    skills: ["ai", "web"],
    deadline: "4 Days Left"
  },
  {
    id: "op-2",
    title: "Generative AI Research Assistantship",
    type: "Research Grant",
    org: "Dept of Computer Science",
    badgeText: "Faculty Research",
    matchScore: 95,
    icon: BookOpen,
    skills: ["ai", "research"],
    deadline: "Next Week"
  },
  {
    id: "op-3",
    title: "Autonomous Systems Summer Fellowship",
    type: "Internship",
    org: "SRM Innovation Lab",
    badgeText: "Verified Lab",
    matchScore: 91,
    icon: Briefcase,
    skills: ["robotics", "ai"],
    deadline: "Active Now"
  }
];

export function HeroVisual() {
  const [selectedSkill, setSelectedSkill] = useState<string>("ai");
  const [hoveredOp, setHoveredOp] = useState<string | null>(null);

  // Filter or score opportunities based on selected skill
  const getScore = (op: OpportunityNode) => {
    return op.skills.includes(selectedSkill)
      ? op.matchScore
      : Math.max(70, op.matchScore - 18);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-12 mb-8">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-emerald-500/10 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

      {/* Main Visual Container */}
      <div className="relative rounded-2xl bg-zinc-950/90 border border-zinc-800/90 p-5 sm:p-7 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Top Intelligence Pipeline Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-zinc-800/70 text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="text-indigo-400 font-semibold uppercase tracking-wider">
              Intelligence Pipeline
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">SRM Student Vector Engine</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" /> Strict RLS Active
            </span>
            <span className="hidden sm:inline-block text-zinc-500">Live Database Match</span>
          </div>
        </div>

        {/* 4-Step Diagram Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Step 1: Student Skills (3 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px]">1</span>
                Student Vector
              </span>
              <span className="text-[10px] text-zinc-500">Select to test</span>
            </div>

            <div className="space-y-2">
              {SKILL_NODES.map((skill) => {
                const isActive = selectedSkill === skill.id;
                return (
                  <motion.button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                      isActive
                        ? "bg-indigo-950/40 border-indigo-500/60 text-zinc-100 shadow-md shadow-indigo-950/50"
                        : "bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isActive ? "bg-indigo-400 shadow-sm shadow-indigo-400" : "bg-zinc-700"
                        }`}
                      />
                      <div>
                        <div className="font-semibold">{skill.label}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{skill.category}</div>
                      </div>
                    </div>
                    {isActive && (
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Center Intelligence Hub (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 relative">
            {/* SVG Connecting Flow Lines for desktop */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
              <svg className="w-full h-full stroke-indigo-500/30" fill="none">
                <line x1="0" y1="50%" x2="50%" y2="50%" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="50%" y1="50%" x2="100%" y2="50%" strokeWidth="1.5" strokeDasharray="4 4" />
              </svg>
            </div>

            {/* Central Node Visual */}
            <div className="relative z-10 w-full max-w-[220px] p-5 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-indigo-500/40 shadow-xl shadow-indigo-950/40 text-center space-y-3">
              <div className="relative mx-auto w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
                <Cpu className="w-6 h-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-zinc-950" />
              </div>

              <div>
                <div className="text-xs font-semibold text-zinc-100 tracking-tight">
                  Intelligence Engine
                </div>
                <div className="text-[10px] text-indigo-300 font-mono mt-0.5">
                  Relevance Match Scoring
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                <span className="text-zinc-500">Vector Confidence</span>
                <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" /> High Precision
                </span>
              </div>
            </div>
          </div>

          {/* Step 3 & 4: Matched Opportunities Output (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px]">2</span>
                Matched Opportunities
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Ranked by Vector</span>
            </div>

            <div className="space-y-2.5">
              {OPPORTUNITIES.map((op) => {
                const score = getScore(op);
                const isHovered = hoveredOp === op.id;
                const IconComponent = op.icon;

                return (
                  <motion.div
                    key={op.id}
                    onMouseEnter={() => setHoveredOp(op.id)}
                    onMouseLeave={() => setHoveredOp(null)}
                    layout
                    className={`p-3 rounded-xl border transition-all ${
                      isHovered
                        ? "bg-zinc-900 border-indigo-500/50 shadow-lg shadow-black/40"
                        : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-zinc-800 text-indigo-400 border border-zinc-700/60 shrink-0">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-zinc-200 line-clamp-1">
                            {op.title}
                          </div>
                          <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <span>{op.org}</span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-indigo-400/90 font-medium">{op.badgeText}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            score >= 90
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          }`}
                        >
                          {score}% Match
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="mt-6 pt-4 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Database-backed verified SRM opportunity feed</span>
          </div>
          <div className="font-mono text-[10px] text-zinc-400">
            Student → Skills & Interests → Intelligence → Action
          </div>
        </div>
      </div>
    </div>
  );
}
