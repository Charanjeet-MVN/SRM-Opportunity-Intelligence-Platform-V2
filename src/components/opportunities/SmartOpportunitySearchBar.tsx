"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseSmartSearchQuery, ParsedSearchQuery } from "@/lib/search/queryBuilder";
import { Search, X, Sparkles, Filter, Command, Tag } from "lucide-react";

interface SmartOpportunitySearchBarProps {
  value: string;
  onChange: (query: string, parsed: ParsedSearchQuery) => void;
  onClear: () => void;
  isSearching?: boolean;
}

const SEARCH_SUGGESTIONS = [
  "AI hackathons",
  "Research opportunities for CSE students",
  "Internships related to Python",
  "Competitions closing this week",
  "Workshops for beginners",
];

export default function SmartOpportunitySearchBar({
  value,
  onChange,
  onClear,
  isSearching = false,
}: SmartOpportunitySearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parsedQuery = parseSmartSearchQuery(value);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && isFocused) {
        inputRef.current?.blur();
        setIsFocused(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused]);

  const handleInputChange = (text: string) => {
    const parsed = parseSmartSearchQuery(text);
    onChange(text, parsed);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    const parsed = parseSmartSearchQuery(suggestion);
    onChange(suggestion, parsed);
    setIsFocused(false);
  };

  return (
    <div className="w-full space-y-3 relative">
      {/* Search Input Container */}
      <div
        className={`relative rounded-2xl bg-zinc-900/90 border transition-all duration-200 shadow-xl backdrop-blur-xl ${
          isFocused
            ? "border-indigo-500/60 ring-2 ring-indigo-500/20 bg-zinc-900"
            : "border-zinc-800/80 hover:border-zinc-700"
        }`}
      >
        <div className="flex items-center px-4 py-3.5 gap-3">
          <Search className={`w-4 h-4 transition-colors ${isFocused ? "text-indigo-400" : "text-zinc-500"}`} />

          <input
            ref={inputRef}
            type="text"
            value={value}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder='Search hackathons, AI internships, research programs...'
            className="flex-1 bg-transparent text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none font-sans"
          />

          {isSearching && (
            <div className="w-4 h-4 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin shrink-0" />
          )}

          {value && (
            <button
              onClick={() => {
                onClear();
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-500 select-none">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        {/* Parsed Search Badges */}
        {parsedQuery.extractedBadges.length > 0 && (
          <div className="px-4 pb-3 flex items-center gap-2 flex-wrap border-t border-zinc-800/60 pt-2.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
              <Filter className="w-3 h-3 text-indigo-400" />
              Detected Filters:
            </span>
            {parsedQuery.extractedBadges.map((badge, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 flex items-center gap-1"
              >
                <span>{badge.label}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions Dropdown on Focus */}
      <AnimatePresence>
        {isFocused && !value && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 p-3.5 rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-2xl space-y-2.5"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
              <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Popular Search Queries
              </span>
              <span>Click to search</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-0.5">
              {SEARCH_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onMouseDown={() => handleSelectSuggestion(suggestion)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-zinc-950/80 hover:bg-indigo-600/20 text-zinc-300 hover:text-indigo-300 border border-zinc-800 hover:border-indigo-500/30 transition-all flex items-center gap-1.5 cursor-pointer font-sans"
                >
                  <Tag className="w-3 h-3 text-zinc-500" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
