import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between z-10 max-w-7xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors py-2 px-3 rounded-lg bg-zinc-900/50 border border-zinc-800/60"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Secure Auth Portal</span>
        </div>
      </header>

      {/* Auth Content */}
      <main className="my-auto py-8 z-10">{children}</main>

      {/* Footer */}
      <footer className="text-center text-xs text-zinc-600 font-mono z-10">
        SRM Opportunity Intelligence Platform — V2 Auth System
      </footer>
    </div>
  );
}
