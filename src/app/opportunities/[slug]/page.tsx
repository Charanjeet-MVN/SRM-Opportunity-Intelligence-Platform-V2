import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getOpportunityBySlugAction,
  getRelatedOpportunitiesAction,
} from "@/lib/opportunities/actions";
import { isOpportunityRegisteredAction } from "@/lib/engagement/actions";
import { StudentProfile } from "@/types";

// Premium Details Components
import OpportunityHero3D from "@/components/opportunities/details/OpportunityHero3D";
import EventTimelineView from "@/components/opportunities/details/EventTimelineView";
import OpportunityStorytelling from "@/components/opportunities/details/OpportunityStorytelling";
import OrganizerSpotlightCard from "@/components/opportunities/details/OrganizerSpotlightCard";
import RelatedOpportunitiesSection from "@/components/opportunities/details/RelatedOpportunitiesSection";
import StickyActionDock from "@/components/opportunities/details/StickyActionDock";
import AIOpportunityIntelligenceSection from "@/components/opportunities/AIOpportunityIntelligenceSection";
import OpportunityEvaluationSection from "@/components/opportunities/OpportunityEvaluationSection";

import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface OpportunityDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: OpportunityDetailPageProps) {
  const { slug } = await params;
  const { opportunity } = await getOpportunityBySlugAction(slug);

  if (!opportunity) {
    return { title: "Opportunity Not Found" };
  }

  return {
    title: `${opportunity.title} | SRM Opportunity Intelligence`,
    description: opportunity.summary || opportunity.description.substring(0, 160),
    openGraph: {
      title: `${opportunity.title} | SRM Opportunity Intelligence`,
      description: opportunity.summary || opportunity.description.substring(0, 160),
    },
  };
}

export default async function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
  const { slug } = await params;
  const { opportunity, error } = await getOpportunityBySlugAction(slug);

  if (error || !opportunity) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let studentProfile: StudentProfile | null = null;
  let isRegistered = false;

  if (user) {
    isRegistered = await isOpportunityRegisteredAction(opportunity.id);

    const { data: prof } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (prof) {
      studentProfile = {
        id: prof.id,
        userId: prof.user_id,
        fullName: prof.full_name,
        registerNumber: prof.register_number || undefined,
        department: prof.department || undefined,
        yearOfStudy: prof.year_of_study || undefined,
        skills: prof.skills || [],
        interests: prof.interests || [],
        careerGoals: prof.career_goals || undefined,
        createdAt: prof.created_at,
        updatedAt: prof.updated_at,
      };
    }
  }

  // Fetch real related opportunities
  const { related } = await getRelatedOpportunitiesAction(opportunity.id, opportunity.type, 4);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Breadcrumb Navigation Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Explore Opportunities</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-600 hidden sm:inline" />
            <span className="text-zinc-500 truncate max-w-[200px] hidden sm:inline">
              {opportunity.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/clubs"
              className="text-xs text-zinc-400 hover:text-zinc-200 font-mono transition-colors hidden sm:inline-block"
            >
              Organizations
            </Link>
            <Link
              href="/dashboard/student"
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-medium transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* 1. Flagship Apple-Grade 3D Hero */}
        <OpportunityHero3D opportunity={opportunity} isRegistered={isRegistered} />

        {/* 2. Interactive Event Timeline Journey */}
        <EventTimelineView opportunity={opportunity} />

        {/* 3. AI Opportunity Intelligence Layer */}
        <AIOpportunityIntelligenceSection
          opportunity={opportunity}
          profile={studentProfile}
          isAuthenticated={Boolean(user)}
        />

        {/* 4. Deterministic Profile Overlap Evaluation */}
        <OpportunityEvaluationSection
          opportunity={opportunity}
          profile={studentProfile}
          isAuthenticated={Boolean(user)}
        />

        {/* 5. Two-Column Narrative & Organizer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2-Cols: Storytelling, Key Highlights, Skills, Academic Matrices */}
          <div className="lg:col-span-2 space-y-8">
            <OpportunityStorytelling opportunity={opportunity} />
          </div>

          {/* Right 1-Col: Organizer Spotlight & Campus Guidelines */}
          <div className="space-y-6">
            <OrganizerSpotlightCard club={opportunity.club} />

            {/* SRM Student Verification & Security Guarantee */}
            <div className="rounded-3xl bg-zinc-950/70 border border-zinc-800/80 p-6 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified SRM Campus Post</span>
              </div>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                This event is vetted for SRM student body compliance. All certificates and registration timestamps are recorded securely on the platform.
              </p>
            </div>
          </div>
        </div>

        {/* 6. Related Opportunities Carousel */}
        {related.length > 0 && (
          <RelatedOpportunitiesSection
            related={related}
            currentType={opportunity.type}
          />
        )}
      </main>

      {/* 7. Floating Sticky Action Dock (Appears on Scroll) */}
      <StickyActionDock opportunity={opportunity} isRegistered={isRegistered} />
    </div>
  );
}
