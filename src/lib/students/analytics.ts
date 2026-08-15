"use server";

import { createClient } from "@/lib/supabase/server";

export interface StudentAnalyticsOverview {
  totalEcosystemOpportunities: number;
  savedCount: number;
  registeredCount: number;
  completedCount: number;
  journey: {
    discoveredCount: number;
    savedCount: number;
    trackingCount: number;
    appliedCount: number;
    completedCount: number;
  };
  savedTimeline: {
    date: string;
    title: string;
    type: string;
    clubName: string;
    opportunitySlug: string;
  }[];
  registrationTimeline: {
    date: string;
    title: string;
    status: string;
    clubName: string;
    opportunitySlug: string;
  }[];
  typeDistribution: { type: string; count: number }[];
}

/**
 * Server Action: Fetches real student interaction analytics from Supabase
 */
export async function getStudentAnalyticsAction(): Promise<{
  analytics: StudentAnalyticsOverview | null;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { analytics: null, error: "Authentication required" };

  // Fetch total published opportunities in the system (Discovered pool)
  const { count: totalPublished, error: totalError } = await supabase
    .from("opportunities")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  if (totalError) return { analytics: null, error: totalError.message };

  // Fetch saved opportunities
  const { data: savedData, error: savedError } = await supabase
    .from("saved_opportunities")
    .select(`
      created_at,
      opportunities (
        id,
        title,
        slug,
        type,
        status,
        application_deadline,
        event_start_date,
        clubs ( name )
      )
    `)
    .eq("user_id", user.id);

  if (savedError) return { analytics: null, error: savedError.message };

  // Fetch registrations
  const { data: regData, error: regError } = await supabase
    .from("registrations")
    .select(`
      registered_at,
      status,
      opportunities (
        id,
        title,
        slug,
        type,
        status,
        application_deadline,
        event_start_date,
        clubs ( name )
      )
    `)
    .eq("user_id", user.id);

  if (regError) return { analytics: null, error: regError.message };

  // Typesafe conversions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const savedList = (savedData || []).filter((item: any) => item.opportunities !== null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const regList = (regData || []).filter((item: any) => item.opportunities !== null);

  const savedCount = savedList.length;
  const registeredCount = regList.length;
  const completedCount = regList.filter((r) => r.status === "attended").length;

  // Active tracking: items with deadlines in the future or no deadline yet
  const now = new Date();
  const trackingSet = new Set<string>();

  savedList.forEach((s) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opp = s.opportunities as any;
    if (opp) {
      const deadline = opp.application_deadline ? new Date(opp.application_deadline) : null;
      if (!deadline || deadline > now) {
        trackingSet.add(opp.id);
      }
    }
  });

  regList.forEach((r) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opp = r.opportunities as any;
    if (opp) {
      const deadline = opp.application_deadline ? new Date(opp.application_deadline) : null;
      if (!deadline || deadline > now) {
        trackingSet.add(opp.id);
      }
    }
  });

  const trackingCount = trackingSet.size;

  // Map timelines
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const savedTimeline = savedList.map((s: any) => ({
    date: s.created_at,
    title: s.opportunities.title,
    type: s.opportunities.type,
    clubName: s.opportunities.clubs?.name || "SRM Organization",
    opportunitySlug: s.opportunities.slug,
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const registrationTimeline = regList.map((r: any) => ({
    date: r.registered_at,
    title: r.opportunities.title,
    status: r.status,
    clubName: r.opportunities.clubs?.name || "SRM Organization",
    opportunitySlug: r.opportunities.slug,
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Aggregate opportunity types distribution
  const typeMap: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  savedList.forEach((s: any) => {
    const t = s.opportunities.type;
    typeMap[t] = (typeMap[t] || 0) + 1;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  regList.forEach((r: any) => {
    const t = r.opportunities.type;
    typeMap[t] = (typeMap[t] || 0) + 1;
  });

  const typeDistribution = Object.entries(typeMap)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  return {
    analytics: {
      totalEcosystemOpportunities: totalPublished || 0,
      savedCount,
      registeredCount,
      completedCount,
      journey: {
        discoveredCount: totalPublished || 0,
        savedCount,
        trackingCount,
        appliedCount: registeredCount,
        completedCount,
      },
      savedTimeline,
      registrationTimeline,
      typeDistribution,
    },
  };
}
