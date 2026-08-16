"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Zap,
  Tag,
} from "lucide-react";

interface DiscoverySearchBarProps {
  value: string;
  onChange: (query: string) => void;
  onClear: () => void;
  isSearching?: boolean;
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
  { text: "Hackathons with prize pool", category: "Hackathons" },
  { text: "Summer Internships with PPO", category: "Internships" },
  { text: "Funded Research Grants", category: "Research" },
  { text: "Fee Waiver Scholarships", category: "Scholarships" },
  { text: "Competitive Coding Contests", category: "Competitions" },
  { text: "Hands-on Next.js Workshops", category: "Workshops" },
];

export default function DiscoverySearchBar({
  value,
  onChange,
  onClear,
  isSearching = false,
}: DiscoverySearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("soip_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // fallback
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("soip_recent_searches", JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((s) => s !== term);
      setRecentSearches(updated);
      localStorage.setItem("soip_recent_searches", JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("soip_recent_searches");
    } catch {}
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

  const handleSelectQuery = (query: string) => {
    onChange(query);
    saveRecentSearch(query);
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      saveRecentSearch(value);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full font-mono">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4.5 pointer-events-none text-zinc-400">
            {isSearching ? (
              <span className="w-4 h-4 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin block" />
            ) : (
              <Search className="w-4 h-4 text-indigo-400" />
            )}
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search verified hackathons, internships, research grants, scholarships..."
            className="w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all backdrop-blur-xl font-sans"
          />

          {value && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-4 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete & History Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 rounded-3xl bg-zinc-950/95 border border-zinc-800/90 shadow-2xl backdrop-blur-2xl z-50 space-y-4 max-h-[440px] overflow-y-auto"
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
                    onClick={clearAllRecent}
                    className="hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      onClick={() => handleSelectQuery(term)}
                      className="px-3 py-1 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-300 transition-all cursor-pointer flex items-center gap-2 group"
                    >
                      <span>{term}</span>
                      <button
                        onClick={(e) => removeRecentSearch(term, e)}
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
                    onClick={() => handleSelectQuery(query)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900/60 hover:bg-indigo-600/20 border border-zinc-850 hover:border-indigo-500/40 text-xs text-zinc-300 hover:text-indigo-200 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-indigo-400" />
                    <span>{query}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Suggestions */}
            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Suggested Queries
              </div>

              <div className="space-y-1">
                {SEARCH_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.text}
                    onClick={() => handleSelectQuery(sug.text)}
                    className="w-full p-2.5 rounded-xl hover:bg-zinc-900/80 text-left transition-colors flex items-center justify-between text-xs text-zinc-300 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400" />
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
