import React from "react";
import Link from "next/link";
import { getClubAnalyticsAction } from "@/lib/clubs/analytics";
import { BarChart3, TrendingUp, Users, Bookmark, Sparkles, ShieldCheck, ArrowRight, Layers, Award } from "lucide-react";

export default async function ClubAnalyticsPage() {
  const { analytics, error } = await getClubAnalyticsAction();

  if (error || !analytics) {
    return (
      <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
          <BarChart3 className="w-6 h-6 text-purple-400" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-zinc-200">Analytics Unavailable</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {error || "Create your official SRM club profile to start tracking campaign reach and student engagement."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-indigo-950/40 border border-purple-500/20 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <BarChart3 className="w-3.5 h-3.5" />
          Club Reach & Campaign Intelligence
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          Performance & Student Conversion Metrics
        </h1>
        <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
          Monitor published opportunity reach, student bookmark conversion, department interest, and top requested skill vectors across SRM campus.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Published Opportunities</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {analytics.publishedCount}
          </div>
          <p className="text-[11px] text-zinc-500">Live verified campus posts</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Student Bookmarks</span>
            <Bookmark className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {analytics.totalSavedBookmarks}
          </div>
          <p className="text-[11px] text-zinc-500">Intent saved by students</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Draft Posts</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {analytics.draftCount}
          </div>
          <p className="text-[11px] text-zinc-500">Unpublished drafts</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Engagement Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {analytics.publishedCount > 0
              ? Math.round((analytics.totalSavedBookmarks / analytics.publishedCount) * 10) / 10
              : 0}
            <span className="text-xs font-normal text-zinc-500 ml-1">avg / post</span>
          </div>
          <p className="text-[11px] text-zinc-500">Average student intent</p>
        </div>
      </div>

      {/* Secondary Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Demanded Skill Vectors */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
              Top Requested Skill Prerequisites
            </h2>
            <Award className="w-4 h-4 text-purple-400" />
          </div>

          {analytics.skillDemandDistribution.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 font-mono">
              No skill requirements logged yet.
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.skillDemandDistribution.map((item) => (
                <div key={item.skill} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-200">{item.skill}</span>
                    <span className="text-purple-400 font-semibold">{item.count} posts</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (item.count / (analytics.publishedCount || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Opportunity Performance List */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
              Opportunity Campaign Breakdown
            </h2>
            <Link
              href="/club/opportunities/new"
              className="text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              + Post New
            </Link>
          </div>

          {analytics.opportunityPerformance.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 font-mono">
              No opportunity campaigns created yet.
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.opportunityPerformance.map((opp) => (
                <div
                  key={opp.id}
                  className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-zinc-200 line-clamp-1">{opp.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                      <span className="capitalize">{opp.type.replace("_", " ")}</span>
                      <span>•</span>
                      <span
                        className={`capitalize ${
                          opp.status === "published" ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {opp.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <span className="block font-bold text-purple-400">{opp.savedCount} Saves</span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(opp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
