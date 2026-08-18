"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Opportunity, StudentProfile } from "@/types";
import { TrackerOpportunity } from "@/components/opportunities/StudentOpportunityTracker";
import StudentOpportunityTracker from "@/components/opportunities/StudentOpportunityTracker";
import OpportunityCard from "@/components/opportunities/OpportunityCard";

// Redesigned Command Center Components
import StudentWelcomeHero from "./student/StudentWelcomeHero";
import OpportunitySnapshotGrid from "./student/OpportunitySnapshotGrid";
import UpcomingDeadlinesTimeline from "./student/UpcomingDeadlinesTimeline";
import RecommendedOpportunitiesDeck from "./student/RecommendedOpportunitiesDeck";
import CommandCenterFeed from "./student/CommandCenterFeed";
import CommandQuickActions from "./student/CommandQuickActions";

import {
  Compass,
  User,
  Bookmark,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Layers,
} from "lucide-react";

interface CommandCenterClientProps {
  studentProfile: StudentProfile | null;
  profileCompleteness: number;
  opportunities: (Opportunity & { relevance?: unknown })[];
  savedOpportunities: TrackerOpportunity[];
  registeredOpportunities: TrackerOpportunity[];
  aiRecommendations?: (Opportunity & { aiExplanation: string; relevanceScore: number })[];
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

function getUpcomingDeadlineCount(savedOpps: TrackerOpportunity[]): {
  critical: number;
  thisWeek: number;
} {
  const now = new Date();
  let critical = 0;
  let thisWeek = 0;

  savedOpps.forEach((opp) => {
    if (!opp.applicationDeadline) return;
    const deadline = new Date(opp.applicationDeadline);
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffMs > 0) {
      if (diffDays <= 3) critical++;
      if (diffDays <= 7) thisWeek++;
    }
  });

  return { critical, thisWeek };
}

