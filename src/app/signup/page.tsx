import { redirect } from "next/navigation";

/**
 * /signup → redirect to student registration page
 */
export default function SignupRedirectPage() {
  redirect("/register");
}
