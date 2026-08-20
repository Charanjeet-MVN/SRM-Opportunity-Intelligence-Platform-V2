"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Opportunity, StudentProfile } from "@/types";
import OpportunityTypeBadge from "../OpportunityTypeBadge";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import BookmarkButton from "../BookmarkButton";
import RegisterApplyButton from "../RegisterApplyButton";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Flame,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface FeaturedEventHeroProps {
  featuredOpportunities: Opportunity[];
  studentProfile?: StudentProfile | null;
  onSelectDetail?: (opp: Opportunity) => void;
}

export default function FeaturedEventHero({
  featuredOpportunities,
  onSelectDetail,
}: FeaturedEventHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 220, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  if (!featuredOpportunities || featuredOpportunities.length === 0) return null;

  const currentEvent = featuredOpportunities[currentIndex] || featuredOpportunities[0];

  const now = new Date();
  const deadlineDate = currentEvent.applicationDeadline
    ? new Date(currentEvent.applicationDeadline)
    : null;
  const isDeadlinePassed = deadlineDate ? deadlineDate < now : false;

  let countdownText = "";
  let isUrgent = false;

  if (isDeadlinePassed) {
    countdownText = "Registration Closed";
  } else if (deadlineDate) {
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays <= 0) {
      isUrgent = true;
      countdownText = `Closing in ${diffHours}h`;
    } else if (diffDays <= 3) {
      isUrgent = true;
      countdownText = `${diffDays} days left`;
    } else {
      countdownText = `${diffDays} days remaining`;
    }
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredOpportunities.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredOpportunities.length) % featuredOpportunities.length);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1400px" }}
      className="relative w-full"
    >
      {/* Ambient Aurora Backlight */}
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-emerald-500/10 rounded-[40px] blur-3xl opacity-70 pointer-events-none transition-opacity duration-700" />

      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative rounded-3xl sm:rounded-[36px] bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-zinc-950/98 border border-zinc-700/60 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-3xl overflow-hidden"
      >
        {/* Apple Style Specular Glare */}
        <motion.div
          style={{
            background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255, 255, 255, 0.08) 0%, transparent 60%)`,
            opacity: isHovered ? 1 : 0,
            transform: "translateZ(30px)",
          }}
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 mix-blend-overlay"
        />

        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-7" style={{ transform: "translateZ(25px)" }}>
          {/* Header Row: Featured Indicator & Controls */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-gradient-to-r from-red-500/15 to-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Featured Campus Keynote</span>
              </div>
              <OpportunityTypeBadge type={currentEvent.type} />
              {currentEvent.club && (
                <VerificationBadge status={currentEvent.club.verificationStatus} />
              )}
            </div>

            {/* Slide Navigation Controls */}
            {featuredOpportunities.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  aria-label="Previous Featured Event"
                  className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-zinc-400 px-1">
                  {currentIndex + 1} / {featuredOpportunities.length}
                </span>
                <button
                  onClick={nextSlide}
                  aria-label="Next Featured Event"
                  className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Event Title & Summary */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEvent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-3 max-w-4xl"
            >
              <Link href={`/opportunities/${currentEvent.slug}`}>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white hover:text-indigo-300 transition-colors leading-[1.15]">
                  {currentEvent.title}
                </h1>
              </Link>

              {currentEvent.summary && (
                <p className="text-xs sm:text-sm lg:text-base text-zinc-300 font-light leading-relaxed max-w-3xl">
                  {currentEvent.summary}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Organizer Brand Strip */}
          {currentEvent.club && (
            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-indigo-400 text-sm overflow-hidden shrink-0 shadow-md">
                {currentEvent.club.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentEvent.club.logoUrl}
                    alt={currentEvent.club.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentEvent.club.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block tracking-wider">
                  Organized by Official SRM Chapter
                </span>
                <Link
                  href={`/clubs/${currentEvent.club.slug || currentEvent.club.id}`}
                  className="text-sm font-bold text-zinc-100 hover:text-indigo-300 transition-colors"
                >
                  {currentEvent.club.name}
                </Link>
              </div>
            </div>
          )}

          {/* Quick Specs Grid Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-800/80 font-mono text-xs">
            {/* Event Start Date */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-sky-400" /> Event Starts
              </span>
              <span className="text-zinc-200 font-semibold block truncate">
                {currentEvent.eventStartDate
                  ? new Date(currentEvent.eventStartDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "TBA by Club"}
              </span>
            </div>

            {/* Application Deadline */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> Deadline
              </span>
              <span
                className={`font-semibold block truncate ${
                  isDeadlinePassed ? "text-red-400" : isUrgent ? "text-amber-300" : "text-zinc-200"
                }`}
              >
                {currentEvent.applicationDeadline
                  ? new Date(currentEvent.applicationDeadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Rolling Entry"}
              </span>
            </div>

            {/* Venue / Mode */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-400" /> Campus / Venue
              </span>
              <span className="text-zinc-200 font-semibold block truncate">
                {currentEvent.locationAddress || currentEvent.locationType.replace("_", " ")}
              </span>
            </div>

            {/* Registration Status */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Status
              </span>
              <span
                className={`font-semibold block truncate ${
                  isDeadlinePassed ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {isDeadlinePassed ? "Closed" : countdownText || "Open for Entry"}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <RegisterApplyButton
                opportunityId={currentEvent.id}
                externalUrl={currentEvent.externalUrl}
              />
              <BookmarkButton opportunityId={currentEvent.id} />
              {onSelectDetail && (
                <button
                  type="button"
                  onClick={() => onSelectDetail(currentEvent)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-mono font-medium text-indigo-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Quick Preview</span>
                </button>
              )}
              <Link
                href={`/opportunities/${currentEvent.slug}`}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-medium text-zinc-200 hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <span>View Full Page</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              </Link>
            </div>

            {/* Indicator Pills */}
            <div className="flex items-center gap-1.5">
              {featuredOpportunities.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === currentIndex ? "w-6 bg-indigo-400" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
