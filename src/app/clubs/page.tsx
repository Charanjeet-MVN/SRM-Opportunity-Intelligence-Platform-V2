import React from "react";
import Link from "next/link";
import { getPublicClubsAction } from "@/lib/clubs/actions";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import { Building2, Search, ArrowRight } from "lucide-react";

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

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "technical", label: "Technical & Coding" },
    { id: "cultural", label: "Cultural & Arts" },
    { id: "management", label: "Management & Business" },
    { id: "sports", label: "Sports & Fitness" },
    { id: "social", label: "Social Impact & Community" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
      {/* Header Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-xs">
              V2
            </div>
            <span className="text-xs font-semibold tracking-wider text-zinc-100 uppercase hidden sm:inline-block">
              SRM Organizations Directory
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/opportunities"
              className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Browse Opportunities
            </Link>
            <Link
              href="/dashboard/student"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-purple-950/30 p-8 sm:p-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Building2 className="w-3.5 h-3.5" />
            <span>Verified Campus Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-100">
            SRM Organizations & Student Clubs
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-2xl">
            Explore authenticated campus societies, technical chapters, and student leadership teams publishing verified hackathons, workshops, and recruitment drives.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-4">
          <form className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
              <input
                type="text"
                name="search"
                defaultValue={search || ""}
                placeholder="Search organizations by name or keyword..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer"
            >
              Filter Clubs
            </button>
          </form>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
            {categories.map((cat) => {
              const isSelected = (category || "all") === cat.id;
              return (
                <Link
                  key={cat.id}
                  href={`/clubs?category=${cat.id}${search ? `&search=${search}` : ""}`}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Clubs Grid / Zero State */}
        {clubs.length === 0 ? (
          <div className="py-20 px-6 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-4 max-w-md mx-auto">
            <Building2 className="w-8 h-8 text-zinc-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-200">No organizations found</h3>
              <p className="text-xs text-zinc-400 font-mono">
                {search ? `No clubs matching "${search}"` : "No registered SRM clubs found in this category."}
              </p>
            </div>
            <Link
              href="/clubs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-indigo-400 hover:text-indigo-300"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 group shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-indigo-400 text-lg overflow-hidden shrink-0">
                      {club.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover" />
                      ) : (
                        club.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <VerificationBadge status={club.verificationStatus} />
                  </div>

                  <div className="space-y-1">
                    <Link href={`/clubs/${club.slug}`}>
                      <h2 className="text-base font-bold text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-1">
                        {club.name}
                      </h2>
                    </Link>
                    {club.category && (
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block capitalize">
                        {club.category}
                      </span>
                    )}
                  </div>

                  {club.description && (
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed font-light">
                      {club.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="text-zinc-500">
                    {club.opportunityCount} active {club.opportunityCount === 1 ? "listing" : "listings"}
                  </span>
                  <Link
                    href={`/clubs/${club.slug}`}
                    className="text-purple-400 group-hover:text-purple-300 font-semibold inline-flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
