import React from "react";
import Link from "next/link";
import { Compass, Bookmark, Calendar, User, LogOut, CheckCircle2, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/auth/actions";

import { redirect } from "next/navigation";

import { getNotificationsAction } from "@/lib/notifications/actions";
import NotificationBellPopover from "@/components/notifications/NotificationBellPopover";

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

  // Query user role & name & notifications
  let role = "student";
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
    if (userRec) role = userRec.role;

    const { data: profileRec } = await supabase
      .from("student_profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single();
    if (profileRec?.full_name) fullName = profileRec.full_name;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-xs">
                V2
              </div>
              <span className="text-xs font-semibold tracking-wider text-zinc-100 uppercase hidden sm:inline-block">
                SRM Intelligence
              </span>
            </Link>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/dashboard/student"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>Discovery</span>
              </Link>

              <Link
                href="/dashboard/student/saved"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Saved</span>
              </Link>

              <Link
                href="/dashboard/student/registrations"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Registrations</span>
              </Link>

              <Link
                href="/clubs"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clubs</span>
              </Link>

              <Link
                href="/dashboard/student/calendar"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Calendar</span>
              </Link>
            </nav>
          </div>

          {/* User Account Controls */}
          <div className="flex items-center gap-3">
            <NotificationBellPopover
              initialNotifications={notifications}
              initialUnreadCount={unreadCount}
            />

            <Link
              href="/dashboard/student/profile"
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-zinc-200 hidden md:inline">{fullName}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize">
                {role}
              </span>
            </Link>

            <form action={signOutAction}>
              <button
                type="submit"
                title="Sign Out"
                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

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
