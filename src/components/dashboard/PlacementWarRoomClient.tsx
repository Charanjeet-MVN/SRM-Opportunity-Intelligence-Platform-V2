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
} from "lucide-react";
import HoverCard from "@/components/ui/HoverCard";
import MagneticButton from "@/components/ui/MagneticButton";
import EmptyState from "@/components/ui/EmptyState";

interface MockInterviewLog {
  id: string;
  mode: "Technical" | "HR" | "AI";
  question: string;
  response: string;
  date: string;
  score: number;
}

interface CompanyPrep {
  id: string;
  name: string;
  logoText: string;
  skills: string[];
  process: string;
  tips: string;
  commonQuestions: string[];
  prepProgress: number;
}

const COMPANIES: CompanyPrep[] = [
  {
    id: "google",
    name: "Google",
    logoText: "G",
    skills: ["DSA (Graphs/Trees)", "Systems Design", "C++/Python"],
    process: "Online Assessment -> 3-4 Technical Rounds (Focus on DSA & System Design) -> Googleyness Round",
    tips: "Focus on writing clean, optimal code with correct time/space complexities. Master graph traversals and dynamic programming.",
    commonQuestions: [
      "Find the longest path in a directed acyclic graph",
      "Design an autocomplete system for queries",
      "Implement a thread-safe LRU Cache"
    ],
    prepProgress: 75,
  },
  {
    id: "microsoft",
    name: "Microsoft",
    logoText: "MS",
    skills: ["DSA (Linked Lists/Arrays)", "System Design Basics", "OS/DBMS", "Java/C#"],
    process: "Codility Test -> 2 Technical Rounds -> AA (As appropriate) Manager Round",
    tips: "Focus on object-oriented system design and database fundamentals. Microsoft heavily evaluates memory optimization.",
    commonQuestions: [
      "Reverse a linked list in groups of size k",
      "Design a parking lot system using OOP guidelines",
      "Explain lock mechanisms and concurrency in databases"
    ],
    prepProgress: 80,
  },
  {
    id: "amazon",
    name: "Amazon",
    logoText: "AZ",
    skills: ["DSA (Heaps/Strings)", "Amazon Leadership Principles", "Systems Design"],
    process: "Online Assessment -> 2-3 Technical Rounds -> Bar Raiser Interview",
    tips: "Prepare STAR stories for each of the 16 Leadership Principles. Leadership alignment accounts for 50% of the evaluation.",
    commonQuestions: [
      "Merge k sorted arrays using Min-Heaps",
      "Design a library management system",
      "Describe a situation where you went above and beyond for a customer"
    ],
    prepProgress: 60,
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    logoText: "NV",
    skills: ["C/C++", "CUDA", "GPU Architecture", "Operating Systems"],
    process: "Technical screening -> 2 Hardware/C++ Rounds -> Team Matching",
    tips: " nvidia requires strong system level C programming, memory leaks diagnosis, and threads coordination.",
    commonQuestions: [
      "Explain volatile keyword and registers optimization in C",
      "Write a multi-threaded matrix multiplication algorithm",
      "How do CUDA blocks map to streaming multiprocessors?"
    ],
    prepProgress: 45,
  },
  {
    id: "adobe",
    name: "Adobe",
    logoText: "AD",
    skills: ["DSA (Backtracking/Trees)", "Computer Graphics Basics", "C++/Java"],
    process: "HackerRank OA -> 2 Technical Rounds -> Director Round",
    tips: "Prepare recursion, backtracking, and core math fundamentals. Adobe values visual algorithms understanding.",
    commonQuestions: [
      "Find all subsets of a set (backtracking)",
      "Design a paint brush application workflow",
      "Explain the difference between stack and heap memory allocation"
    ],
    prepProgress: 65,
  },
  {
    id: "atlassian",
    name: "Atlassian",
    logoText: "AT",
    skills: ["DSA", "System Design", "Values Alignment", "Java/JavaScript"],
    process: "Online Coding -> 1 DSA Round -> 1 System Design -> 1 Values & Team round",
    tips: "Focus on their values (e.g. 'Play, as a team'). Prepare for high-concurrency Node.js/Java API design questions.",
    commonQuestions: [
      "Implement a rate limiter (Token Bucket or Sliding Window)",
      "Design a real-time collaborative document editor (OT/CRDT)",
      "How do you handle a conflict with a tech lead on framework choices?"
    ],
    prepProgress: 50,
  }
];

