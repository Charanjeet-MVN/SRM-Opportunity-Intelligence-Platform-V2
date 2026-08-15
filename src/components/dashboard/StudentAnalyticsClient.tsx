"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { StudentAnalyticsOverview } from "@/lib/students/analytics";
import { StudentProfile } from "@/types";
import {
  Bookmark,
  UserCheck,
  Clock,
  Compass,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BarChart3,
  Calendar,
  Activity,
  Award,
  Layers,
  ChevronRight,
  CheckCircle,
  Brain,
  Check,
  Plus,
  BookOpen,
  AlertCircle,
} from "lucide-react";

interface StudentAnalyticsClientProps {
  profile: StudentProfile | null;
  analytics: StudentAnalyticsOverview;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// Premium SVG Line Chart
function SleekLineChart({ data, title }: { data: { label: string; value: number }[]; title: string }) {
  if (data.length < 2) {
    return (
      <div className="h-48 rounded-2xl bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center text-center p-4">
        <Activity className="w-8 h-8 text-zinc-600 mb-2 animate-pulse" />
        <p className="text-xs font-mono text-zinc-500">Insufficient activity logs to render line trend</p>
      </div>
    );
  }

  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i * chartWidth) / (data.length - 1);
    const y = height - paddingY - (d.value * chartHeight) / maxVal;
    return { x, y, label: d.label, value: d.value };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-zinc-400 font-semibold">{title}</span>
        <span className="text-[10px] font-mono text-zinc-500">cumulative history</span>
      </div>
      <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-900/60 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const y = paddingY + ratio * chartHeight;
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#27272a"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area under the line */}
          <motion.path
            d={areaPath}
            fill="url(#chartGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />

          {/* Path line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth={3}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Data points/circles */}
          {points.map((p, idx) => (
            <g key={idx} className="group/point">
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                className="fill-indigo-400 stroke-zinc-950 stroke-2 cursor-pointer transition-all hover:r-6"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={10}
                className="fill-indigo-500/0 hover:fill-indigo-500/10 cursor-pointer"
              />
            </g>
          ))}

          {/* X axis labels */}
          {points.map((p, idx) => {
            if (idx === 0 || idx === points.length - 1 || data.length <= 5) {
              return (
                <text
                  key={idx}
                  x={p.x}
                  y={height - 8}
                  fill="#71717a"
                  fontSize={9}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {p.label}
                </text>
              );
            }
            return null;
          })}

