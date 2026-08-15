/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Check,
  Plus,
  Clock,
  ChevronRight,
  Cpu,
  Layers,
  Briefcase,
  ShieldCheck,
  Layout,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Bookmark,
  Sparkles,
  RefreshCw,
  Play,
  CheckCircle,
  Users,
  BookOpen,
  HelpCircle,
  Send,
  User,
  Calendar as CalendarIcon,
  ChevronLeft,
} from "lucide-react";

interface PriorityTask {
  id: string;
  title: string;
  category: "Critical" | "Important" | "Optional";
  dueDate: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  type: "Event" | "Deadline" | "Interview" | "Application" | "Goal";
  date: string;
}

const DEFAULT_PRIORITY_TASKS: PriorityTask[] = [
  { id: "p-1", title: "NVIDIA AI Internship application closes tomorrow", category: "Critical", dueDate: "2026-08-17" },
  { id: "p-2", title: "Microsoft Coding Assessment slot selection", category: "Critical", dueDate: "2026-08-17" },
  { id: "p-3", title: "Complete Advanced System Design sharding roadmap", category: "Important", dueDate: "2026-08-20" },
  { id: "p-4", title: "Attend Google Cloud Career webinar session", category: "Optional", dueDate: "2026-08-24" }
];

const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "c-1", title: "NVIDIA AI Intern Deadline", type: "Deadline", date: "2026-08-17" },
  { id: "c-2", title: "Microsoft OA Coding Slot", type: "Interview", date: "2026-08-18" },
  { id: "c-3", title: "AWS Solutions Architect Exam", type: "Goal", date: "2026-08-20" },
  { id: "c-4", title: "Google Cloud Tech Webinar", type: "Event", date: "2026-08-24" },
  { id: "c-5", title: "Submit Portfolio Studio Projects", type: "Application", date: "2026-08-28" }
];

