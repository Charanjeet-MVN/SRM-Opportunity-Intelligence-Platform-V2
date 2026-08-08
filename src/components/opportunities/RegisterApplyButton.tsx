"use client";

import React, { useState } from "react";
import { recordRegistrationAction } from "@/lib/engagement/actions";
import { ExternalLink, CheckCircle2, Loader2 } from "lucide-react";

interface RegisterApplyButtonProps {
  opportunityId: string;
  externalUrl?: string;
  initialIsRegistered?: boolean;
}

export default function RegisterApplyButton({
  opportunityId,
  externalUrl,
  initialIsRegistered = false,
}: RegisterApplyButtonProps) {
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Record registration in Supabase
      const res = await recordRegistrationAction(opportunityId);
      if (res.success) {
        setIsRegistered(true);
      }
    } catch {
      // Ignore errors if unauthenticated
    } finally {
      setLoading(false);
    }

    // Safely open external application URL
    if (externalUrl) {
      window.open(externalUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (!externalUrl) {
    return (
      <span className="text-xs text-zinc-500 italic font-mono">
        No external application link specified.
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`py-2.5 px-5 rounded-xl text-xs font-semibold shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
        isRegistered
          ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 shadow-emerald-500/10"
          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25"
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isRegistered ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <ExternalLink className="w-3.5 h-3.5" />
      )}
      <span>{isRegistered ? "Registered (Open Link)" : "Register / Apply"}</span>
    </button>
  );
}
