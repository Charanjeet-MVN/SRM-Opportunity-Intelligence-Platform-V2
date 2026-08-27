"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PublicClubRecord } from "@/lib/clubs/actions";
import VerificationBadge from "../VerificationBadge";
import {
  Mail,
  Layers,
  ShieldCheck,
  Share2,
  Check,
  Building2,
} from "lucide-react";

interface ClubProfileHeroProps {
  club: PublicClubRecord;
}

export default function ClubProfileHero({ club }: ClubProfileHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const isVerified = club.verificationStatus === "verified";

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: `${club.name} | SRM Campus Organization`,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl bg-gradient-to-br from-zinc-900/95 via-zinc-950/90 to-purple-950/25 border border-zinc-800/80 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-2xl overflow-hidden space-y-8 group"
    >
      {/* Background Ambient Lights */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/15 transition-all duration-700" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Ambient Line */}
      <div
        className={`absolute top-0 inset-x-0 h-1 transition-all duration-500 pointer-events-none ${
          isVerified
            ? "bg-gradient-to-r from-blue-500/40 via-blue-400 to-indigo-500/40"
            : "bg-gradient-to-r from-purple-500/20 via-purple-500/60 to-purple-500/20"
        }`}
      />

      <div className="relative z-10 space-y-6">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900/90 border border-zinc-800 text-zinc-300 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isVerified ? "bg-blue-400" : "bg-purple-400"}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isVerified ? "bg-blue-500" : "bg-purple-500"}`} />
              </span>
              <span className={`font-semibold uppercase tracking-wider text-[9px] ${isVerified ? "text-blue-400" : "text-purple-400"}`}>
                {isVerified ? "Official SRM Organization" : club.verificationStatus === "pending_review" ? "Pending Verification" : "SRM Campus Collective"}
              </span>
            </div>

            {club.category && (
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-zinc-900/80 border border-zinc-800 text-indigo-300 uppercase tracking-wider capitalize">
                {club.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <VerificationBadge status={club.verificationStatus} />
            <button
              onClick={handleShare}
              title="Share Organization Profile"
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-mono"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px]">Copied</span>
                </>
              ) : (
                <Share2 className="w-3.5 h-3.5 text-purple-400" />
              )}
            </button>
          </div>
        </div>

        {/* Club Avatar + Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center font-bold text-indigo-400 text-3xl overflow-hidden shrink-0 shadow-2xl group-hover:border-purple-500/50 transition-colors">
            {club.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={club.logoUrl}
                alt={club.name}
                className="w-full h-full object-cover"
              />
            ) : (
              club.name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {club.name}
            </h1>
            {club.description && (
              <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                {club.description}
              </p>
            )}
          </div>
        </div>

        {/* Specs Grid Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-800/80 font-mono text-xs max-w-3xl">
          {/* Active Opportunities */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Active Postings
            </span>
            <span className="text-base font-bold text-zinc-100 font-mono">
              {club.opportunityCount} {club.opportunityCount === 1 ? "Opportunity" : "Opportunities"}
            </span>
          </div>

          {/* Official Contact */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> Official Channel
            </span>
            <span className="text-zinc-200 font-semibold block truncate">
              {club.officialEmail || "SRM Student Gateway"}
            </span>
          </div>

          {/* Institutional Status */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SRM Accreditation
            </span>
            <span className="text-emerald-400 font-semibold block capitalize">
              {isVerified ? "Verified Official" : club.verificationStatus.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
