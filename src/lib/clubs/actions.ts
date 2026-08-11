"use server";

import { createClient } from "@/lib/supabase/server";
import { Club, ClubVerificationRequest, ClubVerificationStatus } from "@/types";
import { revalidatePath } from "next/cache";

export interface ClubFormState {
  error?: string;
  success?: boolean;
  message?: string;
}

/**
 * Fetches the authenticated user's club profile and membership
 */
export async function getMyClubProfileAction(): Promise<{
  club: Club | null;
  role?: "lead" | "member";
  error?: string;
}> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { club: null, error: "Not authenticated" };

  // Query member record
  const { data: memberRecord, error: memberError } = await supabase
    .from("club_members")
    .select("club_id, role")
    .eq("user_id", user.id)
    .single();

  if (memberError || !memberRecord) {
    return { club: null };
  }

  // Query club details
  const { data: clubRecord, error: clubError } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", memberRecord.club_id)
    .single();

  if (clubError || !clubRecord) {
    return { club: null, error: "Club profile not found" };
  }

  const club: Club = {
    id: clubRecord.id,
    name: clubRecord.name,
    slug: clubRecord.slug,
    description: clubRecord.description || undefined,
    logoUrl: clubRecord.logo_url || undefined,
    category: clubRecord.category || undefined,
    verificationStatus: clubRecord.verification_status,
    verifiedAt: clubRecord.verified_at || undefined,
    verifiedBy: clubRecord.verified_by || undefined,
    officialEmail: clubRecord.official_email || undefined,
    createdAt: clubRecord.created_at,
    updatedAt: clubRecord.updated_at,
  };

  return { club, role: memberRecord.role as "lead" | "member" };
}

/**
 * Updates club profile details (Logo, Description, Category)
 */
export async function updateClubProfileAction(
  prevState: ClubFormState | null,
  formData: FormData
): Promise<ClubFormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const clubId = formData.get("clubId") as string;
  const description = (formData.get("description") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const logoUrl = (formData.get("logoUrl") as string)?.trim();

  if (!clubId) return { error: "Club ID is missing." };

  const { error } = await supabase
    .from("clubs")
    .update({
      description: description || null,
      category: category || null,
      logo_url: logoUrl || null,
    })
    .eq("id", clubId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/club");
  return { success: true, message: "Club profile updated successfully!" };
}

/**
 * Submits official verification documents for Super Admin review
 */
export async function submitVerificationRequestAction(
  prevState: ClubFormState | null,
  formData: FormData
): Promise<ClubFormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const clubId = formData.get("clubId") as string;
  const documentsUrl = (formData.get("documentsUrl") as string)?.trim();

  if (!clubId || !documentsUrl) {
    return { error: "Club ID and Document Verification URL are required." };
  }

  // Update club verification status to pending_review
  const { error: clubUpdateError } = await supabase
    .from("clubs")
    .update({ verification_status: "pending_review" })
    .eq("id", clubId);

  if (clubUpdateError) return { error: clubUpdateError.message };

  // Insert verification request audit entry
  const { error: reqError } = await supabase
    .from("club_verification_requests")
    .insert({
      club_id: clubId,
      submitted_by: user.id,
      documents_url: documentsUrl,
      status: "pending_review",
    });

  if (reqError) return { error: reqError.message };

  revalidatePath("/dashboard/club");
  revalidatePath("/dashboard/club/verification");
  return {
    success: true,
    message: "Verification documents submitted successfully! Our administrators will review your credentials.",
  };
}

/**
 * Super Admin Action: Fetches all pending club verification requests
 */
