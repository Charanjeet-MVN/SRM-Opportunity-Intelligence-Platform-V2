/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Award,
  BookOpen,
  Sparkles,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  Calendar,
  ChevronRight,
  Cpu,
  Layers,
  Briefcase,
  ShieldCheck,
  Layout,
  MessageSquare,
  FileText,
  AlertCircle,
  TrendingUp,
  Bookmark,
} from "lucide-react";
import HoverCard from "@/components/ui/HoverCard";
import MagneticButton from "@/components/ui/MagneticButton";
import EmptyState from "@/components/ui/EmptyState";

interface Milestone {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  date?: string;
}

interface VaultItem {
  id: string;
  title: string;
  issuer: string;
  type: "Certificate" | "Award" | "Badge";
  date: string;
  tags: string[];
}

const DEFAULT_VAULT_ITEMS: VaultItem[] = [
  { id: "v-1", title: "Next.js Core Specialist", issuer: "Vercel", type: "Certificate", date: "2025-11-15", tags: ["React", "Next.js", "Frontend"] },
  { id: "v-2", title: "Meta Llama Hackathon Winner", issuer: "Meta AI", type: "Award", date: "2026-04-10", tags: ["AI/ML", "Python", "LlamaIndex"] },
  { id: "v-3", title: "AWS Cloud Practitioner", issuer: "Amazon Web Services", type: "Certificate", date: "2025-08-20", tags: ["AWS", "Cloud", "DevOps"] },
  { id: "v-4", title: "SRM Coding Champion", issuer: "SRM Career Centre", type: "Badge", date: "2025-06-05", tags: ["Algorithms", "DSA"] },
  { id: "v-5", title: "PostgreSQL Database Architect", issuer: "Supabase Academy", type: "Certificate", date: "2026-01-30", tags: ["Database", "SQL"] }
];

