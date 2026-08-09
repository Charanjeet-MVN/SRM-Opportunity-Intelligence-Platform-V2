import React from "react";
import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { ProductValueSection } from "@/components/landing/ProductValueSection";
import { ProductFlowSection } from "@/components/landing/ProductFlowSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden flex flex-col justify-between font-sans">
      {/* Sticky Top Header */}
      <LandingHeader />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Subtle Radial Glow in Hero */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto space-y-6 relative z-10">
            {/* Status / Trust Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-zinc-900/90 border border-zinc-800 text-zinc-300 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-zinc-200">Built for the SRM student ecosystem</span>
            </div>

            {/* 5-second Value Communication Tagline */}
            <div className="text-xs font-mono tracking-widest text-indigo-400 uppercase">
              SRM students finally have one intelligent place to discover and manage opportunities
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-zinc-100 leading-[1.12]">
              Stop Missing the Opportunities <br className="hidden sm:block" />
              That Move Your Career Forward.
            </h1>

            {/* Supporting Explanation */}
            <p className="text-base sm:text-lg md:text-xl text-zinc-400 font-light max-w-3xl mx-auto leading-relaxed">
              SRM Opportunity Intelligence Platform brings verified hackathons, internships, research opportunities, competitions, workshops, scholarships and campus opportunities into one intelligent discovery system.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/opportunities"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/5 active:scale-95 text-sm"
              >
                <Compass className="w-4 h-4 text-zinc-700" />
                <span>Explore Opportunities</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-500" />
              </Link>
              
              <Link
                href="/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium hover:bg-zinc-800/80 hover:text-white transition-colors flex items-center justify-center text-sm active:scale-95"
              >
                Create Student Account
              </Link>
            </div>
          </div>

          {/* Interactive Opportunity Intelligence Visualizer */}
          <HeroVisual />
        </section>

        {/* Product Capabilities / Value Blocks */}
        <ProductValueSection />

        {/* Workflow Progression: DISCOVER -> FILTER -> TRACK -> ACT */}
        <ProductFlowSection />

        {/* Trust & Database Architecture Section */}
        <TrustSection />

        {/* Final CTA Section */}
        <FinalCtaSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
