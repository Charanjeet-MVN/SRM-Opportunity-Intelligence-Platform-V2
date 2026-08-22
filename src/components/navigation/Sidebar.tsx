"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { UserRole } from "@/types";
import { getNavConfig } from "./navConfig";
import SidebarSection from "./SidebarSection";
import SidebarUser from "./SidebarUser";
import GlobalCommandPalette from "./GlobalCommandPalette";
import {
  PanelLeftClose,
  PanelLeft,
  Zap,
} from "lucide-react";

interface SidebarProps {
  userRole?: UserRole | "guest";
  userName?: string;
  userEmail?: string;
}

const COLLAPSED_KEY = "soip_sidebar_collapsed";

export default function Sidebar({
  userRole = "student",
  userName,
  userEmail,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Persist collapse state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSED_KEY);
      if (stored !== null) setIsCollapsed(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(COLLAPSED_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const navConfig = getNavConfig(userRole);

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 60 : 220 }}
        transition={{ type: "spring", stiffness: 340, damping: 32, mass: 0.9 }}
        className="
          relative hidden lg:flex flex-col flex-shrink-0
          h-full min-h-0 overflow-hidden
          bg-zinc-950/80 backdrop-blur-xl
          border-r border-zinc-800/70
        "
        style={{
          background:
            "linear-gradient(180deg, rgba(9,9,11,0.95) 0%, rgba(12,12,16,0.92) 100%)",
        }}
      >
        {/* Subtle ambient top light */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-40 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.04),transparent_70%)] pointer-events-none" />

        {/* ── BRAND HEADER ─────────────────────────────── */}
        <div
          className={`flex items-center h-14 border-b border-zinc-800/60 flex-shrink-0 ${
            isCollapsed ? "justify-center px-0" : "justify-between px-3"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {!isCollapsed ? (
              <motion.div
                key="expanded-brand"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                <Link
                  href="/"
                  className="flex items-center gap-2 group"
                  aria-label="SOIP Home"
                >
                  <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/35 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-lg shadow-violet-900/20">
                    <Zap className="w-3.5 h-3.5 text-violet-400" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-black tracking-widest text-zinc-100 uppercase font-mono leading-none">
                      SOIP
                    </div>
                    <div className="text-[8px] font-mono text-zinc-600 tracking-wider uppercase leading-tight">
                      Intelligence V2
                    </div>
                  </div>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-brand"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Link
                  href="/"
                  aria-label="SOIP Home"
                  className="flex items-center justify-center group"
                >
                  <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/35 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-violet-900/20">
                    <Zap className="w-3.5 h-3.5 text-violet-400" strokeWidth={2.5} />
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse toggle */}
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/70 transition-all duration-150 cursor-pointer flex-shrink-0"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ── EXPAND BUTTON (collapsed state) ─────────────────────────────── */}
        {isCollapsed && (
          <div className="flex justify-center py-2 flex-shrink-0">
            <button
              onClick={toggleCollapse}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/70 transition-all duration-150 cursor-pointer"
            >
              <PanelLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── NAV SECTIONS (scrollable) ────────────────────────────────── */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden py-1 min-h-0 scrollbar-none"
          aria-label="Main navigation"
        >
          {navConfig.sections.map((section) => (
            <SidebarSection
              key={section.id}
              section={section}
              isCollapsed={isCollapsed}
              onCommandPalette={() => setCommandPaletteOpen(true)}
            />
          ))}
        </nav>

        {/* ── USER FOOTER ──────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-zinc-800/50 pt-2">
          <SidebarUser
            userName={userName}
            userEmail={userEmail}
            userRole={userRole}
            isCollapsed={isCollapsed}
          />
        </div>
      </motion.aside>

      {/* Global Command Palette */}
      <GlobalCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        userRole={userRole}
      />
    </>
  );
}
