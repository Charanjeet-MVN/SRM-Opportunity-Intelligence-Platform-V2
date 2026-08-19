import React from "react";
import { getStudentProfileAction } from "@/lib/students/actions";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { Sparkles } from "lucide-react";

export default async function StudentOnboardingPage() {
  const { profile } = await getStudentProfileAction();

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          Personalization Engine Setup
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
          Setup Your Opportunity Intelligence Profile
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          Help us tailor high-relevance hackathons, research grants, internships, and club recruitments to your academic and career vector.
        </p>
      </div>

      {/* Multi-step Onboarding Wizard */}
      <OnboardingWizard initialProfile={profile} />
    </div>
  );
}
