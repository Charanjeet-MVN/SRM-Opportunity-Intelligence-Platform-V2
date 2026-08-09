"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getPublicOpportunitiesAction } from "@/lib/opportunities/actions";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import OpportunityCardSkeleton from "@/components/opportunities/OpportunityCardSkeleton";
import SmartOpportunitySearchBar from "@/components/opportunities/SmartOpportunitySearchBar";
import { buildFilterOptionsFromParsedQuery, ParsedSearchQuery } from "@/lib/search/queryBuilder";
import { Opportunity, OpportunityType, LocationType } from "@/types";
import { DEPARTMENTS } from "@/lib/constants";
import {
  Compass,
  RefreshCw,
  Plus,
  Search,
  AlertTriangle,
  Check
} from "lucide-react";

const TYPE_FILTERS: { value: OpportunityType | "all"; label: string }[] = [
  { value: "all", label: "All Opportunities" },
  { value: "hackathon", label: "Hackathons" },
  { value: "internship", label: "Internships" },
  { value: "research", label: "Research" },
  { value: "competition", label: "Competitions" },
  { value: "workshop", label: "Workshops" },
  { value: "bootcamp", label: "Bootcamps" },
  { value: "scholarship", label: "Scholarships" },
  { value: "club_recruitment", label: "Club Recruitments" },
  { value: "placement_drive", label: "Placement Drives" },
  { value: "conference", label: "Conferences" },
];

export default function PublicOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [parsedQuery, setParsedQuery] = useState<ParsedSearchQuery>({
    rawQuery: "",
    cleanedKeywords: "",
    extractedBadges: [],
  });

  const [selectedType, setSelectedType] = useState<OpportunityType | "all">("all");
  const [selectedLocation, setSelectedLocation] = useState<LocationType | "all">("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "closing_soon">("newest");
  const [reloadKey, setReloadKey] = useState(0);

  // Query database on state change
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setErrorState(null);

    const baseFilters = {
      type: selectedType === "all" ? undefined : selectedType,
      locationType: selectedLocation === "all" ? undefined : selectedLocation,
      department: selectedDepartment === "all" ? undefined : selectedDepartment,
      skill: skillFilter.trim() || undefined,
      sortBy: sortBy,
    };

    const finalFilters = buildFilterOptionsFromParsedQuery(parsedQuery, baseFilters);

    try {
      const res = await getPublicOpportunitiesAction(finalFilters);
      if (res.error) {
        setErrorState(res.error);
        setOpportunities([]);
        setTotalCount(0);
      } else {
        setOpportunities(res.opportunities || []);
        setTotalCount(res.total || 0);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect to database";
      setErrorState(message);
      setOpportunities([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedLocation, selectedDepartment, skillFilter, parsedQuery, sortBy]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities, reloadKey]);

  const handleSearchChange = (text: string, parsed: ParsedSearchQuery) => {
    setSearchQuery(text);
    setParsedQuery(parsed);
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setParsedQuery({ rawQuery: "", cleanedKeywords: "", extractedBadges: [] });
    setSelectedType("all");
    setSelectedLocation("all");
    setSelectedDepartment("all");
    setSkillFilter("");
    setSortBy("newest");
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedType !== "all" ||
    selectedLocation !== "all" ||
    selectedDepartment !== "all" ||
    Boolean(skillFilter) ||
    sortBy === "closing_soon";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md shadow-2xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs group-hover:border-indigo-500/60 transition-all">
              V2
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-semibold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                SRM Opportunity Intelligence
              </span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase hidden sm:inline">
                Student Discovery Portal
              </span>
            </div>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80 text-xs">
              <Link
                href="/opportunities"
                className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30 flex items-center gap-1.5 shadow-sm"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>Explore</span>
              </Link>
            </div>

            <Link
              href="/dashboard/student"
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-medium text-xs transition-all hover:bg-zinc-800/80"
            >
              Student Workspace
            </Link>

            <Link
              href="/dashboard/club/opportunities/new"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Post Opportunity</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 flex-1 w-full">
        
        {/* Discovery Hero Header */}
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-indigo-400 font-semibold uppercase tracking-wider text-[11px]">
              Opportunity Intelligence
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-100">
            Explore Opportunities
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
            Discover verified hackathons, internships, research programs, competitions, and campus opportunities published by official SRM student organizations and academic departments.
          </p>
        </div>

        {/* Intelligent Search Centerpiece & Filters */}
        <div className="space-y-5 p-5 sm:p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-2xl backdrop-blur-xl">
          
          {/* Main Search Input */}
          <SmartOpportunitySearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={() => handleSearchChange("", { rawQuery: "", cleanedKeywords: "", extractedBadges: [] })}
            isSearching={loading}
          />

          {/* Type Filter Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none pt-1">
            {TYPE_FILTERS.map((filter) => {
              const isSelected = selectedType === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedType(filter.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/50 shadow-sm font-semibold"
                      : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-indigo-400 shrink-0" />}
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>

          {/* Secondary Filter Grid Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-3 border-t border-zinc-800/60">
            {/* Department Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-xs"
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Mode Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Location Mode
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value as LocationType | "all")}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer capitalize text-xs"
              >
                <option value="all">All Locations</option>
                <option value="on_campus">On Campus</option>
                <option value="in_person">In Person</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="off_campus">Off Campus</option>
              </select>
            </div>

            {/* Skill Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Specific Skill
              </label>
              <input
                type="text"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                placeholder="e.g. Python, React..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Sort Order
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "closing_soon")}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-xs"
              >
                <option value="newest">Newest First</option>
                <option value="closing_soon">Closing Soonest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header & Active Filter Count */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-200">
              {totalCount} {totalCount === 1 ? "opportunity" : "opportunities"} available
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Content States: Loading | Error | Empty | Opportunity Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <OpportunityCardSkeleton key={i} />
            ))}
          </div>
        ) : errorState ? (
          /* Error State */
          <div className="py-16 px-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-zinc-200">Unable to load opportunities</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Could not connect to the opportunity database. Please check your network or try again.
              </p>
            </div>
            <button
              onClick={() => setReloadKey((prev) => prev + 1)}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Try Again</span>
            </button>
          </div>
        ) : opportunities.length === 0 ? (
          /* Intentional Empty State */
          <div className="py-16 px-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-center space-y-4 max-w-lg mx-auto shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <Search className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-200">
                No opportunities match your search.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-md mx-auto">
                Try removing a filter or searching for another skill, domain, or opportunity category.
              </p>
            </div>

            {hasActiveFilters && (
              <div className="pt-2 flex items-center justify-center">
                <button
                  onClick={handleClearAll}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Reset Search & Filters</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Opportunity Card Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} SRM Opportunity Intelligence Platform V2</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-zinc-300 transition-colors">
              Home
            </Link>
            <span>•</span>
            <Link href="/dashboard/student" className="hover:text-zinc-300 transition-colors">
              Student Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
