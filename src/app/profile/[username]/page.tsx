"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Github,
  Linkedin,
  Mail,
  Globe,
  Award,
  CheckCircle2,
  ExternalLink,
  Zap,
  Sparkles,
  FileCode,
  Compass,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
}

interface Certification {
  id: string;
  name: string;
  organization: string;
  date: string;
  progress: number;
}

interface PortfolioData {
  username: string;
  bio: string;
  contact: {
    email: string;
    github: string;
    linkedin: string;
    website: string;
  };
  projects: Project[];
  certifications: Certification[];
}

const DEFAULT_PORTFOLIO: PortfolioData = {
  username: "charan",
  bio: "Pre-Final Year CSE Student at SRM. Aspiring AI Product Engineer and Software Architect. Passionate about agentic workflows, Next.js, and high-performance Postgres vector indices.",
  contact: {
    email: "charanjeet.srm@gmail.com",
    github: "github.com/Charanjeet-MVN",
    linkedin: "linkedin.com/in/charanjeet",
    website: "charan.dev",
  },
  projects: [
    {
      id: "proj-1",
      name: "SRM Opportunity Intelligence Platform",
      description: "A complete Career Operating System for students featuring vector-matched recommendations, Kanban tracker boards, and real-time activity Feeds.",
      technologies: ["Next.js 15", "TypeScript", "TailwindCSS", "Supabase", "Framer Motion"],
      githubUrl: "https://github.com/Charanjeet-MVN/SRM-Opportunity-Intelligence-Platform-V2",
      liveUrl: "https://srm-opportunity-intelligence.vercel.app",
    },
    {
      id: "proj-2",
      name: "Agentic Workspace Client",
      description: "Notion + ChatGPT style dashboard featuring local note synchronization, interactive goals vectors, and automated AI learning roadmaps.",
      technologies: ["React", "Llama-3.1", "localStorage", "TypeScript"],
      githubUrl: "https://github.com/Charanjeet-MVN/Agentic-Workspace-Client",
      liveUrl: "https://workspace-client.dev",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Cloud Practitioner",
      organization: "Amazon Web Services (AWS)",
      date: "2026-04-12",
      progress: 100,
    },
    {
      id: "cert-2",
      name: "TensorFlow Developer Certificate",
      organization: "DeepLearning.AI",
      date: "2026-06-25",
      progress: 80,
    },
  ],
};

