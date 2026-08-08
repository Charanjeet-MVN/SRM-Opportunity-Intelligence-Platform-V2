"use server";

import { createClient } from "@/lib/supabase/server";
import { Club, ClubVerificationRequest } from "@/types";
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
