import React from "react";
import { getNotificationsAction } from "@/lib/notifications/actions";
import NotificationCenterFullClient from "@/components/notifications/NotificationCenterFullClient";
import { Radio } from "lucide-react";

export const metadata = {
  title: "Activity & Notifications Hub | SRM Opportunity Intelligence Platform",
  description: "View real-time event announcements, deadline alerts, confirmed registrations, and club dispatches.",
};

export default async function StudentNotificationsPage() {
  const { notifications, unreadCount } = await getNotificationsAction();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-indigo-950/40 border border-zinc-800/80 space-y-2 relative overflow-hidden shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
          <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Intelligent Activity Center</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
          Notifications & Campus Activity Hub
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed font-mono font-light">
          Stay on top of critical application deadlines, confirmed event passes, verified organization charters, and tailored opportunity alerts.
        </p>
      </div>

      {/* Main Master-Detail Client */}
      <NotificationCenterFullClient
        initialNotifications={notifications}
        initialUnreadCount={unreadCount}
      />
    </div>
  );
}
