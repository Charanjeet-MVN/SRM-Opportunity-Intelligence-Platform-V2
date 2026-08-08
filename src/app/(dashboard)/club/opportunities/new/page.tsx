"use client";

import React, { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { getMyClubProfileAction } from "@/lib/clubs/actions";
import { createOpportunityAction, OpportunityFormState } from "@/lib/opportunities/actions";
import { SKILL_TAXONOMY, DEPARTMENTS } from "@/lib/constants";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import { Club, OpportunityType } from "@/types";
import { Plus, ArrowLeft, ShieldAlert, Sparkles, Calendar, MapPin, Link as LinkIcon, CheckCircle2, AlertCircle } from "lucide-react";

const OPPORTUNITY_TYPES: { value: OpportunityType; label: string }[] = [
  { value: "hackathon", label: "Hackathon" },
  { value: "internship", label: "Internship" },
  { value: "research", label: "Research Opportunity" },
  { value: "competition", label: "Coding / Tech Competition" },
  { value: "workshop", label: "Technical Workshop" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "scholarship", label: "Scholarship / Grant" },
  { value: "club_recruitment", label: "Club Recruitment Drive" },
  { value: "placement_drive", label: "Placement Drive" },
  { value: "conference", label: "Conference" },
  { value: "webinar", label: "Webinar / Talk" },
  { value: "other", label: "Other Opportunity" },
];

export default function CreateOpportunityPage() {
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([1, 2, 3, 4]);

  const [state, formAction, isPending] = useActionState<OpportunityFormState, FormData>(
    createOpportunityAction,
    {}
  );

  useEffect(() => {
    getMyClubProfileAction().then((res) => {
      if (res.club) setClub(res.club);
      setLoading(false);
    });
  }, []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleDept = (dept: string) => {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const toggleYear = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-xs text-zinc-500 font-mono">
        Loading Club Permissions...
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-xs text-zinc-400">
        No club profile associated with this account.
      </div>
    );
  }

  const isVerified = club.verificationStatus === "verified";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard/club"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Workspace</span>
          </Link>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
            Publish New Opportunity
          </h1>
        </div>
        <VerificationBadge status={club.verificationStatus} />
      </div>

      {state.error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {!isVerified && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-400">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Unverified Organization Notice</strong>
            <span>
              Your club is unverified. You can save opportunities as drafts, but official SRM public publishing requires verified status.{" "}
              <Link href="/dashboard/club/verification" className="underline font-medium hover:text-amber-300">
                Submit verification credentials here
              </Link>.
            </span>
          </div>
        </div>
      )}

      {/* Creation Wizard Form */}
      <form action={formAction} className="space-y-6">

        {/* 1. Basic Information */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
          <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            1. Basic Opportunity Details
          </h2>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Opportunity Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. SRM Hackathon 2026: AI Innovations"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Opportunity Type <span className="text-red-400">*</span>
              </label>
              <select
                name="type"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {OPPORTUNITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Location Mode <span className="text-red-400">*</span>
              </label>
              <select
                name="locationType"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="in_person">In-Person (On Campus)</option>
                <option value="virtual">Virtual / Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Venue / Address (Optional)
            </label>
            <input
              type="text"
              name="locationAddress"
              placeholder="e.g. Tech Park Auditorium 401, Kattankulathur Campus"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Short Pitch / Summary
            </label>
            <input
              type="text"
              name="summary"
              maxLength={200}
              placeholder="1-2 sentences highlighting why students should participate"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Full Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={5}
              placeholder="Detailed guidelines, rules, perks, cash prizes, or application instructions..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        {/* 2. Target Audience & Required Skills */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
          <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            2. Target Audience & Required Skills
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 block">
              Required / Recommended Skills
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-zinc-950 border border-zinc-800">
              {SKILL_TAXONOMY.map((skill) => {
                const selected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                      selected
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
            {selectedSkills.map((s) => (
              <input key={s} type="hidden" name="requiredSkills" value={s} />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300 block">
                Eligible Academic Years
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((year) => {
                  const selected = selectedYears.includes(year);
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => toggleYear(year)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                        selected
                          ? "bg-indigo-600 text-white font-semibold"
                          : "bg-zinc-950 text-zinc-400 border border-zinc-800"
                      }`}
                    >
                      Year {year}
                    </button>
                  );
                })}
              </div>
              {selectedYears.map((y) => (
                <input key={y} type="hidden" name="eligibleYears" value={y} />
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Max Participant Limit
              </label>
              <input
                type="number"
                name="maxParticipants"
                placeholder="Unlimited if left empty"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
        </div>

        {/* 3. Deadlines & External Application Link */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
          <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            3. Deadlines & External Portal Link
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Application Deadline
              </label>
              <input
                type="datetime-local"
                name="applicationDeadline"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Event Start Date
              </label>
              <input
                type="datetime-local"
                name="eventStartDate"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Event End Date
              </label>
              <input
                type="datetime-local"
                name="eventEndDate"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              External Registration Link (Devfolio / Unstop / Google Form)
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="url"
                name="externalUrl"
                placeholder="https://unstop.com/o/your-hackathon-id"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center gap-3 justify-end pt-2">
          <button
            type="submit"
            name="isDraft"
            value="true"
            disabled={isPending}
            className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="submit"
            name="isDraft"
            value="false"
            disabled={isPending || !isVerified}
            className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Publish Public Opportunity</span>
          </button>
        </div>
      </form>
    </div>
  );
}
