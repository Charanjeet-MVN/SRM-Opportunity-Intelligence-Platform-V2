"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, Bookmark, ArrowUpRight, CheckCircle2, ChevronRight } from "lucide-react";

interface StepItem {
  id: string;
  stepNum: string;
  name: string;
  headline: string;
  description: string;
  icon: React.ElementType;
  previewCard: {
    title: string;
    sub: string;
    tag: string;
    actionText: string;
  };
}

const STEPS: StepItem[] = [
  {
    id: "discover",
    stepNum: "01",
    name: "DISCOVER",
    headline: "Intelligent Indexing of Campus Opportunities",
    description: "Search and discover verified hackathons, research grants, internships, and official club recruitments matched to your technical profile.",
    icon: Search,
    previewCard: {
      title: "Natural Language Search",
      sub: "'Machine Learning hackathons with travel grants'",
      tag: "Index Query",
      actionText: "98% Relevance Match"
    }
  },
  {
    id: "filter",
    stepNum: "02",
    name: "FILTER",
    headline: "Refine by Branch, Skills & Timelines",
    description: "Filter out irrelevant noise. Focus exclusively on opportunities that match your current semester, skill vector, and availability.",
    icon: SlidersHorizontal,
    previewCard: {
      title: "Domain & Vector Filters",
      sub: "Dept: CSE • Skill: PyTorch • Mode: In-Person",
      tag: "Filtered Feed",
      actionText: "3 High Value Matches"
    }
  },
  {
    id: "track",
    stepNum: "03",
    name: "TRACK",
    headline: "Centralized Student Application Pipeline",
    description: "Save opportunities to your personal workspace. Monitor submission deadlines, application status, and upcoming milestones.",
    icon: Bookmark,
    previewCard: {
      title: "Student Application Tracker",
      sub: "Saved (2) • Applied (1) • Shortlisted (1)",
      tag: "Workspace Active",
      actionText: "Deadline in 3 Days"
    }
  },
  {
    id: "act",
    stepNum: "04",
    name: "ACT",
    headline: "Direct Registration & Verified Execution",
    description: "Access direct registration links, official contact channels, and authenticated submission portals for SRM campus organizations.",
    icon: ArrowUpRight,
    previewCard: {
      title: "Verified Submission Link",
      sub: "Official SRM Club Portal • RLS Secured",
      tag: "Direct Action",
      actionText: "Apply Now"
    }
  }
];

export function ProductFlowSection() {
  const [activeTab, setActiveTab] = useState<string>("discover");

  const currentStep = STEPS.find((s) => s.id === activeTab) || STEPS[0];
  const StepIcon = currentStep.icon;

  return (
    <section className="py-20 border-t border-zinc-800/60 bg-zinc-950/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            System Workflow
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-zinc-100">
            How Students Navigate Opportunities
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-light">
            A linear product progression designed to take you from initial discovery to active participation.
          </p>
        </div>

        {/* Workflow Stepper Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {STEPS.map((step, idx) => {
            const isActive = activeTab === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveTab(step.id)}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                  isActive
                    ? "bg-zinc-900 border-indigo-500/60 text-zinc-100 shadow-xl shadow-indigo-950/30"
                    : "bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-400">
                    STEP {step.stepNum}
                  </span>
                  {idx < STEPS.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600 hidden md:block" />
                  )}
                </div>
                <div className="text-sm font-semibold tracking-wide">{step.name}</div>
              </button>
            );
          })}
        </div>

        {/* Active Step Product Display */}
        <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-semibold">
              <StepIcon className="w-3.5 h-3.5" />
              <span>Phase {currentStep.stepNum}: {currentStep.name}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-semibold text-zinc-100">
              {currentStep.headline}
            </h3>

            <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
              {currentStep.description}
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-zinc-400 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Integrated into student dashboard & discovery engine</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="p-6 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 space-y-4 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  Live Component Preview
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono border border-indigo-800/40">
                  {currentStep.previewCard.tag}
                </span>
              </div>

              <div>
                <h4 className="text-base font-semibold text-zinc-100">
                  {currentStep.previewCard.title}
                </h4>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  {currentStep.previewCard.sub}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-500">System Status</span>
                <span className="font-medium text-emerald-400">
                  {currentStep.previewCard.actionText}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
