"use server";

import { createClient } from "@/lib/supabase/server";
import { Opportunity, OpportunityType, LocationType, OpportunityStatus } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface OpportunityFormState {
  error?: string;
  success?: boolean;
  message?: string;
  opportunityId?: string;
}

export interface OpportunityFilterOptions {
  type?: OpportunityType;
  locationType?: LocationType;
  department?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Helper to generate URL-safe slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Server Action: Creates a new opportunity (Club Rep only, verified club required for publishing)
 */
export async function createOpportunityAction(
  prevState: OpportunityFormState | null,
  formData: FormData
): Promise<OpportunityFormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Authentication required." };

  // Fetch club membership
  const { data: memberRecord } = await supabase
    .from("club_members")
    .select("club_id, clubs(verification_status)")
    .eq("user_id", user.id)
    .single();

  if (!memberRecord || !memberRecord.club_id) {
    return { error: "You must be a member of a registered club to post opportunities." };
  }

  const clubId = memberRecord.club_id;
  const clubVerificationStatus = (memberRecord.clubs as any)?.verification_status;

  const title = (formData.get("title") as string)?.trim();
  const summary = (formData.get("summary") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const type = formData.get("type") as OpportunityType;
  const locationType = (formData.get("locationType") as LocationType) || "in_person";
  const locationAddress = (formData.get("locationAddress") as string)?.trim();
  const externalUrl = (formData.get("externalUrl") as string)?.trim();
  const applicationDeadline = (formData.get("applicationDeadline") as string)?.trim();
  const eventStartDate = (formData.get("eventStartDate") as string)?.trim();
  const eventEndDate = (formData.get("eventEndDate") as string)?.trim();
  const maxParticipantsStr = (formData.get("maxParticipants") as string)?.trim();
  const isDraft = formData.get("isDraft") === "true";

  const requiredSkills = formData.getAll("requiredSkills").map((s) => s.toString());
  const eligibleDepartments = formData.getAll("eligibleDepartments").map((d) => d.toString());
  const eligibleYears = formData.getAll("eligibleYears").map((y) => parseInt(y.toString(), 10)).filter(Boolean);

  if (!title || !type || !description) {
    return { error: "Title, opportunity type, and description are required fields." };
  }

  const status: OpportunityStatus = isDraft ? "draft" : "published";

  if (status === "published" && clubVerificationStatus !== "verified") {
    return {
      error: "Only Official Verified SRM Clubs can publish public opportunities. Save as draft or request club verification first.",
    };
  }

  const slugBase = slugify(title);
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  const maxParticipants = maxParticipantsStr ? parseInt(maxParticipantsStr, 10) : null;

  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      club_id: clubId,
      created_by: user.id,
      title,
      slug,
      summary: summary || null,
      description,
      type,
      location_type: locationType,
      location_address: locationAddress || null,
      external_url: externalUrl || null,
      required_skills: requiredSkills.length > 0 ? requiredSkills : null,
      eligible_departments: eligibleDepartments.length > 0 ? eligibleDepartments : null,
      eligible_years: eligibleYears.length > 0 ? eligibleYears : null,
      max_participants: maxParticipants,
      application_deadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null,
      event_start_date: eventStartDate ? new Date(eventStartDate).toISOString() : null,
      event_end_date: eventEndDate ? new Date(eventEndDate).toISOString() : null,
      status,
    })
    .select("id, slug")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/opportunities");
  revalidatePath("/dashboard/club");
  revalidatePath("/dashboard/student");

  redirect(`/opportunities/${data.slug}`);
}

/**
 * Fetches public published opportunities with search and filters
 */
