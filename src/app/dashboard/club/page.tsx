import React from "react";
import Link from "next/link";
import { getMyClubProfileAction } from "@/lib/clubs/actions";
import { getClubAnalyticsAction } from "@/lib/clubs/analytics";
import ClubCommandCenterClient from "@/components/dashboard/ClubCommandCenterClient";
import {
  Building2,
  Plus,
  ArrowRight,
} from "lucide-react";

export default async function ClubDashboardPage() {
  const [{ club, role }, { analytics }] = await Promise.all([
    getMyClubProfileAction(),
    getClubAnalyticsAction(),
  ]);

  if (!club) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center mx-auto">
          <Building2 className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-zinc-100">No Club Profile Found</h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Your account is not linked to any active SRM organization. Register a new club profile or contact an administrator.
          </p>
        </div>
        <Link
          href="/register/club"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-xl hover:bg-amber-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Club</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <ClubCommandCenterClient
      club={club}
      role={role}
      analytics={analytics}
    />
  );
}
