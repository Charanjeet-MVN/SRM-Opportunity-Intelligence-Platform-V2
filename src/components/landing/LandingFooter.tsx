"use client";

import React from "react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-mono font-bold text-[10px]">
              V2
            </div>
            <span className="font-semibold text-zinc-300">
              SRM Opportunity Intelligence Platform
            </span>
          </div>
          <span className="hidden sm:inline text-zinc-700">•</span>
          <p>© {new Date().getFullYear()} SRM Student Ecosystem. All rights reserved.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/opportunities" className="hover:text-zinc-300 transition-colors">
            Opportunities
          </Link>
          <Link href="/login" className="hover:text-zinc-300 transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="hover:text-zinc-300 transition-colors">
            Create Account
          </Link>
          <span className="text-zinc-700">•</span>
          <span className="font-mono text-[11px] text-zinc-400">PostgreSQL + Supabase Auth</span>
        </div>
      </div>
    </footer>
  );
}
