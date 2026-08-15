import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getStudentAnalyticsAction } from "@/lib/students/analytics";
import { isStudentOnboardingCompleted, getStudentProfileAction } from "@/lib/students/actions";
import StudentAnalyticsClient from "@/components/dashboard/StudentAnalyticsClient";

export default async function StudentAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch student profile info
  const { profile, error: profileError } = await getStudentProfileAction();

  if (profileError || !profile) {
    redirect("/dashboard/student/onboarding");
  }

  const hasOnboarded = await isStudentOnboardingCompleted(profile);
  if (!hasOnboarded) {
    redirect("/dashboard/student/onboarding");
  }

  // Fetch real student analytics data
  const { analytics, error: analyticsError } = await getStudentAnalyticsAction();

  if (analyticsError || !analytics) {
    return (
      <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-md mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
          <span className="text-xl font-bold font-mono">!</span>
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-zinc-200">Analytics Unavailable</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {analyticsError || "Unable to retrieve your opportunity interaction analytics. Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <StudentAnalyticsClient profile={profile} analytics={analytics} />
    </div>
  );
}
