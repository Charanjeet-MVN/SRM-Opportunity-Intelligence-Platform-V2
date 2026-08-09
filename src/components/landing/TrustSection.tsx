"use client";

import React from "react";
import { ShieldCheck, Lock, Database, Check, Server } from "lucide-react";

export function TrustSection() {
  const trustPillars = [
    {
      icon: ShieldCheck,
      title: "Authenticated SRM Organizations",
      description: "Official club badges are assigned exclusively through multi-stage administrator verification. Unverified spam is strictly isolated."
    },
    {
      icon: Lock,
      title: "Supabase Row-Level Security",
      description: "Student data, bookmarked opportunities, and application records are protected by strict PostgreSQL RLS policies at the database level."
    },
    {
      icon: Database,
      title: "Zero Hardcoded Mock Data",
      description: "Every opportunity listed on the platform originates from validated database records. No fabricated statistics or fake metrics."
    },
    {
      icon: Server,
      title: "Real-time Integrity Checks",
      description: "Submission deadlines, external registration links, and eligibility parameters are actively validated by the V2 core platform."
    }
  ];

  return (
    <section className="py-20 border-t border-zinc-800/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & Core Messaging */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Data Integrity & Trust</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-zinc-100 leading-tight">
              Built Around Verified Campus Opportunity Data
            </h2>

            <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
              SRM Opportunity Intelligence V2 enforces strict organization authentication and database-driven data pipelines. Every listing is backed by validated campus records.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Strict verification workflow for club administrators</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>End-to-end type safety & PostgreSQL constraints</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Transparent submission sources and direct club links</span>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Trust Pillar Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trustPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 transition-all space-y-3"
                >
                  <div className="p-2 w-fit rounded-lg bg-zinc-900 text-emerald-400 border border-zinc-800">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
