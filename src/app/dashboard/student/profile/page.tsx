import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getStudentProfileAction } from "@/lib/students/actions";
import StudentProfileSettingsClient from "@/components/dashboard/StudentProfileSettingsClient";

export const metadata = {
  title: "Personalization Control Center | SRM Opportunity Intelligence",
  description:
    "Manage your academic eligibility signals, technical skills matrix, opportunity interests, and relevance scoring parameters.",
};

export default async function StudentProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { profile } = await getStudentProfileAction();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <StudentProfileSettingsClient initialProfile={profile} userEmail={user?.email} />
    </div>
  );
}
