"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80 shadow-2xl shadow-black/60 py-3"
          : "bg-gradient-to-b from-zinc-950/90 via-zinc-950/40 to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden border border-indigo-500/40 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-700 opacity-90 group-hover:opacity-100 transition-opacity" />
            <span className="relative text-white font-black text-xs tracking-wider">V2</span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full border border-zinc-950 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-zinc-100 group-hover:text-indigo-200 transition-colors">
                SRM Opportunity Intelligence
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                V2
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">
              Student Platform Ecosystem
            </span>
          </div>
        </Link>

        {/* Center status pill */}
        <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800/90 text-[11px] font-mono text-zinc-400 shadow-xl backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 font-semibold tracking-wider uppercase text-[10px]">
            Intelligence Feed Live
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-400 text-[10px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-indigo-400" /> Verified Club Data
          </span>
        </div>

        {/* Nav actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/opportunities"
            className={`flex items-center gap-1.5 text-xs font-medium transition-all px-3 py-1.5 rounded-lg border ${
              pathname === "/opportunities"
                ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-200"
                : "bg-zinc-900/50 border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-800/80 hover:border-zinc-700"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Opportunities</span>
            <span className="sm:hidden">Explore</span>
          </Link>
          <Link
            href="/login"
            className="text-xs font-medium text-zinc-300 hover:text-white transition-all px-3 py-1.5 rounded-lg hover:bg-zinc-900/80 border border-transparent hover:border-zinc-800"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="group relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Sparkles className="w-3 h-3 text-indigo-200" />
            <span>Get Started</span>
            <ArrowRight className="w-3 h-3 text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

