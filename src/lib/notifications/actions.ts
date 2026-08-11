"use server";

import { createClient } from "@/lib/supabase/server";
import { Notification } from "@/types";
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
    const notifications: Notification[] = dbNotifs.map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type || "info",
      linkUrl: n.link_url || undefined,
      isRead: n.is_read || false,
      createdAt: n.created_at,
    }));

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return { notifications, unreadCount };
  }

  // 2. Fallback: Generate real event notifications from actual user saved/registered/club data
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
    if (urgency.status === "due_today") {
      realNotifs.push({
        id: `notif-deadline-today-${opp.id}`,
        userId: user.id,
        title: "Deadline Urgent — Due Today",
        message: `"${opp.title}" application closes today. Submit before midnight.`,
        type: "alert",
        linkUrl: `/opportunities/${opp.slug}`,
        isRead: false,
        createdAt: opp.application_deadline,
      });
    } else if (urgency.status === "due_tomorrow") {
      realNotifs.push({
        id: `notif-deadline-tomorrow-${opp.id}`,
        userId: user.id,
        title: "Deadline Approaching — Due Tomorrow",
        message: `"${opp.title}" application closes tomorrow. Complete your submission.`,
        type: "reminder",
        linkUrl: `/opportunities/${opp.slug}`,
        isRead: false,
        createdAt: item.created_at,
      });
    } else if (urgency.status === "due_this_week") {
      realNotifs.push({
        id: `notif-deadline-week-${opp.id}`,
        userId: user.id,
        title: "Impending Deadline This Week",
        message: `"${opp.title}" closes in ${urgency.daysLeft} days.`,
        type: "info",
        linkUrl: `/opportunities/${opp.slug}`,
        isRead: false,
        createdAt: item.created_at,
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
        clubs ( name )
      )
    `)
    .eq("user_id", user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (regData || []).forEach((item: any) => {
    const opp = item.opportunities;
    if (!opp) return;

    if (opp.event_start_date) {
      const startDate = new Date(opp.event_start_date);
      if (startDate > new Date()) {
        realNotifs.push({
          id: `notif-reg-${opp.id}`,
          userId: user.id,
          title: "Registration Confirmed",
          message: `You are registered for "${opp.title}" starting on ${startDate.toLocaleDateString()}.`,
          type: "info",
          linkUrl: `/opportunities/${opp.slug}`,
          isRead: true,
          createdAt: item.registered_at,
        });
      }
    }
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
        title: "Official SRM Badge Granted",
        message: `${club.name} is officially verified on the SRM Opportunity Intelligence Platform.`,
        type: "verification",
        linkUrl: `/dashboard/club`,
        isRead: true,
        createdAt: memberData.created_at,
      });
    } else if (club.verification_status === "pending_review") {
      realNotifs.push({
        id: `notif-club-pending-${club.id}`,
        userId: user.id,
        title: "Verification Under Review",
        message: `Charter endorsement documents for ${club.name} are under admin evaluation.`,
        type: "info",
        linkUrl: `/dashboard/club/verification`,
        isRead: false,
        createdAt: memberData.created_at,
      });
    }
  }

  // Sort newest first
  realNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
