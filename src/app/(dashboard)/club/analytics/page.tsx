import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getClubAnalyticsAction } from "@/lib/clubs/analytics";
import ClubAnalyticsClient from "@/components/dashboard/ClubAnalyticsClient";
import { BarChart3 } from "lucide-react";
import { Club } from "@/types";

export default async function ClubAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch current user's club membership details
  const { data: memberRecord, error: memberError } = await supabase
    .from("club_members")
    .select("role, clubs(*)")
    .eq("user_id", user.id)
    .single();

  if (memberError || !memberRecord || !memberRecord.clubs) {
    return (
      <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
          <BarChart3 className="w-6 h-6 text-purple-400" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-zinc-200">Analytics Unavailable</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Please register your official SRM club profile to start tracking campaign reach and student engagement.
          </p>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clubData = memberRecord.clubs as any;
  const club: Club = {
    id: clubData.id,
    name: clubData.name,
    slug: clubData.slug,
    description: clubData.description || undefined,
    logoUrl: clubData.logo_url || undefined,
    category: clubData.category || undefined,
    verificationStatus: clubData.verification_status,
    verifiedAt: clubData.verified_at || undefined,
    verifiedBy: clubData.verified_by || undefined,
    officialEmail: clubData.official_email || undefined,
    createdAt: clubData.created_at,
    updatedAt: clubData.updated_at,
  };

  const { analytics, error } = await getClubAnalyticsAction();

  if (error || !analytics) {
    return (
      <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
          <BarChart3 className="w-6 h-6 text-purple-400" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-zinc-200">Analytics Load Failed</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {error || "An error occurred while loading your club campaign analytics. Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ClubAnalyticsClient club={club} analytics={analytics} />
    </div>
  );
}
