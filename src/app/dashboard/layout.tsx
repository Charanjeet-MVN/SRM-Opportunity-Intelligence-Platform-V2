import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getNotificationsAction } from "@/lib/notifications/actions";
import GlobalHeader from "@/components/navigation/GlobalHeader";
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Global Command Header & Navigation */}
      <GlobalHeader
        userRole={role}
        userName={fullName}
        userEmail={user.email}
        notifications={notifications}
        unreadCount={unreadCount}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-6 text-center text-xs text-zinc-500 font-mono">
        SRM Opportunity Intelligence Platform — V2 Workspace
      </footer>
    </div>
  );
}
