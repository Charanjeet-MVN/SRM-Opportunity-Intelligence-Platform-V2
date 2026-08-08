"use client";

import React, { useActionState, useEffect, useState } from "react";
import { getPendingVerificationsAction, reviewVerificationAction, ClubFormState } from "@/lib/clubs/actions";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import { ClubVerificationRequest } from "@/types";
import { ShieldCheck, ExternalLink, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";

type ExtendedRequest = ClubVerificationRequest & { clubName: string; officialEmail: string };

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState<ExtendedRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [state, formAction, isPending] = useActionState<ClubFormState, FormData>(
    reviewVerificationAction,
    {}
  );

  useEffect(() => {
    getPendingVerificationsAction().then((res) => {
      setRequests(res.requests || []);
      setLoading(false);
    });
  }, [state]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-xs text-zinc-500 font-mono">
        Loading Verification Audit Queue...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Super Admin Governance Queue
        </div>
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
          Club Verification Queue
        </h1>
        <p className="text-xs text-zinc-400">
          Review faculty endorsement documents and grant official SRM trust badges to legitimate organizations.
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

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
          <ShieldCheck className="w-8 h-8 text-zinc-600 mx-auto" />
          <h2 className="text-sm font-semibold text-zinc-300">No Pending Requests</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            All submitted club verification requests have been processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">{req.clubName}</h3>
                  <p className="text-xs text-zinc-400 font-mono">{req.officialEmail}</p>
                </div>
                <VerificationBadge status={req.status} />
              </div>

              {req.documentsUrl && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-500">Document URL:</span>
                  <a
                    href={req.documentsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 underline"
                  >
                    <span>View Submitted Verification File</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Review Actions Form */}
              {req.status === "pending_review" && (
                <form action={formAction} className="pt-2 border-t border-zinc-800/60 space-y-3">
                  <input type="hidden" name="requestId" value={req.id} />
                  <input type="hidden" name="clubId" value={req.clubId} />

                  <input
                    type="text"
                    name="reviewerNotes"
                    placeholder="Optional reviewer notes / decision rationale..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      name="decision"
                      value="verified"
                      disabled={isPending}
                      className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Grant Official Badge</span>
                    </button>

                    <button
                      type="submit"
                      name="decision"
                      value="rejected"
                      disabled={isPending}
                      className="py-2 px-4 rounded-xl bg-zinc-800 hover:bg-red-600 text-zinc-300 hover:text-white font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline Request</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
