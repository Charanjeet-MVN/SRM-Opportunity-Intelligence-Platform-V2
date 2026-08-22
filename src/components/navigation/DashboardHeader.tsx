"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserRole, Notification } from "@/types";
import GlobalCommandPalette from "./GlobalCommandPalette";
import NotificationBellPopover from "@/components/notifications/NotificationBellPopover";
import { Search, Menu } from "lucide-react";

interface DashboardHeaderProps {
  userRole?: UserRole | "guest";
  userName?: string;
  userEmail?: string;
  notifications?: Notification[];
  unreadCount?: number;
  onMobileMenuOpen?: () => void;
}

export default function DashboardHeader({
  userRole = "guest",
  userName,
  notifications = [],
  unreadCount = 0,
  onMobileMenuOpen,
}: DashboardHeaderProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-zinc-800/70 bg-zinc-950/80 backdrop-blur-xl flex-shrink-0 flex items-center px-4 sm:px-5 gap-3 z-40 sticky top-0">
        {/* Mobile: hamburger menu trigger */}
        <button
          onClick={onMobileMenuOpen}
          aria-label="Open navigation menu"
          className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer flex-shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Command palette search bar */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Open command palette"
          className="
            flex-1 max-w-sm flex items-center gap-2.5 px-3 py-2
            rounded-xl bg-zinc-900/80 border border-zinc-800/80
            hover:border-zinc-700 hover:bg-zinc-900
            text-xs font-mono text-zinc-500
            transition-all duration-150 cursor-pointer
            shadow-inner group
          "
        >
          <Search className="w-3.5 h-3.5 text-zinc-600 group-hover:text-violet-400 transition-colors flex-shrink-0" />
          <span className="flex-1 text-left truncate">Search opportunities, clubs…</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[9px] text-zinc-600 font-mono flex-shrink-0">
            ⌘K
          </kbd>
        </button>

        {/* Right controls */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {/* Mobile search */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            aria-label="Search"
            className="sm:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications */}
          {userRole !== "guest" && (
            <NotificationBellPopover
              initialNotifications={notifications}
              initialUnreadCount={unreadCount}
            />
          )}

          {/* Guest CTA */}
          {userRole === "guest" && (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-bold shadow-md shadow-violet-600/20 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Authenticated user pill — name only, full menu is in sidebar footer */}
          {userRole !== "guest" && (
            <div className="hidden md:flex items-center gap-2 pl-1">
              <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold font-mono text-violet-300">
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="text-xs font-mono font-semibold text-zinc-400 truncate max-w-[80px] hidden lg:inline">
                {userName}
              </span>
            </div>
          )}
        </div>
      </header>

      <GlobalCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        userRole={userRole}
      />
    </>
  );
}
