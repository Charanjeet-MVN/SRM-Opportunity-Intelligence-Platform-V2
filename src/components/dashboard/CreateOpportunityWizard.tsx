"use client";

import React, { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createOpportunityAction, OpportunityFormState } from "@/lib/opportunities/actions";
import { SKILL_TAXONOMY } from "@/lib/constants";
import { Club, OpportunityType } from "@/types";
import VerificationBadge from "@/components/clubs/VerificationBadge";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  AlertCircle,
  ShieldAlert,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Layers,
  Eye,
  Clock,
  Users,
  CheckCircle2,
  Building2,
  Bookmark,
} from "lucide-react";

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

const STEPS = [
  { id: 1, label: "Basics", icon: Layers },
  { id: 2, label: "Eligibility", icon: Users },
  { id: 3, label: "Schedule", icon: Calendar },
  { id: 4, label: "Review", icon: Eye },
];

interface FormData {
  title: string;
  type: OpportunityType;
  locationType: string;
  locationAddress: string;
  summary: string;
  description: string;
  selectedSkills: string[];
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
  selectedYears: [1, 2, 3, 4],
  maxParticipants: "",
  applicationDeadline: "",
  eventStartDate: "",
  eventEndDate: "",
  externalUrl: "",
};

interface CreateOpportunityWizardProps {
  club: Club;
}

