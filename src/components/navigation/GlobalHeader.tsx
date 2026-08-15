"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole, Notification } from "@/types";
import GlobalCommandPalette from "./GlobalCommandPalette";
import NotificationBellPopover from "@/components/notifications/NotificationBellPopover";
import { signOutAction } from "@/lib/auth/actions";
import {
  Search,
  Compass,
  Bookmark,
  Calendar,
  User,
  LogOut,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Plus,
  ChevronDown,
  Sparkles,
  BarChart3,
  Layout,
} from "lucide-react";

interface GlobalHeaderProps {
  userRole?: UserRole | "guest";
  userName?: string;
  userEmail?: string;
  notifications?: Notification[];
  unreadCount?: number;
}

export default function GlobalHeader({
  userRole = "guest",
  userName,
  userEmail,
  notifications = [],
  unreadCount = 0,
}: GlobalHeaderProps) {
  const pathname = usePathname();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const isStudent = userRole === "student";
  const isClubRep = userRole === "club_rep";
  const isSuperAdmin = userRole === "super_admin";

  return (
    <>
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Role-specific Nav Links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-black text-xs group-hover:scale-105 transition-all shadow-lg shadow-purple-600/10">
                V2
              </div>
              <span className="text-xs font-mono font-bold tracking-wider text-zinc-100 uppercase hidden sm:inline-block">
                SRM Intelligence
              </span>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/opportunities" active={pathname === "/opportunities"}>
                <Compass className="w-3.5 h-3.5 text-purple-400" />
                <span>Explore</span>
              </NavLink>

              <NavLink href="/clubs" active={pathname.startsWith("/clubs")}>
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Organizations</span>
              </NavLink>

              {isStudent && (
                <>
                  <NavLink href="/dashboard/student" active={pathname === "/dashboard/student"}>
                    <Layout className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dashboard</span>
                  </NavLink>
                  <NavLink href="/dashboard/student/workspace" active={pathname === "/dashboard/student/workspace"}>
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>AI Workspace</span>
                  </NavLink>
                  <NavLink href="/dashboard/student/saved" active={pathname.includes("/saved")}>
                    <Bookmark className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Saved</span>
                  </NavLink>
                  <NavLink href="/dashboard/student/analytics" active={pathname === "/dashboard/student/analytics"}>
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Impact Center</span>
                  </NavLink>
                </>
              )}

              {isClubRep && (
                <>
                  <NavLink href="/dashboard/club" active={pathname === "/dashboard/club"}>
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Club Command</span>
                  </NavLink>
                  <NavLink href="/dashboard/club/opportunities/new" active={pathname.includes("/new")}>
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Publish Opp</span>
                  </NavLink>
                  <NavLink href="/dashboard/club/analytics" active={pathname === "/dashboard/club/analytics"}>
                    <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Analytics</span>
                  </NavLink>
                </>
              )}

              {isSuperAdmin && (
                <>
                  <NavLink href="/dashboard/admin" active={pathname === "/dashboard/admin"}>
                    <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                    <span>Trust Control</span>
                  </NavLink>
                  <NavLink href="/dashboard/admin/verifications" active={pathname.includes("/verifications")}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Verifications</span>
                  </NavLink>
                </>
              )}
            </nav>
          </div>

          {/* Center/Right: Command Palette Trigger Button */}
          <div className="flex-1 max-w-sm hidden sm:block">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full px-3.5 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-400 flex items-center justify-between transition-all cursor-pointer shadow-inner"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-purple-400" />
                <span>Search or type command...</span>
              </div>
              <kbd className="px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-500 font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Notifications & User Profile Menu */}
          <div className="flex items-center gap-3">
            {/* Mobile Search Button Trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="sm:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
            >
              <Search className="w-4 h-4" />
            </button>

            {userRole !== "guest" && (
              <NotificationBellPopover
                initialNotifications={notifications}
                initialUnreadCount={unreadCount}
              />
            )}

            {userRole === "guest" ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-zinc-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold shadow-md shadow-purple-600/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              /* Profile Menu Dropdown */
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-xs font-bold font-mono">
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-200 hidden md:inline truncate max-w-[100px]">
                    {userName || "Account"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {profileMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 space-y-1 font-mono text-xs"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-0.5">
                      <div className="font-bold text-zinc-200 truncate">{userName || "User"}</div>
                      {userEmail && <div className="text-[10px] text-zinc-500 truncate">{userEmail}</div>}
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20 mt-1 font-bold">
                        {userRole.replace("_", " ")}
                      </span>
                    </div>

                    <Link
                      href="/dashboard/student/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      <span>Profile & Vector</span>
                    </Link>

                    {isStudent && (
                      <Link
                        href="/dashboard/student/calendar"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:bg-zinc-800 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span>Deadline Calendar</span>
                      </Link>
                    )}

                    <div className="border-t border-zinc-800/80 pt-1">
                      <form action={signOutAction}>
                        <button
                          type="submit"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left font-bold"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <GlobalCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        userRole={userRole}
      />
    </>
  );
}

function NavLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-xl transition-all ${
        active
          ? "bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
      }`}
    >
      {children}
    </Link>
  );
}
