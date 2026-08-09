import React from "react";

export default function OpportunityCardSkeleton() {
  return (
    <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-5 sm:p-6 space-y-4 animate-pulse flex flex-col justify-between">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="w-24 h-5 rounded-full bg-zinc-800/80" />
          <div className="w-16 h-5 rounded-md bg-zinc-800/80" />
        </div>

        <div className="space-y-2">
          <div className="w-4/5 h-5 rounded-md bg-zinc-800/90" />
          <div className="w-1/2 h-3 rounded-md bg-zinc-800/60" />
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="w-full h-3.5 rounded bg-zinc-800/40" />
          <div className="w-3/4 h-3.5 rounded bg-zinc-800/40" />
        </div>

        <div className="flex gap-1.5 pt-1">
          <div className="w-14 h-4 rounded bg-zinc-800/60" />
          <div className="w-16 h-4 rounded bg-zinc-800/60" />
          <div className="w-12 h-4 rounded bg-zinc-800/60" />
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
        <div className="w-24 h-4 rounded bg-zinc-800/50" />
        <div className="w-14 h-4 rounded bg-zinc-800/70" />
      </div>
    </div>
  );
}
