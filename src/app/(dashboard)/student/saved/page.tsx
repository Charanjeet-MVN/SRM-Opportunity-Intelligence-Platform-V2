import React from "react";
import Link from "next/link";
import { getSavedOpportunitiesAction } from "@/lib/engagement/actions";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import BookmarkButton from "@/components/opportunities/BookmarkButton";
import { Bookmark, Sparkles, ArrowRight, Layers } from "lucide-react";

export default async function SavedOpportunitiesPage() {
  const { savedOpportunities, error } = await getSavedOpportunitiesAction();

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-purple-950/30 border border-zinc-800/80 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Bookmark className="w-3.5 h-3.5" />
          Student Bookmarks
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          Saved Opportunities
        </h1>
        <p className="text-xs text-zinc-400 max-w-xl">
          Keep track of upcoming hackathon deadlines, internship applications, and workshops you want to participate in.
        </p>
      </div>

      {/* Opportunities List or Zero Data State */}
      {savedOpportunities.length === 0 ? (
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-zinc-200">No Saved Opportunities Yet</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              When you find interesting opportunities in the public feed, click the bookmark icon to save them here for quick access.
            </p>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md transition-all"
          >
            <span>Browse Opportunities Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedOpportunities.map((opp) => (
            <div key={opp.id} className="relative group">
              <div className="absolute top-4 right-4 z-10">
                <BookmarkButton opportunityId={opp.id} initialIsSaved={true} />
              </div>
              <OpportunityCard opportunity={opp} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
