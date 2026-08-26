"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Opportunity, StudentProfile } from "@/types";
import { RelevanceScoreResult, calculateOpportunityRelevance } from "@/lib/relevance/scoring";
import {
  GraduationCap,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  UserCheck,
} from "lucide-react";

interface OpportunityEligibilityMatrixProps {
  opportunity: Opportunity;
  profile: StudentProfile | null;
  isAuthenticated: boolean;
}

export default function OpportunityEligibilityMatrix({
  opportunity,
  profile,
  isAuthenticated,
}: OpportunityEligibilityMatrixProps) {
  const relevance: RelevanceScoreResult = calculateOpportunityRelevance(profile, opportunity);

  const hasDeptRestrictions =
    opportunity.eligibleDepartments &&
    opportunity.eligibleDepartments.length > 0 &&
    !opportunity.eligibleDepartments.includes("All Departments");

  const hasYearRestrictions =
    opportunity.eligibleYears &&
    opportunity.eligibleYears.length > 0;

  const hasSkillRequirements =
    opportunity.requiredSkills &&
    opportunity.requiredSkills.length > 0;

  // Department status
  let deptStatus: { isEligible: boolean; label: string; textClass: string; icon: React.ElementType } = {
    isEligible: true,
    label: "Open to All SRM Departments",
    textClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle2,
  };

  if (hasDeptRestrictions) {
    if (!isAuthenticated || !profile?.department) {
      deptStatus = {
        isEligible: false,
        label: `Targeting ${opportunity.eligibleDepartments.join(", ")}`,
        textClass: "text-zinc-400 bg-zinc-900 border-zinc-800",
        icon: Building,
      };
    } else if (relevance.isDepartmentEligible) {
      deptStatus = {
        isEligible: true,
        label: `Eligible: Your Department (${profile.department})`,
        textClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        icon: CheckCircle2,
      };
    } else {
      deptStatus = {
        isEligible: false,
        label: `Restricted: Requires ${opportunity.eligibleDepartments.join(", ")}`,
        textClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        icon: XCircle,
      };
    }
  }

  // Year status
  let yearStatus: { isEligible: boolean; label: string; textClass: string; icon: React.ElementType } = {
    isEligible: true,
    label: "Open to All Academic Years",
    textClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle2,
  };

  if (hasYearRestrictions) {
    if (!isAuthenticated || !profile?.yearOfStudy) {
      deptStatus = {
        isEligible: false,
        label: `Targeting Year ${opportunity.eligibleYears.join(", ")}`,
        textClass: "text-zinc-400 bg-zinc-900 border-zinc-800",
        icon: GraduationCap,
      };
    } else if (relevance.isYearEligible) {
      yearStatus = {
        isEligible: true,
        label: `Eligible: Year ${profile.yearOfStudy} Student`,
        textClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        icon: CheckCircle2,
      };
    } else {
      yearStatus = {
        isEligible: false,
        label: `Restricted: Targeting Year ${opportunity.eligibleYears.map((y) => `Year ${y}`).join(", ")}`,
        textClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        icon: XCircle,
      };
    }
  }

  // Skills status
  const studentSkills = (profile?.skills || []).map((s) => s.toLowerCase().trim());
  const origSkills = opportunity.requiredSkills || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-zinc-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-indigo-400 tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Eligibility & Skills Matrix</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            Am I Eligible for This Opportunity?
          </h2>
        </div>

        {/* Global Eligibility Status Banner */}
        {isAuthenticated && profile ? (
          <div
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-2 ${
              relevance.isDepartmentEligible && relevance.isYearEligible
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
            }`}
          >
            {relevance.isDepartmentEligible && relevance.isYearEligible ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>You are Eligible to Apply</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Eligibility Criteria Partial / Restricted</span>
              </>
            )}
          </div>
        ) : (
          <div className="px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-mono text-zinc-400 flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sign in to verify student eligibility</span>
          </div>
        )}
      </div>

      {/* 1. Academic Eligibility Criteria Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Department Requirement Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-bold text-zinc-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              <span>Department Requirement</span>
            </span>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${deptStatus.textClass}`}>
              {hasDeptRestrictions
                ? (isAuthenticated && profile?.department && relevance.isDepartmentEligible ? "Eligible" : "Specified")
                : "All Departments"}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="text-sm font-semibold text-zinc-200">
              {hasDeptRestrictions
                ? opportunity.eligibleDepartments.join(", ")
                : "Open to students from all SRM departments and faculties"}
            </div>
            {isAuthenticated && profile?.department && (
              <p className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                {relevance.isDepartmentEligible ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
                <span>Your Department: {profile.department}</span>
              </p>
            )}
          </div>
        </div>

        {/* Year of Study Requirement Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-bold text-zinc-400 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Year of Study Requirement</span>
            </span>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${yearStatus.textClass}`}>
              {hasYearRestrictions
                ? (isAuthenticated && profile?.yearOfStudy && relevance.isYearEligible ? "Eligible" : "Specified")
                : "All Years"}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="text-sm font-semibold text-zinc-200">
              {hasYearRestrictions
                ? opportunity.eligibleYears.map((y) => `Year ${y}`).join(", ")
                : "Open to 1st, 2nd, 3rd, and 4th year undergraduate & postgraduate students"}
            </div>
            {isAuthenticated && profile?.yearOfStudy && (
              <p className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                {relevance.isYearEligible ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
                <span>Your Year: Year {profile.yearOfStudy}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Skills Intelligence & Overlap */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-purple-400">
            <Cpu className="w-4 h-4" />
            <span>Skills Breakdown (Required vs Your Match)</span>
          </div>
          {hasSkillRequirements && isAuthenticated && profile && (
            <span className="text-xs font-mono font-bold text-indigo-300">
              {relevance.matchedSkills.length} of {origSkills.length} Skills Matched ({relevance.skillMatchPercentage}%)
            </span>
          )}
        </div>

        {hasSkillRequirements ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Required Skills list */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                Required Prerequisite Skills
              </span>
              <div className="flex flex-wrap gap-2">
                {origSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono bg-zinc-900 border border-zinc-700 text-zinc-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Student's Match Breakdown */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                Your Match Status
              </span>
              {isAuthenticated && profile ? (
                <div className="flex flex-wrap gap-2">
                  {origSkills.map((skill) => {
                    const isMatched = studentSkills.some(
                      (ss) => ss === skill.toLowerCase().trim() || ss.includes(skill.toLowerCase().trim()) || skill.toLowerCase().trim().includes(ss)
                    );

                    return (
                      <span
                        key={skill}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 border ${
                          isMatched
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : "bg-zinc-900/60 text-zinc-500 border-zinc-800"
                        }`}
                      >
                        {isMatched ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{skill}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-zinc-600 font-mono">○</span>
                            <span>{skill} (Prerequisite)</span>
                          </>
                        )}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic font-mono">
                  Sign in with your student account to see your skill match comparison.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              No strict prerequisite skills specified for this opportunity. Students of all technical proficiencies are welcome to participate.
            </span>
          </div>
        )}
      </div>

      {/* 3. Unauthenticated / Incomplete Profile Notice */}
      {(!isAuthenticated || !profile) && (
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/25 flex items-center justify-between gap-4 flex-wrap text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-indigo-300 block">
              Want verified SRM eligibility checking?
            </span>
            <p className="text-zinc-400 font-light">
              Sign in with your student credentials to unlock automatic eligibility validation and skill vector scoring.
            </p>
          </div>
          <Link
            href="/signup"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Sign In / Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}
