"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Briefcase,
  FlaskConical,
  Award,
  Target,
  Rocket,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import SpatialCard3D from "./SpatialCard3D";

interface UniverseNode {
  id: string;
  name: string;
  categorySlug: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  borderClass: string;
  bgGradient: string;
  activeCount: number;
  totalVolume: string;
  headline: string;
  description: string;
  topOrganizer: string;
  sampleTitles: string[];
}

const UNIVERSE_NODES: UniverseNode[] = [
  {
    id: "hackathons",
    name: "Hackathons & Build Challenges",
    categorySlug: "hackathon",
    icon: Trophy,
    color: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.3)",
    borderClass: "border-purple-500/40",
    bgGradient: "from-purple-950/60 via-zinc-950 to-zinc-950",
    activeCount: 14,
    totalVolume: "₹18,50,000+ Prize Pools",
    headline: "Fast-paced, team-based software & hardware build challenges",
    description:
      "Join national-level campus hackathons, build innovative prototypes with peer engineers, and pitch to leading tech VCs and judges.",
    topOrganizer: "SRM Student Directorate & IEEE SRM",
    sampleTitles: [
      "SRM National GenAI Hackathon",
      "Smart Campus IoT Buildathon",
      "Web3 Distributed Systems Summit",
    ],
  },
  {
    id: "internships",
    name: "Technical Internships & Drives",
    categorySlug: "internship",
    icon: Briefcase,
    color: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.3)",
    borderClass: "border-emerald-500/40",
    bgGradient: "from-emerald-950/60 via-zinc-950 to-zinc-950",
    activeCount: 28,
    totalVolume: "Stipends up to ₹1,20,000/mo",
    headline: "Verified summer internships & placement pre-placement offers",
    description:
      "Direct applications with verified hiring partners. Apply with your verified SRM skill vector and bypass external cold-email filters.",
    topOrganizer: "SRM Career Centre & Industry Relations",
    sampleTitles: [
      "NVIDIA AI Research Summer Intern",
      "Amazon Web Services Cloud Engineer Intern",
      "Stripe Infrastructure Developer Intern",
    ],
  },
  {
    id: "research",
    name: "Research Grants & Lab Projects",
    categorySlug: "research",
    icon: FlaskConical,
    color: "#6366f1",
    glowColor: "rgba(99, 102, 241, 0.3)",
    borderClass: "border-indigo-500/40",
    bgGradient: "from-indigo-950/60 via-zinc-950 to-zinc-950",
    activeCount: 19,
    totalVolume: "₹45,00,000+ Research Grants",
    headline: "Faculty-led peer-review research & campus lab fellowships",
    description:
      "Collaborate on funded research projects across Machine Learning, Nanotechnology, Biotech, and Robotics with international conference travel grants.",
    topOrganizer: "Dean of Research & Innovation Labs",
    sampleTitles: [
      "Autonomous Multi-Agent Robotics Grant",
      "Quantum Information Simulation Fellowship",
      "Bio-Inspired Neural Architectures Lab",
    ],
  },
  {
    id: "competitions",
    name: "Skill Competitions & Coding Contests",
    categorySlug: "competition",
    icon: Target,
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.3)",
    borderClass: "border-amber-500/40",
    bgGradient: "from-amber-950/60 via-zinc-950 to-zinc-950",
    activeCount: 12,
    totalVolume: "Top 50 Rank Recognitions",
    headline: "Competitive programming, CTFs, and algorithmic grand prix",
    description:
      "Compete in live campus leaderboards, earn official SRM merit badges, and qualify for national collegiate finals.",
    topOrganizer: "SRM Coding Club & DSC",
    sampleTitles: [
      "SRM Grand Algorithmic Cup 2026",
      "Cybersecurity Capture The Flag (CTF)",
      "Campus Product Design Sprint",
    ],
  },
  {
    id: "workshops",
    name: "Hands-on Workshops & Bootcamps",
    categorySlug: "workshop",
    icon: Rocket,
    color: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.3)",
    borderClass: "border-sky-500/40",
    bgGradient: "from-sky-950/60 via-zinc-950 to-zinc-950",
    activeCount: 22,
    totalVolume: "Certified Tech Masterclasses",
    headline: "Intensive 2-day technical accelerators with industry leaders",
    description:
      "Hands-on labs in Next.js 15, CUDA Kernel Optimization, LLM Fine-Tuning, Docker & Kubernetes, and Cloud Architecture.",
    topOrganizer: "SRM Technical Clubs & Google DSC",
    sampleTitles: [
      "Zero-to-One CUDA Kernel Masterclass",
      "Production Full-Stack Next.js Bootcamp",
      "Cloud Security & Zero-Trust Workshop",
    ],
  },
  {
    id: "scholarships",
    name: "Scholarships & Financial Fellowships",
    categorySlug: "scholarship",
    icon: Award,
    color: "#ec4899",
    glowColor: "rgba(236, 72, 153, 0.3)",
    borderClass: "border-pink-500/40",
    bgGradient: "from-pink-950/60 via-zinc-950 to-zinc-950",
    activeCount: 8,
    totalVolume: "100% Tuition & Travel Grants",
    headline: "Merit and need-based institutional funding & endowments",
    description:
      "Financial assistance programs, global conference travel allowances, and alumni-sponsored technology equipment grants.",
    topOrganizer: "SRM Alumni Network & Dean of Academics",
    sampleTitles: [
      "SRM Global Innovation Merit Scholarship",
      "Women in Engineering Travel Endowment",
      "Undergraduate Innovation Fellowship",
    ],
  },
];

