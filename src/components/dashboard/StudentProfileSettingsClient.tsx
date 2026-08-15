"use client";

import React, { useActionState, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  updateStudentProfileAction,
  updateStudentPasswordAction,
  StudentProfileFormState,
} from "@/lib/students/actions";
import { signOutAction } from "@/lib/auth/actions";
import { SKILL_TAXONOMY, INTEREST_TAXONOMY, DEPARTMENTS } from "@/lib/constants";
import { StudentProfile } from "@/types";
import {
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Target,
  Lock,
  LogOut,
  Zap,
  Award,
  Share2,
} from "lucide-react";

interface StudentProfileSettingsClientProps {
  initialProfile: StudentProfile | null;
  userEmail?: string;
}

export default function StudentProfileSettingsClient({
  initialProfile,
  userEmail,
}: StudentProfileSettingsClientProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(initialProfile);
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");

  // Dynamic profile achievements, activity score, and badges
  const [stats, setStats] = useState({
    achievements: 0,
    activityScore: 100,
    badges: [] as string[],
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const savedGoals = localStorage.getItem("soip_workspace_goals");
      const savedNotes = localStorage.getItem("soip_workspace_notes");
      const savedResources = localStorage.getItem("soip_workspace_resources");

      const goalsList = savedGoals ? JSON.parse(savedGoals) : [];
      const notesList = savedNotes ? JSON.parse(savedNotes) : [];
      const resourcesList = savedResources ? JSON.parse(savedResources) : [];

      const completedGoals = goalsList.filter((g: { status?: string }) => g.status === "completed").length;

      // Base activity score: 100 + (completed goals * 25) + (notes * 10) + (saved resources * 15)
      const score = 100 + (completedGoals * 25) + (notesList.length * 10) + (resourcesList.filter((r: { saved?: boolean }) => r.saved).length * 15);

      const earnedBadges: string[] = [];
      if (notesList.length > 0) earnedBadges.push("Knowledge Seeker");
      if (completedGoals > 0) earnedBadges.push("Goal Achiever");
      if (score >= 150) earnedBadges.push("Career Accelerator");
      if (resourcesList.filter((r: { saved?: boolean }) => r.saved).length > 0) earnedBadges.push("Opportunity Hunter");

      if (earnedBadges.length === 0) earnedBadges.push("Joined Pioneer");

      setStats({
        achievements: completedGoals,
        activityScore: score,
        badges: earnedBadges,
      });
    } catch {
      // ignore
    }
  }, []);

  const handleShareProfile = () => {
    const shareUrl = `${window.location.origin}/student/profile/${profile?.registerNumber || profile?.id || "demo"}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Selected skills and interests arrays
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialProfile?.skills || []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialProfile?.interests || []);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [skillSearch, setSkillSearch] = useState("");

  // Action states
  const [profileState, profileFormAction, isProfilePending] = useActionState<
    StudentProfileFormState,
    FormData
  >(updateStudentProfileAction, {});

  const [passwordState, passwordFormAction, isPasswordPending] = useActionState<
    StudentProfileFormState,
    FormData
  >(updateStudentPasswordAction, {});

  // Sync profile when profileState changes
  useEffect(() => {
    if (profileState.profile) {
      setProfile(profileState.profile);
      setSelectedSkills(profileState.profile.skills || []);
      setSelectedInterests(profileState.profile.interests || []);
    }
  }, [profileState.profile]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
      setCustomSkillInput("");
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
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

  const missingFields = [
    !profile?.fullName && { label: "Full Name", tip: "Add your full name for official certificates" },
    !profile?.registerNumber && { label: "Register Number", tip: "Add SRM Register Number for campus verification" },
    !profile?.department && { label: "Department", tip: "Specify department for academic eligibility matching" },
    !profile?.yearOfStudy && { label: "Year of Study", tip: "Select year of study for target event filtering" },
    selectedSkills.length === 0 && { label: "Skills", tip: "Select at least 3 skills to power opportunity relevance scoring" },
    selectedInterests.length === 0 && { label: "Interests", tip: "Choose career interests to refine feed recommendations" },
    !profile?.careerGoals && { label: "Career Goals", tip: "Add target roles to personalize your dashboard feed" },
  ].filter(Boolean) as { label: string; tip: string }[];

  const filteredSkills = SKILL_TAXONOMY.filter((s) =>
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Profile Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-purple-950/30 border border-zinc-800/80 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-indigo-400 text-2xl overflow-hidden shrink-0 shadow-2xl">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : "S"}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-100">
                  {profile?.fullName || "Student User"}
                </h1>
                {profile?.department && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {profile.department}
                  </span>
                )}
                {profile?.yearOfStudy && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Year {profile.yearOfStudy}
                  </span>
                )}
              </div>

              {userEmail && <p className="text-xs font-mono text-zinc-400">{userEmail}</p>}
              {profile?.registerNumber && (
                <p className="text-[11px] font-mono text-zinc-500">Reg: {profile.registerNumber}</p>
              )}
            </div>
          </div>

          {/* Completeness Score Badge */}
          <div className="w-full md:w-60 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 font-bold uppercase">Intelligence Score</span>
              <span className="text-purple-400 font-bold">{completeness}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-zinc-500">
              {completeness < 75
                ? "Complete missing fields to maximize opportunity match accuracy"
                : "Vector fully optimized for AI opportunity scoring"}
            </p>
          </div>
        </div>

        {/* Achievements, Badges, and Activity Score Widget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-850/60 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850/80 flex items-center justify-between shadow-inner">
            <div className="space-y-1">
              <span className="text-zinc-500 uppercase text-[9px] block">Achievements</span>
              <span className="text-xs font-bold text-zinc-200">{stats.achievements} Completed</span>
            </div>
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850/80 flex items-center justify-between shadow-inner">
            <div className="space-y-1">
              <span className="text-zinc-500 uppercase text-[9px] block">Activity Score</span>
              <span className="text-xs font-bold text-purple-405">{stats.activityScore} Pts</span>
            </div>
            <Zap className="w-5 h-5 text-purple-400 shrink-0 animate-pulse" />
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850/80 flex items-center justify-between shadow-inner">
            <div className="space-y-1">
              <span className="text-zinc-500 uppercase text-[9px] block">Public Portfolio</span>
              <button
                onClick={handleShareProfile}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all text-[10px] cursor-pointer"
              >
                <span>{copied ? "Copied!" : "Share Link"}</span>
                <Share2 className="w-3 h-3 text-zinc-500" />
              </button>
            </div>
            <User className="w-5 h-5 text-indigo-400 shrink-0" />
          </div>
        </div>

        {/* Badges Earned Section */}
        {stats.badges.length > 0 && (
          <div className="space-y-2 pt-2 text-xs font-mono">
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Earned Badges</span>
            <div className="flex flex-wrap gap-2">
              {stats.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Personal & Intelligence Vector
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Account & Security Settings
          </button>
        </div>
      </div>

      {/* TAB 1: PERSONAL & INTELLIGENCE VECTOR */}
      {activeTab === "profile" && (
        <div className="space-y-8">
          {/* Missing Fields Banner */}
          {missingFields.length > 0 && (
            <div className="p-5 rounded-3xl bg-amber-500/8 border border-amber-500/25 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Recommended Profile Enhancements</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {missingFields.map((mf, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-300 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">+</span>
                    <div>
                      <span className="font-bold text-zinc-200 block">{mf.label}</span>
                      <span className="text-[11px] text-zinc-400 font-light">{mf.tip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Form Feedback */}
          {profileState.error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center gap-3 text-xs text-red-400 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileState.error}</span>
            </div>
          )}

          {profileState.message && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileState.message}</span>
            </div>
          )}

          <form action={profileFormAction} className="space-y-8">
            <input type="hidden" name="skillsJson" value={JSON.stringify(selectedSkills)} />
            <input type="hidden" name="interestsJson" value={JSON.stringify(selectedInterests)} />

            {/* 1. Academic Credentials */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-2xl space-y-6">
              <h2 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" /> 1. Academic Identity
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" required>
                  <input
                    type="text"
                    name="fullName"
                    required
                    defaultValue={profile?.fullName || ""}
                    placeholder="e.g. Aditi Sharma"
                    className={INPUT_CLASS}
                  />
                </Field>

                <Field label="SRM Register Number">
                  <input
                    type="text"
                    name="registerNumber"
                    defaultValue={profile?.registerNumber || ""}
                    placeholder="e.g. RA2111003010123"
                    className={`${INPUT_CLASS} uppercase`}
                  />
                </Field>

                <Field label="Academic Department">
                  <select
                    name="department"
                    defaultValue={profile?.department || DEPARTMENTS[0]}
                    className={INPUT_CLASS}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Year of Study">
                  <select
                    name="yearOfStudy"
                    defaultValue={profile?.yearOfStudy?.toString() || "3"}
                    className={INPUT_CLASS}
                  >
                    <option value="1">Year 1 (Freshman)</option>
                    <option value="2">Year 2 (Sophomore)</option>
                    <option value="3">Year 3 (Junior)</option>
                    <option value="4">Year 4 (Senior)</option>
                    <option value="5">Year 5 / PG</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* 2. Interactive Skills Matrix */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-2xl space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 2. Technical Skill Matrix ({selectedSkills.length} selected)
                </h2>
              </div>
              <p className="text-xs text-zinc-400 font-light">
                Select your technical languages, frameworks, and tools to match opportunity requirements.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Search taxonomy..."
                    className={`${INPUT_CLASS} py-2 max-w-xs`}
                  />
                  <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      placeholder="Add custom skill..."
                      className={`${INPUT_CLASS} py-2`}
                    />
                    <button
                      type="button"
                      onClick={addCustomSkill}
                      className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs cursor-pointer shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                  {filteredSkills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <span>{skill}</span>
                        {isSelected ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-zinc-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Opportunity Interests */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-2xl space-y-6">
              <h2 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4" /> 3. Opportunity Interests ({selectedInterests.length} selected)
              </h2>

              <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                {INTEREST_TAXONOMY.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      type="button"
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span>{interest}</span>
                      {isSelected ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-zinc-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Career Goals */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-2xl space-y-4">
              <h2 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                4. Target Roles & Career Goals
              </h2>
              <textarea
                name="careerGoals"
                rows={3}
                defaultValue={profile?.careerGoals || ""}
                placeholder="e.g. Seeking Full-Stack SDE roles, AI research fellowships, or competitive hackathon teams..."
                className={INPUT_CLASS}
              />
            </div>

            {/* Save Vector Action */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isProfilePending}
                className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isProfilePending ? (
                  <span>Updating Vector...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Profile Vector</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Profile -> Intelligence Connection Explainer */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800/80 space-y-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-purple-400 font-bold uppercase">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>How Your Profile Powers Opportunity Intelligence</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 block">STEP 1</span>
                <span className="font-bold text-zinc-200">Profile Vector</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 block">STEP 2</span>
                <span className="font-bold text-indigo-400">Skills + Dept + Year</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 block">STEP 3</span>
                <span className="font-bold text-purple-400">Match Scoring Engine</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 block">STEP 4</span>
                <span className="font-bold text-emerald-400">Prioritized Feed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNT & SECURITY SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-8">
          {/* Account Security Feedback */}
          {passwordState.error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center gap-3 text-xs text-red-400 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordState.error}</span>
            </div>
          )}

          {passwordState.message && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordState.message}</span>
            </div>
          )}

          {/* Change Password Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-2xl space-y-6">
            <h2 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4" /> Password & Security
            </h2>

            <form action={passwordFormAction} className="space-y-4 max-w-md">
              <Field label="New Password" required>
                <input
                  type="password"
                  name="newPassword"
                  required
                  placeholder="Minimum 6 characters"
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Confirm New Password" required>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Re-enter new password"
                  className={INPUT_CLASS}
                />
              </Field>

              <button
                type="submit"
                disabled={isPasswordPending}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPasswordPending ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Session & Sign Out Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-2xl space-y-4">
            <h2 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <LogOut className="w-4 h-4 text-red-400" /> Account Session
            </h2>
            <p className="text-xs text-zinc-400 font-light">
              End your active session on this browser. You can log back in at any time.
            </p>

            <form action={signOutAction}>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 font-mono text-xs font-bold transition-all cursor-pointer"
              >
                Sign Out of Account
              </button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}

const INPUT_CLASS =
  "w-full px-4 py-3 text-xs rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all font-mono";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-mono uppercase text-zinc-300 font-bold block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
