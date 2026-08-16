"use client";

import React from "react";
import { motion } from "framer-motion";
import { RefreshCw, Compass, ArrowRight } from "lucide-react";

interface DiscoveryEmptyStateProps {
  searchQuery?: string;
  onReset: () => void;
  onSelectSuggestion?: (query: string) => void;
}

const RECOMMENDED_SUGGESTIONS = [
  "Hackathon",
  "Internship",
  "Research Grant",
  "Python",
  "React",
  "Scholarship",
];

export default function DiscoveryEmptyState({
  searchQuery,
  onReset,
  onSelectSuggestion,
}: DiscoveryEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="p-8 sm:p-12 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 text-center max-w-2xl mx-auto space-y-6 shadow-2xl backdrop-blur-xl font-sans"
    >
      {/* 3D Atmospheric Icon */}
      <div className="relative w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 p-1 flex items-center justify-center shadow-xl shadow-indigo-950/40">
        <Compass className="w-10 h-10 text-indigo-400 animate-pulse" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-zinc-950" />
      </div>

      {/* Headline & Message */}
      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
          No opportunities match your exploration criteria
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-md mx-auto leading-relaxed">
          {searchQuery ? (
            <>
              We couldn&apos;t find any active listings matching &ldquo;<strong>{searchQuery}</strong>&rdquo;. Try searching for broader terms or clearing active filters.
            </>
          ) : (
            "Try broadening your filter criteria or explore popular opportunity categories below."
          )}
        </p>
      </div>

      {/* Suggested Quick Filter Chips */}
      {onSelectSuggestion && (
        <div className="space-y-2 pt-2 border-t border-zinc-900 font-mono">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
            Try searching for:
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {RECOMMENDED_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                onClick={() => onSelectSuggestion(sug)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/40 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              >
                <span>{sug}</span>
                <ArrowRight className="w-3 h-3 text-indigo-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reset Action */}
      <div className="pt-2">
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold shadow-lg shadow-indigo-600/25 transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset All Exploration Filters</span>
        </button>
      </div>
    </motion.div>
  );
}
