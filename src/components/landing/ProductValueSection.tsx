"use client";

import React from "react";
import { Compass, ShieldCheck, BookmarkCheck, Database } from "lucide-react";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  badgeText: string;
  accentColor: "indigo" | "emerald" | "purple" | "blue";
  details: string[];
}

export function ProductValueSection() {
  const features: FeatureCardProps[] = [
    {
      icon: Compass,
      title: "1. Intelligent Discovery",
      badgeText: "Skill Vectoring",
      accentColor: "indigo",
      description: "Find opportunities based on skills, interests and preferences.",
      details: [
        "Natural language search across titles & domain tags",
        "Relevance scoring matched directly to student vectors",
        "Filtered by academic branch, semester, and domain"
      ]
    },
    {
      icon: ShieldCheck,
      title: "2. Verified Opportunities",
      badgeText: "Strict RLS Integrity",
      accentColor: "emerald",
      description: "Only trusted/verified campus opportunities should enter the ecosystem.",
      details: [
        "Verified badges for authenticated SRM club administrators",
        "Multi-step admin review workflow for public postings",
        "Direct connection to official club leads & faculty guides"
      ]
    },
    {
      icon: BookmarkCheck,
      title: "3. Personal Tracking",
      badgeText: "Student Pipeline",
      accentColor: "purple",
      description: "Track opportunities, applications, deadlines and progress.",
      details: [
        "Save & bookmark opportunities to personal watchlist",
        "Status tracking across Saved, Applied, Shortlisted, and Completed",
        "Deadline reminders & interactive application timeline"
      ]
    },
    {
      icon: Database,
      title: "4. Opportunity Intelligence",
      badgeText: "Structured Index",
      accentColor: "blue",
      description: "Turn scattered opportunity information into structured, searchable data.",
      details: [
        "Normalized event metadata across hackathons, grants & internships",
        "Clear eligibility, team requirements, and submission links",
        "Zero hardcoded mock statistics or fake listings"
      ]
    }
  ];

  return (
    <section className="py-20 border-t border-zinc-800/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            Product Architecture
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-zinc-100">
            Engineered for Campus Clarity
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-light">
            Four core capabilities designed to eliminate noise, aggregate verified signals, and guide SRM students from discovery to application.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative p-7 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700/80 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-indigo-950/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-indigo-400 group-hover:border-indigo-500/40 group-hover:bg-indigo-600/10 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {feat.badgeText}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors mb-2">
                    {feat.title}
                  </h3>
                  
                  <p className="text-sm text-zinc-400 font-light leading-relaxed mb-6">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-900 space-y-2">
                  {feat.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-400">
                      <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
