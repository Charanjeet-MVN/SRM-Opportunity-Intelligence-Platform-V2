"use client";

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Opportunity, StudentProfile } from "@/types";
import { TrackerOpportunity } from "@/components/opportunities/StudentOpportunityTracker";
import { RelevanceScoreResult } from "@/lib/relevance/scoring";

// Redesigned Command Center 2.0 Components
import StudentWelcomeHero from "./student/StudentWelcomeHero";
import OpportunitySnapshotGrid from "./student/OpportunitySnapshotGrid";
import UpcomingDeadlinesTimeline from "./student/UpcomingDeadlinesTimeline";
import RecommendedOpportunitiesDeck from "./student/RecommendedOpportunitiesDeck";
import ActivitySnapshotWidget from "./student/ActivitySnapshotWidget";
import CommunitySignalWidget from "./student/CommunitySignalWidget";
import CommandQuickActions from "./student/CommandQuickActions";
import SectionErrorBoundary from "./SectionErrorBoundary";

interface CommandCenterClientProps {
  studentProfile: StudentProfile | null;
  profileCompleteness: number;
  opportunities: (Opportunity & { relevance?: RelevanceScoreResult })[];
  savedOpportunities: TrackerOpportunity[];
  registeredOpportunities: TrackerOpportunity[];
  recentOpportunities?: Opportunity[];
}

function calculateUpcomingDeadlines(items: TrackerOpportunity[]): {
  critical: number;
  thisWeek: number;
} {
  const now = new Date();
  let critical = 0;
  let thisWeek = 0;

  items.forEach((opp) => {
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
  recentOpportunities = [],
}: CommandCenterClientProps) {
  const shouldReduceMotion = useReducedMotion();

  // Combine tracked items (saved + registered) for deadline intelligence
  const allTracked = useMemo(() => {
    const map = new Map<string, TrackerOpportunity>();
    savedOpportunities.forEach((o) => map.set(o.id, o));
    registeredOpportunities.forEach((o) => map.set(o.id, o));
    return Array.from(map.values());
  }, [savedOpportunities, registeredOpportunities]);

  const savedIds = useMemo(() => {
    return new Set(savedOpportunities.map((s) => s.id));
  }, [savedOpportunities]);

  const { critical: criticalDeadlines, thisWeek: deadlinesThisWeek } = useMemo(() => {
    return calculateUpcomingDeadlines(allTracked);
  }, [allTracked]);

  // Motion variants with reduced-motion support
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.35,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* 1. Header: Greeting & Personalized Context */}
      <motion.div variants={itemVariants}>
        <SectionErrorBoundary sectionName="Welcome Experience">
          <StudentWelcomeHero
            studentProfile={studentProfile}
            profileCompleteness={profileCompleteness}
            criticalDeadlines={criticalDeadlines}
            totalSaved={savedOpportunities.length}
          />
        </SectionErrorBoundary>
      </motion.div>

      {/* 2. Opportunity Snapshot Metric Cards */}
      <motion.div variants={itemVariants}>
        <SectionErrorBoundary sectionName="Opportunity Snapshot">
          <OpportunitySnapshotGrid
            totalAvailable={opportunities.length}
            totalSaved={savedOpportunities.length}
            totalRegistered={registeredOpportunities.length}
            deadlinesThisWeek={deadlinesThisWeek}
          />
        </SectionErrorBoundary>
      </motion.div>

      {/* 3. Primary Grid: Recommended Opportunities (7 cols) + Deadline Intelligence (5 cols) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <SectionErrorBoundary sectionName="Recommended Opportunities">
            <RecommendedOpportunitiesDeck
              opportunities={opportunities}
              studentProfile={studentProfile}
              savedIds={savedIds}
            />
          </SectionErrorBoundary>
        </div>

        <div className="lg:col-span-5">
          <SectionErrorBoundary sectionName="Deadline Intelligence">
            <UpcomingDeadlinesTimeline trackedOpportunities={allTracked} />
          </SectionErrorBoundary>
        </div>
      </motion.div>

      {/* 4. Secondary Grid: Activity Snapshot (6 cols) + Community Signal (6 cols) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6">
          <SectionErrorBoundary sectionName="Activity Snapshot">
            <ActivitySnapshotWidget
              savedOpportunities={savedOpportunities}
              registeredOpportunities={registeredOpportunities}
            />
          </SectionErrorBoundary>
        </div>

        <div className="lg:col-span-6">
          <SectionErrorBoundary sectionName="Community Signal">
            <CommunitySignalWidget
              recentOpportunities={recentOpportunities.length > 0 ? recentOpportunities : opportunities}
            />
          </SectionErrorBoundary>
        </div>
      </motion.div>

      {/* 5. Quick Actions */}
      <motion.div variants={itemVariants}>
        <SectionErrorBoundary sectionName="Quick Actions">
          <CommandQuickActions
            totalSaved={savedOpportunities.length}
            totalRegistered={registeredOpportunities.length}
            criticalDeadlines={criticalDeadlines}
            profileCompleteness={profileCompleteness}
          />
        </SectionErrorBoundary>
      </motion.div>
    </motion.div>
  );
}
