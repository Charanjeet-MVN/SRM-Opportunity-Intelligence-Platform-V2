import { redirect } from "next/navigation";

/**
 * /my-opportunities → redirect to student saved opportunities tracker
 */
export default function MyOpportunitiesRedirectPage() {
  redirect("/student/saved");
}
