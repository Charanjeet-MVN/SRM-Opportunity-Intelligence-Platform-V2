import React from "react";
import { getStudentActivityTimelineAction } from "@/lib/engagement/actions";
import StudentActivityWorkspaceClient from "@/components/activity/StudentActivityWorkspaceClient";

export const metadata = {
  title: "My Activity | SRM Opportunity Intelligence Platform",
  description: "Authentic chronological history of your saved opportunities, registrations, applications, and campus milestones.",
};

export default async function StudentActivityPage() {
  const { activities } = await getStudentActivityTimelineAction();

  return (
    <StudentActivityWorkspaceClient initialActivities={activities || []} />
  );
}
