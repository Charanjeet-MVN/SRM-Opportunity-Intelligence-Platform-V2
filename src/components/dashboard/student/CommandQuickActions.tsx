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
      title: "Browse Opportunities",
      description: "Explore hackathons, internships, research grants & workshops.",
      icon: Compass,
      href: "/opportunities",
      accent: "text-indigo-400",
      border: "hover:border-indigo-500/50 hover:bg-indigo-500/5",
      badge: "Discovery",
      badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    },
    {
      id: "calendar",
      title: "Deadline Calendar",
      description: "Track upcoming submission milestones and event dates.",
      icon: Calendar,
      href: "/dashboard/student/calendar",
      accent: "text-sky-400",
      border: "hover:border-sky-500/50 hover:bg-sky-500/5",
      badge: criticalDeadlines > 0 ? `${criticalDeadlines} Urgent` : "Timeline",
      badgeColor:
        criticalDeadlines > 0
          ? "bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse"
          : "bg-sky-500/10 text-sky-300 border-sky-500/20",
    },
    {
      id: "saved",
      title: "Saved Radar",
      description: "View opportunities you have pinned for application.",
      icon: Bookmark,
      href: "/dashboard/student/saved",
      accent: "text-purple-400",
      border: "hover:border-purple-500/50 hover:bg-purple-500/5",
      badge: `${totalSaved} Saved`,
      badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    },
    {
      id: "clubs",
      title: "Club Organizations",
      description: "Connect with verified SRM technical & cultural bodies.",
      icon: Building2,
      href: "/clubs",
      accent: "text-amber-400",
      border: "hover:border-amber-500/50 hover:bg-amber-500/5",
      badge: "Campus",
      badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    },
    {
      id: "registrations",
      title: "My Registrations",
      description: "Check your confirmed entries and submission status.",
      icon: CheckCircle2,
      href: "/dashboard/student/registrations",
      accent: "text-emerald-400",
      border: "hover:border-emerald-500/50 hover:bg-emerald-500/5",
      badge: `${totalRegistered} Entries`,
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    },
    {
      id: "profile",
      title: "Profile & Skill Matrix",
      description: "Update department, study year, and technical skills.",
      icon: User,
      href: "/dashboard/student/profile",
      accent: "text-indigo-400",
      border: "hover:border-indigo-500/50 hover:bg-indigo-500/5",
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
            Command Center Shortcuts
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((act) => {
          const Icon = act.icon;

          return (
            <Link
              key={act.id}
              href={act.href}
              className={`group p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 ${act.border} transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-xl relative overflow-hidden`}
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
                <span>Launch Quick View</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
