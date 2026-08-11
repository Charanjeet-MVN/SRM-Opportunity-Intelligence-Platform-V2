"use server";

import { createClient } from "@/lib/supabase/server";
import { ClubVerificationStatus, OpportunityStatus, UserRole } from "@/types";
import { revalidatePath } from "next/cache";

export interface AdminFormState {
  error?: string;
  success?: boolean;
  message?: string;
}

/**
 * Server-side helper to verify that current user is a Super Admin
 */
async function verifySuperAdmin(): Promise<{ isSuperAdmin: boolean; userId?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { isSuperAdmin: false, error: "Not authenticated" };
  }

  const { data: userRec } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userRec || userRec.role !== "super_admin") {
    return { isSuperAdmin: false, error: "Unauthorized. Super Admin access required." };
  }

  return { isSuperAdmin: true, userId: user.id };
}

/**
 * Fetches real ecosystem-wide metrics for Super Admin Dashboard
 */
export async function getAdminMetricsAction() {
  const authCheck = await verifySuperAdmin();
  if (!authCheck.isSuperAdmin) {
    return { metrics: null, error: authCheck.error };
  }

  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: studentCount },
    { count: clubRepCount },
    { count: superAdminCount },
    { count: totalClubs },
    { count: verifiedClubs },
    { count: pendingClubs },
    { count: unverifiedClubs },
    { count: rejectedClubs },
    { count: totalOpportunities },
    { count: publishedOpps },
    { count: draftOpps },
    { count: archivedOpps },
    { count: pendingVerifications },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "club_rep"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "super_admin"),
    supabase.from("clubs").select("*", { count: "exact", head: true }),
    supabase.from("clubs").select("*", { count: "exact", head: true }).eq("verification_status", "verified"),
    supabase.from("clubs").select("*", { count: "exact", head: true }).eq("verification_status", "pending_review"),
    supabase.from("clubs").select("*", { count: "exact", head: true }).eq("verification_status", "unverified"),
    supabase.from("clubs").select("*", { count: "exact", head: true }).eq("verification_status", "rejected"),
    supabase.from("opportunities").select("*", { count: "exact", head: true }),
    supabase.from("opportunities").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("opportunities").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("opportunities").select("*", { count: "exact", head: true }).eq("status", "archived"),
    supabase.from("club_verification_requests").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
  ]);

  return {
    metrics: {
      totalUsers: totalUsers || 0,
      studentCount: studentCount || 0,
      clubRepCount: clubRepCount || 0,
      superAdminCount: superAdminCount || 0,
      totalClubs: totalClubs || 0,
      verifiedClubs: verifiedClubs || 0,
      pendingClubs: pendingClubs || 0,
      unverifiedClubs: unverifiedClubs || 0,
      rejectedClubs: rejectedClubs || 0,
      totalOpportunities: totalOpportunities || 0,
      publishedOpps: publishedOpps || 0,
      draftOpps: draftOpps || 0,
      archivedOpps: archivedOpps || 0,
      pendingVerifications: pendingVerifications || 0,
    },
  };
}

export interface AdminClubRecord {
  id: string;
  name: string;
  slug: string;
  category?: string;
  description?: string;
  logoUrl?: string;
  verificationStatus: ClubVerificationStatus;
  officialEmail?: string;
  createdAt: string;
  opportunityCount: number;
}

/**
 * Fetches all real clubs with opportunity counts for Super Admin
 */
export async function getAllClubsAdminAction(): Promise<{
  clubs: AdminClubRecord[];
  error?: string;
}> {
  const authCheck = await verifySuperAdmin();
  if (!authCheck.isSuperAdmin) return { clubs: [], error: authCheck.error };

  const supabase = await createClient();

  const { data: clubData, error: clubError } = await supabase
    .from("clubs")
    .select(`
      *,
      opportunities ( id )
    `)
    .order("created_at", { ascending: false });

  if (clubError) return { clubs: [], error: clubError.message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clubs: AdminClubRecord[] = (clubData || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    category: c.category || undefined,
    description: c.description || undefined,
    logoUrl: c.logo_url || undefined,
    verificationStatus: c.verification_status,
    officialEmail: c.official_email || undefined,
    createdAt: c.created_at,
    opportunityCount: c.opportunities?.length || 0,
  }));

  return { clubs };
}

/**
 * Updates club verification status (verified / pending_review / unverified / rejected)
 */
