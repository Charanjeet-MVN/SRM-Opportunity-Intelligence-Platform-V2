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
  XCircle,
  Info,
  ShieldAlert,
} from "lucide-react";
import HoverCard from "@/components/ui/HoverCard";
import MagneticButton from "@/components/ui/MagneticButton";
import EmptyState from "@/components/ui/EmptyState";

interface RecommendedOpportunity {
  id: string;
  title: string;
  company: string;
  type: string;
  matchScore: number;
  priority: "High Impact" | "Medium Impact" | "Low Impact";
  deadlineRisk: "Safe" | "Warning" | "Critical";
  daysLeft: number;
  whyMatch: string[];
  successChance: number;
  successReasoning: string[];
  ignored?: boolean;
  applied?: boolean;
}

interface MissedOpportunity {
  id: string;
  title: string;
  company: string;
  missedDate: string;
  reason: string;
}

const DEFAULT_RECOMMENDED: RecommendedOpportunity[] = [
  {
    id: "rec-1",
    title: "AI Engineer Intern",
    company: "NVIDIA",
    type: "Internship",
    matchScore: 95,
    priority: "High Impact",
    deadlineRisk: "Critical",
    daysLeft: 1,
    whyMatch: ["AIML Specialization Student", "PyTorch & Python skills match", "High score in ML Project benchmarks"],
    successChance: 82,
    successReasoning: ["Excellent technical skills coverage", "Recent hackathon achievement unlocked", "Missing pre-placement feedback score"]
  },
  {
    id: "rec-2",
    title: "Software Development Engineer",
    company: "Microsoft",
    type: "Full-Time Job",
    matchScore: 88,
    priority: "High Impact",
    deadlineRisk: "Warning",
    daysLeft: 3,
    whyMatch: ["Computer Science core background", "Strong DSA certification verified", "Java and C++ codebase experience"],
    successChance: 76,
    successReasoning: ["Strong DSA portfolio profile", "High academic GPA standing", "Lacks experience in high-concurrency systems design"]
  },
  {
    id: "rec-3",
    title: "Cloud Solutions Architect",
    company: "Amazon Web Services",
    type: "Internship",
    matchScore: 78,
    priority: "Medium Impact",
    deadlineRisk: "Safe",
    daysLeft: 14,
    whyMatch: ["AWS Cloud Practitioner credential active", "DevOps orchestration tools experience"],
    successChance: 65,
    successReasoning: ["AWS Practitioner credential active", "Good presentation profile", "Needs more distributed database design projects"]
  },
  {
    id: "rec-4",
    title: "Data Scientist Associate",
    company: "Google",
    type: "Full-Time Job",
    matchScore: 82,
    priority: "High Impact",
    deadlineRisk: "Safe",
    daysLeft: 10,
    whyMatch: ["Statistics & Pandas skills verified", "Python programming expertise match"],
    successChance: 70,
    successReasoning: ["High scoring Python benchmarks", "Good academic standing", "Missing experience in production model pipelines"]
  }
];

const DEFAULT_MISSED: MissedOpportunity[] = [
  { id: "miss-1", title: "ML Research Intern", company: "Adobe Research", missedDate: "2026-08-01", reason: "Deadline expired before profile completeness reached 70%" },
  { id: "miss-2", title: "Backend Architect Intern", company: "Atlassian", missedDate: "2026-08-05", reason: "Missed coding assessment slot due to scheduling conflict" },
  { id: "miss-3", title: "Frontend Engineering Intern", company: "Stripe", missedDate: "2026-08-12", reason: "Application closed 4 hours before submission attempt" }
];

