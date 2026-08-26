import React from "react";

export default function OpportunityDetailLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 animate-pulse">
      {/* Header bar skeleton */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/80 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="w-48 h-4 rounded-lg bg-zinc-900" />
          <div className="w-28 h-8 rounded-xl bg-zinc-900" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
        {/* 1. Hero Skeleton */}
        <div className="rounded-[32px] sm:rounded-[36px] bg-zinc-900/40 border border-zinc-800 p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-24 h-6 rounded-full bg-zinc-800" />
            <div className="w-32 h-6 rounded-full bg-zinc-800" />
            <div className="w-28 h-6 rounded-full bg-zinc-800" />
          </div>

          <div className="space-y-3 max-w-3xl">
            <div className="w-full h-10 sm:h-14 rounded-2xl bg-zinc-800" />
            <div className="w-3/4 h-10 sm:h-14 rounded-2xl bg-zinc-800/60" />
          </div>

          <div className="w-1/2 h-5 rounded-lg bg-zinc-800/50" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-zinc-800/80">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-zinc-900/80" />
            ))}
          </div>
        </div>

        {/* 2. Two Column Architecture Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Summary Skeleton */}
            <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800 p-6 sm:p-8 space-y-4">
              <div className="w-44 h-5 rounded-lg bg-zinc-800" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-zinc-900/80" />
                ))}
              </div>
            </div>

            {/* Eligibility Matrix Skeleton */}
            <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800 p-6 sm:p-8 space-y-4">
              <div className="w-56 h-6 rounded-lg bg-zinc-800" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="h-32 rounded-2xl bg-zinc-900/80" />
                <div className="h-32 rounded-2xl bg-zinc-900/80" />
              </div>
            </div>

            {/* Storytelling Skeleton */}
            <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800 p-6 sm:p-8 space-y-4">
              <div className="w-48 h-5 rounded-lg bg-zinc-800" />
              <div className="space-y-3 pt-2">
                <div className="w-full h-4 rounded bg-zinc-900" />
                <div className="w-full h-4 rounded bg-zinc-900" />
                <div className="w-3/4 h-4 rounded bg-zinc-900" />
              </div>
            </div>
          </div>

          {/* Decision Sidebar Skeleton */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800 p-6 sm:p-7 space-y-6">
              <div className="w-36 h-4 rounded bg-zinc-800" />
              <div className="h-20 rounded-2xl bg-zinc-900" />
              <div className="h-36 rounded-2xl bg-zinc-900" />
              <div className="h-12 rounded-2xl bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
