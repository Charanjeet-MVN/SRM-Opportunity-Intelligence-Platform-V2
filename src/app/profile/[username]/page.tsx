"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Compass } from "lucide-react";

// Redesigned Modular Profile Components
import StudentProfileHero from "@/components/profile/StudentProfileHero";
import StudentParticipationStats from "@/components/profile/StudentParticipationStats";
import StudentActivityTimeline from "@/components/profile/StudentActivityTimeline";
import StudentAchievementsSection from "@/components/profile/StudentAchievementsSection";
import StudentSkillsMatrix from "@/components/profile/StudentSkillsMatrix";

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
}

interface Certification {
  id: string;
  name: string;
  organization: string;
  date: string;
  progress?: number;
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
      description: "A complete platform for students featuring vector-matched recommendations, Kanban tracker boards, and real-time activity feeds.",
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
    },
  ],
  certifications: [
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
  ],
};

export default function PublicProfilePage() {
  const params = useParams();
  const usernameParam = (params?.username as string) || "Student";

  const [portfolio, setPortfolio] = useState<PortfolioData>(DEFAULT_PORTFOLIO);
  const [careerStats, setCareerStats] = useState({
    score: 185,
    completedGoals: 3,
    totalNotes: 6,
    badges: ["Knowledge Seeker", "Goal Achiever", "Opportunity Hunter", "Career Accelerator"],
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Platform</span>
          </Link>

          <div className="flex items-center gap-3 font-mono text-xs">
            <Link
              href="/opportunities"
              className="text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:inline-block"
            >
              Browse Feed
            </Link>
            <Link
              href="/dashboard/student"
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-100 font-medium transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* 1. Flagship Profile Hero */}
        <StudentProfileHero
          fullName={usernameParam}
          department="Computer Science & Engineering"
          yearOfStudy={3}
          registerNumber="RA2311003010123"
          bio={portfolio.bio}
          contact={portfolio.contact}
          score={94}
          isPublicView={true}
        />

        {/* 2. 3D Participation & Activity Stats */}
        <StudentParticipationStats
          eventsRegistered={4}
          workshopsJoined={3}
          opportunitiesSaved={6}
          activityScore={careerStats.score}
        />

        {/* 3. Skills Matrix */}
        <StudentSkillsMatrix />

        {/* 4. Activity & Event Participation Timeline */}
        <StudentActivityTimeline />

        {/* 5. Achievements, Certifications & Shipped Projects */}
        <StudentAchievementsSection
          certifications={portfolio.certifications}
          projects={portfolio.projects}
          badges={careerStats.badges}
        />
      </main>
    </div>
  );
}
