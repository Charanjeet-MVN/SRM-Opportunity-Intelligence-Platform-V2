import React from "react";
import { getOpportunityAnalyticsAction } from "@/lib/clubs/analytics";
import OpportunityAnalyticsClient from "@/components/dashboard/OpportunityAnalyticsClient";
import { notFound, redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";

interface OpportunityAnalyticsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OpportunityAnalyticsPage({ params }: OpportunityAnalyticsPageProps) {
  const { slug } = await params;
  
  if (!slug) {
    notFound();
  }

  const { analytics, error } = await getOpportunityAnalyticsAction(slug);

  if (error) {
    if (error.includes("Unauthorized")) {
      redirect("/dashboard/club");
    }
    return (
      <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
          <BarChart3 className="w-6 h-6 text-purple-400" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-zinc-200">Analytics Error</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {error || "An error occurred while fetching analytics for this opportunity listing."}
          </p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <OpportunityAnalyticsClient analytics={analytics} />
    </div>
  );
}
