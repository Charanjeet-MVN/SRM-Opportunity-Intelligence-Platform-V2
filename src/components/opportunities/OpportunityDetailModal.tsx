"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Opportunity, StudentProfile } from "@/types";
import OpportunityTypeBadge from "./OpportunityTypeBadge";
import VerificationBadge from "../clubs/VerificationBadge";
import BookmarkButton from "./BookmarkButton";
import RegisterApplyButton from "./RegisterApplyButton";
import OpportunityEvaluationSection from "./OpportunityEvaluationSection";
import { X, MapPin, ExternalLink, Calendar, Sparkles, Building2, Clock } from "lucide-react";

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  studentProfile?: StudentProfile | null;
  isAuthenticated?: boolean;
}

export function OpportunityDetailModal({
  opportunity,
  isOpen,
  onClose,
  studentProfile = null,
  isAuthenticated = false,
}: OpportunityDetailModalProps) {
  if (!opportunity) return null;

  const isDeadlinePassed = opportunity.applicationDeadline
    ? new Date(opportunity.applicationDeadline) < new Date()
    : false;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 max-h-[85vh] flex flex-col justify-between"
          >
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-zinc-800/80 bg-zinc-900/60 sticky top-0 z-20 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <OpportunityTypeBadge type={opportunity.type} />
                  {opportunity.club && (
                    <VerificationBadge status={opportunity.club.verificationStatus} />
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 leading-tight mb-2">
                {opportunity.title}
              </h2>

              {opportunity.club && (
                <div className="text-xs text-zinc-400 flex items-center gap-2 font-mono">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Published by <strong className="text-zinc-200">{opportunity.club.name}</strong></span>
                </div>
              )}
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              {/* Meta Specs Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Location Mode</span>
                  <span className="text-zinc-200 font-semibold capitalize flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {opportunity.locationType.replace("_", " ")}
                  </span>
                </div>

                {opportunity.applicationDeadline && (
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Deadline</span>
                    <span className={`font-semibold flex items-center gap-1 mt-0.5 ${isDeadlinePassed ? "text-red-400" : "text-emerald-400"}`}>
                      <Clock className="w-3.5 h-3.5" />
                      {isDeadlinePassed
                        ? "Expired"
                        : new Date(opportunity.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {opportunity.eventStartDate && (
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Event Date</span>
                    <span className="text-zinc-200 font-semibold flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      {new Date(opportunity.eventStartDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Student Relevance Evaluation if Logged In */}
              {isAuthenticated && (
                <OpportunityEvaluationSection
                  opportunity={opportunity}
                  profile={studentProfile}
                  isAuthenticated={isAuthenticated}
                />
              )}

              {/* Summary & Description */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  Opportunity Description
                </h3>
                <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {opportunity.description}
                </div>
              </div>

              {/* Required Skills */}
              {opportunity.requiredSkills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {opportunity.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono bg-zinc-900 border border-zinc-800 text-indigo-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility Rules */}
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2 text-xs font-mono">
                <h3 className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                  Eligibility Breakdown
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Academic Years:</span>
                    <span>{opportunity.eligibleYears.length > 0 ? opportunity.eligibleYears.map(y => `Year ${y}`).join(", ") : "All Academic Years"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Departments:</span>
                    <span>{opportunity.eligibleDepartments.length > 0 ? opportunity.eligibleDepartments.join(", ") : "All SRM Departments"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Sticky Footer Actions */}
            <div className="p-5 border-t border-zinc-800/80 bg-zinc-900/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-20">
              <Link
                href={`/opportunities/${opportunity.slug}`}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
              >
                <span>Full Page View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-3">
                <BookmarkButton opportunityId={opportunity.id} />
                <RegisterApplyButton
                  opportunityId={opportunity.id}
                  externalUrl={opportunity.externalUrl}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
