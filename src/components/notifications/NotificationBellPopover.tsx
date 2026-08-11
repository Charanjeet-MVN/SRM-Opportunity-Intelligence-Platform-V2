"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Notification } from "@/types";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/lib/notifications/actions";
import {
  Bell,
  CheckCheck,
  Sparkles,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ExternalLink,
  X,
  CheckCircle2,
} from "lucide-react";

interface NotificationBellPopoverProps {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

export default function NotificationBellPopover({
  initialNotifications,
  initialUnreadCount,
}: NotificationBellPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await markNotificationReadAction(id);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllNotificationsReadAction();
  }

  return (
    <div ref={popoverRef} className="relative inline-block text-left">
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
        aria-label="Notification Center"
      >
        <Bell className="w-4 h-4" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center px-1 rounded-full bg-indigo-600 text-[9px] font-bold font-mono text-white shadow-md shadow-indigo-600/50 border border-zinc-950"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Popover / Mobile Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 sm:right-0 top-12 z-50 w-[calc(100vw-2rem)] sm:w-96 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-indigo-400" />
                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-900 scrollbar-none">
              {notifications.length === 0 ? (
                <div className="py-12 px-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-zinc-200">You&apos;re all caught up.</h4>
                    <p className="text-[11px] text-zinc-500 font-mono">Nothing new right now.</p>
                  </div>
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon =
                    notif.type === "alert"
                      ? AlertTriangle
                      : notif.type === "reminder"
                      ? Clock
                      : notif.type === "verification"
                      ? ShieldCheck
                      : Sparkles;

                  const iconColor =
                    notif.type === "alert"
                      ? "text-red-400 bg-red-500/10 border-red-500/20"
                      : notif.type === "reminder"
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      : notif.type === "verification"
                      ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                      : "text-purple-400 bg-purple-500/10 border-purple-500/20";

                  return (
                    <motion.div
                      key={notif.id}
                      whileHover={{ backgroundColor: "rgba(24, 24, 27, 0.6)" }}
                      onClick={() => handleMarkRead(notif.id)}
                      className={`p-3.5 flex items-start gap-3 transition-all cursor-pointer ${
                        !notif.isRead ? "bg-indigo-950/20" : ""
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${iconColor}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-semibold truncate ${!notif.isRead ? "text-zinc-100" : "text-zinc-300"}`}>
                            {notif.title}
                          </h4>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug font-light line-clamp-2">
                          {notif.message}
                        </p>
                        {notif.linkUrl && (
                          <Link
                            href={notif.linkUrl}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-indigo-400 hover:text-indigo-300 pt-1"
                          >
                            <span>Open Link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-zinc-800/80 text-center bg-zinc-900/20">
              <Link
                href="/dashboard/student/calendar"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200"
              >
                View Deadline Calendar & Timeline →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
