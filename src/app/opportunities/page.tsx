"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getPersonalizedFeedAction } from "@/lib/opportunities/actions";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import OpportunityCardSkeleton from "@/components/opportunities/OpportunityCardSkeleton";
import NaturalLanguageSearchBar from "@/components/opportunities/NaturalLanguageSearchBar";
import { Opportunity, OpportunityType, LocationType } from "@/types";
import { RelevanceScoreResult } from "@/lib/relevance/scoring";
import { DEPARTMENTS } from "@/lib/constants";
import { Sparkles, Compass, SlidersHorizontal, ArrowLeft, RefreshCw } from "lucide-react";

const TYPE_FILTERS: { value: OpportunityType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "hackathon", label: "Hackathons" },
  { value: "internship", label: "Internships" },
  { value: "research", label: "Research Grants" },
  { value: "competition", label: "Competitions" },
  { value: "workshop", label: "Workshops" },
  { value: "bootcamp", label: "Bootcamps" },
  { value: "scholarship", label: "Scholarships" },
  { value: "club_recruitment", label: "Club Recruitments" },
  { value: "placement_drive", label: "Placement Drives" },
];

export default function PublicOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<
    (Opportunity & { relevance?: RelevanceScoreResult })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<OpportunityType | "all">("all");
  const [selectedLocation, setSelectedLocation] = useState<LocationType | "all">("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"relevance" | "newest" | "closing_soon">("relevance");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    getPersonalizedFeedAction({
      type: selectedType === "all" ? undefined : selectedType,
      locationType: selectedLocation === "all" ? undefined : selectedLocation,
      department: selectedDepartment === "all" ? undefined : selectedDepartment,
      search: searchQuery || undefined,
      sortBy: sortBy,
    }).then((res) => {
      setOpportunities(res.opportunities || []);
      setLoading(false);
    });
  }, [selectedType, selectedLocation, selectedDepartment, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-purple-500/30">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 p-0.5 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20"
            >
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
            </Link>
            <span className="font-semibold text-sm tracking-tight text-zinc-100 hidden sm:inline">
              SRM Opportunity Intelligence Platform
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/student"
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md shadow-purple-600/20 transition-all"
            >
              Student Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header Hero */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Compass className="w-3.5 h-3.5" />
            AI-Ranked Campus Feed
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">
            Verified Opportunities & Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Real-time feed of hackathons, internships, research grants, and club drives automatically scored and prioritized against your academic vector.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-4">
          <NaturalLanguageSearchBar
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            onClear={() => setSearchQuery("")}
          />

          {/* Controls bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
            {/* Sort & Location Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Sort By Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 shrink-0">
                <span className="px-2 text-[10px] font-mono text-zinc-500 uppercase">Sort:</span>
                {(["relevance", "newest", "closing_soon"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                      sortBy === s
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* Location Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 shrink-0">
                <span className="px-2 text-[10px] font-mono text-zinc-500 uppercase">Mode:</span>
                {(["all", "in_person", "virtual", "hybrid"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedLocation(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                      selectedLocation === mode
                        ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {mode.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Department Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TYPE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedType(filter.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedType === filter.value
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Opportunity Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <OpportunityCardSkeleton key={i} />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="py-20 px-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6 text-purple-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-zinc-200">No Matching Opportunities</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                No active SRM opportunities match your current filters or query. Try resetting your search terms.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedType("all");
                setSelectedLocation("all");
                setSelectedDepartment("all");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium text-xs transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} relevance={opp.relevance} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
