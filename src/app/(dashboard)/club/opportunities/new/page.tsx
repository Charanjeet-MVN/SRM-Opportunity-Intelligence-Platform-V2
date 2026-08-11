import React from "react";
import { getMyClubProfileAction } from "@/lib/clubs/actions";
import OpportunityPublishingStudio from "@/components/dashboard/OpportunityPublishingStudio";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default async function CreateOpportunityPage() {
  const { club } = await getMyClubProfileAction();

  if (!club) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
        <h1 className="text-lg font-bold text-zinc-100">No Club Profile</h1>
        <p className="text-xs text-zinc-400">
          Your account is not linked to any active club organization.
        </p>
        <Link
          href="/register/club"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl"
        >
          Register Club
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/club"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Command Center</span>
        </Link>
      </div>
      <OpportunityPublishingStudio club={club} />
    </div>
  );
}
