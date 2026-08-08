"use server";

import { createClient } from "@/lib/supabase/server";
import { Opportunity } from "@/types";
import { revalidatePath } from "next/cache";

export interface EngagementFormState {
  error?: string;
  isSaved?: boolean;
  message?: string;
}

/**
 * Toggles saved status (bookmark / unbookmark) for an opportunity
 */
export async function toggleSaveOpportunityAction(
  opportunityId: string
): Promise<{ isSaved: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { isSaved: false, error: "Not authenticated" };

  // Check existing bookmark
  const { data: existing } = await supabase
    .from("saved_opportunities")
    .select("id")
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId)
    .single();

  if (existing) {
    // Unbookmark
    const { error } = await supabase
      .from("saved_opportunities")
      .delete()
      .eq("id", existing.id);

    if (error) return { isSaved: true, error: error.message };

    revalidatePath("/dashboard/student/saved");
    revalidatePath("/opportunities");
    return { isSaved: false };
  } else {
    // Bookmark
    const { error } = await supabase
      .from("saved_opportunities")
      .insert({
        user_id: user.id,
        opportunity_id: opportunityId,
      });

    if (error) return { isSaved: false, error: error.message };

    revalidatePath("/dashboard/student/saved");
    revalidatePath("/opportunities");
    return { isSaved: true };
  }
}

/**
 * Fetches all saved opportunities for current student
 */
export async function getSavedOpportunitiesAction(): Promise<{
  savedOpportunities: (Opportunity & { savedAt: string })[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { savedOpportunities: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("saved_opportunities")
    .select(`
      created_at,
      opportunities (
        *,
        clubs (
          name,
          logo_url,
          verification_status
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { savedOpportunities: [], error: error.message };

  const result = (data || []).map((item: any) => {
    const opp = item.opportunities;
    return {
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
      savedAt: item.created_at,
      club: opp.clubs
        ? {
            id: opp.club_id,
            name: opp.clubs.name,
            slug: "",
            logoUrl: opp.clubs.logo_url || undefined,
            verificationStatus: opp.clubs.verification_status,
            createdAt: "",
            updatedAt: "",
          }
        : undefined,
    };
  });

  return { savedOpportunities: result };
}

/**
 * Checks if an opportunity is saved by the current student
 */
export async function isOpportunitySavedAction(
  opportunityId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("saved_opportunities")
    .select("id")
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId)
    .single();

  return !!data;
}

/**
 * Fetches upcoming timeline events (Saved & Registered deadlines)
 */
export async function getStudentTimelineAction(): Promise<{
  events: {
    id: string;
    title: string;
    date: string;
    type: "deadline" | "event_start";
    opportunitySlug: string;
    clubName: string;
    opportunityType: string;
  }[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { events: [], error: "Not authenticated" };

  const { data: savedData, error: savedError } = await supabase
    .from("saved_opportunities")
    .select(`
      opportunities (
        title,
        slug,
        type,
        application_deadline,
        event_start_date,
        clubs ( name )
      )
    `)
    .eq("user_id", user.id);

  if (savedError) return { events: [], error: savedError.message };

  const events: any[] = [];

  (savedData || []).forEach((item: any) => {
    const opp = item.opportunities;
    if (!opp) return;

    if (opp.application_deadline) {
      events.push({
        id: `${opp.slug}-deadline`,
        title: `Deadline: ${opp.title}`,
        date: opp.application_deadline,
        type: "deadline",
        opportunitySlug: opp.slug,
        clubName: opp.clubs?.name || "SRM Organization",
        opportunityType: opp.type,
      });
    }

    if (opp.event_start_date) {
      events.push({
        id: `${opp.slug}-start`,
        title: `Event Starts: ${opp.title}`,
        date: opp.event_start_date,
        type: "event_start",
        opportunitySlug: opp.slug,
        clubName: opp.clubs?.name || "SRM Organization",
        opportunityType: opp.type,
      });
    }
  });

  // Sort chronologically
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return { events };
}
