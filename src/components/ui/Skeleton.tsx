import React from "react";

export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-zinc-900/80 border border-zinc-850/80 ${className}`} />
  );
}
