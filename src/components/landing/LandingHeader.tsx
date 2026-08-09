"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 shadow-2xl shadow-black/40 py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs group-hover:border-indigo-500/60 group-hover:bg-indigo-600/25 transition-all shadow-sm">
            V2
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-zinc-100 group-hover:text-white transition-colors flex items-center gap-2">
              SRM Opportunity Intelligence
            </span>
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
              Student Platform
            </span>
          </div>
        </Link>

        {/* Center Indicator (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-900/80 border border-zinc-800 text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-300">Built for the SRM student ecosystem</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/opportunities"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-900"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Opportunities</span>
          </Link>
          
          <Link
            href="/login"
            className="text-xs font-medium text-zinc-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-900/80 border border-transparent hover:border-zinc-800"
          >
            Sign In
          </Link>
          
          <Link
            href="/register"
            className="group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/35 active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </header>
  );
}
