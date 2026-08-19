"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Notification, NotificationPriority, NotificationCategory } from "@/types";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  dismissNotificationAction,
} from "@/lib/notifications/actions";
import {
  Bell,
  CheckCheck,
  Sparkles,
  Clock,
  ShieldCheck,
  X,
  CheckCircle2,
  Trash2,
  Undo2,
  Calendar,
  ChevronRight,
  Flame,
  Radio,
  ArrowUpRight,
} from "lucide-react";

interface NotificationBellPopoverProps {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

type FilterTab = "all" | "unread" | "critical" | "deadline" | "event" | "club" | "opportunity";

export default function NotificationBellPopover({
  initialNotifications,
  initialUnreadCount,
}: NotificationBellPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [dismissedStack, setDismissedStack] = useState<{ notif: Notification; index: number } | null>(null);
  const [undoToastVisible, setUndoToastVisible] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync when initialNotifications updates
  useEffect(() => {
    setNotifications(initialNotifications);
    setUnreadCount(initialUnreadCount);
  }, [initialNotifications, initialUnreadCount]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Lock body scroll on mobile drawer when open
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ─────────────── NOTIFICATION ACTIONS ───────────────

  async function handleToggleRead(id: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    const target = notifications.find((n) => n.id === id);
    if (!target) return;

    const nextState = !target.isRead;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: nextState } : n))
    );
    setUnreadCount((c) => Math.max(0, nextState ? c - 1 : c + 1));

    if (nextState) {
      await markNotificationReadAction(id);
    }
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllNotificationsReadAction();
  }

  async function handleDismiss(id: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    const targetIndex = notifications.findIndex((n) => n.id === id);
    if (targetIndex === -1) return;

    const targetNotif = notifications[targetIndex];
    if (!targetNotif.isRead) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    setDismissedStack({ notif: targetNotif, index: targetIndex });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUndoToastVisible(true);

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setUndoToastVisible(false);
      setDismissedStack(null);
    }, 4500);

    await dismissNotificationAction(id);
  }

  function handleUndoDismiss() {
    if (!dismissedStack) return;
    const { notif, index } = dismissedStack;

    setNotifications((prev) => {
      const next = [...prev];
      next.splice(index, 0, notif);
      return next;
    });

    if (!notif.isRead) {
      setUnreadCount((c) => c + 1);
    }

    setUndoToastVisible(false);
    setDismissedStack(null);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }

  // ─────────────── FILTERING & STATS ───────────────

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (activeTab === "unread") return !notif.isRead;
      if (activeTab === "critical") return notif.priority === "critical" || notif.priority === "high";
      if (activeTab === "deadline") return notif.category === "deadline" || notif.type === "alert" || notif.type === "reminder";
      if (activeTab === "event") return notif.category === "event" || notif.category === "registration";
      if (activeTab === "club") return notif.category === "club" || notif.type === "verification";
      if (activeTab === "opportunity") return notif.category === "opportunity";
      return true;
    });
  }, [notifications, activeTab]);

  const criticalCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead && (n.priority === "critical" || n.priority === "high")).length;
  }, [notifications]);

  // Group notifications into time buckets
  const groupedNotifications = useMemo(() => {
    const criticalList: Notification[] = [];
    const todayList: Notification[] = [];
    const earlierList: Notification[] = [];

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    filteredNotifications.forEach((n) => {
      const itemTime = new Date(n.createdAt).getTime();
      if (!n.isRead && (n.priority === "critical" || n.priority === "high")) {
        criticalList.push(n);
      } else if (itemTime >= todayMidnight) {
        todayList.push(n);
      } else {
        earlierList.push(n);
      }
    });

    return [
      { key: "critical", title: "Action Needed • Urgent", items: criticalList, icon: Flame, color: "text-rose-400" },
      { key: "today", title: "Today", items: todayList, icon: Clock, color: "text-indigo-400" },
      { key: "earlier", title: "Earlier This Week", items: earlierList, icon: Calendar, color: "text-zinc-400" },
    ].filter((g) => g.items.length > 0);
  }, [filteredNotifications]);

  // ─────────────── HELPER RENDERERS ───────────────

  const getPriorityStyle = (priority: NotificationPriority = "normal") => {
    switch (priority) {
      case "critical":
        return {
          pill: "bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-500/20",
          dot: "bg-rose-500 animate-pulse",
          border: "border-l-rose-500 border-l-2",
          iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/25",
          label: "Critical",
        };
      case "high":
        return {
          pill: "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/20",
          dot: "bg-amber-400",
          border: "border-l-amber-500 border-l-2",
          iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/25",
          label: "High",
        };
      case "informational":
        return {
          pill: "bg-sky-500/10 text-sky-300 border-sky-500/20",
          dot: "bg-sky-400",
          border: "border-l-sky-500/60 border-l-2",
          iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
          label: "Info",
        };
      case "normal":
      default:
        return {
          pill: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
          dot: "bg-indigo-400",
          border: "border-l-indigo-500/60 border-l-2",
          iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          label: "Normal",
        };
    }
  };

  const getCategoryBadge = (category: NotificationCategory = "event") => {
    switch (category) {
      case "deadline":
        return { label: "Deadline", color: "text-amber-300 bg-amber-500/10 border-amber-500/20", icon: Clock };
      case "registration":
        return { label: "Registration", color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 };
      case "club":
        return { label: "Club Dispatch", color: "text-purple-300 bg-purple-500/10 border-purple-500/20", icon: ShieldCheck };
      case "opportunity":
        return { label: "Opportunity Alert", color: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20", icon: Sparkles };
      case "event":
      default:
        return { label: "Event Announcement", color: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20", icon: Sparkles };
    }
  };

  return (
    <div ref={popoverRef} className="relative inline-block text-left font-sans">
      {/* ─── Bell Trigger Button ─── */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2.5 rounded-2xl border transition-all cursor-pointer select-none ${
          isOpen
            ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-300 shadow-lg shadow-indigo-500/20"
            : unreadCount > 0
            ? "bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:border-indigo-500/30 hover:text-white"
            : "bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
        }`}
        aria-label="Activity & Notification Center"
      >
        <Bell className="w-4 h-4" />

        {/* Unread Glow Beacon */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[1.1rem] items-center justify-center px-1 rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 text-[9px] font-bold font-mono text-white shadow-lg shadow-indigo-600/50 border border-zinc-950 animate-fade-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Pulsing Dot for Critical alerts */}
        {criticalCount > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 animate-ping pointer-events-none" />
        )}
      </motion.button>

      {/* ─── Popover / Drawer Panel (Linear Inbox + Apple Style) ─── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 sm:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-3 bottom-3 top-auto sm:top-12 sm:bottom-auto sm:right-0 sm:left-auto z-50 sm:w-[460px] max-h-[85vh] sm:max-h-[640px] rounded-3xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden perspective-1000 shadow-3d-card"
            >
              {/* Mobile Drag Indicator Bar */}
              <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mt-2.5 sm:hidden" />

              {/* ─── Header ─── */}
              <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/40 space-y-3 shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shadow-inner">
                      <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-zinc-100 tracking-tight">
                          Activity & Alerts
                        </h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        SRM Intelligent Dispatch Radar
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-mono text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="hidden sm:inline">Mark all read</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-xl hover:bg-zinc-800/80 transition-colors"
                      aria-label="Close notification panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Tabs Navigation (Linear-style segmented pills) */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 select-none text-[11px] font-mono">
                  {[
                    { id: "all", label: "All", count: notifications.length },
                    { id: "unread", label: "Unread", count: unreadCount },
                    { id: "critical", label: "Urgent", count: criticalCount },
                    { id: "deadline", label: "Deadlines" },
                    { id: "event", label: "Events" },
                    { id: "club", label: "Clubs" },
                    { id: "opportunity", label: "Opportunities" },
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as FilterTab)}
                        className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? "bg-zinc-100 text-zinc-950 font-bold shadow-md shadow-white/10"
                            : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-zinc-850"
                        }`}
                      >
                        <span>{tab.label}</span>
                        {tab.count !== undefined && tab.count > 0 && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                              isActive
                                ? "bg-zinc-950 text-zinc-100"
                                : "bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ─── Notification Feed Body ─── */}
              <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/90 scrollbar-none p-3 space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="py-16 px-6 text-center space-y-3.5">
                    <div className="w-14 h-14 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500 shadow-inner">
                      <CheckCircle2 className="w-7 h-7 text-emerald-400/90" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-100">
                        {activeTab === "unread"
                          ? "Zero pending alerts"
                          : "You're all caught up!"}
                      </h4>
                      <p className="text-xs text-zinc-500 font-mono max-w-xs mx-auto">
                        No announcements or deadlines requiring your immediate attention.
                      </p>
                    </div>
                  </div>
                ) : (
                  groupedNotifications.map((group) => (
                    <div key={group.key} className="space-y-2 pt-1 first:pt-0">
                      {/* Group Header */}
                      <div className="flex items-center justify-between px-2 py-1">
                        <div className="flex items-center gap-1.5">
                          <group.icon className={`w-3.5 h-3.5 ${group.color}`} />
                          <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider font-mono">
                            {group.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {group.items.length} {group.items.length === 1 ? "item" : "items"}
                        </span>
                      </div>

                      {/* Notification Cards in Group */}
                      <div className="space-y-2">
                        <AnimatePresence mode="popLayout">
                          {group.items.map((notif) => {
                            const pStyle = getPriorityStyle(notif.priority);
                            const cBadge = getCategoryBadge(notif.category);
                            const CategoryIcon = cBadge.icon;

                            return (
                              <motion.div
                                key={notif.id}
                                layout
                                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.94 }}
                                transition={{ duration: 0.22, ease: "easeOut" }}
                                onClick={() => handleToggleRead(notif.id)}
                                className={`group relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                                  !notif.isRead
                                    ? "bg-zinc-900/80 hover:bg-zinc-900 border-zinc-750/90 shadow-md shadow-black/40"
                                    : "bg-zinc-950/40 hover:bg-zinc-900/50 border-zinc-850/60 opacity-80 hover:opacity-100"
                                } ${pStyle.border}`}
                              >
                                {/* Top Badges Row */}
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {/* Category Pill */}
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${cBadge.color}`}
                                    >
                                      <CategoryIcon className="w-2.5 h-2.5" />
                                      <span>{cBadge.label}</span>
                                    </span>

                                    {/* Priority Indicator */}
                                    {notif.priority && notif.priority !== "normal" && (
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase border ${pStyle.pill}`}
                                      >
                                        <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dot}`} />
                                        <span>{pStyle.label}</span>
                                      </span>
                                    )}
                                  </div>

                                  {/* Right side: Timestamp & Unread Beacon */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-mono text-zinc-500">
                                      {new Date(notif.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                    {!notif.isRead && (
                                      <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/80 animate-pulse" />
                                    )}
                                  </div>
                                </div>

                                {/* Title & Message Body */}
                                <div className="space-y-1 pr-6">
                                  <h4
                                    className={`text-xs sm:text-[13px] font-bold leading-snug tracking-tight ${
                                      !notif.isRead ? "text-zinc-100" : "text-zinc-300"
                                    }`}
                                  >
                                    {notif.title}
                                  </h4>
                                  <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 font-light">
                                    {notif.message}
                                  </p>
                                </div>

                                {/* Bottom Metadata & Quick Action Bar */}
                                <div className="mt-3 pt-2.5 border-t border-zinc-850/60 flex items-center justify-between gap-3 text-[11px] font-mono">
                                  {notif.linkUrl ? (
                                    <Link
                                      href={notif.linkUrl}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                      }}
                                      className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-bold transition-colors group/link"
                                    >
                                      <span>{notif.actionLabel || "View Details"}</span>
                                      <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                    </Link>
                                  ) : (
                                    <span className="text-zinc-500 text-[10px]">
                                      {notif.metadata?.clubName || "SRM Campus Network"}
                                    </span>
                                  )}

                                  {/* Quick Action Icons (Read toggle & Dismiss) */}
                                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => handleToggleRead(notif.id, e)}
                                      className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                                      title={notif.isRead ? "Mark as unread" : "Mark as read"}
                                    >
                                      <CheckCircle2
                                        className={`w-3.5 h-3.5 ${
                                          notif.isRead ? "text-emerald-400" : "text-zinc-500"
                                        }`}
                                      />
                                    </button>
                                    <button
                                      onClick={(e) => handleDismiss(notif.id, e)}
                                      className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                      title="Dismiss notification"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ─── Undo Toast Bar ─── */}
              <AnimatePresence>
                {undoToastVisible && dismissedStack && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mx-3 mb-2 p-2.5 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-xl flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-zinc-300 truncate max-w-[240px]">
                      Notification dismissed
                    </span>
                    <button
                      onClick={handleUndoDismiss}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors cursor-pointer"
                    >
                      <Undo2 className="w-3 h-3" />
                      <span>Undo</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Footer Action Bar ─── */}
              <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between text-xs font-mono text-zinc-400 shrink-0">
                <Link
                  href="/dashboard/student/calendar"
                  onClick={() => setIsOpen(false)}
                  className="hover:text-zinc-200 transition-colors flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Calendar Timeline</span>
                </Link>

                <Link
                  href="/dashboard/student/feed"
                  onClick={() => setIsOpen(false)}
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors flex items-center gap-1"
                >
                  <span>Activity Feed</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
