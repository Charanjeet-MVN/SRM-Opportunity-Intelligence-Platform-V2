import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClubBySlugAction } from "@/lib/clubs/actions";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import {
  ArrowLeft,
  Building2,
  Mail,
  ShieldCheck,
  Layers,
} from "lucide-react";

interface ClubProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ClubProfilePageProps) {
  const { slug } = await params;
  const { club } = await getClubBySlugAction(slug);

  if (!club) {
    return { title: "Organization Not Found" };
  }

  return {
    title: `${club.name} | SRM Campus Club Profile`,
    description: club.description || `Explore verified opportunities published by ${club.name} at SRM Institute of Science and Technology.`,
  };
}

export default async function PublicClubProfilePage({ params }: ClubProfilePageProps) {
  const { slug } = await params;
  const { club, opportunities, error } = await getClubBySlugAction(slug);

  if (error || !club) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
      {/* Header Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/clubs"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Clubs Directory</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/opportunities"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-mono"
            >
              Browse Feed
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

      {/* Main Profile Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Organization Trust Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-purple-950/30 border border-zinc-800/80 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-indigo-400 text-2xl overflow-hidden shrink-0 shadow-2xl">
                {club.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover" />
                ) : (
                  club.name.charAt(0).toUpperCase()
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-100">
                    {club.name}
                  </h1>
                </div>
                {club.category && (
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block capitalize">
                    {club.category} Organization
                  </span>
                )}
                {club.officialEmail && (
                  <p className="text-xs font-mono text-zinc-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{club.officialEmail}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="shrink-0">
              <VerificationBadge status={club.verificationStatus} />
            </div>
          </div>

          {club.description && (
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light pt-2 border-t border-zinc-800/60 max-w-3xl">
              {club.description}
            </p>
          )}

          {/* Verification Trust Box */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Institutional Trust Status</span>
            </div>
            <p className="text-zinc-400 font-light leading-relaxed">
              {club.verificationStatus === "verified"
                ? `Verified by the SRM Opportunity Intelligence Platform${club.verifiedAt ? ` on ${new Date(club.verifiedAt).toLocaleDateString()}` : ""}. Credentials and charter endorsement documents evaluated by administrators.`
                : club.verificationStatus === "pending_review"
                ? "Verification pending administrative review. Document submission is under evaluation."
                : "Unverified Organization. Published opportunities undergo standard platform moderation."}
            </p>
          </div>
        </div>

        {/* Active Published Opportunities Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
                Published Opportunities ({opportunities.length})
              </h2>
            </div>
          </div>

          {opportunities.length === 0 ? (
            <div className="py-16 px-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3 max-w-md mx-auto">
              <Building2 className="w-8 h-8 text-zinc-600 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-300">No opportunities published yet</h3>
              <p className="text-xs text-zinc-500 font-mono">
                {club.name} has not posted any active opportunities at this time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
