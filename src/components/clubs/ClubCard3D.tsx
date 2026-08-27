"use client";

import React from "react";
import Link from "next/link";
import { PublicClubRecord } from "@/lib/clubs/actions";
import VerificationBadge from "./VerificationBadge";
import SpatialCard3D from "@/components/3d/SpatialCard3D";
import {
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react";

interface ClubCard3DProps {
  club: PublicClubRecord;
}

export default function ClubCard3D({ club }: ClubCard3DProps) {
  const clubSlugOrId = club.slug || club.id;
  const isVerified = club.verificationStatus === "verified";
  const hasOpportunities = club.opportunityCount > 0;

  return (
    <SpatialCard3D
      depth={8}
      elevationZ={16}
      glowColor={isVerified ? "rgba(59, 130, 246, 0.2)" : "rgba(147, 51, 234, 0.16)"}
      className="h-full"
    >
      <div
        role="article"
        aria-label={`Club: ${club.name}`}
        className="group rounded-3xl bg-zinc-950/85 border border-zinc-800/80 hover:border-purple-500/50 p-6 flex flex-col justify-between transition-all duration-300 shadow-2xl backdrop-blur-xl h-full space-y-5 relative overflow-hidden"
      >
        {/* Top ambient illumination line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 transition-all duration-500 pointer-events-none ${
            isVerified
              ? "bg-gradient-to-r from-blue-500/40 via-blue-400 to-indigo-500/40"
              : "bg-gradient-to-r from-purple-500/20 via-purple-500/60 to-purple-500/20"
          }`}
        />

        <div className="space-y-4 pt-1">
          {/* Header Row: Logo Avatar + Official Verification Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-indigo-400 text-xl overflow-hidden shrink-0 shadow-md group-hover:scale-105 group-hover:border-purple-500/40 transition-all">
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

            <VerificationBadge status={club.verificationStatus} />
          </div>

          {/* Title & Domain/Category */}
          <div className="space-y-1.5">
            <Link href={`/clubs/${clubSlugOrId}`}>
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-1">
                {club.name}
              </h3>
            </Link>

            {club.category && (
              <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-indigo-300 uppercase tracking-wider capitalize">
                {club.category}
              </span>
            )}
          </div>

          {/* Short Description */}
          {club.description && (
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-light">
              {club.description}
            </p>
          )}
        </div>

        {/* Footer Row: Activity Signal & Primary CTA */}
        <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono gap-2">
          {/* Real Measurable Signal */}
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] truncate">
            {hasOpportunities ? (
              <>
                <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="text-purple-300 font-semibold truncate">
                  {club.opportunityCount} upcoming {club.opportunityCount === 1 ? "opportunity" : "opportunities"}
                </span>
              </>
            ) : isVerified ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-blue-300 font-medium truncate">Official SRM Chapter</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="text-zinc-500 truncate">Active Chapter</span>
              </>
            )}
          </div>

          <Link
            href={`/clubs/${clubSlugOrId}`}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1 group/btn shrink-0 cursor-pointer"
          >
            <span>View Club</span>
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </SpatialCard3D>
  );
}
