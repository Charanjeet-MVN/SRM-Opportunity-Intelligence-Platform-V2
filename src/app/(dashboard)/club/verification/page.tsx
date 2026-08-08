"use client";

import React, { useActionState, useEffect, useState } from "react";
import { getMyClubProfileAction, submitVerificationRequestAction, ClubFormState } from "@/lib/clubs/actions";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import { Club } from "@/types";
import { ShieldCheck, FileText, UploadCloud, AlertCircle, CheckCircle2, Link as LinkIcon } from "lucide-react";

export default function ClubVerificationPage() {
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  const [state, formAction, isPending] = useActionState<ClubFormState, FormData>(
    submitVerificationRequestAction,
    {}
  );

  useEffect(() => {
    getMyClubProfileAction().then((res) => {
      if (res.club) setClub(res.club);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-xs text-zinc-500 font-mono">
        Loading Club Credentials...
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-xs text-zinc-400">
        No club profile associated with this account.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
            Official SRM Verification Portal
          </h1>
          <VerificationBadge status={club.verificationStatus} />
        </div>
        <p className="text-xs text-zinc-400">
          Official SRM Club status guarantees students that your published opportunities are authentic, verified, and endorsed.
        </p>
      </div>

      {state.error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {state.message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{state.message}</span>
        </div>
      )}

      {/* Guidelines Box */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
        <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Verification Requirements & Instructions
        </h2>
        <ul className="space-y-2 text-xs text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
            <span>Upload your Official Club Charter / Faculty Coordinator Endorsement Letter to a shared Google Drive, OneDrive, or document repository.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
            <span>Ensure link permissions are set to <strong>"Anyone with link can view"</strong>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
            <span>Our Super Admin moderation team will review credentials within 24-48 hours.</span>
          </li>
        </ul>
      </div>

      {/* Submission Form */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-5">
        <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-amber-400" />
          Submit Credentials for Review
        </h2>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="clubId" value={club.id} />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Document Verification URL (Google Drive / OneDrive Link)
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="url"
                name="documentsUrl"
                required
                placeholder="https://drive.google.com/file/d/your-endorsement-document"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || club.verificationStatus === "pending_review"}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <span>Submitting Verification...</span>
            ) : club.verificationStatus === "pending_review" ? (
              <span>Verification Pending Review</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Submit Official Verification Request</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
