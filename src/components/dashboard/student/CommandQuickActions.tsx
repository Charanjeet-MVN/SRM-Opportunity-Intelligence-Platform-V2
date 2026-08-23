"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  Calendar,
  Bookmark,
  Building2,
  CheckCircle2,
  User,
  ArrowRight,
  Zap,
} from "lucide-react";
import SpatialCard3D from "@/components/3d/SpatialCard3D";

interface CommandQuickActionsProps {
  totalSaved: number;
  totalRegistered: number;
  criticalDeadlines: number;
  profileCompleteness: number;
}

export default function CommandQuickActions({
  totalSaved,
  totalRegistered,
  criticalDeadlines,
  profileCompleteness,
}: CommandQuickActionsProps) {
  const actions = [
    {
      id: "browse",
      title: "Discover Opportunities",
      description: "Search hackathons, internships, research grants & workshops.",
      icon: Compass,
      href: "/opportunities",
      accent: "text-indigo-400",
      glowColor: "rgba(99, 102, 241, 0.15)",
      border: "hover:border-indigo-500/50",
      badge: "Catalog",
      badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    },
    {
      id: "calendar",
      title: "Deadline Calendar",
      description: "Track impending submission milestones and application windows.",
      icon: Calendar,
      href: "/dashboard/student/calendar",
      accent: "text-sky-400",
      glowColor: "rgba(56, 189, 248, 0.15)",
      border: "hover:border-sky-500/50",
      badge: criticalDeadlines > 0 ? `${criticalDeadlines} Urgent` : "Timeline",
      badgeColor:
        criticalDeadlines > 0
          ? "bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse"
          : "bg-sky-500/10 text-sky-300 border-sky-500/20",
    },
    {
      id: "saved",
      title: "Saved Opportunities",
      description: "Review and manage listings pinned to your application radar.",
      icon: Bookmark,
      href: "/dashboard/student/saved",
      accent: "text-purple-400",
      glowColor: "rgba(168, 85, 247, 0.15)",
      border: "hover:border-purple-500/50",
      badge: `${totalSaved} Saved`,
      badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    },
    {
      id: "registrations",
      title: "My Registrations",
      description: "Check your confirmed entries, passes, and submission statuses.",
      icon: CheckCircle2,
      href: "/dashboard/student/registrations",
      accent: "text-emerald-400",
      glowColor: "rgba(16, 185, 129, 0.15)",
      border: "hover:border-emerald-500/50",
      badge: `${totalRegistered} Entries`,
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    },
    {
      id: "clubs",
      title: "Club Directory",
      description: "Connect with verified SRM technical & cultural organizations.",
      icon: Building2,
      href: "/clubs",
      accent: "text-amber-400",
      glowColor: "rgba(245, 158, 11, 0.15)",
      border: "hover:border-amber-500/50",
      badge: "Campus",
      badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    },
    {
      id: "profile",
      title: "Profile & Skills",
      description: "Refine your department, study year, and technical skill vectors.",
      icon: User,
      href: "/dashboard/student/profile",
      accent: "text-indigo-400",
      glowColor: "rgba(99, 102, 241, 0.15)",
      border: "hover:border-indigo-500/50",
      badge: `${profileCompleteness}% Complete`,
      badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
            Quick Actions
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((act) => {
          const Icon = act.icon;

          return (
            <Link key={act.id} href={act.href} className="block h-full">
              <SpatialCard3D
                depth={4}
                elevationZ={10}
                glowColor={act.glowColor}
                className="h-full"
              >
                <div
                  className={`group p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 ${act.border} transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-xl h-full relative overflow-hidden`}
                >
                  {/* Top ambient highlight */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-zinc-700/0 to-transparent group-hover:via-indigo-500/50 transition-all duration-500" />

                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                      <Icon className={`w-5 h-5 ${act.accent}`} />
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold ${act.badgeColor}`}
                    >
                      {act.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">
                      {act.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono text-zinc-500 group-hover:text-indigo-400 transition-colors">
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </SpatialCard3D>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
