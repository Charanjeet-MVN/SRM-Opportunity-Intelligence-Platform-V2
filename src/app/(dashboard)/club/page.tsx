import React from "react";
import Link from "next/link";
import { getMyClubProfileAction } from "@/lib/clubs/actions";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import { Building2, Plus, ShieldCheck, FileCheck, Layers, Mail, ArrowRight, AlertTriangle, BarChart3 } from "lucide-react";

export default async function ClubDashboardPage() {
  const { club, role, error } = await getMyClubProfileAction();

  if (error || !club) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <Building2 className="w-12 h-12 text-zinc-600 mx-auto" />
        <h1 className="text-xl font-semibold text-zinc-100">No Club Profile Found</h1>
        <p className="text-xs text-zinc-400">
          Your account is not linked to any active club organization. Please register a club profile or contact an admin.
        </p>
        <Link
          href="/register/club"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl"
        >
          Register New Club
        </Link>
      </div>
    );
  }

  const isVerified = club.verificationStatus === "verified";

  return (
    <div className="space-y-8">
      {/* Top Club Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-amber-950/20 border border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-400 font-bold text-xl shrink-0">
            {club.logoUrl ? (
              <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              club.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
                {club.name}
              </h1>
              <VerificationBadge status={club.verificationStatus} />
            </div>
            <p className="text-xs text-zinc-400 max-w-xl line-clamp-2">
              {club.description || "No description added yet. Update your organization details."}
            </p>
            <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-mono pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-zinc-400" />
                {club.officialEmail || "Official Email N/A"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-zinc-400" />
                {club.category || "General Club"}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Call-to-action */}
        {!isVerified && (
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-amber-500/30 space-y-2 shrink-0 w-full md:w-64">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Action Required
            </div>
            <p className="text-[11px] text-zinc-400 leading-tight">
              Unverified clubs cannot publish official opportunities with the SRM trust badge.
            </p>
            <Link
              href="/dashboard/club/verification"
              className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Complete Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Action Shortcut Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href={isVerified ? "/dashboard/club/opportunities/new" : "#"}
          className={`p-5 rounded-xl border transition-all space-y-2 ${
            isVerified
              ? "bg-zinc-900/60 border-zinc-800/80 hover:border-indigo-500/40 cursor-pointer"
              : "bg-zinc-950/40 border-zinc-900 opacity-60 cursor-not-allowed"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-semibold text-zinc-200">Post Opportunity</h2>
          <p className="text-[11px] text-zinc-400">
            {isVerified
              ? "Publish hackathons, recruitments, or workshops."
              : "Requires verified SRM club status."}
          </p>
        </Link>

        <Link
          href="/dashboard/club/verification"
          className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-indigo-500/40 transition-all space-y-2"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <FileCheck className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-semibold text-zinc-200">Verification Status</h2>
          <p className="text-[11px] text-zinc-400">
            Submit faculty approval and view review audit state.
          </p>
        </Link>

        <Link
          href="/dashboard/club/analytics"
          className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-purple-500/40 transition-all space-y-2"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-semibold text-zinc-200">Campaign Analytics</h2>
          <p className="text-[11px] text-zinc-400">
            View student reach, saves, and conversion metrics.
          </p>
        </Link>
      </div>
    </div>
  );
}
