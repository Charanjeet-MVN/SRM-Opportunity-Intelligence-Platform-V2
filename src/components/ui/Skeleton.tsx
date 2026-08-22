import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "rectangular" | "circular" | "text" | "card" | "metric" | "button";
  lines?: number;
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  lines = 1,
  ...props
}: SkeletonProps) {
  if (variant === "text" && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className={`animate-shimmer bg-zinc-900/80 border border-zinc-800/40 rounded-md h-3.5 ${
              idx === lines - 1 ? "w-3/4" : "w-full"
            }`}
          />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`rounded-2xl bg-zinc-950/80 border border-zinc-800/60 p-5 space-y-4 ${className}`}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="animate-shimmer bg-zinc-900/80 rounded-full h-5 w-24 border border-zinc-800/40" />
          <div className="animate-shimmer bg-zinc-900/80 rounded-full h-5 w-16 border border-zinc-800/40" />
        </div>
        <div className="space-y-2">
          <div className="animate-shimmer bg-zinc-900/80 rounded-md h-5 w-4/5 border border-zinc-800/40" />
          <div className="animate-shimmer bg-zinc-900/80 rounded-md h-3.5 w-full border border-zinc-800/40" />
        </div>
        <div className="pt-3 border-t border-zinc-800/40 flex items-center justify-between">
          <div className="animate-shimmer bg-zinc-900/80 rounded-md h-4 w-28 border border-zinc-800/40" />
          <div className="animate-shimmer bg-zinc-900/80 rounded-lg h-7 w-20 border border-zinc-800/40" />
        </div>
      </div>
    );
  }

  if (variant === "metric") {
    return (
      <div
        className={`rounded-xl bg-zinc-950/70 border border-zinc-800/60 p-4 space-y-3 ${className}`}
        {...props}
      >
        <div className="animate-shimmer bg-zinc-900/80 rounded-md h-3.5 w-20 border border-zinc-800/40" />
        <div className="animate-shimmer bg-zinc-900/80 rounded-md h-7 w-16 border border-zinc-800/40" />
        <div className="animate-shimmer bg-zinc-900/80 rounded-md h-3 w-32 border border-zinc-800/40" />
      </div>
    );
  }

  const variantClass =
    variant === "circular"
      ? "rounded-full"
      : variant === "text"
      ? "rounded-md h-4 w-full"
      : variant === "button"
      ? "rounded-xl h-9 w-24"
      : "rounded-xl";

  return (
    <div
      className={`animate-shimmer bg-zinc-900/80 border border-zinc-800/40 overflow-hidden relative ${variantClass} ${className}`}
      {...props}
    />
  );
}

export default Skeleton;
