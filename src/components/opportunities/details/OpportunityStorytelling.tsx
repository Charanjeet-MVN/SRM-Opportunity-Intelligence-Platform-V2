"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Opportunity } from "@/types";
import {
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Building,
  ChevronDown,
  ChevronUp,
  Target,
  Award,
  BookOpen,
} from "lucide-react";

interface OpportunityStorytellingProps {
  opportunity: Opportunity;
}

export default function OpportunityStorytelling({ opportunity }: OpportunityStorytellingProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Split description by paragraphs or sections
  const paragraphs = opportunity.description
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const shouldTruncate = paragraphs.length > 3 && !isExpanded;
  const displayedParagraphs = shouldTruncate ? paragraphs.slice(0, 3) : paragraphs;

  // Extract bullets or key takeaways from summary / first paragraph
  const keyTakeaways = [
    opportunity.summary || "Comprehensive experiential opportunity designed for SRM students to advance skills and credentials.",
    opportunity.locationAddress
      ? `Held at ${opportunity.locationAddress} (${opportunity.locationType.replace("_", " ")})`
      : `Operating Mode: ${opportunity.locationType.replace("_", " ")}`,
    opportunity.maxParticipants
      ? `Cohort capacity limited to ${opportunity.maxParticipants} participants`
      : "Open cohort registration for all eligible candidates",
  ];

  return (
    <div className="space-y-6">
      {/* 1. Executive Highlights Bar (Apple style feature highlights) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {keyTakeaways.map((takeaway, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.35 }}
            className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl flex items-start gap-3 shadow-lg hover:border-zinc-700 transition-colors"
          >
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
              {idx === 0 ? (
                <Target className="w-4 h-4" />
              ) : idx === 1 ? (
                <Building className="w-4 h-4" />
              ) : (
                <Award className="w-4 h-4" />
              )}
            </div>
            <p className="text-xs text-zinc-300 font-light leading-relaxed">
              {takeaway}
            </p>
          </motion.div>
        ))}
      </div>

      {/* 2. Main Narrative Reading Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-9 backdrop-blur-2xl shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between border-b border-zinc-800/70 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-indigo-400 tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Opportunity Narrative & Overview</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {paragraphs.length} Section{paragraphs.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Narrative Paragraphs with enhanced typography */}
        <div className="space-y-4 text-zinc-300 leading-relaxed text-sm font-light">
          {displayedParagraphs.map((para, i) => {
            // Check if paragraph looks like a list
            if (para.startsWith("-") || para.startsWith("•") || para.startsWith("*")) {
              const listItems = para
                .split("\n")
                .map((line) => line.replace(/^[-•*]\s*/, "").trim())
                .filter(Boolean);

              return (
                <ul key={i} className="space-y-2 pl-2 my-3">
                  {listItems.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <p
                key={i}
                className="text-xs sm:text-sm sm:leading-relaxed text-zinc-300 first-of-type:text-zinc-200 first-of-type:font-normal"
              >
                {para}
              </p>
            );
          })}
        </div>

        {/* Truncation / Expand button if very long */}
        {paragraphs.length > 3 && (
          <div className="pt-2 border-t border-zinc-800/60 flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-indigo-400 hover:text-indigo-300 border border-zinc-800 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>{isExpanded ? "Collapse Overview" : "Read Full Opportunity Details"}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </motion.div>

      {/* 3. Required Skill Vector Chips Card */}
      {opportunity.requiredSkills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-purple-400 tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Target Skill Vectors & Competencies</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              {opportunity.requiredSkills.length} Skills Listed
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-light">
            Proficiency in or enthusiasm to learn these technical tools and frameworks will maximize success:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {opportunity.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono bg-zinc-900/90 text-indigo-300 border border-indigo-500/25 shadow-sm hover:border-indigo-500/50 hover:bg-zinc-900 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* 4. Academic Eligibility Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-zinc-300 tracking-wider">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Academic Eligibility Matrix</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            SRM Verified Criterion
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 font-mono text-xs">
          {/* Academic Years */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
            <span className="text-[10px] text-zinc-500 uppercase block">Eligible Years of Study</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {opportunity.eligibleYears.length > 0 ? (
                opportunity.eligibleYears.map((year) => (
                  <span
                    key={year}
                    className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                  >
                    Year {year}
                  </span>
                ))
              ) : (
                <span className="text-zinc-300 font-sans">Open to All Academic Years</span>
              )}
            </div>
          </div>

          {/* SRM Departments */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
            <span className="text-[10px] text-zinc-500 uppercase block">Eligible SRM Departments</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {opportunity.eligibleDepartments.length > 0 ? (
                opportunity.eligibleDepartments.map((dept) => (
                  <span
                    key={dept}
                    className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                  >
                    {dept}
                  </span>
                ))
              ) : (
                <span className="text-zinc-300 font-sans">Open to All SRM Departments & Specializations</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