export default function CareerHQClient() {
  const [activeTab, setActiveTab] = useState<"overview" | "life" | "calendar" | "analytics">("overview");

  // Local storage state synced lists
  const [goalsList, setGoalsList] = useState<Array<{ id: string; title: string; category?: string; dueDate: string; progress: number; status: string }>>([]);
  const [portfolio, setPortfolio] = useState<{ skills: string[]; projects: Array<{ name: string; description: string }>; certifications: Array<{ title: string; issuer: string }> } | null>(null);

  // AI Decision Center states
  const [decisionAnswer, setDecisionAnswer] = useState("Click one of the quick queries below to trigger AI Career HQ optimizations.");
  const [loadingDecision, setLoadingDecision] = useState(false);

  // Calendar view states
  const [calendarView, setCalendarView] = useState<"Month" | "Week" | "Day">("Month");
  const [calendarOffset, setCalendarOffset] = useState(0);

  // Sync with localStorage on mount
  useEffect(() => {
    try {
      const savedGoals = localStorage.getItem("soip_workspace_goals");
      const savedPortfolio = localStorage.getItem("soip_public_portfolio");
      if (savedGoals) setGoalsList(JSON.parse(savedGoals));
      if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
    } catch {
      // ignore
    }
  }, []);

  // Compute stats dynamically
  const healthScores = useMemo(() => {
    const skillsCount = portfolio?.skills?.length || 6;
    const projectsCount = portfolio?.projects?.length || 2;
    const certsCount = portfolio?.certifications?.length || 1;
    const completedGoals = goalsList.filter(g => g.status === "completed").length;

    // Calculators
    const resumeHealth = Math.min(65 + projectsCount * 10, 100);
    const skillHealth = Math.min(60 + skillsCount * 6, 100);
    const opportunityHealth = 85;
    const placementHealth = Math.min(50 + completedGoals * 12 + certsCount * 12, 100);

    const masterHealth = Math.round((resumeHealth + skillHealth + opportunityHealth + placementHealth) / 4);

    return {
      resumeHealth,
      skillHealth,
      opportunityHealth,
      placementHealth,
      masterHealth
    };
  }, [goalsList, portfolio]);

  const predictions = useMemo(() => {
    return {
      internshipReadiness: Math.min(healthScores.skillHealth + 5, 100),
      placementReadiness: Math.min(healthScores.masterHealth + 2, 100),
      researchReadiness: Math.min(healthScores.resumeHealth - 8, 100),
      startupReadiness: Math.min(healthScores.placementHealth + 10, 100)
    };
  }, [healthScores]);

  // Risk detector configurations
  const riskDetections = useMemo(() => {
    const risks = [];
    const skillsCount = portfolio?.skills?.length || 0;
    const projectsCount = portfolio?.projects?.length || 0;
    const certsCount = portfolio?.certifications?.length || 0;

    if (projectsCount < 3) {
      risks.push({
        id: "risk-1",
        issue: "Low Project Density",
        impact: "Reduces screening chances at high-tier firms.",
        action: "Build 1 full-stack event middleware project in Portfolio Studio."
      });
    }
    if (certsCount === 0) {
      risks.push({
        id: "risk-2",
        issue: "No Verified Certifications",
        impact: "Missing external credential proofs on resume.",
        action: "Log and schedule AWS Solutions Architect or Kubernetes exam goals."
      });
    }
    if (skillsCount < 5) {
      risks.push({
        id: "risk-3",
        issue: "Thin Skills Vector",
        impact: "Fails semantic search parsing on recruiter scans.",
        action: "Add core databases and DevOps tools tags in your developer settings."
      });
    }

    // Default placeholder risk
    if (risks.length === 0) {
      risks.push({
        id: "risk-4",
        issue: "Pre-placement Mock interview gaps",
        impact: "Slow response pacing under timed pressure.",
        action: "Complete 2 timed technical simulations in the Placement War Room."
      });
    }

    return risks;
  }, [portfolio]);

  // Handle AI Decision Center query triggers
  const handleAIQuery = (queryType: "today" | "priority" | "opportunity" | "skill") => {
    setLoadingDecision(true);
    setTimeout(() => {
      let ans = "";
      if (queryType === "today") {
        ans = "Today's Agenda: Apply to NVIDIA AI Intern (closes tomorrow), complete reverse linked list DSA exercises, and audit AWS Solutions Architect goals.";
      } else if (queryType === "priority") {
        ans = "High Priority focus: Address low project density by creating a high-concurrency Node.js API prototype. This maps to Google and Microsoft requirements.";
      } else if (queryType === "opportunity") {
        ans = "Recommended Next Apply: Microsoft SDE Role. Match Fit is 88%. Success probability is 76% due to your strong DSA scores and verified Java capabilities.";
      } else {
        ans = "Suggested Skill to Learn Next: Docker & Kubernetes containerization. Adding container scaling knowledge will bridge your SDE Twin gap by 15%.";
      }
      setDecisionAnswer(ans);
      setLoadingDecision(false);
    }, 600);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 font-mono text-zinc-350">
      
      {/* Left Column: Command cockpit sidebar tabs */}
      <div className="w-full lg:w-64 shrink-0 space-y-3">
        <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold text-zinc-200">Career HQ Options</h2>
          </div>
          <span className="text-[9px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded font-bold uppercase">Cockpit ON</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {[
            { id: "overview", label: "Overview & Diagnostics", icon: ShieldCheck },
            { id: "life", label: "Life Dashboard", icon: Layers },
            { id: "calendar", label: "Operating Calendar", icon: CalendarIcon },
            { id: "analytics", label: "Executive Analytics", icon: TrendingUp }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
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
          <span className="text-[8px] text-zinc-550 uppercase font-bold block tracking-wider">Telemetry Status</span>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Master Vectors Synced</span>
          </div>
        </div>
      </div>

      {/* Right Column: Active workspace render panel */}
      <div className="flex-1 space-y-6">
        
        {/* OVERVIEW & DIAGNOSTICS */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Top overview score cockpit */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Career health score (7 columns) */}
              <div className="md:col-span-7 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                  <h3 className="text-xs uppercase font-mono text-zinc-400 font-bold tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    Career Health Diagnostics
                  </h3>
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-bold font-mono">
                    Master Health: {healthScores.masterHealth}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  {[
                    { label: "Resume Completeness", value: healthScores.resumeHealth, color: "bg-purple-500" },
                    { label: "Skills Vector Depth", value: healthScores.skillHealth, color: "bg-indigo-500" },
                    { label: "Opportunities Pipeline", value: healthScores.opportunityHealth, color: "bg-amber-500" },
                    { label: "Placement Preparedness", value: healthScores.placementHealth, color: "bg-emerald-500" }
                  ].map((bar, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 font-bold block">{bar.label}</span>
                        <span className="text-[10px] text-zinc-300 font-bold font-mono">{bar.value}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color}`} style={{ width: `${bar.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success predictions (5 columns) */}
              <div className="md:col-span-5 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-5 shadow-xl">
                <div className="border-b border-zinc-850 pb-2">
                  <h3 className="text-xs uppercase font-mono text-zinc-400 font-bold tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    Success Readiness Predictor
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs font-mono">
                  {[
                    { label: "Internship Readiness", value: predictions.internshipReadiness, color: "text-purple-400" },
                    { label: "Placement Readiness", value: predictions.placementReadiness, color: "text-indigo-400" },
                    { label: "Research Scholar Readiness", value: predictions.researchReadiness, color: "text-amber-400" },
                    { label: "Startup Launch Readiness", value: predictions.startupReadiness, color: "text-emerald-400" }
                  ].map((gauge, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] leading-tight">
                      <span className="text-zinc-400">{gauge.label}</span>
                      <span className={`${gauge.color} font-black font-mono`}>{gauge.value}% Readiness</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Smart Priority Engine & Risk Detector */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Priority lists (7 columns) */}
              <div className="md:col-span-7 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
                <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs uppercase font-bold text-zinc-200 font-mono">Smart Priority Engine</h3>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  {DEFAULT_PRIORITY_TASKS.map((task) => {
                    const isCrit = task.category === "Critical";
                    const isImp = task.category === "Important";
                    return (
                      <div key={task.id} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-between gap-3 shadow-inner">
                        <div className="space-y-0.5">
                          <span className="font-bold text-zinc-200 block truncate max-w-[200px] sm:max-w-md">{task.title}</span>
                          <span className="text-[9px] text-zinc-550 block">Due date: {task.dueDate}</span>
                        </div>

                        <span className={`text-[8px] uppercase px-2 py-0.5 rounded font-black ${
                          isCrit
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : isImp
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-zinc-900 text-zinc-500 border border-zinc-850"
                        }`}>
                          {task.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Risk Detector (5 columns) */}
              <div className="md:col-span-5 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
                <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                  <AlertCircle className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs uppercase font-bold text-zinc-200 font-mono">Career Risk Audit</h3>
                </div>

                <div className="space-y-3.5 text-xs font-mono max-h-[300px] overflow-y-auto pr-1">
                  {riskDetections.map((risk) => (
                    <div key={risk.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 space-y-2 relative shadow-inner">
                      <div className="flex items-center justify-between text-[10px] font-bold text-rose-400">
                        <span>⚠️ Gap: {risk.issue}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-light leading-normal">{risk.impact}</p>
                      <div className="p-2 rounded bg-zinc-900/60 border border-zinc-850 text-[9px] text-zinc-300 font-light leading-relaxed">
                        <strong>Action Plan:</strong> {risk.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* AI Decision Center */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
              <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs uppercase font-bold text-zinc-200 font-mono">AI Career Decision Center</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs font-mono">
                <div className="md:col-span-4 flex flex-col gap-2">
                  {[
                    { type: "today", label: "What should I do today?" },
                    { type: "priority", label: "What should I prioritize?" },
                    { type: "opportunity", label: "What opportunity should I apply for next?" },
                    { type: "skill", label: "What skill should I learn next?" }
                  ].map((btn) => (
                    <button
                      key={btn.type}
                      onClick={() => handleAIQuery(btn.type as "today" | "priority" | "opportunity" | "skill")}
                      className="w-full p-3 rounded-xl border border-zinc-850 bg-zinc-950 text-left text-zinc-300 hover:border-purple-500/40 hover:text-purple-300 font-bold transition-all cursor-pointer"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="md:col-span-8 p-4 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-center justify-center min-h-[140px] shadow-inner relative">
                  {loadingDecision ? (
                    <div className="text-zinc-550 flex items-center gap-2 font-bold animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-400" /> Optimizing career vectors...
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-300 leading-relaxed font-light text-center max-w-lg">
                      {decisionAnswer}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* LIFE DASHBOARD */}
        {activeTab === "life" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl"
          >
            <div>
              <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                Life Dashboard Organizer
              </h3>
              <p className="text-[10px] text-zinc-550 font-mono">Consolidated task schedule timeline matrix</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              {[
                { time: "Today", bg: "border-purple-500/20 bg-purple-500/5", task: "Apply to NVIDIA AI Intern closes 23:59 IST", status: "Critical Priority" },
                { time: "This Week", bg: "border-indigo-500/20 bg-indigo-500/5", task: "Complete Advanced System Design Cache master checklist", status: "1 Workspace goal pending" },
                { time: "This Month", bg: "border-amber-500/20 bg-amber-500/5", task: "Schedule AWS Solutions Architect Professional exam credential", status: "Target Certifications" },
                { time: "This Semester", bg: "border-emerald-500/20 bg-emerald-500/5", task: "Participate in Google Cloud Career Hackathon with club members", status: "2 Events registered" }
              ].map((slot, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${slot.bg} flex flex-col justify-between gap-4 shadow-inner`}>
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-black text-zinc-450 block">{slot.time}</span>
                    <p className="text-[11px] text-zinc-200 leading-relaxed font-light">{slot.task}</p>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">{slot.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CAREER OPERATING CALENDAR */}
        {activeTab === "calendar" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-5 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
              <div>
                <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-purple-400" />
                  Career Operating Calendar
                </h3>
                <p className="text-[10px] text-zinc-555">Day, Week, and Month scheduling cockpit</p>
              </div>

              {/* View options */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-850">
                {["Month", "Week", "Day"].map((view) => (
                  <button
                    key={view}
                    onClick={() => setCalendarView(view as typeof calendarView)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                      calendarView === view ? "bg-zinc-900 text-purple-300" : "text-zinc-500"
                    }`}
                  >
                    {view} View
                  </button>
                ))}
              </div>
            </div>

            {/* Custom mock visual calendar grid */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850/80 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-xs font-bold text-zinc-400 font-mono uppercase">
                  {calendarView} View Calendar: August 2026
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-[10px] text-center text-zinc-500 font-bold font-mono pb-1 border-b border-zinc-900">
                <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
              </div>

              {/* Simulated Month block */}
              <div className="grid grid-cols-7 gap-2 min-h-[220px]">
                {Array.from({ length: 28 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const matchingEvent = DEFAULT_CALENDAR_EVENTS.find(e => parseInt(e.date.split("-")[2]) === dayNum);

                  return (
                    <div
                      key={idx}
                      className={`p-1.5 rounded-xl border flex flex-col justify-between min-h-[45px] text-left transition-all ${
                        matchingEvent
                          ? "bg-purple-955/10 border-purple-500/20 text-purple-300"
                          : "bg-zinc-900/20 border-zinc-900 hover:border-zinc-850"
                      }`}
                    >
                      <span className="text-[8px] font-bold text-zinc-550 block">{dayNum}</span>
                      {matchingEvent && (
                        <span className="text-[7px] font-black truncate max-w-full block leading-none pt-0.5">
                          {matchingEvent.title}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* EXECUTIVE ANALYTICS */}
        {activeTab === "analytics" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl"
          >
            <div>
              <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Executive Analytics Dashboard
              </h3>
              <p className="text-[10px] text-zinc-555 font-mono">Generative telemetry growth graphs</p>
            </div>

            {/* Custom responsive SVG charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Growth Trend */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850/80 space-y-4">
                <span className="text-[9px] uppercase font-bold text-zinc-500 block">Career Score Growth Trend (Aug 2026)</span>
                <div className="h-[140px] flex items-end justify-between px-2 pt-4 relative">
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                    <div className="border-b border-white w-full" />
                    <div className="border-b border-white w-full" />
                    <div className="border-b border-white w-full" />
                  </div>

                  {[65, 68, 72, 75, 78, 82, 85].map((val, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 z-10">
                      <span className="text-[8px] font-bold text-purple-400">{val}%</span>
                      <div className="w-5 bg-purple-500/20 border border-purple-500/30 rounded-t" style={{ height: `${val}px` }} />
                      <span className="text-[8px] text-zinc-650 block">Wk {idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills depth distribution */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850/80 space-y-4">
                <span className="text-[9px] uppercase font-bold text-zinc-500 block">Skills Density by Core Category</span>
                <div className="h-[140px] flex items-end justify-between px-2 pt-4 relative">
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                    <div className="border-b border-white w-full" />
                    <div className="border-b border-white w-full" />
                    <div className="border-b border-white w-full" />
                  </div>

                  {[
                    { label: "DSA", val: 90 },
                    { label: "System Design", val: 75 },
                    { label: "AI/ML", val: 82 },
                    { label: "DevOps", val: 60 },
                    { label: "Soft Skills", val: 88 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 z-10">
                      <span className="text-[8px] font-bold text-indigo-400">{item.val}%</span>
                      <div className="w-7 bg-indigo-500/20 border border-indigo-500/30 rounded-t" style={{ height: `${item.val}px` }} />
                      <span className="text-[8px] text-zinc-650 block">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
