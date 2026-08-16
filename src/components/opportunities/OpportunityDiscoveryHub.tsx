"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Opportunity, OpportunityType, LocationType, StudentProfile } from "@/types";
import { DEPARTMENTS } from "@/lib/constants";
import DiscoveryCarouselRow from "./DiscoveryCarouselRow";
import DiscoverySearchBar from "./DiscoverySearchBar";
import DiscoveryCategoryPills from "./DiscoveryCategoryPills";
import DiscoveryEmptyState from "./DiscoveryEmptyState";
import OpportunityCard from "./OpportunityCard";
import { OpportunityDetailModal } from "./OpportunityDetailModal";
import { MobileFilterDrawer } from "./MobileFilterDrawer";
import { calculateOpportunityRelevance } from "@/lib/relevance/scoring";
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
} from "lucide-react";

interface OpportunityDiscoveryHubProps {
  initialOpportunities: Opportunity[];
  studentProfile: StudentProfile | null;
}

export default function OpportunityDiscoveryHub({
  initialOpportunities = [],
  studentProfile,
}: OpportunityDiscoveryHubProps) {
  const opportunities = initialOpportunities;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<OpportunityType | "all">("all");
  const [selectedLocation, setSelectedLocation] = useState<LocationType | "all">("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "closing_soon">("newest");

  // View Mode: 'discovery' (Netflix rows) vs 'grid' (Filtered Grid)
  const [viewMode, setViewMode] = useState<"discovery" | "grid">("discovery");

  // Modal & Drawer State
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Filtered Opportunities computation
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = opp.title.toLowerCase().includes(q);
        const inSummary = opp.summary?.toLowerCase().includes(q);
        const inDesc = opp.description.toLowerCase().includes(q);
        const inClub = opp.club?.name.toLowerCase().includes(q);
        const inSkills = opp.requiredSkills.some((s) => s.toLowerCase().includes(q));
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
          opp.eligibleDepartments.length > 0 &&
          !opp.eligibleDepartments.includes(selectedDepartment)
        ) {
          return false;
        }
      }

      // 5. Skill Filter
      if (skillFilter.trim()) {
        const s = skillFilter.toLowerCase().trim();
        if (!opp.requiredSkills.some((skill) => skill.toLowerCase().includes(s))) {
          return false;
        }
      }

      return true;
    });
  }, [opportunities, searchQuery, selectedType, selectedLocation, selectedDepartment, skillFilter]);

  // Sort Filtered Opportunities
  const sortedOpportunities = useMemo(() => {
    const list = [...filteredOpportunities];
    if (sortBy === "closing_soon") {
      return list.sort((a, b) => {
        if (!a.applicationDeadline) return 1;
        if (!b.applicationDeadline) return -1;
        return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
      });
    }
    // Default newest
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredOpportunities, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: opportunities.length };
    opportunities.forEach((o) => {
      counts[o.type] = (counts[o.type] || 0) + 1;
    });
    return counts;
  }, [opportunities]);

  // Curated Discovery Rows
  const trendingNow = useMemo(() => {
    return [...opportunities]
      .sort((a, b) => (b.currentParticipants || 0) - (a.currentParticipants || 0))
      .slice(0, 8);
  }, [opportunities]);

  const endingSoon = useMemo(() => {
    const now = Date.now();
    return opportunities
      .filter((o) => {
        if (!o.applicationDeadline) return false;
        const diff = new Date(o.applicationDeadline).getTime() - now;
        return diff > 0 && diff < 5 * 24 * 60 * 60 * 1000;
      })
      .slice(0, 8);
  }, [opportunities]);

  const hackathons = useMemo(
    () => opportunities.filter((o) => o.type === "hackathon"),
    [opportunities]
  );

  const internships = useMemo(
    () => opportunities.filter((o) => o.type === "internship" || o.type === "placement_drive"),
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
    () => opportunities.filter((o) => o.type === "workshop" || o.type === "bootcamp"),
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
    setSortBy("newest");
  };

  const isFilteringActive =
    searchQuery.trim().length > 0 ||
    selectedType !== "all" ||
    selectedLocation !== "all" ||
    selectedDepartment !== "all" ||
    skillFilter.trim().length > 0 ||
    sortBy === "closing_soon";

  // If user searches or selects a specific category, switch to grid view for granular inspection
  useEffect(() => {
    if (isFilteringActive && viewMode === "discovery") {
      setViewMode("grid");
    }
  }, [isFilteringActive, viewMode]);

  return (
    <div className="space-y-8 font-sans text-zinc-100">
      {/* ── 1. DISCOVERY HUB COMMAND HEADER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-2xl">
        {/* Top ambient illumination */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Campus Opportunity Discovery Hub</span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-bold">{opportunities.length} Verified Listings</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-100 font-sans">
              Explore SRM Campus Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              Explore national hackathons, research lab grants, technical internships, and verified club recruitments curated for SRM students.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 self-start md:self-auto font-mono shrink-0 shadow-lg">
            <button
              onClick={() => setViewMode("discovery")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === "discovery"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Rows3 className="w-3.5 h-3.5" />
              <span>Curated Horizon</span>
            </button>

            <button
              onClick={() => setViewMode("grid")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Filtered Grid ({filteredOpportunities.length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar with Autocomplete & Trending Queries */}
        <div className="relative z-10 pt-2">
          <DiscoverySearchBar
            value={searchQuery}
            onChange={(q) => setSearchQuery(q)}
            onClear={() => setSearchQuery("")}
            isSearching={false}
          />
        </div>

        {/* Distinct Visual Category Pills Bar */}
        <div className="relative z-10 pt-1">
          <DiscoveryCategoryPills
            selectedType={selectedType}
            onSelectType={(t) => setSelectedType(t)}
            categoryCounts={categoryCounts}
          />
        </div>
      </div>

      {/* ── 2. ADVANCED FILTER BAR (VISIBLE IN GRID VIEW) ── */}
      {viewMode === "grid" && (
        <div className="p-5 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 shadow-xl backdrop-blur-xl space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
            <div className="flex items-center gap-2 text-zinc-300 font-bold">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span className="uppercase tracking-wider text-[11px]">Exploration Controls</span>
            </div>

            {isFilteringActive && (
              <button
                onClick={handleResetAll}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Department Select */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-xs"
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
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                Location Mode
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value as LocationType | "all")}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer capitalize text-xs"
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
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                Specific Skill
              </label>
              <input
                type="text"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                placeholder="e.g. PyTorch, React..."
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "closing_soon")}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-xs"
              >
                <option value="newest">Newest First</option>
                <option value="closing_soon">Closing Soonest</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. MAIN CONTENT: CURATED DISCOVERY ROWS vs FILTERED GRID ── */}
      {viewMode === "discovery" && !isFilteringActive ? (
        <div className="space-y-10">
          {/* Row 1: Trending Now on Campus */}
          <DiscoveryCarouselRow
            title="Trending Now on Campus"
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

          {/* Row 2: Closing Soon (Urgent 72h) */}
          {endingSoon.length > 0 && (
            <DiscoveryCarouselRow
              title="Ending Soon — Last Call"
              subtitle="Deadlines closing within the next few days. Secure your registration early."
              icon={Clock}
              badge="Urgent"
              badgeColor="bg-amber-500/15 text-amber-300 border-amber-500/30"
              accentColor="#f59e0b"
              opportunities={endingSoon}
              studentProfile={studentProfile}
              onSelectDetail={handleSelectDetail}
              viewAllLink="/opportunities?sortBy=closing_soon"
            />
          )}

          {/* Row 3: National Hackathons & Build Challenges */}
          {hackathons.length > 0 && (
            <DiscoveryCarouselRow
              title="National Hackathons & Build Challenges"
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

          {/* Row 4: Technical Internships & Placement Drives */}
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

          {/* Row 5: Funded Research Fellowships & Lab Grants */}
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

          {/* Row 6: Scholarships & Financial Funding */}
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

          {/* Row 7: Skill Competitions */}
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

          {/* Row 8: Hands-On Workshops & Bootcamps */}
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
        </div>
      ) : (
        /* ── FILTERED 3D GRID VIEW ── */
        <div className="space-y-6">
          {sortedOpportunities.length === 0 ? (
            <DiscoveryEmptyState
              searchQuery={searchQuery}
              onReset={handleResetAll}
              onSelectSuggestion={(sug) => setSearchQuery(sug)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedOpportunities.map((opp) => {
                const relevance = studentProfile
                  ? calculateOpportunityRelevance(studentProfile, opp)
                  : undefined;

                return (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    relevance={relevance}
                    onSelectDetail={handleSelectDetail}
                  />
                );
              })}
            </div>
          )}
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
        onOpen={() => setIsMobileDrawerOpen(true)}
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
        onResetAll={handleResetAll}
        activeFilterCount={isFilteringActive ? 1 : 0}
      />
    </div>
  );
}
