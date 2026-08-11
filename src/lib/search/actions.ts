"use server";

import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/types";

export interface CommandSearchResultItem {
  id: string;
  type: "page" | "opportunity" | "club" | "action";
  title: string;
  subtitle?: string;
  url: string;
  badge?: string;
  icon?: string;
}

export interface CommandSearchResponse {
  items: CommandSearchResultItem[];
  role: UserRole | "guest";
  userName?: string;
  userEmail?: string;
}

/**
 * Searches opportunities, clubs, and navigation items for the Global Command Palette
 */
export async function searchCommandPaletteAction(
  query: string = ""
): Promise<CommandSearchResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role: UserRole | "guest" = "guest";
  let userName: string | undefined = undefined;
  const userEmail: string | undefined = user?.email;

  if (user) {
    const { data: userRec } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (userRec?.role) role = userRec.role as UserRole;

    const { data: profileRec } = await supabase
      .from("student_profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single();
    if (profileRec?.full_name) {
      userName = profileRec.full_name;
    } else {
      userName = user.email?.split("@")[0];
    }
  }

  const items: CommandSearchResultItem[] = [];
  const q = query.trim().toLowerCase();

  // 1. Static Role-Specific Navigation Pages
  if (role === "student" || role === "guest") {
    items.push(
      { id: "nav-opps", type: "page", title: "Explore Opportunities", subtitle: "Browse verified campus opportunities", url: "/opportunities", badge: "Student" },
      { id: "nav-dash", type: "page", title: "Student Workspace", subtitle: "Personal opportunity intelligence cockpit", url: "/dashboard/student", badge: "Student" },
      { id: "nav-saved", type: "page", title: "Saved Opportunities", subtitle: "View your bookmarked opportunities", url: "/dashboard/student/saved", badge: "Student" },
      { id: "nav-reg", type: "page", title: "My Registrations", subtitle: "Track applied hackathons & events", url: "/dashboard/student/registrations", badge: "Student" },
      { id: "nav-clubs", type: "page", title: "Verified SRM Clubs", subtitle: "Official SRM campus organization directory", url: "/clubs", badge: "Public" },
      { id: "nav-[cal]", type: "page", title: "Student Calendar", subtitle: "Deadline timeline view", url: "/dashboard/student/calendar", badge: "Student" },
      { id: "nav-prof", type: "page", title: "Student Profile & Vector Settings", subtitle: "Manage skills & preferences", url: "/dashboard/student/profile", badge: "Settings" }
    );
  }

  if (role === "club_rep") {
    items.push(
      { id: "nav-club-dash", type: "page", title: "Club Command Center", subtitle: "Organization publishing workspace", url: "/dashboard/club", badge: "Club Rep" },
      { id: "nav-club-new", type: "action", title: "Create Opportunity", subtitle: "Publish a new event, hackathon, or recruitment drive", url: "/dashboard/club/opportunities/new", badge: "Action" },
      { id: "nav-club-ver", type: "page", title: "Club Verification Status", subtitle: "Review official SRM verification state", url: "/dashboard/club/verification", badge: "Club Rep" },
      { id: "nav-clubs-dir", type: "page", title: "Public Clubs Directory", subtitle: "Browse campus organizations", url: "/clubs", badge: "Public" }
    );
  }

  if (role === "super_admin") {
    items.push(
      { id: "nav-admin-dash", type: "page", title: "Super Admin Command Center", subtitle: "Trust & moderation control room", url: "/dashboard/admin", badge: "Admin" },
      { id: "nav-admin-ver", type: "page", title: "Club Verification Queue", subtitle: "Review pending club verification applications", url: "/dashboard/admin/verifications", badge: "Admin" },
      { id: "nav-clubs-dir", type: "page", title: "Public Clubs Directory", subtitle: "Browse campus organizations", url: "/clubs", badge: "Public" },
      { id: "nav-opps", type: "page", title: "Explore Opportunities", subtitle: "Public opportunity discovery", url: "/opportunities", badge: "Public" }
    );
  }

  // If query is provided, query real DB opportunities & clubs
  if (q.length > 0) {
    // Search Opportunities
    const { data: opps } = await supabase
      .from("opportunities")
      .select("id, title, slug, type, location_type, summary")
      .eq("status", "published")
      .or(`title.ilike.%${q}%,summary.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(6);

    if (opps && opps.length > 0) {
      opps.forEach((opp) => {
        items.push({
          id: `opp-${opp.id}`,
          type: "opportunity",
          title: opp.title,
          subtitle: opp.summary || `${opp.type} · ${opp.location_type}`,
          url: `/opportunities/${opp.slug || opp.id}`,
          badge: opp.type.toUpperCase(),
        });
      });
    }

    // Search Clubs
    const { data: clubs } = await supabase
      .from("clubs")
      .select("id, name, slug, category, verification_status")
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
      .limit(4);

    if (clubs && clubs.length > 0) {
      clubs.forEach((c) => {
        items.push({
          id: `club-${c.id}`,
          type: "club",
          title: c.name,
          subtitle: c.category || "SRM Organization",
          url: `/clubs/${c.slug || c.id}`,
          badge: c.verification_status.toUpperCase(),
        });
      });
    }
  }

  // Filter items by search query if present
  const filtered = q.length === 0
    ? items
    : items.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          (it.subtitle && it.subtitle.toLowerCase().includes(q)) ||
          it.type.toLowerCase().includes(q)
      );

  return {
    items: filtered,
    role,
    userName,
    userEmail,
  };
}
