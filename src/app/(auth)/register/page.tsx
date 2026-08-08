"use client";

import React, { useActionState, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signupStudentAction, signupClubAction, AuthState } from "@/lib/auth/actions";
import { isSrmEmail } from "@/lib/auth/utils";
import { DEPARTMENTS } from "@/lib/constants";
import {
  Mail,
  Lock,
  User,
  IdCard,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building2,
  UserCheck,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
} from "lucide-react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "club" ? "club" : "student";
  const [accountType, setAccountType] = useState<"student" | "club">(initialType);

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "club") setAccountType("club");
    else if (typeParam === "student") setAccountType("student");
  }, [searchParams]);

  // Student Form State
  const [studentState, studentFormAction, isStudentPending] = useActionState<AuthState, FormData>(
    signupStudentAction,
    {}
  );

  // Club Form State
  const [clubState, clubFormAction, isClubPending] = useActionState<AuthState, FormData>(
    signupClubAction,
    {}
  );

  // Shared UI Controls
  const [studentEmail, setStudentEmail] = useState("");
  const [clubEmail, setClubEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const isStudentSrm = isSrmEmail(studentEmail);
  const isStudentGmail = studentEmail.trim().toLowerCase().endsWith("@gmail.com");
  const isClubSrm = isSrmEmail(clubEmail);

  const handleStudentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setClientError(null);
    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get("fullName") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!fullName || !email || !password || !confirmPassword) {
      e.preventDefault();
      setClientError("All required fields must be filled out.");
      return;
    }

    if (password.length < 6) {
      e.preventDefault();
      setClientError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      e.preventDefault();
      setClientError("Passwords do not match. Please verify your password entry.");
      return;
    }

    if (!isSrmEmail(email) && !email.toLowerCase().endsWith("@gmail.com")) {
      e.preventDefault();
      setClientError("Registration requires an official SRM email (@srmist.edu.in) or personal Gmail (@gmail.com).");
      return;
    }
  };

  const handleClubSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setClientError(null);
    const formData = new FormData(e.currentTarget);
    const clubName = (formData.get("clubName") as string)?.trim();
    const officialEmail = (formData.get("officialEmail") as string)?.trim();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!clubName || !officialEmail || !password || !confirmPassword) {
      e.preventDefault();
      setClientError("All required fields must be filled out.");
      return;
    }

    if (!isSrmEmail(officialEmail)) {
      e.preventDefault();
      setClientError("Club registration requires an official SRM email address (@srmist.edu.in).");
      return;
    }

    if (password.length < 6) {
      e.preventDefault();
      setClientError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      e.preventDefault();
      setClientError("Passwords do not match. Please verify your password entry.");
      return;
    }
  };

  const activeError = clientError || (accountType === "student" ? studentState.error : clubState.error);
  const activeMessage = accountType === "student" ? studentState.message : clubState.message;

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>SRM Intelligence Account Creation</span>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          Join SRM Opportunity Intelligence
        </h1>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto">
          Choose your account type to create your verified platform profile
        </p>
      </div>

      {/* Account Type Toggle */}
      <div className="grid grid-cols-2 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800/80 backdrop-blur-md">
        <button
          type="button"
          onClick={() => {
            setAccountType("student");
            setClientError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            accountType === "student"
              ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <UserCheck className="w-4 h-4 text-indigo-400" />
          <div className="text-left">
            <div className="font-semibold leading-none">Student</div>
            <div className="text-[10px] text-zinc-400 font-normal">Personal Discovery</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setAccountType("club");
            setClientError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            accountType === "club"
              ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-400" />
          <div className="text-left">
            <div className="font-semibold leading-none">Club Rep</div>
            <div className="text-[10px] text-zinc-400 font-normal">Publish & Recruit</div>
          </div>
        </button>
      </div>

      {/* Form Container */}
      <div className="p-6 sm:p-7 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-2xl backdrop-blur-xl space-y-5">
        {activeError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{activeError}</span>
          </div>
        )}

        {activeMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-400 animate-in fade-in slide-in-from-top-1 duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{activeMessage}</span>
          </div>
        )}

        {/* Student Signup Form */}
        {accountType === "student" && (
          <form action={studentFormAction} onSubmit={handleStudentSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Aditi Sharma"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-sans"
                />
              </div>
            </div>

            {/* Email with Domain Badge */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300 block">Email Address *</label>
                {isStudentSrm && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Official SRM Email
                  </span>
                )}
                {isStudentGmail && (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Gmail Account
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="netid@srmist.edu.in or user@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-sans"
                />
              </div>
            </div>

            {/* Register Number & Year Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">Register Number</label>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="registerNumber"
                    placeholder="e.g. RA2111003010123"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">Year of Study</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                  <select
                    name="yearOfStudy"
                    defaultValue="3"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer font-sans"
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

            {/* Academic Department */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Academic Department</label>
              <select
                name="department"
                defaultValue={DEPARTMENTS[0]}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer font-sans"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Min 6 chars"
                    className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isStudentPending}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {isStudentPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Creating Student Account...
                </span>
              ) : (
                <>
                  <span>Complete Student Registration</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Club Representative Signup Form */}
        {accountType === "club" && (
          <form action={clubFormAction} onSubmit={handleClubSubmit} className="space-y-4">
            {/* Club Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Official Club Name *</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-amber-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  name="clubName"
                  required
                  placeholder="e.g. SRM Robotics Society"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-sans"
                />
              </div>
            </div>

            {/* Official Club Email */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300 block">Official SRM Email *</label>
                {isClubSrm ? (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Official SRM Domain Verified
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    @srmist.edu.in required
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  name="officialEmail"
                  required
                  value={clubEmail}
                  onChange={(e) => setClubEmail(e.target.value)}
                  placeholder="clubname@srmist.edu.in"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-sans"
                />
              </div>
            </div>

            {/* Category & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">Category</label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                  <select
                    name="category"
                    defaultValue="Technical"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all cursor-pointer font-sans"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Research & Innovation">Research & Innovation</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                    <option value="Social & Environment">Social & Environment</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">Short Mission</label>
                <input
                  type="text"
                  name="description"
                  placeholder="e.g. Autonomous robotics research"
                  className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Min 6 chars"
                    className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isClubPending}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {isClubPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Creating Club Account...
                </span>
              ) : (
                <>
                  <span>Register Club Organization</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Link to Login */}
        <div className="pt-3 text-center border-t border-zinc-800/60 text-xs text-zinc-400">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4 cursor-pointer"
          >
            Sign In to Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-lg mx-auto py-12 text-center text-xs text-zinc-500 font-mono">
          Loading registration portal...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
