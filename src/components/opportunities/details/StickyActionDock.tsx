"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Opportunity } from "@/types";
import RegisterApplyButton from "../RegisterApplyButton";
import BookmarkButton from "../BookmarkButton";
import ShareOpportunityButton from "./ShareOpportunityButton";
import { Clock } from "lucide-react";

interface StickyActionDockProps {
  opportunity: Opportunity;
  isRegistered?: boolean;
  isSaved?: boolean;
  trackerColumn?: string;
}

export default function StickyActionDock({
  opportunity,
  isRegistered = false,
  isSaved = false,
}: StickyActionDockProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show dock after scrolling down 350px
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const now = new Date();
  const deadlineDate = opportunity.applicationDeadline
    ? new Date(opportunity.applicationDeadline)
    : null;
  const isDeadlinePassed = deadlineDate ? deadlineDate < now : false;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 sm:bottom-6 inset-x-0 z-40 px-4 pointer-events-none flex justify-center"
        >
          <div className="w-full max-w-4xl bg-zinc-950/90 backdrop-blur-2xl border border-zinc-700/80 rounded-2xl sm:rounded-full p-2.5 sm:px-5 sm:py-3 shadow-2xl shadow-black/80 flex items-center justify-between gap-3 pointer-events-auto">
            {/* Left: Title & Quick Meta */}
            <div className="min-w-0 flex-1 hidden md:block">
              <h4 className="text-xs font-bold text-zinc-100 truncate">
                {opportunity.title}
              </h4>
              <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 mt-0.5">
                {opportunity.club && (
                  <span className="truncate">by {opportunity.club.name}</span>
                )}
                {opportunity.applicationDeadline && (
                  <span
                    className={`flex items-center gap-1 shrink-0 ${
                      isDeadlinePassed ? "text-rose-400 font-semibold" : "text-emerald-400"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {isDeadlinePassed
                      ? "Application Closed"
                      : `Deadline: ${deadlineDate?.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}`}
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Minimal Label */}
            <div className="min-w-0 flex-1 block md:hidden">
              <h4 className="text-xs font-bold text-zinc-100 truncate">
                {opportunity.title}
              </h4>
              <span className={`text-[10px] font-mono block truncate ${isDeadlinePassed ? "text-rose-400" : "text-zinc-400"}`}>
                {isDeadlinePassed ? "Closed" : opportunity.locationType.replace("_", " ")}
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <ShareOpportunityButton
                title={opportunity.title}
                className="!p-2 !rounded-xl text-xs"
              />
              <BookmarkButton
                opportunityId={opportunity.id}
                initialIsSaved={isSaved}
              />
              {isDeadlinePassed ? (
                <span className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono text-xs">
                  Closed
                </span>
              ) : (
                <RegisterApplyButton
                  opportunityId={opportunity.id}
                  externalUrl={opportunity.externalUrl}
                  initialIsRegistered={isRegistered}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
