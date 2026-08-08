"use server";

import { createClient } from "@/lib/supabase/server";
import { StudentProfile } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface StudentProfileFormState {
  error?: string;
  success?: boolean;
  message?: string;
  profile?: StudentProfile;
}

/**
 * Fetches current authenticated student's profile
 */
export async function getStudentProfileAction(): Promise<{
  profile: StudentProfile | null;
  error?: string;
}> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return { profile: null, error: error.message };
  }

  if (!data) {
    return { profile: null };
  }

  const profile: StudentProfile = {
    id: data.id,
    userId: data.user_id,
    fullName: data.full_name,
    registerNumber: data.register_number || undefined,
    department: data.department || undefined,
    yearOfStudy: data.year_of_study || undefined,
    skills: data.skills || [],
    interests: data.interests || [],
    careerGoals: data.career_goals || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return { profile };
}

/**
 * Updates student profile metadata, skills, interests, and career goals
 */
export async function updateStudentProfileAction(
  prevState: StudentProfileFormState | null,
  formData: FormData
): Promise<StudentProfileFormState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  const fullName = (formData.get("fullName") as string)?.trim();
  const registerNumber = (formData.get("registerNumber") as string)?.trim();
  const department = (formData.get("department") as string)?.trim();
  const yearOfStudyStr = formData.get("yearOfStudy") as string;
  const yearOfStudy = yearOfStudyStr ? parseInt(yearOfStudyStr, 10) : undefined;
  const careerGoals = (formData.get("careerGoals") as string)?.trim();

  // Skills & Interests array parsing
  const skillsJson = formData.get("skillsJson") as string;
  const interestsJson = formData.get("interestsJson") as string;

  let skills: string[] = [];
  let interests: string[] = [];

  try {
    if (skillsJson) skills = JSON.parse(skillsJson);
    if (interestsJson) interests = JSON.parse(interestsJson);
  } catch {
    // fallback to empty array if parsing error
  }

  if (!fullName) {
    return { error: "Full Name is required." };
  }

  const { data, error } = await supabase
    .from("student_profiles")
    .upsert({
      user_id: user.id,
      full_name: fullName,
      register_number: registerNumber || null,
      department: department || null,
      year_of_study: yearOfStudy || null,
      skills,
      interests,
      career_goals: careerGoals || null,
    })
    .select("*")
    .single();

  if (error) {
    return { error: `Failed to update profile: ${error.message}` };
  }

  revalidatePath("/dashboard/student/profile");
  revalidatePath("/dashboard/student");

  const updatedProfile: StudentProfile = {
    id: data.id,
    userId: data.user_id,
    fullName: data.full_name,
    registerNumber: data.register_number || undefined,
    department: data.department || undefined,
    yearOfStudy: data.year_of_study || undefined,
    skills: data.skills || [],
    interests: data.interests || [],
    careerGoals: data.career_goals || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return {
    success: true,
    message: "Profile updated successfully!",
    profile: updatedProfile,
  };
}

/**
 * Checks whether a student profile has completed onboarding requirements
 */
export async function isStudentOnboardingCompleted(profile: StudentProfile | null): Promise<boolean> {
  if (!profile) return false;
  const hasAcademic = Boolean(profile.department && profile.yearOfStudy);
  const hasSkills = profile.skills && profile.skills.length > 0;
  const hasInterests = profile.interests && profile.interests.length > 0;
  return hasAcademic && hasSkills && hasInterests;
}

/**
 * Calculates student profile completeness percentage
 */
export async function calculateProfileCompleteness(profile: StudentProfile | null): Promise<number> {
  if (!profile) return 0;
  let points = 0;
  if (profile.fullName) points += 20;
  if (profile.registerNumber) points += 15;
  if (profile.department) points += 15;
  if (profile.yearOfStudy) points += 10;
  if (profile.skills && profile.skills.length > 0) points += 20;
  if (profile.interests && profile.interests.length > 0) points += 10;
  if (profile.careerGoals) points += 10;
  return points;
}

/**
 * Saves multi-step onboarding data and marks onboarding as completed
 */
export async function saveOnboardingAction(
  prevState: StudentProfileFormState | null,
  formData: FormData
): Promise<StudentProfileFormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required." };
  }

  const fullName = (formData.get("fullName") as string)?.trim();
  const registerNumber = (formData.get("registerNumber") as string)?.trim();
  const department = (formData.get("department") as string)?.trim();
  const yearOfStudyStr = formData.get("yearOfStudy") as string;
  const yearOfStudy = yearOfStudyStr ? parseInt(yearOfStudyStr, 10) : undefined;

  const skillsJson = formData.get("skillsJson") as string;
  const interestsJson = formData.get("interestsJson") as string;
  const preferredTypesJson = formData.get("preferredTypesJson") as string;

  let skills: string[] = [];
  let interests: string[] = [];
  let preferredTypes: string[] = [];

  try {
    if (skillsJson) skills = JSON.parse(skillsJson);
    if (interestsJson) interests = JSON.parse(interestsJson);
    if (preferredTypesJson) preferredTypes = JSON.parse(preferredTypesJson);
  } catch {
    // fallback
  }

  if (!fullName) return { error: "Full Name is required." };
  if (!department) return { error: "Academic Department is required." };
  if (!yearOfStudy) return { error: "Year of Study is required." };
  if (skills.length === 0) return { error: "Select at least one technical skill." };
  if (interests.length === 0) return { error: "Select at least one career interest." };

  const careerGoalsObj = {
    completed: true,
    preferredOpportunityTypes: preferredTypes,
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("student_profiles")
    .upsert({
      user_id: user.id,
      full_name: fullName,
      register_number: registerNumber || null,
      department,
      year_of_study: yearOfStudy,
      skills,
      interests,
      career_goals: JSON.stringify(careerGoalsObj),
    });

  if (error) {
    return { error: `Failed to save onboarding: ${error.message}` };
  }

  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/student/profile");

  redirect("/dashboard/student");
}
