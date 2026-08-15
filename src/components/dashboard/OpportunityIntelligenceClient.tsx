/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Award,
  Clock,
  Search,
  Building2,
  Sparkles,
  Filter,
  Plus,
  Trash2,
  Bookmark,
  Activity,
  TrendingUp,
  Info,
  Calendar,
  ChevronRight,
  Check,
  Zap,
  Briefcase,
  AlertCircle,
  Eye,
  RefreshCw,
} from "lucide-react";

interface OpportunityItem {
  id: string;
  title: string;
  organization: string;
  category: "internship" | "hackathon" | "scholarship" | "event" | "research";
  location: "Remote" | "Hybrid" | "On-Campus";
  stipend: string;
  duration: string;
  deadline: string;
  skills: string[];
  views: number;
  saves: number;
  applications: number;
  featured?: boolean;
  addedTime: Date;
}

const INITIAL_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: "opp-1",
    title: "Google STEP Intern 2026",
    organization: "Google India",
    category: "internship",
    location: "Remote",
    stipend: "₹1,20,000/mo",
    duration: "12 Weeks",
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 days
    skills: ["Python", "C++", "Algorithms"],
    views: 450,
    saves: 180,
    applications: 95,
    featured: true,
    addedTime: new Date(Date.now() - 30 * 60 * 1000), // 30m ago
  },
  {
    id: "opp-2",
    title: "Meta Llama Hackathon 2026",
    organization: "Meta AI",
    category: "hackathon",
    location: "Hybrid",
    stipend: "₹50,000 Prize",
    duration: "48 Hours",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 5 days
    skills: ["LLMs", "Python", "LlamaIndex"],
    views: 320,
    saves: 140,
    applications: 80,
    featured: true,
    addedTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
  },
  {
    id: "opp-3",
    title: "AWS GenAI Fellowship",
    organization: "Amazon Web Services",
    category: "research",
    location: "Remote",
    stipend: "₹80,000/mo",
    duration: "6 Months",
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 15 days
    skills: ["AWS", "LangChain", "PyTorch"],
    views: 290,
    saves: 95,
    applications: 55,
    featured: false,
    addedTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h ago
  },
  {
    id: "opp-4",
    title: "SRM Chapter Dev Recruitment",
    organization: "SRM Coding Club",
    category: "event",
    location: "On-Campus",
    stipend: "Unpaid",
    duration: "Semester",
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1 day
    skills: ["TypeScript", "Next.js", "TailwindCSS"],
    views: 180,
    saves: 55,
    applications: 40,
    featured: false,
    addedTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8h ago
  },
  {
    id: "opp-5",
    title: "Microsoft Engage Scholarship",
    organization: "Microsoft India",
    category: "scholarship",
    location: "Remote",
    stipend: "₹50,000 Grant",
    duration: "1 Year",
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 25 days
    skills: ["OOP", "Data Structures", "Java"],
    views: 520,
    saves: 210,
    applications: 140,
    featured: true,
    addedTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1d ago
  },
  {
    id: "opp-6",
    title: "Nvidia CUDA Internship",
    organization: "Nvidia Corp",
    category: "internship",
    location: "Hybrid",
    stipend: "₹1,50,000/mo",
    duration: "16 Weeks",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days
    skills: ["CUDA", "C++", "GPU Architecture"],
    views: 380,
    saves: 110,
    applications: 70,
    featured: false,
    addedTime: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5d ago
  }
];

const GENERAL_INSIGHTS = [
  { text: "AI/ML opportunities increased by 35% in campus recruitment index this month.", type: "up" },
  { text: "Hackathons are trending heavily among year 3 student profiles.", type: "trending" },
  { text: "Research fellowships are receiving 25% higher saves compared to last semester.", type: "info" }
];

