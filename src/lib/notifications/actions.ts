"use server";

import { createClient } from "@/lib/supabase/server";
import { Notification, NotificationPriority, NotificationCategory } from "@/types";
import { revalidatePath } from "next/cache";
import { getDeadlineUrgency } from "./urgency";

/**
 * Server Action: Fetches real, event-driven notifications for authenticated student/club rep
 */
export async function getNotificationsAction(): Promise<{
  notifications: Notification[];
  unreadCount: number;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { notifications: [], unreadCount: 0, error: "Not authenticated" };
  }

  // 1. Try querying persistent `notifications` table if present in Supabase
  const { data: dbNotifs, error: dbError } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!dbError && dbNotifs && dbNotifs.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notifications: Notification[] = dbNotifs.map((n: any) => {
      let priority: NotificationPriority = n.priority || "normal";
      if (!n.priority) {
        if (n.type === "alert") priority = "critical";
        else if (n.type === "reminder" || n.type === "verification") priority = "high";
        else priority = "normal";
      }

      let category: NotificationCategory = n.category || "system";
      if (!n.category) {
        if (n.type === "alert" || n.type === "reminder") category = "deadline";
        else if (n.type === "verification") category = "club";
        else category = "event";
      }

      return {
        id: n.id,
        userId: n.user_id,
        title: n.title,
        message: n.message,
        type: n.type || "info",
        priority,
        category,
        groupKey: n.group_key || undefined,
        linkUrl: n.link_url || undefined,
        actionLabel: n.action_label || (n.link_url ? "View Details" : undefined),
        isRead: n.is_read || false,
        createdAt: n.created_at,
        metadata: n.metadata || undefined,
      };
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return { notifications, unreadCount };
  }

  // 2. Fallback: Generate real event notifications from actual user saved/registered/club data & catalog
  const realNotifs: Notification[] = [];

  // Fetch student's saved opportunities
  const { data: savedData } = await supabase
    .from("saved_opportunities")
    .select(`
      created_at,
      opportunities (
        id,
        title,
        slug,
        application_deadline,
        type,
        clubs ( name )
      )
    `)
    .eq("user_id", user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (savedData || []).forEach((item: any) => {
    const opp = item.opportunities;
    if (!opp || !opp.application_deadline) return;

    const urgency = getDeadlineUrgency(opp.application_deadline);
    const clubName = opp.clubs?.name || "SRM Organization";

    if (urgency.status === "due_today") {
      realNotifs.push({
        id: `notif-deadline-today-${opp.id}`,
        userId: user.id,
        title: "Deadline Urgent — Due Today",
        message: `"${opp.title}" application closes today. Submit your final package before midnight.`,
        type: "alert",
        priority: "critical",
        category: "deadline",
        groupKey: "critical-deadlines",
        linkUrl: `/opportunities/${opp.slug}`,
        actionLabel: "Submit Application Now",
        isRead: false,
        createdAt: new Date().toISOString(),
        metadata: {
          clubName,
          opportunityTitle: opp.title,
          deadlineDate: opp.application_deadline,
          badgeText: "Due Today • Action Required",
          tag: "Critical Deadline",
        },
      });
    } else if (urgency.status === "due_tomorrow") {
      realNotifs.push({
        id: `notif-deadline-tomorrow-${opp.id}`,
        userId: user.id,
        title: "Approaching Deadline — Due Tomorrow",
        message: `"${opp.title}" application closes tomorrow. Complete your required documents.`,
        type: "reminder",
        priority: "high",
        category: "deadline",
        groupKey: "upcoming-deadlines",
        linkUrl: `/opportunities/${opp.slug}`,
        actionLabel: "Review & Apply",
        isRead: false,
        createdAt: item.created_at,
        metadata: {
          clubName,
          opportunityTitle: opp.title,
          deadlineDate: opp.application_deadline,
          badgeText: "Due Tomorrow",
          tag: "24h Window",
        },
      });
    } else if (urgency.status === "due_this_week") {
      realNotifs.push({
        id: `notif-deadline-week-${opp.id}`,
        userId: user.id,
        title: "Impending Deadline This Week",
        message: `"${opp.title}" by ${clubName} closes in ${urgency.daysLeft} days.`,
        type: "info",
        priority: "normal",
        category: "deadline",
        groupKey: "this-week",
        linkUrl: `/opportunities/${opp.slug}`,
        actionLabel: "View Application",
        isRead: false,
        createdAt: item.created_at,
        metadata: {
          clubName,
          opportunityTitle: opp.title,
          deadlineDate: opp.application_deadline,
          badgeText: `${urgency.daysLeft} days left`,
          tag: "Weekly Radar",
        },
      });
    }
  });

  // Fetch student's registered opportunities
  const { data: regData } = await supabase
    .from("registrations")
    .select(`
      registered_at,
      opportunities (
        id,
        title,
        slug,
        event_start_date,
        type,
        clubs ( name )
      )
    `)
    .eq("user_id", user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (regData || []).forEach((item: any) => {
    const opp = item.opportunities;
    if (!opp) return;

    const clubName = opp.clubs?.name || "SRM Organization";
    const startDate = opp.event_start_date ? new Date(opp.event_start_date) : null;
    const formattedDate = startDate ? startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Scheduled Date";

    realNotifs.push({
      id: `notif-reg-${opp.id}`,
      userId: user.id,
      title: "Registration Confirmed",
      message: `Your pass for "${opp.title}" hosted by ${clubName} is confirmed for ${formattedDate}.`,
      type: "info",
      priority: "normal",
      category: "registration",
      groupKey: "registrations",
      linkUrl: `/opportunities/${opp.slug}`,
      actionLabel: "View Pass & Details",
      isRead: true,
      createdAt: item.registered_at || new Date().toISOString(),
      metadata: {
        clubName,
        opportunityTitle: opp.title,
        badgeText: "Confirmed Pass",
        tag: "Official Entry",
      },
    });
  });

  // Fetch club membership & verification status for club reps
  const { data: memberData } = await supabase
    .from("club_members")
    .select(`
      created_at,
      clubs (
        id,
        name,
        verification_status
      )
    `)
    .eq("user_id", user.id)
    .single();

  if (memberData && memberData.clubs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const club = memberData.clubs as any;
    if (club.verification_status === "verified") {
      realNotifs.push({
        id: `notif-club-verified-${club.id}`,
        userId: user.id,
        title: "Official SRM Organization Badge Granted",
        message: `${club.name} has been verified with official endorsement privileges on the SRM Intelligence Platform.`,
        type: "verification",
        priority: "high",
        category: "club",
        groupKey: "club-updates",
        linkUrl: `/dashboard/club`,
        actionLabel: "Open Club Command",
        isRead: true,
        createdAt: memberData.created_at,
        metadata: {
          clubName: club.name,
          badgeText: "Charter Verified",
          tag: "Organization Badge",
        },
      });
    } else if (club.verification_status === "pending_review") {
      realNotifs.push({
        id: `notif-club-pending-${club.id}`,
        userId: user.id,
        title: "Club Verification in Evaluation",
        message: `Endorsement charter and faculty advisor documents for ${club.name} are currently under committee review.`,
        type: "info",
        priority: "normal",
        category: "club",
        groupKey: "club-updates",
        linkUrl: `/dashboard/club/verification`,
        actionLabel: "Check Status",
        isRead: false,
        createdAt: memberData.created_at,
        metadata: {
          clubName: club.name,
          badgeText: "Pending Review",
          tag: "Faculty Audit",
        },
      });
    }
  }

  // Fetch latest published opportunities for opportunity alerts & event announcements
  const { data: latestOpps } = await supabase
    .from("opportunities")
    .select(`
      id,
      title,
      slug,
      type,
      created_at,
      clubs ( name )
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (latestOpps || []).forEach((opp: any) => {
    // Avoid duplicate notifications if already tracked
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAlreadySaved = (savedData || []).some((s: any) => s.opportunities?.id === opp.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAlreadyReg = (regData || []).some((r: any) => r.opportunities?.id === opp.id);
    if (isAlreadySaved || isAlreadyReg) return;

    const clubName = opp.clubs?.name || "SRM Organization";
    const isEvent = opp.type === "hackathon" || opp.type === "workshop" || opp.type === "competition" || opp.type === "conference";

    realNotifs.push({
      id: `notif-opp-broadcast-${opp.id}`,
      userId: user.id,
      title: isEvent ? `New Event: ${opp.title}` : `Opportunity Alert: ${opp.title}`,
      message: `${clubName} just published "${opp.title}". Explore eligibility and application vectors.`,
      type: "info",
      priority: isEvent ? "normal" : "informational",
      category: isEvent ? "event" : "opportunity",
      groupKey: "discoveries",
      linkUrl: `/opportunities/${opp.slug}`,
      actionLabel: "Explore Listing",
      isRead: false,
      createdAt: opp.created_at,
      metadata: {
        clubName,
        opportunityTitle: opp.title,
        badgeText: opp.type.replace("_", " ").toUpperCase(),
        tag: isEvent ? "Campus Event" : "Career Track",
      },
    });
  });

  // Sort newest and highest priority first
  const priorityWeight: Record<NotificationPriority, number> = {
    critical: 4,
    high: 3,
    normal: 2,
    informational: 1,
  };

  realNotifs.sort((a, b) => {
    // Unread first, then priority, then date
    if (!a.isRead && b.isRead) return -1;
    if (a.isRead && !b.isRead) return 1;
    const pA = priorityWeight[a.priority || "normal"];
    const pB = priorityWeight[b.priority || "normal"];
    if (pA !== pB) return pB - pA;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const unreadCount = realNotifs.filter((n) => !n.isRead).length;
  return { notifications: realNotifs, unreadCount };
}

/**
 * Server Action: Marks a notification as read
 */
export async function markNotificationReadAction(notificationId: string): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false };

  // Try DB update if table exists
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Server Action: Marks all notifications as read for current user
 */
export async function markAllNotificationsReadAction(): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false };

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Server Action: Dismisses / hides a notification
 */
export async function dismissNotificationAction(notificationId: string): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false };

  await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
  return { success: true };
}

