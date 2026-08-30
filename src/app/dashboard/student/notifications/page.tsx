import React from "react";
import { getNotificationsAction } from "@/lib/notifications/actions";
import NotificationCenterFullClient from "@/components/notifications/NotificationCenterFullClient";
import { Radio } from "lucide-react";

export const metadata = {
  title: "Notifications Hub | SRM Opportunity Intelligence Platform",
  description: "View real-time event announcements, deadline alerts, confirmed registrations, and club dispatches.",
};

export default async function StudentNotificationsPage() {
  const { notifications, unreadCount } = await getNotificationsAction();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 space-y-3 relative overflow-hidden shadow-2xl backdrop-blur-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
          <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
            Notifications 2.0
          </span>
          <span className="text-zinc-700">•</span>
          <span className="text-zinc-400 text-[10px]">Attention Radar</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-zinc-100 tracking-tight">
          What needs my attention?
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed font-light">
          Prioritized alert center for critical application deadlines, confirmed event registrations, club dispatches, and opportunity updates.
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
