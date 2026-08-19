"use client";

import React, { useState, useMemo } from "react";
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
  ExternalLink,
  CheckCircle2,
  Filter,
  Trash2,
  Undo2,
  Calendar,
  Layers,
  ChevronRight,
  Flame,
  Radio,
  ArrowUpRight,
  Search,
  Check,
  AlertTriangle,
  ArrowRight,
  Compass,
} from "lucide-react";

interface NotificationCenterFullClientProps {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

type PriorityFilter = "all" | "critical" | "high" | "normal" | "informational";
type CategoryFilter = "all" | "deadline" | "event" | "registration" | "club" | "opportunity";

export default function NotificationCenterFullClient({
  initialNotifications,
  initialUnreadCount,
}: NotificationCenterFullClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(
    initialNotifications[0]?.id || null
  );

  const [dismissedToast, setDismissedToast] = useState<{ notif: Notification; index: number } | null>(null);

  // ─────────────── ACTIONS ───────────────

  async function handleToggleRead(id: string) {
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
    const index = notifications.findIndex((n) => n.id === id);
    if (index === -1) return;

    const notif = notifications[index];
    if (!notif.isRead) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    setDismissedToast({ notif, index });
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    if (selectedNotificationId === id) {
      const remaining = notifications.filter((n) => n.id !== id);
      setSelectedNotificationId(remaining[0]?.id || null);
    }

    await dismissNotificationAction(id);
  }

  function handleUndo() {
    if (!dismissedToast) return;
    const { notif, index } = dismissedToast;
    setNotifications((prev) => {
      const next = [...prev];
      next.splice(index, 0, notif);
      return next;
    });
    if (!notif.isRead) setUnreadCount((c) => c + 1);
    setDismissedToast(null);
  }

  // ─────────────── FILTERED RESULTS ───────────────

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (unreadOnly && n.isRead) return false;
      if (priorityFilter !== "all" && n.priority !== priorityFilter) return false;
      if (categoryFilter !== "all" && n.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchMsg = n.message.toLowerCase().includes(q);
        const matchOrg = n.metadata?.clubName?.toLowerCase().includes(q);
        if (!matchTitle && !matchMsg && !matchOrg) return false;
      }

      return true;
    });
  }, [notifications, unreadOnly, priorityFilter, categoryFilter, searchQuery]);

  const selectedNotification = useMemo(() => {
    return (
      notifications.find((n) => n.id === selectedNotificationId) ||
      filteredNotifications[0] ||
      null
    );
  }, [notifications, selectedNotificationId, filteredNotifications]);

  // ─────────────── STYLING HELPERS ───────────────

  const getPriorityStyle = (priority: NotificationPriority = "normal") => {
    switch (priority) {
      case "critical":
        return {
          pill: "bg-rose-500/15 text-rose-300 border-rose-500/30",
          dot: "bg-rose-500 animate-pulse",
          border: "border-l-rose-500 border-l-2",
          label: "Critical Priority",
        };
      case "high":
        return {
          pill: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          dot: "bg-amber-400",
          border: "border-l-amber-500 border-l-2",
          label: "High Priority",
        };
      case "informational":
        return {
          pill: "bg-sky-500/10 text-sky-300 border-sky-500/20",
          dot: "bg-sky-400",
          border: "border-l-sky-500/60 border-l-2",
          label: "Informational",
        };
      case "normal":
      default:
        return {
          pill: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
          dot: "bg-indigo-400",
          border: "border-l-indigo-500/60 border-l-2",
          label: "Standard Notice",
        };
    }
  };

  const getCategoryBadge = (category: NotificationCategory = "event") => {
    switch (category) {
      case "deadline":
        return { label: "Deadline Radar", color: "text-amber-300 bg-amber-500/10 border-amber-500/20", icon: Clock };
      case "registration":
        return { label: "Registration Confirmation", color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 };
      case "club":
        return { label: "Club Dispatch", color: "text-purple-300 bg-purple-500/10 border-purple-500/20", icon: ShieldCheck };
      case "opportunity":
        return { label: "Opportunity Alert", color: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20", icon: Sparkles };
      case "event":
      default:
        return { label: "Event Announcement", color: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20", icon: Calendar };
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Filter & Search Control Panel ─── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-4 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications by title, organization, or keywords..."
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setUnreadOnly((v) => !v)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                unreadOnly
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25"
                  : "bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Unread Only</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-500/30 text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-3.5 py-2 rounded-2xl text-xs font-mono font-medium bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Priority & Category Tag Pills */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-zinc-850/60 text-xs font-mono">
          {/* Priority Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mr-1">
              Priority:
            </span>
            {(["all", "critical", "high", "normal", "informational"] as PriorityFilter[]).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono capitalize transition-all cursor-pointer ${
                  priorityFilter === p
                    ? "bg-zinc-100 text-zinc-950 font-bold"
                    : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-850"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Category Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mr-1">
              Category:
            </span>
            {(["all", "deadline", "event", "registration", "club", "opportunity"] as CategoryFilter[]).map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono capitalize transition-all cursor-pointer ${
                  categoryFilter === c
                    ? "bg-indigo-600 text-white font-bold"
                    : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-850"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Master-Detail Split Pane (Linear Inbox Style) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Notification Master List */}
        <div className="lg:col-span-5 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-900/30 border border-zinc-800/80 space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-200">No matching notifications</h4>
                <p className="text-xs text-zinc-500 font-mono">
                  Try adjusting your search query or active filter tags.
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notif) => {
                const isSelected = selectedNotification?.id === notif.id;
                const pStyle = getPriorityStyle(notif.priority);
                const cBadge = getCategoryBadge(notif.category);
                const CategoryIcon = cBadge.icon;

                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSelectedNotificationId(notif.id)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer space-y-2 relative overflow-hidden ${
                      isSelected
                        ? "bg-zinc-900 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                        : notif.isRead
                        ? "bg-zinc-950/40 border-zinc-850/60 hover:bg-zinc-900/50"
                        : "bg-zinc-900/70 border-zinc-800 hover:border-zinc-700"
                    } ${pStyle.border}`}
                  >
                    {/* Top Row: Category + Timestamp */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${cBadge.color}`}
                      >
                        <CategoryIcon className="w-2.5 h-2.5" />
                        <span>{cBadge.label}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500">
                          {new Date(notif.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Notification Title */}
                    <h4
                      className={`text-xs font-bold leading-snug truncate ${
                        !notif.isRead ? "text-zinc-100" : "text-zinc-300"
                      }`}
                    >
                      {notif.title}
                    </h4>

                    {/* Snippet */}
                    <p className="text-[11px] text-zinc-400 font-light line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Quick controls */}
                    <div className="pt-2 border-t border-zinc-850/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>{notif.metadata?.clubName || "SRM Campus Network"}</span>
                      <button
                        onClick={(e) => handleDismiss(notif.id, e)}
                        className="hover:text-rose-400 transition-colors p-1 rounded"
                        title="Dismiss"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Right Column: Detailed Notification Inspector Card */}
        <div className="lg:col-span-7 sticky top-24">
          {selectedNotification ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 shadow-2xl backdrop-blur-2xl space-y-6">
              {/* Header Badges & Actions */}
              <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      getCategoryBadge(selectedNotification.category).color
                    }`}
                  >
                    {React.createElement(getCategoryBadge(selectedNotification.category).icon, {
                      className: "w-3.5 h-3.5",
                    })}
                    <span>{getCategoryBadge(selectedNotification.category).label}</span>
                  </span>

                  {selectedNotification.priority && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase border ${
                        getPriorityStyle(selectedNotification.priority).pill
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          getPriorityStyle(selectedNotification.priority).dot
                        }`}
                      />
                      <span>{getPriorityStyle(selectedNotification.priority).label}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRead(selectedNotification.id)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        selectedNotification.isRead ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    />
                    <span>{selectedNotification.isRead ? "Mark Unread" : "Mark Read"}</span>
                  </button>

                  <button
                    onClick={() => handleDismiss(selectedNotification.id)}
                    className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Dismiss alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Metadata Details */}
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 leading-snug">
                  {selectedNotification.title}
                </h3>
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      Received: {new Date(selectedNotification.createdAt).toLocaleString()}
                    </span>
                  </span>
                  {selectedNotification.metadata?.clubName && (
                    <span>• {selectedNotification.metadata.clubName}</span>
                  )}
                </div>
              </div>

              {/* Main Notification Body Story */}
              <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-850 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  Alert Context & Briefing
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light whitespace-pre-line">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Action Link & Direct CTA */}
              {selectedNotification.linkUrl && (
                <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                  <Link
                    href={selectedNotification.linkUrl}
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono inline-flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all active:scale-95"
                  >
                    <span>{selectedNotification.actionLabel || "View Opportunity / Details"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/dashboard/student/calendar"
                    className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors inline-flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Sync with Calendar Radar</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-zinc-900/30 border border-zinc-800/80 space-y-3">
              <Inbox className="w-8 h-8 text-zinc-600 mx-auto" />
              <h4 className="text-sm font-bold text-zinc-300">Select a notification</h4>
              <p className="text-xs text-zinc-500 font-mono">
                Click any notification card on the left to inspect its briefing and actions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Undo Toast Bar ─── */}
      <AnimatePresence>
        {dismissedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl flex items-center gap-4 text-xs font-mono"
          >
            <span className="text-zinc-200">Alert dismissed from your center.</span>
            <button
              onClick={handleUndo}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
