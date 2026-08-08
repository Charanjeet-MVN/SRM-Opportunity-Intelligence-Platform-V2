"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { StudentProfile, Opportunity } from "@/types";
import { RelevanceScoreResult, calculateOpportunityRelevance } from "@/lib/relevance/scoring";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  UserCheck,
  Code,
  GraduationCap,
  Building2,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface OpportunityEvaluationSectionProps {
  opportunity: Opportunity;
  profile: StudentProfile | null;
  isAuthenticated: boolean;
}

export default function OpportunityEvaluationSection({
  opportunity,
  profile,
  isAuthenticated,
}: OpportunityEvaluationSectionProps) {
  // If not authenticated, do not show private student-specific evaluation
  if (!isAuthenticated) {
    return null;
  }

  // Check if student profile is incomplete
  const isProfileIncomplete =
    !profile ||
    !profile.department ||
    !profile.yearOfStudy ||
    !profile.skills ||
    profile.skills.length === 0;

  if (isProfileIncomplete) {
    return (
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-purple-500/30 space-y-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Personalized Evaluation Locked</h3>
            <p className="text-xs text-zinc-400">
              Complete your student profile to receive deterministic skill overlap and academic eligibility insights.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between gap-4">
          <span>"Complete your profile to receive more relevant opportunity insights."</span>
          <Link
            href="/dashboard/student/onboarding"
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md shadow-purple-600/20 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>Complete Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const relevance: RelevanceScoreResult = calculateOpportunityRelevance(profile, opportunity);

  // Determine Match Tier State
  let matchStatus: { label: string; bg: string; text: string; border: string; icon: any } = {
    label: "Strong Match",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
  };

  if (relevance.totalScore < 45) {
    matchStatus = {
      label: "Low Match",
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/30",
      icon: XCircle,
    };
  } else if (relevance.totalScore < 75) {
    matchStatus = {
      label: "Partial Match",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
      icon: AlertTriangle,
    };
  }

  const StatusIcon = matchStatus.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 sm:p-7 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-2xl backdrop-blur-xl space-y-6"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-zinc-800/60">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Deterministic Profile Evaluation</span>
          </div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
            Opportunity Relevance & Suitability
          </h2>
        </div>

        {/* Match Tier Badge */}
        <div className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 ${matchStatus.bg} ${matchStatus.border} ${matchStatus.text}`}>
          <StatusIcon className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">{matchStatus.label}</span>
        </div>
      </div>

      {/* Rationale Bullet Insights */}
      {relevance.rationale.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase text-zinc-400 font-semibold tracking-wider">
            Evaluation Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {relevance.rationale.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Overlap Analysis */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 font-semibold uppercase">Skill Requirements Analysis</span>
          <span className="text-purple-400 font-bold">
            {relevance.matchedSkills.length} of {opportunity.requiredSkills.length} Skills Matched ({relevance.skillMatchPercentage}%)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Skills Student Already Has */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
            <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase block">
              Skills You Already Have ({relevance.matchedSkills.length})
            </span>
            {relevance.matchedSkills.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No direct skill matches logged in your profile.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {relevance.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Skills Student May Need to Develop */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
            <span className="text-[11px] font-mono text-purple-400 font-semibold uppercase block">
              Skills to Develop ({relevance.missingSkills.length})
            </span>
            {relevance.missingSkills.length === 0 ? (
              <p className="text-xs text-emerald-400 font-mono">You possess all required skills for this post!</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {relevance.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Academic Eligibility Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/60 text-xs font-mono">
        {/* Department Fit */}
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-zinc-500 uppercase block">Academic Department Fit</span>
            <span className="text-zinc-200 font-semibold">
              {profile.department || "N/A"}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
              relevance.isDepartmentEligible
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {relevance.isDepartmentEligible ? "Eligible" : "Restricted"}
          </span>
        </div>

        {/* Year of Study Fit */}
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-zinc-500 uppercase block">Year of Study Fit</span>
            <span className="text-zinc-200 font-semibold">
              Year {profile.yearOfStudy || "N/A"}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
              relevance.isYearEligible
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {relevance.isYearEligible ? "Eligible" : "Restricted"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
