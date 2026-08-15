import React from "react";
import { getSavedOpportunitiesAction } from "@/lib/engagement/actions";
import StudentWorkspaceClient from "@/components/dashboard/StudentWorkspaceClient";
import { Sparkles } from "lucide-react";

export default async function StudentWorkspacePage() {
  const { savedOpportunities } = await getSavedOpportunitiesAction();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-purple-950/30 border border-zinc-800/80 space-y-2 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personal AI Workspace</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
          Campus Career Operating Space
        </h1>
        <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
          Manage your career targets, study notes, target goals, and generate custom learning roadmaps using the AI Career Copilot.
        </p>
      </div>

      {/* Main client component */}
      <StudentWorkspaceClient initialSavedOpportunities={savedOpportunities || []} />
    </div>
  );
}