export default function OpportunityAutopilotClient() {
  const [recommendations, setRecommendations] = useState<RecommendedOpportunity[]>(DEFAULT_RECOMMENDED);
  const [missedOpps, setMissedOpps] = useState<MissedOpportunity[]>(DEFAULT_MISSED);
  
  // Autopilot telemetry stats
  const [appliedCount, setAppliedCount] = useState(8);
  const [ignoredCount, setIgnoredCount] = useState(2);

  // Personalized Action Center checkmarks
  const [actionTasks, setActionTasks] = useState([
    { id: "task-1", time: "Today", text: "Apply to NVIDIA AI Engineer Intern opportunity", completed: false },
    { id: "task-2", time: "This Week", text: "Complete System Design caching configurations on Workspace", completed: false },
    { id: "task-3", time: "This Month", text: "Participate in upcoming Google Cloud Career hackathon", completed: false }
  ]);

  const [savingMsg, setSavingMsg] = useState<string | null>(null);

  // Load stats from localStorage
  useEffect(() => {
    try {
      const savedApplied = localStorage.getItem("soip_autopilot_applied");
      const savedIgnored = localStorage.getItem("soip_autopilot_ignored");
      if (savedApplied) setAppliedCount(parseInt(savedApplied));
      if (savedIgnored) setIgnoredCount(parseInt(savedIgnored));
    } catch {
      // ignore
    }
  }, []);

  const handleApply = (id: string) => {
    setRecommendations(prev =>
      prev.map(r => (r.id === id ? { ...r, applied: true } : r))
    );
    const newApplied = appliedCount + 1;
    setAppliedCount(newApplied);
    localStorage.setItem("soip_autopilot_applied", newApplied.toString());

    setSavingMsg("Opportunity application logged via Autopilot!");
    setTimeout(() => setSavingMsg(null), 2500);
  };

  const handleIgnore = (id: string) => {
    setRecommendations(prev =>
      prev.map(r => (r.id === id ? { ...r, ignored: true } : r))
    );
    const newIgnored = ignoredCount + 1;
    setIgnoredCount(newIgnored);
    localStorage.setItem("soip_autopilot_ignored", newIgnored.toString());

    setSavingMsg("Opportunity hidden from recommendations.");
    setTimeout(() => setSavingMsg(null), 2500);
  };

  const handleToggleTask = (id: string) => {
    setActionTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Compute overall Autopilot success rate percentage
  const dynamicSuccessRate = useMemo(() => {
    const total = appliedCount + ignoredCount;
    if (total === 0) return 80;
    return Math.round((appliedCount / total) * 100);
  }, [appliedCount, ignoredCount]);

  // Active non-ignored recommended opportunities
  const visibleRecommendations = useMemo(() => {
    return recommendations.filter(r => !r.ignored && !r.applied);
  }, [recommendations]);

  return (
    <div className="space-y-8 font-mono text-zinc-350">
      
      {/* ── AUTOPILOT TELEMETRY STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "AUTOPILOT MATCHES", value: `${visibleRecommendations.length}`, desc: "Active high priority items", color: "text-purple-400 border-purple-500/20 bg-purple-500/10", glow: "rgba(168, 85, 247, 0.15)" },
          { label: "APPLIED VIA CO-PILOT", value: `${appliedCount}`, desc: "Synchronized pipeline items", color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10", glow: "rgba(99, 102, 241, 0.15)" },
          { label: "IGNORED OPPORTUNITIES", value: `${ignoredCount}`, desc: "Dismissed recommendations catalog", color: "text-zinc-500 border-zinc-900 bg-zinc-900/10", glow: "rgba(160, 160, 160, 0.1)" },
          { label: "CONVERSION SUCCESS RATE", value: `${dynamicSuccessRate}%`, desc: "Autopilot selection accuracy", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10", glow: "rgba(16, 185, 129, 0.15)" }
        ].map((card, i) => (
          <HoverCard key={i} className={`p-4 border ${card.color} space-y-2`} glowColor={card.glow}>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide block">{card.label}</span>
            <div className="text-2xl font-black">{card.value}</div>
            <p className="text-[9px] text-zinc-555 leading-none">{card.desc}</p>
          </HoverCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Netflix/Spotify recommendations catalog (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-4">
              <div>
                <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                  Discover Intelligent Autopilot Recommendations
                </h3>
                <p className="text-[10px] text-zinc-550">Personalized matching based on skills and profile strength vectors</p>
              </div>

              {savingMsg && (
                <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-lg animate-pulse font-bold">
                  {savingMsg}
                </span>
              )}
            </div>

            {/* Recommendations Grid */}
            <div className="space-y-6">
              {visibleRecommendations.map((opp) => (
                <div key={opp.id} className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850 flex flex-col md:flex-row items-start justify-between gap-5 transition-all hover:border-zinc-800 relative shadow-inner">
                  
                  {/* Left block info */}
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-zinc-200">{opp.title}</span>
                      <span className="text-[9px] text-zinc-500 font-bold">•</span>
                      <span className="text-[10px] text-zinc-400 font-bold">{opp.company}</span>
                      
                      {/* Priority and deadline risk tag */}
                      <span className="text-[8px] uppercase px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded font-bold">
                        {opp.priority}
                      </span>
                      
                      <span className={`text-[8px] uppercase px-2 py-0.5 rounded border font-bold ${
                        opp.deadlineRisk === "Critical"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : opp.deadlineRisk === "Warning"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {opp.deadlineRisk} Risk ({opp.daysLeft}d left)
                      </span>
                    </div>

                    {/* Why this match block */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-zinc-555 uppercase font-bold tracking-wide block">Why This Match?</span>
                      <div className="space-y-1">
                        {opp.whyMatch.map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-light">
                            <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selection Probability */}
                    <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-850/80 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-450 uppercase border-b border-zinc-950 pb-1.5">
                        <span className="flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-indigo-400" /> Success Probability
                        </span>
                        <span className="text-indigo-400 font-black">{opp.successChance}% Probability</span>
                      </div>
                      <div className="space-y-1">
                        {opp.successReasoning.map((reason, idx) => (
                          <div key={idx} className="text-[10px] text-zinc-500 font-light flex items-start gap-1.5 leading-normal">
                            <span className="text-zinc-650">•</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right block gauges & Actions */}
                  <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 w-full md:w-32 shrink-0 md:border-l md:border-zinc-900 md:pl-5">
                    
                    {/* Circle match score gauge */}
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-zinc-900"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-purple-500"
                          strokeDasharray={`${opp.matchScore}, 100`}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-xs font-black text-zinc-200 leading-none">{opp.matchScore}%</span>
                        <span className="text-[7px] text-zinc-500 font-bold uppercase block tracking-wider">Match</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-1.5 w-full">
                      <button
                        onClick={() => handleApply(opp.id)}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all cursor-pointer text-center text-[10px]"
                      >
                        Apply Now
                      </button>
                      <button
                        onClick={() => handleIgnore(opp.id)}
                        className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-850 rounded-xl transition-all cursor-pointer text-center text-[10px]"
                      >
                        Ignore
                      </button>
                    </div>

                  </div>

                </div>
              ))}
              {visibleRecommendations.length === 0 && (
                <div className="py-16 text-center text-zinc-500 space-y-3">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
                  <p className="text-xs font-bold text-zinc-300">All matching recommendations addressed!</p>
                  <button
                    onClick={() => {
                      setRecommendations(DEFAULT_RECOMMENDED);
                    }}
                    className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] hover:border-zinc-700 font-bold text-purple-400 cursor-pointer"
                  >
                    Reset Recommendations
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Missed detector & action center (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Action Center checklist */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
            <span className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider block">Autopilot Actions</span>
            
            <div className="space-y-3.5 text-xs font-mono">
              {actionTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className="w-full flex items-start gap-3 text-left transition-colors hover:text-zinc-250 cursor-pointer"
                >
                  <div className="p-0.5 rounded bg-zinc-950 border border-zinc-850 flex items-center justify-center shrink-0 mt-0.5">
                    {task.completed ? (
                      <Check className="w-3.5 h-3.5 text-purple-400" />
                    ) : (
                      <div className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[8px] font-bold text-purple-400 uppercase tracking-wide block">{task.time}</span>
                    <span className={task.completed ? "line-through text-zinc-550" : "text-zinc-300"}>
                      {task.text}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Missed Opportunity Detector */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
            <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2">
              <ShieldAlert className="w-4 h-4 text-purple-400 animate-pulse" />
              <h3 className="text-xs uppercase font-bold text-zinc-200">Missed Opportunity Detector</h3>
            </div>

            <div className="space-y-3 text-[11px] font-mono leading-relaxed">
              <span className="text-[10px] text-zinc-550 uppercase font-bold tracking-wide block">
                You missed {missedOpps.length} opportunities last month:
              </span>

              <div className="space-y-3.5">
                {missedOpps.map((opp) => (
                  <div key={opp.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-300">
                      <span>{opp.title}</span>
                      <span className="text-zinc-555">{opp.company}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-light leading-normal">{opp.reason}</p>
                    <span className="text-[8px] text-zinc-650 font-bold block pt-1">CLOSED ON {opp.missedDate}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
