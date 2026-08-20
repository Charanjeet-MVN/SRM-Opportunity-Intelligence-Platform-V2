"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  Award,
  User,
  Github,
  Linkedin,
  Mail,
  Globe,
  Sparkles,
  TrendingUp,
  Cpu,
  FileCode,
  Share2,
  RefreshCw,
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
  progress: number; // 0 to 100
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

const DETECTED_RESUME_SKILLS = {
  languages: ["TypeScript", "JavaScript", "Python", "C++", "SQL", "Go"],
  frameworks: ["React", "Next.js", "Node.js", "Express", "TailwindCSS"],
  databases: ["PostgreSQL", "MongoDB", "Redis", "Supabase PgVector"],
  aiMl: ["PyTorch", "TensorFlow", "Scikit-Learn", "OpenAI APIs", "LlamaIndex"],
  cloud: ["AWS", "Vercel", "Docker", "GCP"],
  tools: ["Git", "Figma", "Postman", "Linux", "VS Code"],
};

const ROLE_REQUIREMENTS = {
  ai_engineer: {
    title: "AI Engineer",
    skills: ["Python", "PyTorch", "TensorFlow", "OpenAI APIs", "LlamaIndex", "LangChain", "Vector Databases", "Docker"],
  },
  software_engineer: {
    title: "Software Engineer",
    skills: ["TypeScript", "React", "Next.js", "Node.js", "SQL", "PostgreSQL", "AWS", "Git", "Docker", "Algorithms"],
  },
  data_scientist: {
    title: "Data Scientist",
    skills: ["Python", "SQL", "Pandas", "NumPy", "Scikit-Learn", "Matplotlib", "Statistics", "Machine Learning", "R"],
  },
  product_manager: {
    title: "Product Manager",
    skills: ["Agile Roadmap Planning", "Product Analytics", "A/B Testing", "UX Prototyping", "SQL", "System Design Basics", "User Interviewing"],
  },
};

