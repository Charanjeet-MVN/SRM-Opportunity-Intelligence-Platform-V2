"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Opportunity,
  OpportunityType,
  LocationType,
  StudentProfile,
} from "@/types";
import { DEPARTMENTS } from "@/lib/constants";
import DiscoverySearchBar from "./DiscoverySearchBar";
import DiscoveryCategoryPills, {
  CATEGORY_PILL_CONFIGS,
} from "./DiscoveryCategoryPills";
import DiscoveryCarouselRow from "./DiscoveryCarouselRow";
import DiscoveryEmptyState from "./DiscoveryEmptyState";
import OpportunityCard from "./OpportunityCard";
import { OpportunityDetailModal } from "./OpportunityDetailModal";
import { MobileFilterDrawer } from "./MobileFilterDrawer";
import { calculateOpportunityRelevance } from "@/lib/relevance/scoring";
import { ParsedSearchQuery } from "@/lib/search/queryBuilder";

// Redesigned Event Experience Components
import FeaturedEventHero from "./events/FeaturedEventHero";
import EventTimelineRadar from "./events/EventTimelineRadar";

import {
  Sparkles,
  Trophy,
  Briefcase,
  FlaskConical,
  Award,
  Target,
  Rocket,
  Flame,
  Clock,
  LayoutGrid,
  Rows3,
  RefreshCw,
  SlidersHorizontal,
  ShieldCheck,
  Compass,
  Layers,
  UserCheck,
  ArrowRight,
  X,
  Filter,
  CheckCircle2,
} from "lucide-react";

interface OpportunityDiscoveryHubProps {
  initialOpportunities: Opportunity[];
  studentProfile: StudentProfile | null;
}

type DiscoveryTab = "for_you" | "all" | "categories";
type SortOption = "relevance" | "closing_soon" | "newest" | "popular";

