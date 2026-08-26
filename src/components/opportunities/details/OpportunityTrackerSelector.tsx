"use client";

import React, { useState, useTransition } from "react";
import { updateOpportunityTrackerColumnAction } from "@/lib/engagement/actions";
import {
  Kanban,
  Check,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OpportunityTrackerSelectorProps {
  opportunityId: string;
  initialColumn?: string;
  className?: string;
}

const TRACKER_STAGES = [
  { id: "Interested", label: "Interested", color: "text-zinc-400 bg-zinc-900/60 border-zinc-800" },
  { id: "Saved", label: "Saved", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  { id: "Applied", label: "Applied", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30" },
  { id: "Assessment", label: "Assessment", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  { id: "Interview", label: "Interview", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  { id: "Selected", label: "Selected", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  { id: "Rejected", label: "Rejected", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
];

export default function OpportunityTrackerSelector({
  opportunityId,
  initialColumn,
  className = "",
}: OpportunityTrackerSelectorProps) {
  const [currentColumn, setCurrentColumn] = useState<string | undefined>(initialColumn);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSelect = (stageId: string) => {
    const newStage = currentColumn === stageId ? undefined : stageId;
    setCurrentColumn(newStage);
    setIsOpen(false);

    startTransition(async () => {
      await updateOpportunityTrackerColumnAction(
        opportunityId,
        newStage || "Interested"
      );
    });
  };

  const activeStage = TRACKER_STAGES.find((s) => s.id === currentColumn);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`px-3 py-2 rounded-xl text-xs font-mono border transition-all flex items-center justify-between gap-2 cursor-pointer w-full ${
          activeStage
            ? activeStage.color
            : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700"
        }`}
        title="Update Opportunity Tracking Status"
      >
        <div className="flex items-center gap-2 truncate">
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          ) : (
            <Kanban className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          )}
          <span className="truncate">
            {activeStage ? `Track: ${activeStage.label}` : "Track Opportunity"}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 bottom-full mb-2 w-52 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl p-1.5 z-50 backdrop-blur-xl space-y-1"
            >
              <div className="px-2.5 py-1.5 border-b border-zinc-800/80 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                My Tracker Stage
              </div>
              {TRACKER_STAGES.map((stage) => {
                const isSelected = currentColumn === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => handleSelect(stage.id)}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          stage.id === "Selected"
                            ? "bg-emerald-400"
                            : stage.id === "Applied"
                            ? "bg-indigo-400"
                            : stage.id === "Rejected"
                            ? "bg-rose-400"
                            : stage.id === "Interview"
                            ? "bg-orange-400"
                            : stage.id === "Assessment"
                            ? "bg-amber-400"
                            : "bg-purple-400"
                        }`}
                      />
                      <span>{stage.label}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
