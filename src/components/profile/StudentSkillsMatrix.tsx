"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface StudentSkillsMatrixProps {
  skills?: string[];
  interests?: string[];
}

export default function StudentSkillsMatrix({
  skills = ["Next.js", "TypeScript", "Python", "PyTorch", "PostgreSQL", "TailwindCSS", "Docker", "Git"],
  interests = ["AI / Machine Learning", "Full-Stack Web Development", "Cloud Architecture", "Competitive Programming"],
}: StudentSkillsMatrixProps) {
  return (
    <div className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-purple-400 tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Opportunity Relevance Skill Vectors</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-100">
            Validated Academic & Technical Competencies
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
          {skills.length} Technical Skills
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technical Skills */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider block">
            Technical Stack & Tools
          </span>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.04 }}
                className="px-3 py-1.5 rounded-xl text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-200 hover:border-purple-500/40 hover:text-purple-300 transition-colors shadow-sm"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Career Interests */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider block">
            Career Domains & Target Focus
          </span>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, idx) => (
              <motion.span
                key={interest}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.04 }}
                className="px-3 py-1.5 rounded-xl text-xs font-mono bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 shadow-sm font-medium"
              >
                {interest}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