export default function CommandCenterClient({
  studentProfile,
  profileCompleteness,
  opportunities,
  savedOpportunities,
  registeredOpportunities,
  aiRecommendations = [],
}: CommandCenterClientProps) {
  const [feedExpanded, setFeedExpanded] = useState(false);

  const { critical: criticalDeadlines, thisWeek: deadlinesThisWeek } =
    getUpcomingDeadlineCount(savedOpportunities);

  const displayedOpportunities = feedExpanded ? opportunities : opportunities.slice(0, 3);
  const firstName = studentProfile?.fullName?.split(" ")[0] || "Student";

  // Combine tracked items for the deadline radar
  const allTracked = [...savedOpportunities, ...registeredOpportunities];
  const uniqueTrackedMap = new Map<string, TrackerOpportunity>();
  allTracked.forEach((o) => uniqueTrackedMap.set(o.id, o));
  const trackedItems = Array.from(uniqueTrackedMap.values());

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* 1. Personalized Welcome Experience */}
      <motion.div variants={fadeUp}>
        <StudentWelcomeHero
          studentProfile={studentProfile}
          profileCompleteness={profileCompleteness}
          criticalDeadlines={criticalDeadlines}
          totalSaved={savedOpportunities.length}
        />
      </motion.div>

      {/* 2. Opportunity Snapshot Metric Cards */}
      <motion.div variants={fadeUp}>
        <OpportunitySnapshotGrid
          totalAvailable={opportunities.length}
          totalSaved={savedOpportunities.length}
          totalRegistered={registeredOpportunities.length}
          deadlinesThisWeek={deadlinesThisWeek}
        />
      </motion.div>

      {/* 3. Upcoming Deadlines & Attention Radar */}
      <motion.div variants={fadeUp}>
        <UpcomingDeadlinesTimeline trackedOpportunities={trackedItems} />
      </motion.div>

      {/* 4. AI-Recommended Opportunities Deck */}
      {aiRecommendations.length > 0 && (
        <motion.div variants={fadeUp}>
          <RecommendedOpportunitiesDeck recommendations={aiRecommendations} />
        </motion.div>
      )}

      {/* 5. Linear / Notion Inspired Activity Feed */}
      <motion.div variants={fadeUp}>
        <CommandCenterFeed
          opportunities={opportunities}
          savedOpportunities={savedOpportunities}
          registeredOpportunities={registeredOpportunities}
        />
      </motion.div>

      {/* 6. My Opportunity Tracker (Saved + Registered tabs) */}
      <motion.div variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
              Opportunity Tracker & Workspace
            </h2>
          </div>
          <Link
            href="/dashboard/student/saved"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono transition-colors"
          >
            <span>Full Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <StudentOpportunityTracker
          initialSaved={savedOpportunities}
          initialRegistered={registeredOpportunities}
          initialTab="saved"
        />
      </motion.div>

      {/* 7. Skill Radar & Vector Ecosystem */}
      {studentProfile && (studentProfile.skills || []).length > 0 && (
        <motion.div
          variants={fadeUp}
          className="rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.06),transparent_60%)] pointer-events-none" />

          <div className="flex items-center justify-between gap-2 mb-6 relative z-10 border-b border-zinc-800/70 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
                Student Skill Vectors & Compatibility Matrix
              </h2>
            </div>
            <span className="text-[10px] font-mono text-indigo-300 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              {(studentProfile.skills || []).length} Active Skill Vectors
            </span>
          </div>

          <div className="relative z-10 flex flex-col items-center py-4">
            {/* Center Node */}
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 border-2 border-indigo-500/40 flex flex-col items-center justify-center shadow-lg shadow-indigo-900/30 z-10">
                <User className="w-5 h-5 text-indigo-400 mb-0.5" />
                <span className="text-[9px] font-mono text-indigo-300 font-bold uppercase tracking-wider">
                  {firstName}
                </span>
              </div>
              {/* Animated Orbit Rings */}
              <div
                className="absolute w-32 h-32 rounded-full border border-indigo-500/15 animate-spin"
                style={{ animationDuration: "20s" }}
              />
              <div className="absolute w-52 h-52 rounded-full border border-indigo-500/10" />
            </div>

            {/* Skill Tags */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-xl mx-auto">
              {(studentProfile.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 shadow-sm"
                >
                  {skill}
                </span>
              ))}
            </div>

            {(studentProfile.interests || []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                {(studentProfile.interests || []).map((interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 8. Prioritized Discovery Feed */}
      <motion.div variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
              Prioritized Opportunity Feed
            </h2>
          </div>
          <Link
            href="/opportunities"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono transition-colors"
          >
            <span>Explore Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {opportunities.length === 0 ? (
          <div className="py-14 px-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-semibold text-zinc-200">No verified opportunities available yet.</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                As SRM organizations publish verified listings, your personalized feed will update automatically.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {displayedOpportunities.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    relevance={(opp as { relevance?: unknown }).relevance as never}
                  />
                ))}
              </AnimatePresence>
            </div>

            {opportunities.length > 3 && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setFeedExpanded((v) => !v)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-medium text-xs transition-all cursor-pointer shadow-lg"
                >
                  {feedExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Collapse Feed</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                      <span>View {opportunities.length - 3} More Opportunities</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* 9. Large Quick Action Shortcuts */}
      <motion.div variants={fadeUp}>
        <CommandQuickActions
          totalSaved={savedOpportunities.length}
          totalRegistered={registeredOpportunities.length}
          criticalDeadlines={criticalDeadlines}
          profileCompleteness={profileCompleteness}
        />
      </motion.div>

      {/* 10. Smart Discovery Engine Banner */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-zinc-950 to-zinc-950 p-6 sm:p-9 space-y-5 shadow-2xl backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.1),transparent_60%)] pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <MapPin className="w-3 h-3" />
            <span>SRM Opportunity Intelligence Network</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
            Find your next campus breakthrough.
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
            {(studentProfile?.skills || []).length > 0
              ? `Discover verified hackathons, research labs, internships, and workshops tailored to your skills in ${(studentProfile!.skills!).slice(0, 3).join(", ")}${(studentProfile!.skills!).length > 3 ? " and more" : ""}.`
              : "Discover verified hackathons, internships, research grants, and club events across all SRM departments."}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Opportunities</span>
          </Link>
          <Link
            href="/dashboard/student/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-medium text-xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Refine My Skill Radar</span>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