          {/* Y Axis max label */}
          <text
            x={paddingX - 10}
            y={paddingY + 4}
            fill="#71717a"
            fontSize={9}
            textAnchor="end"
            fontFamily="monospace"
          >
            {maxVal}
          </text>
          <text
            x={paddingX - 10}
            y={height - paddingY + 4}
            fill="#71717a"
            fontSize={9}
            textAnchor="end"
            fontFamily="monospace"
          >
            0
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function StudentAnalyticsClient({ profile, analytics }: StudentAnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState<"journey" | "timeline" | "skills">("journey");

  const [skillsData, setSkillsData] = useState({
    skills: [] as string[],
    projects: [] as unknown[],
    certifications: [] as unknown[],
    goals: [] as unknown[],
  });

  const [activeRole, setActiveRole] = useState<"ai_engineer" | "data_scientist" | "software_engineer" | "full_stack" | "pm" | "cloud">("ai_engineer");
  const [addingGoalMsg, setAddingGoalMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedPortfolio = localStorage.getItem("soip_public_portfolio");
      const savedGoals = localStorage.getItem("soip_workspace_goals");
      const portfolio = savedPortfolio ? JSON.parse(savedPortfolio) : null;
      const goals = savedGoals ? JSON.parse(savedGoals) : [];
      
      setSkillsData({
        skills: profile?.skills || ["TypeScript", "JavaScript", "Python", "SQL", "React", "Next.js"],
        projects: portfolio?.projects || [],
        certifications: portfolio?.certifications || [],
        goals,
      });
    } catch {
      // ignore
    }
  }, [profile]);

  const handleAddRecommendationToGoals = (title: string) => {
    try {
      const savedGoals = localStorage.getItem("soip_workspace_goals");
      const goals = savedGoals ? JSON.parse(savedGoals) : [];
      
      const newGoal = {
        id: `goal-${Date.now()}`,
        title,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        progress: 0,
        status: "not_started"
      };
      
      localStorage.setItem("soip_workspace_goals", JSON.stringify([...goals, newGoal]));
      
      setAddingGoalMsg(`Added "${title}" to goals!`);
      setTimeout(() => setAddingGoalMsg(null), 2500);
    } catch {
      // ignore
    }
  };

  const ROLE_DETAILS = {
    ai_engineer: {
      title: "AI Engineer",
      skills: ["Python", "PyTorch", "TensorFlow", "OpenAI APIs", "LlamaIndex", "Vector Databases", "Docker"],
      strengths: "Solid ML foundations, strong python scripting, good understanding of neural network models.",
      weaknesses: "Weak deployment exposure, limited AWS/Cloud infrastructure setup.",
      recommendations: {
        courses: ["Advanced NLP with PyTorch (Coursera)", "LLMops & LangChain (deeplearning.ai)"],
        certs: ["AWS Certified Machine Learning - Specialty"],
        projects: ["Build a multi-agent RAG workflow with Postgres pgvector support"],
      }
    },
    data_scientist: {
      title: "Data Scientist",
      skills: ["Python", "SQL", "Pandas", "NumPy", "Scikit-Learn", "Matplotlib", "Statistics", "Machine Learning"],
      strengths: "Good statistical analytical abilities, strong SQL data querying skills.",
      weaknesses: "Lack of exposure to big data structures (Spark/Hadoop) and real-time streaming databases.",
      recommendations: {
        courses: ["Applied Machine Learning (Stanford)", "Big Data & Hadoop Pipelines (Udemy)"],
        certs: ["Google Cloud Data Engineer Professional"],
        projects: ["Design a real-time analytics pipeline parsing student telemetry scores"],
      }
    },
    software_engineer: {
      title: "Software Engineer",
      skills: ["TypeScript", "React", "Next.js", "Node.js", "SQL", "PostgreSQL", "AWS", "Git", "Docker"],
      strengths: "Excellent typescript understanding, proficient with Next.js framework architectures.",
      weaknesses: "Weak database optimization (indexing/vacuuming), limited systems design experience.",
      recommendations: {
        courses: ["System Design Fundamentals (Pragmatic)", "Docker & Kubernetes Mastery (Maximilian)"],
        certs: ["AWS Certified Developer - Associate"],
        projects: ["Optimize a high-concurrency PostgreSQL backend utilizing query indexing benchmarks"],
      }
    },
    full_stack: {
      title: "Full Stack Developer",
      skills: ["TypeScript", "React", "Next.js", "Node.js", "Express", "PostgreSQL", "MongoDB", "TailwindCSS"],
      strengths: "Strong UI styling abilities, comprehensive full-stack Next.js pre-rendering features knowledge.",
      weaknesses: "Weak containerization setup, limited security measures (JWT/OAuth protocols).",
      recommendations: {
        courses: ["Advanced Web Security & OAuth (Egghead)", "Microservices Architecture (Udemy)"],
        certs: ["AWS Certified Developer - Associate"],
        projects: ["Build an end-to-end Kanban board system synced with Supabase WebSockets"],
      }
    },
    pm: {
      title: "Product Manager",
      skills: ["Agile Roadmap Planning", "Product Analytics", "A/B Testing", "UX Prototyping", "SQL", "System Design Basics"],
      strengths: "Strong task management understanding, good roadmap creation experience.",
      weaknesses: "Limited technical background on infrastructure hosting structures.",
      recommendations: {
        courses: ["Product Management 101 (Reforge)", "Product Analytics & Metrics (Amplitude)"],
        certs: ["Certified Scrum Product Owner (CSPO)"],
        projects: ["Design an interactive PRD & Figma prototyping flow for campus portals"],
      }
    },
    cloud: {
      title: "Cloud Engineer",
      skills: ["AWS", "GCP", "Docker", "Kubernetes", "Linux", "Terraform", "CI/CD Pipelines", "System Design"],
      strengths: "Basic understanding of cloud platforms, experience deploying basic applications.",
      weaknesses: "Weak scripting automation background, lack of Kubernetes scaling expertise.",
      recommendations: {
        courses: ["DevOps & Infrastructure as Code with Terraform (Udemy)", "Kubernetes in Production (Linux Academy)"],
        certs: ["AWS Certified Solutions Architect - Associate"],
        projects: ["Construct an automated multi-stage CI/CD pipeline using GitHub Actions"],
      }
    }
  };

  const getReadinessScore = (roleKey: keyof typeof ROLE_DETAILS) => {
    const roleObj = ROLE_DETAILS[roleKey];
    const studentSkillsLower = skillsData.skills.map(s => s.toLowerCase());
    
    // Calculate skill match
    const matched = roleObj.skills.filter(s => studentSkillsLower.includes(s.toLowerCase()));
    const ratio = roleObj.skills.length > 0 ? matched.length / roleObj.skills.length : 0;
    
    // Boost from projects and certs
    const projectBoost = Math.min(skillsData.projects.length * 10, 20);
    const certBoost = Math.min(skillsData.certifications.length * 10, 20);
    
    return Math.min(Math.round(ratio * 60 + projectBoost + certBoost), 100);
  };

  const getMissingSkills = (roleKey: keyof typeof ROLE_DETAILS) => {
    const roleObj = ROLE_DETAILS[roleKey];
    const studentSkillsLower = skillsData.skills.map(s => s.toLowerCase());
    return roleObj.skills.filter(s => !studentSkillsLower.includes(s.toLowerCase()));
  };

  const activeRoleData = ROLE_DETAILS[activeRole];
  const readinessScore = getReadinessScore(activeRole);
  const missingSkills = getMissingSkills(activeRole);

  const SKILL_GRAPH_CATEGORIES = [
    { name: "Programming", current: 80, prev: 72, label: "Lvl 4 (Advanced)", trend: "+8%" },
    { name: "Web Development", current: 75, prev: 65, label: "Lvl 4 (Advanced)", trend: "+10%" },
    { name: "AI/ML", current: 60, prev: 50, label: "Lvl 3 (Intermediate)", trend: "+10%" },
    { name: "Data Science", current: 55, prev: 50, label: "Lvl 3 (Intermediate)", trend: "+5%" },
    { name: "Cloud", current: 40, prev: 35, label: "Lvl 2 (Beginner)", trend: "+5%" },
    { name: "DevOps", current: 30, prev: 30, label: "Lvl 2 (Beginner)", trend: "Stable" },
    { name: "Cyber Security", current: 25, prev: 20, label: "Lvl 1 (Novice)", trend: "+5%" },
    { name: "System Design", current: 45, prev: 40, label: "Lvl 2 (Beginner)", trend: "+5%" },
    { name: "Soft Skills", current: 85, prev: 80, label: "Lvl 5 (Expert)", trend: "+5%" },
  ];

  const journeyMapNodes = [
    { label: "Current Position", checked: true, desc: "Onboarded student" },
    { label: "Skill Building", checked: skillsData.skills.length > 5, desc: "Core languages acquired" },
    { label: "Projects Studio", checked: skillsData.projects.length >= 2, desc: "Showcases published" },
    { label: "Credentials Hub", checked: skillsData.certifications.length >= 1, desc: "Verified certifications" },
    { label: "Internship Matching", checked: analytics.registeredCount > 0, desc: "Applications submitted" },
    { label: "Target Role Ready", checked: readinessScore >= 70, desc: `${activeRoleData.title} score >= 70%` },
  ];

  const totalInteractions = analytics.savedCount + analytics.registeredCount;

  // Prepare chart data (group by date)
  const timelineMap: Record<string, number> = {};
  const sortedDates: string[] = [];

  // Gather unique dates in chronological order
  const allEvents = [
    ...analytics.savedTimeline.map((s) => ({ date: s.date.split("T")[0] })),
    ...analytics.registrationTimeline.map((r) => ({ date: r.date.split("T")[0] })),
  ];

  allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let rollingSum = 0;
  allEvents.forEach((ev) => {
    if (!timelineMap[ev.date]) {
      timelineMap[ev.date] = 0;
      sortedDates.push(ev.date);
    }
    rollingSum += 1;
    timelineMap[ev.date] = rollingSum;
  });

  const chartData = sortedDates.map((date) => {
    const d = new Date(date);
    return {
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: timelineMap[date],
    };
  });

  // Journey States
  const journeyStates = [
    {
      id: "discovered",
      label: "Discovered",
      count: analytics.journey.discoveredCount,
      desc: "Live verified opportunities published on platform",
      icon: Compass,
      color: "text-zinc-400 bg-zinc-900 border-zinc-800",
    },
    {
      id: "saved",
      label: "Saved",
      count: analytics.journey.savedCount,
      desc: "Opportunities bookmarked in your private dashboard",
      icon: Bookmark,
      color: "text-indigo-400 bg-indigo-500/8 border-indigo-500/20",
    },
    {
      id: "tracking",
      label: "Tracking",
      count: analytics.journey.trackingCount,
      desc: "Active saved/registered items with active deadlines",
      icon: Clock,
      color: "text-amber-400 bg-amber-500/8 border-amber-500/20",
    },
    {
      id: "applied",
      label: "Applied",
      count: analytics.journey.appliedCount,
      desc: "Registrations logged with official verification codes",
      icon: UserCheck,
      color: "text-emerald-400 bg-emerald-500/8 border-emerald-500/20",
    },
    {
      id: "completed",
      label: "Completed",
      count: analytics.journey.completedCount,
      desc: "Events marked attended by organization reps",
      icon: Award,
      color: "text-purple-400 bg-purple-500/8 border-purple-500/20",
    },
  ];

  // Dynamic Insight Panel Generation
  const insights: string[] = [];
  if (profile) {
    const completeness =
      (profile.fullName ? 20 : 0) +
      (profile.department ? 15 : 0) +
      (profile.yearOfStudy ? 10 : 0) +
      (profile.skills.length > 0 ? 20 : 0) +
      (profile.interests.length > 0 ? 10 : 0) +
      (profile.careerGoals ? 10 : 0) +
      (profile.registerNumber ? 15 : 0);

    if (completeness < 100) {
      insights.push(
        `Your student profile is ${completeness}% complete. Fill out the remaining fields to enhance the accuracy of your personalized AI recommendations.`
      );
    }
  }

  if (analytics.savedCount > 0 && analytics.registeredCount === 0) {
    insights.push("You have saved opportunities but haven't registered for any yet. Review your deadlines to submit applications before they close.");
  } else if (analytics.savedCount > 0 && analytics.registeredCount > 0) {
    const convRate = Math.round((analytics.registeredCount / analytics.savedCount) * 100);
    insights.push(`Your bookmark-to-application conversion rate is ${convRate}%. You are actively pursuing ${analytics.registeredCount} opportunities.`);
  }

  // Type-specific insight
  if (analytics.typeDistribution.length > 0) {
    const topType = analytics.typeDistribution[0].type.replace("_", " ");
    insights.push(
      `You show a strong preference for ${topType} opportunities, which account for the majority of your dashboard interactions.`
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* ── HEADER BANNER ── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/70 p-6 sm:p-8 space-y-4"
      >
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-indigo-400 font-bold uppercase tracking-wider text-[9px]">
                Student Impact Center
              </span>
              <span className="text-zinc-700">•</span>
              <span className="text-zinc-500 text-[10px]">Real-Time Interaction Data</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-100">
              How am I engaging with opportunities?
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-lg">
              Analyze your discovery funnel, saved campaigns, application timelines, and category preferences across the SRM ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/student"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-medium text-xs transition-all"
            >
              <span>Back to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── KPI HIGHLIGHTS ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Saves Logged", value: analytics.savedCount, desc: "Total bookmarked items", icon: Bookmark, accent: "text-indigo-400", bg: "bg-indigo-500/8 border-indigo-500/20" },
          { label: "Applications Logged", value: analytics.registeredCount, desc: "Successful registrations", icon: UserCheck, accent: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/20" },
          { label: "Completed Events", value: analytics.completedCount, desc: "Verified attendance sheets", icon: Award, accent: "text-purple-400", bg: "bg-purple-500/8 border-purple-500/20" },
          { label: "Interaction Activity", value: totalInteractions, desc: "Combined funnel actions", icon: Activity, accent: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/20" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`p-5 rounded-2xl ${card.bg} border space-y-3 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 font-medium">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.accent}`} />
              </div>
              <div className={`text-2xl font-black font-mono ${card.accent}`}>{card.value}</div>
              <p className="text-[10px] text-zinc-500 font-mono leading-none">{card.desc}</p>
            </div>
          );
        })}
      </motion.div>

      {/* ── DYNAMIC INSIGHTS PANEL ── */}
      {insights.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs uppercase font-mono font-bold text-zinc-200 tracking-wider">
              Student Engagement Insights
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-xs font-light text-zinc-300 leading-relaxed flex items-start gap-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── MAIN WORKSPACE CONTENT: JOURNEY VISUALIZATION & CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Journey Visualization & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Journey Header Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setActiveTab("journey")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold font-mono cursor-pointer transition-all ${
                activeTab === "journey" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Engagement Funnel Journey
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold font-mono cursor-pointer transition-all ${
                activeTab === "timeline" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Activity Interaction Logs
            </button>
            <button
              onClick={() => setActiveTab("skills")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold font-mono cursor-pointer transition-all ${
                activeTab === "skills" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              AI Skill Graph & Readiness
            </button>
          </div>

          {activeTab === "journey" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                  Personal Funnel Pipeline
                </h3>
                <span className="text-[10px] font-mono text-zinc-500">discovered → completed</span>
              </div>

              {/* Journey Funnel Pipeline */}
              <div className="flex flex-col space-y-4">
                {journeyStates.map((state, index) => {
                  const Icon = state.icon;
                  const isLast = index === journeyStates.length - 1;
                  return (
                    <React.Fragment key={state.id}>
                      <div
                        className={`p-4 rounded-2xl border ${state.color} flex items-center justify-between gap-4 transition-all hover:scale-[1.005]`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-semibold text-zinc-100">{state.label}</h4>
                            <p className="text-[10px] text-zinc-500 font-light leading-relaxed max-w-md sm:max-w-xl">
                              {state.desc}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-base font-black font-mono text-zinc-100">
                            {state.count}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500 block">items</span>
                        </div>
                      </div>
                      {!isLast && (
                        <div className="flex justify-center py-0.5">
                          <ChevronRight className="w-4 h-4 text-zinc-700 rotate-90" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "timeline" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl"
            >
              <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                Interaction History Audit Logs
              </h3>

              {totalInteractions === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Activity className="w-8 h-8 text-zinc-700 mx-auto animate-pulse" />
                  <p className="text-xs font-mono text-zinc-500">No interaction events logged yet.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                  {analytics.registrationTimeline.map((item, idx) => (
                    <div
                      key={`reg-${idx}`}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900/80 flex items-center justify-between gap-4 text-xs hover:border-zinc-800 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <Link href={`/opportunities/${item.opportunitySlug}`}>
                          <h4 className="font-semibold text-zinc-200 hover:text-indigo-400 truncate transition-colors">
                            {item.title}
                          </h4>
                        </Link>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Registered via {item.clubName}
                        </p>
                      </div>
                      <div className="text-right shrink-0 font-mono space-y-0.5">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          {item.status}
                        </span>
                        <span className="block text-[9px] text-zinc-600">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}

                  {analytics.savedTimeline.map((item, idx) => (
                    <div
                      key={`save-${idx}`}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900/80 flex items-center justify-between gap-4 text-xs hover:border-zinc-800 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <Link href={`/opportunities/${item.opportunitySlug}`}>
                          <h4 className="font-semibold text-zinc-200 hover:text-indigo-400 truncate transition-colors">
                            {item.title}
                          </h4>
                        </Link>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Bookmarked under {item.clubName}
                        </p>
                      </div>
                      <div className="text-right shrink-0 font-mono space-y-0.5">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                          bookmarked
                        </span>
                        <span className="block text-[9px] text-zinc-600">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "skills" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Target Role & Readiness Score Widget */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-4">
                  <div>
                    <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-purple-400" />
                      AI Role Readiness & Gaps
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-light">Select a target career profile to evaluate skill matches</p>
                  </div>
                  {addingGoalMsg && (
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-lg animate-pulse font-bold">
                      {addingGoalMsg}
                    </span>
                  )}
                </div>

                {/* Grid of the 6 roles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(Object.keys(ROLE_DETAILS) as Array<keyof typeof ROLE_DETAILS>).map((key) => {
                    const activeScore = getReadinessScore(key);
                    const isSelected = activeRole === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveRole(key)}
                        className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-purple-955/20 border-purple-500/30 shadow-md shadow-purple-950/25"
                            : "bg-zinc-950/40 border-zinc-850 hover:border-zinc-700/65"
                        }`}
                      >
                        <span className={`text-[10px] font-bold ${isSelected ? "text-purple-300" : "text-zinc-400"}`}>
                          {ROLE_DETAILS[key].title}
                        </span>

                        <div className="flex items-end justify-between">
                          <span className="text-xs font-black font-mono text-zinc-200">{activeScore}%</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Role Readiness Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2">
                  {/* Readiness circle meter (3 columns) */}
                  <div className="sm:col-span-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-850/80 flex flex-col items-center justify-center text-center space-y-2">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono">Readiness Vector</span>
                    
                    {/* SVG Circular Progress Gauge */}
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="32" stroke="#27272a" strokeWidth="6" fill="transparent" />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="#a855f7"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 32}
                          initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 32 - (readinessScore / 100) * (2 * Math.PI * 32) }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-sm text-zinc-200">
                        {readinessScore}%
                      </div>
                    </div>

                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wide">
                      {readinessScore >= 75 ? "Placement Ready" : readinessScore >= 50 ? "Building Core" : "Needs Skills"}
                    </span>
                  </div>

                  {/* Strengths & Weaknesses (8 columns) */}
                  <div className="sm:col-span-8 space-y-3.5">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Core Profile Strengths
                      </span>
                      <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                        {activeRoleData.strengths}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-purple-400 uppercase flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Gaps & Weaknesses
                      </span>
                      <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                        {activeRoleData.weaknesses}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skill Gap Detector list */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850/80 space-y-3">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono block">Skill Gap Analysis</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-zinc-400 font-bold block">Current Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {activeRoleData.skills.filter(s => skillsData.skills.map(x => x.toLowerCase()).includes(s.toLowerCase())).map(s => (
                          <span key={s} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[9px]">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-zinc-400 font-bold block">Missing Skills Gaps:</span>
                      <div className="flex flex-wrap gap-1">
                        {missingSkills.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[9px]">{s}</span>
                        ))}
                        {missingSkills.length === 0 && <span className="text-[10px] text-zinc-500 font-light">No missing skills gaps!</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Career Journey Map roadmap visualization */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850/80 space-y-3">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono block">Career Journey Roadmap Map</span>
                  
                  <div className="relative pl-4 border-l border-zinc-800 space-y-4 pt-1 pb-1">
                    {journeyMapNodes.map((node, i) => (
                      <div key={i} className="relative">
                        {/* Bullet dot */}
                        <div className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full border border-zinc-950 flex items-center justify-center ${
                          node.checked ? "bg-purple-600 text-white" : "bg-zinc-850 text-zinc-650"
                        }`}>
                          {node.checked && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className={`text-[11px] font-bold ${node.checked ? "text-zinc-200" : "text-zinc-500"}`}>{node.label}</h4>
                          <p className="text-[9px] text-zinc-500 leading-relaxed font-light">{node.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart recommendations based on gaps */}
                <div className="space-y-3 pt-2">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block font-mono">Bridge Gaps Recommendations</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 flex flex-col justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-zinc-500 text-[8px] uppercase font-bold tracking-wide">Target Course</span>
                        <h4 className="font-bold text-zinc-250 leading-normal">{activeRoleData.recommendations.courses[0]}</h4>
                      </div>
                      <button
                        onClick={() => handleAddRecommendationToGoals(`Complete course: ${activeRoleData.recommendations.courses[0]}`)}
                        className="w-full py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-350 hover:text-white flex items-center justify-center gap-1.5 font-bold transition-all text-[10px] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Course Goal</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 flex flex-col justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-zinc-500 text-[8px] uppercase font-bold tracking-wide">Suggested Project</span>
                        <h4 className="font-bold text-zinc-250 leading-normal">{activeRoleData.recommendations.projects[0]}</h4>
                      </div>
                      <button
                        onClick={() => handleAddRecommendationToGoals(`Build project: ${activeRoleData.recommendations.projects[0]}`)}
                        className="w-full py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-350 hover:text-white flex items-center justify-center gap-1.5 font-bold transition-all text-[10px] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Project Goal</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Visual Skill Graph Card Grid (Proficiency level gauges) */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-5 shadow-xl">
                <div>
                  <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-400" />
                    Visual Skill Domain Proficiency
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-light font-mono">Domain vector levels mapped with active growth metrics</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
                  {SKILL_GRAPH_CATEGORIES.map((cat) => (
                    <div
                      key={cat.name}
                      className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 flex flex-col justify-between gap-3 shadow-inner"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-200">{cat.name}</span>
                          <span className="text-[8px] px-1.5 py-0.2 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded font-bold">{cat.trend}</span>
                        </div>
                        <span className="text-[9px] text-zinc-500 font-light block">{cat.label}</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="w-full bg-zinc-905 h-1 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${cat.current}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-zinc-500">
                          <span>Prev: {cat.prev}%</span>
                          <span>Current: {cat.current}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right 1 Column: Growth trends & type distributions */}
        <div className="space-y-6">
          {/* Trend Growth Chart */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-xl">
            <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
              Engagement Trend Line
            </h3>
            <SleekLineChart data={chartData} title="funnel interactions progress" />
          </div>

          {/* Type Distribution */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-mono text-zinc-400 font-semibold tracking-wider">
                Type Preferences
              </h3>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>

            {analytics.typeDistribution.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-zinc-500">
                No preferences logged yet.
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.typeDistribution.map((item) => (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-300 capitalize">{item.type.replace("_", " ")}</span>
                      <span className="text-indigo-400 font-semibold">{item.count} items</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (item.count / totalInteractions) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
