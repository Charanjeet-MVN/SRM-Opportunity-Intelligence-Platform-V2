"use server";

import { createClient } from "@/lib/supabase/server";
import { Opportunity } from "@/types";
import { revalidatePath } from "next/cache";

export interface EngagementFormState {
  error?: string;
  isSaved?: boolean;
  message?: string;
}

/**
 * Toggles saved status (bookmark / unbookmark) for an opportunity
 */
export async function toggleSaveOpportunityAction(
  opportunityId: string
): Promise<{ isSaved: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { isSaved: false, error: "Not authenticated" };

  // Check existing bookmark
  const { data: existing } = await supabase
    .from("saved_opportunities")
    .select("id")
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId)
    .single();

  if (existing) {
    // Unbookmark
    const { error } = await supabase
      .from("saved_opportunities")
      .delete()
      .eq("id", existing.id);

    if (error) return { isSaved: true, error: error.message };

    revalidatePath("/dashboard/student/saved");
    revalidatePath("/opportunities");
    return { isSaved: false };
  } else {
    // Bookmark
    const { error } = await supabase
      .from("saved_opportunities")
      .insert({
        user_id: user.id,
        opportunity_id: opportunityId,
      });

    if (error) return { isSaved: false, error: error.message };

    revalidatePath("/dashboard/student/saved");
    revalidatePath("/opportunities");
    return { isSaved: true };
  }
}

/**
 * Fetches all saved opportunities for current student
 */
