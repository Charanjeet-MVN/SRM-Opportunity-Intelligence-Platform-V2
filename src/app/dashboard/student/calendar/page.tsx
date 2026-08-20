import React from "react";
import { createClient } from "@/lib/supabase/server";
import {
  getSavedOpportunitiesAction,
  getRegisteredOpportunitiesAction,
  getStudentTimelineAction,
} from "@/lib/engagement/actions";
import DeadlineRadarClient from "@/components/dashboard/DeadlineRadarClient";
import { StudentProfile } from "@/types";

export default async function StudentCalendarPage() {
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

  const [
    { savedOpportunities },
    { registeredOpportunities },
    { events: timelineEvents },
  ] = await Promise.all([
    getSavedOpportunitiesAction(),
    getRegisteredOpportunitiesAction(),
    getStudentTimelineAction(),
  ]);

  return (
    <DeadlineRadarClient
      savedOpportunities={savedOpportunities || []}
      registeredOpportunities={registeredOpportunities || []}
      timelineEvents={timelineEvents || []}
      studentProfile={studentProfile}
    />
  );
}
