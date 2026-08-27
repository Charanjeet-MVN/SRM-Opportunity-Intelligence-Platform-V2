"use client";

import React, { useState, useMemo } from "react";
import { PublicClubRecord } from "@/lib/clubs/actions";
import ClubDirectoryHero from "./ClubDirectoryHero";
import ClubCard3D from "./ClubCard3D";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Building2, RefreshCw, Compass } from "lucide-react";
import Link from "next/link";

interface ClubDirectoryClientProps {
  initialClubs: PublicClubRecord[];
  initialCategory?: string;
  initialSearch?: string;
}

export default function ClubDirectoryClient({
  initialClubs,
  initialCategory = "all",
  initialSearch = "",
}: ClubDirectoryClientProps) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Derive available categories dynamically from real database records
  const categoryOptions = useMemo(() => {
    const counts: Record<string, number> = { all: initialClubs.length };

    initialClubs.forEach((club) => {
      const cat = club.category?.toLowerCase() || "other";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const standardCategories = [
      { id: "all", label: "All Organizations" },
      { id: "technical", label: "Technical & Coding" },
      { id: "cultural", label: "Cultural & Arts" },
      { id: "management", label: "Management & Business" },
      { id: "sports", label: "Sports & Fitness" },
      { id: "social", label: "Social Impact & Community" },
      { id: "research", label: "Research & Innovation" },
    ];

    // Include standard categories with their counts, plus any custom categories present in the database
    const categories = standardCategories.map((c) => ({
      ...c,
      count: counts[c.id] || 0,
    }));

    Object.keys(counts).forEach((catId) => {
      if (catId !== "all" && !categories.some((c) => c.id === catId)) {
        categories.push({
          id: catId,
          label: catId.charAt(0).toUpperCase() + catId.slice(1),
          count: counts[catId],
        });
      }
    });

    return categories.filter((c) => c.id === "all" || c.count > 0);
  }, [initialClubs]);

  // Compute filtered clubs
  const filteredClubs = useMemo(() => {
    return initialClubs.filter((club) => {
      // Category filter
      const matchesCategory =
        selectedCategory === "all" ||
        club.category?.toLowerCase() === selectedCategory.toLowerCase();

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        club.name.toLowerCase().includes(q) ||
        (club.description && club.description.toLowerCase().includes(q)) ||
        (club.category && club.category.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [initialClubs, selectedCategory, searchQuery]);

  // Ecosystem stats
  const totalClubs = initialClubs.length;
  const verifiedClubs = initialClubs.filter(
    (c) => c.verificationStatus === "verified"
  ).length;
  const totalOpportunities = initialClubs.reduce(
    (acc, c) => acc + (c.opportunityCount || 0),
    0
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.01 : 0.3, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div className="space-y-8">
      {/* Flagship Hero Header */}
      <ClubDirectoryHero
        totalClubs={totalClubs}
        verifiedClubs={verifiedClubs}
        totalOpportunities={totalOpportunities}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Category Pills Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 pt-1">
        {categoryOptions.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-mono transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? "bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/25"
                  : "bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? "bg-purple-700 text-purple-100" : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
        <span>
          Showing <strong className="text-zinc-200">{filteredClubs.length}</strong>{" "}
          {filteredClubs.length === 1 ? "organization" : "organizations"}
        </span>

        {(selectedCategory !== "all" || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Clubs Grid */}
      {filteredClubs.length === 0 ? (
        <div className="py-20 px-6 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 text-center space-y-4 max-w-md mx-auto backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-200 font-mono">No organizations found</h3>
            <p className="text-xs text-zinc-400 font-mono">
              {searchQuery
                ? `No clubs matching "${searchQuery}"`
                : "No registered SRM clubs found in this category."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
            <Link
              href="/opportunities"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-medium transition-all"
            >
              Browse Opportunities
            </Link>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredClubs.map((club) => (
            <motion.div key={club.id} variants={itemVariants} className="h-full">
              <ClubCard3D club={club} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
