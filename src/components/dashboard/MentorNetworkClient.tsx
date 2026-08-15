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
} from "lucide-react";
import HoverCard from "@/components/ui/HoverCard";
import MagneticButton from "@/components/ui/MagneticButton";
import EmptyState from "@/components/ui/EmptyState";

interface ExpertTwin {
  id: string;
  name: string;
  role: string;
  skills: string[];
  certifications: string[];
  projects: string[];
  learningRoadmap: string[];
  careerPath: string[];
}

interface AlumniMentor {
  id: string;
  name: string;
  role: string;
  company: string;
  skills: string[];
  domain: string;
  matchPercent: number;
}

interface MentorQuestion {
  id: string;
  question: string;
  category: string;
  status: "Answered" | "Pending";
  answer?: string;
  askedDate: string;
  popularCount: number;
}

const EXPERT_TWINS: ExpertTwin[] = [
  {
    id: "ai-twin",
    name: "AI Engineer Twin",
    role: "L5 Machine Learning Lead",
    skills: ["PyTorch", "Transformers", "LlamaIndex", "Vector Databases", "Python"],
    certifications: ["NVIDIA Certified CUDA Developer", "Google Professional ML Engineer"],
    projects: ["Real-time Multi-Agent RAG Pipeline", "Fine-tuned Llama-3 code assistant"],
    learningRoadmap: ["Advanced Backpropagation", "Transformer Architectures", "RLHF alignment"],
    careerPath: ["SRM Student", "Python/DSA Fundamentals", "ML Showcase Projects", "Research Intern", "AI Engineer Placement", "L5 ML Lead Target"]
  },
  {
    id: "sde-twin",
    name: "SDE Twin",
    role: "Senior Software Engineer",
    skills: ["Java", "System Design", "Kubernetes", "PostgreSQL", "Go"],
    certifications: ["AWS Solutions Architect Professional", "Certified Kubernetes Administrator"],
    projects: ["High-concurrency Event Streaming Middleware", "Distributed Cache Manager"],
    learningRoadmap: ["Database Partitioning & Sharding", "OAuth2 security flows", "Go concurrency model"],
    careerPath: ["SRM Student", "C++/Java & DSA", "Microservices Projects", "Summer SDE Intern", "SDE Placement", "Senior SDE Target"]
  },
  {
    id: "ds-twin",
    name: "Data Scientist Twin",
    role: "Lead Analytics Architect",
    skills: ["Pandas", "Scikit-Learn", "R/Python", "SQL", "Tableau"],
    certifications: ["Microsoft Certified Data Scientist", "Tableau Desktop Certified Professional"],
    projects: ["Predictive churn modeling on 10M rows", "AB testing analytics dashboard"],
    learningRoadmap: ["Frequentist & Bayesian statistics", "Time series forecasting", "Feature engineering pipelines"],
    careerPath: ["SRM Student", "SQL & Statistics", "Data Analysis Dashboards", "Data Analyst Intern", "DS Placement", "Lead DS Target"]
  },
  {
    id: "pm-twin",
    name: "Product Manager Twin",
    role: "Senior Product Manager",
    skills: ["Product Roadmap", "SQL", "A/B Testing", "Figma", "User Research"],
    certifications: ["Pragmatic Institute PM Certification", "Scrum Product Owner (CSPO)"],
    projects: ["SOIP Application Tracker UX overhaul", "E-commerce onboarding funnel optimization"],
    learningRoadmap: ["Cohort retention analysis", "Product led growth metrics", "Agile sprint management"],
    careerPath: ["SRM Student", "UI/UX & Product Design", "Startup Side Projects", "APM Intern", "APM Placement", "Senior PM Target"]
  }
];

const ALUMNI_MENTORS: AlumniMentor[] = [
  { id: "al-1", name: "Rahul Sharma", role: "SDE-2", company: "Google", skills: ["DSA", "Golang", "Kubernetes"], domain: "Cloud & Backend", matchPercent: 96 },
  { id: "al-2", name: "Priya Patel", role: "Machine Learning Researcher", company: "NVIDIA", skills: ["PyTorch", "CUDA", "LLMs"], domain: "AI/ML", matchPercent: 92 },
  { id: "al-3", name: "Aman Gupta", role: "Product Manager", company: "Amazon", skills: ["Product Strategy", "User Metrics"], domain: "Product Management", matchPercent: 88 },
  { id: "al-4", name: "Sneha Reddy", role: "Security Architect", company: "Microsoft", skills: ["Cryptography", "Cloud Security"], domain: "Cyber Security", matchPercent: 85 },
  { id: "al-5", name: "Vikram Malhotra", role: "Data Scientist", company: "Adobe", skills: ["Python", "Spark", "SQL"], domain: "Data Science", matchPercent: 78 }
];

