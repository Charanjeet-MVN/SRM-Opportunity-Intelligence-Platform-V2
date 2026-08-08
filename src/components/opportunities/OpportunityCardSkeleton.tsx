import React from "react";

export default function OpportunityCardSkeleton() {
  return (
    <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-24 h-5 rounded-full bg-zinc-800" />
        <div className="w-16 h-5 rounded-md bg-zinc-800" />
      </div>

      <div className="space-y-2">
        <div className="w-3/4 h-5 rounded-md bg-zinc-800" />
        <div className="w-1/2 h-3 rounded-md bg-zinc-800/80" />
      </div>

      <div className="w-full h-10 rounded-md bg-zinc-800/50" />

      <div className="flex gap-2 pt-1">
        <div className="w-16 h-4 rounded bg-zinc-800/60" />
        <div className="w-16 h-4 rounded bg-zinc-800/60" />
        <div className="w-16 h-4 rounded bg-zinc-800/60" />
      </div>

      <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
        <div className="w-20 h-4 rounded bg-zinc-800/60" />
        <div className="w-12 h-4 rounded bg-zinc-800" />
      </div>
    </div>
  );
}
