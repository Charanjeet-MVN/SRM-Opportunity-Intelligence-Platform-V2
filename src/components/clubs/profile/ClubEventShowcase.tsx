"use client";

import React, { useState, useMemo } from "react";
import { Opportunity } from "@/types";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import {
  Layers,
  Calendar,
  Compass,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

interface ClubEventShowcaseProps {
  opportunities: Opportunity[];
  clubName: string;
}

export default function ClubEventShowcase({
  opportunities,
  clubName,
}: ClubEventShowcaseProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<string>("all");

  // Tab definitions with dynamic counts
  const tabs = useMemo(() => {
    const now = new Date();
    const activeCount = opportunities.filter((opp) => {
      if (!opp.applicationDeadline) return true;
      return new Date(opp.applicationDeadline) >= now;
    }).length;

    const hackathonCount = opportunities.filter(
      (opp) => opp.type === "hackathon" || opp.type === "competition"
    ).length;

    const workshopCount = opportunities.filter(
      (opp) => opp.type === "workshop" || opp.type === "bootcamp" || opp.type === "conference"
    ).length;

    const recruitmentCount = opportunities.filter(
      (opp) => opp.type === "club_recruitment" || opp.type === "placement_drive" || opp.type === "internship"
    ).length;

    const list = [
      { id: "all", label: "All Postings", count: opportunities.length },
      { id: "active", label: "Active & Upcoming", count: activeCount },
      { id: "hackathon", label: "Hackathons", count: hackathonCount },
      { id: "workshop", label: "Workshops", count: workshopCount },
      { id: "recruitment", label: "Recruitments", count: recruitmentCount },
    ];

    return list.filter((t) => t.id === "all" || t.count > 0);
  }, [opportunities]);

  // Filter opportunities based on active tab
  const filtered = useMemo(() => {
    const now = new Date();
    return opportunities.filter((opp) => {
      if (activeTab === "all") return true;

      if (activeTab === "active") {
        if (!opp.applicationDeadline) return true;
        return new Date(opp.applicationDeadline) >= now;
      }

      if (activeTab === "hackathon") return opp.type === "hackathon" || opp.type === "competition";
      if (activeTab === "workshop") return opp.type === "workshop" || opp.type === "bootcamp" || opp.type === "conference";
      if (activeTab === "recruitment") return opp.type === "club_recruitment" || opp.type === "placement_drive" || opp.type === "internship";

      return true;
    });
  }, [opportunities, activeTab]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.01 : 0.3, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-zinc-800/70 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-purple-400 tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Opportunity & Event Showcase</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            Published Campus Opportunities ({opportunities.length})
          </h2>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/25 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? "bg-purple-700 text-purple-100" : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Empty State */}
      {opportunities.length === 0 ? (
        <div className="py-16 px-6 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 text-center space-y-3 max-w-md mx-auto backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
            <Calendar className="w-6 h-6 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-200 font-mono">No upcoming opportunities</h3>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              {clubName} hasn&apos;t published any active opportunities yet. Check back soon or explore platform listings.
            </p>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-medium transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Browse Other Opportunities</span>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 px-6 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 text-center space-y-3 max-w-md mx-auto backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
            <Calendar className="w-6 h-6 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-200 font-mono">No opportunities in this category</h3>
            <p className="text-xs text-zinc-400 font-mono">
              {clubName} has no listings under this filter right now.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("all")}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            Show All Listings
          </button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((opp) => (
            <motion.div key={opp.id} variants={itemVariants} className="h-full">
              <OpportunityCard opportunity={opp} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
