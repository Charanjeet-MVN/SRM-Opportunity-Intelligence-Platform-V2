"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserRole } from "@/types";
import { signOutAction } from "@/lib/auth/actions";
import {
  User,
  LogOut,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarUserProps {
  userName?: string;
  userEmail?: string;
  userRole?: UserRole | "guest";
  isCollapsed: boolean;
}

const roleMeta: Record<string, { label: string; color: string }> = {
  student: { label: "Student", color: "text-violet-300 bg-violet-500/10 border-violet-500/25" },
  club_rep: { label: "Club Rep", color: "text-amber-300 bg-amber-500/10 border-amber-500/25" },
  super_admin: { label: "Admin", color: "text-red-300 bg-red-500/10 border-red-500/25" },
  guest: { label: "Guest", color: "text-zinc-400 bg-zinc-800 border-zinc-700" },
};

export default function SidebarUser({
  userName,
  userEmail,
  userRole = "student",
  isCollapsed,
}: SidebarUserProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = roleMeta[userRole] ?? roleMeta.student;
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  if (isCollapsed) {
    return (
      <div className="px-1.5 pb-3 relative group">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open user menu"
          className="
            w-full flex items-center justify-center p-2 rounded-xl
            bg-zinc-900/60 border border-zinc-800/80 cursor-pointer
            hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-150
          "
        >
          <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/35 flex items-center justify-center text-[11px] font-bold font-mono text-violet-300 flex-shrink-0">
            {initials}
          </div>
        </button>

        {/* Collapsed tooltip */}
        <div className="
          absolute left-full ml-3 bottom-3
          z-[200] pointer-events-none whitespace-nowrap
          px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80
          text-xs font-medium text-zinc-200 shadow-xl
          opacity-0 group-hover:opacity-100 transition-opacity duration-150
        ">
          {userName || "Account"}
          <div className="text-[10px] text-zinc-500 mt-0.5">{userEmail}</div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <UserMenu
              userName={userName}
              userEmail={userEmail}
              userRole={userRole}
              meta={meta}
              onClose={() => setMenuOpen(false)}
              position="left-full ml-3 bottom-0"
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="px-1.5 pb-3 relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Open user menu"
        aria-expanded={menuOpen}
        className="
          w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl
          bg-zinc-900/60 border border-zinc-800/80 cursor-pointer
          hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-150
          group
        "
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/35 flex items-center justify-center text-[11px] font-bold font-mono text-violet-300 flex-shrink-0">
          {initials}
        </div>

        {/* Name + role */}
        <div className="flex-1 min-w-0 text-left">
          <div className="text-xs font-semibold text-zinc-200 truncate leading-tight">
            {userName || "Account"}
          </div>
          <div className={`inline-flex items-center mt-0.5 px-1.5 py-0 rounded text-[9px] font-bold uppercase tracking-wider border ${meta.color}`}>
            {meta.label}
          </div>
        </div>

        {/* Chevron */}
        <ChevronUp
          className={`w-3.5 h-3.5 text-zinc-600 transition-transform duration-200 flex-shrink-0 ${
            menuOpen ? "rotate-0" : "rotate-180"
          }`}
        />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <UserMenu
            userName={userName}
            userEmail={userEmail}
            userRole={userRole}
            meta={meta}
            onClose={() => setMenuOpen(false)}
            position="bottom-full mb-2 left-0 right-0"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function UserMenu({
  userName,
  userEmail,
  userRole,
  meta,
  onClose,
  position,
}: {
  userName?: string;
  userEmail?: string;
  userRole?: UserRole | "guest";
  meta: { label: string; color: string };
  onClose: () => void;
  position: string;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[150]"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.97 }}
        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className={`absolute ${position} z-[160] w-56 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl shadow-black/60 p-2 space-y-1`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Identity block */}
        <div className="px-2.5 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800/60 space-y-1">
          <div className="text-xs font-semibold text-zinc-200 truncate">{userName || "User"}</div>
          {userEmail && (
            <div className="text-[10px] text-zinc-500 truncate">{userEmail}</div>
          )}
          <div className={`inline-flex items-center px-1.5 py-0 rounded text-[9px] font-bold uppercase tracking-wider border ${meta.color}`}>
            {meta.label}
          </div>
        </div>

        {/* Profile link */}
        {userRole === "student" && (
          <Link
            href="/dashboard/student/profile"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-violet-400" />
            <span>Profile & Settings</span>
          </Link>
        )}

        <Link
          href="/opportunities"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Discover Opportunities</span>
        </Link>

        {/* Sign out */}
        <div className="border-t border-zinc-800/70 pt-1 mt-1">
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors cursor-pointer text-left font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </motion.div>
    </>
  );
}
