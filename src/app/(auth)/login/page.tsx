"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction, resetPasswordAction, AuthState } from "@/lib/auth/actions";
import {
  Lock,
  Mail,
  ArrowRight,
  Building2,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  HelpCircle,
  X,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const [loginState, loginFormAction, isLoginPending] = useActionState<AuthState, FormData>(
    loginAction,
    {}
  );

  const [resetState, resetFormAction, isResetPending] = useActionState<AuthState, FormData>(
    resetPasswordAction,
    {}
  );

  const [activeTab, setActiveTab] = useState<"student" | "club">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setClientError(null);
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;

    if (!email) {
      e.preventDefault();
      setClientError("Please enter your email address.");
      return;
    }
    if (!password) {
      e.preventDefault();
      setClientError("Please enter your password.");
      return;
    }
    if (password.length < 6) {
      e.preventDefault();
      setClientError("Password must be at least 6 characters long.");
      return;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>SRM Intelligence V2 Portal</span>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto">
          Sign in to access personalized opportunity feeds and verified SRM organization workspace
        </p>
      </div>

      {/* Account Type Tabs */}
      <div className="grid grid-cols-2 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800/80 backdrop-blur-md">
        <button
          type="button"
          onClick={() => {
            setActiveTab("student");
            setClientError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === "student"
              ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Student</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("club");
            setClientError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === "club"
              ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Club Rep</span>
        </button>
      </div>

      {/* Form Container */}
      <div className="p-6 sm:p-7 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-2xl backdrop-blur-xl space-y-5">
        {(clientError || loginState.error) && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{clientError || loginState.error}</span>
          </div>
        )}

        <form action={loginFormAction} onSubmit={handleFormSubmit} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              {activeTab === "student" ? "Email Address" : "Official SRM Club Email"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                name="email"
                required
                placeholder={
                  activeTab === "student"
                    ? "netid@srmist.edu.in or user@gmail.com"
                    : "clubname@srmist.edu.in"
                }
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
              />
            </div>
          </div>

          {/* Password input with show/hide toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-zinc-300">Password</label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me option */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500/40 focus:ring-offset-zinc-950 cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-xs text-zinc-400 cursor-pointer select-none">
              Keep me signed in on this device
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoginPending}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
          >
            {isLoginPending ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                <span>Sign In to {activeTab === "student" ? "Student Workspace" : "Club Portal"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch to register */}
        <div className="pt-3 text-center border-t border-zinc-800/60 text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-center gap-1.5">
          <span>Don't have an account yet?</span>
          <Link
            href={activeTab === "student" ? "/register" : "/register/club"}
            className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4 cursor-pointer"
          >
            Create {activeTab === "student" ? "Student" : "Club Rep"} Account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 relative shadow-2xl animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-zinc-100">Reset Your Password</h2>
              <p className="text-xs text-zinc-400">
                Enter your registered SRM email or Gmail address to receive a password reset link.
              </p>
            </div>

            {resetState.error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{resetState.error}</span>
              </div>
            )}

            {resetState.message && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{resetState.message}</span>
              </div>
            )}

            <form action={resetFormAction} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-medium">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="netid@srmist.edu.in"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="flex-1 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetPending}
                  className="flex-1 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isResetPending ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