export default function CreateOpportunityWizard({ club }: CreateOpportunityWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string; isDraft: boolean } | null>(null);

  const [state, formAction, isPending] = useActionState<OpportunityFormState, globalThis.FormData>(
    createOpportunityAction,
    {}
  );

  const isVerified = club.verificationStatus === "verified";

  // Watch for successful submission
  useEffect(() => {
    if (state?.success) {
      setPublishResult({ success: true, message: state.message || "Published successfully!", isDraft: false });
    }
  }, [state]);

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
      if (!formData.description.trim()) return "Description is required.";
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
    setStep((s) => Math.min(s + 1, 4));
  }

  function handleBack() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 1));
  }

  const [stepError, setStepError] = useState<string | null>(null);

  // Build the real FormData for submission
  function buildRealFormData(isDraft: boolean) {
    const fd = new globalThis.FormData();
    fd.append("title", formData.title);
    fd.append("type", formData.type);
    fd.append("locationType", formData.locationType);
    fd.append("locationAddress", formData.locationAddress);
    fd.append("summary", formData.summary);
    fd.append("description", formData.description);
    formData.selectedSkills.forEach((s) => fd.append("requiredSkills", s));
    formData.selectedYears.forEach((y) => fd.append("eligibleYears", String(y)));
    if (formData.maxParticipants) fd.append("maxParticipants", formData.maxParticipants);
    if (formData.applicationDeadline) fd.append("applicationDeadline", formData.applicationDeadline);
    if (formData.eventStartDate) fd.append("eventStartDate", formData.eventStartDate);
    if (formData.eventEndDate) fd.append("eventEndDate", formData.eventEndDate);
    if (formData.externalUrl) fd.append("externalUrl", formData.externalUrl);
    fd.append("isDraft", isDraft ? "true" : "false");
    return fd;
  }

  // ──────────── SUCCESS SCREEN ────────────
  if (publishResult?.success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-xl mx-auto py-20 text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mx-auto"
        >
          <CheckCircle2 className="w-9 h-9 text-emerald-400" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-zinc-100">Opportunity Published</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {publishResult.message || "Your opportunity is now live on the SRM platform and visible to students."}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>View Opportunity</span>
          </Link>
          <button
            onClick={() => {
              setFormData(initialFormData);
              setStep(1);
              setPublishResult(null);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Create Another</span>
          </button>
          <Link
            href="/dashboard/club"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Workspace</span>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Form Column */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-zinc-100 tracking-tight">Post New Opportunity</h1>
            <VerificationBadge status={club.verificationStatus} />
          </div>
          <p className="text-xs text-zinc-400">Publishing as <span className="text-zinc-200 font-semibold">{club.name}</span></p>
        </div>

        {/* Unverified Warning */}
        {!isVerified && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-amber-500/8 border border-amber-500/25 text-xs text-amber-400">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Unverified Organization</strong>
              You can save as draft, but public publishing requires verified status.{" "}
              <Link href="/dashboard/club/verification" className="underline hover:text-amber-300">Request verification →</Link>
            </div>
          </div>
        )}

        {/* Step Progress Bar */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, idx) => {
            const isCompleted = step > s.id;
            const isActive = step === s.id;
            const Icon = s.icon;
            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => isCompleted && setStep(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : isCompleted
                      ? "text-emerald-400 hover:bg-emerald-500/10"
                      : "text-zinc-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded-full ${step > s.id ? "bg-emerald-500/50" : "bg-zinc-800"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Error */}
        <AnimatePresence>
          {stepError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{stepError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Server error */}
        {state?.error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepPanel key="step1">
              <StepTitle step={1} title="Basic Information" />

              <Field label="Opportunity Title" required>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. SRM AI Hackathon 2026"
                  className={INPUT_CLASS}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Opportunity Type" required>
                  <select
                    value={formData.type}
                    onChange={(e) => update("type", e.target.value as OpportunityType)}
                    className={INPUT_CLASS}
                  >
                    {OPPORTUNITY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Location Mode" required>
                  <select
                    value={formData.locationType}
                    onChange={(e) => update("locationType", e.target.value)}
                    className={INPUT_CLASS}
                  >
                    <option value="in_person">In-Person (On Campus)</option>
                    <option value="virtual">Virtual / Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </Field>
              </div>

              <Field label="Venue / Address">
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={formData.locationAddress}
                    onChange={(e) => update("locationAddress", e.target.value)}
                    placeholder="e.g. Tech Park Auditorium 401, Kattankulathur"
                    className={`${INPUT_CLASS} pl-9`}
                  />
                </div>
              </Field>

              <Field label="Short Pitch / Summary">
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => update("summary", e.target.value)}
                  maxLength={200}
                  placeholder="1-2 sentences: why should students participate?"
                  className={INPUT_CLASS}
                />
                <p className="text-[10px] text-zinc-600 font-mono mt-1">{formData.summary.length}/200</p>
              </Field>

              <Field label="Full Description" required>
                <textarea
                  value={formData.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={6}
                  placeholder="Detailed guidelines, rules, prizes, eligibility, application instructions..."
                  className={INPUT_CLASS}
                />
              </Field>
            </StepPanel>
          )}

          {step === 2 && (
            <StepPanel key="step2">
              <StepTitle step={2} title="Eligibility & Required Skills" />

              <Field label="Required / Recommended Skills">
                <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  {SKILL_TAXONOMY.map((skill) => {
                    const selected = formData.selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                          selected
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
                {formData.selectedSkills.length > 0 && (
                  <p className="text-[10px] text-indigo-400 font-mono mt-1.5">
                    {formData.selectedSkills.length} selected: {formData.selectedSkills.slice(0, 5).join(", ")}
                    {formData.selectedSkills.length > 5 ? ` +${formData.selectedSkills.length - 5} more` : ""}
                  </p>
                )}
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Eligible Academic Years">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((year) => {
                      const selected = formData.selectedYears.includes(year);
                      return (
                        <button
                          key={year}
                          type="button"
                          onClick={() => toggleYear(year)}
                          className={`flex-1 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                            selected
                              ? "bg-indigo-600 text-white font-semibold"
                              : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          Y{year}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Max Participants">
                  <div className="relative">
                    <Users className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => update("maxParticipants", e.target.value)}
                      placeholder="Unlimited if empty"
                      className={`${INPUT_CLASS} pl-9`}
                    />
                  </div>
                </Field>
              </div>
            </StepPanel>
          )}

          {step === 3 && (
            <StepPanel key="step3">
              <StepTitle step={3} title="Schedule & External Link" />

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

              <Field label="External Registration Link">
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="url"
                    value={formData.externalUrl}
                    onChange={(e) => update("externalUrl", e.target.value)}
                    placeholder="https://unstop.com/o/your-event"
                    className={`${INPUT_CLASS} pl-9`}
                  />
                </div>
              </Field>
            </StepPanel>
          )}

          {step === 4 && (
            <StepPanel key="step4">
              <StepTitle step={4} title="Review & Publish" />

              {/* Review Summary */}
              <div className="space-y-3">
                <ReviewRow label="Title" value={formData.title} />
                <ReviewRow label="Type" value={OPPORTUNITY_TYPES.find((t) => t.value === formData.type)?.label || formData.type} />
                <ReviewRow label="Location" value={`${formData.locationType.replace("_", " ")} ${formData.locationAddress ? `— ${formData.locationAddress}` : ""}`} />
                {formData.summary && <ReviewRow label="Summary" value={formData.summary} />}
                <ReviewRow label="Description" value={`${formData.description.slice(0, 100)}${formData.description.length > 100 ? "..." : ""}`} />
                {formData.selectedSkills.length > 0 && (
                  <ReviewRow label="Skills" value={formData.selectedSkills.join(", ")} />
                )}
                <ReviewRow label="Eligible Years" value={formData.selectedYears.map((y) => `Year ${y}`).join(", ")} />
                {formData.maxParticipants && <ReviewRow label="Max Participants" value={formData.maxParticipants} />}
                {formData.applicationDeadline && (
                  <ReviewRow label="Application Deadline" value={new Date(formData.applicationDeadline).toLocaleString()} />
                )}
                {formData.eventStartDate && (
                  <ReviewRow label="Event Start" value={new Date(formData.eventStartDate).toLocaleString()} />
                )}
                {formData.externalUrl && <ReviewRow label="External Link" value={formData.externalUrl} />}
              </div>

              {/* Hidden fields for form submission */}
              <form id="opportunity-form" action={formAction} className="hidden">
                <input name="title" value={formData.title} readOnly />
                <input name="type" value={formData.type} readOnly />
                <input name="locationType" value={formData.locationType} readOnly />
                <input name="locationAddress" value={formData.locationAddress} readOnly />
                <input name="summary" value={formData.summary} readOnly />
                <input name="description" value={formData.description} readOnly />
                {formData.selectedSkills.map((s) => <input key={s} name="requiredSkills" value={s} readOnly />)}
                {formData.selectedYears.map((y) => <input key={y} name="eligibleYears" value={y} readOnly />)}
                {formData.maxParticipants && <input name="maxParticipants" value={formData.maxParticipants} readOnly />}
                {formData.applicationDeadline && <input name="applicationDeadline" value={formData.applicationDeadline} readOnly />}
                {formData.eventStartDate && <input name="eventStartDate" value={formData.eventStartDate} readOnly />}
                {formData.eventEndDate && <input name="eventEndDate" value={formData.eventEndDate} readOnly />}
                {formData.externalUrl && <input name="externalUrl" value={formData.externalUrl} readOnly />}
              </form>
            </StepPanel>
          )}
        </AnimatePresence>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium text-xs disabled:opacity-40 hover:bg-zinc-800 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            {step === 4 ? (
              <>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => formAction(buildRealFormData(true))}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={isPending || !isVerified}
                  onClick={() => formAction(buildRealFormData(false))}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span>Publishing…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Publish Opportunity</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Column (desktop only) */}
      <div className="hidden lg:block w-80 xl:w-96 shrink-0">
        <div className="sticky top-24 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Student Preview</span>
          </div>
          <LivePreview formData={formData} club={club} />
        </div>
      </div>
    </div>
  );
}

// ── SUBCOMPONENTS ──

const INPUT_CLASS =
  "w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all";

function StepPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-5"
    >
      {children}
    </motion.div>
  );
}

function StepTitle({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b border-zinc-800/60">
      <span className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-[11px] font-bold flex items-center justify-center font-mono">
        {step}
      </span>
      <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">{title}</h2>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-300 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-zinc-800/50 last:border-0">
      <span className="text-[11px] font-mono text-zinc-500 w-28 shrink-0">{label}</span>
      <span className="text-xs text-zinc-200 leading-relaxed">{value || "—"}</span>
    </div>
  );
}

function LivePreview({ formData, club }: { formData: FormData; club: Club }) {
  const typeMeta = OPPORTUNITY_TYPES.find((t) => t.value === formData.type) || OPPORTUNITY_TYPES[0];
  const hasDeadline = !!formData.applicationDeadline;
  const daysLeft = hasDeadline
    ? Math.ceil((new Date(formData.applicationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      layout
      className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden shadow-xl"
    >
      {/* Preview top accent */}
      <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 font-mono capitalize">
            {typeMeta.label}
          </span>
          <Bookmark className="w-4 h-4 text-zinc-600" />
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-zinc-100 leading-snug min-h-[2rem]">
          {formData.title || <span className="text-zinc-600 font-normal italic">Opportunity title will appear here...</span>}
        </h3>

        {/* Club */}
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <Building2 className="w-3.5 h-3.5 text-zinc-500" />
          <span>by {club.name}</span>
          {club.verificationStatus === "verified" && (
            <span className="text-blue-400 font-semibold">✓ Official</span>
          )}
        </div>

        {/* Summary */}
        {formData.summary ? (
          <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3">{formData.summary}</p>
        ) : formData.description ? (
          <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-3 italic">{formData.description.slice(0, 120)}...</p>
        ) : null}

        {/* Deadline chip */}
        {hasDeadline && daysLeft !== null && (
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border font-mono ${
              daysLeft <= 3 ? "text-amber-400 bg-amber-500/10 border-amber-500/30" : "text-zinc-400 bg-zinc-950 border-zinc-800"
            }`}>
              <Clock className="w-3 h-3" />
              {daysLeft > 0 ? `${daysLeft}d remaining` : "Closing today"}
            </span>
          </div>
        )}

        {/* Skills preview */}
        {formData.selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {formData.selectedSkills.slice(0, 4).map((s) => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono">
                {s}
              </span>
            ))}
            {formData.selectedSkills.length > 4 && (
              <span className="text-[10px] text-zinc-500 font-mono">+{formData.selectedSkills.length - 4}</span>
            )}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
          <MapPin className="w-3 h-3" />
          <span className="capitalize">{formData.locationType.replace("_", " ")}</span>
          {formData.locationAddress && (
            <span className="text-zinc-600 truncate"> — {formData.locationAddress}</span>
          )}
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="w-full py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/25 text-indigo-400 text-xs font-semibold text-center">
          View Details →
        </div>
      </div>
    </motion.div>
  );
}
