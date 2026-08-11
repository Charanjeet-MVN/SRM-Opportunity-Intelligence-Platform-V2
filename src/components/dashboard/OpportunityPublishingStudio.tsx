"use client";

import React, { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createOpportunityAction, OpportunityFormState } from "@/lib/opportunities/actions";
import { SKILL_TAXONOMY, DEPARTMENTS } from "@/lib/constants";
import { Club, OpportunityType } from "@/types";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import { LocationType } from "@/types";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  AlertCircle,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Layers,
  Eye,
  Users,
  CheckCircle2,
  X,
} from "lucide-react";

const OPPORTUNITY_TYPES: { value: OpportunityType; label: string; desc: string }[] = [
  { value: "hackathon", label: "Hackathon", desc: "Technical hackathons & sprint challenges" },
  { value: "internship", label: "Internship", desc: "Corporate & startup internship roles" },
  { value: "research", label: "Research Opportunity", desc: "Academic research & lab projects" },
  { value: "competition", label: "Tech Competition", desc: "Competitive programming & contests" },
  { value: "workshop", label: "Technical Workshop", desc: "Hands-on skill building & seminars" },
  { value: "bootcamp", label: "Bootcamp", desc: "Multi-day intensive training programs" },
  { value: "scholarship", label: "Scholarship / Grant", desc: "Financial aid, grants & sponsorships" },
  { value: "club_recruitment", label: "Club Recruitment Drive", desc: "Join core team or executive board" },
  { value: "placement_drive", label: "Placement Drive", desc: "Campus recruitment & hiring drives" },
  { value: "conference", label: "Conference", desc: "Academic or industry summits" },
  { value: "webinar", label: "Webinar / Talk", desc: "Guest lectures & online talks" },
  { value: "other", label: "Other Opportunity", desc: "General campus activity or event" },
];

const STEPS = [
  { id: 1, label: "Basic Info", icon: Layers },
  { id: 2, label: "Location & Link", icon: MapPin },
  { id: 3, label: "Eligibility", icon: Users },
  { id: 4, label: "Schedule", icon: Calendar },
  { id: 5, label: "Review", icon: Eye },
  { id: 6, label: "Publish", icon: Sparkles },
];

interface FormData {
  title: string;
  type: OpportunityType;
  locationType: string;
  locationAddress: string;
  summary: string;
  description: string;
  selectedSkills: string[];
  selectedDepartments: string[];
  selectedYears: number[];
  maxParticipants: string;
  applicationDeadline: string;
  eventStartDate: string;
  eventEndDate: string;
  externalUrl: string;
}

const initialFormData: FormData = {
  title: "",
  type: "hackathon",
  locationType: "in_person",
  locationAddress: "",
  summary: "",
  description: "",
  selectedSkills: [],
  selectedDepartments: [],
  selectedYears: [1, 2, 3, 4],
  maxParticipants: "",
  applicationDeadline: "",
  eventStartDate: "",
  eventEndDate: "",
  externalUrl: "",
};

interface OpportunityPublishingStudioProps {
  club: Club;
}

