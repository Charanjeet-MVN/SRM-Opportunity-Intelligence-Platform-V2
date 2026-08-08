import React from "react";
import Link from "next/link";
import { MailCheck, ArrowLeft, RefreshCw } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-center">
      <div className="p-4 w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mx-auto flex items-center justify-center">
        <MailCheck className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          Verify your email address
        </h1>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
          We sent a verification link to your Gmail inbox. Click the link in your email to activate your SRM Opportunity Intelligence account.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 text-xs text-zinc-400">
        <div className="flex items-center justify-center gap-2 text-zinc-300 font-medium">
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          <span>Waiting for email confirmation...</span>
        </div>
        <p className="text-[11px] text-zinc-500">
          Didn't receive the email? Check your spam folder or attempt to sign in to trigger a resend link.
        </p>
      </div>

      <div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 py-2 px-4 rounded-xl bg-zinc-900 border border-zinc-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}
