import React from "react";

export default function StudentProfileLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      {/* Top Banner / Hero Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-800 shrink-0" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-44 bg-zinc-800 rounded-lg" />
                <div className="h-5 w-24 bg-zinc-800/70 rounded-full" />
                <div className="h-5 w-16 bg-zinc-800/70 rounded-full" />
              </div>
              <div className="h-3.5 w-48 bg-zinc-850 rounded" />
              <div className="h-3 w-32 bg-zinc-850 rounded" />
            </div>
          </div>

          <div className="w-full md:w-60 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 bg-zinc-800 rounded" />
              <div className="h-3 w-10 bg-zinc-800 rounded" />
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-850" />
            <div className="h-2.5 w-full bg-zinc-850 rounded" />
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
          <div className="h-9 w-48 bg-zinc-800 rounded-xl" />
          <div className="h-9 w-44 bg-zinc-850 rounded-xl" />
        </div>
      </div>

      {/* Profile Signals Metric Preview Skeleton */}
      <div className="p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-850 space-y-2">
            <div className="h-2.5 w-20 bg-zinc-800 rounded" />
            <div className="h-5 w-12 bg-zinc-700 rounded" />
          </div>
        ))}
      </div>

      {/* Form Section 1: Academic Identity */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 space-y-6">
        <div className="h-4 w-40 bg-zinc-800 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-zinc-800 rounded" />
            <div className="h-11 w-full bg-zinc-950 rounded-2xl border border-zinc-800/60" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-28 bg-zinc-800 rounded" />
            <div className="h-11 w-full bg-zinc-950 rounded-2xl border border-zinc-800/60" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-32 bg-zinc-800 rounded" />
            <div className="h-11 w-full bg-zinc-950 rounded-2xl border border-zinc-800/60" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 bg-zinc-800 rounded" />
            <div className="h-11 w-full bg-zinc-950 rounded-2xl border border-zinc-800/60" />
          </div>
        </div>
      </div>

      {/* Form Section 2: Technical Skills Matrix */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 space-y-6">
        <div className="h-4 w-48 bg-zinc-800 rounded" />
        <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800/60">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-8 w-24 bg-zinc-850 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Form Section 3: Opportunity Interests */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 space-y-6">
        <div className="h-4 w-44 bg-zinc-800 rounded" />
        <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800/60">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-8 w-28 bg-zinc-850 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
