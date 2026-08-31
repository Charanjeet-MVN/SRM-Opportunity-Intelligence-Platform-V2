import {
  LayoutDashboard,
  Compass,
  Clock,
  Bookmark,
  CalendarDays,
  Building2,
  Sparkles,
  Terminal,
  Activity,
  BarChart3,
  Bell,
  User,
  ShieldCheck,
  CheckSquare,
  Plus,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  isCommandPalette?: boolean;
  badge?: string;
  description?: string;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export interface RoleNavConfig {
  sections: NavSection[];
}

// ─── STUDENT NAVIGATION ──────────────────────────────────────────────────────

export const studentNavConfig: RoleNavConfig = {
  sections: [
    {
      id: "primary",
      label: "Primary",
      items: [
        {
          id: "command-center",
          label: "Command Center",
          href: "/dashboard/student",
          icon: LayoutDashboard,
          description: "Your personalized intelligence hub",
        },
        {
          id: "discover",
          label: "Discover",
          href: "/opportunities",
          icon: Compass,
          description: "Find opportunities matched to you",
        },
        {
          id: "deadlines",
          label: "Deadlines",
          href: "/dashboard/student/calendar",
          icon: Clock,
          description: "Deadline radar & urgency tracker",
        },
      ],
    },
    {
      id: "workspace",
      label: "Workspace",
      items: [
        {
          id: "my-opportunities",
          label: "My Opportunities",
          href: "/dashboard/student/saved",
          icon: Bookmark,
          description: "Saved & registered opportunities",
        },
        {
          id: "calendar",
          label: "Calendar",
          href: "/dashboard/student/calendar",
          icon: CalendarDays,
          description: "Event & deadline calendar",
        },
        {
          id: "clubs",
          label: "Clubs",
          href: "/clubs",
          icon: Building2,
          description: "Explore verified SRM organizations",
        },
      ],
    },
    {
      id: "intelligence",
      label: "Intelligence",
      items: [
        {
          id: "opportunity-intelligence",
          label: "Intelligence",
          href: "/dashboard/student/opportunity-intelligence",
          icon: Sparkles,
          description: "AI-powered opportunity analysis",
        },
        {
          id: "command-palette",
          label: "Command Palette",
          icon: Terminal,
          isCommandPalette: true,
          description: "⌘K — Search anything",
        },
      ],
    },
    {
      id: "community",
      label: "Community",
      items: [
        {
          id: "activity",
          label: "My Activity",
          href: "/dashboard/student/feed",
          icon: Activity,
          description: "Your chronological activity timeline",
        },
        {
          id: "achievements",
          label: "Achievements",
          href: "/dashboard/student/analytics",
          icon: BarChart3,
          description: "Stats, badges & impact metrics",
        },
      ],
    },
    {
      id: "account",
      label: "Account",
      items: [
        {
          id: "notifications",
          label: "Notifications",
          href: "/dashboard/student/notifications",
          icon: Bell,
          description: "Alerts & opportunity updates",
        },
        {
          id: "profile",
          label: "Personalization",
          href: "/dashboard/student/profile",
          icon: User,
          description: "Signals, skills & eligibility vector",
        },
      ],
    },
  ],
};

// ─── CLUB REP NAVIGATION ──────────────────────────────────────────────────────

export const clubRepNavConfig: RoleNavConfig = {
  sections: [
    {
      id: "primary",
      label: "Primary",
      items: [
        {
          id: "club-command",
          label: "Club Command",
          href: "/dashboard/club",
          icon: LayoutDashboard,
          description: "Your club's control center",
        },
        {
          id: "discover",
          label: "Discover",
          href: "/opportunities",
          icon: Compass,
          description: "Browse all opportunities",
        },
      ],
    },
    {
      id: "management",
      label: "Management",
      items: [
        {
          id: "publish",
          label: "Publish Opportunity",
          href: "/dashboard/club/opportunities/new",
          icon: Plus,
          description: "Create a new opportunity listing",
        },
        {
          id: "analytics",
          label: "Analytics",
          href: "/dashboard/club/analytics",
          icon: BarChart3,
          description: "Club reach & engagement data",
        },
        {
          id: "verification",
          label: "Verification",
          href: "/dashboard/club/verification",
          icon: CheckSquare,
          description: "Official SRM club verification",
        },
        {
          id: "clubs-directory",
          label: "Organizations",
          href: "/clubs",
          icon: Building2,
          description: "SRM club directory",
        },
      ],
    },
    {
      id: "account",
      label: "Account",
      items: [
        {
          id: "notifications",
          label: "Notifications",
          href: "/dashboard/student/notifications",
          icon: Bell,
          description: "Alerts & updates",
        },
        {
          id: "profile",
          label: "Profile",
          href: "/dashboard/student/profile",
          icon: User,
          description: "Account & settings",
        },
      ],
    },
  ],
};

// ─── SUPER ADMIN NAVIGATION ───────────────────────────────────────────────────

export const adminNavConfig: RoleNavConfig = {
  sections: [
    {
      id: "primary",
      label: "Primary",
      items: [
        {
          id: "admin-command",
          label: "Trust Control",
          href: "/dashboard/admin",
          icon: ShieldCheck,
          description: "Platform oversight dashboard",
        },
        {
          id: "verifications",
          label: "Verifications",
          href: "/dashboard/admin/verifications",
          icon: CheckSquare,
          description: "Club verification queue",
        },
      ],
    },
    {
      id: "platform",
      label: "Platform",
      items: [
        {
          id: "discover",
          label: "Discover",
          href: "/opportunities",
          icon: Compass,
          description: "All opportunity listings",
        },
        {
          id: "clubs",
          label: "Organizations",
          href: "/clubs",
          icon: Building2,
          description: "All registered SRM clubs",
        },
        {
          id: "command-palette",
          label: "Command Palette",
          icon: Terminal,
          isCommandPalette: true,
          description: "⌘K — Platform search",
        },
      ],
    },
    {
      id: "account",
      label: "Account",
      items: [
        {
          id: "notifications",
          label: "Notifications",
          href: "/dashboard/student/notifications",
          icon: Bell,
          description: "System alerts",
        },
        {
          id: "profile",
          label: "Profile",
          href: "/dashboard/student/profile",
          icon: User,
          description: "Account settings",
        },
      ],
    },
  ],
};

export function getNavConfig(role: string): RoleNavConfig {
  switch (role) {
    case "club_rep":
      return clubRepNavConfig;
    case "super_admin":
      return adminNavConfig;
    default:
      return studentNavConfig;
  }
}
