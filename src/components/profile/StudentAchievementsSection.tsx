"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Award,
  Trophy,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  FileCode,
} from "lucide-react";

interface CertificationItem {
  id: string;
  name: string;
  organization: string;
  date: string;
  progress?: number;
}

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
}

interface StudentAchievementsSectionProps {
  certifications?: CertificationItem[];
  projects?: ProjectItem[];
  badges?: string[];
}

const DEFAULT_CERTS: CertificationItem[] = [
  {
    id: "cert-1",
    name: "AWS Certified Cloud Practitioner",
    organization: "Amazon Web Services (AWS)",
    date: "April 2026",
    progress: 100,
  },
  {
    id: "cert-2",
    name: "TensorFlow Developer Certificate",
    organization: "DeepLearning.AI",
    date: "June 2026",
    progress: 100,
  },
];

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    name: "SRM Opportunity Intelligence Platform",
    description: "Vector-matched opportunity recommender with 3D spatial cards and real-time activity feeds.",
    technologies: ["Next.js 15", "TypeScript", "Supabase", "Framer Motion"],
    githubUrl: "https://github.com/Charanjeet-MVN/SRM-Opportunity-Intelligence-Platform-V2",
    liveUrl: "https://srm-opportunity-intelligence.vercel.app",
  },
  {
    id: "proj-2",
    name: "Autonomous Agentic Workspace",
    description: "Interactive task orchestrator with notes sync, goal vectors, and learning roadmaps.",
    technologies: ["React", "Llama-3.1", "TypeScript", "TailwindCSS"],
    githubUrl: "https://github.com/Charanjeet-MVN/Agentic-Workspace-Client",
  },
];

export default function StudentAchievementsSection({
  certifications = DEFAULT_CERTS,
  projects = DEFAULT_PROJECTS,
  badges = ["Knowledge Seeker", "Goal Achiever", "Opportunity Hunter", "Career Accelerator"],
}: StudentAchievementsSectionProps) {
  return (
    <div className="space-y-8">
      {/* 1. Earned Badges Strip */}
      {badges.length > 0 && (
        <div className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-5 sm:p-6 space-y-3 shadow-xl backdrop-blur-xl">
          <span className="text-[10px] uppercase font-mono font-bold text-zinc-500 tracking-wider block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Earned Platform Badges & Accreditations</span>
          </span>

          <div className="flex flex-wrap gap-2.5">
            {badges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="px-3.5 py-1.5 rounded-2xl bg-purple-500/10 text-purple-300 border border-purple-500/25 font-mono text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>{badge}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Split Columns: Featured Projects & Verified Certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Featured Projects (7 Columns) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-zinc-800/70 pb-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-indigo-400 tracking-wider">
              <FileCode className="w-4 h-4" />
              <span>Shipped Projects & Engineering Builds</span>
            </div>
          </div>

          <div className="space-y-4">
            {projects.map((proj, idx) => (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all space-y-3 shadow-xl backdrop-blur-xl group"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                    {proj.name}
                  </h4>

                  <div className="flex items-center gap-2">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-500 hover:text-zinc-200 text-xs font-mono transition-colors"
                      >
                        GitHub
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-mono inline-flex items-center gap-0.5"
                      >
                        <span>Demo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  {proj.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.technologies.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono bg-zinc-950 border border-zinc-800 text-zinc-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Verified Credentials (5 Columns) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-zinc-800/70 pb-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-emerald-400 tracking-wider">
              <Award className="w-4 h-4" />
              <span>Verified Credentials</span>
            </div>
          </div>

          <div className="space-y-3">
            {certifications.map((cert, idx) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-3 shadow-lg"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                      Verified
                    </span>
                    <h5 className="text-xs font-bold text-zinc-100 truncate">
                      {cert.name}
                    </h5>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500 truncate">
                    {cert.organization} · {cert.date}
                  </p>
                </div>

                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
