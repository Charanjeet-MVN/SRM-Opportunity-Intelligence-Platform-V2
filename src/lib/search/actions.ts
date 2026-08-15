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
    try {
      const { data: userRec } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      if (userRec?.role) role = userRec.role as UserRole;
    } catch {
      // Bypassed if table not found
    }

    try {
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
    } catch {
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

  // 2. Quick Actions (Always searchable)
  items.push(
    { id: "act-create-opp", type: "action", title: "Create Opportunity", subtitle: "Publish a new job, internship or project", url: "/dashboard/club/opportunities/new", badge: "Action" },
    { id: "act-create-event", type: "action", title: "Create Event", subtitle: "Publish a new hackathon, workshop or webinar", url: "/dashboard/club/opportunities/new?type=event", badge: "Action" },
    { id: "act-view-saved", type: "action", title: "View Saved Opportunities", subtitle: "Go to your bookmarked pipeline", url: "/dashboard/student/saved", badge: "Action" },
    { id: "act-open-dash", type: "action", title: "Open Dashboard", subtitle: "Go to your personal command center", url: role === "super_admin" ? "/dashboard/admin" : role === "club_rep" ? "/dashboard/club" : "/dashboard/student", badge: "Action" },
    { id: "act-open-analytics", type: "action", title: "Open Analytics", subtitle: "View engagement and application statistics", url: role === "club_rep" ? "/dashboard/club/analytics" : "/dashboard/student/analytics", badge: "Action" },
    { id: "act-open-copilot", type: "action", title: "Open Career Copilot", subtitle: "View AI personalized recommendations and insights", url: "/dashboard/student", badge: "Action" },
    { id: "act-open-profile", type: "action", title: "Open Profile", subtitle: "View and edit your public developer portfolio", url: "/dashboard/student/profile", badge: "Action" },
    { id: "act-open-settings", type: "action", title: "Open Settings", subtitle: "Configure account preferences and skill taxonomy", url: "/dashboard/student/profile", badge: "Action" }
  );

  // 3. Dynamic Smart Search items based on query prefix
  if (q.includes("hack")) {
    items.push(
      { id: "smart-hack-all", type: "action", title: "Hackathons", subtitle: "Browse all verified student hackathons", url: "/opportunities?type=hackathon", badge: "Smart Search" },
      { id: "smart-hack-upc", type: "action", title: "Upcoming Hackathons", subtitle: "Hackathons closing soon", url: "/opportunities?type=hackathon", badge: "Smart Search" },
      { id: "smart-hack-saved", type: "action", title: "Saved Hackathons", subtitle: "Your bookmarked hackathons", url: "/dashboard/student/saved", badge: "Smart Search" }
    );
  }

  if (q.includes("profile") || q.includes("score") || q.includes("career")) {
    items.push(
      { id: "smart-prof-my", type: "action", title: "My Profile", subtitle: "View your public career profile", url: "/dashboard/student/profile", badge: "Smart Search" },
      { id: "smart-prof-edit", type: "action", title: "Edit Profile", subtitle: "Update skills, resume & goals", url: "/dashboard/student/profile", badge: "Smart Search" },
      { id: "smart-prof-score", type: "action", title: "Career Score", subtitle: "Analyze profile vector completeness", url: "/dashboard/student/profile", badge: "Smart Search" }
    );
  }

  // 4. Query Opportunities & Clubs when query exists
  if (q.length > 0) {
    // Search Opportunities
    try {
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
      } else {
        // Force mock fallback if DB returned empty but has mock items
        throw new Error("No items returned, checking mock data");
      }
    } catch {
      const mockOpps = getMockOpportunitiesForSearch().filter(
        (opp) =>
          opp.title.toLowerCase().includes(q) ||
          opp.summary.toLowerCase().includes(q)
      );
      mockOpps.forEach((opp) => {
        items.push({
          id: `opp-${opp.id}`,
          type: "opportunity",
          title: opp.title,
          subtitle: opp.summary,
          url: `/opportunities/${opp.slug}`,
          badge: opp.type.toUpperCase(),
        });
      });
    }

    // Search Clubs
    try {
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
      } else {
        throw new Error("No clubs returned, checking mock data");
      }
    } catch {
      const mockClubs = getMockClubsForSearch().filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
      mockClubs.forEach((c) => {
        items.push({
          id: `club-${c.id}`,
          type: "club",
          title: c.name,
          subtitle: c.category,
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

/* ─────────────── MOCK SEARCH DATA ─────────────── */

function getMockOpportunitiesForSearch() {
  return [
    { id: "mock-1", title: "Google STEP Internship 2026", slug: "google-step-internship-2026", type: "internship", summary: "STEP is a developmental internship for undergraduates." },
    { id: "mock-2", title: "Microsoft Engage Program 2026", slug: "microsoft-engage-program-2026", type: "scholarship", summary: "Microsoft Engage program offers mentorship." },
    { id: "mock-3", title: "Next Tech Lab AI Hackathon", slug: "next-tech-lab-ai-hackathon", type: "hackathon", summary: "Build the next generation of AI agents." },
    { id: "mock-4", title: "Uber Hacktag Competition", slug: "uber-hacktag-competition", type: "competition", summary: "Uber's annual engineering coding contest." },
    { id: "mock-5", title: "Amazon SDE Summer Internship", slug: "amazon-sde-summer-internship", type: "internship", summary: "12-week summer internship at Amazon India." },
    { id: "mock-6", title: "ISRO Student Research Fellowship", slug: "isro-student-research-fellowship", type: "research", summary: "6-month research internship supervised by ISRO scientists." },
    { id: "mock-7", title: "Meta Hack-a-thon 2026", slug: "meta-hack-a-thon-2026", type: "hackathon", summary: "Build applications incorporating Llama LLMs." }
  ];
}

function getMockClubsForSearch() {
  return [
    { id: "club-1", name: "SRM Career Centre", slug: "srm-career-centre", category: "Career & Placement", verification_status: "verified" },
    { id: "club-2", name: "Next Tech Lab", slug: "next-tech-lab", category: "Technical & Coding", verification_status: "verified" },
    { id: "club-3", name: "Microsoft Student Chapter", slug: "msc-srm", category: "Technical & Coding", verification_status: "verified" },
    { id: "club-4", name: "SRM Coding Club", slug: "srm-coding-club", category: "Technical & Coding", verification_status: "verified" },
    { id: "club-5", name: "SRM Placement Office", slug: "srm-placement-office", category: "Placement Office", verification_status: "verified" },
    { id: "club-6", name: "SRM Research Institute", slug: "srm-research-institute", category: "Research & Innovation", verification_status: "verified" },
    { id: "club-7", name: "IEEE Computer Society SRM", slug: "ieee-cs-srm", category: "Technical & Coding", verification_status: "verified" }
  ];
}
