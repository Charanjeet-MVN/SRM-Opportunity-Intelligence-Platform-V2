import { redirect } from "next/navigation";

export default function ClubRegisterPage() {
  redirect("/register?type=club");
}
