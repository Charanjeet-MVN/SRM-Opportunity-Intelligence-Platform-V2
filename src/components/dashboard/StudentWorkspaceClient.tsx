"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Search,
  Calendar,
  CheckCircle2,
  Award,
  FileText,
  Layout,
  Target,
  RefreshCw,
  X,
  Bookmark,
  Pin,
  ExternalLink,
} from "lucide-react";
import { TrackerOpportunity } from "@/components/opportunities/StudentOpportunityTracker";

interface StudentWorkspaceClientProps {
  initialSavedOpportunities?: TrackerOpportunity[];
}

interface Note {
  id: string;
  title: string;
  content: string;
  category: "text" | "career" | "interview" | "learning";
  isPinned: boolean;
  updatedAt: string;
}

interface Goal {
  id: string;
  title: string;
  progress: number; // 0 to 100
  dueDate: string;
  status: "not_started" | "in_progress" | "completed";
}

interface LearningResource {
  id: string;
  title: string;
  category: string;
  type: string;
  url: string;
  saved: boolean;
  progress: number;
}

interface ActionPlanItem {
  id: string;
  text: string;
  period: "today" | "week" | "month";
  completed: boolean;
}

const DEFAULT_RESOURCES: LearningResource[] = [
  { id: "res-1", title: "Complete Machine Learning Zoomcamp", category: "AI/ML", type: "Course", url: "https://github.com/alexeygrigorev/mlbookcamp-code/tree/master/course", saved: false, progress: 0 },
  { id: "res-2", title: "NeetCode 150 DSA Practice Guide", category: "DSA", type: "Practice", url: "https://neetcode.io/practice", saved: false, progress: 0 },
  { id: "res-3", title: "Stripe System Design Case Studies", category: "Web Development", type: "Article", url: "https://stripe.com/blog", saved: false, progress: 0 },
  { id: "res-4", title: "Alex Xu ByteByteGo System Design", category: "System Design", type: "Book", url: "https://bytebytego.com", saved: false, progress: 0 },
  { id: "res-5", title: "Product Management Fundamentals", category: "Product Management", type: "Course", url: "https://productschool.com", saved: false, progress: 0 },
];

