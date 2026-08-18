"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Share2,
  Check,
  Mail,
  Github,
  Linkedin,
  Globe,
} from "lucide-react";

interface StudentProfileHeroProps {
  fullName: string;
  department?: string;
  yearOfStudy?: number | string;
  registerNumber?: string;
  email?: string;
  bio?: string;
  contact?: {
    email?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  score?: number;
  isPublicView?: boolean;
}

export default function StudentProfileHero({
  fullName,
  department,
  yearOfStudy,
  registerNumber,
  email,
  bio,
  contact,
  score = 92,
  isPublicView = false,
}: StudentProfileHeroProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const initialLetter = fullName ? fullName.charAt(0).toUpperCase() : "S";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-zinc-900/95 via-zinc-950/90 to-purple-950/25 border border-zinc-800/80 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-2xl overflow-hidden space-y-8 group"
    >
      {/* Ambient Aurora Backlighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/15 transition-all duration-700" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Illumination Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900/90 border border-zinc-800 text-zinc-300 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
              </span>
              <span className="text-purple-400 font-semibold uppercase tracking-wider text-[9px]">
                SRM Student Identity
              </span>
              <span className="text-zinc-600">•</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-400 text-[10px]">Verified Scholar</span>
            </div>

            {department && (
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-zinc-900/80 border border-zinc-800 text-indigo-300 uppercase tracking-wider">
                {department}
              </span>
            )}

            {yearOfStudy && (
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-zinc-900/80 border border-zinc-800 text-purple-300 uppercase tracking-wider">
                Year {yearOfStudy}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Copy Profile URL"
              className="px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied URL</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Share Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Avatar + Main Information */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center font-black text-indigo-400 text-3xl sm:text-4xl overflow-hidden shrink-0 shadow-2xl group-hover:border-purple-500/50 transition-all">
              {initialLetter}
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                {fullName || "Student Profile"}
              </h1>

              <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 flex-wrap">
                {registerNumber && (
                  <span className="text-zinc-300">Reg: {registerNumber}</span>
                )}
                {email && (
                  <>
                    <span className="text-zinc-600 hidden sm:inline">•</span>
                    <span className="text-zinc-400">{email}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Intelligence Gauge */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2 sm:w-56 shrink-0 shadow-lg">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 uppercase text-[10px] font-bold">
                Profile Vector
              </span>
              <span className="text-purple-400 font-bold">{score}% Match Ready</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${Math.min(score, 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 block">
              Audited by SRM Opportunity Platform
            </span>
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed max-w-3xl pt-1">
            {bio}
          </p>
        )}

        {/* Social / Contact Links Strip */}
        {contact && (
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-zinc-800/80 text-xs font-mono text-zinc-400">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-1.5 hover:text-purple-300 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{contact.email}</span>
              </a>
            )}
            {contact.github && (
              <a
                href={`https://${contact.github.replace("https://", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-purple-300 transition-colors"
              >
                <Github className="w-3.5 h-3.5 text-purple-400" />
                <span>{contact.github}</span>
              </a>
            )}
            {contact.linkedin && (
              <a
                href={`https://${contact.linkedin.replace("https://", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-purple-300 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                <span>{contact.linkedin}</span>
              </a>
            )}
            {contact.website && (
              <a
                href={`https://${contact.website.replace("https://", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-purple-300 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>{contact.website}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
