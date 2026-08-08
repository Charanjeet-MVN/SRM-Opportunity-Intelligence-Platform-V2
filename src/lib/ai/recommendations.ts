import { StudentProfile, Opportunity } from "@/types";
import { RelevanceScoreResult } from "@/lib/relevance/scoring";

export interface AIQueryParseResult {
  parsedSkills: string[];
  parsedDepartment?: string;
  parsedType?: string;
  parsedLocation?: string;
  isUrgent?: boolean;
}

export interface AIOpportunityAnalysis {
  fitLevel: "exceptional" | "strong" | "moderate" | "unmatched";
  headline: string;
  keyMatchFactors: string[];
  skillsToAcquire: string[];
  strategicAdvice: string;
}

/**
 * Natural language search parser
 * Converts freeform search input like "CSE React hackathon next week" into structured filters
 */
export function parseSearchQueryAI(query: string): AIQueryParseResult {
  const lower = query.toLowerCase().trim();

  const knownSkills = [
    "react", "next.js", "typescript", "python", "java", "c++", "ai", "machine learning",
    "deep learning", "figma", "ui/ux", "docker", "flutter", "react native", "node.js",
    "sql", "git", "tailwind", "aws", "cloud", "cybersecurity"
  ];

  const knownDepartments = [
    "cse", "computer science", "ece", "electronics", "it", "information technology",
    "mechatronics", "mechanical", "biotech", "aerospace", "data science"
  ];

  const knownTypes = [
    "hackathon", "internship", "research", "competition", "workshop",
    "bootcamp", "scholarship", "recruitment", "placement", "conference"
  ];

  const parsedSkills = knownSkills.filter((s) => lower.includes(s));

  let parsedDepartment: string | undefined = undefined;
  for (const d of knownDepartments) {
    if (lower.includes(d)) {
      parsedDepartment = d.toUpperCase();
      break;
    }
  }

  let parsedType: string | undefined = undefined;
  for (const t of knownTypes) {
    if (lower.includes(t)) {
      parsedType = t;
      break;
    }
  }

  let parsedLocation: string | undefined = undefined;
  if (lower.includes("in person") || lower.includes("on campus") || lower.includes("offline")) {
    parsedLocation = "in_person";
  } else if (lower.includes("remote") || lower.includes("online") || lower.includes("virtual")) {
    parsedLocation = "virtual";
  } else if (lower.includes("hybrid")) {
    parsedLocation = "hybrid";
  }

  const isUrgent = lower.includes("urgent") || lower.includes("closing") || lower.includes("soon") || lower.includes("deadline");

  return {
    parsedSkills,
    parsedDepartment,
    parsedType,
    parsedLocation,
    isUrgent,
  };
}

/**
 * Generates dynamic AI match insights & strategic student advice for an opportunity
 */
export function generateAIOpportunityAnalysis(
  profile: StudentProfile | null | undefined,
  opportunity: Opportunity,
  relevance: RelevanceScoreResult
): AIOpportunityAnalysis {
  const score = relevance.totalScore;

  let fitLevel: AIOpportunityAnalysis["fitLevel"] = "moderate";
  let headline = "General Campus Opportunity";

  if (score >= 85) {
    fitLevel = "exceptional";
    headline = "Top 5% Priority Opportunity for Your Vector";
  } else if (score >= 70) {
    fitLevel = "strong";
    headline = "High-Relevance Career Accelerator";
  } else if (score >= 50) {
    fitLevel = "moderate";
    headline = "Potential Skill Expansion Opportunity";
  } else {
    fitLevel = "unmatched";
    headline = "Prerequisite Skill Gap Detected";
  }

  const keyMatchFactors: string[] = [];

  if (relevance.matchedSkills.length > 0) {
    keyMatchFactors.push(
      `Leverages ${relevance.matchedSkills.length} of your verified core skills: ${relevance.matchedSkills.slice(0, 3).join(", ")}`
    );
  }

  if (relevance.isDepartmentEligible && profile?.department) {
    keyMatchFactors.push(`Tailored specifically for ${profile.department} students`);
  }

  if (opportunity.isOfficial) {
    keyMatchFactors.push("Verified Official SRM Organization badge ensures valid certification");
  }

  const skillsToAcquire = relevance.missingSkills;

  let strategicAdvice = "Review the eligibility criteria and submit your registration early.";

  if (fitLevel === "exceptional") {
    strategicAdvice = "Priority recommendation: Your skill profile aligns exceptionally well. Submit your application immediately before slots fill up.";
  } else if (skillsToAcquire.length > 0) {
    strategicAdvice = `To maximize your impact, consider spending 2-3 hours mastering ${skillsToAcquire[0]} prior to attending.`;
  }

  return {
    fitLevel,
    headline,
    keyMatchFactors,
    skillsToAcquire,
    strategicAdvice,
  };
}

/**
 * Synthesizes executive opportunity landscape summary for logged in students
 */
export function generateAIStudentOverview(
  profile: StudentProfile | null | undefined,
  opportunities: (Opportunity & { relevance: RelevanceScoreResult })[]
): {
  headline: string;
  summary: string;
  topOpportunitiesCount: number;
  urgentCount: number;
} {
  if (!profile) {
    return {
      headline: "Discover SRM Campus Opportunities",
      summary: "Explore verified hackathons, research grants, and club recruitments published directly by SRM organizations.",
      topOpportunitiesCount: opportunities.length,
      urgentCount: 0,
    };
  }

  const topMatch = opportunities.filter((o) => o.relevance.totalScore >= 75);
  const urgent = opportunities.filter(
    (o) => o.relevance.daysRemaining !== undefined && o.relevance.daysRemaining <= 3 && o.relevance.daysRemaining >= 0
  );

  const skillCount = profile.skills?.length || 0;
  const name = profile.fullName ? profile.fullName.split(" ")[0] : "Student";

  let headline = `Hello ${name}, your opportunity feed is live`;
  let summary = `Analyzed ${opportunities.length} active opportunities against your ${skillCount}-skill profile vector in ${profile.department || "SRM"}.`;

  if (topMatch.length > 0) {
    headline = `Found ${topMatch.length} high-match opportunities for ${name}`;
    summary = `Your profile shows a strong vector fit for ${topMatch[0].title}. ${urgent.length > 0 ? `${urgent.length} deadline(s) closing within 72 hours.` : "No immediate deadlines."}`;
  }

  return {
    headline,
    summary,
    topOpportunitiesCount: topMatch.length,
    urgentCount: urgent.length,
  };
}
