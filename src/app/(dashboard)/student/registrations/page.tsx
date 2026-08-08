import React from "react";
import { getSavedOpportunitiesAction, getRegisteredOpportunitiesAction } from "@/lib/engagement/actions";
import StudentOpportunityTracker from "@/components/opportunities/StudentOpportunityTracker";
import { UserCheck } from "lucide-react";

export default async function StudentRegistrationsPage() {
  const { savedOpportunities } = await getSavedOpportunitiesAction();
  const { registeredOpportunities } = await getRegisteredOpportunitiesAction();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-indigo-950/30 border border-zinc-800/80 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Participation Audit</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
          Application & Registration Tracker
        </h1>
        <p className="text-xs text-zinc-400 max-w-xl">
          View official submission confirmations, attendance receipts, and upcoming application deadlines.
        </p>
      </div>

      {/* Interactive Opportunity Tracker Tabs */}
      <StudentOpportunityTracker
        initialSaved={savedOpportunities || []}
        initialRegistered={registeredOpportunities || []}
        initialTab="registered"
      />
    </div>
  );
}