export default function OpportunityIntelligenceClient() {
  const [opps, setOpps] = useState<OpportunityItem[]>(INITIAL_OPPORTUNITIES);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedSkills, setSelectedSkills] = useState<string>("all");
  
  // Watchlist states
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchInput, setWatchInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [newTickEffect, setNewTickEffect] = useState<string | null>(null);

  // Sync watchlist to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("soip_opportunity_watchlist");
      if (saved) {
        setWatchlist(JSON.parse(saved));
      } else {
        const defaultWatch = ["Google India", "Meta AI", "internship"];
        setWatchlist(defaultWatch);
        localStorage.setItem("soip_opportunity_watchlist", JSON.stringify(defaultWatch));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAddWatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!watchInput.trim()) return;
    const clean = watchInput.trim();
    if (!watchlist.includes(clean)) {
      const updated = [...watchlist, clean];
      setWatchlist(updated);
      localStorage.setItem("soip_opportunity_watchlist", JSON.stringify(updated));
    }
    setWatchInput("");
  };

  const handleRemoveWatch = (item: string) => {
    const updated = watchlist.filter(w => w !== item);
    setWatchlist(updated);
    localStorage.setItem("soip_opportunity_watchlist", JSON.stringify(updated));
  };

  // Simulate real-time opportunity stream ticks
  useEffect(() => {
    const interval = setInterval(() => {
      // Create new randomized opportunity
      const orgs = ["Netflix", "Salesforce", "Atlassian", "Uber", "Adobe", "Apple"];
      const titles = [
        "SDE Intern 2026", 
        "Machine Learning Hackathon", 
        "Systems Design Challenge",
        "Cloud Developer fellowship",
        "Fullstack Hackathon event"
      ];
      const categories: Array<OpportunityItem["category"]> = ["internship", "hackathon", "research", "event"];
      const locations: Array<OpportunityItem["location"]> = ["Remote", "Hybrid", "On-Campus"];
      const skillsOptions = [["React", "Node.js"], ["Python", "Scikit-Learn"], ["Go", "Distributed Systems"], ["C++", "CUDA"]];

      const rIndex = Math.floor(Math.random() * titles.length);
      const chosenOrg = orgs[Math.floor(Math.random() * orgs.length)];
      const chosenCat = categories[Math.floor(Math.random() * categories.length)];
      const chosenLoc = locations[Math.floor(Math.random() * locations.length)];
      const chosenSkills = skillsOptions[Math.floor(Math.random() * skillsOptions.length)];

      const newOpp: OpportunityItem = {
        id: `opp-dynamic-${Date.now()}`,
        title: `${chosenOrg} ${titles[rIndex]}`,
        organization: chosenOrg,
        category: chosenCat,
        location: chosenLoc,
        stipend: chosenCat === "internship" ? "₹95,000/mo" : "₹40,000 prize",
        duration: chosenCat === "internship" ? "10 Weeks" : "36 Hours",
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        skills: chosenSkills,
        views: 12,
        saves: 2,
        applications: 1,
        addedTime: new Date(),
      };

      setOpps(prev => [newOpp, ...prev.slice(0, 10)]);
      setNewTickEffect(newOpp.id);
      setTimeout(() => setNewTickEffect(null), 3000);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Filter calculations
  const filteredOpps = useMemo(() => {
    return opps.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.organization.toLowerCase().includes(search.toLowerCase()) ||
        item.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

      const matchCat = selectedCategory === "all" || item.category === selectedCategory;
      const matchLoc = selectedLocation === "all" || item.location === selectedLocation;
      const matchSkill =
        selectedSkills === "all" ||
        item.skills.some((s) => s.toLowerCase() === selectedSkills.toLowerCase());

      return matchSearch && matchCat && matchLoc && matchSkill;
    });
  }, [opps, search, selectedCategory, selectedLocation, selectedSkills]);

  // Heatmap segmentations
  const deadlineHeatmap = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrowStr = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const endOfWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const heatmap = {
      today: [] as OpportunityItem[],
      tomorrow: [] as OpportunityItem[],
      thisWeek: [] as OpportunityItem[],
      later: [] as OpportunityItem[]
    };

    opps.forEach(o => {
      if (o.deadline === todayStr) {
        heatmap.today.push(o);
      } else if (o.deadline === tomorrowStr) {
        heatmap.tomorrow.push(o);
      } else {
        const dDate = new Date(o.deadline);
        if (dDate <= endOfWeek) {
          heatmap.thisWeek.push(o);
        } else {
          heatmap.later.push(o);
        }
      }
    });

    return heatmap;
  }, [opps]);

  // Dashboard Stats overview
  const totalStats = useMemo(() => {
    const countToday = opps.filter(o => o.addedTime.getTime() > Date.now() - 24 * 60 * 60 * 1000).length;
    const closingSoonCount = opps.filter(o => {
      const dDate = new Date(o.deadline);
      return dDate.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
    }).length;

    const totalViews = opps.reduce((sum, o) => sum + o.views, 0);
    const avgApplications = Math.round(opps.reduce((sum, o) => sum + o.applications, 0) / opps.length);

    return {
      postedToday: countToday,
      closingSoon: closingSoonCount,
      totalViews,
      avgApplications
    };
  }, [opps]);

  return (
    <div className="space-y-8 font-mono text-zinc-300">
      
      {/* ── BLOOMBERG TERMINAL STATUS STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "TELEMETRY TODAY", value: `${totalStats.postedToday} New`, desc: "Live ticks parsed", icon: Zap, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
          { label: "URGENT DEADLINES", value: `${totalStats.closingSoon} Closing`, desc: "Applications closing < 72h", icon: Clock, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
          { label: "INDEX ENGAGEMENT", value: totalStats.totalViews, desc: "Cumulative student views", icon: Eye, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
          { label: "APPLICATION DEPTH", value: `${totalStats.avgApplications} Avg`, desc: "Submissions per post", icon: Activity, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`p-4 rounded-2xl border ${card.color} space-y-2`}>
              <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400">
                <span>{card.label}</span>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-black">{card.value}</div>
              <div className="text-[9px] text-zinc-550">{card.desc}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Filter Panel & Opportunity Watchlists */}
        <div className="space-y-6">
          
          {/* Advanced Filter Panel */}
          <div className="p-5 rounded-3xl bg-zinc-900/40 border border-zinc-850 space-y-4 shadow-xl">
            <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-3">
              <Filter className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs uppercase font-bold text-zinc-200">Advanced Filter Panel</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Search Keywords</span>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search roles, skills, orgs..."
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 pl-8 pr-3 text-zinc-300 focus:outline-none focus:border-purple-500"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Category Selector</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {["all", "internship", "hackathon", "research", "event"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`py-1.5 rounded-lg border text-center font-bold capitalize transition-colors cursor-pointer text-[10px] ${
                        selectedCategory === cat
                          ? "bg-purple-950/20 border-purple-500/30 text-purple-300"
                          : "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Location Domain</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-zinc-300 focus:outline-none"
                >
                  <option value="all">All Locations</option>
                  <option value="Remote">Remote Only</option>
                  <option value="Hybrid">Hybrid Models</option>
                  <option value="On-Campus">On-Campus Events</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Target Skills</span>
                <select
                  value={selectedSkills}
                  onChange={(e) => setSelectedSkills(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-zinc-300 focus:outline-none"
                >
                  <option value="all">All Core Skills</option>
                  <option value="Python">Python Scopes</option>
                  <option value="TypeScript">TypeScript Scopes</option>
                  <option value="C++">C++ Scopes</option>
                  <option value="LLMs">LLM / AI Tools</option>
                </select>
              </div>
            </div>
          </div>

          {/* Opportunity Watchlist */}
          <div className="p-5 rounded-3xl bg-zinc-900/40 border border-zinc-850 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs uppercase font-bold text-zinc-200">Opportunity Watchlist</h3>
              </div>
              <span className="text-[9px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded font-bold">
                {watchlist.length} Watched
              </span>
            </div>

            {/* Watchlist add form */}
            <form onSubmit={handleAddWatch} className="flex gap-2">
              <input
                type="text"
                value={watchInput}
                onChange={(e) => setWatchInput(e.target.value)}
                placeholder="Watch tag, company, or category..."
                className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {watchlist.map((item) => (
                <div
                  key={item}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-850 text-[10px] text-zinc-350 hover:border-zinc-700 transition-colors"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => handleRemoveWatch(item)}
                    className="text-zinc-550 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {watchlist.length === 0 && (
                <span className="text-[10px] text-zinc-500 font-light font-mono">No watch keywords registered yet.</span>
              )}
            </div>
          </div>
        </div>

        {/* Center 2 Columns: Live Opportunity Stream & Trend analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Real-Time Live Feed Stream */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
                  Live Opportunity Stream
                </h3>
                <p className="text-[9px] text-zinc-500 font-light">Simulation updates live ticks every 15 seconds</p>
              </div>

              <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>TELEMETRY SYNCED</span>
              </div>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              <AnimatePresence initial={false}>
                {filteredOpps.map((oppItem) => {
                  const isNewTick = newTickEffect === oppItem.id;
                  return (
                    <motion.div
                      key={oppItem.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isNewTick
                          ? "bg-purple-955/20 border-purple-500/40 shadow-lg shadow-purple-950/20"
                          : "bg-zinc-950 border-zinc-900 hover:border-zinc-850"
                      } flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-zinc-200 hover:text-purple-400 transition-colors truncate">
                            {oppItem.title}
                          </h4>
                          {oppItem.featured && (
                            <span className="px-1.5 py-0.1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded text-[8px] font-bold uppercase">
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-zinc-400" /> {oppItem.organization}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{oppItem.category}</span>
                          <span>•</span>
                          <span>{oppItem.location}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {oppItem.skills.map(s => (
                            <span key={s} className="px-1.5 py-0.2 bg-zinc-900 border border-zinc-850 rounded text-[9px] text-zinc-400">{s}</span>
                          ))}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center text-right shrink-0 gap-1.5 border-t sm:border-t-0 border-zinc-900 pt-2 sm:pt-0 font-mono">
                        <div className="space-y-0.5 text-left sm:text-right">
                          <span className="block text-zinc-300 font-bold">{oppItem.stipend}</span>
                          <span className="block text-[9px] text-zinc-550">Expires: {oppItem.deadline}</span>
                        </div>
                        <Link
                          href={`/opportunities/${oppItem.id}`}
                          className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] text-zinc-300 hover:text-white transition-all font-bold"
                        >
                          Details
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredOpps.length === 0 && (
                <div className="py-12 text-center text-zinc-500 space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto animate-pulse" />
                  <p className="text-xs font-mono">No opportunities found matching your filters.</p>
                </div>
              )}
            </div>
          </div>

          {/* Trend Analytics & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SVG Trend Graph details */}
            <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                <h3 className="text-xs uppercase font-bold text-zinc-200">Category Volumes</h3>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>

              {/* Custom SVG Bar Graph */}
              <div className="h-36 w-full relative pt-4">
                <svg className="w-full h-full">
                  {/* Grid lines */}
                  <line x1="20" y1="20" x2="280" y2="20" stroke="#27272a" strokeDasharray="3 3" />
                  <line x1="20" y1="60" x2="280" y2="60" stroke="#27272a" strokeDasharray="3 3" />
                  <line x1="20" y1="100" x2="280" y2="100" stroke="#27272a" strokeDasharray="3 3" />

                  {/* SVG Bars representing categories */}
                  {[
                    { label: "Intern", val: 85, color: "#a855f7" },
                    { label: "Hack", val: 65, color: "#818cf8" },
                    { label: "Rsch", val: 40, color: "#fbbf24" },
                    { label: "Event", val: 55, color: "#34d399" }
                  ].map((bar, idx) => {
                    const barWidth = 35;
                    const spacing = 65;
                    const x = 35 + idx * spacing;
                    const barHeight = bar.val;
                    const y = 110 - barHeight;

                    return (
                      <g key={bar.label}>
                        {/* Interactive Bar */}
                        <motion.rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          fill={bar.color}
                          rx={4}
                          initial={{ height: 0, y: 110 }}
                          animate={{ height: barHeight, y }}
                          transition={{ duration: 0.6, delay: idx * 0.1 }}
                        />
                        {/* Values */}
                        <text x={x + barWidth / 2} y={y - 5} fill="#a1a1aa" fontSize={8} textAnchor="middle">
                          {bar.val}%
                        </text>
                        {/* X-Label */}
                        <text x={x + barWidth / 2} y={125} fill="#71717a" fontSize={8} textAnchor="middle">
                          {bar.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Smart Insights & Urgencies */}
            <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
              <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs uppercase font-bold text-zinc-200">Opportunity Insights</h3>
              </div>

              <div className="space-y-3.5">
                {GENERAL_INSIGHTS.map((insight, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-[10px] leading-relaxed flex items-start gap-2.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                    <span>{insight.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deadline Heatmap */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-5 shadow-xl">
            <div>
              <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-400" />
                Impending Deadline Heatmap
              </h3>
              <p className="text-[9px] text-zinc-550">Real-time scheduling heatmap segmenting expiring forms</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              {[
                { label: "Today", count: deadlineHeatmap.today.length, items: deadlineHeatmap.today, color: "border-rose-500/25 bg-rose-500/5 text-rose-300" },
                { label: "Tomorrow", count: deadlineHeatmap.tomorrow.length, items: deadlineHeatmap.tomorrow, color: "border-orange-500/20 bg-orange-500/5 text-orange-350" },
                { label: "This Week", count: deadlineHeatmap.thisWeek.length, items: deadlineHeatmap.thisWeek, color: "border-amber-500/20 bg-amber-500/5 text-amber-300" },
                { label: "Later", count: deadlineHeatmap.later.length, items: deadlineHeatmap.later, color: "border-zinc-800 bg-zinc-950 text-zinc-400" }
              ].map((slot, i) => (
                <div key={i} className={`p-3.5 rounded-2xl border ${slot.color} space-y-2 flex flex-col justify-between`}>
                  <div className="flex items-center justify-between font-bold text-[9px] uppercase">
                    <span>{slot.label}</span>
                    <span>{slot.count} Exp</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {slot.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="text-[9px] truncate font-light text-zinc-300">
                        {item.organization}
                      </div>
                    ))}
                    {slot.count > 2 && (
                      <span className="text-[8px] text-zinc-550 block font-light">+ {slot.count - 2} more</span>
                    )}
                    {slot.count === 0 && (
                      <span className="text-[8px] text-zinc-600 font-light block">No expirations</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
