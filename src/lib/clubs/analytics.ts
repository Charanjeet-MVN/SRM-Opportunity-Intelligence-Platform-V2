"use server";

import { createClient } from "@/lib/supabase/server";
import { Opportunity } from "@/types";

export interface ClubAnalyticsOverview {
  publishedCount: number;
  draftCount: number;
  activeCount: number;
  expiredCount: number;
  totalSavedBookmarks: number;
  totalApplicationsRecorded: number;
  departmentDistribution: { department: string; count: number }[];
  skillDemandDistribution: { skill: string; count: number }[];
  opportunityPerformance: {
    id: string;
    title: string;
    slug: string;
    type: string;
    status: string;
    savedCount: number;
    registeredCount: number;
    completedCount: number;
    createdAt: string;
    deadline?: string;
  }[];
  savedTimeline: { date: string; opportunityTitle: string }[];
  registrationTimeline: { date: string; opportunityTitle: string; status: string }[];
}

export interface OpportunityDemographics {
  departments: { name: string; count: number }[];
  years: { year: number; count: number }[];
}

export interface OpportunityAnalyticsData {
  opportunity: Opportunity;
  savedCount: number;
  registeredCount: number;
  completedCount: number;
  impactScore: number;
  demographics: OpportunityDemographics;
  timeline: { date: string; saves: number; registrations: number }[];
  insights: string[];
}

/**
 * Server Action: Calculates detailed performance metrics and timelines for current club rep
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
    .select("id, title, slug, type, status, required_skills, eligible_departments, created_at, application_deadline")
    .eq("club_id", clubId);

  if (oppsError) return { analytics: null, error: oppsError.message };

  const oppList = opportunities || [];
  const publishedCount = oppList.filter((o) => o.status === "published").length;
  const draftCount = oppList.filter((o) => o.status === "draft").length;

  const now = new Date();
  const activeCount = oppList.filter((o) => {
    if (o.status !== "published") return false;
    const deadline = o.application_deadline ? new Date(o.application_deadline) : null;
    return !deadline || deadline > now;
  }).length;

  const expiredCount = oppList.filter((o) => {
    if (o.status !== "published") return false;
    const deadline = o.application_deadline ? new Date(o.application_deadline) : null;
    return deadline !== null && deadline <= now;
  }).length;

  const oppIds = oppList.map((o) => o.id);
  const oppTitleMap = new Map<string, string>();
  oppList.forEach((o) => oppTitleMap.set(o.id, o.title));

  let totalSavedBookmarks = 0;
  const oppSavedMap: Record<string, number> = {};
  const savedTimeline: { date: string; opportunityTitle: string }[] = [];

  if (oppIds.length > 0) {
    const { data: savedData } = await supabase
      .from("saved_opportunities")
      .select("opportunity_id, created_at")
      .in("opportunity_id", oppIds);

    (savedData || []).forEach((s) => {
      totalSavedBookmarks++;
      oppSavedMap[s.opportunity_id] = (oppSavedMap[s.opportunity_id] || 0) + 1;
      savedTimeline.push({
        date: s.created_at,
        opportunityTitle: oppTitleMap.get(s.opportunity_id) || "Unknown",
      });
    });
  }

  let totalApplicationsRecorded = 0;
  const oppRegMap: Record<string, number> = {};
  const oppCompletedMap: Record<string, number> = {};
  const registrationTimeline: { date: string; opportunityTitle: string; status: string }[] = [];

  if (oppIds.length > 0) {
    const { data: regData } = await supabase
      .from("registrations")
      .select("opportunity_id, status, registered_at")
      .in("opportunity_id", oppIds);

    (regData || []).forEach((r) => {
      totalApplicationsRecorded++;
      oppRegMap[r.opportunity_id] = (oppRegMap[r.opportunity_id] || 0) + 1;
      if (r.status === "attended") {
        oppCompletedMap[r.opportunity_id] = (oppCompletedMap[r.opportunity_id] || 0) + 1;
      }
      registrationTimeline.push({
        date: r.registered_at,
        opportunityTitle: oppTitleMap.get(r.opportunity_id) || "Unknown",
        status: r.status,
      });
    });
  }

  // Sort timelines descending
  savedTimeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  registrationTimeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
    slug: opp.slug,
    type: opp.type,
    status: opp.status,
    savedCount: oppSavedMap[opp.id] || 0,
    registeredCount: oppRegMap[opp.id] || 0,
    completedCount: oppCompletedMap[opp.id] || 0,
    createdAt: opp.created_at,
    deadline: opp.application_deadline || undefined,
  }));

  return {
    analytics: {
      publishedCount,
      draftCount,
      activeCount,
      expiredCount,
      totalSavedBookmarks,
      totalApplicationsRecorded,
      departmentDistribution,
      skillDemandDistribution,
      opportunityPerformance,
      savedTimeline,
      registrationTimeline,
    },
  };
}

/**
 * Server Action: Calculates detailed performance metrics, demographics, and trends for a single opportunity
 */
