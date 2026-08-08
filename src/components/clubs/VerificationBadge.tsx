import React from "react";
import { ClubVerificationStatus } from "@/types";
import { ShieldCheck, ShieldAlert, Clock, XCircle } from "lucide-react";

interface VerificationBadgeProps {
  status: ClubVerificationStatus;
  showIcon?: boolean;
}

export default function VerificationBadge({
  status,
  showIcon = true,
}: VerificationBadgeProps) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
        {showIcon && <ShieldCheck className="w-3.5 h-3.5" />}
        <span>Official SRM Club</span>
      </span>
    );
  }

  if (status === "pending_review") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
        {showIcon && <Clock className="w-3.5 h-3.5 animate-pulse" />}
        <span>Verification Pending Review</span>
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
        {showIcon && <XCircle className="w-3.5 h-3.5" />}
        <span>Verification Declined</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
      {showIcon && <ShieldAlert className="w-3.5 h-3.5" />}
      <span>Unverified Organization</span>
    </span>
  );
}
