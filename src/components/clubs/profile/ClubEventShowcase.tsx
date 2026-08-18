"use client";

import React, { useState } from "react";
import { Opportunity } from "@/types";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import {
  Layers,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ClubEventShowcaseProps {
  opportunities: Opportunity[];
  clubName: string;
}

export default function ClubEventShowcase({
  opportunities,
  clubName,
}: ClubEventShowcaseProps) {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "hackathon" | "workshop" | "other">("all");

  const now = new Date();

  // Filter opportunities based on active tab
  const filtered = opportunities.filter((opp) => {
    if (activeTab === "all") return true;

    if (activeTab === "active") {
      if (!opp.applicationDeadline) return true;
      return new Date(opp.applicationDeadline) >= now;
    }

    if (activeTab === "hackathon") return opp.type === "hackathon" || opp.type === "competition";
    if (activeTab === "workshop") return opp.type === "workshop" || opp.type === "bootcamp" || opp.type === "conference";

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-zinc-800/70 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-purple-400 tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Event & Opportunity Showcase</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            Published Campus Opportunities ({opportunities.length})
          </h2>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 flex-wrap">
          {[
            { id: "all", label: "All Postings" },
            { id: "active", label: "Active & Upcoming" },
            { id: "hackathon", label: "Hackathons" },
            { id: "workshop", label: "Workshops" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as never)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="py-16 px-6 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 text-center space-y-3 max-w-md mx-auto backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
            <Calendar className="w-6 h-6 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-200">No opportunities in this category</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((opp) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <OpportunityCard opportunity={opp} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
