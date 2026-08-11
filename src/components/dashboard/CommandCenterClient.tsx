"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Opportunity, StudentProfile } from "@/types";
import { TrackerOpportunity } from "@/components/opportunities/StudentOpportunityTracker";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import StudentOpportunityTracker from "@/components/opportunities/StudentOpportunityTracker";
import {
  Compass,
  User,
  Bookmark,
  UserCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Shield,
  BarChart3,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface CommandCenterClientProps {
  studentProfile: StudentProfile | null;
  profileCompleteness: number;
  opportunities: (Opportunity & { relevance?: unknown })[];
  savedOpportunities: TrackerOpportunity[];
  registeredOpportunities: TrackerOpportunity[];
}

// Framer Motion stagger container
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

// Deadline urgency helper (reused from tracker)
function getUpcomingDeadlineInfo(savedOpps: TrackerOpportunity[]): {
  critical: number;
  upcoming: number;
} {
  const now = new Date();
  let critical = 0;
  let upcoming = 0;
  savedOpps.forEach((opp) => {
    if (!opp.applicationDeadline) return;
    const deadline = new Date(opp.applicationDeadline);
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffMs > 0) {
      if (diffDays <= 3) critical++;
      else upcoming++;
    }
  });
  return { critical, upcoming };
}

export default function CommandCenterClient({
  studentProfile,
  profileCompleteness,
  opportunities,
  savedOpportunities,
  registeredOpportunities,
}: CommandCenterClientProps) {
  const [feedExpanded, setFeedExpanded] = useState(false);
  const displayedOpportunities = feedExpanded ? opportunities : opportunities.slice(0, 3);

  const firstName = studentProfile?.fullName?.split(" ")[0] || "Student";
  const { critical: criticalDeadlines, upcoming: upcomingDeadlines } =
    getUpcomingDeadlineInfo(savedOpportunities);

  // Compute unique upcoming deadlines across saved + registered
  const allTracked = [...savedOpportunities, ...registeredOpportunities];
  const uniqueMap = new Map<string, TrackerOpportunity>();
  allTracked.forEach((o) => uniqueMap.set(o.id, o));
  const upcomingCount = Array.from(uniqueMap.values()).filter(
    (o) => o.applicationDeadline && new Date(o.applicationDeadline) > new Date()
  ).length;

  const STAT_CARDS = [
    {
      label: "Saved",
      value: savedOpportunities.length,
      icon: Bookmark,
      accent: "text-indigo-400",
      border: "border-indigo-500/20 hover:border-indigo-500/50",
      bg: "bg-indigo-500/8",
      href: "/dashboard/student/saved",
    },
    {
      label: "Registered",
      value: registeredOpportunities.length,
      icon: UserCheck,
      accent: "text-emerald-400",
      border: "border-emerald-500/20 hover:border-emerald-500/50",
      bg: "bg-emerald-500/8",
      href: "/dashboard/student/registrations",
    },
    {
      label: "Upcoming Deadlines",
      value: upcomingCount,
      icon: Clock,
      accent: criticalDeadlines > 0 ? "text-amber-400" : "text-sky-400",
      border:
        criticalDeadlines > 0
          ? "border-amber-500/30 hover:border-amber-500/60"
          : "border-sky-500/20 hover:border-sky-500/50",
      bg: criticalDeadlines > 0 ? "bg-amber-500/8" : "bg-sky-500/8",
      href: "/dashboard/student/calendar",
    },
    {
      label: "Profile",
      value: `${profileCompleteness}%`,
      icon: BarChart3,
      accent: "text-purple-400",
      border: "border-purple-500/20 hover:border-purple-500/50",
      bg: "bg-purple-500/8",
      href: "/dashboard/student/profile",
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* ── COMMAND CENTER HEADER ── */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-6 sm:p-8 space-y-4">
        {/* Subtle ambient glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 font-semibold uppercase tracking-widest text-[9px]">
                Workspace Active
              </span>
              <span className="text-zinc-600">•</span>
              <Shield className="w-3 h-3 text-indigo-400" />
              <span className="text-zinc-400 text-[10px]">Supabase Verified</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
              Welcome back, {firstName}.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-lg">
              Your private opportunity intelligence cockpit.
              {savedOpportunities.length > 0
                ? ` You have ${savedOpportunities.length} saved ${savedOpportunities.length === 1 ? "opportunity" : "opportunities"} and ${upcomingCount} active deadline${upcomingCount !== 1 ? "s" : ""} to track.`
                : " Start exploring verified SRM opportunities to build your personalized tracking radar."}
            </p>
          </div>

          {/* CTA Group */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {criticalDeadlines > 0 && (
              <Link
                href="/dashboard/student/calendar"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold text-xs transition-all hover:bg-amber-500/25"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{criticalDeadlines} Closing Soon</span>
              </Link>
            )}
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Opportunities</span>
            </Link>
          </div>
        </div>

        {/* Student profile meta chips */}
        {studentProfile && (
          <div className="relative z-10 flex flex-wrap gap-2 pt-2 border-t border-zinc-800/60">
            {studentProfile.department && (
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
                {studentProfile.department}
              </span>
            )}
            {studentProfile.yearOfStudy && (
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
                Year {studentProfile.yearOfStudy}
              </span>
            )}
            {(studentProfile.skills || []).slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
              >
                {skill}
              </span>
            ))}
            {(studentProfile.skills || []).length > 5 && (
              <span className="px-2 py-1 rounded-lg text-[11px] font-mono text-zinc-500">
                +{studentProfile.skills!.length - 5} more
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* ── LIVE OVERVIEW METRIC CARDS ── */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href}>
                <motion.div
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  className={`group p-5 rounded-2xl ${card.bg} border ${card.border} bg-zinc-900/60 transition-all duration-300 cursor-pointer relative overflow-hidden`}
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/50 transition-all duration-500" />
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-xl ${card.bg} border border-zinc-800/80 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-4 h-4 ${card.accent}`} />
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <motion.div
                    key={String(card.value)}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`text-2xl font-black ${card.accent} font-mono mb-0.5`}
                  >
                    {card.value}
                  </motion.div>
                  <div className="text-[11px] font-medium text-zinc-400">{card.label}</div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* ── OPPORTUNITY RADAR / SKILL ECOSYSTEM SECTION ── */}
      {studentProfile && (studentProfile.skills || []).length > 0 && (
        <motion.div variants={fadeUp} className="rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-6 sm:p-7 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.05),transparent_60%)] pointer-events-none" />

          <div className="flex items-center gap-2 mb-5 relative z-10">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
              Skill Radar
            </h2>
            <span className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
              {(studentProfile.skills || []).length} active skills
            </span>
          </div>

          {/* Lightweight skill web visualization */}
          <div className="relative z-10 flex flex-col items-center py-4">
            {/* Center node */}
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600/15 border-2 border-indigo-500/40 flex flex-col items-center justify-center shadow-lg shadow-indigo-900/30 z-10">
                <User className="w-5 h-5 text-indigo-400 mb-0.5" />
                <span className="text-[9px] font-mono text-indigo-300 font-bold uppercase tracking-wider">
                  {firstName}
                </span>
              </div>
              {/* Orbit ring */}
              <div className="absolute w-32 h-32 rounded-full border border-indigo-500/10 animate-spin" style={{ animationDuration: "18s" }} />
              <div className="absolute w-52 h-52 rounded-full border border-indigo-500/5" />
            </div>

            {/* Skill chips radiating outward */}
            <div className="mt-5 flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {(studentProfile.skills || []).map((skill, idx) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * idx, duration: 0.3 }}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-colors cursor-default"
                >
                  {skill}
                </motion.span>
              ))}
            </div>

            {(studentProfile.interests || []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                {(studentProfile.interests || []).slice(0, 5).map((interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700 transition-colors cursor-default"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── TRACKER SECTION: SAVED + REGISTERED + UPCOMING ── */}
      <motion.div variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
              My Opportunity Tracker
            </h2>
          </div>
          <Link
            href="/dashboard/student/saved"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono transition-colors"
          >
            <span>Full View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <StudentOpportunityTracker
          initialSaved={savedOpportunities}
          initialRegistered={registeredOpportunities}
          initialTab="saved"
        />
      </motion.div>

      {/* ── PERSONALIZED DISCOVERY FEED ── */}
      <motion.div variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
              Prioritized Discovery Feed
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/opportunities"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono transition-colors"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {opportunities.length === 0 ? (
          <div className="py-14 px-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-purple-400" />
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-medium text-xs transition-all cursor-pointer"
                >
                  {feedExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Show Less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Show {opportunities.length - 3} More</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* ── QUICK NAVIGATION SECTION ── */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              href: "/dashboard/student/profile",
              icon: User,
              label: "Profile & Skills",
              description: `${profileCompleteness}% complete — ${(studentProfile?.skills || []).length} active skills`,
              accent: "group-hover:border-purple-500/50 group-hover:bg-purple-500/5",
              iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
              badge: profileCompleteness < 100 ? `${100 - profileCompleteness}% to complete` : undefined,
              badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
            },
            {
              href: "/dashboard/student/calendar",
              icon: Calendar,
              label: "Deadline Calendar",
              description: `${upcomingDeadlines} active deadlines${criticalDeadlines > 0 ? ` — ${criticalDeadlines} critical` : ""}`,
              accent: "group-hover:border-sky-500/50 group-hover:bg-sky-500/5",
              iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
              badge: criticalDeadlines > 0 ? `${criticalDeadlines} Urgent` : undefined,
              badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
            },
            {
              href: "/dashboard/student/registrations",
              icon: CheckCircle2,
              label: "Registrations",
              description: `${registeredOpportunities.length} registered opportunity${registeredOpportunities.length !== 1 ? "ies" : "y"}`,
              accent: "group-hover:border-emerald-500/50 group-hover:bg-emerald-500/5",
              iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
              badge: undefined,
              badgeColor: "",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 ${item.accent} transition-all duration-200 space-y-3 relative overflow-hidden`}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/40 transition-all duration-500" />
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-xl ${item.iconBg} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono leading-snug">{item.description}</p>
                </div>
                <div className="flex items-center gap-1 text-zinc-500 group-hover:text-indigo-400 transition-colors text-[11px] font-mono">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* ── SMART DISCOVERY CTA ── */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-zinc-950 to-zinc-950 p-6 sm:p-8 space-y-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <MapPin className="w-3 h-3" />
            <span>SRM Discovery Engine</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-100">
            Find your next opportunity.
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-xl font-light">
            {(studentProfile?.skills || []).length > 0
              ? `Browse verified SRM listings that match your skills in ${(studentProfile!.skills!).slice(0, 3).join(", ")}${(studentProfile!.skills!).length > 3 ? " and more" : ""}.`
              : "Explore verified hackathons, internships, research programs, and campus events published by official SRM organizations."}
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-3">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Opportunities</span>
          </Link>
          <Link
            href="/dashboard/student/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-medium text-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Update My Skills</span>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
