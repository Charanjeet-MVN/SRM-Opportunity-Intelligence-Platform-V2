import React from "react";
import Link from "next/link";
import { getPublicClubsAction } from "@/lib/clubs/actions";
import ClubDirectoryClient from "@/components/clubs/ClubDirectoryClient";
import { ArrowLeft } from "lucide-react";

interface ClubsPageProps {
  searchParams: Promise<{ search?: string; category?: string }>;
}

export const metadata = {
  title: "SRM Campus Organizations & Clubs Directory",
  description: "Explore verified SRM student clubs, technical societies, and campus organizations.",
};

export default async function PublicClubsDirectoryPage({ searchParams }: ClubsPageProps) {
  const { search, category } = await searchParams;
  const { clubs } = await getPublicClubsAction({ search, category });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <Link
              href="/opportunities"
              className="text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:inline-block"
            >
              Browse Opportunities
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ClubDirectoryClient
          initialClubs={clubs || []}
          initialCategory={category || "all"}
          initialSearch={search || ""}
        />
      </main>
    </div>
  );
}
