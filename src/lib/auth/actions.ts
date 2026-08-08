"use server";

import { createClient } from "@/lib/supabase/server";
import { isSrmEmail, normalizeEmail } from "./utils";
import { UserRole } from "@/types";
import { redirect } from "next/navigation";

export interface AuthState {
  error?: string;
  success?: boolean;
  message?: string;
  redirectTo?: string;
  emailVerificationRequired?: boolean;
}

/**
 * Handles unified user login for Students, Club Representatives, and Super Admins
 */
export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = normalizeEmail(formData.get("email") as string);
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Login failed. Invalid user session." };
  }

  // Query role from public.users table
  const { data: userRecord } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role: UserRole = userRecord?.role || "student";

  let redirectTo = "/dashboard/student";
  if (role === "club_rep") redirectTo = "/dashboard/club";
  if (role === "super_admin") redirectTo = "/dashboard/admin";

  redirect(redirectTo);
}

/**
 * Handles Student Registration
 */
export async function signupStudentAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = normalizeEmail(formData.get("email") as string);
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string)?.trim();
  const registerNumber = (formData.get("registerNumber") as string)?.trim();
  const department = (formData.get("department") as string)?.trim();
  const yearOfStudyStr = formData.get("yearOfStudy") as string;
  const yearOfStudy = yearOfStudyStr ? parseInt(yearOfStudyStr, 10) : undefined;

  if (!email || !password || !fullName) {
    return { error: "Full Name, Email, and Password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const isSrm = isSrmEmail(email);
  const isGmail = email.endsWith("@gmail.com");

  if (!isSrm && !isGmail) {
    return { error: "Registration is restricted to SRM emails (@srmist.edu.in) or personal Gmail (@gmail.com)." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "student",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Signup failed. Could not create account." };
  }

  // Ensure student profile record is created/upserted
  await supabase.from("student_profiles").upsert({
    user_id: data.user.id,
    full_name: fullName,
    register_number: registerNumber || null,
    department: department || null,
    year_of_study: yearOfStudy || null,
    skills: [],
    interests: [],
  });

  if (isGmail && !data.session) {
    redirect("/verify-email");
  }

  redirect("/dashboard/student");
}

/**
 * Handles Club Representative & Unverified Club Registration
 */
export async function signupClubAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const clubName = (formData.get("clubName") as string)?.trim();
  const officialEmail = normalizeEmail(formData.get("officialEmail") as string);
  const password = formData.get("password") as string;
  const description = (formData.get("description") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();

  if (!clubName || !officialEmail || !password) {
    return { error: "Club Name, Official SRM Email, and Password are required." };
  }

  if (!isSrmEmail(officialEmail)) {
    return { error: "Club registration requires an official SRM email (@srmist.edu.in)." };
  }

  const supabase = await createClient();

  // Create auth user with role = 'club_rep'
  const { data, error } = await supabase.auth.signUp({
    email: officialEmail,
    password,
    options: {
      data: {
        role: "club_rep",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Club registration failed." };
  }

  // Update public.users role to club_rep
  await supabase
    .from("users")
    .update({ role: "club_rep" })
    .eq("id", data.user.id);

  // Generate URL slug
  const slug = clubName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Insert club entity in unverified state
  const { data: clubRecord, error: clubError } = await supabase
    .from("clubs")
    .insert({
      name: clubName,
      slug,
      description,
      category,
      official_email: officialEmail,
      verification_status: "unverified",
    })
    .select("id")
    .single();

  if (clubError) {
    return { error: `Failed to create club profile: ${clubError.message}` };
  }

  // Associate user as lead member of the club
  if (clubRecord) {
    await supabase.from("club_members").insert({
      user_id: data.user.id,
      club_id: clubRecord.id,
      role: "lead",
    });

    // Create initial verification request audit entry
    await supabase.from("club_verification_requests").insert({
      club_id: clubRecord.id,
      submitted_by: data.user.id,
      status: "pending_review",
    });
  }

  redirect("/dashboard/club");
}

/**
 * Signs out current user and redirects to login
 */
export async function signOutAction(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
