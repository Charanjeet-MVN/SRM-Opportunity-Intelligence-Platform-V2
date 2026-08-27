import { redirect } from "next/navigation";

/**
 * /my-opportunities → redirect to student saved opportunities workspace
 */
export default function MyOpportunitiesRedirectPage() {
  redirect("/dashboard/student/saved");
}