export async function updateClubVerificationAdminAction(
  clubId: string,
  newStatus: ClubVerificationStatus
): Promise<{ success: boolean; error?: string }> {
  const authCheck = await verifySuperAdmin();
  if (!authCheck.isSuperAdmin) return { success: false, error: authCheck.error };

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("clubs")
    .update({
      verification_status: newStatus,
      verified_at: newStatus === "verified" ? now : null,
      verified_by: newStatus === "verified" ? authCheck.userId : null,
      updated_at: now,
    })
    .eq("id", clubId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/club");
  revalidatePath("/opportunities");

  return { success: true };
}

export interface AdminOpportunityRecord {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: OpportunityStatus;
  clubName: string;
  clubLogo?: string;
  clubStatus: ClubVerificationStatus;
  createdAt: string;
  deadline?: string;
}

/**
 * Fetches all real opportunities across platform for Super Admin
 */
export async function getAllOpportunitiesAdminAction(): Promise<{
  opportunities: AdminOpportunityRecord[];
  error?: string;
}> {
  const authCheck = await verifySuperAdmin();
  if (!authCheck.isSuperAdmin) return { opportunities: [], error: authCheck.error };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("opportunities")
    .select(`
      id,
      title,
      slug,
      type,
      status,
      created_at,
      application_deadline,
      clubs (
        name,
        logo_url,
        verification_status
      )
    `)
    .order("created_at", { ascending: false });

  if (error) return { opportunities: [], error: error.message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opportunities: AdminOpportunityRecord[] = (data || []).map((o: any) => ({
    id: o.id,
    title: o.title,
    slug: o.slug,
    type: o.type,
    status: o.status,
    createdAt: o.created_at,
    deadline: o.application_deadline || undefined,
    clubName: o.clubs?.name || "Unknown Club",
    clubLogo: o.clubs?.logo_url || undefined,
    clubStatus: o.clubs?.verification_status || "unverified",
  }));

  return { opportunities };
}

/**
 * Updates opportunity status by Super Admin (published / draft / archived / rejected)
 */
export async function updateOpportunityStatusAdminAction(
  opportunityId: string,
  newStatus: OpportunityStatus
): Promise<{ success: boolean; error?: string }> {
  const authCheck = await verifySuperAdmin();
  if (!authCheck.isSuperAdmin) return { success: false, error: authCheck.error };

  const supabase = await createClient();

  const { error } = await supabase
    .from("opportunities")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", opportunityId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/admin");
  revalidatePath("/opportunities");
  return { success: true };
}

export interface AdminUserRecord {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  studentName?: string;
  department?: string;
  yearOfStudy?: number;
  clubName?: string;
}

/**
 * Fetches all real users for Super Admin User Management
 */
export async function getAllUsersAdminAction(): Promise<{
  users: AdminUserRecord[];
  error?: string;
}> {
  const authCheck = await verifySuperAdmin();
  if (!authCheck.isSuperAdmin) return { users: [], error: authCheck.error };

  const supabase = await createClient();

  const [
    { data: usersData, error: usersError },
    { data: profilesData },
    { data: membersData },
  ] = await Promise.all([
    supabase.from("users").select("*").order("created_at", { ascending: false }),
    supabase.from("student_profiles").select("user_id, full_name, department, year_of_study"),
    supabase.from("club_members").select("user_id, clubs(name)"),
  ]);

  if (usersError) return { users: [], error: usersError.message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileMap = new Map<string, any>();
  (profilesData || []).forEach((p) => profileMap.set(p.user_id, p));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memberMap = new Map<string, any>();
  (membersData || []).forEach((m) => memberMap.set(m.user_id, m));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users: AdminUserRecord[] = (usersData || []).map((u: any) => {
    const prof = profileMap.get(u.id);
    const memb = memberMap.get(u.id);
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.created_at,
      studentName: prof?.full_name,
      department: prof?.department,
      yearOfStudy: prof?.year_of_study,
      clubName: memb?.clubs?.name,
    };
  });

  return { users };
}

/**
 * Updates user role by Super Admin (student / club_rep / super_admin)
 */
export async function updateUserRoleAdminAction(
  targetUserId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  const authCheck = await verifySuperAdmin();
  if (!authCheck.isSuperAdmin) return { success: false, error: authCheck.error };

  const supabase = await createClient();

  const { error } = await supabase
    .from("users")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", targetUserId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/admin");
  return { success: true };
}
