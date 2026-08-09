"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60 shadow-2xl shadow-black/50 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700 opacity-90" />
            <span className="relative text-white font-black text-[10px] tracking-wider">V2</span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold tracking-tight text-zinc-100 leading-none">
              SRM Opportunity Intelligence
            </span>
            <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase mt-0.5">
              Student Platform
            </span>
          </div>
        </Link>

        {/* Centre status pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 font-semibold tracking-wider uppercase text-[10px]">
            Opportunity Intelligence Online
          </span>
        </div>

        {/* Nav actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/opportunities"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-zinc-900/80"
          >
            <Compass className="w-3 h-3 text-indigo-400" />
            Opportunities
          </Link>
          <Link
            href="/login"
            className="text-[11px] font-medium text-zinc-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-900/60 border border-transparent hover:border-zinc-800"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 active:scale-95"
          >
            Get Started
            <ArrowRight className="w-3 h-3 text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </header>
  );
}
