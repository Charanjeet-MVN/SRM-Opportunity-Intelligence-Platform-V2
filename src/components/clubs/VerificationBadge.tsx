"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClubVerificationStatus } from "@/types";
import { ShieldCheck, ShieldAlert, Clock, XCircle } from "lucide-react";

interface VerificationBadgeProps {
  status: ClubVerificationStatus;
  showIcon?: boolean;
  interactive?: boolean;
}

export default function VerificationBadge({
  status,
  showIcon = true,
  interactive = true,
}: VerificationBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  let badgeConfig = {
    label: "Unverified Organization",
    tooltip: "Unverified Organization. Published opportunities undergo standard platform moderation.",
    bg: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20",
    icon: ShieldAlert,
  };

  if (status === "verified") {
    badgeConfig = {
      label: "Official SRM Club",
      tooltip: "Verified by the SRM Opportunity Platform.",
      bg: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20",
      icon: ShieldCheck,
    };
  } else if (status === "pending_review") {
    badgeConfig = {
      label: "Verification Pending Review",
      tooltip: "Charter endorsement documents under administrative evaluation.",
      bg: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20",
      icon: Clock,
    };
  } else if (status === "rejected") {
    badgeConfig = {
      label: "Verification Declined",
      tooltip: "Organization verification request declined by administrators.",
      bg: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20",
      icon: XCircle,
    };
  }

  const Icon = badgeConfig.icon;

  if (!interactive) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeConfig.bg}`}>
        {showIcon && <Icon className={`w-3.5 h-3.5 ${status === "pending_review" ? "animate-pulse" : ""}`} />}
        <span>{badgeConfig.label}</span>
      </span>
    );
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip((t) => !t)}
    >
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${badgeConfig.bg}`}
      >
        {showIcon && <Icon className={`w-3.5 h-3.5 ${status === "pending_review" ? "animate-pulse" : ""}`} />}
        <span>{badgeConfig.label}</span>
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 bottom-full mb-2 z-40 w-64 p-3 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-xl text-left space-y-1"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
              <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Trust Verification Status</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
              {badgeConfig.tooltip}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
