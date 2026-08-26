"use client";

import React, { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Opportunity } from "@/types";
import OpportunityTypeBadge from "../OpportunityTypeBadge";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import BookmarkButton from "../BookmarkButton";
import RegisterApplyButton from "../RegisterApplyButton";
import ShareOpportunityButton from "./ShareOpportunityButton";
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface OpportunityHero3DProps {
  opportunity: Opportunity;
  isRegistered?: boolean;
  isSaved?: boolean;
}

export default function OpportunityHero3D({
  opportunity,
  isRegistered = false,
  isSaved = false,
}: OpportunityHero3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 220, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);
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

  // Deadline & Countdown Logic
  const now = new Date();
  const deadlineDate = opportunity.applicationDeadline
    ? new Date(opportunity.applicationDeadline)
    : null;
  const isDeadlinePassed = deadlineDate ? deadlineDate < now : false;

  let countdownText = "";
  let urgencyLevel: "normal" | "urgent" | "critical" | "closed" = "normal";

  if (isDeadlinePassed) {
    urgencyLevel = "closed";
    countdownText = "Application Closed";
  } else if (deadlineDate) {
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays <= 0) {
      urgencyLevel = "critical";
      countdownText = `Closing in ${diffHours} hours`;
    } else if (diffDays <= 3) {
      urgencyLevel = "urgent";
      countdownText = `Only ${diffDays} days left`;
    } else {
      countdownText = `${diffDays} days remaining`;
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1400px" }}
      className="relative w-full"
    >
      {/* Dynamic Ambient Aurora Backlight */}
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-emerald-500/10 rounded-[40px] blur-3xl opacity-70 pointer-events-none transition-opacity duration-700" />

      {/* 3D Spatial Canvas */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative rounded-[32px] sm:rounded-[36px] bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-zinc-950/98 border border-zinc-700/60 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-3xl overflow-hidden"
      >
        {/* Apple Style Specular Glare Reflection */}
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

        {/* Hero Content Container */}
        <div className="relative z-10 space-y-8" style={{ transform: "translateZ(25px)" }}>
          {/* Top Metadata Row (Badges, Status, Urgency) */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 flex-wrap">
              <OpportunityTypeBadge type={opportunity.type} />
              {opportunity.club && (
                <VerificationBadge status={opportunity.club.verificationStatus} />
              )}
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-zinc-900/90 text-zinc-300 border border-zinc-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="capitalize">{opportunity.locationType.replace("_", " ")}</span>
              </span>
            </div>

            {/* Live Registration / Deadline Status Pill */}
            {deadlineDate && (
              <div
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono flex items-center gap-2 border shadow-sm ${
                  urgencyLevel === "closed"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
                    : urgencyLevel === "critical"
                    ? "bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse font-bold"
                    : urgencyLevel === "urgent"
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/25 font-semibold"
                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{countdownText}</span>
              </div>
            )}
          </div>

          {/* Main Title & Executive Subtitle */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] text-balance">
              {opportunity.title}
            </h1>

            {opportunity.summary && (
              <p className="text-sm sm:text-base lg:text-lg text-zinc-300 font-light leading-relaxed max-w-3xl">
                {opportunity.summary}
              </p>
            )}
          </div>

          {/* Organizer Brand Capsule */}
          {opportunity.club && (
            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-indigo-400 text-sm overflow-hidden shrink-0 shadow-md">
                {opportunity.club.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={opportunity.club.logoUrl}
                    alt={opportunity.club.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  opportunity.club.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block tracking-wider">
                  {opportunity.club.verificationStatus === "verified"
                    ? "Official SRM Club ✓"
                    : "Organized by SRM Campus Entity"}
                </span>
                <Link
                  href={`/clubs/${opportunity.club.slug || opportunity.club.id}`}
                  className="text-sm sm:text-base font-bold text-zinc-100 hover:text-indigo-300 transition-colors inline-flex items-center gap-1.5 group"
                >
                  <span>{opportunity.club.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
          )}

          {/* Quick Specs Grid Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-zinc-800/80 font-mono text-xs">
            {/* Event Start Date */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-sky-400" /> Event Starts
              </span>
              <span className="text-zinc-200 font-semibold block truncate">
                {opportunity.eventStartDate
                  ? new Date(opportunity.eventStartDate).toLocaleDateString("en-US", {
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
                  isDeadlinePassed ? "text-rose-400" : "text-zinc-200"
                }`}
              >
                {opportunity.applicationDeadline
                  ? new Date(opportunity.applicationDeadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Rolling Admissions"}
              </span>
            </div>

            {/* Venue / Campus */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-400" /> Campus / Venue
              </span>
              <span className="text-zinc-200 font-semibold block truncate">
                {opportunity.locationAddress || opportunity.locationType.replace("_", " ")}
              </span>
            </div>

            {/* Registration Status */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Status
              </span>
              <span
                className={`font-semibold block truncate ${
                  isRegistered
                    ? "text-emerald-400"
                    : isDeadlinePassed
                    ? "text-rose-400"
                    : "text-indigo-300"
                }`}
              >
                {isRegistered ? "Registered" : isDeadlinePassed ? "Closed" : "Open for Entry"}
              </span>
            </div>
          </div>

          {/* Primary Action CTA Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              {isDeadlinePassed ? (
                <button
                  disabled
                  className="py-2.5 px-5 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
                >
                  Application Closed
                </button>
              ) : (
                <RegisterApplyButton
                  opportunityId={opportunity.id}
                  externalUrl={opportunity.externalUrl}
                  initialIsRegistered={isRegistered}
                />
              )}
              <BookmarkButton
                opportunityId={opportunity.id}
                initialIsSaved={isSaved}
              />
              <ShareOpportunityButton title={opportunity.title} />
            </div>

            <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Verified SRM Student Gateway</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
