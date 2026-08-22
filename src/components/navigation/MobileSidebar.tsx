"use client";

import React, { useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { UserRole } from "@/types";
import { getNavConfig } from "./navConfig";
import SidebarSection from "./SidebarSection";
import { signOutAction } from "@/lib/auth/actions";
import {
  X,
  Zap,
  LogOut,
  User,
} from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: UserRole | "guest";
  userName?: string;
  userEmail?: string;
  onCommandPalette?: () => void;
}

const roleMeta: Record<string, { label: string; color: string }> = {
  student: { label: "Student", color: "text-violet-300 bg-violet-500/10 border-violet-500/25" },
  club_rep: { label: "Club Rep", color: "text-amber-300 bg-amber-500/10 border-amber-500/25" },
  super_admin: { label: "Admin", color: "text-red-300 bg-red-500/10 border-red-500/25" },
  guest: { label: "Guest", color: "text-zinc-400 bg-zinc-800 border-zinc-700" },
};

export default function MobileSidebar({
  isOpen,
  onClose,
  userRole = "student",
  userName,
  userEmail,
  onCommandPalette,
}: MobileSidebarProps) {
  const navConfig = getNavConfig(userRole);
  const meta = roleMeta[userRole] ?? roleMeta.student;
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    },
    [isOpen, onClose]
  );
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden
          />

          {/* Drawer panel */}
          <motion.div
            key="mobile-drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 32, mass: 0.9 }}
            className="fixed left-0 top-0 bottom-0 z-[310] w-72 flex flex-col lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            style={{
              background:
                "linear-gradient(180deg, rgba(9,9,11,0.98) 0%, rgba(12,12,16,0.97) 100%)",
              borderRight: "1px solid rgba(39,39,42,0.7)",
            }}
          >
            {/* Ambient light */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-48 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.05),transparent_70%)] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-800/60 flex-shrink-0 relative z-10">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-2.5 group"
                aria-label="SOIP Home"
              >
                <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/35 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-violet-900/20">
                  <Zap className="w-3.5 h-3.5 text-violet-400" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[11px] font-black tracking-widest text-zinc-100 uppercase font-mono leading-none">
                    SOIP
                  </div>
                  <div className="text-[8px] font-mono text-zinc-600 tracking-wider uppercase leading-tight">
                    Intelligence V2
                  </div>
                </div>
              </Link>

              <button
                onClick={onClose}
                aria-label="Close navigation"
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav sections */}
            <nav
              className="flex-1 overflow-y-auto overflow-x-hidden py-1 min-h-0 scrollbar-none relative z-10"
              aria-label="Mobile navigation"
            >
              {navConfig.sections.map((section) => (
                <SidebarSection
                  key={section.id}
                  section={section}
                  isCollapsed={false}
                  onCommandPalette={() => {
                    onClose();
                    onCommandPalette?.();
                  }}
                  onNavigate={onClose}
                />
              ))}
            </nav>

            {/* User footer */}
            <div className="flex-shrink-0 border-t border-zinc-800/50 p-3 relative z-10">
              <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/35 flex items-center justify-center text-xs font-bold font-mono text-violet-300 flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-zinc-200 truncate">
                    {userName || "Account"}
                  </div>
                  {userEmail && (
                    <div className="text-[10px] text-zinc-500 truncate">{userEmail}</div>
                  )}
                  <div className={`inline-flex items-center mt-1 px-1.5 py-0 rounded text-[9px] font-bold uppercase tracking-wider border ${meta.color}`}>
                    {meta.label}
                  </div>
                </div>
              </div>

              <div className="mt-1.5 space-y-1">
                {userRole === "student" && (
                  <Link
                    href="/dashboard/student/profile"
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-violet-400" />
                    <span>Profile & Settings</span>
                  </Link>
                )}

                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors cursor-pointer text-left font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