export default function StudentWorkspaceClient({
  initialSavedOpportunities = [],
}: StudentWorkspaceClientProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "notes" | "goals" | "resources" | "roadmaps">("dashboard");

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteSearch, setNoteSearch] = useState("");
  const [selectedNoteCategory, setSelectedNoteCategory] = useState<string>("all");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note>>({});

  // Goals state
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Partial<Goal>>({});

  // Resources state
  const [learningResources, setLearningResources] = useState<LearningResource[]>(DEFAULT_RESOURCES);

  // Action plan state
  const [actionPlan, setActionPlan] = useState<ActionPlanItem[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Generative AI Roadmap state
  const [roadmapQuery, setRoadmapQuery] = useState("");
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [currentRoadmap, setCurrentRoadmap] = useState<{
    role: string;
    steps: { title: string; desc: string; completed: boolean }[];
  } | null>(null);

  // Local storage loading
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("soip_workspace_notes");
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      else {
        const defaultNotes: Note[] = [
          { id: "note-1", title: "Google STEP Prep Checklist", content: "Review standard array & string manipulation questions.\nFocus on Big-O notation complexity.", category: "interview", isPinned: true, updatedAt: new Date().toISOString() },
          { id: "note-2", title: "Next Tech Lab AI Stack Plan", content: "Use Llama 3.1 8B via Groq API. Build the frontend in Next.js 15. Verify type safety.", category: "career", isPinned: false, updatedAt: new Date().toISOString() },
        ];
        setNotes(defaultNotes);
        localStorage.setItem("soip_workspace_notes", JSON.stringify(defaultNotes));
      }

      const savedGoals = localStorage.getItem("soip_workspace_goals");
      if (savedGoals) setGoals(JSON.parse(savedGoals));
      else {
        const defaultGoals: Goal[] = [
          { id: "goal-1", title: "Learn React & Next.js 15", progress: 60, dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "in_progress" },
          { id: "goal-2", title: "Complete 100 DSA Problems", progress: 20, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "in_progress" },
          { id: "goal-3", title: "Secure Summer Research Fellowship", progress: 0, dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], status: "not_started" },
        ];
        setGoals(defaultGoals);
        localStorage.setItem("soip_workspace_goals", JSON.stringify(defaultGoals));
      }

      const savedResources = localStorage.getItem("soip_workspace_resources");
      if (savedResources) setLearningResources(JSON.parse(savedResources));

      const savedPlan = localStorage.getItem("soip_workspace_actionplan");
      if (savedPlan) setActionPlan(JSON.parse(savedPlan));
      else {
        const defaultPlan: ActionPlanItem[] = [
          { id: "plan-1", text: "Apply to Google STEP Internship", period: "today", completed: false },
          { id: "plan-2", text: "Complete Next.js 15 project setup", period: "week", completed: false },
          { id: "plan-3", text: "Review 15 system design articles", period: "week", completed: false },
          { id: "plan-4", text: "Attend Hackathon & present AI agent", period: "month", completed: false },
        ];
        setActionPlan(defaultPlan);
        localStorage.setItem("soip_workspace_actionplan", JSON.stringify(defaultPlan));
      }

      const savedRoadmap = localStorage.getItem("soip_workspace_ai_roadmap");
      if (savedRoadmap) setCurrentRoadmap(JSON.parse(savedRoadmap));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save changes helper
  const persist = (key: string, data: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  };

  // ─────────────── NOTES CRUD ───────────────
  const handleSaveNote = () => {
    if (!editingNote.title) return;
    let updatedNotes: Note[];
    if (editingNote.id) {
      updatedNotes = notes.map((n) =>
        n.id === editingNote.id
          ? { ...(editingNote as Note), updatedAt: new Date().toISOString() }
          : n
      );
    } else {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: editingNote.title,
        content: editingNote.content || "",
        category: editingNote.category || "text",
        isPinned: false,
        updatedAt: new Date().toISOString(),
      };
      updatedNotes = [newNote, ...notes];
    }
    setNotes(updatedNotes);
    persist("soip_workspace_notes", updatedNotes);
    setIsEditingNote(false);
    setEditingNote({});
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    persist("soip_workspace_notes", updated);
  };

  const handleTogglePinNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    setNotes(updated);
    persist("soip_workspace_notes", updated);
  };

  // ─────────────── GOALS CRUD ───────────────
  const handleSaveGoal = () => {
    if (!editingGoal.title) return;
    let updatedGoals: Goal[];
    const cleanProgress = Math.min(100, Math.max(0, editingGoal.progress ?? 0));
    const cleanStatus = cleanProgress === 100 ? "completed" : cleanProgress > 0 ? "in_progress" : editingGoal.status || "not_started";

    if (editingGoal.id) {
      updatedGoals = goals.map((g) =>
        g.id === editingGoal.id
          ? { ...(editingGoal as Goal), progress: cleanProgress, status: cleanStatus }
          : g
      );
    } else {
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        title: editingGoal.title,
        progress: cleanProgress,
        dueDate: editingGoal.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: cleanStatus,
      };
      updatedGoals = [...goals, newGoal];
    }
    setGoals(updatedGoals);
    persist("soip_workspace_goals", updatedGoals);
    setIsEditingGoal(false);
    setEditingGoal({});
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    persist("soip_workspace_goals", updated);
  };

  // ─────────────── ACTION PLAN ───────────────
  const handleToggleActionPlan = (id: string) => {
    const updated = actionPlan.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setActionPlan(updated);
    persist("soip_workspace_actionplan", updated);
  };

  const handleRegenerateActionPlan = () => {
    setIsGeneratingPlan(true);
    setTimeout(() => {
      // Create new AI plan elements based on goals and saved opps
      const generated: ActionPlanItem[] = [
        { id: `gen-1-${Date.now()}`, text: goals.length > 0 ? `Work on Goal: ${goals[0].title}` : "Outline career skill definitions", period: "today", completed: false },
        { id: `gen-2-${Date.now()}`, text: initialSavedOpportunities.length > 0 ? `Apply to saved: ${initialSavedOpportunities[0].title}` : "Browse upcoming SRM events list", period: "today", completed: false },
        { id: `gen-3-${Date.now()}`, text: "Prepare answers for standard behavioral interview notes", period: "week", completed: false },
        { id: `gen-4-${Date.now()}`, text: "Read bookmarked system design documentation", period: "week", completed: false },
        { id: `gen-5-${Date.now()}`, text: "Build a mini project to verify developer skills portfolio", period: "month", completed: false },
      ];
      setActionPlan(generated);
      persist("soip_workspace_actionplan", generated);
      setIsGeneratingPlan(false);
    }, 1200);
  };

  // ─────────────── CURATED RESOURCES ───────────────
  const handleToggleSaveResource = (id: string) => {
    const updated = learningResources.map((res) =>
      res.id === id ? { ...res, saved: !res.saved } : res
    );
    setLearningResources(updated);
    persist("soip_workspace_resources", updated);
  };

  const handleUpdateResourceProgress = (id: string, progress: number) => {
    const updated = learningResources.map((res) =>
      res.id === id ? { ...res, progress } : res
    );
    setLearningResources(updated);
    persist("soip_workspace_resources", updated);
  };

  // ─────────────── AI ROADMAPS ───────────────
  const handleGenerateRoadmap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapQuery.trim()) return;
    setIsGeneratingRoadmap(true);

    setTimeout(() => {
      const role = roadmapQuery;
      const steps = [
        { title: "Stage 1: Core Fundamentals & Foundations", desc: `Master Python/JS logic and DSA fundamentals. Setup Git workflow.`, completed: false },
        { title: "Stage 2: Advanced Tech Stack Competency", desc: `Build dynamic responsive apps with Next.js 15, TailwindCSS, and PostgreSQL.`, completed: false },
        { title: "Stage 3: Systems Design & Architectural Intelligence", desc: `Study microservices, caching layers (Redis), and Supabase connection pools.`, completed: false },
        { title: "Stage 4: Hackathons, Portfolio Building & Open Source", desc: `Deploy 3 full-stack projects to Vercel/Docker. Participate in SRM Chapter Hackathons.`, completed: false },
        { title: "Stage 5: Interview Cockpit & Career Readiness", desc: `Polish resume, complete 150 LeetCode patterns, practice behavioral mocks.`, completed: false },
      ];
      const newRoadmap = { role, steps };
      setCurrentRoadmap(newRoadmap);
      persist("soip_workspace_ai_roadmap", newRoadmap);
      setIsGeneratingRoadmap(false);
    }, 1500);
  };

  const handleToggleRoadmapStep = (index: number) => {
    if (!currentRoadmap) return;
    const updatedSteps = currentRoadmap.steps.map((step, idx) =>
      idx === index ? { ...step, completed: !step.completed } : step
    );
    const updatedRoadmap = { ...currentRoadmap, steps: updatedSteps };
    setCurrentRoadmap(updatedRoadmap);
    persist("soip_workspace_ai_roadmap", updatedRoadmap);
  };

  // ─────────────── TELEMETRY SUMMARY ───────────────
  const productivityStats = useMemo(() => {
    const active = goals.filter((g) => g.status === "in_progress").length;
    const completed = goals.filter((g) => g.status === "completed").length;
    const notesCount = notes.length;
    const savedResCount = learningResources.filter((r) => r.saved).length + initialSavedOpportunities.length;

    // Custom Career Score Formula: 60 base + (completed goals * 8) + (pinned notes * 2) + (saved resources * 1)
    const baseScore = 72;
    const computedScore = Math.min(
      99,
      baseScore + completed * 6 + notes.filter((n) => n.isPinned).length * 2 + savedResCount * 1
    );

    // Calculate weekly progress % based on total completed goals
    const totalGoalsCount = goals.length;
    const progressPercent = totalGoalsCount > 0 ? Math.round((completed / totalGoalsCount) * 100) : 0;

    return {
      active,
      completed,
      notesCount,
      savedResCount,
      careerScore: computedScore,
      progressPercent,
    };
  }, [goals, notes, learningResources, initialSavedOpportunities]);

  // Notes list filters
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
        note.content.toLowerCase().includes(noteSearch.toLowerCase());
      const matchesCat = selectedNoteCategory === "all" || note.category === selectedNoteCategory;
      return matchesSearch && matchesCat;
    });
  }, [notes, noteSearch, selectedNoteCategory]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 font-mono text-zinc-350">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 shrink-0 space-y-4">
        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-805 space-y-3">
          <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider px-2">
            Workspace Hub
          </div>
          <div className="flex flex-col gap-1">
            <SidebarBtn
              active={activeTab === "dashboard"}
              onClick={() => setActiveTab("dashboard")}
              icon={<Layout className="w-4 h-4 text-purple-400" />}
            >
              Overview
            </SidebarBtn>
            <SidebarBtn
              active={activeTab === "notes"}
              onClick={() => setActiveTab("notes")}
              icon={<FileText className="w-4 h-4 text-amber-400" />}
            >
              Quick Notes
            </SidebarBtn>
            <SidebarBtn
              active={activeTab === "goals"}
              onClick={() => setActiveTab("goals")}
              icon={<Target className="w-4 h-4 text-emerald-400" />}
            >
              Goals Systems
            </SidebarBtn>
            <SidebarBtn
              active={activeTab === "resources"}
              onClick={() => setActiveTab("resources")}
              icon={<Bookmark className="w-4 h-4 text-indigo-400" />}
            >
              Curated Hub
            </SidebarBtn>
            <SidebarBtn
              active={activeTab === "roadmaps"}
              onClick={() => setActiveTab("roadmaps")}
              icon={<Sparkles className="w-4 h-4 text-purple-450" />}
            >
              AI Roadmaps
            </SidebarBtn>
          </div>
        </div>

        {/* Dynamic Telemetry Mini-widget */}
        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850 space-y-3 shadow-inner">
          <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider px-2">
            Intelligence Stats
          </div>
          <div className="space-y-2 text-xs px-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Career Vector:</span>
              <span className="font-bold text-purple-400">{productivityStats.careerScore}/99</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Goal Completion:</span>
              <span className="text-zinc-300">
                {productivityStats.completed}/{goals.length}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>Task progress</span>
                <span>{productivityStats.progressPercent}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1">
                <div
                  className="bg-purple-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${productivityStats.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Telemetry Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard title="Active Goals" value={productivityStats.active} icon={<Target className="text-emerald-400 w-4 h-4" />} />
                <MetricCard title="Saved Resources" value={productivityStats.savedResCount} icon={<Bookmark className="text-indigo-400 w-4 h-4" />} />
                <MetricCard title="Career Vector" value={`${productivityStats.careerScore}/99`} icon={<Award className="text-purple-400 w-4 h-4" />} />
                <MetricCard title="Completed Goals" value={productivityStats.completed} icon={<CheckCircle2 className="text-teal-400 w-4 h-4" />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* AI Timeline Action Plan */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        Copilot Generated
                      </div>
                      <h2 className="text-sm font-bold text-zinc-200">Personal Timeline Action Plan</h2>
                    </div>
                    <button
                      onClick={handleRegenerateActionPlan}
                      disabled={isGeneratingPlan}
                      className="px-2.5 py-1 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-zinc-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isGeneratingPlan ? "animate-spin" : ""}`} />
                      <span>{isGeneratingPlan ? "Regenerating..." : "Regenerate"}</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Today */}
                    <div className="space-y-2">
                      <h3 className="text-[10px] text-purple-450 uppercase font-bold tracking-wider">
                        Today
                      </h3>
                      <div className="space-y-1.5">
                        {actionPlan.filter((p) => p.period === "today").map((item) => (
                          <ActionItem key={item.id} item={item} onToggle={handleToggleActionPlan} />
                        ))}
                        {actionPlan.filter((p) => p.period === "today").length === 0 && (
                          <div className="text-xs text-zinc-500 italic">No tasks set for today</div>
                        )}
                      </div>
                    </div>

                    {/* This Week */}
                    <div className="space-y-2">
                      <h3 className="text-[10px] text-amber-450 uppercase font-bold tracking-wider">
                        This Week
                      </h3>
                      <div className="space-y-1.5">
                        {actionPlan.filter((p) => p.period === "week").map((item) => (
                          <ActionItem key={item.id} item={item} onToggle={handleToggleActionPlan} />
                        ))}
                      </div>
                    </div>

                    {/* This Month */}
                    <div className="space-y-2">
                      <h3 className="text-[10px] text-indigo-450 uppercase font-bold tracking-wider">
                        This Month
                      </h3>
                      <div className="space-y-1.5">
                        {actionPlan.filter((p) => p.period === "month").map((item) => (
                          <ActionItem key={item.id} item={item} onToggle={handleToggleActionPlan} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pin Board / Quick Notes widget */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4 flex flex-col">
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      Quick Access
                    </div>
                    <h2 className="text-sm font-bold text-zinc-200 font-mono">Pinned Workspace Notes</h2>
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px]">
                    {notes.filter((n) => n.isPinned).map((note) => (
                      <div
                        key={note.id}
                        onClick={() => {
                          setEditingNote(note);
                          setIsEditingNote(true);
                        }}
                        className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-amber-500/30 transition-colors cursor-pointer space-y-1 relative"
                      >
                        <Pin className="w-3.5 h-3.5 absolute top-3 right-3 text-amber-400 fill-amber-400" />
                        <span className="text-[9px] uppercase font-bold text-purple-400 px-1 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded inline-block">
                          {note.category}
                        </span>
                        <div className="text-xs font-bold text-zinc-200 truncate mt-1">
                          {note.title}
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1">
                          {note.content}
                        </p>
                      </div>
                    ))}
                    {notes.filter((n) => n.isPinned).length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-xl">
                        <FileText className="w-6 h-6 text-zinc-700 mb-1.5" />
                        <span className="text-xs text-zinc-500">No notes pinned yet.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: QUICK NOTES */}
          {activeTab === "notes" && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={noteSearch}
                    onChange={(e) => setNoteSearch(e.target.value)}
                    placeholder="Search workspace notes..."
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-zinc-700 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedNoteCategory}
                    onChange={(e) => setSelectedNoteCategory(e.target.value)}
                    className="bg-zinc-950 border border-zinc-850 text-xs font-mono text-zinc-300 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="text">Text Notes</option>
                    <option value="career">Career Notes</option>
                    <option value="interview">Interview Notes</option>
                    <option value="learning">Learning Notes</option>
                  </select>

                  <button
                    onClick={() => {
                      setEditingNote({ category: "text" });
                      setIsEditingNote(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/10 transition-all shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Note</span>
                  </button>
                </div>
              </div>

              {/* Notes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Pin-prioritized rendering */}
                {filteredNotes
                  .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1))
                  .map((note) => (
                    <div
                      key={note.id}
                      onClick={() => {
                        setEditingNote(note);
                        setIsEditingNote(true);
                      }}
                      className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-purple-500/30 transition-all duration-200 cursor-pointer flex flex-col justify-between h-[180px] relative group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {note.category}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => handleTogglePinNote(note.id, e)}
                              className="p-1 rounded-lg bg-zinc-950 border border-zinc-805 text-zinc-500 hover:text-amber-400 hover:bg-zinc-800"
                            >
                              <Pin className={`w-3 h-3 ${note.isPinned ? "fill-amber-400 text-amber-400" : ""}`} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteNote(note.id, e)}
                              className="p-1 rounded-lg bg-zinc-950 border border-zinc-805 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <h3 className="text-xs font-bold text-zinc-200 truncate mt-1">
                          {note.title}
                        </h3>
                        <p className="text-[11px] text-zinc-400 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>
                      <div className="text-[9px] text-zinc-650 text-right mt-2">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}

                {filteredNotes.length === 0 && (
                  <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded-3xl space-y-2 bg-zinc-900/10">
                    <FileText className="w-8 h-8 text-zinc-700 mx-auto" />
                    <h3 className="text-xs font-bold text-zinc-400">No notes found</h3>
                    <p className="text-[10px] text-zinc-500">Create a note to start pinning career ideas</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: GOALS SYSTEM */}
          {activeTab === "goals" && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-zinc-200 font-mono">Academic & Career Goals</h2>
                  <p className="text-[10px] text-zinc-505">Track task benchmarks to calculate overall vector completeness</p>
                </div>
                <button
                  onClick={() => {
                    setEditingGoal({ progress: 0, status: "not_started" });
                    setIsEditingGoal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/10 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Goal</span>
                </button>
              </div>

              {/* Goals list */}
              <div className="space-y-3">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors hover:border-zinc-700/60"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold border ${
                          goal.status === "completed"
                            ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                            : goal.status === "in_progress"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-zinc-800 text-zinc-500 border-zinc-750"
                        }`}>
                          {goal.status.replace("_", " ")}
                        </span>
                        <h3 className="text-xs font-bold text-zinc-200 truncate">{goal.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                          <span>Due: {goal.dueDate}</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress Slider Display */}
                    <div className="w-full md:w-64 space-y-1.5 shrink-0">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-505 font-mono">Progress:</span>
                        <span className="font-bold text-zinc-200">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5">
                        <div
                          className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Goal Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setIsEditingGoal(true);
                        }}
                        className="p-2 rounded-xl bg-zinc-950 border border-zinc-850 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-205"
                        title="Edit Goal"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 rounded-xl bg-zinc-950 border border-zinc-850 hover:bg-red-900/10 hover:border-red-805 text-zinc-400 hover:text-red-400"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {goals.length === 0 && (
                  <div className="py-16 text-center border border-dashed border-zinc-800 rounded-3xl space-y-2 bg-zinc-900/10">
                    <Target className="w-8 h-8 text-zinc-700 mx-auto" />
                    <h3 className="text-xs font-bold text-zinc-400">No active goals</h3>
                    <p className="text-[10px] text-zinc-500">Add a career target benchmark to begin tracking</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: CURATED HUBS & SAVED RESOURCES */}
          {activeTab === "resources" && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-sm font-bold text-zinc-200 font-mono">Curated Learning Hub</h2>
                <p className="text-[10px] text-zinc-500">Access and save roadmaps across core campus computer domains</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Curated roadmaps */}
                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <h3 className="text-xs font-bold text-purple-400 font-mono tracking-wider uppercase">
                    Curated Domain Syllabus
                  </h3>
                  <div className="space-y-3.5">
                    {learningResources.map((res) => (
                      <div
                        key={res.id}
                        className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {res.category}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-200 truncate mt-1.5">{res.title}</h4>
                          <span className="text-[10px] text-zinc-500 font-light font-mono block mt-0.5">{res.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {res.saved ? (
                            <button
                              onClick={() => handleToggleSaveResource(res.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold"
                            >
                              Saved
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleSaveResource(res.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-[10px]"
                            >
                              Save
                            </button>
                          )}
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-500 hover:text-zinc-300"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. My Saved Center (Opps + Resources) */}
                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                  <h3 className="text-xs font-bold text-indigo-400 font-mono tracking-wider uppercase">
                    Unified Bookmarks Hub
                  </h3>
                  <div className="space-y-3.5 overflow-y-auto max-h-[400px] scrollbar-none pr-1">
                    {/* Saved Opportunities */}
                    {initialSavedOpportunities.map((opp) => (
                      <div
                        key={opp.id}
                        className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-855 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {opp.type}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-200 truncate mt-1.5">{opp.title}</h4>
                          <span className="text-[10px] text-zinc-500 block mt-0.5">{opp.club?.name}</span>
                        </div>
                        <a
                          href={`/opportunities/${opp.slug || opp.id}`}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 text-[10px] font-bold"
                        >
                          View
                        </a>
                      </div>
                    ))}

                    {/* Saved Curated resources */}
                    {learningResources.filter((r) => r.saved).map((res) => (
                      <div
                        key={`saved-${res.id}`}
                        className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-855 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {res.category}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-200 truncate mt-1.5">{res.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={res.progress}
                              onChange={(e) => handleUpdateResourceProgress(res.id, Number(e.target.value))}
                              className="w-20 accent-indigo-500 h-1 rounded"
                            />
                            <span className="text-[9px] text-zinc-505 font-mono">{res.progress}%</span>
                          </div>
                        </div>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-500 hover:text-zinc-300"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}

                    {initialSavedOpportunities.length === 0 && learningResources.filter((r) => r.saved).length === 0 && (
                      <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/15">
                        <Bookmark className="w-6 h-6 text-zinc-700 mx-auto mb-1.5" />
                        <span className="text-xs text-zinc-500">Your bookmark catalog is empty</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: AI ROADMAPS */}
          {activeTab === "roadmaps" && (
            <motion.div
              key="roadmaps"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/20 via-zinc-900 to-indigo-950/20 border border-purple-500/20 space-y-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generative AI Roadmapper</span>
                  </div>
                  <h2 className="text-base font-bold text-zinc-200">Generate a custom Career Roadmap</h2>
                  <p className="text-xs text-zinc-400 max-w-xl">
                    State your dream target role (e.g. &quot;Full Stack Developer at Stripe&quot; or &quot;AI Safety Scientist at Google DeepMind&quot;) to generate a custom step-by-step training pipeline.
                  </p>
                </div>

                <form onSubmit={handleGenerateRoadmap} className="flex gap-2 max-w-lg">
                  <input
                    type="text"
                    value={roadmapQuery}
                    onChange={(e) => setRoadmapQuery(e.target.value)}
                    placeholder="Enter target role or company..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isGeneratingRoadmap}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingRoadmap ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Display Generated Roadmap */}
              {currentRoadmap && (
                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-6">
                  <div className="border-b border-zinc-800 pb-4">
                    <span className="text-[10px] uppercase font-mono font-bold text-purple-400 tracking-wide">
                      Active AI Roadmap
                    </span>
                    <h3 className="text-sm font-bold text-zinc-100 font-mono mt-1">
                      {currentRoadmap.role}
                    </h3>
                  </div>

                  <div className="relative pl-6 border-l border-zinc-800 space-y-6">
                    {currentRoadmap.steps.map((step, idx) => (
                      <div key={idx} className="relative">
                        {/* Dot indicator */}
                        <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          step.completed
                            ? "bg-purple-650 border-purple-500 text-white"
                            : "bg-zinc-950 border-zinc-700 text-zinc-500"
                        }`}>
                          {step.completed && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className={`text-xs font-bold font-mono transition-colors ${
                              step.completed ? "text-zinc-500 line-through" : "text-zinc-200"
                            }`}>
                              {step.title}
                            </h4>
                            <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                              {step.desc}
                            </p>
                          </div>

                          <button
                            onClick={() => handleToggleRoadmapStep(idx)}
                            className={`px-2 py-1 rounded-lg text-[9px] font-mono transition-colors shrink-0 ${
                              step.completed
                                ? "bg-zinc-800 hover:bg-zinc-750 text-zinc-500"
                                : "bg-purple-600/10 hover:bg-purple-600/20 text-purple-405 border border-purple-500/20 font-bold"
                            }`}
                          >
                            {step.completed ? "Undo" : "Complete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────── MODAL: EDIT NOTE ─────────────── */}
      {isEditingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl relative font-mono text-zinc-300">
            <button
              onClick={() => {
                setIsEditingNote(false);
                setEditingNote({});
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 p-1 hover:bg-zinc-800 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
              {editingNote.id ? "Edit Note" : "New Note"}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-505">Category</label>
                <select
                  value={editingNote.category || "text"}
                  onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value as Note["category"] })}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 focus:outline-none focus:border-zinc-700"
                >
                  <option value="text">General Text Note</option>
                  <option value="career">Career Goal Note</option>
                  <option value="interview">Interview Practice Note</option>
                  <option value="learning">Domain Study Note</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-505">Title</label>
                <input
                  type="text"
                  value={editingNote.title || ""}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  placeholder="Note title..."
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 focus:outline-none focus:border-zinc-700 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-505">Content</label>
                <textarea
                  rows={6}
                  value={editingNote.content || ""}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  placeholder="Type note content here..."
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 focus:outline-none focus:border-zinc-700 font-mono leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsEditingNote(false);
                  setEditingNote({});
                }}
                className="px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-855 text-zinc-450 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────── MODAL: EDIT GOAL ─────────────── */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl relative font-mono text-zinc-300">
            <button
              onClick={() => {
                setIsEditingGoal(false);
                setEditingGoal({});
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 p-1 hover:bg-zinc-800 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
              {editingGoal.id ? "Edit Goal" : "Add Goal"}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-505">Goal Title</label>
                <input
                  type="text"
                  value={editingGoal.title || ""}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  placeholder="e.g. Learn DSA, Complete React Projects..."
                  className="w-full bg-zinc-950 border border-zinc-855 rounded-xl px-3.5 py-2 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-505">Progress ({editingGoal.progress || 0}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editingGoal.progress || 0}
                  onChange={(e) => setEditingGoal({ ...editingGoal, progress: Number(e.target.value) })}
                  className="w-full accent-purple-500 h-1.5 bg-zinc-950 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-505">Target Due Date</label>
                <input
                  type="date"
                  value={editingGoal.dueDate || ""}
                  onChange={(e) => setEditingGoal({ ...editingGoal, dueDate: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-855 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 font-mono text-zinc-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsEditingGoal(false);
                  setEditingGoal({});
                }}
                className="px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-855 text-zinc-450 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGoal}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────── METRIC CARD SUB-COMPONENT ─────────────── */
function MetricCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between gap-4">
      <div className="space-y-1 min-w-0">
        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide font-mono block truncate">
          {title}
        </span>
        <div className="text-lg font-bold text-zinc-100 font-mono truncate">{value}</div>
      </div>
      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 shrink-0">
        {icon}
      </div>
    </div>
  );
}

/* ─────────────── SIDEBAR BUTTON SUB-COMPONENT ─────────────── */
function SidebarBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2 rounded-xl flex items-center gap-3 text-left text-xs font-bold font-mono transition-all cursor-pointer ${
        active
          ? "bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-sm"
          : "hover:bg-zinc-900/50 text-zinc-450 hover:text-zinc-200 border border-transparent"
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

/* ─────────────── ACTION PLAN ITEM SUB-COMPONENT ─────────────── */
function ActionItem({
  item,
  onToggle,
}: {
  item: ActionPlanItem;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onToggle(item.id)}
      className="p-3 rounded-xl bg-zinc-950 border border-zinc-850/80 flex items-center justify-between gap-3 cursor-pointer hover:border-zinc-800 hover:bg-zinc-950/90 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
          item.completed
            ? "bg-purple-650 border-purple-500 text-white"
            : "border-zinc-700 hover:border-purple-500"
        }`}>
          {item.completed && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
        </div>
        <span className={`text-[11px] truncate leading-normal transition-all ${
          item.completed ? "text-zinc-600 line-through" : "text-zinc-300"
        }`}>
          {item.text}
        </span>
      </div>
    </div>
  );
}
