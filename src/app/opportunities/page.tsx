"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPublicOpportunitiesAction } from "@/lib/opportunities/actions";
import OpportunityDiscoveryHub from "@/components/opportunities/OpportunityDiscoveryHub";
import OpportunityCardSkeleton from "@/components/opportunities/OpportunityCardSkeleton";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Opportunity, StudentProfile } from "@/types";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function PublicOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);

  // Load authenticated user profile
  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: prof } = await supabase
            .from("student_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (prof) {
            setStudentProfile({
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
            });
          }
        }
      } catch {
        // Unauthenticated session
      }
    }
    loadUser();
  }, []);

  // Fetch opportunities from Supabase
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setErrorState(null);

    try {
      const res = await getPublicOpportunitiesAction({ limit: 60 });
      if (res.error) {
        setErrorState(res.error);
        setOpportunities([]);
      } else {
        setOpportunities(res.opportunities || []);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load opportunities";
      setErrorState(message);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden flex flex-col justify-between">
      {/* Universal Floating Header */}
      <LandingHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8 flex-1 w-full relative z-10">
        {loading ? (
          <div className="space-y-8 py-6">
            <div className="p-8 rounded-3xl bg-zinc-950/60 border border-zinc-800/60 animate-pulse h-48 flex flex-col justify-center space-y-3">
              <div className="w-48 h-6 bg-zinc-900 rounded-xl" />
              <div className="w-96 h-10 bg-zinc-850 rounded-2xl" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <OpportunityCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : errorState ? (
          <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center max-w-lg mx-auto space-y-4 my-12 font-mono text-xs text-red-300">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p>{errorState}</p>
            <button
              onClick={fetchOpportunities}
              className="px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-200 transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : (
          <OpportunityDiscoveryHub
            initialOpportunities={opportunities}
            studentProfile={studentProfile}
          />
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
