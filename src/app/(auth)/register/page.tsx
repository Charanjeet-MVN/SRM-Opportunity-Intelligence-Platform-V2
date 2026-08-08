"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import { signupStudentAction, AuthState } from "@/lib/auth/actions";
import { isSrmEmail } from "@/lib/auth/utils";
import { DEPARTMENTS } from "@/lib/constants";
import { Mail, Lock, User, IdCard, GraduationCap, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function StudentRegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signupStudentAction,
    {}
  );

  const [emailInput, setEmailInput] = useState("");
  const isSrm = isSrmEmail(emailInput);
  const isGmail = emailInput.trim().toLowerCase().endsWith("@gmail.com");

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          Create Student Account
        </h1>
        <p className="text-xs text-zinc-400">
          Personalized opportunity intelligence tailored to your academic profile
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-2xl backdrop-blur-sm space-y-5">
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
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                name="fullName"
                required
                placeholder="e.g. Aditi Sharma"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Email with Domain Badge */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300 block">Email Address</label>
              {isSrm && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Official SRM Email Detected
                </span>
              )}
              {isGmail && (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Gmail Verification Required
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="netid@srmist.edu.in or user@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Registration Number & Department Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Register Number</label>
              <div className="relative">
                <IdCard className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  name="registerNumber"
                  placeholder="e.g. RA2111003010123"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Year of Study</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <select
                  name="yearOfStudy"
                  defaultValue="3"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year / PG</option>
                </select>
              </div>
            </div>
          </div>

          {/* Department Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">Academic Department</label>
            <select
              name="department"
              defaultValue={DEPARTMENTS[0]}
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
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
              <span>Creating Student Account...</span>
            ) : (
              <>
                <span>Complete Student Registration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-zinc-800/60 text-xs text-zinc-400">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
