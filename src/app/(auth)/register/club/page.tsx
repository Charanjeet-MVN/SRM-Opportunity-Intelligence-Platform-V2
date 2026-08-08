"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { signupClubAction, AuthState } from "@/lib/auth/actions";
import { CLUB_CATEGORIES } from "@/lib/constants";
import { Building2, Mail, Lock, ShieldAlert, ArrowRight, AlertCircle, CheckCircle2, Layers } from "lucide-react";

export default function ClubRegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signupClubAction,
    {}
  );

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Verification Required for Official Status</span>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          Register SRM Club / Organization
        </h1>
        <p className="text-xs text-zinc-400">
          Create an unverified club workspace to request official verification
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-2xl backdrop-blur-sm space-y-5">
        {/* Trust Model Notice */}
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 space-y-1">
          <span className="font-semibold text-zinc-200 block">Trust & Identity Principle:</span>
          <span>
            Club accounts start as <strong className="text-amber-400 font-mono">UNVERIFIED</strong>. You will be required to submit faculty authorization and official charter documents before earning the official SRM Club badge.
          </span>
        </div>

        {state.error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        {state.message && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{state.message}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          {/* Club Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">Official Club Name</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                name="clubName"
                required
                placeholder="e.g. NextGen AI Club"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Official SRM Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Official SRM Email (@srmist.edu.in)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="email"
                name="officialEmail"
                required
                placeholder="clubname@srmist.edu.in"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">Club Category</label>
            <div className="relative">
              <Layers className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <select
                name="category"
                defaultValue={CLUB_CATEGORIES[0]}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              >
                {CLUB_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">Club Mission / Brief Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Brief summary of your organization's domain, activities, and purpose..."
              className="w-full p-3 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                required
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <span>Registering Club Workspace...</span>
            ) : (
              <>
                <span>Register Club Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-zinc-800/60 text-xs text-zinc-400">
          Already have a club account?{" "}
          <Link
            href="/login"
            className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