export default function PlacementWarRoomClient() {
  const [selectedCompId, setSelectedCompId] = useState("google");
  
  // Mock Interview Form states
  const [mockMode, setMockMode] = useState<"Technical" | "HR" | "AI">("Technical");
  const [mockQuestion, setMockQuestion] = useState("Explain the time complexity of QuickSort in worst case.");
  const [mockResponse, setMockResponse] = useState("");
  const [mockHistory, setMockHistory] = useState<MockInterviewLog[]>([]);

  // Interview Prep checklist completion states
  const [prepChecklist, setPrepChecklist] = useState<Record<string, boolean>>({
    "dsa-graphs": true,
    "dsa-dp": false,
    "sys-cache": true,
    "sys-sharding": false,
    "core-os": true,
    "core-dbms": false,
    "hr-star": true,
    "hr-goals": false,
  });

  const [savingMsg, setSavingMsg] = useState<string | null>(null);

  // Sync practice history to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("soip_mock_interview_history");
      if (saved) {
        setMockHistory(JSON.parse(saved));
      } else {
        const defaultHistory: MockInterviewLog[] = [
          { id: "mock-log-1", mode: "Technical", question: "Difference between process and thread", response: "A process has its own address space while threads share memory space.", date: "2026-08-10", score: 85 }
        ];
        setMockHistory(defaultHistory);
        localStorage.setItem("soip_mock_interview_history", JSON.stringify(defaultHistory));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleCompanyClick = (id: string) => {
    setSelectedCompId(id);
  };

  const handleToggleChecklist = (key: string) => {
    setPrepChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Submit Mock interview response
  const handleSubmitMockResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockResponse.trim()) return;

    const newLog: MockInterviewLog = {
      id: `mock-log-${Date.now()}`,
      mode: mockMode,
      question: mockQuestion,
      response: mockResponse.trim(),
      date: new Date().toISOString().split("T")[0],
      score: Math.floor(Math.random() * 20) + 75 // Random score between 75 and 95
    };

    const updated = [newLog, ...mockHistory];
    setMockHistory(updated);
    localStorage.setItem("soip_mock_interview_history", JSON.stringify(updated));

    setMockResponse("");
    setSavingMsg(`Mock interview logged! Evaluation Score: ${newLog.score}%`);
    setTimeout(() => setSavingMsg(null), 3000);
  };

  // Update question based on mode
  useEffect(() => {
    if (mockMode === "Technical") {
      setMockQuestion("Describe how to detect a cycle in a directed graph.");
    } else if (mockMode === "HR") {
      setMockQuestion("Why do you want to join our organization and what makes you a good fit?");
    } else {
      setMockQuestion("Design a URL shortener like bit.ly. What are the database and storage estimations?");
    }
  }, [mockMode]);

  // Selected company object
  const activeCompany = useMemo(() => {
    return COMPANIES.find(c => c.id === selectedCompId) || COMPANIES[0];
  }, [selectedCompId]);

  // Dynamic calculations based on state
  const dynamicScores = useMemo(() => {
    const checkedCount = Object.values(prepChecklist).filter(Boolean).length;
    const totalCount = Object.keys(prepChecklist).length;
    const interviewReadiness = Math.round((checkedCount / totalCount) * 100);

    const resumeScore = 80;
    const skillScore = 75;
    const projectStrength = 85;

    // Overall offer readiness percentage formula
    const baseScore = Math.round((resumeScore + skillScore + interviewReadiness + projectStrength) / 4);

    return {
      resumeScore,
      skillScore,
      interviewReadiness,
      projectStrength,
      placementReadiness: baseScore
    };
  }, [prepChecklist]);

  return (
    <div className="space-y-8 font-mono text-zinc-350">
      
      {/* ── PLACEMENT DASHBOARD METRICS STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "PLACEMENT READINESS", value: `${dynamicScores.placementReadiness}%`, desc: "Combined preparational vector", color: "text-purple-400 border-purple-500/20 bg-purple-500/10", glow: "rgba(168, 85, 247, 0.15)" },
          { label: "RESUME ATS SCORE", value: `${dynamicScores.resumeScore}%`, desc: "Profile resume completeness", color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10", glow: "rgba(99, 102, 241, 0.15)" },
          { label: "SKILLS COVERAGE", value: `${dynamicScores.skillScore}%`, desc: "Target stack mapping", color: "text-amber-400 border-amber-500/20 bg-amber-500/10", glow: "rgba(245, 158, 11, 0.15)" },
          { label: "INTERVIEW MOCK RATIO", value: `${dynamicScores.interviewReadiness}%`, desc: "Preparational checkpoints", color: "text-rose-400 border-rose-500/20 bg-rose-500/10", glow: "rgba(244, 63, 94, 0.15)" },
          { label: "PROJECTS DEPTH", value: `${dynamicScores.projectStrength}%`, desc: "Portfolio showcases density", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10", glow: "rgba(16, 185, 129, 0.15)" }
        ].map((card, i) => (
          <HoverCard key={i} className={`p-4 border ${card.color} space-y-2`} glowColor={card.glow}>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide block">{card.label}</span>
            <div className="text-2xl font-black">{card.value}</div>
            <p className="text-[9px] text-zinc-550 leading-none">{card.desc}</p>
          </HoverCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Company Preparation Tracker & Insights (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Company Prep Selector & Insights */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-4">
              <div>
                <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  Target Recruiters Tracker
                </h3>
                <p className="text-[10px] text-zinc-550">Track requirements and progress for top-tier companies</p>
              </div>
              
              {savingMsg && (
                <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-lg animate-pulse font-bold">
                  {savingMsg}
                </span>
              )}
            </div>

            {/* Companies row */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {COMPANIES.map((company) => {
                const isSelected = selectedCompId === company.id;
                return (
                  <button
                    key={company.id}
                    onClick={() => handleCompanyClick(company.id)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-purple-955/20 border-purple-500/30 shadow-md shadow-purple-950/25"
                        : "bg-zinc-950/40 border-zinc-850 hover:border-zinc-700/60"
                    }`}
                  >
                    <span className="text-xs font-black text-zinc-200">{company.logoText}</span>
                    <span className="text-[9px] font-bold text-zinc-400 block">{company.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Company Insights */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850/80 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                  {activeCompany.name} Recruitment Insights
                </span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                  {activeCompany.prepProgress}% Prepared
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 text-xs font-mono">
                <div className="sm:col-span-8 space-y-3.5">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-550 uppercase font-bold tracking-wide">Hiring Process</span>
                    <p className="text-[11px] text-zinc-350 leading-relaxed font-light">{activeCompany.process}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-550 uppercase font-bold tracking-wide">Preparation Guidelines & Tips</span>
                    <p className="text-[11px] text-zinc-350 leading-relaxed font-light">{activeCompany.tips}</p>
                  </div>
                </div>

                <div className="sm:col-span-4 p-4 rounded-xl bg-zinc-900/30 border border-zinc-850 space-y-3">
                  <span className="text-[9px] text-zinc-550 uppercase font-bold tracking-wide block">Skills Needed</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCompany.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-zinc-950 border border-zinc-850 rounded text-[9px] text-zinc-400">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Common Questions */}
              <div className="space-y-2 pt-2">
                <span className="text-[9px] text-zinc-550 uppercase font-bold tracking-wide block">Frequently Asked Questions</span>
                <div className="space-y-2 text-[11px]">
                  {activeCompany.commonQuestions.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-zinc-900 border border-zinc-850/80 text-zinc-300 font-light flex items-start gap-2.5">
                      <span className="font-bold text-purple-400">{idx + 1}.</span>
                      <p>{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mock Interview Simulation Center */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-5 shadow-xl">
            <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-3">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs uppercase font-bold text-zinc-200">Mock Interview Simulator</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
              
              {/* Mock form (7 columns) */}
              <form onSubmit={handleSubmitMockResponse} className="sm:col-span-7 space-y-4 text-xs font-mono">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-550 uppercase font-bold">Select Interview Mode</span>
                  <div className="flex gap-2">
                    {["Technical", "HR", "AI"].map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setMockMode(mode as typeof mockMode)}
                        className={`flex-1 py-1.5 rounded-lg border text-center font-bold transition-all cursor-pointer text-[10px] ${
                          mockMode === mode
                            ? "bg-purple-955/20 border-purple-500/30 text-purple-300"
                            : "bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:border-zinc-850"
                        }`}
                      >
                        {mode} Mode
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-2">
                  <span className="text-[8px] text-purple-400 uppercase font-bold tracking-wide">Question Prompt:</span>
                  <p className="text-[11px] text-zinc-300 leading-relaxed font-bold">{mockQuestion}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-555 uppercase font-bold block">Your Answer Response</span>
                  <textarea
                    value={mockResponse}
                    onChange={(e) => setMockResponse(e.target.value)}
                    placeholder="Type your response to the prompt here..."
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2.5 px-3 focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-purple-600/10"
                  >
                    Submit Mock Answer
                  </button>
                </div>
              </form>

              {/* History logs (5 columns) */}
              <div className="sm:col-span-5 p-4 rounded-2xl bg-zinc-950 border border-zinc-850/80 space-y-3.5">
                <span className="text-[9px] text-zinc-550 uppercase font-bold tracking-wide block border-b border-zinc-900 pb-1.5">Simulation Logs</span>
                
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {mockHistory.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-850 text-[10px] leading-relaxed space-y-2 relative shadow-inner">
                      <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400 uppercase">
                        <span>{log.mode} Mode</span>
                        <span className="text-emerald-400 font-black">{log.score}% Score</span>
                      </div>
                      <p className="text-zinc-500 truncate font-light">Q: {log.question}</p>
                      <p className="text-zinc-300 font-light line-clamp-2">Ans: {log.response}</p>
                    </div>
                  ))}
                  {mockHistory.length === 0 && (
                    <span className="text-[10px] text-zinc-650 font-light block">No mock logs registered.</span>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Weakness detector & plan (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Visual Application Pipeline */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
            <span className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider block">Application Pipeline</span>
            
            <div className="space-y-2.5 text-xs font-mono">
              {[
                { stage: "Applied", active: true, count: 5, color: "text-purple-400 border-purple-500/25 bg-purple-500/5" },
                { stage: "Online Assessment (OA)", active: true, count: 2, color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
                { stage: "Technical Interview", active: true, count: 1, color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5" },
                { stage: "Final HR Round", active: false, count: 0, color: "text-zinc-600 border-zinc-900 bg-zinc-950/20" },
                { stage: "Offer Released", active: false, count: 0, color: "text-zinc-600 border-zinc-900 bg-zinc-950/20" }
              ].map((step, i) => (
                <div key={i} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${step.color}`}>
                  <span className="font-bold">{step.stage}</span>
                  <span className="text-[10px] font-black">{step.count} items</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Prep Checklist */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
            <span className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider block">Interview Checkpoints</span>
            
            <div className="space-y-2.5 text-xs font-mono">
              {[
                { key: "dsa-graphs", label: "DSA Graphs & Trees" },
                { key: "dsa-dp", label: "Dynamic Programming" },
                { key: "sys-cache", label: "System Caching Patterns" },
                { key: "sys-sharding", label: "Database Sharding Designs" },
                { key: "core-os", label: "Operating Systems (Mutex/Semaphore)" },
                { key: "core-dbms", label: "DBMS Indexing & Transactions" },
                { key: "hr-star", label: "HR STAR method practice" },
                { key: "hr-goals", label: "HR Career Alignment logs" }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleToggleChecklist(item.key)}
                  className="w-full flex items-center gap-3 text-left transition-colors hover:text-zinc-200 cursor-pointer"
                >
                  <div className="p-0.5 rounded bg-zinc-950 border border-zinc-850 flex items-center justify-center shrink-0">
                    {prepChecklist[item.key] ? (
                      <Check className="w-3.5 h-3.5 text-purple-400" />
                    ) : (
                      <div className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className={prepChecklist[item.key] ? "line-through text-zinc-550" : "text-zinc-300"}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Weakness Detector */}
          <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
            <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2">
              <AlertCircle className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs uppercase font-bold text-zinc-200">Weakness Diagnostic</h3>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-550 uppercase font-bold tracking-wide">Identified Gap: DSA DP</span>
                <p className="text-[11px] text-zinc-400 leading-normal font-light">
                  Weak recursive stack backtracking capabilities observed in mock assessments.
                </p>
                <Link
                  href="/dashboard/student/workspace"
                  className="inline-block text-[9px] text-purple-400 hover:text-purple-300 font-bold hover:underline pt-1"
                >
                  Create &apos;DSA DP master&apos; goal &rarr;
                </Link>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-555 uppercase font-bold tracking-wide">Identified Gap: Database Sharding</span>
                <p className="text-[11px] text-zinc-400 leading-normal font-light">
                  Lack of core sharding and vertical indexing techniques on PostgreSQL schemas.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
