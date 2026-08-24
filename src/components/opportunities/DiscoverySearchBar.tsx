"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  parseSmartSearchQuery,
  ParsedSearchQuery,
} from "@/lib/search/queryBuilder";
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Sparkles,
  Zap,
  Filter,
  Command,
  SlidersHorizontal,
} from "lucide-react";

export interface DiscoverySearchBarProps {
  value: string;
  onChange: (query: string, parsed?: ParsedSearchQuery) => void;
  onClear: () => void;
  isSearching?: boolean;
  onOpenMobileFilters?: () => void;
  activeFilterCount?: number;
  resultCount?: number;
}

const TRENDING_SEARCHES = [
  "National AI Hackathon",
  "NVIDIA Research Intern",
  "Robotics Lab Fellowship",
  "Merit Tuition Scholarship",
  "Web3 Buildathon",
  "Google Cloud Workshop",
  "Smart India Hackathon",
];

const SEARCH_SUGGESTIONS = [
  { text: "AI hackathons this weekend", category: "Hackathons", type: "hackathon" },
  { text: "Python internships CSE", category: "Internships", type: "internship" },
  { text: "Funded Research Fellowships", category: "Research", type: "research" },
  { text: "Tuition Fee Waiver Scholarships", category: "Scholarships", type: "scholarship" },
  { text: "Algorithmic Coding Competitions", category: "Competitions", type: "competition" },
  { text: "Hands-on Next.js Workshops", category: "Workshops", type: "workshop" },
];

export default function DiscoverySearchBar({
  value,
  onChange,
  onClear,
  isSearching = false,
  onOpenMobileFilters,
  activeFilterCount = 0,
  resultCount,
}: DiscoverySearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Deterministically parse query for intent
  const parsedQuery = parseSmartSearchQuery(value);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("soip_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // Global Keyboard Shortcut: ⌘K / Ctrl+K & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        inputRef.current?.blur();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const saveRecentSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed || trimmed.length < 2) return;
      try {
        const updated = [
          trimmed,
          ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase()),
        ].slice(0, 6);
        setRecentSearches(updated);
        localStorage.setItem("soip_recent_searches", JSON.stringify(updated));
      } catch {
        // Safe fallback
      }
    },
    [recentSearches]
  );

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((s) => s !== term);
      setRecentSearches(updated);
      localStorage.setItem("soip_recent_searches", JSON.stringify(updated));
    } catch {
      // Safe fallback
    }
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("soip_recent_searches");
    } catch {
      // Safe fallback
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (text: string) => {
    const parsed = parseSmartSearchQuery(text);
    onChange(text, parsed);
  };

  const handleSelectQuery = (query: string) => {
    const parsed = parseSmartSearchQuery(query);
    onChange(query, parsed);
    saveRecentSearch(query);
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      saveRecentSearch(value);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full font-mono">
      {/* Search Input Box */}
      <form
        onSubmit={handleSubmit}
        role="search"
        aria-label="Opportunity search engine"
        className="relative"
      >
        <div className="relative flex items-center">
          <div className="absolute left-4 sm:left-4.5 pointer-events-none text-zinc-400">
            {isSearching ? (
              <span className="w-4 h-4 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin block" />
            ) : (
              <Search className="w-4 h-4 text-indigo-400" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            role="searchbox"
            aria-label="Search opportunities by title, organization, skills, or natural query"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search keyword (e.g. 'Python internship') or natural queries (e.g. 'AI hackathons this week')..."
            className="w-full pl-11 sm:pl-12 pr-24 sm:pr-32 py-3.5 sm:py-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/90 hover:border-zinc-700 focus:border-indigo-500 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all backdrop-blur-2xl font-sans"
          />

          {/* Action buttons on right */}
          <div className="absolute right-3 flex items-center gap-1.5">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search query"
                className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Mobile filter toggle button */}
            {onOpenMobileFilters && (
              <button
                type="button"
                onClick={onOpenMobileFilters}
                aria-label="Open filter options"
                className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center font-mono">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}

            {/* Desktop Command Palette Shortcut Hint */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono text-zinc-500 select-none">
              <Command className="w-3 h-3 text-zinc-400" />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Deterministic Natural Language Parsed Badges */}
        {parsedQuery.extractedBadges.length > 0 && (
          <div className="mt-2.5 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[10px] font-mono text-zinc-400 uppercase flex items-center gap-1 font-semibold">
              <Filter className="w-3 h-3 text-indigo-400" />
              Detected Query Criteria:
            </span>
            {parsedQuery.extractedBadges.map((badge, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium inline-flex items-center gap-1"
              >
                <span>{badge.label}</span>
              </span>
            ))}
            {resultCount !== undefined && (
              <span className="ml-auto text-[10px] font-mono text-zinc-400">
                {resultCount} match{resultCount === 1 ? "" : "es"}
              </span>
            )}
          </div>
        )}
      </form>

      {/* Autocomplete, Suggestions & History Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 sm:p-5 rounded-3xl bg-zinc-950/95 border border-zinc-800/90 shadow-2xl backdrop-blur-3xl z-50 space-y-4 max-h-[460px] overflow-y-auto"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={clearAllRecent}
                    className="hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Clear History
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      onClick={() => handleSelectQuery(term)}
                      className="px-3 py-1 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-indigo-500/40 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 group"
                    >
                      <span className="font-sans">{term}</span>
                      <button
                        type="button"
                        onClick={(e) => removeRecentSearch(term, e)}
                        aria-label={`Remove recent search ${term}`}
                        className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Campus Searches */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                Trending on SRM Campus
              </div>

              <div className="flex flex-wrap gap-1.5">
                {TRENDING_SEARCHES.map((query) => (
                  <button
                    key={query}
                    type="button"
                    onClick={() => handleSelectQuery(query)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900/60 hover:bg-indigo-600/20 border border-zinc-850 hover:border-indigo-500/40 text-xs text-zinc-300 hover:text-indigo-200 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-indigo-400" />
                    <span className="font-sans">{query}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Natural Search Suggestions */}
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Natural Query Suggestions
              </div>

              <div className="space-y-1">
                {SEARCH_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.text}
                    type="button"
                    onClick={() => handleSelectQuery(sug.text)}
                    className="w-full p-2.5 rounded-xl hover:bg-zinc-900/80 text-left transition-colors flex items-center justify-between text-xs text-zinc-300 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                      <span className="group-hover:text-white font-sans">{sug.text}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-850">
                      {sug.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
