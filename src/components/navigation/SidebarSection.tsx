"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { NavSection as NavSectionType } from "./navConfig";
import SidebarItem from "./SidebarItem";

interface SidebarSectionProps {
  section: NavSectionType;
  isCollapsed: boolean;
  onCommandPalette?: () => void;
  onNavigate?: () => void;
}

function isItemActive(href: string | undefined, pathname: string): boolean {
  if (!href) return false;
  // Exact match for root dashboard routes to avoid highlighting /dashboard
  // when on a deeper route
  if (href === "/dashboard/student") {
    return pathname === "/dashboard/student";
  }
  if (href === "/dashboard/club") {
    return pathname === "/dashboard/club";
  }
  if (href === "/dashboard/admin") {
    return pathname === "/dashboard/admin";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export default function SidebarSection({
  section,
  isCollapsed,
  onCommandPalette,
  onNavigate,
}: SidebarSectionProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-0.5">
      {/* Section label — hidden when collapsed */}
      {!isCollapsed && (
        <div className="px-3 pt-4 pb-1.5 first:pt-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-600 select-none font-mono">
            {section.label}
          </span>
        </div>
      )}

      {/* Collapsed divider */}
      {isCollapsed && section.label !== "Primary" && (
        <div className="px-2 py-2">
          <div className="w-full h-px bg-zinc-800/60 rounded-full" />
        </div>
      )}

      {/* Items */}
      <div className="space-y-0.5 px-1.5">
        {section.items.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={isItemActive(item.href, pathname)}
            isCollapsed={isCollapsed}
            onCommandPalette={onCommandPalette}
            onClick={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}
