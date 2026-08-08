"use client";

import React from "react";
import { parseSearchQueryAI } from "@/lib/ai/recommendations";
import { Search, Sparkles, X, Filter, Zap } from "lucide-react";

interface NaturalLanguageSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

const SAMPLE_SUGGESTIONS = [
  "React hackathon in person",
  "Python internship CSE",
  "AI ML research",
  "Closing soon",
];

export default function NaturalLanguageSearchBar({
  value,
  onChange,
  onClear,
}: NaturalLanguageSearchBarProps) {
  const parsed = parseSearchQueryAI(value);
  const hasParsedIntent =
    parsed.parsedSkills.length > 0 ||
    parsed.parsedDepartment ||
    parsed.parsedType ||
    parsed.parsedLocation ||
    parsed.isUrgent;

  return (
    <div className="space-y-2">
      {/* Input container with subtle glow */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-emerald-500/20 rounded-2xl blur-md opacity-40 group-focus-within:opacity-100 transition duration-300" />

        <div className="relative flex items-center bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-xl backdrop-blur-xl px-4 py-3">
          <Search className="w-4 h-4 text-zinc-400 shrink-0 mr-3 group-focus-within:text-purple-400 transition-colors" />

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask AI Search (e.g. 'CSE hackathons with React in person')..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />

          {value && (
            <button
              onClick={onClear}
              type="button"
              className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 pl-3 border-l border-zinc-800 shrink-0 text-[10px] font-mono text-zinc-500">
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800">K</kbd>
          </div>
        </div>
      </div>

      {/* AI Query Intent Badges */}
      {hasParsedIntent && (
        <div className="flex items-center gap-2 flex-wrap px-1 text-xs">
          <span className="text-[10px] font-mono uppercase text-purple-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Query Vectors:
          </span>

          {parsed.parsedSkills.map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 capitalize"
            >
              Skill: {s}
            </span>
          ))}

          {parsed.parsedDepartment && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Dept: {parsed.parsedDepartment}
            </span>
          )}

          {parsed.parsedType && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 capitalize">
              Type: {parsed.parsedType}
            </span>
          )}

          {parsed.parsedLocation && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20 capitalize">
              Location: {parsed.parsedLocation.replace("_", " ")}
            </span>
          )}

          {parsed.isUrgent && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-500/10 text-red-300 border border-red-500/20 uppercase font-bold">
              Urgent Deadlines
            </span>
          )}
        </div>
      )}

      {/* Quick Suggestion Chips */}
      {!value && (
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none text-[11px] text-zinc-500">
          <span className="text-[10px] uppercase font-mono shrink-0">Try:</span>
          {SAMPLE_SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => onChange(sug)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 shrink-0 transition-colors cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
