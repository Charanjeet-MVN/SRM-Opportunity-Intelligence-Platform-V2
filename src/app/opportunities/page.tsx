"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicOpportunitiesAction } from "@/lib/opportunities/actions";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import OpportunityCardSkeleton from "@/components/opportunities/OpportunityCardSkeleton";
import SmartOpportunitySearchBar from "@/components/opportunities/SmartOpportunitySearchBar";
import { parseSmartSearchQuery, buildFilterOptionsFromParsedQuery, ParsedSearchQuery } from "@/lib/search/queryBuilder";
import { Opportunity, OpportunityType, LocationType } from "@/types";
import { DEPARTMENTS } from "@/lib/constants";
import { Compass, SlidersHorizontal, RefreshCw, Layers, MapPin, Building2, ShieldCheck, Plus, X, Search, Sparkles } from "lucide-react";

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

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [parsedQuery, setParsedQuery] = useState<ParsedSearchQuery>({ rawQuery: "", cleanedKeywords: "", extractedBadges: [] });
  
  const [selectedType, setSelectedType] = useState<OpportunityType | "all">("all");
  const [selectedLocation, setSelectedLocation] = useState<LocationType | "all">("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "closing_soon">("newest");

  // Run real database query on state change
  useEffect(() => {
    setLoading(true);

    const baseFilters = {
      type: selectedType === "all" ? undefined : selectedType,
      locationType: selectedLocation === "all" ? undefined : selectedLocation,
      department: selectedDepartment === "all" ? undefined : selectedDepartment,
      skill: skillFilter.trim() || undefined,
      sortBy: sortBy,
    };

    const finalFilters = buildFilterOptionsFromParsedQuery(parsedQuery, baseFilters);

    getPublicOpportunitiesAction(finalFilters).then((res) => {
      setOpportunities(res.opportunities || []);
      setTotalCount(res.total || 0);
      setLoading(false);
    });
  }, [selectedType, selectedLocation, selectedDepartment, skillFilter, searchQuery, parsedQuery, sortBy]);

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-purple-500/30">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 p-0.5 flex items-center justify-center shrink-0"
            >
              <div className="w-full h-full bg-indigo-500/20 text-indigo-400 rounded-[10px] flex items-center justify-center font-bold text-xs">
                V2
              </div>
            </Link>
            <span className="font-semibold text-xs uppercase tracking-wider text-zinc-200 hidden sm:inline">
              SRM Opportunity Intelligence Platform
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/student"
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-medium text-xs transition-all"
            >
              Student Workspace
            </Link>
            <Link
              href="/dashboard/club/opportunities/new"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Post Opportunity</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Title Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Compass className="w-3.5 h-3.5" />
            <span>Structured Opportunity Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Explore Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Search verified hackathons, internships, research projects, and club recruitments published by official SRM campus organizations.
          </p>
        </div>

        {/* Intelligent Search Bar & Filter Controls */}
        <div className="space-y-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
          {/* Smart Search Bar */}
          <SmartOpportunitySearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={() => handleSearchChange("", { rawQuery: "", cleanedKeywords: "", extractedBadges: [] })}
            isSearching={loading}
          />

          {/* Structured Filter Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2 border-t border-zinc-800/60">
            {/* Department Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400 uppercase">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
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
              <label className="text-[11px] font-mono text-zinc-400 uppercase">Location Mode</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value as LocationType | "all")}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer capitalize"
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
              <label className="text-[11px] font-mono text-zinc-400 uppercase">Specific Skill</label>
              <input
                type="text"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                placeholder="e.g. Python, React..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono text-xs"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400 uppercase">Sort Order</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "closing_soon")}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="closing_soon">Closing Soonest</option>
              </select>
            </div>
          </div>

          {/* Type Filter Selectable Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
            {TYPE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedType(filter.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedType === filter.value
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm"
                    : "bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Search & Result Count Header */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-200">
              {totalCount} {totalCount === 1 ? "opportunity" : "opportunities"} matching your search
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Opportunity Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <OpportunityCardSkeleton key={i} />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="py-16 px-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 text-purple-400" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-zinc-200">No opportunities match your search.</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Try removing a filter or searching for another skill, domain, or opportunity category.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium text-xs transition-all cursor-pointer"
              >
                Clear Search & Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
