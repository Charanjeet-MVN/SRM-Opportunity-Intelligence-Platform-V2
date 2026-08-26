import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getOpportunityBySlugAction,
  getRelatedOpportunitiesAction,
} from "@/lib/opportunities/actions";
import {
  isOpportunityRegisteredAction,
  isOpportunitySavedAction,
} from "@/lib/engagement/actions";
import { StudentProfile } from "@/types";

// Premium Details Components
import OpportunityHero3D from "@/components/opportunities/details/OpportunityHero3D";
import OpportunityDecisionSidebar from "@/components/opportunities/details/OpportunityDecisionSidebar";
import OpportunityEligibilityMatrix from "@/components/opportunities/details/OpportunityEligibilityMatrix";
import EventTimelineView from "@/components/opportunities/details/EventTimelineView";
import OpportunityStorytelling from "@/components/opportunities/details/OpportunityStorytelling";
import RelatedOpportunitiesSection from "@/components/opportunities/details/RelatedOpportunitiesSection";
import StickyActionDock from "@/components/opportunities/details/StickyActionDock";
import AIOpportunityIntelligenceSection from "@/components/opportunities/AIOpportunityIntelligenceSection";

import {
  ArrowLeft,
  ChevronRight,
  Home,
} from "lucide-react";

interface OpportunityDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: OpportunityDetailPageProps) {
  const { slug } = await params;
  const { opportunity } = await getOpportunityBySlugAction(slug);

  if (!opportunity) {
    return { title: "Opportunity Not Found | SRM Opportunity Intelligence" };
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
  let isSaved = false;
  let trackerColumn: string | undefined = undefined;

  if (user) {
    const [regCheck, saveCheck] = await Promise.all([
      isOpportunityRegisteredAction(opportunity.id),
      isOpportunitySavedAction(opportunity.id),
    ]);

    isRegistered = regCheck;
    isSaved = saveCheck;

    // Check tracker notes column
    const { data: regRecord } = await supabase
      .from("registrations")
      .select("notes, status")
      .eq("user_id", user.id)
      .eq("opportunity_id", opportunity.id)
      .single();

    if (regRecord?.notes) {
      trackerColumn = regRecord.notes;
    } else if (isSaved) {
      trackerColumn = "Saved";
    }

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono">
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Discover</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-600 hidden sm:inline" />
            <span className="text-zinc-500 truncate max-w-[240px] hidden sm:inline">
              {opportunity.title}
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/clubs"
              className="text-xs text-zinc-400 hover:text-zinc-200 font-mono transition-colors hidden sm:inline-block"
            >
              Clubs & Orgs
            </Link>
            <Link
              href="/dashboard/student"
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-zinc-400" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
        {/* 1. Identity & Overview Hero */}
        <OpportunityHero3D
          opportunity={opportunity}
          isRegistered={isRegistered}
          isSaved={isSaved}
        />

        {/* 2. Structured Decision Architecture Grid (Main Content 70% + Decision Sidebar 30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT 2 COLUMNS: Narrative, AI Executive Summary, Dedicated Eligibility, Roadmap */}
          <div className="lg:col-span-2 space-y-8 min-w-0">
            {/* AI Executive Intelligence (What, Who, Requirements, Why Matters, Next Action) */}
            <AIOpportunityIntelligenceSection
              opportunity={opportunity}
              profile={studentProfile}
              isAuthenticated={Boolean(user)}
            />

            {/* Dedicated Eligibility & Skill Match Matrix */}
            <OpportunityEligibilityMatrix
              opportunity={opportunity}
              profile={studentProfile}
              isAuthenticated={Boolean(user)}
            />

            {/* Official Narrative & Storytelling */}
            <OpportunityStorytelling opportunity={opportunity} />

            {/* Interactive Milestone Journey */}
            <EventTimelineView opportunity={opportunity} />
          </div>

          {/* RIGHT 1 COLUMN: Intelligent Decision & Action Panel */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <OpportunityDecisionSidebar
              opportunity={opportunity}
              profile={studentProfile}
              isAuthenticated={Boolean(user)}
              isRegistered={isRegistered}
              isSaved={isSaved}
              trackerColumn={trackerColumn}
            />
          </div>
        </div>

        {/* 3. Related Opportunities Curated Row */}
        {related.length > 0 && (
          <RelatedOpportunitiesSection
            related={related}
            currentType={opportunity.type}
          />
        )}
      </main>

      {/* 4. Floating Sticky Action Dock (Appears on Scroll) */}
      <StickyActionDock
        opportunity={opportunity}
        isRegistered={isRegistered}
        isSaved={isSaved}
        trackerColumn={trackerColumn}
      />
    </div>
  );
}
