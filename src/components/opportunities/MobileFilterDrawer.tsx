"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OpportunityType, LocationType } from "@/types";
import { DEPARTMENTS } from "@/lib/constants";
import { Filter, X, RefreshCw, Check, SlidersHorizontal } from "lucide-react";

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

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  selectedType: OpportunityType | "all";
  setSelectedType: (type: OpportunityType | "all") => void;
  selectedLocation: LocationType | "all";
  setSelectedLocation: (loc: LocationType | "all") => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  skillFilter: string;
  setSkillFilter: (skill: string) => void;
  sortBy: "newest" | "closing_soon";
  setSortBy: (sort: "newest" | "closing_soon") => void;
  onResetAll: () => void;
  activeFilterCount: number;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  onOpen,
  selectedType,
  setSelectedType,
  selectedLocation,
  setSelectedLocation,
  selectedDepartment,
  setSelectedDepartment,
  skillFilter,
  setSkillFilter,
  sortBy,
  setSortBy,
  onResetAll,
  activeFilterCount,
}: MobileFilterDrawerProps) {
  return (
    <>
      {/* Drawer Trigger Button (Mobile / Tablet) */}
      <button
        onClick={onOpen}
        className="lg:hidden flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium text-xs hover:bg-zinc-800 transition-colors w-full cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span>Filters & Sorting</span>
        </div>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-600 text-white font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Drawer Modal Backdrop & Slide-over */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Slide-over Content Sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl h-full flex flex-col justify-between z-10 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between sticky top-0 bg-zinc-950 z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">Filter Opportunities</h3>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {activeFilterCount} active filters selected
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Controls List */}
              <div className="p-5 space-y-6 flex-1">
                {/* Opportunity Category */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {TYPE_FILTERS.map((filter) => {
                      const isSelected = selectedType === filter.value;
                      return (
                        <button
                          key={filter.value}
                          onClick={() => setSelectedType(filter.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/50 font-semibold"
                              : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-indigo-400" />}
                          <span>{filter.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Department Filter */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
                    Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
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
                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
                    Location Mode
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value as LocationType | "all")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize text-xs"
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
                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
                    Specific Skill
                  </label>
                  <input
                    type="text"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    placeholder="e.g. Python, React..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                  />
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
                    Sort Order
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "newest" | "closing_soon")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  >
                    <option value="newest">Newest First</option>
                    <option value="closing_soon">Closing Soonest</option>
                  </select>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-5 border-t border-zinc-800/80 bg-zinc-950 sticky bottom-0 flex items-center justify-between gap-3">
                <button
                  onClick={onResetAll}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Reset</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all text-center"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
