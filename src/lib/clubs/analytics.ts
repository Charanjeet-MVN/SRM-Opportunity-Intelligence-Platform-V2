"use server";

import { createClient } from "@/lib/supabase/server";

export interface ClubAnalyticsOverview {
  publishedCount: number;
  draftCount: number;
  totalSavedBookmarks: number;
  totalApplicationsRecorded: number;
  departmentDistribution: { department: string; count: number }[];
  skillDemandDistribution: { skill: string; count: number }[];
  opportunityPerformance: {
    id: string;
    title: string;
    type: string;
    status: string;
    savedCount: number;
    createdAt: string;
    deadline?: string;
  }[];
}

/**
 * Server Action: Calculates campaign analytics & student reach metrics for current club rep
 */
export async function getClubAnalyticsAction(): Promise<{
  analytics: ClubAnalyticsOverview | null;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { analytics: null, error: "Authentication required" };

  // Fetch current user's club membership
  const { data: member } = await supabase
    .from("club_members")
    .select("club_id")
    .eq("user_id", user.id)
    .single();

  if (!member || !member.club_id) {
    return { analytics: null, error: "No active club membership found." };
  }

  const clubId = member.club_id;

  // Fetch all opportunities created by this club
  const { data: opportunities, error: oppsError } = await supabase
    .from("opportunities")
    .select("id, title, type, status, required_skills, eligible_departments, created_at, application_deadline")
    .eq("club_id", clubId);

  if (oppsError) return { analytics: null, error: oppsError.message };

  const oppList = opportunities || [];
  const publishedCount = oppList.filter((o) => o.status === "published").length;
  const draftCount = oppList.filter((o) => o.status === "draft").length;

  const oppIds = oppList.map((o) => o.id);

  let totalSavedBookmarks = 0;
  const oppSavedMap: Record<string, number> = {};

  if (oppIds.length > 0) {
    const { data: savedData } = await supabase
      .from("saved_opportunities")
      .select("opportunity_id")
      .in("opportunity_id", oppIds);

    (savedData || []).forEach((s) => {
      totalSavedBookmarks++;
      oppSavedMap[s.opportunity_id] = (oppSavedMap[s.opportunity_id] || 0) + 1;
    });
  }

  // Department distribution
  const deptCountMap: Record<string, number> = {};
  oppList.forEach((opp) => {
    const depts = opp.eligible_departments || ["All Departments"];
    depts.forEach((d: string) => {
      deptCountMap[d] = (deptCountMap[d] || 0) + 1;
    });
  });

  const departmentDistribution = Object.entries(deptCountMap).map(([department, count]) => ({
    department,
    count,
  }));

  // Skill demand distribution
  const skillCountMap: Record<string, number> = {};
  oppList.forEach((opp) => {
    const skills = opp.required_skills || [];
    skills.forEach((s: string) => {
      skillCountMap[s] = (skillCountMap[s] || 0) + 1;
    });
  });

  const skillDemandDistribution = Object.entries(skillCountMap)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const opportunityPerformance = oppList.map((opp) => ({
    id: opp.id,
    title: opp.title,
    type: opp.type,
    status: opp.status,
    savedCount: oppSavedMap[opp.id] || 0,
    createdAt: opp.created_at,
    deadline: opp.application_deadline || undefined,
  }));

  return {
    analytics: {
      publishedCount,
      draftCount,
      totalSavedBookmarks,
      totalApplicationsRecorded: totalSavedBookmarks, // Proxy for initial engagement
      departmentDistribution,
      skillDemandDistribution,
      opportunityPerformance,
    },
  };
}
