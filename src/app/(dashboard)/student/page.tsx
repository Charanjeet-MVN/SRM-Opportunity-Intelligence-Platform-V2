import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPersonalizedFeedAction } from "@/lib/opportunities/actions";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import AIInsightsBar from "@/components/dashboard/AIInsightsBar";
import { Compass, Sparkles, User, ShieldCheck, ArrowRight, Bookmark, Calendar } from "lucide-react";
import { redirect } from "next/navigation";
import { calculateProfileCompleteness, isStudentOnboardingCompleted } from "@/lib/students/actions";
import { StudentProfile } from "@/types";

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let studentProfile: StudentProfile | null = null;

  if (user) {
    const { data } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      studentProfile = {
        id: data.id,
        userId: data.user_id,
        fullName: data.full_name,
        registerNumber: data.register_number || undefined,
        department: data.department || undefined,
        yearOfStudy: data.year_of_study || undefined,
        skills: data.skills || [],
        interests: data.interests || [],
        careerGoals: data.career_goals || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  }

  // Check if onboarding is completed
  const hasOnboarded = await isStudentOnboardingCompleted(studentProfile);
  if (!hasOnboarded) {
    redirect("/dashboard/student/onboarding");
  }

  const completeness = await calculateProfileCompleteness(studentProfile);
  const { opportunities, total } = await getPersonalizedFeedAction({ limit: 6, sortBy: "relevance" });

  return (
    <div className="space-y-8">
      {/* AI Intelligence Executive Briefing */}
      <AIInsightsBar profile={studentProfile} opportunities={opportunities} />

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/student/profile"
          className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-purple-500/40 transition-all group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <User className="w-4 h-4" />
            </div>
            <span className="font-mono text-xs text-purple-400 font-bold">{completeness}% Complete</span>
          </div>
          <h2 className="text-xs font-semibold text-zinc-200">Skill Matrix Vector</h2>
          <p className="text-[11px] text-zinc-400">
            {studentProfile?.skills?.length || 0} skills active for vector match scoring.
          </p>
        </Link>

        <Link
          href="/dashboard/student/saved"
          className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-purple-500/40 transition-all group space-y-2"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Bookmark className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-semibold text-zinc-200">Bookmarked Vault</h2>
          <p className="text-[11px] text-zinc-400">
            Save opportunities to monitor closing deadlines.
          </p>
        </Link>

        <Link
          href="/dashboard/student/calendar"
          className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-purple-500/40 transition-all group space-y-2"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Calendar className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-semibold text-zinc-200">Impending Deadlines</h2>
          <p className="text-[11px] text-zinc-400">
            Chronological milestone schedule.
          </p>
        </Link>
      </div>

      {/* Real-time Personalized Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
              Prioritized Opportunity Feed
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 font-mono">{total} Records Vectorized</span>
            <Link
              href="/opportunities"
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
            >
              <span>Explore Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Opportunity List or Empty State */}
        {opportunities.length === 0 ? (
          <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-semibold text-zinc-200">No Verified Opportunities Available</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                As verified SRM organizations publish official opportunities, your personalized AI feed will automatically update.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} relevance={opp.relevance} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