export default function ResumeLabClient() {
  const [activeTab, setActiveTab] = useState<"resume" | "portfolio">("resume");
  const [portfolio, setPortfolio] = useState<PortfolioData>(DEFAULT_PORTFOLIO);
  
  // Resume states
  const [uploading, setUploading] = useState(false);
  const [parsed, setParsed] = useState(false);
  const [targetRole, setTargetRole] = useState<keyof typeof ROLE_REQUIREMENTS>("ai_engineer");
  
  // Edit Portfolio Form states
  const [bioInput, setBioInput] = useState(DEFAULT_PORTFOLIO.bio);
  const [emailInput, setEmailInput] = useState(DEFAULT_PORTFOLIO.contact.email);
  const [githubInput, setGithubInput] = useState(DEFAULT_PORTFOLIO.contact.github);
  const [linkedinInput, setLinkedinInput] = useState(DEFAULT_PORTFOLIO.contact.linkedin);
  const [websiteInput, setWebsiteInput] = useState(DEFAULT_PORTFOLIO.contact.website);
  
  // Project Form states
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjTech, setNewProjTech] = useState("");
  const [newProjGit, setNewProjGit] = useState("");
  const [newProjLive, setNewProjLive] = useState("");
  
  // Certification Form states
  const [newCertName, setNewCertName] = useState("");
  const [newCertOrg, setNewCertOrg] = useState("");
  const [newCertDate, setNewCertDate] = useState("");
  const [newCertProgress, setNewCertProgress] = useState(100);

  const [copiedLink, setCopiedLink] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("soip_public_portfolio");
      if (saved) {
        const parsedData = JSON.parse(saved);
        setPortfolio(parsedData);
        setBioInput(parsedData.bio);
        setEmailInput(parsedData.contact.email);
        setGithubInput(parsedData.contact.github);
        setLinkedinInput(parsedData.contact.linkedin);
        setWebsiteInput(parsedData.contact.website);
      }
      
      const savedParsed = localStorage.getItem("soip_resume_parsed");
      if (savedParsed === "true") {
        setParsed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const savePortfolio = (updated: PortfolioData) => {
    setPortfolio(updated);
    try {
      localStorage.setItem("soip_public_portfolio", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // ─────────────── PROFILE COMPLETENESS ───────────────
  const completenessDetails = useMemo(() => {
    let score = 40; // Base profile info
    const tasks: string[] = [];
    
    if (parsed) {
      score += 15;
    } else {
      tasks.push("Upload and analyze your resume in the Resume Lab");
    }
    
    if (portfolio.bio.length > 50) {
      score += 10;
    } else {
      tasks.push("Write a detailed professional summary/about section");
    }
    
    if (portfolio.projects.length >= 2) {
      score += 20;
    } else if (portfolio.projects.length === 1) {
      score += 10;
      tasks.push("Add at least 2 projects to showcase technical capabilities");
    } else {
      tasks.push("Add your side projects to display skills visually");
    }
    
    if (portfolio.certifications.length >= 1) {
      score += 15;
    } else {
      tasks.push("Add certifications to showcase verified competencies");
    }
    
    return { score, tasks };
  }, [portfolio, parsed]);

  // ─────────────── RESUME SIMULATED PARSING ───────────────
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    setTimeout(() => {
      setUploading(false);
      setParsed(true);
      try {
        localStorage.setItem("soip_resume_parsed", "true");
      } catch (err) {
        console.error(err);
      }
    }, 1500);
  };

  const handleResetResume = () => {
    setParsed(false);
    try {
      localStorage.removeItem("soip_resume_parsed");
    } catch (err) {
      console.error(err);
    }
  };

  // ─────────────── MISSING SKILLS COMPILER ───────────────
  const skillComparison = useMemo(() => {
    const required = ROLE_REQUIREMENTS[targetRole].skills;
    // Flatten detected resume skills
    const detectedFlat = Object.values(DETECTED_RESUME_SKILLS).flat().map(s => s.toLowerCase());
    
    const matching = required.filter(skill => detectedFlat.includes(skill.toLowerCase()));
    const missing = required.filter(skill => !detectedFlat.includes(skill.toLowerCase()));
    
    return { matching, missing };
  }, [targetRole]);

  // ─────────────── PORTFOLIO SAVE TRIGGERS ───────────────
  const handleUpdateBio = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PortfolioData = {
      ...portfolio,
      bio: bioInput,
      contact: {
        email: emailInput,
        github: githubInput,
        linkedin: linkedinInput,
        website: websiteInput,
      },
    };
    savePortfolio(updated);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim() || !newProjDesc.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: newProjName.trim(),
      description: newProjDesc.trim(),
      technologies: newProjTech.split(",").map(t => t.trim()).filter(Boolean),
      githubUrl: newProjGit.trim() || "github.com",
      liveUrl: newProjLive.trim() || "vercel.app",
    };

    const updated = {
      ...portfolio,
      projects: [...portfolio.projects, newProject],
    };
    savePortfolio(updated);
    setNewProjName("");
    setNewProjDesc("");
    setNewProjTech("");
    setNewProjGit("");
    setNewProjLive("");
  };

  const handleDeleteProject = (id: string) => {
    const updated = {
      ...portfolio,
      projects: portfolio.projects.filter(p => p.id !== id),
    };
    savePortfolio(updated);
  };

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertName.trim() || !newCertOrg.trim()) return;

    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: newCertName.trim(),
      organization: newCertOrg.trim(),
      date: newCertDate || new Date().toISOString().split("T")[0],
      progress: Number(newCertProgress) || 100,
    };

    const updated = {
      ...portfolio,
      certifications: [...portfolio.certifications, newCert],
    };
    savePortfolio(updated);
    setNewCertName("");
    setNewCertOrg("");
    setNewCertDate("");
    setNewCertProgress(100);
  };

  const handleDeleteCert = (id: string) => {
    const updated = {
      ...portfolio,
      certifications: portfolio.certifications.filter(c => c.id !== id),
    };
    savePortfolio(updated);
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/profile/${portfolio.username}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div className="space-y-6 font-mono text-zinc-300">
      {/* Tab Selectors */}
      <div className="flex items-center gap-2 border-b border-zinc-850 pb-2">
        <button
          onClick={() => setActiveTab("resume")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "resume"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>AI Resume Lab</span>
        </button>

        <button
          onClick={() => setActiveTab("portfolio")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "portfolio"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Portfolio Studio</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ─────────────── TAB 1: RESUME LAB ─────────────── */}
        {activeTab === "resume" && (
          <motion.div
            key="resume"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6"
          >
            {!parsed ? (
              /* Dropzone upload block */
              <div className="p-10 rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-zinc-200">Upload Resume PDF</h3>
                  <p className="text-[10px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
                    AI engine will parse programming skills, libraries, and experience to run automated role-matching score reports.
                  </p>
                </div>
                <label className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer relative shadow-md shadow-purple-600/15">
                  <span>{uploading ? "Analyzing Vector..." : "Choose File"}</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleResumeUpload}
                    disabled={uploading}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
              </div>
            ) : (
              /* Analysis report page */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score panel (Left column) */}
                <div className="space-y-6 lg:col-span-1">
                  <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-400" />
                        <h2 className="text-xs font-bold text-zinc-200">Resume Report</h2>
                      </div>
                      <button
                        onClick={handleResetResume}
                        className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Re-upload</span>
                      </button>
                    </div>

                    {/* Overall score card */}
                    <div className="py-4 rounded-xl bg-zinc-950 flex flex-col items-center justify-center border border-zinc-850 shadow-inner space-y-2">
                      <span className="text-[9px] uppercase font-bold text-zinc-500">Overall ATS score</span>
                      <div className="text-3xl font-black text-purple-400">79%</div>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">Good Match</span>
                    </div>

                    {/* Breakdown sliders */}
                    <div className="space-y-3.5 text-[10px]">
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono">
                          <span className="text-zinc-500">TECHNICAL SKILLS:</span>
                          <span className="font-bold text-zinc-200">85%</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: "85%" }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-mono">
                          <span className="text-zinc-500">PROJECT QUALITY:</span>
                          <span className="font-bold text-zinc-200">80%</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: "80%" }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-mono">
                          <span className="text-zinc-500">EXPERIENCE & LEADERSHIP:</span>
                          <span className="font-bold text-zinc-200">72%</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: "72%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile completeness widget */}
                  <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-200 font-mono">Profile Completeness</span>
                      <span className="font-bold text-purple-400">{completenessDetails.score}%</span>
                    </div>

                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500"
                        style={{ width: `${completenessDetails.score}%` }}
                      />
                    </div>

                    {completenessDetails.tasks.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-[9px] uppercase font-bold text-zinc-500">Recommendations</span>
                        <div className="space-y-1.5 text-[10px]">
                          {completenessDetails.tasks.map((task, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-zinc-400">
                              <span className="text-purple-400 font-bold">•</span>
                              <span>{task}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skill extraction + Role analysis (Right Columns) */}
                <div className="space-y-6 lg:col-span-2">
                  {/* Skill extraction display */}
                  <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      <h2 className="text-xs font-bold text-zinc-200">Detected Skill Vectors</h2>
                    </div>

                    <div className="space-y-4 text-xs font-mono">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-zinc-500 uppercase">Languages</span>
                          <div className="flex flex-wrap gap-1.5">
                            {DETECTED_RESUME_SKILLS.languages.map(s => (
                              <span key={s} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded text-[10px]">{s}</span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[9px] text-zinc-500 uppercase">Frameworks</span>
                          <div className="flex flex-wrap gap-1.5">
                            {DETECTED_RESUME_SKILLS.frameworks.map(s => (
                              <span key={s} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded text-[10px]">{s}</span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[9px] text-zinc-500 uppercase">Databases</span>
                          <div className="flex flex-wrap gap-1.5">
                            {DETECTED_RESUME_SKILLS.databases.map(s => (
                              <span key={s} className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-300 rounded text-[10px]">{s}</span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[9px] text-zinc-500 uppercase">Cloud & Tools</span>
                          <div className="flex flex-wrap gap-1.5">
                            {DETECTED_RESUME_SKILLS.cloud.concat(DETECTED_RESUME_SKILLS.tools).slice(0, 7).map(s => (
                              <span key={s} className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-[10px]">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Missing skill compiler */}
                  <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <h2 className="text-xs font-bold text-zinc-200">Missing Skills Analysis</h2>
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto shrink-0 select-none">
                        {(Object.keys(ROLE_REQUIREMENTS) as Array<keyof typeof ROLE_REQUIREMENTS>).map((key) => (
                          <button
                            key={key}
                            onClick={() => setTargetRole(key)}
                            className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-colors shrink-0 ${
                              targetRole === key
                                ? "bg-purple-600 text-white"
                                : "bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            {ROLE_REQUIREMENTS[key].title}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="space-y-2 p-3 rounded-xl bg-zinc-950/60 border border-zinc-850">
                        <span className="text-[9px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Matching Skills
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {skillComparison.matching.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px]">{s}</span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 p-3 rounded-xl bg-zinc-950/60 border border-zinc-850">
                        <span className="text-[9px] text-red-400 font-bold uppercase flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Missing Skills
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {skillComparison.missing.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[10px]">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recommended learning path */}
                    <div className="p-4 rounded-xl bg-purple-950/15 border border-purple-900/25 space-y-2 text-xs">
                      <span className="text-[9px] text-purple-400 uppercase font-bold tracking-wider block">Recommended Learning Path</span>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-light">
                        {targetRole === "ai_engineer"
                          ? "Focus on LangChain, Vector Databases (PgVector/Pinecone) and LLM Orchestration workflows. Build at least 2 structured generative agent pipelines to secure high relevance matches."
                          : targetRole === "software_engineer"
                          ? "Strengthen your systems design basics, API structures, and containerization layers. Add projects using AWS, Docker pipelines, and Next.js middlewares."
                          : targetRole === "data_scientist"
                          ? "Complete advanced Pandas statistics coursework and machine learning regression algorithms models. Seede custom Kaggle database notebook pipelines."
                          : "Establish user prototyping, systems design maps, and agile project roadmap vectors. Focus on project analytics integrations."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ─────────────── TAB 2: PORTFOLIO STUDIO ─────────────── */}
        {activeTab === "portfolio" && (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Editor Workspace (Left Column) */}
            <div className="space-y-6 lg:col-span-7">
              {/* Profile Bio Editor */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
                  <User className="w-4 h-4 text-purple-400" />
                  <h2 className="text-xs font-bold text-zinc-200">About Me & Contact</h2>
                </div>

                <form onSubmit={handleUpdateBio} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase">Professional Summary</label>
                    <textarea
                      rows={3}
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase">Email Address</label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase">GitHub Portfolio link</label>
                      <input
                        type="text"
                        value={githubInput}
                        onChange={(e) => setGithubInput(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase">LinkedIn Profile Link</label>
                      <input
                        type="text"
                        value={linkedinInput}
                        onChange={(e) => setLinkedinInput(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase">Personal Website URL</label>
                      <input
                        type="text"
                        value={websiteInput}
                        onChange={(e) => setWebsiteInput(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-purple-600/10"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              {/* Projects builder */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <h2 className="text-xs font-bold text-zinc-200">Project Showcase</h2>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold">{portfolio.projects.length} Registered</span>
                </div>

                {/* Projects form */}
                <form onSubmit={handleAddProject} className="space-y-3.5 text-xs bg-zinc-950/40 p-4 rounded-xl border border-zinc-850">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 block">Add New Project</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase">Project Name</label>
                      <input
                        type="text"
                        required
                        value={newProjName}
                        onChange={(e) => setNewProjName(e.target.value)}
                        placeholder="e.g. SRM Opportunity System"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase">Technologies (comma separated)</label>
                      <input
                        type="text"
                        value={newProjTech}
                        onChange={(e) => setNewProjTech(e.target.value)}
                        placeholder="Next.js, TypeScript, PostgreSQL"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase">Description</label>
                    <textarea
                      rows={2}
                      required
                      value={newProjDesc}
                      onChange={(e) => setNewProjDesc(e.target.value)}
                      placeholder="Brief details about capabilities, outcomes, and libraries..."
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase">GitHub Repository Link</label>
                      <input
                        type="text"
                        value={newProjGit}
                        onChange={(e) => setNewProjGit(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase">Live Demo Link</label>
                      <input
                        type="text"
                        value={newProjLive}
                        onChange={(e) => setNewProjLive(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-purple-600/10 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Project</span>
                    </button>
                  </div>
                </form>

                {/* Projects list */}
                <div className="space-y-2 pt-2">
                  {portfolio.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-850 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <h4 className="font-bold text-zinc-200 truncate">{proj.name}</h4>
                        <p className="text-[10px] text-zinc-400 leading-normal font-light">{proj.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {proj.technologies.map(t => (
                            <span key={t} className="px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded text-[9px]">{t}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-2 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-500 hover:text-red-400 hover:border-red-900/20 hover:bg-red-950/10 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certification tracker */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <h2 className="text-xs font-bold text-zinc-200">Certification Hub</h2>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold">{portfolio.certifications.length} Active</span>
                </div>

                {/* Certification form */}
                <form onSubmit={handleAddCert} className="space-y-3.5 text-xs bg-zinc-950/40 p-4 rounded-xl border border-zinc-850">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 block">Add New Certificate</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase">Certificate Name</label>
                      <input
                        type="text"
                        required
                        value={newCertName}
                        onChange={(e) => setNewCertName(e.target.value)}
                        placeholder="e.g. AWS Cloud Practitioner"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase">Issuing Organization</label>
                      <input
                        type="text"
                        required
                        value={newCertOrg}
                        onChange={(e) => setNewCertOrg(e.target.value)}
                        placeholder="AWS, Coursera, deeplearning.ai"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase">Completion Date</label>
                      <input
                        type="date"
                        value={newCertDate}
                        onChange={(e) => setNewCertDate(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-300 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase">Preparation Progress ({newCertProgress}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={newCertProgress}
                        onChange={(e) => setNewCertProgress(Number(e.target.value))}
                        className="w-full accent-purple-600 bg-zinc-800 rounded-lg cursor-pointer h-2"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-purple-600/10 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Certificate</span>
                    </button>
                  </div>
                </form>

                {/* Certifications list */}
                <div className="space-y-2 pt-2">
                  {portfolio.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-850 flex items-center justify-between gap-4 text-xs font-mono"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                            cert.progress === 100
                              ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {cert.progress === 100 ? "Completed" : `${cert.progress}% Prepared`}
                          </span>
                          <h4 className="font-bold text-zinc-200 truncate">{cert.name}</h4>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-light">Org: {cert.organization} · Issued: {cert.date}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCert(cert.id)}
                        className="p-2 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-500 hover:text-red-400 hover:border-red-900/20 hover:bg-red-950/10 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Read.cv style preview (Right Column) */}
            <div className="space-y-6 lg:col-span-5">
              <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-6 sticky top-6 shadow-2xl">
                {/* Header preview options */}
                <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-zinc-200">Portfolio Studio Preview</span>
                  </div>

                  <button
                    onClick={handleCopyShareLink}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all text-[10px] cursor-pointer"
                  >
                    <span>{copiedLink ? "Copied!" : "Share Profile"}</span>
                    <Share2 className="w-3 h-3 text-zinc-500" />
                  </button>
                </div>

                {/* Read.cv container */}
                <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-850 space-y-6 text-xs text-zinc-300">
                  {/* Name section */}
                  <div className="space-y-1">
                    <h1 className="text-lg font-black tracking-tight text-zinc-100 uppercase">Charanjeet Singh</h1>
                    <span className="text-[10px] text-zinc-500 font-mono tracking-wide">Developer & AI Product Engineer</span>
                  </div>

                  {/* Bio */}
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-light whitespace-pre-line">
                    {portfolio.bio}
                  </p>

                  {/* Contact Chips */}
                  <div className="flex flex-wrap gap-2 text-[9px] font-mono text-zinc-500 pt-1">
                    {emailInput && <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {emailInput}</span>}
                    {githubInput && <span className="flex items-center gap-1.5"><Github className="w-3 h-3" /> {githubInput}</span>}
                    {linkedinInput && <span className="flex items-center gap-1.5"><Linkedin className="w-3 h-3" /> {linkedinInput}</span>}
                    {websiteInput && <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {websiteInput}</span>}
                  </div>

                  {/* Projects showcase */}
                  {portfolio.projects.length > 0 && (
                    <div className="space-y-2.5 pt-2 border-t border-zinc-850">
                      <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Featured Projects</span>
                      <div className="space-y-3">
                        {portfolio.projects.map(proj => (
                          <div key={proj.id} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-zinc-200">{proj.name}</span>
                              <div className="flex items-center gap-2 text-zinc-500">
                                <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300"><Github className="w-3 h-3" /></a>
                                <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300"><ExternalLink className="w-3 h-3" /></a>
                              </div>
                            </div>
                            <p className="text-[10px] text-zinc-400 font-light leading-relaxed">{proj.description}</p>
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {proj.technologies.slice(0, 4).map(t => (
                                <span key={t} className="px-1.5 py-0.2 bg-zinc-950/60 text-zinc-500 rounded text-[9px] border border-zinc-850">{t}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications showcase */}
                  {portfolio.certifications.length > 0 && (
                    <div className="space-y-2.5 pt-2 border-t border-zinc-850">
                      <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Verified Credentials</span>
                      <div className="space-y-2">
                        {portfolio.certifications.map(cert => (
                          <div key={cert.id} className="flex items-center justify-between text-[10px]">
                            <div className="space-y-0.5">
                              <span className="font-bold text-zinc-200">{cert.name}</span>
                              <span className="text-zinc-500 block text-[9px]">{cert.organization} · {cert.date}</span>
                            </div>
                            {cert.progress === 100 ? (
                              <CheckCircle2 className="w-4 h-4 text-purple-400" />
                            ) : (
                              <span className="text-[9px] text-purple-400 font-bold">{cert.progress}%</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
