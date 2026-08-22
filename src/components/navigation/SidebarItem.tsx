"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { NavItem } from "./navConfig";

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onCommandPalette?: () => void;
  onClick?: () => void;
}

export default function SidebarItem({
  item,
  isActive,
  isCollapsed,
  onCommandPalette,
  onClick,
}: SidebarItemProps) {
  const Icon = item.icon;
  const ref = useRef<HTMLDivElement>(null);

  const content = (
    <>
      {/* Active indicator pill */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-violet-400"
          initial={false}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      {/* Icon */}
      <span
        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 flex-shrink-0 ${
          isActive
            ? "bg-violet-500/15 text-violet-300"
            : "text-zinc-500 group-hover:text-zinc-300 group-hover:bg-zinc-800/60"
        }`}
      >
        <Icon className="w-3.5 h-3.5" strokeWidth={isActive ? 2.2 : 1.8} />
      </span>

      {/* Label */}
      {!isCollapsed && (
        <span
          className={`relative z-10 text-xs font-medium tracking-tight truncate flex-1 min-w-0 transition-colors duration-200 ${
            isActive
              ? "text-zinc-100 font-semibold"
              : "text-zinc-400 group-hover:text-zinc-200"
          }`}
        >
          {item.label}
        </span>
      )}

      {/* Active background fill */}
      {isActive && !isCollapsed && (
        <motion.div
          layoutId="sidebar-active-bg"
          className="absolute inset-0 rounded-xl bg-violet-500/8 border border-violet-500/12"
          initial={false}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </>
  );

  const sharedClasses = `
    relative group flex items-center gap-2.5 w-full px-2 py-2
    rounded-xl cursor-pointer transition-all duration-150 select-none
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50
    ${isCollapsed ? "justify-center" : ""}
  `;

  const tooltip =
    isCollapsed ? (
      <div
        className="
          absolute left-full ml-3 top-1/2 -translate-y-1/2
          z-[200] whitespace-nowrap pointer-events-none
          px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80
          text-xs font-medium text-zinc-200 shadow-xl
          opacity-0 group-hover:opacity-100 transition-opacity duration-150
        "
        role="tooltip"
      >
        {item.label}
        {item.description && (
          <div className="text-[10px] text-zinc-500 mt-0.5">{item.description}</div>
        )}
      </div>
    ) : null;

  if (item.isCommandPalette) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={onCommandPalette}
          aria-label={`Open ${item.label}`}
          className={sharedClasses}
        >
          {content}
          {tooltip}
          {!isCollapsed && (
            <kbd className="relative z-10 ml-auto hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-600 bg-zinc-900 border border-zinc-800 flex-shrink-0">
              ⌘K
            </kbd>
          )}
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <Link
        href={item.href!}
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
        aria-label={item.label}
        className={sharedClasses}
      >
        {content}
        {tooltip}
      </Link>
    </div>
  );
}
