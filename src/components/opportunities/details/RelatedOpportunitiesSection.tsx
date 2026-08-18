"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Opportunity } from "@/types";
import OpportunityCard from "../OpportunityCard";
import { Layers, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

interface RelatedOpportunitiesSectionProps {
  related: Opportunity[];
  currentType: string;
}

export default function RelatedOpportunitiesSection({
  related,
  currentType,
}: RelatedOpportunitiesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (related.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6 pt-10 border-t border-zinc-800/80">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase font-bold text-indigo-400">
            <Layers className="w-4 h-4" />
            <span>Curated Discoveries</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            Similar {currentType.replace("_", " ")} Opportunities
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll Left"
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors hidden sm:flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll Right"
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors hidden sm:flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <Link
            href="/opportunities"
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-indigo-400 hover:text-indigo-300 border border-zinc-800 flex items-center gap-1.5 transition-colors"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Cards Slider / Grid */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {related.map((opp) => (
          <div
            key={opp.id}
            className="min-w-[300px] sm:min-w-[360px] max-w-[380px] flex-shrink-0 snap-start"
          >
            <OpportunityCard opportunity={opp} />
          </div>
        ))}
      </div>
    </div>
  );
}
