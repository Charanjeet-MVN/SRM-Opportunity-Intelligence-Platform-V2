import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClubBySlugAction } from "@/lib/clubs/actions";

// Redesigned Modular Profile Components
import ClubProfileHero from "@/components/clubs/profile/ClubProfileHero";
import ClubStoryAndVision from "@/components/clubs/profile/ClubStoryAndVision";
import ClubAchievementsSection from "@/components/clubs/profile/ClubAchievementsSection";
import ClubEventShowcase from "@/components/clubs/profile/ClubEventShowcase";
import ClubContactCard from "@/components/clubs/profile/ClubContactCard";

import {
  ArrowLeft,
  ChevronRight,
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
    description:
      club.description ||
      `Explore verified opportunities, hackathons, and recruitments published by ${club.name} at SRM Institute of Science and Technology.`,
    openGraph: {
      title: `${club.name} | SRM Campus Club Profile`,
      description:
        club.description ||
        `Explore verified opportunities published by ${club.name} at SRM Institute of Science and Technology.`,
    },
  };
}

export default async function PublicClubProfilePage({ params }: ClubProfilePageProps) {
  const { slug } = await params;
  const { club, opportunities, error } = await getClubBySlugAction(slug);

  if (error || !club) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Breadcrumb Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Link
              href="/clubs"
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Campus Organizations</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-600 hidden sm:inline" />
            <span className="text-zinc-500 truncate max-w-[220px] hidden sm:inline">
              {club.name}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <Link
              href="/opportunities"
              className="text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:inline-block"
            >
              Browse Feed
            </Link>
            <Link
              href="/dashboard/student"
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-100 font-medium transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Profile Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* 1. Flagship Club Profile Hero */}
        <ClubProfileHero club={club} />

        {/* 2. Story & Strategic Vision */}
        <ClubStoryAndVision club={club} />

        {/* 3. Achievements & Impact Milestones */}
        <ClubAchievementsSection club={club} />

        {/* 4. Event & Opportunity Showcase */}
        <ClubEventShowcase
          opportunities={opportunities}
          clubName={club.name}
        />

        {/* 5. Institutional Governance & Contact */}
        <ClubContactCard club={club} />
      </main>
    </div>
  );
}