export default function OpportunityPublishingStudio({ club }: OpportunityPublishingStudioProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [draftRestored, setDraftRestored] = useState(false);
  const [customSkill, setCustomSkill] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [publishingPhase, setPublishingPhase] = useState<"idle" | "preparing" | "validating" | "persisting" | "complete">("idle");
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState<OpportunityFormState, globalThis.FormData>(
    createOpportunityAction,
    {}
  );

  const [, startTransition] = useTransition();

  const isVerified = club.verificationStatus === "verified";
  const localStorageKey = `srm_opp_draft_${club.id}`;

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        setDraftRestored(true);
      }
    } catch {
      // ignore JSON parse error
    }
  }, [localStorageKey]);

  // Save to localStorage on change
  useEffect(() => {
    if (formData.title || formData.description) {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(formData));
      } catch {
        // ignore storage quota error
      }
    }
  }, [formData, localStorageKey]);

  function clearDraft() {
    localStorage.removeItem(localStorageKey);
    setFormData(initialFormData);
    setDraftRestored(false);
    setStep(1);
  }

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSkill(skill: string) {
    setFormData((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter((s) => s !== skill)
        : [...prev.selectedSkills, skill],
    }));
  }

  function addCustomSkill() {
    const trimmed = customSkill.trim();
    if (trimmed && !formData.selectedSkills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        selectedSkills: [...prev.selectedSkills, trimmed],
      }));
      setCustomSkill("");
    }
  }

  function toggleDepartment(dept: string) {
    setFormData((prev) => ({
      ...prev,
      selectedDepartments: prev.selectedDepartments.includes(dept)
        ? prev.selectedDepartments.filter((d) => d !== dept)
        : [...prev.selectedDepartments, dept],
    }));
  }

  function toggleYear(year: number) {
    setFormData((prev) => ({
      ...prev,
      selectedYears: prev.selectedYears.includes(year)
        ? prev.selectedYears.filter((y) => y !== year)
        : [...prev.selectedYears, year],
    }));
  }

  function validateStep(s: number): string | null {
    if (s === 1) {
      if (!formData.title.trim()) return "Opportunity title is required.";
      if (formData.title.trim().length < 5) return "Opportunity title must be at least 5 characters.";
      if (!formData.description.trim()) return "Detailed description is required.";
      if (formData.description.trim().length < 20) return "Detailed description must be at least 20 characters.";
    }
    if (s === 2) {
      if (formData.externalUrl && !/^https?:\/\/.+/i.test(formData.externalUrl.trim())) {
        return "External registration URL must start with http:// or https://";
      }
    }
    return null;
  }

  function handleNext() {
    const err = validateStep(step);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(s + 1, 6));
  }

  function handleBack() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 1));
  }

  function handlePublish(isDraft: boolean) {
    if (!isDraft && !isVerified) {
      setStepError("Only Official Verified SRM Clubs can publish public opportunities.");
      return;
    }

    setStep(6);
    setPublishingPhase("preparing");

    setTimeout(() => {
      setPublishingPhase("validating");
      setTimeout(() => {
        setPublishingPhase("persisting");

        const fd = new globalThis.FormData();
        fd.append("title", formData.title);
        fd.append("type", formData.type);
        fd.append("locationType", formData.locationType);
        fd.append("locationAddress", formData.locationAddress);
        fd.append("summary", formData.summary);
        fd.append("description", formData.description);
        formData.selectedSkills.forEach((s) => fd.append("requiredSkills", s));
        formData.selectedDepartments.forEach((d) => fd.append("eligibleDepartments", d));
        formData.selectedYears.forEach((y) => fd.append("eligibleYears", String(y)));
        if (formData.maxParticipants) fd.append("maxParticipants", formData.maxParticipants);
        if (formData.applicationDeadline) fd.append("applicationDeadline", formData.applicationDeadline);
        if (formData.eventStartDate) fd.append("eventStartDate", formData.eventStartDate);
        if (formData.eventEndDate) fd.append("eventEndDate", formData.eventEndDate);
        if (formData.externalUrl) fd.append("externalUrl", formData.externalUrl);
        fd.append("isDraft", isDraft ? "true" : "false");

        startTransition(() => {
          formAction(fd);
          localStorage.removeItem(localStorageKey);
        });
      }, 500);
    }, 400);
  }

  const filteredSkills = SKILL_TAXONOMY.filter((s) =>
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Studio Header Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-purple-950/30 border border-zinc-800/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/25">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Publishing Studio</span>
            </div>
            <VerificationBadge status={club.verificationStatus} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
            Create Opportunity
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-xl">
            Publish a clear, trustworthy opportunity for the SRM student ecosystem as{" "}
            <span className="text-zinc-200 font-semibold">{club.name}</span>.
          </p>
        </div>

        {/* Draft Notification & Clear Option */}
        {draftRestored && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-mono">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Restored auto-saved draft</span>
            <button
              onClick={clearDraft}
              className="text-[10px] uppercase font-bold text-zinc-400 hover:text-zinc-200 underline ml-2 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Main Studio Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Studio Column: Multi-Step Editor */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Step Stepper Header */}
          <div className="p-2 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-1 overflow-x-auto scrollbar-none">
            {STEPS.map((s, idx) => {
              const isCompleted = step > s.id;
              const isActive = step === s.id;
              const Icon = s.icon;
              return (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => isCompleted && setStep(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20"
                        : isCompleted
                        ? "text-emerald-400 hover:bg-emerald-500/10"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Icon className="w-3.5 h-3.5" />}
                    <span>
                      0{s.id} — {s.label}
                    </span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-3 h-0.5 shrink-0 rounded-full ${step > s.id ? "bg-emerald-500/40" : "bg-zinc-800"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Validation Error Alert */}
          <AnimatePresence>
            {stepError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center gap-3 text-xs text-red-400"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{stepError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Server Error Alert */}
          {state?.error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center gap-3 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Step Form Panel */}
          <AnimatePresence mode="wait">
            {/* STEP 01 — BASIC INFORMATION */}
            {step === 1 && (
              <StepPanel key="step1">
                <StepTitle step={1} title="Basic Information" subtitle="Define the core title, category, and overview pitch." />

                <Field label="Opportunity Title" required>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="e.g. SRM AI & Quantum Hackathon 2026"
                    className={INPUT_CLASS}
                  />
                </Field>

                <Field label="Opportunity Category / Type" required>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-2 rounded-2xl bg-zinc-950/80 border border-zinc-800 scrollbar-none">
                    {OPPORTUNITY_TYPES.map((t) => {
                      const isSelected = formData.type === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => update("type", t.value)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-purple-600/15 border-purple-500/40 text-purple-300 shadow-md"
                              : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                          }`}
                        >
                          <span className="text-xs font-bold block text-zinc-100">{t.label}</span>
                          <span className="text-[10px] font-mono text-zinc-500 block leading-tight">{t.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Short Summary Pitch">
                  <input
                    type="text"
                    value={formData.summary}
                    onChange={(e) => update("summary", e.target.value)}
                    maxLength={200}
                    placeholder="Concise 1-2 sentence pitch summarizing key value for students..."
                    className={INPUT_CLASS}
                  />
                  <div className="flex justify-end text-[10px] font-mono text-zinc-500 pt-0.5">
                    {formData.summary.length}/200 characters
                  </div>
                </Field>

                <Field label="Detailed Description & Guidelines" required>
                  <textarea
                    value={formData.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={6}
                    placeholder="Provide full details: rules, track topics, prizes, prerequisites, application procedure..."
                    className={INPUT_CLASS}
                  />
                </Field>
              </StepPanel>
            )}

            {/* STEP 02 — DETAILS & LOCATION */}
            {step === 2 && (
              <StepPanel key="step2">
                <StepTitle step={2} title="Location & External Links" subtitle="Set venue parameters and registration destination URL." />

                <Field label="Location Mode" required>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "in_person", label: "In-Person", desc: "On SRM campus" },
                      { value: "virtual", label: "Virtual", desc: "Online / Remote" },
                      { value: "hybrid", label: "Hybrid", desc: "Campus + Online" },
                    ].map((mode) => {
                      const isSelected = formData.locationType === mode.value;
                      return (
                        <button
                          key={mode.value}
                          type="button"
                          onClick={() => update("locationType", mode.value)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-purple-600/15 border-purple-500/40 text-purple-300 font-bold"
                              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <span className="text-xs font-semibold block text-zinc-100">{mode.label}</span>
                          <span className="text-[10px] font-mono text-zinc-500">{mode.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {formData.locationType !== "virtual" && (
                  <Field label="Campus Venue / Address">
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.locationAddress}
                        onChange={(e) => update("locationAddress", e.target.value)}
                        placeholder="e.g. Tech Park Auditorium 401, Kattankulathur Campus"
                        className={`${INPUT_CLASS} pl-10`}
                      />
                    </div>
                  </Field>
                )}

                <Field label="External Registration Link (Optional)">
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      value={formData.externalUrl}
                      onChange={(e) => update("externalUrl", e.target.value)}
                      placeholder="https://unstop.com/o/your-event-slug"
                      className={`${INPUT_CLASS} pl-10`}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500">
                    If specified, students clicking &quot;Apply External&quot; will be redirected to this portal.
                  </p>
                </Field>
              </StepPanel>
            )}

            {/* STEP 03 — ELIGIBILITY & SKILLS */}
            {step === 3 && (
              <StepPanel key="step3">
                <StepTitle step={3} title="Eligibility & Skill Requirements" subtitle="Specify target departments, academic years, and recommended skills." />

                <Field label="Recommended / Required Skill Vectors">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={skillSearch}
                        onChange={(e) => setSkillSearch(e.target.value)}
                        placeholder="Search skill taxonomy..."
                        className={`${INPUT_CLASS} py-1.5`}
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={customSkill}
                          onChange={(e) => setCustomSkill(e.target.value)}
                          placeholder="Add custom skill..."
                          className={`${INPUT_CLASS} py-1.5`}
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

                    <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                      {filteredSkills.map((skill) => {
                        const isSelected = formData.selectedSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                              isSelected
                                ? "bg-purple-600 text-white font-semibold shadow-sm"
                                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Field>

                <Field label="Target SRM Departments">
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                    {DEPARTMENTS.map((dept: string) => {
                      const isSelected = formData.selectedDepartments.includes(dept);
                      return (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => toggleDepartment(dept)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 text-white font-semibold"
                              : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                          }`}
                        >
                          {dept}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500">
                    {formData.selectedDepartments.length === 0
                      ? "Empty selection = Open to ALL SRM Academic Departments"
                      : `Restricted to ${formData.selectedDepartments.length} departments`}
                  </p>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Eligible Academic Years">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4].map((year) => {
                        const isSelected = formData.selectedYears.includes(year);
                        return (
                          <button
                            key={year}
                            type="button"
                            onClick={() => toggleYear(year)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                              isSelected
                                ? "bg-purple-600 text-white font-bold shadow-sm"
                                : "bg-zinc-950 text-zinc-500 border border-zinc-800 hover:text-zinc-300"
                            }`}
                          >
                            Year {year}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <Field label="Participant Seat Capacity">
                    <input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => update("maxParticipants", e.target.value)}
                      placeholder="Leave blank for unlimited capacity"
                      className={INPUT_CLASS}
                    />
                  </Field>
                </div>
              </StepPanel>
            )}

            {/* STEP 04 — SCHEDULE */}
            {step === 4 && (
              <StepPanel key="step4">
                <StepTitle step={4} title="Schedule & Timelines" subtitle="Set application deadlines and event start/end timestamps." />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Application Deadline">
                    <input
                      type="datetime-local"
                      value={formData.applicationDeadline}
                      onChange={(e) => update("applicationDeadline", e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </Field>

                  <Field label="Event Start Date">
                    <input
                      type="datetime-local"
                      value={formData.eventStartDate}
                      onChange={(e) => update("eventStartDate", e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </Field>

                  <Field label="Event End Date">
                    <input
                      type="datetime-local"
                      value={formData.eventEndDate}
                      onChange={(e) => update("eventEndDate", e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </Field>
                </div>
              </StepPanel>
            )}

            {/* STEP 05 — REVIEW */}
            {step === 5 && (
              <StepPanel key="step5">
                <StepTitle step={5} title="Review Opportunity Parameters" subtitle="Verify all publishing details before going live." />

                <div className="space-y-4 text-xs font-mono">
                  {/* Opportunity & Basic Info */}
                  <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-bold uppercase">Basic Opportunity Info</span>
                      <button onClick={() => setStep(1)} className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer">
                        [ Edit ]
                      </button>
                    </div>
                    <div className="space-y-1 text-zinc-300">
                      <p><span className="text-zinc-500">Title:</span> {formData.title}</p>
                      <p><span className="text-zinc-500">Type:</span> {formData.type}</p>
                      {formData.summary && <p><span className="text-zinc-500">Summary:</span> {formData.summary}</p>}
                    </div>
                  </div>

                  {/* Location & External Link */}
                  <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-400 font-bold uppercase">Location & External Link</span>
                      <button onClick={() => setStep(2)} className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer">
                        [ Edit ]
                      </button>
                    </div>
                    <div className="space-y-1 text-zinc-300">
                      <p><span className="text-zinc-500">Mode:</span> {formData.locationType}</p>
                      {formData.locationAddress && <p><span className="text-zinc-500">Address:</span> {formData.locationAddress}</p>}
                      {formData.externalUrl && <p><span className="text-zinc-500">URL:</span> {formData.externalUrl}</p>}
                    </div>
                  </div>

                  {/* Eligibility & Skills */}
                  <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold uppercase">Eligibility & Skills</span>
                      <button onClick={() => setStep(3)} className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer">
                        [ Edit ]
                      </button>
                    </div>
                    <div className="space-y-1 text-zinc-300">
                      <p><span className="text-zinc-500">Skills:</span> {formData.selectedSkills.join(", ") || "None specified"}</p>
                      <p><span className="text-zinc-500">Years:</span> {formData.selectedYears.map((y) => `Year ${y}`).join(", ")}</p>
                      <p><span className="text-zinc-500">Depts:</span> {formData.selectedDepartments.join(", ") || "All SRM Departments"}</p>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold uppercase">Schedule</span>
                      <button onClick={() => setStep(4)} className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer">
                        [ Edit ]
                      </button>
                    </div>
                    <div className="space-y-1 text-zinc-300">
                      <p><span className="text-zinc-500">Deadline:</span> {formData.applicationDeadline ? new Date(formData.applicationDeadline).toLocaleString() : "Flexible / None"}</p>
                      <p><span className="text-zinc-500">Start Date:</span> {formData.eventStartDate ? new Date(formData.eventStartDate).toLocaleString() : "Not specified"}</p>
                    </div>
                  </div>
                </div>
              </StepPanel>
            )}

            {/* STEP 06 — PUBLISH TRANSITION */}
            {step === 6 && (
              <StepPanel key="step6">
                <div className="py-12 px-6 text-center space-y-6">
                  {publishingPhase !== "complete" ? (
                    <div className="space-y-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                        className="w-12 h-12 border-3 border-purple-500/20 border-t-purple-500 rounded-full mx-auto"
                      />
                      <div className="space-y-1 font-mono text-xs">
                        <p className="text-purple-300 font-bold uppercase tracking-wider animate-pulse">
                          {publishingPhase === "preparing" && "Preparing opportunity payload..."}
                          {publishingPhase === "validating" && "Validating eligibility & schedule rules..."}
                          {publishingPhase === "persisting" && "Publishing to SRM campus network..."}
                        </p>
                        <p className="text-zinc-500 text-[11px]">Writing to official Supabase database records</p>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-xl font-bold text-zinc-100">Published Successfully ✓</h2>
                        <p className="text-xs text-zinc-400">
                          Your opportunity is live and visible to students across SRM.
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-3">
                        <Link
                          href="/opportunities"
                          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/20 transition-all"
                        >
                          View Opportunity
                        </Link>
                        <Link
                          href="/dashboard/club"
                          className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-semibold hover:bg-zinc-800 transition-all"
                        >
                          Return to Workspace
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </div>
              </StepPanel>
            )}
          </AnimatePresence>

          {/* Stepper Control Footer */}
          {step < 6 && (
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs hover:bg-zinc-800 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePublish(true)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 font-mono text-xs transition-all cursor-pointer"
                >
                  Save Draft
                </button>

                {step === 5 ? (
                  <button
                    type="button"
                    disabled={isPending || (!isVerified && false)}
                    onClick={() => handlePublish(false)}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Publish Opportunity</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Studio Column: Live Student Opportunity Preview */}
        <div className="hidden lg:block w-80 xl:w-96 shrink-0 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 uppercase font-bold text-purple-400">
              <Eye className="w-3.5 h-3.5" /> Live Student Preview
            </span>
            <span className="text-[10px] text-zinc-500">Updates live from form</span>
          </div>

          <div className="sticky top-24">
            <OpportunityCard
              opportunity={{
                id: "preview-id",
                clubId: club.id,
                createdBy: "preview-user",
                title: formData.title || "Untitled Campus Opportunity",
                slug: "preview-slug",
                summary: formData.summary || "Summary pitch preview will appear here...",
                description: formData.description || "Detailed description...",
                type: formData.type,
                locationType: (formData.locationType as LocationType) || "in_person",
                locationAddress: formData.locationAddress || undefined,
                externalUrl: formData.externalUrl || undefined,
                requiredSkills: formData.selectedSkills,
                eligibleDepartments: formData.selectedDepartments,
                eligibleYears: formData.selectedYears,
                maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants, 10) : undefined,
                applicationDeadline: formData.applicationDeadline || undefined,
                eventStartDate: formData.eventStartDate || undefined,
                eventEndDate: formData.eventEndDate || undefined,
                status: "published",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                club: {
                  id: club.id,
                  name: club.name,
                  slug: club.slug,
                  logoUrl: club.logoUrl,
                  verificationStatus: club.verificationStatus,
                  createdAt: "",
                  updatedAt: "",
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Floating Mobile Preview Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setMobilePreviewOpen(true)}
          className="px-4 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold shadow-2xl shadow-purple-600/50 flex items-center gap-2 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Mobile Live Preview Drawer Modal */}
      <AnimatePresence>
        {mobilePreviewOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> Student View Preview
                </span>
                <button
                  onClick={() => setMobilePreviewOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <OpportunityCard
                opportunity={{
                  id: "preview-id",
                  clubId: club.id,
                  createdBy: "preview-user",
                  title: formData.title || "Untitled Campus Opportunity",
                  slug: "preview-slug",
                  summary: formData.summary || "Summary pitch preview will appear here...",
                  description: formData.description || "Detailed description...",
                  type: formData.type,
                  locationType: (formData.locationType as LocationType) || "in_person",
                  locationAddress: formData.locationAddress || undefined,
                  externalUrl: formData.externalUrl || undefined,
                  requiredSkills: formData.selectedSkills,
                  eligibleDepartments: formData.selectedDepartments,
                  eligibleYears: formData.selectedYears,
                  maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants, 10) : undefined,
                  applicationDeadline: formData.applicationDeadline || undefined,
                  eventStartDate: formData.eventStartDate || undefined,
                  eventEndDate: formData.eventEndDate || undefined,
                  status: "published",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  club: {
                    id: club.id,
                    name: club.name,
                    slug: club.slug,
                    logoUrl: club.logoUrl,
                    verificationStatus: club.verificationStatus,
                    createdAt: "",
                    updatedAt: "",
                  },
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SUBCOMPONENTS ──

const INPUT_CLASS =
  "w-full px-4 py-3 text-xs rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all font-mono";

function StepPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="p-6 sm:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-2xl backdrop-blur-xl space-y-6"
    >
      {children}
    </motion.div>
  );
}

function StepTitle({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="space-y-1 pb-4 border-b border-zinc-800/80">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-[11px] font-bold flex items-center justify-center">
          0{step}
        </span>
        <h2 className="text-base font-bold text-zinc-100">{title}</h2>
      </div>
      <p className="text-xs text-zinc-400 font-light">{subtitle}</p>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-mono uppercase text-zinc-300 font-bold block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
