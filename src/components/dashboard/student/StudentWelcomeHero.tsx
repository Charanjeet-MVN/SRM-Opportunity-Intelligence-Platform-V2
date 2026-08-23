"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { StudentProfile } from "@/types";
import {
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Search,
} from "lucide-react";
import GlobalCommandPalette from "@/components/navigation/GlobalCommandPalette";

interface StudentWelcomeHeroProps {
  studentProfile: StudentProfile | null;
  profileCompleteness: number;
  criticalDeadlines: number;
  totalSaved: number;
}

export default function StudentWelcomeHero({
  studentProfile,
  profileCompleteness,
  criticalDeadlines,
  totalSaved,
}: StudentWelcomeHeroProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const firstName = studentProfile?.fullName?.split(" ")[0] || "Student";

  // Determine greeting based on current local hour
  const currentHour = new Date().getHours();
  let timeGreeting = "Good day";
  if (currentHour < 12) timeGreeting = "Good morning";
  else if (currentHour < 17) timeGreeting = "Good afternoon";
  else timeGreeting = "Good evening";

  // Formatted current date
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <div className="relative rounded-3xl bg-gradient-to-br from-zinc-900/95 via-zinc-950/90 to-indigo-950/20 border border-zinc-800/80 p-6 sm:p-8 lg:p-9 shadow-2xl backdrop-blur-2xl overflow-hidden group">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-600/15 transition-all duration-700" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Context Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900/90 border border-zinc-800 text-zinc-300 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[9px]">
                  Opportunity Intelligence Active
                </span>
                <span className="text-zinc-600">•</span>
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-zinc-400 text-[10px]">SRM Verified</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900/60 border border-zinc-800 text-zinc-400">
                <Calendar className="w-3 h-3 text-indigo-400" />
                <span>{todayStr}</span>
              </div>
            </div>

            {/* Profile Completeness & Command Palette Trigger */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                aria-label="Open Command Palette"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer shadow-sm group/cmd"
              >
                <Search className="w-3 h-3 text-zinc-500 group-hover/cmd:text-indigo-400 transition-colors" />
                <span>Command Palette</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[9px] text-zinc-500 font-mono">
                  ⌘K
                </kbd>
              </button>

              <Link
                href="/dashboard/student/profile"
                className="group/pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/40 text-zinc-300 transition-all cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span>
                  Profile: <strong className="text-purple-300 font-bold">{profileCompleteness}%</strong>
                </span>
                <ArrowRight className="w-3 h-3 text-zinc-500 group-hover/pill:text-purple-300 group-hover/pill:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {/* Headline & Personalized Greeting */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {timeGreeting},{" "}
                <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
                  {firstName}
                </span>
                .
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
                Your opportunity intelligence is ready.
              </p>
              <p className="text-xs text-zinc-400 font-light leading-relaxed pt-0.5">
                {totalSaved > 0
                  ? `You are tracking ${totalSaved} opportunities. ${
                      criticalDeadlines > 0
                        ? `${criticalDeadlines} require attention before deadlines pass.`
                        : "All deadlines are currently on track."
                    }`
                  : "Discover tailored hackathons, research labs, internships, and events based on your academic profile."}
              </p>
            </div>

            {/* Direct Action */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explore Opportunities</span>
              </Link>
            </div>
          </div>

          {/* Academic Profile Meta Strip */}
          {studentProfile && (
            <div className="pt-4 border-t border-zinc-800/60 flex flex-wrap items-center gap-2 text-xs font-mono">
              {studentProfile.department && (
                <span className="px-3 py-1 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{studentProfile.department}</span>
                </span>
              )}
              {studentProfile.yearOfStudy && (
                <span className="px-3 py-1 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400">
                  Year {studentProfile.yearOfStudy}
                </span>
              )}
              {(studentProfile.skills || []).slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
                >
                  {skill}
                </span>
              ))}
              {(studentProfile.skills || []).length > 4 && (
                <span className="px-2 py-1 rounded-xl text-zinc-500 text-[11px]">
                  +{studentProfile.skills!.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <GlobalCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        userRole="student"
      />
    </>
  );
}