export default function OpportunityUniverse3D() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("hackathons");

  const selectedNode =
    UNIVERSE_NODES.find((n) => n.id === selectedNodeId) || UNIVERSE_NODES[0];

  return (
    <section className="space-y-8 font-mono text-zinc-300">
      {/* Section Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Interactive 3D Constellation</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-zinc-100 tracking-tight font-sans">
          The SRM Opportunity Universe
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-light font-sans leading-relaxed">
          Explore campus opportunities categorized as connected nodes in our spatial ecosystem. Select a domain to inspect live stats and active listings.
        </p>
      </div>

      {/* 3D Universe Grid & Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 3D Celestial Node Grid (7 Columns) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {UNIVERSE_NODES.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const Icon = node.icon;

            return (
              <SpatialCard3D
                key={node.id}
                depth={6}
                elevationZ={16}
                glowColor={node.glowColor}
                className="h-full"
              >
                <div
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between gap-3 h-full relative overflow-hidden backdrop-blur-xl preserve-3d ${
                    isSelected
                      ? `bg-gradient-to-b ${node.bgGradient} ${node.borderClass} shadow-xl`
                      : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60"
                  }`}
                >
                  <div
                    style={{ transform: "translateZ(20px)" }}
                    className="flex items-center justify-between"
                  >
                    <div
                      className="p-2.5 rounded-2xl border flex items-center justify-center shadow-sm"
                      style={{
                        backgroundColor: `${node.color}15`,
                        borderColor: `${node.color}40`,
                        color: node.color,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-300">
                      {node.activeCount} Active
                    </span>
                  </div>

                  <div style={{ transform: "translateZ(14px)" }} className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-100">{node.name}</h3>
                    <p className="text-[11px] text-zinc-400 font-sans font-light line-clamp-2 leading-relaxed">
                      {node.headline}
                    </p>
                  </div>

                  <div
                    style={{ transform: "translateZ(18px)" }}
                    className="pt-2 border-t border-zinc-850 flex items-center justify-between text-[10px] text-zinc-500"
                  >
                    <span className="text-emerald-400 font-bold">{node.totalVolume}</span>
                    <span className="text-indigo-400 font-bold flex items-center gap-1">
                      {isSelected ? "Inspecting" : "Select Node"}
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </SpatialCard3D>
            );
          })}
        </div>

        {/* Right: Focused Node 3D Inspector View (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              <SpatialCard3D
                depth={8}
                elevationZ={22}
                glowColor={selectedNode.glowColor}
                className="h-full"
              >
                <div
                  className={`p-6 sm:p-7 rounded-3xl bg-gradient-to-b ${selectedNode.bgGradient} border ${selectedNode.borderClass} shadow-2xl backdrop-blur-2xl flex flex-col justify-between gap-5 h-full preserve-3d`}
                >
                  {/* Top Meta Line */}
                  <div
                    style={{ transform: "translateZ(26px)" }}
                    className="flex items-center justify-between border-b border-zinc-850 pb-4"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="p-3 rounded-2xl border"
                        style={{
                          backgroundColor: `${selectedNode.color}20`,
                          borderColor: `${selectedNode.color}40`,
                          color: selectedNode.color,
                        }}
                      >
                        <selectedNode.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400">
                          Selected Dimension Node
                        </span>
                        <h3 className="text-base font-bold text-zinc-100">{selectedNode.name}</h3>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {selectedNode.activeCount} Verified
                    </span>
                  </div>

                  {/* Description & Metrics */}
                  <div style={{ transform: "translateZ(18px)" }} className="space-y-3 text-xs">
                    <p className="text-zinc-300 font-sans font-light leading-relaxed">
                      {selectedNode.description}
                    </p>

                    <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-850 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                        Direct SRM Authority:
                      </span>
                      <div className="flex items-center gap-2 text-zinc-200 font-bold">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <span>{selectedNode.topOrganizer}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Active Opportunities in this Domain */}
                  <div style={{ transform: "translateZ(20px)" }} className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                      Featured Active Listings:
                    </span>
                    <div className="space-y-1.5">
                      {selectedNode.sampleTitles.map((title, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-850 text-xs text-zinc-300"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="line-clamp-1">{title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div style={{ transform: "translateZ(28px)" }} className="pt-2">
                    <Link
                      href={`/opportunities?type=${selectedNode.categorySlug}`}
                      className="w-full py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Explore All {selectedNode.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </SpatialCard3D>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
