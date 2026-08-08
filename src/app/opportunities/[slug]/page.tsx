import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOpportunityBySlugAction } from "@/lib/opportunities/actions";
import OpportunityTypeBadge from "@/components/opportunities/OpportunityTypeBadge";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import BookmarkButton from "@/components/opportunities/BookmarkButton";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ExternalLink,
  Building2,
  CheckCircle2,
  Sparkles,
  Users,
  Bookmark,
  Share2,
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
    title: opportunity.title,
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

  const isDeadlinePassed = opportunity.applicationDeadline
    ? new Date(opportunity.applicationDeadline) < new Date()
    : false;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
      {/* Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Opportunities</span>
          </Link>

          <Link
            href="/dashboard/student"
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-medium transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Opportunity Hero Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-indigo-950/20 border border-zinc-800/80 space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <OpportunityTypeBadge type={opportunity.type} />
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              <span className="capitalize">{opportunity.locationType.replace("_", " ")}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              {opportunity.title}
            </h1>
            {opportunity.summary && (
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-3xl">
                {opportunity.summary}
              </p>
            )}
          </div>

          {/* Quick Meta Stats Bar */}
          <div className="pt-4 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-6">
              {opportunity.applicationDeadline && (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-500 block uppercase">Deadline</span>
                  <span className={`font-semibold ${isDeadlinePassed ? "text-red-400" : "text-zinc-200"}`}>
                    {new Date(opportunity.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              )}

              {opportunity.eventStartDate && (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-500 block uppercase">Event Starts</span>
                  <span className="font-semibold text-zinc-200">
                    {new Date(opportunity.eventStartDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {opportunity.locationAddress && (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-500 block uppercase">Venue</span>
                  <span className="font-semibold text-zinc-200">{opportunity.locationAddress}</span>
                </div>
              )}
            </div>

            {/* Apply Button CTA & Save Button */}
            <div className="flex items-center gap-3">
              <BookmarkButton opportunityId={opportunity.id} />
              {opportunity.externalUrl ? (
                <a
                  href={opportunity.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Register / Apply</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-xs text-zinc-500 italic">No external application URL specified.</span>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Left Column: Full Description */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
              <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Opportunity Overview & Details
              </h2>
              <div className="text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed space-y-3">
                {opportunity.description}
              </div>
            </div>

            {/* Required Skills */}
            {opportunity.requiredSkills.length > 0 && (
              <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Recommended / Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {opportunity.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg text-xs font-mono bg-zinc-950 text-indigo-300 border border-indigo-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Organization Details & Eligibility */}
          <div className="space-y-6">

            {/* Publisher Organization Card */}
            {opportunity.club && (
              <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
                <h2 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Published By
                </h2>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-amber-400 text-sm">
                      {opportunity.club.logoUrl ? (
                        <img src={opportunity.club.logoUrl} alt={opportunity.club.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        opportunity.club.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">{opportunity.club.name}</h3>
                      <VerificationBadge status={opportunity.club.verificationStatus} />
                    </div>
                  </div>

                  {opportunity.club.officialEmail && (
                    <p className="text-[11px] text-zinc-500 font-mono pt-1">
                      {opportunity.club.officialEmail}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Eligibility Rules */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Eligibility Requirements
              </h2>

              <div className="space-y-2 text-xs text-zinc-400 font-mono">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Eligible Academic Years</span>
                  <span>
                    {opportunity.eligibleYears.length > 0
                      ? opportunity.eligibleYears.map((y) => `Year ${y}`).join(", ")
                      : "All Academic Years"}
                  </span>
                </div>

                <div>
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
      </main>
    </div>
  );
}
