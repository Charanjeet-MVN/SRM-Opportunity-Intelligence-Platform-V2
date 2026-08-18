"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Club } from "@/types";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import {
  Building2,
  Mail,
  ArrowRight,
} from "lucide-react";

interface OrganizerSpotlightCardProps {
  club?: Club;
}

export default function OrganizerSpotlightCard({ club }: OrganizerSpotlightCardProps) {
  if (!club) {
    return (
      <div className="rounded-3xl bg-zinc-950/70 border border-zinc-800/80 p-6 backdrop-blur-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-zinc-500 font-bold">
          <Building2 className="w-4 h-4" /> Organizer
        </div>
        <p className="text-xs text-zinc-400 font-light">
          Published directly by SRM Institute of Science and Technology.
        </p>
      </div>
    );
  }

  const clubSlugOrId = club.slug || club.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-3xl bg-gradient-to-br from-zinc-900/90 via-zinc-950/90 to-purple-950/20 border border-zinc-800/80 p-6 sm:p-7 backdrop-blur-2xl shadow-2xl space-y-5 overflow-hidden group"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-600/15 transition-all duration-700" />

      {/* Header Label */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/70 pb-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
          <Building2 className="w-4 h-4" />
          <span>Organizer Spotlight</span>
        </div>

        <VerificationBadge status={club.verificationStatus} />
      </div>

      {/* Club Identity Card */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-indigo-400 text-lg overflow-hidden shrink-0 shadow-inner group-hover:border-purple-500/40 transition-colors">
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

        <div className="space-y-1 flex-1 min-w-0">
          <Link
            href={`/clubs/${clubSlugOrId}`}
            className="text-base sm:text-lg font-bold text-zinc-100 hover:text-purple-300 transition-colors line-clamp-1 block"
          >
            {club.name}
          </Link>
          {club.category && (
            <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-indigo-300">
              {club.category}
            </span>
          )}
        </div>
      </div>

      {/* Club Description / Bio */}
      {club.description && (
        <p className="text-xs text-zinc-300 leading-relaxed font-light line-clamp-3">
          {club.description}
        </p>
      )}

      {/* Contact & Meta Row */}
      <div className="space-y-2 pt-2 border-t border-zinc-800/70 text-xs font-mono">
        {club.officialEmail && (
          <div className="flex items-center gap-2 text-zinc-400 truncate">
            <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="truncate">{club.officialEmail}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link
            href={`/clubs/${clubSlugOrId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors group-hover:translate-x-1 duration-200"
          >
            <span>Explore Club Profile & Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
