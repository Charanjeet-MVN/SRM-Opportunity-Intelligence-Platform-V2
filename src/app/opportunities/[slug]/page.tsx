import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOpportunityBySlugAction, getRelatedOpportunitiesAction } from "@/lib/opportunities/actions";
import OpportunityTypeBadge from "@/components/opportunities/OpportunityTypeBadge";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import BookmarkButton from "@/components/opportunities/BookmarkButton";
import RegisterApplyButton from "@/components/opportunities/RegisterApplyButton";
import OpportunityEvaluationSection from "@/components/opportunities/OpportunityEvaluationSection";
import AIOpportunityIntelligenceSection from "@/components/opportunities/AIOpportunityIntelligenceSection";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import { isOpportunityRegisteredAction } from "@/lib/engagement/actions";
import { StudentProfile } from "@/types";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  Sparkles,
  Users,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
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
  const { data: { user } } = await supabase.auth.getUser();

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
  const { related } = await getRelatedOpportunitiesAction(opportunity.id, opportunity.type, 3);

  // Deadline calculation
  const now = new Date();
  const hasDeadline = !!opportunity.applicationDeadline;
  const deadlineDate = hasDeadline ? new Date(opportunity.applicationDeadline!) : null;
  const isDeadlinePassed = deadlineDate ? deadlineDate < now : false;

  let deadlineUrgency = {
    label: "Upcoming",
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  };

  if (isDeadlinePassed) {
    deadlineUrgency = {
      label: "Application Closed",
      bg: "bg-red-500/10 border-red-500/20 text-red-400",
    };
  } else if (deadlineDate) {
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      deadlineUrgency = {
        label: "Due Today / Tomorrow",
        bg: "bg-red-500/15 border-red-500/30 text-red-400 font-bold animate-pulse",
      };
    } else if (diffDays <= 7) {
      deadlineUrgency = {
        label: `Closing in ${diffDays} days`,
        bg: "bg-amber-500/10 border-amber-500/20 text-amber-400 font-semibold",
      };
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 font-mono transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Opportunities</span>
          </Link>

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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Opportunity Hero Header Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-purple-950/30 border border-zinc-800/80 shadow-2xl space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <OpportunityTypeBadge type={opportunity.type} />
              {opportunity.club && (
                <VerificationBadge status={opportunity.club.verificationStatus} />
              )}
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <span className="capitalize">{opportunity.locationType.replace("_", " ")}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-100 leading-tight">
              {opportunity.title}
            </h1>
            {opportunity.summary && (
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl font-light">
                {opportunity.summary}
              </p>
            )}
          </div>

          {/* Publisher Identity Bar */}
          {opportunity.club && (
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-zinc-400">
              <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-indigo-400 text-xs overflow-hidden shrink-0">
                {opportunity.club.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={opportunity.club.logoUrl} alt={opportunity.club.name} className="w-full h-full object-cover" />
                ) : (
                  opportunity.club.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span>Organized by</span>
                <Link
                  href={`/clubs/${opportunity.club.slug || opportunity.club.id}`}
                  className="text-zinc-100 hover:text-purple-300 font-semibold underline decoration-zinc-700 underline-offset-2 transition-colors"
                >
                  {opportunity.club.name}
                </Link>
              </div>
            </div>
          )}

          {/* Quick Meta Bar */}
          <div className="pt-4 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-6 flex-wrap">
              {opportunity.applicationDeadline && (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-500 block uppercase">Application Deadline</span>
                  <span className={`font-semibold ${isDeadlinePassed ? "text-red-400" : "text-zinc-200"}`}>
                    {new Date(opportunity.applicationDeadline).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {opportunity.eventStartDate && (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-500 block uppercase">Event Starts</span>
                  <span className="font-semibold text-zinc-200">
                    {new Date(opportunity.eventStartDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {opportunity.locationAddress && (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-500 block uppercase">Venue Address</span>
                  <span className="font-semibold text-zinc-200">{opportunity.locationAddress}</span>
                </div>
              )}
            </div>

            {/* Save & Apply CTAs */}
            <div className="flex items-center gap-3">
              <BookmarkButton opportunityId={opportunity.id} />
              <RegisterApplyButton
                opportunityId={opportunity.id}
                externalUrl={opportunity.externalUrl}
                initialIsRegistered={isRegistered}
              />
            </div>
          </div>
        </div>

        {/* AI Intelligence Layer */}
        <AIOpportunityIntelligenceSection
          opportunity={opportunity}
          profile={studentProfile}
          isAuthenticated={Boolean(user)}
        />

        {/* Deterministic Profile Overlap Evaluation */}
        <OpportunityEvaluationSection
          opportunity={opportunity}
          profile={studentProfile}
          isAuthenticated={Boolean(user)}
        />

        {/* 2-Column Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Full Overview & Required Skills */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
              <h2 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <FileTextIcon /> Opportunity Overview & Details
              </h2>
              <div className="text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed space-y-3 font-light">
                {opportunity.description}
              </div>
            </div>

            {/* Required Skills Chips */}
            {opportunity.requiredSkills.length > 0 && (
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 shadow-xl">
                <h2 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Required & Recommended Skills
                </h2>
                <div className="flex flex-wrap gap-2 pt-1">
                  {opportunity.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl text-xs font-mono bg-zinc-950 text-indigo-300 border border-indigo-500/25"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Organizer & Eligibility Details */}
          <div className="space-y-6">
            {/* Deadline Urgency Card */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 shadow-xl">
              <h2 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Deadline Intelligence
              </h2>
              <div className={`p-3.5 rounded-2xl border text-xs font-mono flex items-center justify-between ${deadlineUrgency.bg}`}>
                <span>Status: {deadlineUrgency.label}</span>
                <Clock className="w-4 h-4 shrink-0" />
              </div>
              {opportunity.applicationDeadline && (
                <p className="text-[11px] font-mono text-zinc-500">
                  Applications close strictly on {new Date(opportunity.applicationDeadline).toLocaleString()}.
                </p>
              )}
            </div>

            {/* Publisher Organization Card */}
            {opportunity.club && (
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
                <h2 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  Published By
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-indigo-400 text-sm overflow-hidden shrink-0">
                      {opportunity.club.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={opportunity.club.logoUrl} alt={opportunity.club.name} className="w-full h-full object-cover" />
                      ) : (
                        opportunity.club.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/clubs/${opportunity.club.slug || opportunity.club.id}`}
                        className="text-sm font-bold text-zinc-100 hover:text-purple-300 transition-colors block"
                      >
                        {opportunity.club.name}
                      </Link>
                      <VerificationBadge status={opportunity.club.verificationStatus} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
                    {opportunity.club.officialEmail && (
                      <p className="text-[11px] text-zinc-500 truncate max-w-[140px]">
                        {opportunity.club.officialEmail}
                      </p>
                    )}
                    <Link
                      href={`/clubs/${opportunity.club.slug || opportunity.club.id}`}
                      className="text-purple-400 hover:text-purple-300 font-semibold ml-auto"
                    >
                      Organization Profile →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Eligibility Requirements Card */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 shadow-xl">
              <h2 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Academic Eligibility
              </h2>

              <div className="space-y-3 text-xs text-zinc-300 font-mono">
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-zinc-500 block text-[10px] uppercase">Academic Years</span>
                  <span>
                    {opportunity.eligibleYears.length > 0
                      ? opportunity.eligibleYears.map((y) => `Year ${y}`).join(", ")
                      : "All Academic Years"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-zinc-500 block text-[10px] uppercase">Eligible Departments</span>
                  <span>
                    {opportunity.eligibleDepartments.length > 0
                      ? opportunity.eligibleDepartments.join(", ")
                      : "All SRM Departments"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Opportunities Section */}
        {related.length > 0 && (
          <div className="pt-8 border-t border-zinc-800/80 space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
                Related {opportunity.type.replace("_", " ")} Opportunities
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function FileTextIcon() {
  return <span className="text-purple-400 font-mono">📄</span>;
}
