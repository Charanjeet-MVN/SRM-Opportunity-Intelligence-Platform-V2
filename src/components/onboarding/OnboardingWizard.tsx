"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveOnboardingAction } from "@/lib/students/actions";
import { StudentProfile } from "@/types";
import { DEPARTMENTS } from "@/lib/constants";
import {
  User,
  GraduationCap,
  IdCard,
  Code,
  Target,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Compass,
  Trophy,
  Briefcase,
  FlaskConical,
  Award,
  BookOpen,
  Rocket,
  Users,
  Building,
  Presentation,
} from "lucide-react";

interface OnboardingWizardProps {
  initialProfile: StudentProfile | null;
}

const CAREER_INTERESTS = [
  "Artificial Intelligence / ML",
  "Full-Stack Web Development",
  "Cloud Computing & DevOps",
  "Cybersecurity & Hacking",
  "Data Science & Analytics",
  "Blockchain & Web3",
  "UI/UX & Product Design",
  "Open Source Development",
  "Product Management",
  "Competitive Programming",
];

const PREDEFINED_SKILLS = [
  "React",
  "Next.js",
  "Python",
  "TypeScript",
  "Node.js",
  "Java",
  "C++",
  "PyTorch",
  "TensorFlow",
  "Docker",
  "Figma",
  "AWS",
  "PostgreSQL",
  "Flutter",
  "Go",
  "Rust",
  "Git",
  "Tailwind CSS",
  "GraphQL",
];

const OPPORTUNITY_TYPES = [
  { id: "Hackathons", label: "Hackathons", icon: Trophy, desc: "Build & launch innovative prototypes" },
  { id: "Internships", label: "Internships", icon: Briefcase, desc: "Industry experience & stipends" },
  { id: "Research", label: "Research", icon: FlaskConical, desc: "Academic papers & lab projects" },
  { id: "Competitions", label: "Competitions", icon: Target, desc: "Skill contests & prize pools" },
  { id: "Workshops", label: "Workshops", icon: Presentation, desc: "Hands-on tech learning sessions" },
  { id: "Bootcamps", label: "Bootcamps", icon: Rocket, desc: "Intensive skill accelerators" },
  { id: "Scholarships", label: "Scholarships", icon: Award, desc: "Financial grants & funding" },
  { id: "Club Recruitments", label: "Club Recruitments", icon: Users, desc: "Join student leadership teams" },
  { id: "Placement Opportunities", label: "Placement Drives", icon: Building, desc: "Campus hiring & jobs" },
  { id: "Conferences", label: "Conferences", icon: BookOpen, desc: "Summit talks & networking" },
];

