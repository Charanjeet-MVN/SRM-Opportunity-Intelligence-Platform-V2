"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Opportunity, StudentProfile } from "@/types";
import {
  generateOpportunitySummaryAction,
  generatePersonalizedInsightAction,
  AIOpportunitySummary,
  AIPersonalizedInsight,
} from "@/lib/ai/service";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Users,
  Calendar,
} from "lucide-react";

interface AIOpportunityIntelligenceSectionProps {
  opportunity: Opportunity;
  profile: StudentProfile | null;
  isAuthenticated?: boolean;
}

export default function AIOpportunityIntelligenceSection({
  opportunity,
  profile,
}: AIOpportunityIntelligenceSectionProps) {
  const [summary, setSummary] = useState<AIOpportunitySummary | null>(null);
  const [insight, setInsight] = useState<AIPersonalizedInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState("Analyzing opportunity requirements...");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "insight">("insight");

  const fetchIntelligence = useCallback(async () => {
    setLoading(true);
    setError(null);

    setLoadingStep("Comparing opportunity requirements against profile...");
    const timeout = setTimeout(() => {
      setLoadingStep("Synthesizing personalized intelligence...");
    }, 600);

    try {
      const [sumRes, insRes] = await Promise.all([
        generateOpportunitySummaryAction(opportunity),
        profile ? generatePersonalizedInsightAction(opportunity, profile) : Promise.resolve({ insight: null }),
      ]);

      clearTimeout(timeout);
      setLoading(false);

      if (sumRes.summary) setSummary(sumRes.summary);
      if (insRes.insight) setInsight(insRes.insight);

      if (!sumRes.summary && !insRes.insight) {
        setError("AI insights are temporarily unavailable.");
      }
    } catch {
      clearTimeout(timeout);
      setLoading(false);
      setError("AI insights are temporarily unavailable.");
    }
  }, [opportunity, profile]);

  useEffect(() => {
    fetchIntelligence();
  }, [fetchIntelligence]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="p-6 sm:p-7 rounded-3xl bg-zinc-950/70 border border-purple-500/30 shadow-2xl backdrop-blur-xl space-y-6"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/25">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Opportunity Intelligence Layer</span>
          </div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
            Opportunity Intelligence & Fit Analysis
          </h2>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          {profile && (
            <button
              onClick={() => setActiveTab("insight")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "insight" ? "bg-purple-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Why This Opportunity?
            </button>
          )}
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "summary" ? "bg-purple-600 text-white shadow-md" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Executive Summary
          </button>
        </div>
      </div>

      {/* Loading Experience */}
      {loading && (
        <div className="py-12 px-6 text-center space-y-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full mx-auto"
          />
          <p className="text-xs font-mono text-purple-300 animate-pulse">{loadingStep}</p>
        </div>
      )}

      {/* Error / Retry Fallback */}
      {!loading && error && (
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-zinc-400 font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchIntelligence}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry AI Analysis</span>
          </button>
        </div>
      )}

      {/* Tab Panels */}
      {!loading && !error && (
        <AnimatePresence mode="wait">
          {/* WHY THIS OPPORTUNITY TAB */}
          {activeTab === "insight" && insight && (
            <motion.div
              key="insight-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Insight Rationale Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-900 border border-purple-500/25 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{insight.headline}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-light">
                  {insight.rationale}
                </p>
              </div>

              {/* Matched vs Missing Skill Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase text-emerald-400 block">
                    Profile Skills Matched ({insight.matchedSkills.length})
                  </span>
                  {insight.matchedSkills.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No direct skill overlap logged.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {insight.matchedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase text-purple-400 block">
                    Recommended Prerequisite Skills ({insight.missingSkills.length})
                  </span>
                  {insight.missingSkills.length === 0 ? (
                    <p className="text-xs text-emerald-400 font-mono">You possess all required skills for this post!</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {insight.missingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono bg-purple-500/10 text-purple-300 border border-purple-500/25"
                        >
                          + {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Department & Year Eligibility Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="truncate">{insight.departmentMatch}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">{insight.yearMatch}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* EXECUTIVE SUMMARY TAB */}
          {(activeTab === "summary" || (!insight && summary)) && summary && (
            <motion.div
              key="summary-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. What It Is */}
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-purple-400 block">
                    1. What Is It?
                  </span>
                  <p className="text-zinc-300 leading-relaxed font-light">{summary.whatItIs}</p>
                </div>

                {/* 2. Who Is It For */}
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-indigo-400 block">
                    2. Who Is It For?
                  </span>
                  <p className="text-zinc-300 leading-relaxed font-light">{summary.whoShouldApply}</p>
                </div>

                {/* 3. Key Requirements / What You Will Do */}
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 block">
                    3. Key Requirements & Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {summary.keyRequirements.map((req, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Why Might It Matter */}
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-amber-400 block">
                    4. Why Might It Matter?
                  </span>
                  <p className="text-zinc-300 leading-relaxed font-light">{summary.whyItMayMatter}</p>
                  <p className="text-zinc-400 leading-relaxed font-light pt-1 border-t border-zinc-800/60 font-mono text-[11px]">
                    {summary.importantDates}
                  </p>
                </div>
              </div>

              {/* 5. What Should You Do Next? */}
              {summary.whatShouldDoNext && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 via-zinc-900 to-indigo-950/30 border border-purple-500/25 space-y-1.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-purple-300 block flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>5. What Should You Do Next?</span>
                  </span>
                  <p className="text-zinc-200 leading-relaxed font-light">
                    {summary.whatShouldDoNext}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
