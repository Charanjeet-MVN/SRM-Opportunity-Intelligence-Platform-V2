"use client";

import React, { useActionState, useEffect, useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
  ArrowRight,
  GraduationCap,
  Sliders,
  ShieldCheck,
  Compass,
  Layers,
  Search,
  RotateCcw,
  Info,
  Check,
  KeyRound,
  FileCode2,
} from "lucide-react";

interface StudentProfileSettingsClientProps {
  initialProfile: StudentProfile | null;
  userEmail?: string;
}

export default function StudentProfileSettingsClient({
  initialProfile,
  userEmail,
}: StudentProfileSettingsClientProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<"personalization" | "security">("personalization");

  // Local saved profile source of truth
  const [savedProfile, setSavedProfile] = useState<StudentProfile | null>(initialProfile);

  // Form Field States
  const [fullName, setFullName] = useState(initialProfile?.fullName || "");
  const [registerNumber, setRegisterNumber] = useState(initialProfile?.registerNumber || "");
  const [department, setDepartment] = useState(initialProfile?.department || DEPARTMENTS[0]);
  const [yearOfStudy, setYearOfStudy] = useState<number>(initialProfile?.yearOfStudy || 3);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialProfile?.skills || []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialProfile?.interests || []);
  const [careerGoals, setCareerGoals] = useState(initialProfile?.careerGoals || "");

  // Taxonomy Search and Custom Input
  const [skillSearch, setSkillSearch] = useState("");
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Server Action States
  const [profileState, profileFormAction, isProfilePending] = useActionState<
    StudentProfileFormState,
    FormData
  >(updateStudentProfileAction, {});

  const [passwordState, passwordFormAction, isPasswordPending] = useActionState<
    StudentProfileFormState,
    FormData
  >(updateStudentPasswordAction, {});

  // Sync state when server action returns updated profile
  useEffect(() => {
    if (profileState.profile) {
      setSavedProfile(profileState.profile);
      setFullName(profileState.profile.fullName || "");
      setRegisterNumber(profileState.profile.registerNumber || "");
      setDepartment(profileState.profile.department || DEPARTMENTS[0]);
      setYearOfStudy(profileState.profile.yearOfStudy || 3);
      setSelectedSkills(profileState.profile.skills || []);
      setSelectedInterests(profileState.profile.interests || []);
      setCareerGoals(profileState.profile.careerGoals || "");
      setValidationError(null);
    }
  }, [profileState.profile]);

  // Determine dirty state (unsaved modifications)
  const isDirty = useMemo(() => {
    const orig = savedProfile;
    const origFullName = orig?.fullName || "";
    const origReg = orig?.registerNumber || "";
    const origDept = orig?.department || DEPARTMENTS[0];
    const origYear = orig?.yearOfStudy || 3;
    const origGoals = orig?.careerGoals || "";
    const origSkills = orig?.skills || [];
    const origInterests = orig?.interests || [];

    if (fullName.trim() !== origFullName.trim()) return true;
    if (registerNumber.trim().toUpperCase() !== origReg.trim().toUpperCase()) return true;
    if (department !== origDept) return true;
    if (yearOfStudy !== origYear) return true;
    if (careerGoals.trim() !== origGoals.trim()) return true;

    // Arrays compare
    if (selectedSkills.length !== origSkills.length) return true;
    const sortedSkills = [...selectedSkills].sort();
    const sortedOrigSkills = [...origSkills].sort();
    if (sortedSkills.some((s, idx) => s !== sortedOrigSkills[idx])) return true;

    if (selectedInterests.length !== origInterests.length) return true;
    const sortedInterests = [...selectedInterests].sort();
    const sortedOrigInterests = [...origInterests].sort();
    if (sortedInterests.some((i, idx) => i !== sortedOrigInterests[idx])) return true;

    return false;
  }, [
    savedProfile,
    fullName,
    registerNumber,
    department,
    yearOfStudy,
    careerGoals,
    selectedSkills,
    selectedInterests,
  ]);

  // Reset form back to saved profile
  const handleDiscardChanges = () => {
    if (!savedProfile) return;
    setFullName(savedProfile.fullName || "");
    setRegisterNumber(savedProfile.registerNumber || "");
    setDepartment(savedProfile.department || DEPARTMENTS[0]);
    setYearOfStudy(savedProfile.yearOfStudy || 3);
    setSelectedSkills(savedProfile.skills || []);
    setSelectedInterests(savedProfile.interests || []);
    setCareerGoals(savedProfile.careerGoals || "");
    setValidationError(null);
  };

  // Skill manipulations
  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  const addCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedSkills((prev) => [...prev, trimmed]);
      setCustomSkillInput("");
    }
  };

  // Interest manipulations
  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  // Real, deterministic completeness calculation
  const completeness = useMemo(() => {
    let score = 0;
    if (fullName.trim().length >= 2) score += 20;
    if (registerNumber.trim().length >= 5) score += 15;
    if (department) score += 15;
    if (yearOfStudy >= 1 && yearOfStudy <= 5) score += 10;
    if (selectedSkills.length >= 3) score += 20;
    else if (selectedSkills.length > 0) score += 10;
    if (selectedInterests.length >= 2) score += 10;
    else if (selectedInterests.length > 0) score += 5;
    if (careerGoals.trim().length >= 10) score += 10;
    else if (careerGoals.trim().length > 0) score += 5;
    return Math.min(100, score);
  }, [fullName, registerNumber, department, yearOfStudy, selectedSkills, selectedInterests, careerGoals]);

  // Actionable missing fields list
  const missingSignals = useMemo(() => {
    const list: { label: string; impact: string; actionAnchor: string }[] = [];
    if (!fullName.trim() || fullName.trim().length < 2) {
      list.push({
        label: "Full Name",
        impact: "Required for official event registration and certificate generation.",
        actionAnchor: "field-fullName",
      });
    }
    if (!registerNumber.trim()) {
      list.push({
        label: "SRM Register Number",
        impact: "Enables automated campus credentials & club eligibility verification.",
        actionAnchor: "field-registerNumber",
      });
    }
    if (!department) {
      list.push({
        label: "Academic Department",
        impact: "Crucial for departmental opportunity filtering (up to 20% match weight).",
        actionAnchor: "field-department",
      });
    }
    if (!yearOfStudy) {
      list.push({
        label: "Year of Study",
        impact: "Enables batch-specific opportunity eligibility (up to 15% match weight).",
        actionAnchor: "field-yearOfStudy",
      });
    }
    if (selectedSkills.length < 3) {
      list.push({
        label: "Technical Skills (Min 3)",
        impact: "Primary signal for opportunity relevance matching (up to 50% match weight).",
        actionAnchor: "field-skills",
      });
    }
    if (selectedInterests.length < 2) {
      list.push({
        label: "Opportunity Interests (Min 2)",
        impact: "Prioritizes event categories (Hackathons, Internships, Research) in your feed.",
        actionAnchor: "field-interests",
      });
    }
    if (!careerGoals.trim()) {
      list.push({
        label: "Career Goals & Target Roles",
        impact: "Informs the AI synthesis engine when preparing tailored fit summaries.",
        actionAnchor: "field-careerGoals",
      });
    }
    return list;
  }, [fullName, registerNumber, department, yearOfStudy, selectedSkills, selectedInterests, careerGoals]);

  // Filtered skills taxonomy
  const filteredTaxonomy = useMemo(() => {
    if (!skillSearch.trim()) return SKILL_TAXONOMY;
    const q = skillSearch.toLowerCase().trim();
    return SKILL_TAXONOMY.filter((s) => s.toLowerCase().includes(q));
  }, [skillSearch]);

  // Signal Readiness tier
  const signalQuality = useMemo(() => {
    if (completeness >= 85) {
      return {
        label: "Optimal Relevance Signals",
        badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
        barGradient: "from-purple-500 via-indigo-400 to-emerald-400",
        description: "Your personalization vector is fully calibrated for precision matching.",
      };
    }
    if (completeness >= 60) {
      return {
        label: "Strong Matching Vector",
        badgeClass: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
        barGradient: "from-purple-500 to-indigo-400",
        description: "Good match coverage. Complete missing signals to maximize opportunity relevance.",
      };
    }
    return {
      label: "Basic Signals Configured",
      badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      barGradient: "from-amber-500 to-purple-500",
      description: "Add your core skills and interests to power personalized recommendations.",
    };
  }, [completeness]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      e.preventDefault();
      setValidationError("Full Name must be at least 2 characters.");
      return;
    }
    setValidationError(null);
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* 1. PERSONALIZATION CONTROL CENTER HEADER */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900/95 via-zinc-950/90 to-purple-950/20 border border-zinc-800/80 shadow-2xl backdrop-blur-2xl overflow-hidden space-y-6">
        {/* Ambient Backlight */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Pill / Status Line */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900/90 border border-zinc-800 text-zinc-300 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                </span>
                <span className="text-purple-400 font-semibold uppercase tracking-wider text-[9px]">
                  Personalization Control Center
                </span>
                <span className="text-zinc-600">•</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-zinc-400 text-[10px]">Private Student Context</span>
              </div>

              {savedProfile?.department && (
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-zinc-900/80 border border-zinc-800 text-indigo-300">
                  {savedProfile.department}
                </span>
              )}

              {savedProfile?.yearOfStudy && (
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-zinc-900/80 border border-zinc-800 text-purple-300">
                  Year {savedProfile.yearOfStudy}
                </span>
              )}
            </div>

            {/* Dirty State Indicator */}
            {isDirty && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/25 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Unsaved Modifications</span>
              </span>
            )}
          </div>

          {/* Avatar + Student Identity + Intelligence Gauge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-black text-indigo-400 text-2xl sm:text-3xl shrink-0 shadow-2xl">
                {fullName ? fullName.charAt(0).toUpperCase() : "S"}
              </div>

              <div className="space-y-1">
                <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  {fullName || "Student User"}
                </h1>
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 flex-wrap">
                  {userEmail && <span>{userEmail}</span>}
                  {registerNumber && (
                    <>
                      <span className="text-zinc-600 hidden sm:inline">•</span>
                      <span className="text-zinc-300">Reg: {registerNumber}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Signal Readiness Gauge */}
            <div className="w-full md:w-64 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2.5 shrink-0 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 font-bold uppercase text-[10px]">Signal Readiness</span>
                <span className="text-purple-400 font-bold">{completeness}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${signalQuality.barGradient} transition-all duration-500`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-zinc-400 leading-tight">
                {signalQuality.description}
              </p>
            </div>
          </div>

          {/* Navigation Tab Switcher */}
          <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/70">
            <button
              onClick={() => setActiveTab("personalization")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "personalization"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Personalization Signals</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "security"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Account & Security</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: PERSONALIZATION SIGNALS & RELEVANCE ENGINE CONTROLS */}
      {activeTab === "personalization" && (
        <div className="space-y-8">
          {/* 2. PROFILE SIGNALS & RECOMMENDATION BRIDGE */}
          <div className="p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800/80 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-purple-400 tracking-wider">
                  <Zap className="w-4 h-4" />
                  <span>Your Profile Signals Status</span>
                </div>
                <p className="text-xs text-zinc-400 font-light">
                  These 4 active signal vectors directly calibrate the SOIP deterministic match scoring engine.
                </p>
              </div>

              {/* Direct CTA to Discover / For You */}
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>See Your Recommendations</span>
                <ArrowRight className="w-3 h-3 text-indigo-400" />
              </Link>
            </div>

            {/* Signal Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Skills Vector</span>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="text-base font-bold text-zinc-100">
                  {selectedSkills.length} Verified
                </div>
                <span className="text-[10px] text-zinc-400 block">Up to 50% match score</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Domain Interests</span>
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-base font-bold text-zinc-100">
                  {selectedInterests.length} Active
                </div>
                <span className="text-[10px] text-zinc-400 block">Ranks event formats</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Academic Eligibility</span>
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-base font-bold text-zinc-100">
                  Year {yearOfStudy}
                </div>
                <span className="text-[10px] text-zinc-400 truncate block">{department}</span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Signal Precision</span>
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-base font-bold text-zinc-100">
                  {completeness >= 85 ? "Optimal" : completeness >= 60 ? "Strong" : "Basic"}
                </div>
                <span className="text-[10px] text-zinc-400 block">{completeness}% coverage</span>
              </div>
            </div>
          </div>

          {/* 3. MISSING SIGNALS & ACTIONABLE COMPLETION BANNER */}
          {missingSignals.length > 0 && (
            <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/8 border border-amber-500/25 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Actionable Signals Needed to Maximize Match Precision</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  {missingSignals.length} enhancement{missingSignals.length === 1 ? "" : "s"} remaining
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {missingSignals.map((mf, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 text-zinc-300 flex items-start gap-2.5 shadow-sm"
                  >
                    <span className="text-amber-400 font-bold text-sm shrink-0">+</span>
                    <div className="space-y-0.5">
                      <span className="font-bold text-zinc-200 block">{mf.label}</span>
                      <span className="text-[11px] text-zinc-400 font-light leading-relaxed block">
                        {mf.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {validationError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center gap-3 text-xs text-red-400 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

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

          {/* 4. MAIN EDITABLE PERSONALIZATION FORM */}
          <form action={profileFormAction} onSubmit={handleFormSubmit} className="space-y-8">
            <input type="hidden" name="skillsJson" value={JSON.stringify(selectedSkills)} />
            <input type="hidden" name="interestsJson" value={JSON.stringify(selectedInterests)} />

            {/* SECTION 1: ACADEMIC IDENTITY & ELIGIBILITY VECTOR */}
            <div
              id="field-academic"
              className="p-6 sm:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-2xl space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" /> 1. Academic Identity & Eligibility Parameters
                </h2>
                <p className="text-xs text-zinc-400 font-light">
                  Your department and year determine eligibility criteria for campus hackathons, research fellowships, and recruitment drives.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" required>
                  <input
                    id="field-fullName"
                    type="text"
                    name="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aditi Sharma"
                    className={INPUT_CLASS}
                  />
                </Field>

                <Field label="SRM Register Number">
                  <input
                    id="field-registerNumber"
                    type="text"
                    name="registerNumber"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. RA2111003010123"
                    className={`${INPUT_CLASS} uppercase`}
                  />
                </Field>

                <Field label="Academic Department">
                  <select
                    id="field-department"
                    name="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
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
                    id="field-yearOfStudy"
                    name="yearOfStudy"
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(parseInt(e.target.value, 10))}
                    className={INPUT_CLASS}
                  >
                    <option value={1}>Year 1 (Freshman)</option>
                    <option value={2}>Year 2 (Sophomore)</option>
                    <option value={3}>Year 3 (Junior)</option>
                    <option value={4}>Year 4 (Senior)</option>
                    <option value={5}>Year 5 / PG / Dual Degree</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* SECTION 2: TECHNICAL SKILL MATRIX */}
            <div
              id="field-skills"
              className="p-6 sm:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-1">
                  <h2 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> 2. Technical Skill Matrix ({selectedSkills.length} active)
                  </h2>
                  <p className="text-xs text-zinc-400 font-light">
                    Skill vectors carry up to 50% weighting in opportunity relevance calculation. Select or add tools you actively know.
                  </p>
                </div>
              </div>

              {/* Active Selected Skills Tags */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider block">
                  Your Active Skills ({selectedSkills.length})
                </span>
                {selectedSkills.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-zinc-950/60 border border-dashed border-zinc-800 text-center text-xs text-zinc-500 font-mono">
                    No skills added yet. Choose from the taxonomy below or type a custom skill.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/90 min-h-[50px] items-center">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-xl text-xs font-mono bg-purple-600/20 text-purple-200 border border-purple-500/30 flex items-center gap-2 shadow-sm"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-400 transition-colors cursor-pointer"
                          aria-label={`Remove skill ${skill}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Search & Custom Skill Adder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Search skill taxonomy..."
                      className={`${INPUT_CLASS} pl-9 py-2.5 text-xs`}
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomSkill();
                        }
                      }}
                      placeholder="Add custom skill..."
                      className={`${INPUT_CLASS} py-2.5 text-xs`}
                    />
                    <button
                      type="button"
                      onClick={addCustomSkill}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold cursor-pointer shrink-0 transition-all shadow-md shadow-purple-600/20"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Taxonomy Chips Picker */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-wider block">
                    Supported Taxonomy Suggestions
                  </span>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                    {filteredTaxonomy.map((skill) => {
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
                          {isSelected ? (
                            <Check className="w-3 h-3 text-purple-200" />
                          ) : (
                            <Plus className="w-3 h-3 text-zinc-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: OPPORTUNITY INTERESTS */}
            <div
              id="field-interests"
              className="p-6 sm:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-2xl space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4" /> 3. Opportunity Interests & Preferred Formats ({selectedInterests.length} selected)
                </h2>
                <p className="text-xs text-zinc-400 font-light">
                  Interests prioritize event categories (Hackathons, Internships, Research, Workshops) in your feed.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                {INTEREST_TAXONOMY.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      type="button"
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span>{interest}</span>
                      {isSelected ? (
                        <Check className="w-3 h-3 text-emerald-200" />
                      ) : (
                        <Plus className="w-3 h-3 text-zinc-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: CAREER GOALS & TARGET ROLES */}
            <div
              id="field-careerGoals"
              className="p-6 sm:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-2xl space-y-4"
            >
              <div className="space-y-1">
                <h2 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-purple-400" /> 4. Target Roles & Career Objectives
                </h2>
                <p className="text-xs text-zinc-400 font-light">
                  Synthesizes AI opportunity briefs and personalized suitability explanations.
                </p>
              </div>

              <textarea
                name="careerGoals"
                rows={3}
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                placeholder="e.g. Seeking Full-Stack SDE internships, AI research fellowships in LLM agents, or competitive national hackathon teams..."
                className={INPUT_CLASS}
              />
            </div>

            {/* SAVE / DISCARD CONTROLS BAR */}
            <div className="sticky bottom-6 z-30 p-4 sm:p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                {isDirty ? (
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>You have unsaved changes.</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>All personalization signals synchronized.</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {isDirty && (
                  <button
                    type="button"
                    onClick={handleDiscardChanges}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Discard</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isProfilePending}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isProfilePending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Signals...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Personalization Signals</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* 5. PERSONALIZATION ENGINE PIPELINE EXPLAINER */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800/80 space-y-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-wider">
              <Info className="w-4 h-4" />
              <span>How Your Signals Power the Relevance Engine</span>
            </div>

            <p className="text-zinc-400 font-light leading-relaxed">
              Your profile serves as the deterministic vector calibrated against published campus opportunities. Matches are calculated transparently without black-box alterations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center pt-2">
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 block">VECTOR 1 (50%)</span>
                <span className="font-bold text-indigo-400 block">Technical Skills</span>
                <span className="text-[10px] text-zinc-400 font-light">Direct prerequisite overlap</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 block">VECTOR 2 (20%)</span>
                <span className="font-bold text-purple-400 block">Department</span>
                <span className="text-[10px] text-zinc-400 font-light">Academic eligibility gate</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 block">VECTOR 3 (15%)</span>
                <span className="font-bold text-emerald-400 block">Year of Study</span>
                <span className="text-[10px] text-zinc-400 font-light">Batch-specific suitability</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-500 block">VECTOR 4 (15%)</span>
                <span className="font-bold text-amber-400 block">Interests & Urgency</span>
                <span className="text-[10px] text-zinc-400 font-light">Format affinity & deadline</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNT & SECURITY SETTINGS */}
      {activeTab === "security" && (
        <div className="space-y-8">
          {/* Feedback messages */}
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
            <div className="space-y-1">
              <h2 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> Password & Security
              </h2>
              <p className="text-xs text-zinc-400 font-light">
                Update your account credentials. Must be at least 6 characters in length.
              </p>
            </div>

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
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isPasswordPending ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Session & Sign Out Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-2xl space-y-4">
            <div className="space-y-1">
              <h2 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <LogOut className="w-4 h-4 text-red-400" /> Active Session & Authentication
              </h2>
              <p className="text-xs text-zinc-400 font-light">
                Authenticated as <strong className="text-zinc-200">{userEmail || "SRM Student"}</strong>. End your active session on this device securely.
              </p>
            </div>

            <form action={signOutAction}>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 font-mono text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Account</span>
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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-mono uppercase text-zinc-300 font-bold block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
