import { redirect } from "next/navigation";

/**
 * /onboarding → redirect to student onboarding flow
 */
export default function OnboardingRedirectPage() {
  redirect("/student/onboarding");
}
