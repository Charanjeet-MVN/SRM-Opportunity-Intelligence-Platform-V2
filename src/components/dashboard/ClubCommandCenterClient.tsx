"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Club } from "@/types";
import { ClubAnalyticsOverview } from "@/lib/clubs/analytics";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import {
  Plus,
  Layers,
  Bookmark,
  BarChart3,
  FileCheck,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Mail,
  Building2,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface ClubCommandCenterClientProps {
  club: Club;
  role?: "lead" | "member";
  analytics: ClubAnalyticsOverview | null;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const } },
};

function getOpportunityDeadlineStatus(deadlineStr?: string): {
  label: string;
  color: string;
} {
  if (!deadlineStr) return { label: "No deadline", color: "text-zinc-500" };
  const now = new Date();
  const deadline = new Date(deadlineStr);
  const diffMs = deadline.getTime() - now.getTime();
  if (diffMs < 0) return { label: "Expired", color: "text-red-400" };
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 3) return { label: `${diffDays}d left`, color: "text-amber-400" };
  return {
    label: deadline.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    color: "text-zinc-400",
  };
}

export default function ClubCommandCenterClient({
  club,
  role,
  analytics,
}: ClubCommandCenterClientProps) {
  const [activeTab, setActiveTab] = useState<"published" | "drafts" | "performance">("published");

  const isVerified = club.verificationStatus === "verified";
  const isPending = club.verificationStatus === "pending_review";

  const publishedOpps = analytics?.opportunityPerformance.filter((o) => o.status === "published") || [];
  const draftOpps = analytics?.opportunityPerformance.filter((o) => o.status === "draft") || [];

  const STAT_CARDS = [
    {
      label: "Published",
      value: analytics?.publishedCount ?? 0,
      icon: CheckCircle2,
      accent: "text-emerald-400",
      border: "border-emerald-500/20 hover:border-emerald-500/50",
      bg: "bg-emerald-500/8",
    },
    {
      label: "Drafts",
      value: analytics?.draftCount ?? 0,
      icon: Sparkles,
      accent: "text-amber-400",
      border: "border-amber-500/20 hover:border-amber-500/50",
      bg: "bg-amber-500/8",
    },
    {
      label: "Student Saves",
      value: analytics?.totalSavedBookmarks ?? 0,
      icon: Bookmark,
      accent: "text-indigo-400",
      border: "border-indigo-500/20 hover:border-indigo-500/50",
      bg: "bg-indigo-500/8",
    },
    {
      label: "Avg Saves / Post",
      value:
        (analytics?.publishedCount ?? 0) > 0
          ? `${Math.round(((analytics?.totalSavedBookmarks ?? 0) / (analytics?.publishedCount ?? 1)) * 10) / 10}`
          : "0",
      icon: TrendingUp,
      accent: "text-purple-400",
      border: "border-purple-500/20 hover:border-purple-500/50",
      bg: "bg-purple-500/8",
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* ── CLUB COMMAND HEADER ── */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/70 p-6 sm:p-8"
      >
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-600/4 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Club Identity */}
          <div className="flex items-start gap-4">
            {/* Club Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl font-black text-indigo-400 shrink-0 overflow-hidden shadow-lg">
              {club.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover" />
              ) : (
                <span>{club.name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="space-y-2">
              {/* System status + verification */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isVerified ? "bg-emerald-400" : "bg-amber-400"} opacity-75`} />
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isVerified ? "bg-emerald-500" : "bg-amber-500"}`} />
                  </span>
                  <span className={`font-semibold uppercase tracking-widest text-[9px] ${isVerified ? "text-emerald-400" : "text-amber-400"}`}>
                    {isVerified ? "Verified Organization" : isPending ? "Verification Pending" : "Unverified"}
                  </span>
                </div>
                <VerificationBadge status={club.verificationStatus} />
                {role && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 capitalize">
                    {role}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
                {club.name}
              </h1>

              <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-xl line-clamp-2">
                {club.description || "Your official SRM organization portal. Publish opportunities, manage your presence, and track student engagement."}
              </p>

              {/* Club meta chips */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {club.officialEmail && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
                    <Mail className="w-3 h-3 text-zinc-500" />
                    {club.officialEmail}
                  </span>
                )}
                {club.category && (
                  <span className="px-2 py-1 rounded-lg text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {club.category}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col gap-2 shrink-0 w-full lg:w-auto">
            <Link
              href={isVerified ? "/dashboard/club/opportunities/new" : "#"}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs shadow-lg transition-all active:scale-95 ${
                isVerified
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                  : "bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Post Opportunity</span>
            </Link>
            <Link
              href="/dashboard/club/analytics"
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-medium text-xs transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              <span>View Analytics</span>
            </Link>
          </div>
        </div>

        {/* Verification CTA Banner */}
        {!isVerified && !isPending && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/8 border border-amber-500/25"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-amber-400">Verification Required to Publish</p>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Unverified clubs cannot publish official campus opportunities with the SRM trust badge.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/club/verification"
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Request Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        )}

        {isPending && (
          <div className="relative z-10 mt-4 flex items-center gap-2.5 p-3.5 rounded-2xl bg-purple-500/8 border border-purple-500/25">
            <Clock className="w-4 h-4 text-purple-400 shrink-0 animate-pulse" />
            <p className="text-xs text-purple-300 font-medium">
              Verification request is under admin review. You&apos;ll be notified once approved.
            </p>
          </div>
        )}
      </motion.div>

      {/* ── LIVE METRIC OVERVIEW ── */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                whileHover={{ y: -3, scale: 1.01 }}
                className={`group p-5 rounded-2xl ${card.bg} border ${card.border} bg-zinc-900/60 transition-all duration-300 relative overflow-hidden`}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/50 transition-all duration-500" />
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-xl ${card.bg} border border-zinc-800/80 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${card.accent}`} />
                  </div>
                </div>
                <motion.div
                  key={String(card.value)}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`text-2xl font-black ${card.accent} font-mono mb-0.5`}
                >
                  {card.value}
                </motion.div>
                <div className="text-[11px] font-medium text-zinc-400">{card.label}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── OPPORTUNITY MANAGEMENT ── */}
      <motion.div variants={fadeUp} className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
              Opportunity Management
            </h2>
          </div>
          <Link
            href="/dashboard/club/opportunities/new"
            className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
              isVerified ? "text-indigo-400 hover:text-indigo-300" : "text-zinc-500 cursor-not-allowed"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Opportunity</span>
          </Link>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-x-auto scrollbar-none">
          {[
            { id: "published" as const, label: "Published", count: publishedOpps.length, color: "bg-emerald-600 text-white" },
            { id: "drafts" as const, label: "Drafts", count: draftOpps.length, color: "bg-amber-600 text-white" },
            { id: "performance" as const, label: "Performance", count: analytics?.opportunityPerformance.length || 0, color: "bg-purple-600 text-white" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.96 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive ? tab.color : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${isActive ? "bg-white/20" : "bg-zinc-800 text-zinc-500"}`}>
                  {tab.count}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "published" && (
            <motion.div
              key="published"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {publishedOpps.length === 0 ? (
                <ClubEmptyState
                  label="No published opportunities yet."
                  description="Once you publish an opportunity, it will appear here with real-time engagement data."
                  ctaLabel="Post First Opportunity"
                  ctaHref="/dashboard/club/opportunities/new"
                  disabled={!isVerified}
                />
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {publishedOpps.map((opp, i) => (
                      <OpportunityManagementRow key={opp.id} opp={opp} index={i} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "drafts" && (
            <motion.div
              key="drafts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {draftOpps.length === 0 ? (
                <ClubEmptyState
                  label="No draft opportunities."
                  description="Save an opportunity as a draft before publishing it publicly."
                  ctaLabel="Create Draft"
                  ctaHref="/dashboard/club/opportunities/new"
                />
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {draftOpps.map((opp, i) => (
                      <OpportunityManagementRow key={opp.id} opp={opp} index={i} isDraft />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "performance" && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {(analytics?.opportunityPerformance || []).length === 0 ? (
                <ClubEmptyState
                  label="No performance data yet."
                  description="Student engagement and bookmark metrics will appear once you publish opportunities."
                  ctaLabel="Publish Now"
                  ctaHref="/dashboard/club/opportunities/new"
                  disabled={!isVerified}
                />
              ) : (
                <div className="space-y-3">
                  {(analytics?.opportunityPerformance || [])
                    .sort((a, b) => b.savedCount - a.savedCount)
                    .map((opp, i) => (
                      <motion.div
                        key={opp.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                        className="group flex items-center gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all"
                      >
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h3 className="text-xs font-semibold text-zinc-200 truncate group-hover:text-indigo-300 transition-colors">
                            {opp.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                            <span className="capitalize">{opp.type.replace("_", " ")}</span>
                            <span>•</span>
                            <span className={opp.status === "published" ? "text-emerald-400" : "text-amber-400"}>
                              {opp.status}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right font-mono">
                          <div className="text-sm font-bold text-indigo-400">{opp.savedCount}</div>
                          <div className="text-[10px] text-zinc-500">saves</div>
                        </div>
                        <div className="shrink-0 w-24 h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (opp.savedCount / Math.max(...(analytics?.opportunityPerformance || []).map((o) => o.savedCount), 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── QUICK NAVIGATION ── */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              href: "/dashboard/club/opportunities/new",
              icon: Plus,
              label: "Post Opportunity",
              description: isVerified ? "Publish to the SRM student discovery feed." : "Requires verified club status.",
              accent: isVerified ? "group-hover:border-indigo-500/50" : "opacity-60",
              iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
              disabled: !isVerified,
            },
            {
              href: "/dashboard/club/verification",
              icon: FileCheck,
              label: "Verification Status",
              description: isVerified ? "Official SRM verified organization." : isPending ? "Verification under review." : "Submit faculty credentials.",
              accent: "group-hover:border-blue-500/50",
              iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            },
            {
              href: "/dashboard/club/analytics",
              icon: BarChart3,
              label: "Campaign Analytics",
              description: `${analytics?.publishedCount ?? 0} posts • ${analytics?.totalSavedBookmarks ?? 0} student saves`,
              accent: "group-hover:border-purple-500/50",
              iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.disabled ? "#" : item.href}
                className={`group p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 ${item.accent} transition-all duration-200 space-y-3 relative overflow-hidden ${item.disabled ? "pointer-events-none" : ""}`}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/40 transition-all duration-500" />
                <div className={`w-8 h-8 rounded-xl ${item.iconBg} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">{item.label}</h3>
                  <p className="text-[11px] text-zinc-500 font-mono leading-snug">{item.description}</p>
                </div>
                <div className="flex items-center gap-1 text-zinc-500 group-hover:text-indigo-400 transition-colors text-[11px] font-mono">
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* ── TOP SKILLS SECTION ── */}
      {(analytics?.skillDemandDistribution || []).length > 0 && (
        <motion.div variants={fadeUp} className="rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Top Demanded Skills</h2>
            <span className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
              across all published opportunities
            </span>
          </div>
          <div className="space-y-3">
            {analytics!.skillDemandDistribution.slice(0, 6).map((item) => (
              <div key={item.skill} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300">{item.skill}</span>
                  <span className="text-purple-400 font-semibold">{item.count} {item.count === 1 ? "opp" : "opps"}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (item.count / (analytics!.publishedCount || 1)) * 100)}%` }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="h-full bg-purple-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function OpportunityManagementRow({
  opp,
  index,
  isDraft,
}: {
  opp: ClubAnalyticsOverview["opportunityPerformance"][0];
  index: number;
  isDraft?: boolean;
}) {
  const deadlineInfo = getOpportunityDeadlineStatus(opp.deadline);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: "easeOut" }}
      className="group flex items-center gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-indigo-500/30 transition-all relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/50 transition-all duration-500" />

      {/* Status indicator dot */}
      <div className={`shrink-0 w-2 h-2 rounded-full ${isDraft ? "bg-amber-500" : "bg-emerald-500"} shadow-sm`} />

      <div className="flex-1 min-w-0 space-y-0.5">
        <h3 className="text-xs font-semibold text-zinc-200 truncate group-hover:text-indigo-300 transition-colors">
          {opp.title}
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
          <span className="capitalize">{opp.type.replace("_", " ")}</span>
          <span>•</span>
          <span className={opp.status === "published" ? "text-emerald-400" : "text-amber-400"}>
            {opp.status}
          </span>
          <span>•</span>
          <span>{new Date(opp.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>

      {/* Deadline chip */}
      <span className={`shrink-0 text-[11px] font-mono ${deadlineInfo.color}`}>
        {deadlineInfo.label}
      </span>

      {/* Save count */}
      {!isDraft && (
        <span className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-indigo-400">
          <Bookmark className="w-3 h-3" />
          {opp.savedCount}
        </span>
      )}

      {/* View link */}
      <Link
        href={`/opportunities`}
        className="shrink-0 inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-indigo-400 transition-colors font-mono"
        title="View on platform"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}

function ClubEmptyState({
  label,
  description,
  ctaLabel,
  ctaHref,
  disabled,
}: {
  label: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  disabled?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="py-14 px-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-4 max-w-md mx-auto"
    >
      <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center mx-auto">
        <Building2 className="w-6 h-6 text-indigo-400" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-zinc-200">{label}</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
      </div>
      {!disabled && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{ctaLabel}</span>
        </Link>
      )}
    </motion.div>
  );
}
