import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getNotificationsAction } from "@/lib/notifications/actions";
import AppShell from "@/components/navigation/AppShell";
import { UserRole } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let role: UserRole = "student";
  let fullName = user.email?.split("@")[0] || "User";

  const [{ notifications, unreadCount }] = await Promise.all([
    getNotificationsAction(),
  ]);

  if (user) {
    const { data: userRec } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (userRec?.role) role = userRec.role as UserRole;

    const { data: profileRec } = await supabase
      .from("student_profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single();
    if (profileRec?.full_name) fullName = profileRec.full_name;
  }

  return (
    <AppShell
      userRole={role}
      userName={fullName}
      userEmail={user.email}
      notifications={notifications}
      unreadCount={unreadCount}
    >
      {children}
    </AppShell>
  );
}
