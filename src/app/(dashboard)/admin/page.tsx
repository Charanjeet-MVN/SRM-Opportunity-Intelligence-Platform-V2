import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, FileCheck, Users, ArrowRight } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: userRec } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRec?.role !== "super_admin") {
    redirect("/dashboard/student");
  }
  return (
    <div className="space-y-8">
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-purple-950/30 border border-zinc-800/80 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Super Admin Control Panel
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          Platform Governance & Moderation
        </h1>
        <p className="text-xs text-zinc-400 max-w-xl">
          Supervise club verification requests, maintain ecosystem trust models, and audit opportunity quality across SRM Institute of Science and Technology.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/admin/verifications"
          className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-purple-500/40 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">Club Verification Queue</h2>
            <p className="text-xs text-zinc-400">
              Review submitted charter documents and issue official SRM trust badges.
            </p>
          </div>
          <div className="inline-flex items-center gap-1 text-xs font-medium text-purple-400">
            <span>Open Audit Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
