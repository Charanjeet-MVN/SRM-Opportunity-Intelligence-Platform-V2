"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction, AuthState } from "@/lib/auth/actions";
import { Lock, Mail, ArrowRight, Building2, UserCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    loginAction,
    {}
  );

  const [activeTab, setActiveTab] = useState<"student" | "club">("student");

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
          <span>V2 Platform Access</span>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs text-zinc-400">
          Sign in to your SRM Opportunity Intelligence account
        </p>
      </div>

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-2 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab("student")}
          className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
            activeTab === "student"
              ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Student Login
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("club")}
          className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
            activeTab === "club"
              ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Club Rep Login
        </button>
      </div>

      {/* Form Container */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-2xl backdrop-blur-sm space-y-5">
        {state.error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              {activeTab === "student" ? "Email Address" : "Official SRM Club Email"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                placeholder={
                  activeTab === "student"
                    ? "netid@srmist.edu.in or user@gmail.com"
                    : "clubname@srmist.edu.in"
                }
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-zinc-300">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to {activeTab === "student" ? "Student Workspace" : "Club Portal"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-zinc-800/60 text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>Don't have an account?</span>
          {activeTab === "student" ? (
            <Link
              href="/register"
              className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4"
            >
              Register as Student
            </Link>
          ) : (
            <Link
              href="/register/club"
              className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4"
            >
              Register Official Club
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