export async function getSavedOpportunitiesAction(): Promise<{
  savedOpportunities: (Opportunity & { savedAt: string })[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { savedOpportunities: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("saved_opportunities")
    .select(`
      created_at,
      opportunities (
        *,
        clubs (
          name,
          logo_url,
          verification_status
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message.includes("Could not find the table") || error.code === "PGRST205") {
      console.warn("Supabase public.saved_opportunities table not found. Returning mock saved data.");
      return { savedOpportunities: getMockSavedOpportunities() };
    }
    return { savedOpportunities: [], error: error.message };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (data || []).map((item: any) => {
    const opp = item.opportunities;
    return {
      id: opp.id,
      clubId: opp.club_id,
      createdBy: opp.created_by,
      title: opp.title,
      slug: opp.slug,
      summary: opp.summary || undefined,
      description: opp.description,
      type: opp.type,
      locationType: opp.location_type,
      locationAddress: opp.location_address || undefined,
      externalUrl: opp.external_url || undefined,
      requiredSkills: opp.required_skills || [],
      eligibleDepartments: opp.eligible_departments || [],
      eligibleYears: opp.eligible_years || [],
      maxParticipants: opp.max_participants || undefined,
      currentParticipants: opp.current_participants || 0,
      applicationDeadline: opp.application_deadline || undefined,
      eventStartDate: opp.event_start_date || undefined,
      eventEndDate: opp.event_end_date || undefined,
      status: opp.status,
      createdAt: opp.created_at,
      updatedAt: opp.updated_at,
      savedAt: item.created_at,
      club: opp.clubs
        ? {
            id: opp.club_id,
            name: opp.clubs.name,
            slug: "",
            logoUrl: opp.clubs.logo_url || undefined,
            verificationStatus: opp.clubs.verification_status,
            createdAt: "",
            updatedAt: "",
          }
        : undefined,
    };
  });

  return { savedOpportunities: result };
}

/**
 * Checks if an opportunity is saved by the current student
 */
export async function isOpportunitySavedAction(
  opportunityId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("saved_opportunities")
    .select("id")
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId)
    .single();

  return !!data;
}

/**
 * Fetches upcoming timeline events (Saved & Registered deadlines)
 */
export async function getStudentTimelineAction(): Promise<{
  events: {
    id: string;
    title: string;
    date: string;
    type: "deadline" | "event_start";
    opportunitySlug: string;
    clubName: string;
    opportunityType: string;
  }[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { events: [], error: "Not authenticated" };

  const { data: savedData, error: savedError } = await supabase
    .from("saved_opportunities")
    .select(`
      opportunities (
        title,
        slug,
        type,
        application_deadline,
        event_start_date,
        clubs ( name )
      )
    `)
    .eq("user_id", user.id);

  if (savedError) return { events: [], error: savedError.message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events: any[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (savedData || []).forEach((item: any) => {
    const opp = item.opportunities;
    if (!opp) return;

    if (opp.application_deadline) {
      events.push({
        id: `${opp.slug}-deadline`,
        title: `Deadline: ${opp.title}`,
        date: opp.application_deadline,
        type: "deadline",
        opportunitySlug: opp.slug,
        clubName: opp.clubs?.name || "SRM Organization",
        opportunityType: opp.type,
      });
    }

    if (opp.event_start_date) {
      events.push({
        id: `${opp.slug}-start`,
        title: `Event Starts: ${opp.title}`,
        date: opp.event_start_date,
        type: "event_start",
        opportunitySlug: opp.slug,
        clubName: opp.clubs?.name || "SRM Organization",
        opportunityType: opp.type,
      });
    }
  });

  // Sort chronologically
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return { events };
}

/**
 * Records student registration intent/status for an opportunity
 */
export async function recordRegistrationAction(
  opportunityId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const { error } = await supabase
    .from("registrations")
    .upsert(
      {
        user_id: user.id,
        opportunity_id: opportunityId,
        status: "registered",
        registered_at: new Date().toISOString(),
      },
      { onConflict: "user_id,opportunity_id" }
    );

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/student/registrations");
  revalidatePath("/dashboard/student/saved");
  revalidatePath(`/opportunities`);

  return { success: true };
}

/**
 * Fetches all registered opportunities for current student
 */
export async function getRegisteredOpportunitiesAction(): Promise<{
  registeredOpportunities: (Opportunity & { registeredAt: string; registrationStatus: string })[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { registeredOpportunities: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("registrations")
    .select(`
      registered_at,
      status,
      notes,
      opportunities (
        *,
        clubs (
          name,
          logo_url,
          verification_status
        )
      )
    `)
    .eq("user_id", user.id)
    .order("registered_at", { ascending: false });

  if (error) {
    if (error.message.includes("Could not find the table") || error.code === "PGRST205") {
      console.warn("Supabase public.registrations table not found. Returning mock registered data.");
      return { registeredOpportunities: getMockRegisteredOpportunities() };
    }
    return { registeredOpportunities: [], error: error.message };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (data || []).map((item: any) => {
    const opp = item.opportunities;
    return {
      id: opp.id,
      clubId: opp.club_id,
      createdBy: opp.created_by,
      title: opp.title,
      slug: opp.slug,
      summary: opp.summary || undefined,
      description: opp.description,
      type: opp.type,
      locationType: opp.location_type,
      locationAddress: opp.location_address || undefined,
      externalUrl: opp.external_url || undefined,
      requiredSkills: opp.required_skills || [],
      eligibleDepartments: opp.eligible_departments || [],
      eligibleYears: opp.eligible_years || [],
      maxParticipants: opp.max_participants || undefined,
      currentParticipants: opp.current_participants || 0,
      applicationDeadline: opp.application_deadline || undefined,
      eventStartDate: opp.event_start_date || undefined,
      eventEndDate: opp.event_end_date || undefined,
      status: opp.status,
      createdAt: opp.created_at,
      updatedAt: opp.updated_at,
      registeredAt: item.registered_at,
      registrationStatus: item.status,
      notes: item.notes || undefined,
      club: opp.clubs
        ? {
            id: opp.club_id,
            name: opp.clubs.name,
            slug: "",
            logoUrl: opp.clubs.logo_url || undefined,
            verificationStatus: opp.clubs.verification_status,
            createdAt: "",
            updatedAt: "",
          }
        : undefined,
    };
  });

  return { registeredOpportunities: result };
}

/**
 * Checks if current student has registered for an opportunity
 */
export async function isOpportunityRegisteredAction(
  opportunityId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("registrations")
    .select("id")
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId)
    .single();

  return !!data;
}

/**
 * Updates the tracked column/status of an opportunity for the active student
 */
export async function updateOpportunityTrackerColumnAction(
  opportunityId: string,
  column: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // 1. Ensure saved_opportunities status is synced:
    // Any tracked opportunity is always bookmarked/saved as a base level engagement.
    const { data: existingSave } = await supabase
      .from("saved_opportunities")
      .select("id")
      .eq("user_id", user.id)
      .eq("opportunity_id", opportunityId)
      .single();

    if (!existingSave) {
      await supabase.from("saved_opportunities").insert({
        user_id: user.id,
        opportunity_id: opportunityId,
      });
    }

    // 2. Persist column state in registrations table using the notes column
    // For "Selected", set status to 'attended'. For all others, keep as 'registered'
    const regStatus = column === "Selected" ? "attended" : "registered";
    const { error: regError } = await supabase
      .from("registrations")
      .upsert(
        {
          user_id: user.id,
          opportunity_id: opportunityId,
          status: regStatus,
          notes: column,
          registered_at: new Date().toISOString(),
        },
        { onConflict: "user_id,opportunity_id" }
      );

    if (regError) {
      if (regError.message.includes("Could not find the table") || regError.code === "PGRST205") {
        console.warn("Database not configured. Bypassing database upsert and relying on LocalStorage.");
        return { success: true };
      }
      return { success: false, error: regError.message };
    }

    revalidatePath("/dashboard/student/registrations");
    revalidatePath("/dashboard/student/saved");
    revalidatePath("/opportunities");

export type StudentLifecycleState = "saved" | "tracking" | "registered" | "attended" | "withdrawn" | "unsaved";

/**
 * Server Action: Updates the real lifecycle state of an opportunity for the active student in Supabase
 */
export async function updateOpportunityLifecycleStateAction(
  opportunityId: string,
  targetState: StudentLifecycleState
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  try {
    if (targetState === "unsaved") {
      // Remove bookmark
      await supabase
        .from("saved_opportunities")
        .delete()
        .eq("user_id", user.id)
        .eq("opportunity_id", opportunityId);
    } else if (targetState === "saved" || targetState === "tracking") {
      // Ensure bookmarked
      await supabase
        .from("saved_opportunities")
        .upsert(
          {
            user_id: user.id,
            opportunity_id: opportunityId,
          },
          { onConflict: "user_id,opportunity_id" }
        );
    } else if (targetState === "registered") {
      // Ensure bookmarked & registered
      await supabase
        .from("saved_opportunities")
        .upsert(
          {
            user_id: user.id,
            opportunity_id: opportunityId,
          },
          { onConflict: "user_id,opportunity_id" }
        );

      await supabase
        .from("registrations")
        .upsert(
          {
            user_id: user.id,
            opportunity_id: opportunityId,
            status: "registered",
            registered_at: new Date().toISOString(),
          },
          { onConflict: "user_id,opportunity_id" }
        );
    } else if (targetState === "attended") {
      // Mark attended / completed
      await supabase
        .from("saved_opportunities")
        .upsert(
          {
            user_id: user.id,
            opportunity_id: opportunityId,
          },
          { onConflict: "user_id,opportunity_id" }
        );

      await supabase
        .from("registrations")
        .upsert(
          {
            user_id: user.id,
            opportunity_id: opportunityId,
            status: "attended",
            registered_at: new Date().toISOString(),
          },
          { onConflict: "user_id,opportunity_id" }
        );
    } else if (targetState === "withdrawn") {
      await supabase
        .from("registrations")
        .update({ status: "withdrawn" })
        .eq("user_id", user.id)
        .eq("opportunity_id", opportunityId);
    }

    revalidatePath("/dashboard/student/saved");
    revalidatePath("/dashboard/student/registrations");
    revalidatePath("/dashboard/student/calendar");
    revalidatePath("/dashboard/student");
    revalidatePath("/opportunities");

    return { success: true };
  } catch (err: unknown) {
    const errorObj = err as { message?: string };
    return { success: false, error: errorObj.message || "Failed to update lifecycle state" };
  }
}

/* ─────────────── HIGH-FIDELITY DEMO MOCK DATA ─────────────── */

function getMockSavedOpportunities() {
  const now = new Date().toISOString();
  return [
    {
      id: "mock-1",
      clubId: "club-1",
      title: "Google STEP Internship 2026",
      slug: "google-step-internship-2026",
      summary: "STEP (Student Training in Engineering Program) is a developmental internship for first and second-year undergraduate students.",
      type: "internship" as const,
      description: "STEP is a developmental internship for first and second-year undergraduate students in CS or related fields.",
      locationType: "hybrid" as const,
      requiredSkills: ["Java", "Python", "C++", "Data Structures"],
      eligibleDepartments: ["Computer Science & Engineering"],
      eligibleYears: [1, 2],
      applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "published" as const,
      savedAt: now,
      notes: "Saved",
      createdAt: now,
      updatedAt: now,
      club: {
        id: "club-1",
        name: "SRM Career Centre",
        slug: "srm-career-centre",
        verificationStatus: "verified" as const,
        createdAt: now,
        updatedAt: now,
      }
    },
    {
      id: "mock-2",
      clubId: "club-3",
      title: "Microsoft Engage Program 2026",
      slug: "microsoft-engage-program-2026",
      summary: "Microsoft Engage is a mentorship program for students to work on projects and receive direct placement opportunities.",
      type: "scholarship" as const,
      description: "Microsoft Engage program offers mentorship and direct interview opportunities to engineering students.",
      locationType: "remote" as const,
      requiredSkills: ["C#", "TypeScript", "React", "Cloud Computing"],
      eligibleDepartments: ["Computer Science & Engineering", "Information Technology"],
      eligibleYears: [2, 3],
      applicationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      status: "published" as const,
      savedAt: now,
      notes: "Interested",
      createdAt: now,
      updatedAt: now,
      club: {
        id: "club-3",
        name: "Microsoft Student Chapter",
        slug: "msc-srm",
        verificationStatus: "verified" as const,
        createdAt: now,
        updatedAt: now,
      }
    }
  ];
}

function getMockRegisteredOpportunities() {
  const now = new Date().toISOString();
  return [
    {
      id: "mock-3",
      clubId: "club-2",
      title: "Next Tech Lab AI Hackathon",
      slug: "next-tech-lab-ai-hackathon",
      summary: "Build the next generation of AI agents and win cash prizes up to 1,00,000 INR.",
      type: "hackathon" as const,
      description: "Build AI applications, models, or developer tools in 36 hours at Next Tech Lab.",
      locationType: "on_campus" as const,
      requiredSkills: ["React", "Next.js", "Python", "PyTorch"],
      eligibleDepartments: ["Computer Science & Engineering", "Artificial Intelligence & Machine Learning"],
      eligibleYears: [1, 2, 3, 4],
      applicationDeadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: "published" as const,
      registeredAt: now,
      registrationStatus: "registered",
      notes: "Applied",
      createdAt: now,
      updatedAt: now,
      club: {
        id: "club-2",
        name: "Next Tech Lab",
        slug: "next-tech-lab",
        verificationStatus: "verified" as const,
        createdAt: now,
        updatedAt: now,
      }
    },
    {
      id: "mock-4",
      clubId: "club-4",
      title: "Uber Hacktag Competition",
      slug: "uber-hacktag-competition",
      summary: "Uber Hacktag is a nationwide coding challenge where students solve real-world mobility problems.",
      type: "competition" as const,
      description: "Uber's annual engineering coding contest for engineering colleges across India.",
      locationType: "virtual" as const,
      requiredSkills: ["Algorithms", "System Design", "Node.js", "Go"],
      eligibleDepartments: ["Computer Science & Engineering", "Data Science & Cyber Security"],
      eligibleYears: [3, 4],
      applicationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "published" as const,
      registeredAt: now,
      registrationStatus: "registered",
      notes: "Assessment",
      createdAt: now,
      updatedAt: now,
      club: {
        id: "club-4",
        name: "SRM Coding Club",
        slug: "srm-coding-club",
        verificationStatus: "verified" as const,
        createdAt: now,
        updatedAt: now,
      }
    },
    {
      id: "mock-5",
      clubId: "club-5",
      title: "Amazon SDE Summer Internship",
      slug: "amazon-sde-summer-internship",
      summary: "12-week summer internship at Amazon India development center working on core engineering services.",
      type: "internship" as const,
      description: "Amazon SDE Interns work on real-world projects alongside Amazon software development engineers.",
      locationType: "in_person" as const,
      requiredSkills: ["Java", "Data Structures", "Algorithms", "AWS"],
      eligibleDepartments: ["Computer Science & Engineering", "Information Technology"],
      eligibleYears: [3],
      applicationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      status: "published" as const,
      registeredAt: now,
      registrationStatus: "registered",
      notes: "Interview",
      createdAt: now,
      updatedAt: now,
      club: {
        id: "club-5",
        name: "SRM Placement Office",
        slug: "srm-placement-office",
        verificationStatus: "verified" as const,
        createdAt: now,
        updatedAt: now,
      }
    },
    {
      id: "mock-6",
      clubId: "club-6",
      title: "ISRO Student Research Fellowship",
      slug: "isro-student-research-fellowship",
      summary: "Research opportunity in space science and satellite telemetry at ISRO research cell.",
      type: "research" as const,
      description: "6-month research internship supervised by ISRO scientists on telemetry networks.",
      locationType: "on_campus" as const,
      requiredSkills: ["MATLAB", "Python", "Physics", "Embedded Systems"],
      eligibleDepartments: ["Electronics & Communication Engineering", "Aerospace & Automotive Engineering"],
      eligibleYears: [3, 4],
      applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: "published" as const,
      registeredAt: now,
      registrationStatus: "attended",
      notes: "Selected",
      createdAt: now,
      updatedAt: now,
      club: {
        id: "club-6",
        name: "SRM Research Institute",
        slug: "srm-research-institute",
        verificationStatus: "verified" as const,
        createdAt: now,
        updatedAt: now,
      }
    },
    {
      id: "mock-7",
      clubId: "club-7",
      title: "Meta Hack-a-thon 2026",
      slug: "meta-hack-a-thon-2026",
      summary: "Global hackathon organized by Meta to build open-source AI projects using Llama models.",
      type: "hackathon" as const,
      description: "Build applications incorporating Llama LLMs to solve local campus challenges.",
      locationType: "hybrid" as const,
      requiredSkills: ["Python", "React", "PyTorch", "Git"],
      eligibleDepartments: ["Computer Science & Engineering"],
      eligibleYears: [1, 2, 3, 4],
      applicationDeadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "published" as const,
      registeredAt: now,
      registrationStatus: "registered",
      notes: "Rejected",
      createdAt: now,
      updatedAt: now,
      club: {
        id: "club-7",
        name: "IEEE Computer Society SRM",
        slug: "ieee-cs-srm",
        verificationStatus: "verified" as const,
        createdAt: now,
        updatedAt: now,
      }
    }
  ];
}