export default function OnboardingWizard({ initialProfile }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [fullName, setFullName] = useState(initialProfile?.fullName || "");
  const [registerNumber, setRegisterNumber] = useState(initialProfile?.registerNumber || "");
  const [department, setDepartment] = useState(initialProfile?.department || DEPARTMENTS[0]);
  const [yearOfStudy, setYearOfStudy] = useState<number>(initialProfile?.yearOfStudy || 3);
  
  const [skills, setSkills] = useState<string[]>(initialProfile?.skills || ["React", "Python"]);
  const [interests, setInterests] = useState<string[]>(initialProfile?.interests || ["Full-Stack Web Development"]);
  
  // Custom skill input state
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Preferred opportunity types (parsed from careerGoals or defaults)
  let initialPreferred: string[] = ["Hackathons", "Internships", "Competitions"];
  try {
    if (initialProfile?.careerGoals) {
      const parsed = JSON.parse(initialProfile.careerGoals);
      if (Array.isArray(parsed.preferredOpportunityTypes)) {
        initialPreferred = parsed.preferredOpportunityTypes;
      }
    }
  } catch {}

  const [preferredTypes, setPreferredTypes] = useState<string[]>(initialPreferred);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkillInput("");
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const togglePreferredType = (typeId: string) => {
    if (preferredTypes.includes(typeId)) {
      setPreferredTypes(preferredTypes.filter((t) => t !== typeId));
    } else {
      setPreferredTypes([...preferredTypes, typeId]);
    }
  };

  const validateStep1 = (): boolean => {
    setErrorMsg(null);
    if (!fullName.trim()) {
      setErrorMsg("Full Name is required.");
      return false;
    }
    if (!department) {
      setErrorMsg("Academic Department is required.");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    setErrorMsg(null);
    if (interests.length === 0) {
      setErrorMsg("Please select at least one career interest.");
      return false;
    }
    if (skills.length === 0) {
      setErrorMsg("Please select at least one technical skill.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((prev) => Math.min(3, prev + 1));
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (preferredTypes.length === 0) {
      setErrorMsg("Please select at least one preferred opportunity type.");
      return;
    }

    setErrorMsg(null);
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("registerNumber", registerNumber);
    formData.append("department", department);
    formData.append("yearOfStudy", String(yearOfStudy));
    formData.append("skillsJson", JSON.stringify(skills));
    formData.append("interestsJson", JSON.stringify(interests));
    formData.append("preferredTypesJson", JSON.stringify(preferredTypes));

    startTransition(async () => {
      await saveOnboardingAction(null, formData);
    });
  };

  const progressPercentage = Math.round((step / 3) * 100);

  return (
    <div className="space-y-6">
      {/* Step Progress Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-300 font-semibold">
            Step {step} of 3 — {step === 1 ? "Academic Identity" : step === 2 ? "Skills & Interests" : "Opportunity Preferences"}
          </span>
          <span className="text-purple-400 font-bold">{progressPercentage}% Completed</span>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            initial={{ width: `${((step - 1) / 3) * 100}%` }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-2xl backdrop-blur-xl space-y-6">
        <AnimatePresence mode="wait">
          {/* STEP 1: Academic Identity */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  Academic Profile & Credentials
                </h2>
                <p className="text-xs text-zinc-400">
                  Provide your primary academic credentials to verify eligibility for campus drives & research programs.
                </p>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. Aditi Sharma"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-sans"
                  />
                </div>

                {/* Register Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">Register Number</label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={registerNumber}
                      onChange={(e) => setRegisterNumber(e.target.value)}
                      placeholder="e.g. RA2111003010123"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Department Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">Academic Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer font-sans"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year of Study Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">Current Year of Study *</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setYearOfStudy(yr)}
                        className={`py-2 px-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                          yearOfStudy === yr
                            ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {yr === 5 ? "5th / PG" : `${yr} Yr`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Skills & Career Interests */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-400" />
                  Skills & Career Focus Vectors
                </h2>
                <p className="text-xs text-zinc-400">
                  Select your primary domain interests and technical proficiencies for multi-factor match scoring.
                </p>
              </div>

              {/* Career Interests Selectable Chips */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300 block">
                  Career & Domain Focus (Select all that apply) *
                </label>
                <div className="flex flex-wrap gap-2">
                  {CAREER_INTERESTS.map((interest) => {
                    const isSelected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-sm"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Technical Skills Selectable Chips & Custom Entry */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300 block">
                  Technical Skills & Languages *
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_SKILLS.map((skill) => {
                    const isSelected = skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Skill Input */}
                <div className="pt-2 flex items-center gap-2">
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
                    placeholder="Add custom skill (e.g. Solidity, Kubernetes)..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Opportunity Preferences */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  Preferred Opportunity Vectors
                </h2>
                <p className="text-xs text-zinc-400">
                  Select the types of opportunities you want prioritized in your intelligence discovery feed.
                </p>
              </div>

              {/* Opportunity Type Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OPPORTUNITY_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = preferredTypes.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => togglePreferredType(type.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm"
                          : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                            : "bg-zinc-900 border-zinc-800 text-zinc-500"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-semibold text-zinc-200 line-clamp-1">{type.label}</h3>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">{type.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Controls */}
        <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isPending}
              className="py-2.5 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Saving Profile...
                </span>
              ) : (
                <>
                  <span>Complete Personalization</span>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