const KNOWLEDGE_LIBRARY = [
  { id: "kb-1", title: "Google Cloud SDE Interview Experience", author: "Rahul Sharma", duration: "5 min read", category: "Interview Experience" },
  { id: "kb-2", title: "Preparing for NVIDIA AI Internships: Core CUDA Guides", author: "Priya Patel", duration: "8 min read", category: "Placement Guide" },
  { id: "kb-3", title: "Mastering STAR Interview Framework for Amazon PM Roles", author: "Aman Gupta", duration: "6 min read", category: "HR Prep Guide" },
  { id: "kb-4", title: "Microservices & Distributed Caching Core Fundamentals", author: "SRM Placement Cell", duration: "12 min read", category: "System Design Guide" }
];

export default function MentorNetworkClient() {
  const [activeSubTab, setActiveSubTab] = useState<"twins" | "alumni" | "ask" | "library">("twins");

  // Selected Twin state
  const [selectedTwinId, setSelectedTwinId] = useState("ai-twin");

  // Twin Chat states
  const [twinMessages, setTwinMessages] = useState<Array<{ sender: "user" | "twin"; text: string }>>([
    { sender: "twin", text: "Hello! I am your AI Expert Twin. How do I help you accelerate your career roadmap today?" }
  ]);
  const [chatInput, setChatInput] = useState("");

  // Alumni filter states
  const [alumniDomainFilter, setAlumniDomainFilter] = useState("all");
  const [alumniSearch, setAlumniSearch] = useState("");

  // Ask A Mentor states
  const [questions, setQuestions] = useState<MentorQuestion[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionCat, setNewQuestionCat] = useState("Technical");

  const [savingMsg, setSavingMsg] = useState<string | null>(null);

  // Sync questions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("soip_mentor_questions");
      if (saved) {
        setQuestions(JSON.parse(saved));
      } else {
        const defaultQuestions: MentorQuestion[] = [
          { id: "q-1", question: "How crucial is Kubernetes for entry-level backend developer roles?", category: "Technical", status: "Answered", answer: "Kubernetes is helpful but not mandatory for junior roles. Focus on mastering PostgreSQL and API architectures first.", askedDate: "2026-08-11", popularCount: 14 },
          { id: "q-2", question: "What is the baseline GPA cutoff for Google placement rounds at SRM?", category: "Placement", status: "Answered", answer: "Typically Google keeps a baseline cutoff of 8.5 CGPA, although exceptional coding portfolio profiles can be referred directly.", askedDate: "2026-08-12", popularCount: 28 }
        ];
        setQuestions(defaultQuestions);
        localStorage.setItem("soip_mentor_questions", JSON.stringify(defaultQuestions));
      }
    } catch {
      // ignore
    }
  }, []);

  const activeTwin = useMemo(() => {
    return EXPERT_TWINS.find(t => t.id === selectedTwinId) || EXPERT_TWINS[0];
  }, [selectedTwinId]);

  // Handle Twin Chat Submission
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const updated = [...twinMessages, { sender: "user" as const, text: userMsg }];
    setTwinMessages(updated);
    setChatInput("");

    // Generate responsive twin answers
    setTimeout(() => {
      let response = "I will analyze your vector profile to suggest the optimal approach.";
      if (userMsg.toLowerCase().includes("become")) {
        response = `To excel as a ${activeTwin.name}, you must master these core frameworks: ${activeTwin.skills.join(", ")}. Follow the path from ${activeTwin.careerPath.slice(0, 3).join(" -> ")} before targeting placements.`;
      } else if (userMsg.toLowerCase().includes("project")) {
        response = `I recommend you build these high-impact projects: ${activeTwin.projects.join(" & ")}. These will demonstrate your hands-on design capabilities.`;
      } else if (userMsg.toLowerCase().includes("skill")) {
        response = `Based on your profile, you are currently matching well. Next, focus on learning: ${activeTwin.learningRoadmap.join(", ")}.`;
      } else {
        response = `Accelerating into a ${activeTwin.role} position requires completing these certifications: ${activeTwin.certifications.join(", ")}. Let me know if you want to initialize a learning roadmap in your workspace!`;
      }

      setTwinMessages(prev => [...prev, { sender: "twin" as const, text: response }]);
    }, 800);
  };

  // Connect click handler
  const handleConnectMentor = (name: string) => {
    setSavingMsg(`Connection request sent to Alumni Mentor: ${name}`);
    setTimeout(() => setSavingMsg(null), 2500);
  };

  // Submit Mentor question
  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newQ: MentorQuestion = {
      id: `q-${Date.now()}`,
      question: newQuestionText.trim(),
      category: newQuestionCat,
      status: "Pending",
      askedDate: new Date().toISOString().split("T")[0],
      popularCount: 1
    };

    const updated = [newQ, ...questions];
    setQuestions(updated);
    localStorage.setItem("soip_mentor_questions", JSON.stringify(updated));

    setNewQuestionText("");
    setSavingMsg("Question queued to Mentor Network panel!");
    setTimeout(() => setSavingMsg(null), 2500);
  };

  // Upvote Question
  const handleUpvoteQuestion = (id: string) => {
    const updated = questions.map(q => {
      if (q.id === id) {
        return { ...q, popularCount: q.popularCount + 1 };
      }
      return q;
    });
    setQuestions(updated);
    localStorage.setItem("soip_mentor_questions", JSON.stringify(updated));
  };

  // Filter alumni
  const filteredAlumni = useMemo(() => {
    return ALUMNI_MENTORS.filter(al => {
      const matchDomain = alumniDomainFilter === "all" || al.domain === alumniDomainFilter;
      const matchSearch = al.name.toLowerCase().includes(alumniSearch.toLowerCase()) ||
                          al.company.toLowerCase().includes(alumniSearch.toLowerCase()) ||
                          al.role.toLowerCase().includes(alumniSearch.toLowerCase());
      return matchDomain && matchSearch;
    });
  }, [alumniSearch, alumniDomainFilter]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 font-mono text-zinc-350">
      
      {/* Left Column: Command cockpit sidebar tabs */}
      <div className="w-full lg:w-64 shrink-0 space-y-3">
        <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold text-zinc-200">Mentor Hub</h2>
          </div>
          <span className="text-[9px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded font-bold uppercase">Twin active</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {[
            { id: "twins", label: "Expert Twin Cockpit", icon: Cpu },
            { id: "alumni", label: "Alumni Directory", icon: Users },
            { id: "ask", label: "Ask A Mentor", icon: HelpCircle },
            { id: "library", label: "Knowledge Library", icon: BookOpen }
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
          <span className="text-[8px] text-zinc-550 uppercase font-bold block tracking-wider">Matching Sync</span>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Alumni Vectors Synced</span>
          </div>
          {savingMsg && (
            <div className="text-[9px] text-purple-400 animate-pulse font-bold leading-normal pt-1">
              {savingMsg}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Active workspace render panel */}
      <div className="flex-1 space-y-6">
        
        {/* EXPERT TWIN COCKPIT */}
        {activeSubTab === "twins" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Twins Row selection */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {EXPERT_TWINS.map((twin) => {
                const isSelected = selectedTwinId === twin.id;
                return (
                  <button
                    key={twin.id}
                    onClick={() => {
                      setSelectedTwinId(twin.id);
                      setTwinMessages([
                        { sender: "twin", text: `Hello! I am your AI ${twin.name}. Ready to optimize your roadmap now.` }
                      ]);
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-purple-955/20 border-purple-500/30 text-purple-300"
                        : "bg-zinc-950/40 border-zinc-850 hover:border-zinc-805"
                    }`}
                  >
                    <Cpu className={`w-4.5 h-4.5 ${isSelected ? "text-purple-400 animate-pulse" : "text-zinc-550"}`} />
                    <span className="text-[10px] font-bold block mt-1">{twin.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Twin Details & Career Roadmaps (7 columns) */}
              <HoverCard className="md:col-span-7 p-6 space-y-5" glowColor="rgba(139, 92, 246, 0.12)">
                <div>
                  <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                    {activeTwin.name} Profile
                  </h3>
                  <p className="text-[10px] text-zinc-550 font-mono">Generative twin tracking target achievements</p>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2">
                      <span className="text-[9px] text-zinc-550 uppercase font-bold tracking-wide block">Skills Needed</span>
                      <div className="flex flex-wrap gap-1">
                        {activeTwin.skills.map(s => (
                          <span key={s} className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-850 rounded text-[9px] text-zinc-450">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2">
                      <span className="text-[9px] text-zinc-555 uppercase font-bold tracking-wide block">Recommended Certs</span>
                      <div className="space-y-1 text-[10px] text-zinc-400 font-light">
                        {activeTwin.certifications.map(c => (
                          <div key={c} className="flex items-start gap-1">
                            <span className="text-purple-400 shrink-0">•</span>
                            <span className="leading-tight">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Career path roadmaps */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850/80 space-y-3.5">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono block">Career Roadmap Milestone Paths</span>
                    
                    <div className="relative pl-4 border-l border-zinc-800 space-y-3 pt-1 pb-1">
                      {activeTwin.careerPath.map((step, idx) => {
                        const isFinal = idx === activeTwin.careerPath.length - 1;
                        return (
                          <div key={idx} className="relative">
                            <div className={`absolute -left-[20px] top-1.5 w-2 h-2 rounded-full border border-zinc-950 ${
                              isFinal ? "bg-purple-500 animate-pulse scale-125" : "bg-zinc-700"
                            }`} />
                            <span className={`text-[11px] font-bold ${isFinal ? "text-purple-400" : "text-zinc-300"}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </HoverCard>

              {/* Generative Twin chat Console (5 columns) */}
              <HoverCard className="md:col-span-5 p-5 flex flex-col justify-between h-[450px]" glowColor="rgba(99, 102, 241, 0.12)">
                <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] uppercase font-bold text-zinc-300">Twin Assistant</span>
                </div>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2 font-mono text-xs">
                  {twinMessages.map((msg, i) => (
                    <div key={i} className={`p-2.5 rounded-xl border leading-relaxed max-w-[90%] font-light ${
                      msg.sender === "user"
                        ? "bg-purple-955/15 border-purple-500/25 text-purple-300 self-end ml-auto"
                        : "bg-zinc-950 border-zinc-900 text-zinc-300"
                    }`}>
                      {msg.text}
                    </div>
                  ))}
                </div>

                {/* Chat Form */}
                <form onSubmit={handleChatSubmit} className="flex gap-2 border-t border-zinc-900 pt-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about roadmaps or missing skills..."
                    className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </HoverCard>

            </div>
          </motion.div>
        )}

        {/* ALUMNI DIRECTORY */}
        {activeSubTab === "alumni" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-5 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
              <div>
                <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  SRM Alumni & Mentors Directory
                </h3>
                <p className="text-[10px] text-zinc-550">Filter verified campus alumni references</p>
              </div>

              {/* Alumni Domain Filter selector */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-850">
                {["all", "Cloud & Backend", "AI/ML", "Product Management"].map((domain) => (
                  <button
                    key={domain}
                    onClick={() => setAlumniDomainFilter(domain)}
                    className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all cursor-pointer ${
                      alumniDomainFilter === domain ? "bg-zinc-900 text-purple-300" : "text-zinc-500"
                    }`}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input bar */}
            <div className="relative">
              <input
                type="text"
                value={alumniSearch}
                onChange={(e) => setAlumniSearch(e.target.value)}
                placeholder="Search alumni names, companies, or roles..."
                className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-300"
              />
              <span className="absolute left-3 top-2.5 text-zinc-650">🔍</span>
            </div>

            {/* Alumni list cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              {filteredAlumni.map((al) => (
                <div key={al.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 flex flex-col justify-between gap-4 shadow-inner">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-200">{al.name}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded font-bold">
                        {al.matchPercent}% Match
                      </span>
                    </div>

                    <div className="text-[10px] text-zinc-500 space-y-0.5">
                      <span>Role: {al.role} @ <strong className="text-zinc-300">{al.company}</strong></span>
                      <span className="block text-zinc-600">Domain: {al.domain}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {al.skills.map(s => (
                      <span key={s} className="px-1.5 py-0.1 bg-zinc-900 border border-zinc-850 rounded text-[9px] text-zinc-400">{s}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-900 pt-2">
                    <span className="text-[9px] text-zinc-650">Verified Alumni</span>
                    <button
                      onClick={() => handleConnectMentor(al.name)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-[9px] transition-all cursor-pointer"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              ))}
              {filteredAlumni.length === 0 && (
                <div className="py-12 text-center text-zinc-500 col-span-2 space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto animate-pulse" />
                  <p className="text-xs">No alumni found matching guidelines.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ASK A MENTOR */}
        {activeSubTab === "ask" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Question Submission Cockpit */}
            <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
              <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                <Plus className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs uppercase font-bold text-zinc-200">Submit New Question</h3>
              </div>

              <form onSubmit={handleSubmitQuestion} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold block uppercase font-mono">Your Query</span>
                    <input
                      type="text"
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="e.g. Is a portfolio project in Rust rated highly for system roles?"
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                    />
                  </div>

                  <div className="sm:col-span-4 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold block uppercase font-mono">Category</span>
                    <select
                      value={newQuestionCat}
                      onChange={(e) => setNewQuestionCat(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-zinc-300 focus:outline-none"
                    >
                      <option value="Technical">Technical</option>
                      <option value="Placement">Placement Guidance</option>
                      <option value="HR Advice">HR & Interview tips</option>
                      <option value="Resume Review">Resume & Portfolios</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-purple-600/10 text-xs"
                  >
                    Submit Question
                  </button>
                </div>
              </form>
            </div>

            {/* Questions archive database */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
              <div>
                <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                  Queued Questions Archive
                </h3>
                <p className="text-[10px] text-zinc-550 font-mono">Track answered and popular questions</p>
              </div>

              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                {questions.map((q) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 flex flex-col justify-between gap-3 text-xs font-mono shadow-inner">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                      <div className="space-y-0.5">
                        <span className="font-bold text-zinc-200 block">{q.question}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.1 bg-zinc-900 text-zinc-500 rounded border border-zinc-850 font-bold">{q.category}</span>
                      </div>

                      <button
                        onClick={() => handleUpvoteQuestion(q.id)}
                        className="px-2.5 py-1 bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-zinc-400 hover:text-purple-300 font-bold rounded-lg text-[9px] transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        ▲ Upvote ({q.popularCount})
                      </button>
                    </div>

                    {q.status === "Answered" ? (
                      <div className="p-3.5 rounded-xl bg-purple-955/10 border border-purple-500/10 text-purple-300 leading-relaxed font-light text-[11px] whitespace-pre-line shadow-inner">
                        <strong>Mentor Answer:</strong> {q.answer}
                      </div>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-bold animate-pulse">⌛ Queued to Alumni Network</span>
                    )}

                    <div className="flex justify-end text-[8px] text-zinc-600">
                      <span>Asked on: {q.askedDate}</span>
                    </div>
                  </div>
                ))}
                {questions.length === 0 && (
                  <div className="py-8 text-center text-zinc-650 text-xs">
                    No questions logged in network queue.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* KNOWLEDGE LIBRARY */}
        {activeSubTab === "library" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl"
          >
            <div>
              <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Alumni Success Stories & Knowledge Library
              </h3>
              <p className="text-[10px] text-zinc-555 font-mono">Curated interview experiences and guides databases</p>
            </div>

            {/* Library list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              {KNOWLEDGE_LIBRARY.map((item) => (
                <div key={item.id} className="p-4.5 rounded-2xl bg-zinc-950 border border-zinc-850 flex flex-col justify-between gap-4 shadow-inner hover:border-zinc-800 transition-colors">
                  <div className="space-y-1.5">
                    <span className="text-[8px] uppercase px-2 py-0.5 bg-zinc-900 text-zinc-500 border border-zinc-850 rounded font-bold w-max block">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-zinc-200 leading-normal">{item.title}</h4>
                    <span className="text-[10px] text-zinc-500 block">Contributor: {item.author}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-900 pt-2.5 text-[9px] text-zinc-550">
                    <span>{item.duration}</span>
                    <span className="text-purple-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5">
                      Open Guide <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
