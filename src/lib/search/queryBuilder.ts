import { OpportunityType, LocationType } from "@/types";
import { OpportunityFilterOptions } from "@/lib/opportunities/actions";
import { DEPARTMENTS } from "@/lib/constants";

export interface ParsedSearchQuery {
  rawQuery: string;
  detectedType?: OpportunityType;
  detectedDepartment?: string;
  detectedSkill?: string;
  detectedLocation?: LocationType;
  detectedSortBy?: "newest" | "closing_soon";
  cleanedKeywords: string;
  extractedBadges: { label: string; value: string; type: "type" | "department" | "skill" | "location" | "sort" }[];
}

const TYPE_MAP: Record<string, OpportunityType> = {
  hackathon: "hackathon",
  hackathons: "hackathon",
  internship: "internship",
  internships: "internship",
  intern: "internship",
  research: "research",
  lab: "research",
  competition: "competition",
  competitions: "competition",
  contest: "competition",
  contests: "competition",
  workshop: "workshop",
  workshops: "workshop",
  bootcamp: "bootcamp",
  bootcamps: "bootcamp",
  scholarship: "scholarship",
  scholarships: "scholarship",
  recruitment: "club_recruitment",
  recruitments: "club_recruitment",
  club: "club_recruitment",
  placement: "placement_drive",
  placements: "placement_drive",
  conference: "conference",
  conferences: "conference",
  summit: "conference",
};

const SKILL_KEYWORDS = [
  "python",
  "react",
  "next.js",
  "nextjs",
  "typescript",
  "node.js",
  "nodejs",
  "java",
  "c++",
  "cpp",
  "ai",
  "machine learning",
  "ml",
  "pytorch",
  "tensorflow",
  "docker",
  "figma",
  "aws",
  "postgresql",
  "sql",
  "flutter",
  "go",
  "golang",
  "rust",
  "git",
  "tailwind",
  "ui/ux",
  "design",
  "blockchain",
  "web3",
  "cybersecurity",
  "devops",
];

/**
 * Deterministic Query Parser & Converter
 * Converts natural input strings into structured database search parameters.
 */
export function parseSmartSearchQuery(queryText: string): ParsedSearchQuery {
  const rawQuery = queryText.trim();
  if (!rawQuery) {
    return {
      rawQuery: "",
      cleanedKeywords: "",
      extractedBadges: [],
    };
  }

  const tokens = rawQuery.toLowerCase().split(/\s+/);
  const extractedBadges: ParsedSearchQuery["extractedBadges"] = [];
  
  let detectedType: OpportunityType | undefined;
  let detectedDepartment: string | undefined;
  let detectedSkill: string | undefined;
  let detectedLocation: LocationType | undefined;
  let detectedSortBy: "newest" | "closing_soon" | undefined;

  let remainingTokens = [...tokens];

  // 1. Detect Opportunity Type
  for (const token of tokens) {
    if (TYPE_MAP[token]) {
      detectedType = TYPE_MAP[token];
      extractedBadges.push({
        label: `Type: ${detectedType.replace("_", " ")}`,
        value: detectedType,
        type: "type",
      });
      remainingTokens = remainingTokens.filter((t) => t !== token);
      break;
    }
  }

  // 2. Detect Department / Branch
  for (const dept of DEPARTMENTS) {
    const deptLower = dept.toLowerCase();
    const deptWords = deptLower.split(/[\s&,-]+/);
    const matchesDept = deptWords.some(
      (word) => word.length > 2 && tokens.includes(word)
    );

    if (matchesDept || (tokens.includes("cse") && deptLower.includes("computer science"))) {
      detectedDepartment = dept;
      extractedBadges.push({
        label: `Dept: ${dept.split(" ")[0]}`,
        value: dept,
        type: "department",
      });
      break;
    }
  }

  // 3. Detect Technical Skill / Domain
  for (const skillKw of SKILL_KEYWORDS) {
    if (rawQuery.toLowerCase().includes(skillKw)) {
      detectedSkill = skillKw.toUpperCase();
      extractedBadges.push({
        label: `Skill: ${skillKw.toUpperCase()}`,
        value: skillKw,
        type: "skill",
      });
      break;
    }
  }

  // 4. Detect Urgency / Closing Soon keywords
  if (
    rawQuery.toLowerCase().includes("closing") ||
    rawQuery.toLowerCase().includes("urgent") ||
    rawQuery.toLowerCase().includes("deadline") ||
    rawQuery.toLowerCase().includes("this week") ||
    rawQuery.toLowerCase().includes("soon")
  ) {
    detectedSortBy = "closing_soon";
    extractedBadges.push({
      label: "Sort: Closing Soonest",
      value: "closing_soon",
      type: "sort",
    });
  }

  // 5. Detect Location Mode
  if (rawQuery.toLowerCase().includes("remote")) {
    detectedLocation = "remote";
    extractedBadges.push({ label: "Mode: Remote", value: "remote", type: "location" });
  } else if (rawQuery.toLowerCase().includes("campus") || rawQuery.toLowerCase().includes("on-campus")) {
    detectedLocation = "on_campus";
    extractedBadges.push({ label: "Mode: On Campus", value: "on_campus", type: "location" });
  } else if (rawQuery.toLowerCase().includes("hybrid")) {
    detectedLocation = "hybrid";
    extractedBadges.push({ label: "Mode: Hybrid", value: "hybrid", type: "location" });
  }

  // Clean residual search keywords
  const cleanedKeywords = remainingTokens
    .filter(
      (t) =>
        !["for", "in", "related", "to", "students", "opportunities", "opportunity", "this", "week", "closing"].includes(t)
    )
    .join(" ");

  return {
    rawQuery,
    detectedType,
    detectedDepartment,
    detectedSkill,
    detectedLocation,
    detectedSortBy,
    cleanedKeywords,
    extractedBadges,
  };
}

/**
 * Converts a ParsedSearchQuery into structured OpportunityFilterOptions
 */
export function buildFilterOptionsFromParsedQuery(
  parsed: ParsedSearchQuery,
  existingFilters: OpportunityFilterOptions = {}
): OpportunityFilterOptions {
  return {
    ...existingFilters,
    type: existingFilters.type || parsed.detectedType,
    locationType: existingFilters.locationType || parsed.detectedLocation,
    department: existingFilters.department || parsed.detectedDepartment,
    skill: existingFilters.skill || parsed.detectedSkill,
    sortBy: existingFilters.sortBy || parsed.detectedSortBy,
    search: existingFilters.search || parsed.cleanedKeywords || (parsed.rawQuery ? parsed.rawQuery : undefined),
  };
}
