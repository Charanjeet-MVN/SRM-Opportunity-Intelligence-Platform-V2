"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Opportunity } from "@/types";
import { TrackerOpportunity } from "@/components/opportunities/StudentOpportunityTracker";
import {
  Activity,
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface CommandCenterFeedProps {
  opportunities: (Opportunity & { relevance?: unknown })[];
  savedOpportunities: TrackerOpportunity[];
  registeredOpportunities: TrackerOpportunity[];
}

export default function CommandCenterFeed({
  opportunities,
  savedOpportunities,
  registeredOpportunities,
}: CommandCenterFeedProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "opportunities" | "deadlines" | "registered">("all");

  // Construct structured feed items from real opportunities & tracked data
  const feedItems = [
    // 1. Registered entries
    ...registeredOpportunities.map((reg) => ({
      id: `reg-${reg.id}`,
      type: "registered" as const,
      title: `Registered: ${reg.title}`,
      subtitle: `Official entry logged for ${reg.club?.name || "SRM Org"}`,
      timeStr: reg.registeredAt
        ? new Date(reg.registeredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Recent",
      tag: "Confirmed Entry",
      tagColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
      icon: CheckCircle2,
      slug: reg.slug,
      date: reg.registeredAt ? new Date(reg.registeredAt) : new Date(),
    })),

    // 2. Deadlines on saved items
    ...savedOpportunities
      .filter((s) => s.applicationDeadline && new Date(s.applicationDeadline) > new Date())
      .map((saved) => ({
        id: `deadline-${saved.id}`,
        type: "deadlines" as const,
        title: `Deadline Closing: ${saved.title}`,
        subtitle: `Application window closing on ${new Date(saved.applicationDeadline!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        timeStr: "Approaching",
        tag: "Action Required",
        tagColor: "bg-amber-500/10 text-amber-300 border-amber-500/25",
        icon: Clock,
        slug: saved.slug,
        date: new Date(saved.applicationDeadline!),
      })),

    // 3. Newly published opportunities
    ...opportunities.slice(0, 6).map((opp) => ({
      id: `opp-${opp.id}`,
      type: "opportunities" as const,
      title: `New Opportunity: ${opp.title}`,
      subtitle: `Published by ${opp.club?.name || "SRM Organization"} • ${opp.type.replace("_", " ")}`,
      timeStr: opp.createdAt
        ? new Date(opp.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Just Published",
      tag: "Verified Post",
      tagColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/25",
      icon: Sparkles,
      slug: opp.slug,
      date: opp.createdAt ? new Date(opp.createdAt) : new Date(),
    })),
  ];

  // Filter feed items
  const filteredItems = feedItems
    .filter((item) => (activeFilter === "all" ? true : item.type === activeFilter))
    .slice(0, 7);

  return (
    <div className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-zinc-800/70">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Campus Intelligence Stream</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
            Real-Time Activity Feed
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 flex-wrap">
          {[
            { id: "all", label: "All Activity" },
            { id: "opportunities", label: "Opportunities" },
            { id: "deadlines", label: "Deadlines" },
            { id: "registered", label: "Registrations" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as never)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Rows */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <p className="text-xs font-mono text-zinc-400">No activity items in this filter category.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: idx * 0.04, duration: 0.25 }}
                >
                  <Link
                    href={`/opportunities/${item.slug}`}
                    className="group p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-center justify-between gap-4 block"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-300 group-hover:border-indigo-500/30 transition-colors shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors truncate">
                            {item.title}
                          </h4>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase font-semibold shrink-0 ${item.tagColor}`}
                          >
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-zinc-400 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                        {item.timeStr}
                      </span>
                      <div className="w-7 h-7 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