export async function getPendingVerificationsAction(): Promise<{
  requests: (ClubVerificationRequest & { clubName: string; officialEmail: string })[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { requests: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("club_verification_requests")
    .select(`
      *,
      clubs (
        name,
        official_email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) return { requests: [], error: error.message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requests = (data || []).map((item: any) => ({
    id: item.id,
    clubId: item.club_id,
    submittedBy: item.submitted_by,
    documentsUrl: item.documents_url || undefined,
    status: item.status,
    reviewerNotes: item.reviewer_notes || undefined,
    reviewedAt: item.reviewed_at || undefined,
    createdAt: item.created_at,
    clubName: item.clubs?.name || "Unknown Club",
    officialEmail: item.clubs?.official_email || "N/A",
  }));

  return { requests };
}

/**
 * Super Admin Action: Approves or Rejects a club verification request
 */
export async function reviewVerificationAction(
  prevState: ClubFormState | null,
  formData: FormData
): Promise<ClubFormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const requestId = formData.get("requestId") as string;
  const clubId = formData.get("clubId") as string;
  const decision = formData.get("decision") as "verified" | "rejected";
  const reviewerNotes = (formData.get("reviewerNotes") as string)?.trim();

  if (!requestId || !clubId || !decision) {
    return { error: "Missing decision parameters." };
  }

  const now = new Date().toISOString();

  // 1. Update verification request status
  const { error: reqError } = await supabase
    .from("club_verification_requests")
    .update({
      status: decision,
      reviewer_notes: reviewerNotes || null,
      reviewed_at: now,
    })
    .eq("id", requestId);

  if (reqError) return { error: reqError.message };

  // 2. Update club entity verification status
  const { error: clubError } = await supabase
    .from("clubs")
    .update({
      verification_status: decision,
      verified_at: decision === "verified" ? now : null,
      verified_by: decision === "verified" ? user.id : null,
    })
    .eq("id", clubId);

  if (clubError) return { error: clubError.message };

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/verifications");
  revalidatePath("/dashboard/club");

  return {
    success: true,
    message: decision === "verified" ? "Club approved and granted Official SRM status!" : "Club verification request rejected.",
  };
}

export interface PublicClubRecord {
  id: string;
  name: string;
  slug: string;
  category?: string;
  description?: string;
  logoUrl?: string;
  verificationStatus: ClubVerificationStatus;
  officialEmail?: string;
  verifiedAt?: string;
  opportunityCount: number;
}

/**
 * Fetches public campus clubs for the Clubs Discovery directory
 */
export async function getPublicClubsAction(filters: {
  category?: string;
  search?: string;
} = {}): Promise<{
  clubs: PublicClubRecord[];
  error?: string;
}> {
  const supabase = await createClient();

  let query = supabase
    .from("clubs")
    .select(`
      *,
      opportunities ( id, status )
    `)
    .order("name", { ascending: true });

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) return { clubs: [], error: error.message };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const clubs: PublicClubRecord[] = (data || []).map((c: any) => {
    const pubCount = (c.opportunities || []).filter((o: any) => o.status === "published").length;
  /* eslint-enable @typescript-eslint/no-explicit-any */
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      category: c.category || undefined,
      description: c.description || undefined,
      logoUrl: c.logo_url || undefined,
      verificationStatus: c.verification_status,
      officialEmail: c.official_email || undefined,
      verifiedAt: c.verified_at || undefined,
      opportunityCount: pubCount,
    };
  });

  return { clubs };
}

/**
 * Fetches a single club by slug for the Public Club Profile page
 */
export async function getClubBySlugAction(slug: string): Promise<{
  club: PublicClubRecord | null;
  opportunities: import("@/types").Opportunity[];
  error?: string;
}> {
  const supabase = await createClient();

  const { data: clubData, error: clubError } = await supabase
    .from("clubs")
    .select("*")
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single();

  if (clubError || !clubData) {
    return { club: null, opportunities: [], error: "Organization not found" };
  }

  // Fetch active published opportunities for this club
  const { data: oppsData } = await supabase
    .from("opportunities")
    .select(`
      *,
      clubs (
        id,
        name,
        slug,
        logo_url,
        verification_status
      )
    `)
    .eq("club_id", clubData.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opportunities: import("@/types").Opportunity[] = (oppsData || []).map((item: any) => ({
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
    applicationDeadline: item.application_deadline || undefined,
    eventStartDate: item.event_start_date || undefined,
    eventEndDate: item.event_end_date || undefined,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    club: {
      id: clubData.id,
      name: clubData.name,
      slug: clubData.slug,
      logoUrl: clubData.logo_url || undefined,
      verificationStatus: clubData.verification_status,
      createdAt: "",
      updatedAt: "",
    },
  }));

  const club: PublicClubRecord = {
    id: clubData.id,
    name: clubData.name,
    slug: clubData.slug,
    category: clubData.category || undefined,
    description: clubData.description || undefined,
    logoUrl: clubData.logo_url || undefined,
    verificationStatus: clubData.verification_status,
    officialEmail: clubData.official_email || undefined,
    verifiedAt: clubData.verified_at || undefined,
    opportunityCount: opportunities.length,
  };

  return { club, opportunities };
}