export default function StudentOperatingSystemClient() {
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "journey" | "vault" | "goals" | "journal">("dashboard");

  // Local storage state synced lists
  const [goalsList, setGoalsList] = useState<Array<{ id: string; title: string; category?: string; dueDate: string; progress: number; status: string }>>([]);
  const [notesList, setNotesList] = useState<Array<{ id: string; title: string; category: string; content: string; date: string; pinned?: boolean }>>([]);
  const [portfolio, setPortfolio] = useState<{ skills: string[]; projects: Array<{ name: string; description: string }>; certifications: Array<{ title: string; issuer: string }> } | null>(null);

  // Search filter inside vault
  const [vaultSearch, setVaultSearch] = useState("");
  const [vaultFilter, setVaultFilter] = useState<string>("all");

  // Goals engine form input
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCat, setNewGoalCat] = useState("career");
  const [newGoalDue, setNewGoalDue] = useState("");

  // Journal reflections form input
  const [journalTitle, setJournalTitle] = useState("");
  const [journalCat, setJournalCat] = useState("Reflections");
  const [journalContent, setJournalContent] = useState("");

  const [savingMsg, setSavingMsg] = useState<string | null>(null);

  // Sync with localStorage on mount
  useEffect(() => {
    try {
      const savedGoals = localStorage.getItem("soip_workspace_goals");
      const savedNotes = localStorage.getItem("soip_workspace_notes");
      const savedPortfolio = localStorage.getItem("soip_public_portfolio");

      if (savedGoals) setGoalsList(JSON.parse(savedGoals));
      if (savedNotes) setNotesList(JSON.parse(savedNotes));
      if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
    } catch {
      // ignore
    }
  }, []);

  // Save changes helper functions
  const saveGoals = (updated: typeof goalsList) => {
    setGoalsList(updated);
    localStorage.setItem("soip_workspace_goals", JSON.stringify(updated));
  };

  const saveNotes = (updated: typeof notesList) => {
    setNotesList(updated);
    localStorage.setItem("soip_workspace_notes", JSON.stringify(updated));
  };

  // Add new Goal handler
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const goal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle.trim(),
      category: newGoalCat,
      dueDate: newGoalDue || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      progress: 0,
      status: "not_started"
    };

    const updated = [...goalsList, goal];
    saveGoals(updated);

    setNewGoalTitle("");
    setNewGoalDue("");
    setSavingMsg("New Goal created in Goal Engine!");
    setTimeout(() => setSavingMsg(null), 2500);
  };

  // Toggle goal status
  const handleToggleGoal = (id: string) => {
    const updated = goalsList.map(g => {
      if (g.id === id) {
        const newStatus = g.status === "completed" ? "not_started" : "completed";
        return { ...g, status: newStatus, progress: newStatus === "completed" ? 100 : 0 };
      }
      return g;
    });
    saveGoals(updated);
  };

  // Delete goal
  const handleDeleteGoal = (id: string) => {
    const updated = goalsList.filter(g => g.id !== id);
    saveGoals(updated);
  };

  // Write new Journal Note handler
  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim() || !journalContent.trim()) return;

    const note = {
      id: `note-${Date.now()}`,
      title: journalTitle.trim(),
      category: journalCat,
      content: journalContent.trim(),
      date: new Date().toISOString(),
      pinned: false
    };

    const updated = [note, ...notesList];
    saveNotes(updated);

    setJournalTitle("");
    setJournalContent("");
    setSavingMsg("Reflection logged to Career Journal!");
    setTimeout(() => setSavingMsg(null), 2500);
  };

  // Delete journal entry
  const handleDeleteJournal = (id: string) => {
    const updated = notesList.filter(n => n.id !== id);
    saveNotes(updated);
  };

  // Compute stats metrics dynamically
  const dynamicStats = useMemo(() => {
    const completedGoals = goalsList.filter(g => g.status === "completed").length;
    const pendingGoals = goalsList.filter(g => g.status !== "completed").length;
    
    const skillsCount = portfolio?.skills?.length || 6;
    const projectsCount = portfolio?.projects?.length || 2;
    const certsCount = portfolio?.certifications?.length || 1;

    // Career Completeness Score formula
    const baseScore = Math.min(skillsCount * 5 + projectsCount * 10 + certsCount * 10 + completedGoals * 8, 100);

    return {
      completedGoals,
      pendingGoals,
      skillsCount,
      projectsCount,
      certsCount,
      careerScore: Math.max(baseScore, 65)
    };
  }, [goalsList, portfolio]);

  // Milestone list definitions
  const milestones: Milestone[] = useMemo(() => {
    return [
      { id: "m-1", title: "First SRM Onboard", description: "Completed onboarding profile registration", unlocked: true, date: "2025-08-20" },
      { id: "m-2", title: "First Goal Logged", description: "Created an active goal in workspace engine", unlocked: goalsList.length > 0 },
      { id: "m-3", title: "First Project Showcase", description: "Registered a live project inside Portfolio Studio", unlocked: dynamicStats.projectsCount > 0 },
      { id: "m-4", title: "Credentials Unlocked", description: "Verified your first professional certification", unlocked: dynamicStats.certsCount > 0 },
      { id: "m-5", title: "Career Placement Ready", description: "Attained overall career readiness index score >= 75%", unlocked: dynamicStats.careerScore >= 75 },
    ];
  }, [goalsList, dynamicStats]);

  // Filter vault items
  const filteredVault = useMemo(() => {
    return DEFAULT_VAULT_ITEMS.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(vaultSearch.toLowerCase()) ||
                          item.issuer.toLowerCase().includes(vaultSearch.toLowerCase()) ||
                          item.tags.some(t => t.toLowerCase().includes(vaultSearch.toLowerCase()));
      const matchFilter = vaultFilter === "all" || item.type.toLowerCase() === vaultFilter.toLowerCase();
      return matchSearch && matchFilter;
    });
  }, [vaultSearch, vaultFilter]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 font-mono text-zinc-350">
      
      {/* Left Column: Command cockpit sidebar tabs */}
      <div className="w-full lg:w-64 shrink-0 space-y-3">
        <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold text-zinc-200">SOS Controls</h2>
          </div>
          <span className="text-[9px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded font-bold uppercase">Active</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {[
            { id: "dashboard", label: "Executive Dash", icon: Layout },
            { id: "journey", label: "My Journey & Milestones", icon: Clock },
            { id: "vault", label: "Achievement Vault", icon: Award },
            { id: "goals", label: "Goal Engine", icon: TargetIcon },
            { id: "journal", label: "Career Journal", icon: BookOpen }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as typeof activeSubTab);
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer text-xs ${
                  isSelected
                    ? "bg-purple-955/20 border-purple-500/30 text-purple-300 font-bold"
                    : "bg-zinc-900/30 border-zinc-850/80 hover:border-zinc-800 text-zinc-400"
                }`}
              >
                <TabIcon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sync telemetry indicators */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850/80 space-y-2">
          <span className="text-[8px] text-zinc-500 uppercase font-bold block tracking-wider">Sync Status</span>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Memory Vectors Synced</span>
          </div>
          {savingMsg && (
            <div className="text-[9px] text-purple-400 animate-pulse font-bold leading-normal">
              {savingMsg}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Active workspace render panel */}
      <div className="flex-1 space-y-6">
        
        {/* EXECUTIVE DASHBOARD */}
        {activeSubTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Command metrics overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <HoverCard className="p-5" glowColor="rgba(168, 85, 247, 0.15)">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Career Index</span>
                <div className="text-2xl font-black text-purple-400 font-mono">{dynamicStats.careerScore}%</div>
                <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${dynamicStats.careerScore}%` }} />
                </div>
              </HoverCard>

              <HoverCard className="p-5" glowColor="rgba(245, 158, 11, 0.15)">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Goals Handled</span>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {dynamicStats.completedGoals} <span className="text-xs text-zinc-555">/ {goalsList.length}</span>
                </div>
                <span className="text-[9px] text-zinc-555 block font-light">
                  {goalsList.length > 0 ? Math.round((dynamicStats.completedGoals / goalsList.length) * 100) : 0}% completed
                </span>
              </HoverCard>

              <HoverCard className="p-5 col-span-2 sm:col-span-1" glowColor="rgba(16, 185, 129, 0.15)">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Vault Items</span>
                <div className="text-2xl font-black text-emerald-400 font-mono">{DEFAULT_VAULT_ITEMS.length}</div>
                <span className="text-[9px] text-zinc-555 block font-light">Verified campus certs & badges</span>
              </HoverCard>
            </div>

            {/* Smart Summaries & Productivity panel */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Smart Insights Panel (7 columns) */}
              <HoverCard className="md:col-span-7 p-6 space-y-4" glowColor="rgba(139, 92, 246, 0.12)">
                <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                  <h3 className="text-xs uppercase font-bold text-zinc-200">Generative SOS Insights</h3>
                </div>

                <div className="space-y-3 text-xs leading-relaxed font-light">
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                    <p>
                      You completed <span className="font-bold text-purple-300">{dynamicStats.completedGoals} goals</span> this month and added <span className="font-bold text-indigo-300">{dynamicStats.projectsCount} projects</span> to your portfolio studio stack.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <p>
                      Your career index score has increased by <span className="font-bold text-emerald-400">7%</span> this week following the verification of your latest cloud credentials.
                    </p>
                  </div>
                </div>
              </HoverCard>

              {/* Productivity Center (5 columns) */}
              <HoverCard className="md:col-span-5 p-6 space-y-4" glowColor="rgba(245, 158, 11, 0.12)">
                <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs uppercase font-bold text-zinc-200">Productivity Center</h3>
                </div>

                <div className="space-y-3.5 text-xs font-mono">
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-zinc-550 uppercase font-bold tracking-wide">Pending Milestones</span>
                    {goalsList.filter(g => g.status !== "completed").slice(0, 2).map(g => (
                      <div key={g.id} className="flex items-center justify-between text-[11px] font-light">
                        <span className="truncate max-w-[150px]">{g.title}</span>
                        <span className="text-zinc-500 text-[10px]">Due: {g.dueDate}</span>
                      </div>
                    ))}
                    {goalsList.filter(g => g.status !== "completed").length === 0 && (
                      <span className="text-[10px] text-zinc-650 font-light block">No pending workspace goals.</span>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[9px] text-zinc-550 uppercase font-bold tracking-wide">Suggested Quick Action</span>
                    <Link
                      href="/dashboard/student/workspace"
                      className="block p-2 rounded-lg bg-zinc-950 border border-zinc-850 hover:border-zinc-800 text-[10px] text-zinc-300 font-bold transition-all text-center"
                    >
                      Audit AI Workspace roadmap
                    </Link>
                  </div>
                </div>
              </HoverCard>

            </div>
          </motion.div>
        )}

        {/* MY JOURNEY & MILESTONES */}
        {activeSubTab === "journey" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Timeline Cockpit */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl">
              <div>
                <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Interactive Career Journey
                </h3>
                <p className="text-[10px] text-zinc-550">Interactive horizontal milestone ticks synced from registration history</p>
              </div>

              {/* Milestones Checklists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                      m.unlocked
                        ? "bg-purple-955/15 border-purple-500/25 text-purple-300"
                        : "bg-zinc-950/40 border-zinc-900 text-zinc-500"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="font-bold text-zinc-200 block truncate">{m.title}</span>
                      <p className="text-[9px] text-zinc-450 leading-relaxed font-light">{m.description}</p>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {m.unlocked ? (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[9px] font-bold">UNLOCKED</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-zinc-900 text-zinc-650 rounded text-[9px]">LOCKED</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Vertical Timeline Roadmap */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850/80 space-y-4">
                <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono block">Timeline Chronicle</span>
                
                <div className="relative pl-4 border-l border-zinc-800 space-y-4 pt-1 pb-1 text-xs">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-purple-600 border border-zinc-950 flex items-center justify-center">
                      <CheckCircle className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-bold text-purple-400 font-mono">AUG 2025</span>
                      <h4 className="font-bold text-zinc-200">Joined SRM Intelligence Cockpit</h4>
                      <p className="text-[9px] text-zinc-500 font-light">Workspace initialized, synchronized local settings</p>
                    </div>
                  </div>

                  {goalsList.filter(g => g.status === "completed").map((g, idx) => (
                    <div key={g.id} className="relative">
                      <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-emerald-600 border border-zinc-950 flex items-center justify-center">
                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold text-emerald-400 font-mono">GOAL COMPLETED</span>
                        <h4 className="font-bold text-zinc-200">{g.title}</h4>
                        <p className="text-[9px] text-zinc-500 font-light">Marked completed via Goal Engine</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ACHIEVEMENT VAULT */}
        {activeSubTab === "vault" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-5 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
              <div>
                <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-400" />
                  Achievement Vault
                </h3>
                <p className="text-[10px] text-zinc-550 font-mono">Browse and filter verified qualifications registry</p>
              </div>

              {/* Vault Category selector */}
              <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-850">
                {["all", "Certificate", "Award", "Badge"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setVaultFilter(type)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                      vaultFilter === type ? "bg-zinc-900 text-purple-300" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input bar */}
            <div className="relative">
              <input
                type="text"
                value={vaultSearch}
                onChange={(e) => setVaultSearch(e.target.value)}
                placeholder="Search credentials issuer or technology..."
                className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-300"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>

            {/* Credentials catalog cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              {filteredVault.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 flex flex-col justify-between gap-3 shadow-inner">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-200">{item.title}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded font-bold">{item.type}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 block">Issued by: {item.issuer}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {item.tags.map(t => (
                      <span key={t} className="px-1.5 py-0.1 bg-zinc-900 border border-zinc-850 rounded text-[9px] text-zinc-400">{t}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-900 pt-2 text-[9px] text-zinc-550">
                    <span>Verified: {item.date}</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Security Sealed
                    </span>
                  </div>
                </div>
              ))}
              {filteredVault.length === 0 && (
                <div className="py-12 text-center text-zinc-500 col-span-2 space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto animate-pulse" />
                  <p className="text-xs">No credentials found matching query.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* GOAL ENGINE */}
        {activeSubTab === "goals" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Create new goal */}
            <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
              <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                <Plus className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs uppercase font-bold text-zinc-200">Initialize New Goal</h3>
              </div>

              <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <div className="sm:col-span-6 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase">Goal Title</span>
                  <input
                    type="text"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    placeholder="e.g. Complete AWS Dev Associate"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase">Category</span>
                  <select
                    value={newGoalCat}
                    onChange={(e) => setNewGoalCat(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-zinc-300 focus:outline-none"
                  >
                    <option value="academic">Academic</option>
                    <option value="career">Career</option>
                    <option value="skill">Skill</option>
                    <option value="placement">Placement</option>
                  </select>
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase">Due Date</span>
                  <input
                    type="date"
                    value={newGoalDue}
                    onChange={(e) => setNewGoalDue(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-12 pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all text-xs cursor-pointer shadow-md shadow-purple-600/10"
                  >
                    Add Goal
                  </button>
                </div>
              </form>
            </div>

            {/* Goals List logs */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
              <div>
                <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                  Goals Logs Database
                </h3>
                <p className="text-[10px] text-zinc-550 font-mono">Workspace goals persisted locally</p>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {goalsList.map((g) => (
                  <div
                    key={g.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 text-xs font-mono transition-all ${
                      g.status === "completed"
                        ? "bg-emerald-955/10 border-emerald-500/20 text-emerald-400"
                        : "bg-zinc-950 border-zinc-900 hover:border-zinc-850"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleGoal(g.id)}
                        className="p-1 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white cursor-pointer"
                      >
                        {g.status === "completed" ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-zinc-700" />
                        )}
                      </button>

                      <div className="space-y-0.5">
                        <span className={`font-bold block truncate max-w-[200px] sm:max-w-md ${g.status === "completed" ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                          {g.title}
                        </span>
                        <div className="flex items-center gap-2 text-[9px] text-zinc-550 font-mono">
                          <span className="uppercase text-[8px] px-1 bg-zinc-900 rounded font-bold">{g.category || "Skill"}</span>
                          <span>•</span>
                          <span>Due: {g.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-2 text-zinc-550 hover:text-rose-400 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {goalsList.length === 0 && (
                  <div className="py-8 text-center text-zinc-650 text-xs">
                    No active goals. Add one above to begin tracking.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* CAREER JOURNAL */}
        {activeSubTab === "journal" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Journal log editor */}
            <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
              <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs uppercase font-bold text-zinc-200">Write Journal Entry</h3>
              </div>

              <form onSubmit={handleAddJournal} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold block uppercase">Entry Title</span>
                    <input
                      type="text"
                      value={journalTitle}
                      onChange={(e) => setJournalTitle(e.target.value)}
                      placeholder="e.g. Mock Interview Reflections"
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                    />
                  </div>

                  <div className="sm:col-span-4 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold block uppercase">Category</span>
                    <select
                      value={journalCat}
                      onChange={(e) => setJournalCat(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-zinc-300 focus:outline-none"
                    >
                      <option value="Reflections">Reflection Note</option>
                      <option value="Learnings">Learning Log</option>
                      <option value="Internship Notes">Internship Diary</option>
                      <option value="Interview Notes">Interview Prep</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase">Entry Body Content</span>
                  <textarea
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    placeholder="Write learnings, thoughts, code reflections, or project plans here..."
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all text-xs cursor-pointer shadow-md shadow-purple-600/10"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </div>

            {/* Saved journals logs */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
              <div>
                <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                  Journal Reflections Archive
                </h3>
                <p className="text-[10px] text-zinc-550 font-mono">Read logs and reflections from workspace</p>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {notesList.map((n) => (
                  <div key={n.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-905 flex flex-col justify-between gap-3 text-xs font-mono shadow-inner relative">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-bold text-zinc-250 block truncate max-w-[200px] sm:max-w-md">{n.title}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.1 bg-zinc-900 text-zinc-500 rounded border border-zinc-850 font-bold">{n.category}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteJournal(n.id)}
                        className="p-1.5 text-zinc-600 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-400 font-light leading-relaxed whitespace-pre-line pt-1">
                      {n.content}
                    </p>

                    <div className="flex justify-end text-[8px] text-zinc-600 font-mono pt-1">
                      <span>Log date: {new Date(n.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {notesList.length === 0 && (
                  <div className="py-8 text-center text-zinc-650 text-xs">
                    No journal reflections logged. Write your first reflection above.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

// Custom UI TargetIcon stub
function TargetIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={props.className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" />
    </svg>
  );
}
