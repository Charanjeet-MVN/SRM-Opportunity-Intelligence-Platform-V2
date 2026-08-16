"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Opportunity, StudentProfile } from "@/types";
import OpportunityCard from "./OpportunityCard";
import { calculateOpportunityRelevance } from "@/lib/relevance/scoring";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface DiscoveryCarouselRowProps {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  accentColor?: string;
  opportunities: Opportunity[];
  studentProfile: StudentProfile | null;
  onSelectDetail: (opp: Opportunity) => void;
  viewAllLink?: string;
}

export default function DiscoveryCarouselRow({
  title,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  accentColor = "#6366f1",
  opportunities,
  studentProfile,
  onSelectDetail,
  viewAllLink,
}: DiscoveryCarouselRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    const maxScroll = scrollWidth - clientWidth;
    setScrollProgress(maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0);
  };

  useEffect(() => {
    checkScrollability();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScrollability, { passive: true });
    window.addEventListener("resize", checkScrollability);
    return () => {
      el.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [opportunities]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!opportunities || opportunities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 py-3">
      {/* Row Header */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div
              className="p-1.5 rounded-xl border flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: `${accentColor}18`,
                borderColor: `${accentColor}40`,
                color: accentColor,
              }}
            >
              <Icon className="w-4 h-4" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-zinc-100 font-sans tracking-tight">
              {title}
            </h3>

            {badge && (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${badgeColor}`}>
                {badge}
              </span>
            )}

            <span className="text-xs font-mono text-zinc-500">
              ({opportunities.length})
            </span>
          </div>

          {subtitle && (
            <p className="text-xs text-zinc-400 font-sans font-light">
              {subtitle}
            </p>
          )}
        </div>

        {/* Navigation Arrows & View All */}
        <div className="flex items-center gap-2 shrink-0">
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 hidden sm:flex items-center gap-1 transition-colors mr-2"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Left Arrow Button */}
          <button
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md cursor-pointer backdrop-blur-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md cursor-pointer backdrop-blur-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {opportunities.map((opp) => {
            const relevance = studentProfile
              ? calculateOpportunityRelevance(studentProfile, opp)
              : undefined;

            return (
              <div
                key={opp.id}
                className="w-[310px] sm:w-[360px] shrink-0 snap-start h-full"
              >
                <OpportunityCard
                  opportunity={opp}
                  relevance={relevance}
                  onSelectDetail={onSelectDetail}
                />
              </div>
            );
          })}
        </div>

        {/* Scroll Progress Sub-Bar */}
        <div className="w-full bg-zinc-900/80 h-1 rounded-full overflow-hidden mt-1 px-1">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.max(15, scrollProgress)}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}