export default function OpportunityDiscoveryHub({
  initialOpportunities = [],
  studentProfile,
}: OpportunityDiscoveryHubProps) {
  const opportunities = initialOpportunities;

  // Active Discovery Conceptual Tab
  const [activeTab, setActiveTab] = useState<DiscoveryTab>("all");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<OpportunityType | "all">("all");
  const [selectedLocation, setSelectedLocation] = useState<LocationType | "all">("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("");
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [onlyUrgent, setOnlyUrgent] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>(
    studentProfile ? "relevance" : "newest"
  );

  // View Mode for 'All Opportunities': 'discovery' (Curated rows) vs 'grid' (Responsive grid)
  const [viewMode, setViewMode] = useState<"discovery" | "grid">("grid");

  // Desktop advanced filter panel toggle
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Modal & Drawer State
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Handle Search Input & Natural Language Detection
  const handleSearchChange = (query: string, parsed?: ParsedSearchQuery) => {
    setSearchQuery(query);
    if (parsed) {
      if (parsed.detectedType && selectedType === "all") {
        setSelectedType(parsed.detectedType);
      }
      if (parsed.detectedDepartment && selectedDepartment === "all") {
        setSelectedDepartment(parsed.detectedDepartment);
      }
      if (parsed.detectedSkill && !skillFilter) {
        setSkillFilter(parsed.detectedSkill);
      }
      if (parsed.detectedLocation && selectedLocation === "all") {
        setSelectedLocation(parsed.detectedLocation);
      }
      if (parsed.detectedSortBy && sortBy !== "closing_soon") {
        setSortBy(parsed.detectedSortBy);
      }
    }
  };

  // Filtered Opportunities computation
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // 1. Search Query Filter (Title, description, summary, organizer club, skills, type)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = opp.title.toLowerCase().includes(q);
        const inSummary = opp.summary?.toLowerCase().includes(q);
        const inDesc = opp.description.toLowerCase().includes(q);
        const inClub = opp.club?.name.toLowerCase().includes(q);
        const inSkills = (opp.requiredSkills || []).some((s) =>
          s.toLowerCase().includes(q)
        );
        const inType = opp.type.toLowerCase().includes(q);
        if (!inTitle && !inSummary && !inDesc && !inClub && !inSkills && !inType) {
          return false;
        }
      }

      // 2. Type Filter
      if (selectedType !== "all" && opp.type !== selectedType) {
        return false;
      }

      // 3. Location Filter
      if (selectedLocation !== "all" && opp.locationType !== selectedLocation) {
        return false;
      }

      // 4. Department Filter
      if (selectedDepartment !== "all") {
        if (
          opp.eligibleDepartments &&
          opp.eligibleDepartments.length > 0 &&
          !opp.eligibleDepartments.includes("All Departments") &&
          !opp.eligibleDepartments.includes(selectedDepartment)
        ) {
          return false;
        }
      }

      // 5. Skill Filter
      if (skillFilter.trim()) {
        const s = skillFilter.toLowerCase().trim();
        if (
          !(opp.requiredSkills || []).some((skill) =>
            skill.toLowerCase().includes(s)
          )
        ) {
          return false;
        }
      }

      // 6. Verified Organizer Filter
      if (onlyVerified && opp.club?.verificationStatus !== "verified") {
        return false;
      }

      // 7. Urgent Deadline Filter (Closing within 7 days)
      if (onlyUrgent) {
        if (!opp.applicationDeadline) return false;
        const diffMs =
          new Date(opp.applicationDeadline).getTime() - Date.now();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays < 0 || diffDays > 7) return false;
      }

      return true;
    });
  }, [
    opportunities,
    searchQuery,
    selectedType,
    selectedLocation,
    selectedDepartment,
    skillFilter,
    onlyVerified,
    onlyUrgent,
  ]);

  // Precompute Deterministic Relevance for Each Opportunity
  const opportunitiesWithRelevance = useMemo(() => {
    return filteredOpportunities.map((opp) => {
      const relevance = studentProfile
        ? calculateOpportunityRelevance(studentProfile, opp)
        : undefined;
      return { opportunity: opp, relevance };
    });
  }, [filteredOpportunities, studentProfile]);

  // Sorted Opportunities
  const sortedOpportunities = useMemo(() => {
    const list = [...opportunitiesWithRelevance];

    if (sortBy === "relevance" && studentProfile) {
      return list.sort((a, b) => {
        const scoreA = a.relevance?.totalScore || 0;
        const scoreB = b.relevance?.totalScore || 0;
        return scoreB - scoreA;
      });
    }

    if (sortBy === "closing_soon") {
      return list.sort((a, b) => {
        const timeA = a.opportunity.applicationDeadline
          ? new Date(a.opportunity.applicationDeadline).getTime()
          : Infinity;
        const timeB = b.opportunity.applicationDeadline
          ? new Date(b.opportunity.applicationDeadline).getTime()
          : Infinity;
        return timeA - timeB;
      });
    }

    if (sortBy === "popular") {
      return list.sort(
        (a, b) =>
          (b.opportunity.currentParticipants || 0) -
          (a.opportunity.currentParticipants || 0)
      );
    }

    // Default newest
    return list.sort(
      (a, b) =>
        new Date(b.opportunity.createdAt).getTime() -
        new Date(a.opportunity.createdAt).getTime()
    );
  }, [opportunitiesWithRelevance, sortBy, studentProfile]);

  // For You Recommendations Feed (Prioritized by deterministic relevance)
  const forYouOpportunities = useMemo(() => {
    if (!studentProfile) return [];
    return [...opportunitiesWithRelevance]
      .filter((item) => (item.relevance?.totalScore || 0) >= 30)
      .sort(
        (a, b) =>
          (b.relevance?.totalScore || 0) - (a.relevance?.totalScore || 0)
      );
  }, [opportunitiesWithRelevance, studentProfile]);

  // Category counts from full database
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: opportunities.length };
    opportunities.forEach((o) => {
      counts[o.type] = (counts[o.type] || 0) + 1;
    });
    return counts;
  }, [opportunities]);

  // Curated Featured Opportunities for the Hero Banner
  const featuredOpportunities = useMemo(() => {
    return opportunities.slice(0, 5);
  }, [opportunities]);

  // Curated Discovery Rows for 'Curated Horizon' view
  const trendingNow = useMemo(() => {
    return [...opportunities]
      .sort(
        (a, b) =>
          (b.currentParticipants || 0) - (a.currentParticipants || 0)
      )
      .slice(0, 8);
  }, [opportunities]);

  const upcomingThisWeek = useMemo(() => {
    const now = Date.now();
    return opportunities
      .filter((o) => {
        if (!o.applicationDeadline) return false;
        const diff = new Date(o.applicationDeadline).getTime() - now;
        return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
      })
      .slice(0, 8);
  }, [opportunities]);

  const hackathons = useMemo(
    () => opportunities.filter((o) => o.type === "hackathon"),
    [opportunities]
  );
  const internships = useMemo(
    () =>
      opportunities.filter(
        (o) => o.type === "internship" || o.type === "placement_drive"
      ),
    [opportunities]
  );
  const researchOpps = useMemo(
    () => opportunities.filter((o) => o.type === "research"),
    [opportunities]
  );
  const scholarships = useMemo(
    () => opportunities.filter((o) => o.type === "scholarship"),
    [opportunities]
  );
  const competitions = useMemo(
    () => opportunities.filter((o) => o.type === "competition"),
    [opportunities]
  );
  const workshops = useMemo(
    () =>
      opportunities.filter(
        (o) => o.type === "workshop" || o.type === "bootcamp"
      ),
    [opportunities]
  );

  const handleSelectDetail = useCallback((opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setIsDetailModalOpen(true);
  }, []);

  const handleResetAll = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedLocation("all");
    setSelectedDepartment("all");
    setSkillFilter("");
    setOnlyVerified(false);
    setOnlyUrgent(false);
    setSortBy(studentProfile ? "relevance" : "newest");
  };

  // Active filter count computation
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim().length > 0) count++;
    if (selectedType !== "all") count++;
    if (selectedLocation !== "all") count++;
    if (selectedDepartment !== "all") count++;
    if (skillFilter.trim().length > 0) count++;
    if (onlyVerified) count++;
    if (onlyUrgent) count++;
    return count;
  }, [
    searchQuery,
    selectedType,
    selectedLocation,
    selectedDepartment,
    skillFilter,
    onlyVerified,
    onlyUrgent,
  ]);

  const isFilteringActive = activeFiltersCount > 0;

  // Auto-switch to grid view if filters are activated while on Curated Horizon
  useEffect(() => {
    if (isFilteringActive && viewMode === "discovery" && activeTab === "all") {
      setViewMode("grid");
    }
  }, [isFilteringActive, viewMode, activeTab]);

  return (
    <div className="space-y-10 font-sans text-zinc-100 pb-16">
      {/* ── 1. HEADER SECTION ── */}
      <header className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 mb-1">
              <Compass className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>SOIP Opportunity Engine</span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-bold font-mono">
                {opportunities.length} Verified Listings
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              Discover Opportunities
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-2xl">
              Find opportunities that match your interests, skills, and goals.
            </p>
          </div>

          {/* Quick Profile Summary Badge if Available */}
          {studentProfile && (
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 flex items-center gap-3 self-start sm:self-auto shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="font-mono text-xs">
                <span className="text-zinc-200 font-bold block truncate max-w-[160px]">
                  {studentProfile.fullName || "Student Pilot"}
                </span>
                <span className="text-[10px] text-zinc-500 block truncate">
                  {studentProfile.department || "SRM Student"} • Yr {studentProfile.yearOfStudy || 1}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── 2. FEATURED EVENT BANNER (Shown when no filters active on All tab) ── */}
      {featuredOpportunities.length > 0 &&
        !isFilteringActive &&
        activeTab === "all" &&
        viewMode === "discovery" && (
          <FeaturedEventHero
            featuredOpportunities={featuredOpportunities}
            studentProfile={studentProfile}
            onSelectDetail={handleSelectDetail}
          />
        )}

      {/* ── 3. SEARCH & DISCOVERY COMMAND HUB ── */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950/85 border border-zinc-800/85 p-6 sm:p-7 space-y-6 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />

        {/* Search Bar Input Container */}
        <div className="relative z-10">
          <DiscoverySearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={() => setSearchQuery("")}
            onOpenMobileFilters={() => setIsMobileDrawerOpen(true)}
            activeFilterCount={activeFiltersCount}
            resultCount={sortedOpportunities.length}
          />
        </div>

        {/* ── 4. CONCEPTUAL DISCOVERY TABS ── */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 border-t border-zinc-900">
          {/* Main Discovery Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 font-mono self-start sm:self-auto shadow-inner">
            {/* Tab 1: FOR YOU */}
            <button
              type="button"
              onClick={() => setActiveTab("for_you")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "for_you"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>For You</span>
              {studentProfile && forYouOpportunities.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    activeTab === "for_you"
                      ? "bg-white/20 text-white"
                      : "bg-indigo-500/20 text-indigo-300"
                  }`}
                >
                  {forYouOpportunities.length}
                </span>
              )}
            </button>

            {/* Tab 2: ALL OPPORTUNITIES */}
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>All Opportunities</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  activeTab === "all"
                    ? "bg-white/20 text-white"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {filteredOpportunities.length}
              </span>
            </button>

            {/* Tab 3: CATEGORIES */}
            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "categories"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Categories</span>
            </button>
          </div>

          {/* Right Controls: Filter Toggle, Sort Dropdown & View Mode Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap font-mono text-xs">
            {/* Desktop Filter Panel Toggle */}
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen((prev) => !prev)}
              className={`hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                isFilterPanelOpen || isFilteringActive
                  ? "bg-indigo-600/20 text-indigo-200 border-indigo-500/50"
                  : "bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sorting Select */}
            <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-xl px-2 py-1">
              <span className="text-[10px] text-zinc-500 uppercase hidden sm:inline pl-1">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort opportunities list"
                className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer pr-1 py-1 font-mono"
              >
                {studentProfile && (
                  <option value="relevance">Most Relevant</option>
                )}
                <option value="closing_soon">Deadline Soonest</option>
                <option value="newest">Recently Published</option>
                <option value="popular">Most Active</option>
              </select>
            </div>

            {/* View Mode Switcher (Curated Horizon vs Grid) for All Tab */}
            {activeTab === "all" && !isFilteringActive && (
              <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setViewMode("discovery")}
                  aria-label="Curated Horizon View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "discovery"
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="Curated Rows Horizon"
                >
                  <Rows3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="3D Responsive Grid"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category Pills Strip (Quick filter) */}
        {activeTab !== "categories" && (
          <div className="relative z-10 pt-1">
            <DiscoveryCategoryPills
              selectedType={selectedType}
              onSelectType={(t) => setSelectedType(t)}
              categoryCounts={categoryCounts}
            />
          </div>
        )}
      </div>

      {/* ── 5. DESKTOP ADVANCED FILTER PANEL (Collapsible) ── */}
      <AnimatePresence>
        {isFilterPanelOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 shadow-xl backdrop-blur-xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-zinc-300 font-bold">
                  <Filter className="w-4 h-4 text-indigo-400" />
                  <span className="uppercase tracking-wider text-[11px]">
                    Granular Filter Controls
                  </span>
                </div>

                {isFilteringActive && (
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Department Select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                    Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-xs font-sans"
                  >
                    <option value="all">All Departments</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Mode */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                    Location Mode
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) =>
                      setSelectedLocation(e.target.value as LocationType | "all")
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer capitalize text-xs font-sans"
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
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                    Specific Skill
                  </label>
                  <input
                    type="text"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    placeholder="e.g. PyTorch, React, SQL..."
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-sans"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={onlyVerified}
                      onChange={(e) => setOnlyVerified(e.target.checked)}
                      className="rounded bg-zinc-900 border-zinc-800 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="flex items-center gap-1 font-sans text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Verified SRM Clubs Only
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={onlyUrgent}
                      onChange={(e) => setOnlyUrgent(e.target.checked)}
                      className="rounded bg-zinc-900 border-zinc-800 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-sans text-xs">
                      Urgent Deadlines (7 Days)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 6. ACTIVE FILTER PILL STRIP (Instant feedback with Clear All) ── */}
      {isFilteringActive && (
        <div className="flex items-center gap-2 flex-wrap font-mono text-xs pt-1 px-1">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">
            Active Filters:
          </span>

          {searchQuery && (
            <span className="px-3 py-1 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <span>Query: &ldquo;{searchQuery}&rdquo;</span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Remove search query filter"
                className="hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedType !== "all" && (
            <span className="px-3 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 capitalize">
              <span>Type: {selectedType.replace("_", " ")}</span>
              <button
                type="button"
                onClick={() => setSelectedType("all")}
                aria-label="Remove type filter"
                className="hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedDepartment !== "all" && (
            <span className="px-3 py-1 rounded-xl bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
              <span>Dept: {selectedDepartment}</span>
              <button
                type="button"
                onClick={() => setSelectedDepartment("all")}
                aria-label="Remove department filter"
                className="hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedLocation !== "all" && (
            <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 capitalize">
              <span>Mode: {selectedLocation.replace("_", " ")}</span>
              <button
                type="button"
                onClick={() => setSelectedLocation("all")}
                aria-label="Remove location filter"
                className="hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {skillFilter && (
            <span className="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <span>Skill: {skillFilter}</span>
              <button
                type="button"
                onClick={() => setSkillFilter("")}
                aria-label="Remove skill filter"
                className="hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {onlyVerified && (
            <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span>Verified Only</span>
              <button
                type="button"
                onClick={() => setOnlyVerified(false)}
                aria-label="Remove verified only filter"
                className="hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {onlyUrgent && (
            <span className="px-3 py-1 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
              <span>Urgent Deadlines</span>
              <button
                type="button"
                onClick={() => setOnlyUrgent(false)}
                aria-label="Remove urgent filter"
                className="hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetAll}
            className="text-xs text-zinc-400 hover:text-white underline underline-offset-2 ml-2 transition-colors cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── 7. TAB CONTENT RENDERING ── */}

      {/* TAB 1: FOR YOU (Relevance Engine Prioritized) */}
      {activeTab === "for_you" && (
        <div className="space-y-8">
          {/* Profile Context Bar / Onboarding CTA */}
          {!studentProfile ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-zinc-950/80 border border-indigo-500/30 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Personalized Opportunity Matching</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Unlock Tailored Matches for Your Skills & Branch
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                  Sign in and complete your student profile with your department, academic year, and technical skills to see deterministic match scores and rationale breakdowns.
                </p>
              </div>

              <Link
                href="/dashboard/student/profile"
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center gap-2 self-start md:self-auto shrink-0"
              >
                <span>Complete Your Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Personalized for <strong>{studentProfile.fullName}</strong> • Department:{" "}
                  <strong>{studentProfile.department || "CSE"}</strong> • Year{" "}
                  <strong>{studentProfile.yearOfStudy || 1}</strong>
                </span>
              </div>

              <Link
                href="/dashboard/student/profile"
                className="text-indigo-400 hover:text-indigo-300 font-bold underline decoration-indigo-500/40 underline-offset-2 shrink-0"
              >
                Update Skills & Profile
              </Link>
            </div>
          )}

          {/* For You Recommendations Grid */}
          {sortedOpportunities.length === 0 ? (
            <DiscoveryEmptyState
              searchQuery={searchQuery}
              onReset={handleResetAll}
              onSelectSuggestion={(sug) => setSearchQuery(sug)}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono text-zinc-400">
                  Showing {sortedOpportunities.length} opportunities ranked by profile relevance
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedOpportunities.map(({ opportunity, relevance }) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    relevance={relevance}
                    onSelectDetail={handleSelectDetail}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL OPPORTUNITIES (Curated Horizon or 3D Grid) */}
      {activeTab === "all" && (
        <div className="space-y-10">
          {viewMode === "discovery" && !isFilteringActive ? (
            <div className="space-y-10">
              {/* Row 1: Trending Now on Campus */}
              <DiscoveryCarouselRow
                title="Trending Events on Campus"
                subtitle="Most active registrations across SRM student organizations this week"
                icon={Flame}
                badge="Hot"
                badgeColor="bg-red-500/15 text-red-300 border-red-500/30"
                accentColor="#ef4444"
                opportunities={trendingNow}
                studentProfile={studentProfile}
                onSelectDetail={handleSelectDetail}
                viewAllLink="/opportunities?sortBy=popular"
              />

              {/* Row 2: Upcoming This Week */}
              {upcomingThisWeek.length > 0 && (
                <DiscoveryCarouselRow
                  title="Upcoming This Week — Immediate Registration"
                  subtitle="Events and deadlines closing within the next 7 days."
                  icon={Clock}
                  badge="This Week"
                  badgeColor="bg-amber-500/15 text-amber-300 border-amber-500/30"
                  accentColor="#f59e0b"
                  opportunities={upcomingThisWeek}
                  studentProfile={studentProfile}
                  onSelectDetail={handleSelectDetail}
                  viewAllLink="/opportunities?sortBy=closing_soon"
                />
              )}

              {/* Row 3: National Hackathons & Code Sprints */}
              {hackathons.length > 0 && (
                <DiscoveryCarouselRow
                  title="National Hackathons & Code Sprints"
                  subtitle="Team-based software & hardware build challenges with prize pools & recruitment"
                  icon={Trophy}
                  badge="Buildathons"
                  badgeColor="bg-purple-500/15 text-purple-300 border-purple-500/30"
                  accentColor="#a855f7"
                  opportunities={hackathons}
                  studentProfile={studentProfile}
                  onSelectDetail={handleSelectDetail}
                  viewAllLink="/opportunities?type=hackathon"
                />
              )}

              {/* Row 4: Hands-On Workshops & Bootcamps */}
              {workshops.length > 0 && (
                <DiscoveryCarouselRow
                  title="Hands-on Workshops & Tech Bootcamps"
                  subtitle="Intensive masterclasses with verified campus technical clubs"
                  icon={Rocket}
                  badge="Workshops"
                  badgeColor="bg-sky-500/15 text-sky-300 border-sky-500/30"
                  accentColor="#38bdf8"
                  opportunities={workshops}
                  studentProfile={studentProfile}
                  onSelectDetail={handleSelectDetail}
                  viewAllLink="/opportunities?type=workshop"
                />
              )}

              {/* Row 5: Skill Competitions */}
              {competitions.length > 0 && (
                <DiscoveryCarouselRow
                  title="Skill Competitions & Coding Contests"
                  subtitle="Campus leaderboards, CTF challenges, and algorithmic tournaments"
                  icon={Target}
                  badge="Contests"
                  badgeColor="bg-red-500/15 text-red-300 border-red-500/30"
                  accentColor="#ef4444"
                  opportunities={competitions}
                  studentProfile={studentProfile}
                  onSelectDetail={handleSelectDetail}
                  viewAllLink="/opportunities?type=competition"
                />
              )}

              {/* Row 6: Technical Internships & Placement Drives */}
              {internships.length > 0 && (
                <DiscoveryCarouselRow
                  title="Technical Internships & Placement Drives"
                  subtitle="Direct summer internships and campus hiring drives from verified partner companies"
                  icon={Briefcase}
                  badge="Career Track"
                  badgeColor="bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  accentColor="#10b981"
                  opportunities={internships}
                  studentProfile={studentProfile}
                  onSelectDetail={handleSelectDetail}
                  viewAllLink="/opportunities?type=internship"
                />
              )}

              {/* Row 7: Funded Research Fellowships & Lab Grants */}
              {researchOpps.length > 0 && (
                <DiscoveryCarouselRow
                  title="Research Fellowships & Lab Grants"
                  subtitle="Faculty-led peer-review research programs and campus laboratory grants"
                  icon={FlaskConical}
                  badge="Academic Lab"
                  badgeColor="bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                  accentColor="#6366f1"
                  opportunities={researchOpps}
                  studentProfile={studentProfile}
                  onSelectDetail={handleSelectDetail}
                  viewAllLink="/opportunities?type=research"
                />
              )}

              {/* Row 8: Scholarships & Financial Funding */}
              {scholarships.length > 0 && (
                <DiscoveryCarouselRow
                  title="Scholarships & Financial Fellowships"
                  subtitle="Merit endowments, tuition fee waivers, and conference travel grants"
                  icon={Award}
                  badge="Grants"
                  badgeColor="bg-amber-500/15 text-amber-300 border-amber-500/30"
                  accentColor="#f59e0b"
                  opportunities={scholarships}
                  studentProfile={studentProfile}
                  onSelectDetail={handleSelectDetail}
                  viewAllLink="/opportunities?type=scholarship"
                />
              )}

              {/* Event Lifecycle Framework Roadmap */}
              <EventTimelineRadar />
            </div>
          ) : (
            /* Filtered 3D Responsive Grid View */
            <div className="space-y-6">
              {sortedOpportunities.length === 0 ? (
                <DiscoveryEmptyState
                  searchQuery={searchQuery}
                  onReset={handleResetAll}
                  onSelectSuggestion={(sug) => setSearchQuery(sug)}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedOpportunities.map(({ opportunity, relevance }) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      relevance={relevance}
                      onSelectDetail={handleSelectDetail}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CATEGORIES (Category-Centric Exploration Hub) */}
      {activeTab === "categories" && (
        <div className="space-y-8">
          <div className="border-b border-zinc-800 pb-4 space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Explore Campus Opportunities by Category
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-light">
              Select any category to filter all active campus events and application sprints.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 font-mono">
            {CATEGORY_PILL_CONFIGS.filter((c) => c.value !== "all").map((config) => {
              const Icon = config.icon;
              const count = categoryCounts[config.value] || 0;

              return (
                <div
                  key={config.value}
                  onClick={() => {
                    setSelectedType(config.value as OpportunityType);
                    setActiveTab("all");
                    setViewMode("grid");
                  }}
                  className="p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 hover:border-indigo-500/50 transition-all duration-300 shadow-xl backdrop-blur-xl cursor-pointer group flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl border flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: `${config.color}15`,
                        borderColor: `${config.color}35`,
                        color: config.color,
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-bold">
                      {count} {count === 1 ? "Listing" : "Listings"}
                    </span>
                  </div>

                  <div className="space-y-1 font-sans">
                    <h3 className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                      {config.label}
                    </h3>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed">
                      {config.value === "hackathon" &&
                        "National code sprints, 24-48h buildathons, and prize challenges."}
                      {config.value === "internship" &&
                        "Summer technical internships, developer roles, and campus hiring drives."}
                      {config.value === "research" &&
                        "Faculty-led research fellowships, laboratory grants, and paper publishing."}
                      {config.value === "competition" &&
                        "Algorithmic challenges, CTF security contests, and campus tournaments."}
                      {config.value === "workshop" &&
                        "Hands-on tech bootcamps, AI masterclasses, and framework deep-dives."}
                      {config.value === "scholarship" &&
                        "Merit endowments, fee waivers, and travel research grants."}
                      {config.value === "club_recruitment" &&
                        "Join verified SRM technical, cultural, and leadership student bodies."}
                      {config.value === "placement_drive" &&
                        "Corporate placement drives and on-campus recruitment tests."}
                      {config.value === "conference" &&
                        "Academic summits, tech symposiums, and keynotes."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500 group-hover:text-indigo-400 transition-colors">
                    <span>Browse {config.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedOpportunity(null);
          }}
          studentProfile={studentProfile}
        />
      )}

      {/* Mobile Deep Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        skillFilter={skillFilter}
        setSkillFilter={setSkillFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onlyVerified={onlyVerified}
        setOnlyVerified={setOnlyVerified}
        onlyUrgent={onlyUrgent}
        setOnlyUrgent={setOnlyUrgent}
        onResetAll={handleResetAll}
        activeFilterCount={activeFiltersCount}
      />
    </div>
  );
}
