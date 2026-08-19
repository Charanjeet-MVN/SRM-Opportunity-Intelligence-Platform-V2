"use client";

import React from "react";
import Link from "next/link";
import { PublicClubRecord } from "@/lib/clubs/actions";
import VerificationBadge from "./VerificationBadge";
import SpatialCard3D from "@/components/3d/SpatialCard3D";
import {
  ArrowRight,
  Layers,
} from "lucide-react";

interface ClubCard3DProps {
  club: PublicClubRecord;
}

export default function ClubCard3D({ club }: ClubCard3DProps) {
  const clubSlugOrId = club.slug || club.id;

  return (
    <SpatialCard3D
      depth={8}
      elevationZ={18}
      glowColor="rgba(147, 51, 234, 0.18)"
      className="h-full"
    >
      <div
        role="article"
        aria-label={`Club: ${club.name}`}
        className="group rounded-3xl bg-zinc-950/85 border border-zinc-800/80 hover:border-purple-500/50 p-6 flex flex-col justify-between transition-all duration-300 shadow-2xl backdrop-blur-xl h-full space-y-5 relative overflow-hidden"
      >
        {/* Top ambient illumination line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/0 to-transparent group-hover:via-purple-500/60 transition-all duration-500 pointer-events-none" />

        <div className="space-y-4">
          {/* Header Row: Logo + Verification Badge */}
          <div className="flex items-center justify-between gap-3">
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

          {/* Title & Category */}
          <div className="space-y-1">
            <Link href={`/clubs/${clubSlugOrId}`}>
              <h3 className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-1">
                {club.name}
              </h3>
            </Link>

            {club.category && (
              <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-indigo-300 uppercase tracking-wider">
                {club.category}
              </span>
            )}
          </div>

          {/* Description */}
          {club.description && (
            <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed font-light">
              {club.description}
            </p>
          )}
        </div>

        {/* Footer Meta Row */}
        <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>
              {club.opportunityCount > 0
                ? `${club.opportunityCount} Active ${club.opportunityCount === 1 ? "Post" : "Posts"}`
                : "Active Chapter"}
            </span>
          </div>

          <Link
            href={`/clubs/${clubSlugOrId}`}
            className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 group/btn shrink-0"
          >
            <span>Explore Club</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </SpatialCard3D>
  );
}