export async function getPublicOpportunitiesAction(
  filters: OpportunityFilterOptions = {}
): Promise<{ opportunities: Opportunity[]; total: number; error?: string }> {
  const supabase = await createClient();

  let query = supabase
    .from("opportunities")
    .select(`
      *,
      clubs (
        name,
        logo_url,
        verification_status
      )
    `, { count: "exact" })
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (filters.type) {
    query = query.eq("type", filters.type);
  }

  if (filters.locationType) {
    query = query.eq("location_type", filters.locationType);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`);
  }

  const limit = filters.limit || 20;
  const offset = filters.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) return { opportunities: [], total: 0, error: error.message };

  const opportunities: Opportunity[] = (data || []).map((item: any) => ({
    id: item.id,
    clubId: item.club_id,
    createdBy: item.created_by,
    title: item.title,
    slug: item.slug,
    summary: item.summary || undefined,
    description: item.description,
    type: item.type,
    locationType: item.location_type,
    locationAddress: item.location_address || undefined,
    externalUrl: item.external_url || undefined,
    requiredSkills: item.required_skills || [],
    eligibleDepartments: item.eligible_departments || [],
    eligibleYears: item.eligible_years || [],
    maxParticipants: item.max_participants || undefined,
    currentParticipants: item.current_participants || 0,
    applicationDeadline: item.application_deadline || undefined,
    eventStartDate: item.event_start_date || undefined,
    eventEndDate: item.event_end_date || undefined,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    club: item.clubs
      ? {
          id: item.club_id,
          name: item.clubs.name,
          slug: item.clubs.slug || "",
          logoUrl: item.clubs.logo_url || undefined,
          verificationStatus: item.clubs.verification_status,
          createdAt: "",
          updatedAt: "",
        }
      : undefined,
  }));

  return { opportunities, total: count || 0 };
}

/**
 * Fetches opportunities ranked by personalized relevance score for active student profile
 */
export async function getPersonalizedFeedAction(filters: OpportunityFilterOptions & { sortBy?: "relevance" | "newest" | "closing_soon" } = {}): Promise<{
  opportunities: (Opportunity & { relevance: import("../relevance/scoring").RelevanceScoreResult })[];
  total: number;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let studentProfile: import("@/types").StudentProfile | null = null;

  if (user) {
    const { data: prof } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (prof) {
      studentProfile = {
        id: prof.id,
        userId: prof.user_id,
        fullName: prof.full_name,
        registerNumber: prof.register_number || undefined,
        department: prof.department || undefined,
        yearOfStudy: prof.year_of_study || undefined,
        skills: prof.skills || [],
        interests: prof.interests || [],
        careerGoals: prof.career_goals || undefined,
        createdAt: prof.created_at,
        updatedAt: prof.updated_at,
      };
    }
  }

  const { calculateOpportunityRelevance } = await import("../relevance/scoring");

  const { opportunities, total, error } = await getPublicOpportunitiesAction(filters);

  if (error) return { opportunities: [], total: 0, error };

  let ranked = opportunities.map((opp) => ({
    ...opp,
    relevance: calculateOpportunityRelevance(studentProfile, opp),
  }));

  const sortBy = filters.sortBy || "relevance";

  if (sortBy === "relevance") {
    ranked.sort((a, b) => b.relevance.totalScore - a.relevance.totalScore);
  } else if (sortBy === "closing_soon") {
    ranked.sort((a, b) => {
      const timeA = a.applicationDeadline ? new Date(a.applicationDeadline).getTime() : Infinity;
      const timeB = b.applicationDeadline ? new Date(b.applicationDeadline).getTime() : Infinity;
      return timeA - timeB;
    });
  }

  return { opportunities: ranked, total };
}

/**
 * Fetches a single opportunity by slug
 */
export async function getOpportunityBySlugAction(
  slug: string
): Promise<{ opportunity: Opportunity | null; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("opportunities")
    .select(`
      *,
      clubs (
        id,
        name,
        slug,
        logo_url,
        verification_status,
        category,
        official_email
      )
    `)
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return { opportunity: null, error: error ? error.message : "Opportunity not found" };
  }

  const opportunity: Opportunity = {
    id: data.id,
    clubId: data.club_id,
    createdBy: data.created_by,
    title: data.title,
    slug: data.slug,
    summary: data.summary || undefined,
    description: data.description,
    type: data.type,
    locationType: data.location_type,
    locationAddress: data.location_address || undefined,
    externalUrl: data.external_url || undefined,
    requiredSkills: data.required_skills || [],
    eligibleDepartments: data.eligible_departments || [],
    eligibleYears: data.eligible_years || [],
    maxParticipants: data.max_participants || undefined,
    currentParticipants: data.current_participants || 0,
    applicationDeadline: data.application_deadline || undefined,
    eventStartDate: data.event_start_date || undefined,
    eventEndDate: data.event_end_date || undefined,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    club: data.clubs
      ? {
          id: data.clubs.id,
          name: data.clubs.name,
          slug: data.clubs.slug || "",
          logoUrl: data.clubs.logo_url || undefined,
          verificationStatus: data.clubs.verification_status,
          category: data.clubs.category || undefined,
          officialEmail: data.clubs.official_email || undefined,
          createdAt: "",
          updatedAt: "",
        }
      : undefined,
  };

  return { opportunity };
}

/**
 * Fetches opportunities posted by the current club
 */
export async function getMyClubOpportunitiesAction(): Promise<{
  opportunities: Opportunity[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { opportunities: [], error: "Not authenticated" };

  const { data: memberRecord } = await supabase
    .from("club_members")
    .select("club_id")
    .eq("user_id", user.id)
    .single();

  if (!memberRecord) return { opportunities: [] };

  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("club_id", memberRecord.club_id)
    .order("created_at", { ascending: false });

  if (error) return { opportunities: [], error: error.message };

  const opportunities: Opportunity[] = (data || []).map((item: any) => ({
    id: item.id,
    clubId: item.club_id,
    createdBy: item.created_by,
    title: item.title,
    slug: item.slug,
    summary: item.summary || undefined,
    description: item.description,
    type: item.type,
    locationType: item.location_type,
    locationAddress: item.location_address || undefined,
    externalUrl: item.external_url || undefined,
    requiredSkills: item.required_skills || [],
    eligibleDepartments: item.eligible_departments || [],
    eligibleYears: item.eligible_years || [],
    maxParticipants: item.max_participants || undefined,
    currentParticipants: item.current_participants || 0,
    applicationDeadline: item.application_deadline || undefined,
    eventStartDate: item.event_start_date || undefined,
    eventEndDate: item.event_end_date || undefined,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));

  return { opportunities };
}