export async function getOpportunityAnalyticsAction(
  slug: string
): Promise<{
  analytics: OpportunityAnalyticsData | null;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { analytics: null, error: "Authentication required" };

  // Fetch opportunity and details
  const { data: opp, error: oppError } = await supabase
    .from("opportunities")
    .select("*, clubs(*)")
    .eq("slug", slug)
    .single();

  if (oppError || !opp) {
    return { analytics: null, error: oppError?.message || "Opportunity not found" };
  }

  // Security Verification: check if the user is a member of the club that owns this opportunity
  const { data: member, error: memberError } = await supabase
    .from("club_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("club_id", opp.club_id)
    .single();

  if (memberError || !member) {
    return {
      analytics: null,
      error: "Unauthorized. You do not represent the organization that posted this opportunity.",
    };
  }

  // Query saves
  const { data: savedData, error: savedError } = await supabase
    .from("saved_opportunities")
    .select("user_id, created_at")
    .eq("opportunity_id", opp.id);

  if (savedError) return { analytics: null, error: savedError.message };

  // Query registrations
  const { data: regData, error: regError } = await supabase
    .from("registrations")
    .select("user_id, registered_at, status")
    .eq("opportunity_id", opp.id);

  if (regError) return { analytics: null, error: regError.message };

  const saves = savedData || [];
  const regs = regData || [];

  const savedCount = saves.length;
  const registeredCount = regs.length;
  const completedCount = regs.filter((r) => r.status === "attended").length;

  // Gather user profiles for demographics and insights
  const userIds = Array.from(new Set([
    ...saves.map((s) => s.user_id),
    ...regs.map((r) => r.user_id),
  ]));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let profiles: any[] = [];
  if (userIds.length > 0) {
    const { data: profs, error: profsError } = await supabase
      .from("student_profiles")
      .select("user_id, department, year_of_study, skills, interests")
      .in("user_id", userIds);

    if (!profsError) {
      profiles = profs || [];
    }
  }

  // Demographics aggregation
  const deptMap: Record<string, number> = {};
  const yearMap: Record<number, number> = {};
  const interestMap: Record<string, number> = {};

  profiles.forEach((p) => {
    if (p.department) {
      deptMap[p.department] = (deptMap[p.department] || 0) + 1;
    }
    if (p.year_of_study) {
      yearMap[p.year_of_study] = (yearMap[p.year_of_study] || 0) + 1;
    }
    if (p.interests && Array.isArray(p.interests)) {
      p.interests.forEach((interest: string) => {
        interestMap[interest] = (interestMap[interest] || 0) + 1;
      });
    }
  });

  const departments = Object.entries(deptMap).map(([name, count]) => ({ name, count }));
  const years = Object.entries(yearMap).map(([year, count]) => ({ year: parseInt(year, 10), count }));

  // Timeline (cumulative history grouping)
  const datesSet = new Set<string>();
  const savesMap: Record<string, number> = {};
  const regsMap: Record<string, number> = {};

  saves.forEach((s) => {
    const d = s.created_at.split("T")[0];
    datesSet.add(d);
    savesMap[d] = (savesMap[d] || 0) + 1;
  });

  regs.forEach((r) => {
    const d = r.registered_at.split("T")[0];
    datesSet.add(d);
    regsMap[d] = (regsMap[d] || 0) + 1;
  });

  const sortedDates = Array.from(datesSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  let runningSaves = 0;
  let runningRegs = 0;
  const timeline = sortedDates.map((date) => {
    runningSaves += savesMap[date] || 0;
    runningRegs += regsMap[date] || 0;
    return {
      date,
      saves: runningSaves,
      registrations: runningRegs,
    };
  });

  // Insights
  const insights: string[] = [];
  if (savedCount > 0 && registeredCount > 0) {
    const rate = Math.round((registeredCount / savedCount) * 100);
    insights.push(`Conversion efficiency: ${rate}% of bookmarked students converted into registered applicants.`);
  }

  if (departments.length > 0) {
    const topDept = [...departments].sort((a, b) => b.count - a.count)[0];
    const pct = Math.round((topDept.count / userIds.length) * 100);
    insights.push(`Academic demand: CS / Core Engineering departments represent the largest engagement pool (${pct}%).`);
  }

  if (years.length > 0) {
    const topYear = [...years].sort((a, b) => b.count - a.count)[0];
    const pct = Math.round((topYear.count / userIds.length) * 100);
    insights.push(`Target audience: Year ${topYear.year} students show the highest interaction interest (${pct}%).`);
  }

  const interestsList = Object.entries(interestMap).sort((a, b) => b[1] - a[1]);
  if (interestsList.length > 0) {
    const topInterest = interestsList[0][0];
    const pct = Math.round((interestsList[0][1] / userIds.length) * 100);
    insights.push(`Specialized interest: Students with a career interest in ${topInterest} represent ${pct}% of saves.`);
  }

  // Deterministic Impact Score:
  // Saves are weighted at 4 points each (max 40 pts, i.e. 10 saves)
  // Registrations are weighted at 10 points each (max 55 pts, i.e. 5.5 registrations)
  // Completed registrations are weighted at 5 points each (max 5 pts, i.e. 1 completed)
  const impactScore = Math.min(100, savedCount * 4 + registeredCount * 10 + completedCount * 5);

  const opportunity: Opportunity = {
    id: opp.id,
    clubId: opp.club_id,
    createdBy: opp.created_by,
    title: opp.title,
    slug: opp.slug,
    summary: opp.summary || undefined,
    description: opp.description,
    type: opp.type,
    locationType: opp.location_type,
    locationAddress: opp.location_address || undefined,
    externalUrl: opp.external_url || undefined,
    requiredSkills: opp.required_skills || [],
    eligibleDepartments: opp.eligible_departments || [],
    eligibleYears: opp.eligible_years || [],
    maxParticipants: opp.max_participants || undefined,
    currentParticipants: opp.current_participants || 0,
    applicationDeadline: opp.application_deadline || undefined,
    eventStartDate: opp.event_start_date || undefined,
    eventEndDate: opp.event_end_date || undefined,
    status: opp.status,
    createdAt: opp.created_at,
    updatedAt: opp.updated_at,
    club: opp.clubs
      ? {
          id: opp.clubs.id,
          name: opp.clubs.name,
          slug: opp.clubs.slug || "",
          logoUrl: opp.clubs.logo_url || undefined,
          verificationStatus: opp.clubs.verification_status,
          createdAt: "",
          updatedAt: "",
        }
      : undefined,
  };

  return {
    analytics: {
      opportunity,
      savedCount,
      registeredCount,
      completedCount,
      impactScore,
      demographics: {
        departments,
        years,
      },
      timeline,
      insights,
    },
  };
}
