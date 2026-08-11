import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getAdminMetricsAction,
  getAllClubsAdminAction,
  getAllOpportunitiesAdminAction,
  getAllUsersAdminAction,
} from "@/lib/admin/actions";
import { getPendingVerificationsAction } from "@/lib/clubs/actions";
import AdminControlCenterClient from "@/components/dashboard/AdminControlCenterClient";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: userRec } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRec?.role !== "super_admin") {
    redirect("/dashboard/student");
  }

  // Fetch real platform metrics & moderation records in parallel
  const [
    { metrics },
    { requests },
    { clubs },
    { opportunities },
    { users },
  ] = await Promise.all([
    getAdminMetricsAction(),
    getPendingVerificationsAction(),
    getAllClubsAdminAction(),
    getAllOpportunitiesAdminAction(),
    getAllUsersAdminAction(),
  ]);

  return (
    <AdminControlCenterClient
      metrics={metrics}
      verificationRequests={requests || []}
      clubs={clubs || []}
      opportunities={opportunities || []}
      users={users || []}
    />
  );
}
