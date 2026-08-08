import { StudentProfile, Opportunity } from "@/types";

export interface RelevanceScoreResult {
  totalScore: number; // 0 - 100
  matchedSkills: string[];
  missingSkills: string[];
  isDepartmentEligible: boolean;
  isYearEligible: boolean;
  skillMatchPercentage: number;
  daysRemaining?: number;
  rationale: string[];
}

/**
 * Deterministic Relevance & Suitability Scoring Engine
 * Computes a score from 0 to 100 for a given student profile and opportunity.
 */
export function calculateOpportunityRelevance(
  profile: StudentProfile | null | undefined,
  opportunity: Opportunity
): RelevanceScoreResult {
  // Default score for guests / unauthenticated users
  if (!profile) {
    const isClosingSoon = opportunity.applicationDeadline
      ? (new Date(opportunity.applicationDeadline).getTime() - Date.now()) / (1000 * 3600 * 24) <= 7
      : false;

    return {
      totalScore: 50,
      matchedSkills: [],
      missingSkills: opportunity.requiredSkills || [],
      isDepartmentEligible: true,
      isYearEligible: true,
      skillMatchPercentage: 0,
      rationale: [
        opportunity.isOfficial ? "Official SRM Verified Club Event" : "Open for SRM Students",
        isClosingSoon ? "Application Closing Soon" : "Open Opportunity",
      ],
    };
  }

  const studentSkills = (profile.skills || []).map((s) => s.toLowerCase().trim());
  const requiredSkills = (opportunity.requiredSkills || []).map((s) => s.toLowerCase().trim());
  const origSkills = opportunity.requiredSkills || [];

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  origSkills.forEach((skill, idx) => {
    const normalized = requiredSkills[idx];
    if (studentSkills.some((ss) => ss === normalized || ss.includes(normalized) || normalized.includes(ss))) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // 1. Skill Match Score (Max 50 points)
  let skillScore = 0;
  let skillMatchPercentage = 0;

  if (origSkills.length === 0) {
    skillScore = 40; // No strict skill prerequisite, universally open
    skillMatchPercentage = 100;
  } else {
    skillMatchPercentage = Math.round((matchedSkills.length / origSkills.length) * 100);
    skillScore = Math.round((matchedSkills.length / origSkills.length) * 50);
  }

  // 2. Department Eligibility Score (Max 20 points)
  let isDepartmentEligible = true;
  let deptScore = 20;

  if (
    opportunity.eligibleDepartments &&
    opportunity.eligibleDepartments.length > 0 &&
    !opportunity.eligibleDepartments.includes("All Departments")
  ) {
    if (profile.department && opportunity.eligibleDepartments.includes(profile.department)) {
      deptScore = 20;
      isDepartmentEligible = true;
    } else {
      deptScore = 0;
      isDepartmentEligible = false;
    }
  }

  // 3. Year of Study Score (Max 15 points)
  let isYearEligible = true;
  let yearScore = 15;

  if (
    opportunity.eligibleYears &&
    opportunity.eligibleYears.length > 0
  ) {
    if (profile.yearOfStudy && opportunity.eligibleYears.includes(profile.yearOfStudy)) {
      yearScore = 15;
      isYearEligible = true;
    } else {
      yearScore = 0;
      isYearEligible = false;
    }
  }

  // 4. Interest & Category Match (Max 10 points)
  let interestScore = 0;
  const studentInterests = (profile.interests || []).map((i) => i.toLowerCase());
  const oppType = opportunity.type.toLowerCase();

  if (studentInterests.some((i) => i.includes(oppType) || oppType.includes(i))) {
    interestScore = 10;
  } else if (studentInterests.length > 0) {
    interestScore = 5;
  }

  // 5. Deadline Urgency Score (Max 5 points)
  let urgencyScore = 0;
  let daysRemaining: number | undefined = undefined;

  if (opportunity.applicationDeadline) {
    const diffMs = new Date(opportunity.applicationDeadline).getTime() - Date.now();
    daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysRemaining > 0 && daysRemaining <= 7) {
      urgencyScore = 5;
    } else if (daysRemaining > 7) {
      urgencyScore = 3;
    }
  }

  const totalScore = Math.min(100, skillScore + deptScore + yearScore + interestScore + urgencyScore);

  // Rationale Generator
  const rationale: string[] = [];

  if (matchedSkills.length > 0) {
    rationale.push(`Matches ${matchedSkills.length} of your skills (${matchedSkills.slice(0, 3).join(", ")})`);
  }

  if (isDepartmentEligible && profile.department) {
    rationale.push(`Eligible for ${profile.department} department`);
  }

  if (isYearEligible && profile.yearOfStudy) {
    rationale.push(`Eligible for Year ${profile.yearOfStudy} students`);
  }

  if (daysRemaining !== undefined && daysRemaining > 0 && daysRemaining <= 3) {
    rationale.push(`Application closes in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`);
  }

  if (opportunity.isOfficial) {
    rationale.push("Hosted by Official SRM Club");
  }

  return {
    totalScore,
    matchedSkills,
    missingSkills,
    isDepartmentEligible,
    isYearEligible,
    skillMatchPercentage,
    daysRemaining,
    rationale,
  };
}
