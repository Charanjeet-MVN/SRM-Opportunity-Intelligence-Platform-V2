import React from "react";
import { OpportunityType } from "@/types";
import {
  Code,
  Briefcase,
  FlaskConical,
  Trophy,
  BookOpen,
  GraduationCap,
  Award,
  UserCheck,
  Building,
  Mic,
  Video,
  Layers,
} from "lucide-react";

interface OpportunityTypeBadgeProps {
  type: OpportunityType;
  showIcon?: boolean;
}

export default function OpportunityTypeBadge({
  type,
  showIcon = true,
}: OpportunityTypeBadgeProps) {
  const getBadgeDetails = () => {
    switch (type) {
      case "hackathon":
        return { label: "Hackathon", icon: Code, style: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" };
      case "internship":
        return { label: "Internship", icon: Briefcase, style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
      case "research":
        return { label: "Research Opportunity", icon: FlaskConical, style: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
      case "competition":
        return { label: "Competition", icon: Trophy, style: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
      case "workshop":
        return { label: "Workshop", icon: BookOpen, style: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" };
      case "bootcamp":
        return { label: "Bootcamp", icon: GraduationCap, style: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
      case "scholarship":
        return { label: "Scholarship", icon: Award, style: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" };
      case "club_recruitment":
        return { label: "Club Recruitment", icon: UserCheck, style: "bg-pink-500/10 text-pink-400 border-pink-500/20" };
      case "placement_drive":
        return { label: "Placement Drive", icon: Building, style: "bg-teal-500/10 text-teal-400 border-teal-500/20" };
      case "conference":
        return { label: "Conference", icon: Mic, style: "bg-violet-500/10 text-violet-400 border-violet-500/20" };
      case "webinar":
        return { label: "Webinar", icon: Video, style: "bg-sky-500/10 text-sky-400 border-sky-500/20" };
      default:
        return { label: "Opportunity", icon: Layers, style: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" };
    }
  };

  const { label, icon: Icon, style } = getBadgeDetails();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${style}`}>
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{label}</span>
    </span>
  );
}
