"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import DashboardHeader from "./DashboardHeader";
import { UserRole, Notification } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  userRole?: UserRole | "guest";
  userName?: string;
  userEmail?: string;
  notifications?: Notification[];
  unreadCount?: number;
}

export default function AppShell({
  children,
  userRole = "student",
  userName,
  userEmail,
  notifications = [],
  unreadCount = 0,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex overflow-hidden">
      {/* Desktop Persistent Sidebar */}
      <Sidebar
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
      />

      {/* Mobile Drawer Navigation */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
      />

      {/* Main App Canvas (Header + Content + Footer) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden">
        {/* Top Global Command Header */}
        <DashboardHeader
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
          notifications={notifications}
          unreadCount={unreadCount}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
        />

        {/* Dynamic Page Workspace Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Ambient Footer */}
        <footer className="border-t border-zinc-900/80 py-5 text-center text-xs text-zinc-600 font-mono flex-shrink-0">
          SRM Opportunity Intelligence Platform — V2 Workspace
        </footer>
      </div>
    </div>
  );
}
