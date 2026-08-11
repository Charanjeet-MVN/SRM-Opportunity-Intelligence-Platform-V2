"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { getPublicOpportunitiesAction } from "@/lib/opportunities/actions";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import OpportunityCardSkeleton from "@/components/opportunities/OpportunityCardSkeleton";
import SmartOpportunitySearchBar from "@/components/opportunities/SmartOpportunitySearchBar";
import { MobileFilterDrawer } from "@/components/opportunities/MobileFilterDrawer";
import { OpportunityDetailModal } from "@/components/opportunities/OpportunityDetailModal";
import { buildFilterOptionsFromParsedQuery, ParsedSearchQuery } from "@/lib/search/queryBuilder";
import { calculateOpportunityRelevance } from "@/lib/relevance/scoring";
import { Opportunity, OpportunityType, LocationType, StudentProfile } from "@/types";
import { DEPARTMENTS } from "@/lib/constants";
import {
  RefreshCw,
  Plus,
  Search,
  AlertTriangle,
  Check,
  ShieldCheck,
  Sparkles,
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

  // Authenticated Student State
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Modal & Drawer States
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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

  // Load authenticated user profile
  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsAuthenticated(true);
          const { data: prof } = await supabase
            .from("student_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (prof) {
            setStudentProfile({
              id: prof.id,
              userId: prof.user_id,
              fullName: prof.full_name,
              registerNumber: prof.register_number || undefined,
              department: prof.department || undefined,
              yearOfStudy: prof.year_of_study || undefined,
              skills: prof.skills || [],
              interests: prof.interests || [],
              careerGoals: prof.career_goals || undefined,
              createdAt: prof.created_at,
              updatedAt: prof.updated_at,
            });
          }
        }
      } catch (e) {
        // Unauthenticated session
      }
    }
    loadUser();
  }, []);

  // Fetch opportunities from Supabase
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

  const handleSelectOpportunityDetail = (opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setIsDetailModalOpen(true);
  };

  const activeFilterCount =
    (selectedType !== "all" ? 1 : 0) +
    (selectedLocation !== "all" ? 1 : 0) +
    (selectedDepartment !== "all" ? 1 : 0) +
    (skillFilter ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0 || sortBy === "closing_soon";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl shadow-2xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs group-hover:border-indigo-500/60 transition-all shadow-md">
              V2
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                SRM Opportunity Intelligence
              </span>
              <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase hidden sm:inline">
                Discovery Engine
              </span>
            </div>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/student"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-medium text-xs transition-all hover:bg-zinc-800/80"
            >
              Workspace
            </Link>

            <Link
              href="/dashboard/club/opportunities/new"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Post Opportunity</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 flex-1 w-full">
        {/* Discovery Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">
              Live Opportunity Feed
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-400 text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-400" /> PostgreSQL Verified
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-100">
            Explore Opportunities
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
            Surfacing verified hackathons, internships, research programs, and campus recruitments published by official SRM student organizations and departments.
          </p>
        </motion.div>

        {/* Command Search & Desktop Filter System */}
        <div className="space-y-5 p-5 sm:p-7 rounded-3xl bg-zinc-950/80 border border-zinc-800/90 shadow-2xl backdrop-blur-xl">
          {/* Main Search Input */}
          <SmartOpportunitySearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={() => handleSearchChange("", { rawQuery: "", cleanedKeywords: "", extractedBadges: [] })}
            isSearching={loading}
          />

          {/* Desktop Category Pill Bar */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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

          {/* Desktop Filters Row */}
          <div className="hidden lg:grid grid-cols-4 gap-3 text-xs pt-3 border-t border-zinc-800/60">
            {/* Department Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-xs"
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Mode */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
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

            {/* Specific Skill */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                Specific Skill
              </label>
              <input
                type="text"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                placeholder="e.g. Python, React..."
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                Sort Order
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

          {/* Mobile Filter Drawer Trigger */}
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
            onResetAll={handleClearAll}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {/* Dynamic Counter & Reset Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 flex-wrap gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-200 text-sm">
              {totalCount} {totalCount === 1 ? "opportunity" : "opportunities"}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400 text-[11px] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Real-time Database Results
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Content States: Loading | Error | Empty | Card Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <OpportunityCardSkeleton key={i} />
            ))}
          </div>
        ) : errorState ? (
          /* Database Error State */
          <div className="py-16 px-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-zinc-200">Database Connection Issue</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Could not retrieve opportunities from the server. Please verify your connection or try again.
              </p>
            </div>
            <button
              onClick={() => setReloadKey((prev) => prev + 1)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Retry Query</span>
            </button>
          </div>
        ) : opportunities.length === 0 ? (
          /* Intentional Empty State (No Mock Data) */
          <div className="py-20 px-6 rounded-3xl bg-zinc-950 border border-zinc-800/80 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <Search className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-zinc-200">
                No matching opportunities found.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-md mx-auto">
                No verified listings match your active search terms or filters. Try adjusting your skills, department, or location parameters.
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
            {opportunities.map((opp) => {
              const relevance = studentProfile
                ? calculateOpportunityRelevance(studentProfile, opp)
                : undefined;

              return (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  relevance={relevance}
                  onSelectDetail={handleSelectOpportunityDetail}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Opportunity Detail Quick-View Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        studentProfile={studentProfile}
        isAuthenticated={isAuthenticated}
      />

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
