"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AdminClubRecord,
  AdminOpportunityRecord,
  AdminUserRecord,
  updateClubVerificationAdminAction,
  updateOpportunityStatusAdminAction,
  updateUserRoleAdminAction,
} from "@/lib/admin/actions";
import { reviewVerificationAction } from "@/lib/clubs/actions";
import { ClubVerificationRequest, ClubVerificationStatus, OpportunityStatus, UserRole } from "@/types";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import {
  ShieldCheck,
  Users,
  Building2,
  FileCheck,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  Loader2,
} from "lucide-react";

type ExtendedVerificationRequest = ClubVerificationRequest & {
  clubName: string;
  officialEmail: string;
};

interface AdminControlCenterClientProps {
  metrics: {
    totalUsers: number;
    studentCount: number;
    clubRepCount: number;
    superAdminCount: number;
    totalClubs: number;
    verifiedClubs: number;
    pendingClubs: number;
    unverifiedClubs: number;
    rejectedClubs: number;
    totalOpportunities: number;
    publishedOpps: number;
    draftOpps: number;
    archivedOpps: number;
    pendingVerifications: number;
  } | null;
  verificationRequests: ExtendedVerificationRequest[];
  clubs: AdminClubRecord[];
  opportunities: AdminOpportunityRecord[];
  users: AdminUserRecord[];
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function AdminControlCenterClient({
  metrics,
  verificationRequests: initialRequests,
  clubs: initialClubs,
  opportunities: initialOpps,
  users: initialUsers,
}: AdminControlCenterClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "verifications" | "clubs" | "opportunities" | "users" | "reports">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const [requestsList, setRequestsList] = useState(initialRequests);
  const [clubsList, setClubsList] = useState(initialClubs);
  const [oppsList, setOppsList] = useState(initialOpps);
  const [usersList, setUsersList] = useState(initialUsers);

  // Status feedback toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  function triggerToast(text: string, type: "success" | "error" = "success") {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  }

  // Search filtering
  const queryLower = searchQuery.toLowerCase().trim();

  const filteredVerifications = useMemo(() => {
    if (!queryLower) return requestsList;
    return requestsList.filter(
      (r) =>
        r.clubName.toLowerCase().includes(queryLower) ||
        r.officialEmail.toLowerCase().includes(queryLower)
    );
  }, [requestsList, queryLower]);

  const filteredClubs = useMemo(() => {
    if (!queryLower) return clubsList;
    return clubsList.filter(
      (c) =>
        c.name.toLowerCase().includes(queryLower) ||
        (c.officialEmail && c.officialEmail.toLowerCase().includes(queryLower)) ||
        (c.category && c.category.toLowerCase().includes(queryLower))
    );
  }, [clubsList, queryLower]);

  const filteredOpps = useMemo(() => {
    if (!queryLower) return oppsList;
    return oppsList.filter(
      (o) =>
        o.title.toLowerCase().includes(queryLower) ||
        o.clubName.toLowerCase().includes(queryLower) ||
        o.type.toLowerCase().includes(queryLower)
    );
  }, [oppsList, queryLower]);

  const filteredUsers = useMemo(() => {
    if (!queryLower) return usersList;
    return usersList.filter(
      (u) =>
        u.email.toLowerCase().includes(queryLower) ||
        (u.studentName && u.studentName.toLowerCase().includes(queryLower)) ||
        (u.department && u.department.toLowerCase().includes(queryLower)) ||
        (u.clubName && u.clubName.toLowerCase().includes(queryLower))
    );
  }, [usersList, queryLower]);

  // Handlers for moderation actions
  async function handleVerifyClub(clubId: string, newStatus: ClubVerificationStatus) {
    const res = await updateClubVerificationAdminAction(clubId, newStatus);
    if (res.error) {
      triggerToast(res.error, "error");
    } else {
      setClubsList((prev) =>
        prev.map((c) => (c.id === clubId ? { ...c, verificationStatus: newStatus } : c))
      );
      triggerToast(`Club status updated to ${newStatus.replace("_", " ")}`);
    }
  }

  async function handleOppStatus(oppId: string, newStatus: OpportunityStatus) {
    const res = await updateOpportunityStatusAdminAction(oppId, newStatus);
    if (res.error) {
      triggerToast(res.error, "error");
    } else {
      setOppsList((prev) =>
        prev.map((o) => (o.id === oppId ? { ...o, status: newStatus } : o))
      );
      triggerToast(`Opportunity status changed to ${newStatus}`);
    }
  }

  async function handleUserRole(userId: string, newRole: UserRole) {
    const res = await updateUserRoleAdminAction(userId, newRole);
    if (res.error) {
      triggerToast(res.error, "error");
    } else {
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      triggerToast(`User role updated to ${newRole}`);
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === "success"
                ? "bg-zinc-900/90 text-emerald-400 border-emerald-500/30"
                : "bg-zinc-900/90 text-red-400 border-red-500/30"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/70 p-6 sm:p-8">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin Trust & Moderation Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
              Platform Governance Hub
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-xl">
              Supervise institutional verification requests, audit club credentials, and ensure opportunity quality across SRM Institute of Science and Technology.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {metrics?.pendingVerifications ? (
              <button
                onClick={() => setActiveTab("verifications")}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold text-xs flex items-center gap-1.5 transition-all hover:bg-amber-500/25 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>{metrics.pendingVerifications} Pending Approvals</span>
              </button>
            ) : (
              <span className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold text-xs flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ecosystem Secure</span>
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── COMMAND SEARCH BAR ── */}
      <motion.div variants={fadeUp} className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Command Search — filter users, clubs, opportunities, or verification requests..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-3 text-zinc-500 hover:text-zinc-300 text-xs font-mono"
          >
            Clear
          </button>
        )}
      </motion.div>

      {/* ── TAB NAVIGATION ── */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-x-auto scrollbar-none">
          {[
            { id: "overview" as const, label: "Overview & Trust", icon: ShieldCheck, count: null },
            { id: "verifications" as const, label: "Verification Queue", icon: FileCheck, count: requestsList.filter((r) => r.status === "pending_review").length },
            { id: "clubs" as const, label: "Organizations", icon: Building2, count: filteredClubs.length },
            { id: "opportunities" as const, label: "Opportunities", icon: Layers, count: filteredOpps.length },
            { id: "users" as const, label: "User Audit", icon: Users, count: filteredUsers.length },
            { id: "reports" as const, label: "Content Flags", icon: ShieldAlert, count: 0 },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.96 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${isActive ? "bg-white/20" : "bg-zinc-800 text-zinc-500"}`}>
                    {tab.count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── TAB PANELS ── */}
      <AnimatePresence mode="wait">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Registered Users", value: metrics?.totalUsers ?? 0, sub: `${metrics?.studentCount ?? 0} Students • ${metrics?.clubRepCount ?? 0} Club Reps`, icon: Users, accent: "text-purple-400", bg: "bg-purple-500/8 border-purple-500/20" },
                { label: "Active Organizations", value: metrics?.totalClubs ?? 0, sub: `${metrics?.verifiedClubs ?? 0} Verified • ${metrics?.pendingClubs ?? 0} Pending`, icon: Building2, accent: "text-blue-400", bg: "bg-blue-500/8 border-blue-500/20" },
                { label: "Published Listings", value: metrics?.publishedOpps ?? 0, sub: `${metrics?.totalOpportunities ?? 0} Total • ${metrics?.draftOpps ?? 0} Drafts`, icon: Layers, accent: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/20" },
                { label: "Verification Requests", value: metrics?.pendingVerifications ?? 0, sub: `${metrics?.rejectedClubs ?? 0} Rejected / Declined`, icon: FileCheck, accent: (metrics?.pendingVerifications ?? 0) > 0 ? "text-amber-400" : "text-zinc-400", bg: (metrics?.pendingVerifications ?? 0) > 0 ? "bg-amber-500/8 border-amber-500/20" : "bg-zinc-900 border-zinc-800" },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className={`p-5 rounded-2xl ${card.bg} border space-y-2 relative overflow-hidden`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300">{card.label}</span>
                      <Icon className={`w-4 h-4 ${card.accent}`} />
                    </div>
                    <div className={`text-2xl font-black font-mono ${card.accent}`}>{card.value}</div>
                    <p className="text-[11px] text-zinc-500 font-mono leading-snug">{card.sub}</p>
                  </div>
                );
              })}
            </div>

            {/* Trust Status Distribution Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Organization Trust Matrix */}
              <div className="p-6 rounded-3xl bg-zinc-950/60 border border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Organization Verification Breakdown
                  </h2>
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Official SRM Verified", count: metrics?.verifiedClubs ?? 0, color: "bg-blue-500", text: "text-blue-400" },
                    { label: "Pending Faculty Review", count: metrics?.pendingClubs ?? 0, color: "bg-purple-500", text: "text-purple-400" },
                    { label: "Unverified Clubs", count: metrics?.unverifiedClubs ?? 0, color: "bg-amber-500", text: "text-amber-400" },
                    { label: "Declined / Rejected", count: metrics?.rejectedClubs ?? 0, color: "bg-red-500", text: "text-red-400" },
                  ].map((row) => (
                    <div key={row.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-300">{row.label}</span>
                        <span className={`font-bold ${row.text}`}>{row.count} clubs</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                        <div
                          className={`h-full ${row.color} rounded-full`}
                          style={{
                            width: `${Math.min(100, (row.count / Math.max(metrics?.totalClubs || 1, 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opportunity Publication State */}
              <div className="p-6 rounded-3xl bg-zinc-950/60 border border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Opportunity Ecosystem State
                  </h2>
                  <Layers className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Published Live Feed", count: metrics?.publishedOpps ?? 0, color: "bg-emerald-500", text: "text-emerald-400" },
                    { label: "Drafts (Unpublished)", count: metrics?.draftOpps ?? 0, color: "bg-amber-500", text: "text-amber-400" },
                    { label: "Archived / Closed", count: metrics?.archivedOpps ?? 0, color: "bg-zinc-600", text: "text-zinc-400" },
                  ].map((row) => (
                    <div key={row.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-300">{row.label}</span>
                        <span className={`font-bold ${row.text}`}>{row.count} listings</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                        <div
                          className={`h-full ${row.color} rounded-full`}
                          style={{
                            width: `${Math.min(100, (row.count / Math.max(metrics?.totalOpportunities || 1, 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VERIFICATION QUEUE TAB */}
        {activeTab === "verifications" && (
          <motion.div
            key="verifications"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {filteredVerifications.length === 0 ? (
              <AdminEmptyState
                title="No pending verifications."
                description="All submitted club verification requests have been processed."
              />
            ) : (
              <div className="space-y-4">
                {filteredVerifications.map((req) => (
                  <VerificationRequestCard
                    key={req.id}
                    req={req}
                    onResolved={() => {
                      setRequestsList((prev) => prev.filter((r) => r.id !== req.id));
                      triggerToast("Verification audit recorded");
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* CLUBS TAB */}
        {activeTab === "clubs" && (
          <motion.div
            key="clubs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {filteredClubs.length === 0 ? (
              <AdminEmptyState
                title="No organizations found."
                description={queryLower ? `No clubs matching "${searchQuery}"` : "No clubs currently registered."}
              />
            ) : (
              <div className="space-y-3">
                {filteredClubs.map((club, idx) => (
                  <ClubModerationRow key={club.id} club={club} index={idx} onUpdate={handleVerifyClub} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* OPPORTUNITIES TAB */}
        {activeTab === "opportunities" && (
          <motion.div
            key="opportunities"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {filteredOpps.length === 0 ? (
              <AdminEmptyState
                title="No opportunities found."
                description={queryLower ? `No listings matching "${searchQuery}"` : "No opportunities published yet."}
              />
            ) : (
              <div className="space-y-3">
                {filteredOpps.map((opp, idx) => (
                  <OpportunityModerationRow key={opp.id} opp={opp} index={idx} onUpdateStatus={handleOppStatus} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {filteredUsers.length === 0 ? (
              <AdminEmptyState
                title="No users found."
                description={queryLower ? `No accounts matching "${searchQuery}"` : "No registered users."}
              />
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user, idx) => (
                  <UserModerationRow key={user.id} user={user} index={idx} onUpdateRole={handleUserRole} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-12 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-zinc-200">No Content Flags Logged</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Platform automated safety filters are active. No policy violations or reported opportunities require manual intervention.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── SUBCOMPONENTS ──

function VerificationRequestCard({
  req,
  onResolved,
}: {
  req: ExtendedVerificationRequest;
  onResolved: () => void;
}) {
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDecision(decision: "verified" | "rejected") {
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("requestId", req.id);
    fd.append("clubId", req.clubId);
    fd.append("decision", decision);
    fd.append("reviewerNotes", reviewerNotes);

    const res = await reviewVerificationAction(null, fd);
    setIsSubmitting(false);
    if (!res.error) {
      onResolved();
    }
  }

  return (
    <div className="p-6 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-zinc-100">{req.clubName}</h3>
          <p className="text-xs font-mono text-zinc-400">{req.officialEmail}</p>
        </div>
        <VerificationBadge status={req.status} />
      </div>

      {req.documentsUrl && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 font-mono">Verification Credentials:</span>
          <a
            href={req.documentsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1 underline"
          >
            <span>View Endorsement Document</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      <div className="pt-3 border-t border-zinc-800/60 space-y-3">
        <input
          type="text"
          value={reviewerNotes}
          onChange={(e) => setReviewerNotes(e.target.value)}
          placeholder="Optional reviewer notes / endorsement remarks..."
          className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleDecision("verified")}
            disabled={isSubmitting}
            className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>Approve & Issue Trust Badge</span>
          </button>

          <button
            onClick={() => handleDecision("rejected")}
            disabled={isSubmitting}
            className="py-2 px-4 rounded-xl bg-zinc-900 hover:bg-red-600 text-zinc-300 hover:text-white font-medium text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Decline Request</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ClubModerationRow({
  club,
  index,
  onUpdate,
}: {
  club: AdminClubRecord;
  index: number;
  onUpdate: (clubId: string, status: ClubVerificationStatus) => void;
}) {
  const [showConfirm, setShowConfirm] = useState<ClubVerificationStatus | null>(null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-all"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-indigo-400 shrink-0 text-sm overflow-hidden">
          {club.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover" />
          ) : (
            club.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-zinc-200 truncate">{club.name}</h3>
            <VerificationBadge status={club.verificationStatus} showIcon={false} />
          </div>
          <p className="text-[11px] font-mono text-zinc-500 truncate">
            {club.officialEmail || "No email listed"} • {club.opportunityCount} opportunities
          </p>
        </div>
      </div>

      {/* Moderation actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {showConfirm ? (
          <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 text-xs">
            <span className="text-[10px] text-zinc-400 font-mono">Set to {showConfirm}?</span>
            <button
              onClick={() => {
                onUpdate(club.id, showConfirm);
                setShowConfirm(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] transition-colors cursor-pointer"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirm(null)}
              className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-[10px]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {club.verificationStatus !== "verified" && (
              <button
                onClick={() => setShowConfirm("verified")}
                className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer"
              >
                Verify
              </button>
            )}
            {club.verificationStatus !== "rejected" && (
              <button
                onClick={() => setShowConfirm("rejected")}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-zinc-800 text-xs font-medium transition-all cursor-pointer"
              >
                Reject / Suspend
              </button>
            )}
            {club.verificationStatus !== "unverified" && (
              <button
                onClick={() => setShowConfirm("unverified")}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-500 text-xs font-medium transition-all cursor-pointer"
              >
                Unverify
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function OpportunityModerationRow({
  opp,
  index,
  onUpdateStatus,
}: {
  opp: AdminOpportunityRecord;
  index: number;
  onUpdateStatus: (oppId: string, status: OpportunityStatus) => void;
}) {
  const [showConfirm, setShowConfirm] = useState<OpportunityStatus | null>(null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-all"
    >
      <div className="space-y-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/opportunities/${opp.slug}`} className="text-xs font-bold text-zinc-200 hover:text-purple-300 transition-colors truncate">
            {opp.title}
          </Link>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border capitalize ${
            opp.status === "published" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" : "text-amber-400 bg-amber-500/10 border-amber-500/25"
          }`}>
            {opp.status}
          </span>
        </div>
        <p className="text-[11px] font-mono text-zinc-500">
          by {opp.clubName} • {opp.type.replace("_", " ")} • Created {new Date(opp.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {showConfirm ? (
          <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 text-xs">
            <span className="text-[10px] text-zinc-400 font-mono">Set to {showConfirm}?</span>
            <button
              onClick={() => {
                onUpdateStatus(opp.id, showConfirm);
                setShowConfirm(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] transition-colors cursor-pointer"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirm(null)}
              className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-[10px]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {opp.status !== "published" && (
              <button
                onClick={() => setShowConfirm("published")}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
              >
                Approve
              </button>
            )}
            {opp.status !== "archived" && (
              <button
                onClick={() => setShowConfirm("archived")}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-amber-500/10 text-zinc-400 hover:text-amber-400 border border-zinc-800 text-xs font-medium transition-all cursor-pointer"
              >
                Archive
              </button>
            )}
            {opp.status !== "rejected" && (
              <button
                onClick={() => setShowConfirm("rejected")}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-zinc-800 text-xs font-medium transition-all cursor-pointer"
              >
                Reject
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function UserModerationRow({
  user,
  index,
  onUpdateRole,
}: {
  user: AdminUserRecord;
  index: number;
  onUpdateRole: (userId: string, role: UserRole) => void;
}) {
  const [showConfirmRole, setShowConfirmRole] = useState<UserRole | null>(null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-all"
    >
      <div className="space-y-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-zinc-200">{user.email}</span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize border ${
            user.role === "super_admin"
              ? "text-purple-400 bg-purple-500/10 border-purple-500/30 font-bold"
              : user.role === "club_rep"
              ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
              : "text-zinc-400 bg-zinc-800 border-zinc-700"
          }`}>
            {user.role}
          </span>
        </div>
        <p className="text-[11px] font-mono text-zinc-500">
          {user.studentName ? `${user.studentName} (${user.department || "No Dept"})` : user.clubName ? `Club: ${user.clubName}` : "Account User"}
          <span> • Registered {new Date(user.createdAt).toLocaleDateString()}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {showConfirmRole ? (
          <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 text-xs">
            <span className="text-[10px] text-zinc-400 font-mono">Set role to {showConfirmRole}?</span>
            <button
              onClick={() => {
                onUpdateRole(user.id, showConfirmRole);
                setShowConfirmRole(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] transition-colors cursor-pointer"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirmRole(null)}
              className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-[10px]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {user.role !== "student" && (
              <button
                onClick={() => setShowConfirmRole("student")}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 text-xs font-medium border border-zinc-800 transition-all cursor-pointer"
              >
                Set Student
              </button>
            )}
            {user.role !== "club_rep" && (
              <button
                onClick={() => setShowConfirmRole("club_rep")}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
              >
                Set Club Rep
              </button>
            )}
            {user.role !== "super_admin" && (
              <button
                onClick={() => setShowConfirmRole("super_admin")}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-semibold transition-all cursor-pointer"
              >
                Promote Admin
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AdminEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="py-14 px-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-3 max-w-md mx-auto">
      <ShieldCheck className="w-8 h-8 text-zinc-600 mx-auto" />
      <h3 className="text-sm font-semibold text-zinc-300">{title}</h3>
      <p className="text-xs text-zinc-500 leading-relaxed font-mono">{description}</p>
    </div>
  );
}
