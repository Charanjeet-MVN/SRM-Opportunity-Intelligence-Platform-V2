"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Opportunity, NotificationPriority, NotificationCategory } from "@/types";
import { TrackerOpportunity } from "@/components/opportunities/StudentOpportunityTracker";
import {
  Activity,
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface CommandCenterFeedProps {
  opportunities: (Opportunity & { relevance?: unknown })[];
  savedOpportunities: TrackerOpportunity[];
  registeredOpportunities: TrackerOpportunity[];
}

type StreamFilter = "all" | "registrations" | "deadlines" | "opportunities" | "clubs";

export default function CommandCenterFeed({
  opportunities,
  savedOpportunities,
  registeredOpportunities,
}: CommandCenterFeedProps) {
  const [activeFilter, setActiveFilter] = useState<StreamFilter>("all");

  // Construct rich timeline storytelling items
  const feedItems = useMemo(() => {
    const list: Array<{
      id: string;
      type: StreamFilter;
      category: NotificationCategory;
      priority: NotificationPriority;
      title: string;
      storyNarrative: string;
      orgName: string;
      timeStr: string;
      badgeText: string;
      badgeStyle: string;
      icon: React.ElementType;
      iconColor: string;
      slug: string;
      actionText: string;
      date: Date;
      metadata?: {
        deadline?: string;
        eventDate?: string;
        attendeeCount?: number;
      };
    }> = [];

    // 1. Registered entries (Event confirmations)
    registeredOpportunities.forEach((reg) => {
      const regDate = reg.registeredAt ? new Date(reg.registeredAt) : new Date();
      list.push({
        id: `reg-${reg.id}`,
        type: "registrations",
        category: "registration",
        priority: "normal",
        title: reg.title,
        storyNarrative: `Confirmed attendee spot for ${reg.club?.name || "SRM Organization"} official campus event.`,
        orgName: reg.club?.name || "SRM Campus",
        timeStr: reg.registeredAt
          ? regDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "Recently Confirmed",
        badgeText: "Confirmed Entry",
        badgeStyle: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
        icon: CheckCircle2,
        iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        slug: reg.slug,
        actionText: "View Event Pass",
        date: regDate,
      });
    });

    // 2. Deadlines on saved items (Deadline Radar alerts)
    savedOpportunities
      .filter((s) => s.applicationDeadline && new Date(s.applicationDeadline) > new Date())
      .forEach((saved) => {
        const deadlineDate = new Date(saved.applicationDeadline!);
        const now = new Date();
        const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isCritical = diffDays <= 1;

        list.push({
          id: `deadline-${saved.id}`,
          type: "deadlines",
          category: "deadline",
          priority: isCritical ? "critical" : diffDays <= 3 ? "high" : "normal",
          title: `Application Closing: ${saved.title}`,
          storyNarrative: isCritical
            ? "Final countdown: applications close today. Complete your submission packet."
            : `Application closes in ${diffDays} days (${deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}).`,
          orgName: saved.club?.name || "SRM Organization",
          timeStr: isCritical ? "Due Today" : `${diffDays}d remaining`,
          badgeText: isCritical ? "Urgent Action" : "Approaching",
          badgeStyle: isCritical
            ? "bg-rose-500/15 text-rose-300 border-rose-500/35 animate-pulse"
            : "bg-amber-500/10 text-amber-300 border-amber-500/25",
          icon: Clock,
          iconColor: isCritical
            ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
            : "text-amber-400 bg-amber-500/10 border-amber-500/30",
          slug: saved.slug,
          actionText: "Complete Application",
          date: deadlineDate,
        });
      });

    // 3. Newly published opportunities & event announcements
    opportunities.forEach((opp) => {
      const oppDate = opp.createdAt ? new Date(opp.createdAt) : new Date();
      const isHackOrWorkshop =
        opp.type === "hackathon" ||
        opp.type === "workshop" ||
        opp.type === "competition" ||
        opp.type === "conference";

      list.push({
        id: `opp-${opp.id}`,
        type: isHackOrWorkshop ? "opportunities" : "opportunities",
        category: isHackOrWorkshop ? "event" : "opportunity",
        priority: "normal",
        title: opp.title,
        storyNarrative: `${opp.club?.name || "SRM Organization"} published a new ${opp.type.replace("_", " ")} opportunity with active candidate applications.`,
        orgName: opp.club?.name || "SRM Organization",
        timeStr: opp.createdAt
          ? oppDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "Recently Posted",
        badgeText: opp.type.replace("_", " ").toUpperCase(),
        badgeStyle: "bg-indigo-500/10 text-indigo-300 border-indigo-500/25",
        icon: isHackOrWorkshop ? Calendar : Sparkles,
        iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
        slug: opp.slug,
        actionText: "Explore & Apply",
        date: oppDate,
      });
    });

    // 4. Club Milestones & Dispatch updates
    list.push({
      id: "club-update-next-tech",
      type: "clubs",
      category: "club",
      priority: "high",
      title: "Charter Endorsement: Next Tech Lab",
      storyNarrative: "Official SRM Research Lab badge granted with full access to autonomous project tracks.",
      orgName: "Next Tech Lab",
      timeStr: "Milestone",
      badgeText: "Verified Charter",
      badgeStyle: "bg-purple-500/10 text-purple-300 border-purple-500/25",
      icon: ShieldCheck,
      iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
      slug: "next-tech-lab",
      actionText: "View Organization",
      date: new Date(),
    });

    // Sort newest / highest priority first
    return list.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [opportunities, savedOpportunities, registeredOpportunities]);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return feedItems.slice(0, 8);
    return feedItems.filter((i) => i.type === activeFilter).slice(0, 8);
  }, [feedItems, activeFilter]);

  return (
    <div className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 relative overflow-hidden">
      {/* Background Spatial Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header & Filter Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-5 border-b border-zinc-800/70 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Timeline Storytelling Stream</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
            SRM Activity & Notification Hub
          </h2>
          <p className="text-xs text-zinc-400 font-mono">
            Track confirmed registrations, upcoming application windows, and club announcements.
          </p>
        </div>

        {/* Linear-Style Segmented Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 flex-wrap">
          {[
            { id: "all", label: "All Activity" },
            { id: "deadlines", label: "Deadlines" },
            { id: "registrations", label: "Registrations" },
            { id: "opportunities", label: "Opportunities" },
            { id: "clubs", label: "Clubs" },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as StreamFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Storytelling Feed */}
      {filteredItems.length === 0 ? (
        <div className="py-14 text-center space-y-2 relative z-10">
          <p className="text-xs font-mono text-zinc-400">
            No activity items matching this filter stream.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-indigo-500/40 before:via-zinc-800 before:to-transparent">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: idx * 0.04, duration: 0.25 }}
                  className="relative group"
                >
                  {/* Timeline Glowing Node */}
                  <div className="absolute -left-6 sm:-left-8 top-4 -translate-x-1/2 w-6 h-6 rounded-full bg-zinc-950 border border-zinc-750 flex items-center justify-center shadow-lg group-hover:border-indigo-400 transition-colors z-10">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
                  </div>

                  {/* Card Container */}
                  <Link
                    href={
                      item.type === "clubs"
                        ? `/clubs`
                        : `/opportunities/${item.slug}`
                    }
                    className="block p-4 sm:p-5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/90 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-black/40 space-y-3"
                  >
                    {/* Top Row: Category Badge + Timestamp */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 ${item.iconColor}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold tracking-wider ${item.badgeStyle}`}
                        >
                          {item.badgeText}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                          • {item.orgName}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-zinc-500">
                        {item.timeStr}
                      </span>
                    </div>

                    {/* Content Title & Story Narrative */}
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-zinc-400 font-light leading-relaxed">
                        {item.storyNarrative}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2 border-t border-zinc-850/60 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-500 text-[10px] truncate max-w-[180px]">
                        Organization: {item.orgName}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-indigo-400 font-bold group-hover:text-indigo-300 transition-colors">
                        <span>{item.actionText}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Footer Link to Calendar and Feed */}
      <div className="pt-2 border-t border-zinc-850/60 flex items-center justify-between text-xs font-mono text-zinc-400 relative z-10">
        <Link
          href="/dashboard/student/calendar"
          className="hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <span>Open Deadline Calendar View</span>
        </Link>
        <Link
          href="/opportunities"
          className="text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1 transition-colors"
        >
          <span>Catalog Explorer</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
