"use client";

import React from "react";
import { PublicClubRecord } from "@/lib/clubs/actions";
import {
  ShieldCheck,
  Mail,
  Users2,
} from "lucide-react";

interface ClubContactCardProps {
  club: PublicClubRecord;
}

export default function ClubContactCard({ club }: ClubContactCardProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-purple-950/20 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-emerald-400 tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Institutional Verification & Governance</span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          SRM DSA Endorsement
        </span>
      </div>

      {/* Compliance Narrative */}
      <p className="text-xs text-zinc-300 font-light leading-relaxed">
        {club.verificationStatus === "verified"
          ? `Verified by the SRM Opportunity Intelligence Platform${club.verifiedAt ? ` on ${new Date(club.verifiedAt).toLocaleDateString()}` : ""}. Credentials, event charters, and student leadership rosters are audited by university administrators.`
          : club.verificationStatus === "pending_review"
          ? "Verification documentation has been submitted and is currently pending administrative review."
          : "Unverified campus collective. Listings undergo standard automated security moderation."}
      </p>

      {/* Official Communication Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
          <span className="text-[10px] text-zinc-500 uppercase block">Official Email</span>
          <span className="text-zinc-200 font-semibold flex items-center gap-1.5 truncate">
            <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{club.officialEmail || "N/A"}</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
          <span className="text-[10px] text-zinc-500 uppercase block">Campus Recruitment</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <Users2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Open via Opportunity Posts</span>
          </span>
        </div>
      </div>
    </div>
  );
}
