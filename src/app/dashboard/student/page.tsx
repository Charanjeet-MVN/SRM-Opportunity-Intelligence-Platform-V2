import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getPersonalizedFeedAction } from "@/lib/opportunities/actions";
import { getSavedOpportunitiesAction, getRegisteredOpportunitiesAction } from "@/lib/engagement/actions";
import CommandCenterClient from "@/components/dashboard/CommandCenterClient";
import { getAIRecommendedOpportunitiesAction } from "@/lib/ai/service";
import { redirect } from "next/navigation";
import { calculateProfileCompleteness, isStudentOnboardingCompleted } from "@/lib/students/actions";
import { StudentProfile } from "@/types";

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let studentProfile: StudentProfile | null = null;

  if (user) {
    const { data } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      studentProfile = {
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
    }
  }

  const hasOnboarded = await isStudentOnboardingCompleted(studentProfile);
  if (!hasOnboarded) {
    redirect("/dashboard/student/onboarding");
  }

  const completeness = await calculateProfileCompleteness(studentProfile);

  // Fetch real data only — no fake content
  const [
    { opportunities },
    { savedOpportunities },
    { registeredOpportunities },
    { recommendations: aiRecommendations },
  ] = await Promise.all([
    getPersonalizedFeedAction({ limit: 6, sortBy: "relevance" }),
    getSavedOpportunitiesAction(),
    getRegisteredOpportunitiesAction(),
    getAIRecommendedOpportunitiesAction(),
  ]);

  return (
    <CommandCenterClient
      studentProfile={studentProfile}
      profileCompleteness={completeness}
      opportunities={opportunities}
      savedOpportunities={savedOpportunities || []}
      registeredOpportunities={registeredOpportunities || []}
      aiRecommendations={aiRecommendations || []}
    />
  );
}
