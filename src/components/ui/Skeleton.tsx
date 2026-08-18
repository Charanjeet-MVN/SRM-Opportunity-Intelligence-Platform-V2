import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "rectangular" | "circular" | "text";
}

export default function Skeleton({
  className = "",
  variant = "rectangular",
}: SkeletonProps) {
  const variantClass =
    variant === "circular"
      ? "rounded-full"
      : variant === "text"
      ? "rounded-md h-4"
      : "rounded-2xl";

  return (
    <div
      className={`animate-shimmer bg-zinc-900/90 border border-zinc-800/60 overflow-hidden relative ${variantClass} ${className}`}
    />
  );
}