export default function PublicProfilePage() {
  const params = useParams();
  const usernameParam = params?.username as string;

  const [portfolio, setPortfolio] = useState<PortfolioData>(DEFAULT_PORTFOLIO);
  const [careerStats, setCareerStats] = useState({
    score: 185,
    completedGoals: 3,
    totalNotes: 6,
    badges: ["Knowledge Seeker", "Goal Achiever", "Opportunity Hunter"],
  });

  useEffect(() => {
    try {
      // If viewing matching local user, load custom portfolio details
      const saved = localStorage.getItem("soip_public_portfolio");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.username.toLowerCase() === usernameParam?.toLowerCase()) {
          setPortfolio(parsed);
        }
      }

      // Load career stats from local workspace items
      const savedGoals = localStorage.getItem("soip_workspace_goals");
      const savedNotes = localStorage.getItem("soip_workspace_notes");
      const savedResources = localStorage.getItem("soip_workspace_resources");

      const goalsList = savedGoals ? JSON.parse(savedGoals) : [];
      const notesList = savedNotes ? JSON.parse(savedNotes) : [];
      const resourcesList = savedResources ? JSON.parse(savedResources) : [];

      const completed = goalsList.filter((g: { status?: string }) => g.status === "completed").length;
      const score = 100 + (completed * 25) + (notesList.length * 10) + (resourcesList.filter((r: { saved?: boolean }) => r.saved).length * 15);

      const earnedBadges: string[] = [];
      if (notesList.length > 0) earnedBadges.push("Knowledge Seeker");
      if (completed > 0) earnedBadges.push("Goal Achiever");
      if (score >= 150) earnedBadges.push("Career Accelerator");
      if (resourcesList.filter((r: { saved?: boolean }) => r.saved).length > 0) earnedBadges.push("Opportunity Hunter");
      if (earnedBadges.length === 0) earnedBadges.push("Joined Pioneer");

      setCareerStats({
        score,
        completedGoals: completed,
        totalNotes: notesList.length,
        badges: earnedBadges,
      });
    } catch {
      // ignore
    }
  }, [usernameParam]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-mono py-12 px-4 selection:bg-purple-500/20 selection:text-purple-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Home */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-[10px] text-zinc-500 hover:text-purple-400 flex items-center gap-1.5 transition-colors font-bold uppercase"
          >
            <Compass className="w-4 h-4" />
            <span>SRM Opportunity Intelligence</span>
          </Link>
          <span className="text-[10px] text-zinc-600 font-bold uppercase">Public Profile</span>
        </div>

        {/* Profile Card Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-purple-950/20 border border-zinc-800/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-purple-400 text-3xl overflow-hidden shrink-0 shadow-2xl">
              {usernameParam ? usernameParam.charAt(0).toUpperCase() : "S"}
            </div>

            {/* Profile identifiers */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-100 uppercase">
                  {usernameParam || "Student"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                  SRM Student
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal max-w-md">
                CSE Department · Developer Identity Verified
              </p>
            </div>
          </div>

          {/* Activity telemetry */}
          <div className="w-full md:w-56 p-4 rounded-2xl bg-zinc-950/90 border border-zinc-850 space-y-2 shrink-0 shadow-lg relative">
            <div className="flex items-center justify-between text-xs font-bold font-mono">
              <span className="text-zinc-500 uppercase text-[9px]">Activity Vector</span>
              <span className="text-purple-405 flex items-center gap-1"><Zap className="w-3.5 h-3.5 fill-purple-450/15" />{careerStats.score} Pts</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-300"
                style={{ width: `${Math.min(careerStats.score / 3, 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-zinc-600 block">Completeness metric computed from workspace engagements</span>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3.5"
        >
          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Biography</span>
          <p className="text-xs text-zinc-350 leading-relaxed font-light whitespace-pre-line">
            {portfolio.bio}
          </p>

          {/* Social links */}
          <div className="flex flex-wrap gap-3 pt-2 text-[10px] text-zinc-500 font-mono">
            {portfolio.contact.email && (
              <a href={`mailto:${portfolio.contact.email}`} className="flex items-center gap-1.5 hover:text-purple-400 transition-colors">
                <Mail className="w-3.5 h-3.5 text-zinc-655" />
                <span>{portfolio.contact.email}</span>
              </a>
            )}
            {portfolio.contact.github && (
              <a href={`https://${portfolio.contact.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-purple-400 transition-colors">
                <Github className="w-3.5 h-3.5 text-zinc-655" />
                <span>{portfolio.contact.github}</span>
              </a>
            )}
            {portfolio.contact.linkedin && (
              <a href={`https://${portfolio.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-purple-400 transition-colors">
                <Linkedin className="w-3.5 h-3.5 text-zinc-655" />
                <span>{portfolio.contact.linkedin}</span>
              </a>
            )}
            {portfolio.contact.website && (
              <a href={`https://${portfolio.contact.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-purple-400 transition-colors">
                <Globe className="w-3.5 h-3.5 text-zinc-655" />
                <span>{portfolio.contact.website}</span>
              </a>
            )}
          </div>
        </motion.div>

        {/* Badges Earned Section */}
        {careerStats.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="space-y-2 text-xs font-mono"
          >
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Earned Badges</span>
            <div className="flex flex-wrap gap-2">
              {careerStats.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl text-[10px] bg-purple-500/10 text-purple-305 border border-purple-500/20 font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Projects & Certifications Split layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Projects (Left columns) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-4 md:col-span-7"
          >
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Featured Projects</span>
            <div className="space-y-4">
              {portfolio.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3.5 hover:border-zinc-700/60 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <h3 className="font-bold text-zinc-200">{proj.name}</h3>
                    <div className="flex items-center gap-3 text-zinc-500">
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors"><Github className="w-4 h-4" /></a>
                      <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors"><ExternalLink className="w-4 h-4" /></a>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-light">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {proj.technologies.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-zinc-950 text-zinc-500 rounded text-[9px] border border-zinc-850 font-mono">{t}</span>
                    ))}
                  </div>
                </div>
              ))}

              {portfolio.projects.length === 0 && (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10 text-zinc-650 text-xs">
                  <FileCode className="w-6 h-6 mx-auto mb-2 text-zinc-700" />
                  <span>No featured projects added yet</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Certifications (Right columns) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="space-y-4 md:col-span-5"
          >
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Credentials</span>
            <div className="space-y-3">
              {portfolio.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                        cert.progress === 100
                          ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {cert.progress === 100 ? "Completed" : `${cert.progress}%`}
                      </span>
                      <h4 className="font-bold text-zinc-200 truncate">{cert.name}</h4>
                    </div>
                    <p className="text-[10px] text-zinc-500 truncate font-light">{cert.organization} · {cert.date}</p>
                  </div>
                  {cert.progress === 100 && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                </div>
              ))}

              {portfolio.certifications.length === 0 && (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10 text-zinc-650 text-xs">
                  <Award className="w-6 h-6 mx-auto mb-2 text-zinc-700" />
                  <span>No credentials tracked yet</span>
                </div>
              )}
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
