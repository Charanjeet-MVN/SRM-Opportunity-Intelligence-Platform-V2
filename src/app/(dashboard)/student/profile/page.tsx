"use client";

import React, { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  getStudentProfileAction,
  updateStudentProfileAction,
  StudentProfileFormState,
} from "@/lib/students/actions";
import { SKILL_TAXONOMY, INTEREST_TAXONOMY, DEPARTMENTS } from "@/lib/constants";
import { StudentProfile } from "@/types";
import {
  User,
  IdCard,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Target,
  Award,
} from "lucide-react";



export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected skills and interests arrays
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  const [state, formAction, isPending] = useActionState<
    StudentProfileFormState,
    FormData
  >(updateStudentProfileAction, {});

  // Fetch initial profile
  useEffect(() => {
    getStudentProfileAction().then((res) => {
      if (res.profile) {
        setProfile(res.profile);
        setSelectedSkills(res.profile.skills || []);
        setSelectedInterests(res.profile.interests || []);
      }
      setLoading(false);
    });
  }, []);

  // Update profile state when form submission completes
  useEffect(() => {
    if (state.profile) {
      setProfile(state.profile);
      setSelectedSkills(state.profile.skills || []);
      setSelectedInterests(state.profile.interests || []);
    }
  }, [state.profile]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setCustomSkillInput("");
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const calculateCompleteness = () => {
    let points = 0;
    if (profile?.fullName) points += 20;
    if (profile?.registerNumber) points += 15;
    if (profile?.department) points += 15;
    if (profile?.yearOfStudy) points += 10;
    if (selectedSkills.length > 0) points += 20;
    if (selectedInterests.length > 0) points += 10;
    if (profile?.careerGoals) points += 10;
    return points;
  };

  const completeness = calculateCompleteness();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-xs text-zinc-500 font-mono">
        Loading Student Profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
            <Award className="w-3.5 h-3.5" />
            Student Identity & Intelligence Vector
          </div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
            Academic & Skill Profile
          </h1>
          <p className="text-xs text-zinc-400">
            Your profile vectors directly inform the Opportunity Scoring Engine to match relevant hackathons, research positions, and placement drives.
          </p>
          <div className="pt-1">
            <Link
              href="/dashboard/student/onboarding"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-medium hover:bg-purple-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Setup Wizard</span>
            </Link>
          </div>
        </div>

        {/* Profile Completeness Score */}
        <div className="w-full md:w-56 p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Relevance Vector Score</span>
            <span className="font-mono text-indigo-400 font-bold">{completeness}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-500">
            {completeness < 70
              ? "Add skills & interests to unlock high-confidence AI matching"
              : "Optimized for maximum opportunity relevance matching"}
          </p>
        </div>
      </div>

      {state.error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {state.message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{state.message}</span>
        </div>
      )}

      <form action={formAction} className="space-y-8">
        {/* Hidden inputs for JSON stringified arrays */}
        <input type="hidden" name="skillsJson" value={JSON.stringify(selectedSkills)} />
        <input type="hidden" name="interestsJson" value={JSON.stringify(selectedInterests)} />

        {/* 1. Academic Credentials Section */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-5">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            1. Academic Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  name="fullName"
                  required
                  defaultValue={profile?.fullName || ""}
                  placeholder="e.g. Aditi Sharma"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">SRM Register Number</label>
              <div className="relative">
                <IdCard className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  name="registerNumber"
                  defaultValue={profile?.registerNumber || ""}
                  placeholder="e.g. RA2111003010123"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Department</label>
              <select
                name="department"
                defaultValue={profile?.department || DEPARTMENTS[0]}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Year of Study</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <select
                  name="yearOfStudy"
                  defaultValue={profile?.yearOfStudy?.toString() || "3"}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year / PG</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Skill Matrix Selector */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              2. Skill Matrix ({selectedSkills.length} selected)
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Select your technical languages, frameworks, and domain proficiencies to match eligibility requirements.
          </p>

          {/* Preset Skills Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {SKILL_TAXONOMY.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  <span>{skill}</span>
                  {isSelected ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3 text-zinc-500" />}
                </button>
              );
            })}
          </div>

          {/* Custom Skill Add Input */}
          <div className="flex items-center gap-2 pt-2 max-w-sm">
            <input
              type="text"
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              placeholder="Add custom skill..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              type="button"
              onClick={addCustomSkill}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        {/* 3. Interest Taxonomy */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            3. Opportunity Interests ({selectedInterests.length} selected)
          </h2>
          <p className="text-xs text-zinc-400">
            Choose what types of student opportunities you actively want to discover.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {INTEREST_TAXONOMY.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  <span>{interest}</span>
                  {isSelected ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3 text-zinc-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Career Goals */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
            4. Career Goals & Target Roles
          </h2>
          <textarea
            name="careerGoals"
            rows={3}
            defaultValue={profile?.careerGoals || ""}
            placeholder="e.g. Seeking Full-Stack SDE roles, AI research fellowships, or competitive hackathon teams..."
            className="w-full p-3 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <span>Updating Intelligence Vector...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Profile Vector</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
