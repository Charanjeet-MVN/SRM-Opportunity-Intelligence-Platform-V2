/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Cpu,
  FileText,
  UserCheck,
  Compass,
  BookOpen,
  Award,
  Send,
  Sparkles,
  Database,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: Date;
}

interface AgentProfile {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgGradient: string;
  suggestedPrompts: string[];
  systemGreeting: (name: string, skillsCount: number, goalsCount: number, projCount: number) => string;
  handleUserPrompt: (prompt: string, name: string, skills: string[], goals: string[], projects: string[]) => string;
}

const AGENTS: AgentProfile[] = [
  {
    id: "career_coach",
    name: "Career Coach Agent",
    role: "Career Guidance & Roadmaps",
    description: "Generates custom roadmaps, evaluates placements, and tracks industry requirements.",
    icon: Award,
    accentColor: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    bgGradient: "from-amber-600/15 via-zinc-900/90 to-zinc-950/20",
    suggestedPrompts: [
      "How do I become a Software Architect?",
      "Create a placement prep timeline",
      "Which role suits my profile best?"
    ],
    systemGreeting: (name, skills, goals, projs) => 
      `Hello ${name || "Developer"}! I am your Career Coach. I've synced with your profile vectors. I see you have ${skills} skills, ${goals} goals, and ${projs} portfolio projects. Let's design your roadmap!`,
    handleUserPrompt: (prompt, name, skills, goals, projects) => {
      const p = prompt.toLowerCase();
      if (p.includes("architect")) {
        return `To transition into a Software Architect, focus on mastering System Design Patterns, microservices structures, and high-concurrency PostgreSQL caching layers. I see you already have ${skills.slice(0, 3).join(", ")} which is a great start. I suggest adding a 'System Design Masterclass' to your personal workspace goals checklist.`;
      }
      if (p.includes("placement") || p.includes("prep")) {
        return `Here is a placement timeline for pre-final year:\n\n1. Month 1-2: Core DSA & Algorithm problem sessions (LeetCode/GeeksforGeeks).\n2. Month 3: Standard Web Dev Project deployment (e.g. Next.js backend, Docker CI/CD).\n3. Month 4: Resume optimization (verify ATS keywords match target internship roles).\n\nSince you have ${projects} projects registered, you are well on track!`;
      }
      return `Based on your profile listing ${skills.join(", ")}, you are highly suited for Software Engineer or Full Stack Developer roles. I recommend focusing on advanced React/Next.js frameworks and database optimization.`;
    }
  },
  {
    id: "resume_agent",
    name: "Resume Agent",
    role: "ATS Screening & Gaps",
    description: "Evaluates resume formatting, scores ATS keywords, and suggests profile enhancements.",
    icon: FileText,
    accentColor: "text-purple-400 border-purple-500/20 bg-purple-500/10",
    bgGradient: "from-purple-600/15 via-zinc-900/90 to-zinc-950/20",
    suggestedPrompts: [
      "Rate my current resume vector",
      "What missing skills are critical for AI roles?",
      "Write a professional summary paragraph"
    ],
    systemGreeting: (name, skills, goals, projs) => 
      `Hey there! I am the Resume Agent. Let's refine your credentials. Currently, you have ${projs} projects. Ready to boost your ATS score?`,
    handleUserPrompt: (prompt, name, skills, goals, projects) => {
      const p = prompt.toLowerCase();
      if (p.includes("rate") || p.includes("ats")) {
        return `Your current resume ATS score is calculated at 79% (Good Match). To boost it past 85%:\n\n- Add quantitative outcomes to project descriptions (e.g., 'optimized DB performance by 40%').\n- Insert Cloud/Containerization tags (e.g., AWS, Docker, CI/CD).\n- Add a dedicated certifications registry section in your Portfolio Studio.`;
      }
      if (p.includes("missing") || p.includes("ai")) {
        return `For AI roles, your profile is missing tags like PyTorch, TensorFlow, and Vector Databases (pgvector). I recommend adding a project related to LangChain or RAG workflows to your portfolio stack.`;
      }
      return `Here is a suggested bio summary:\n\n'Passionate CSE Student at SRM with hands-on experience building full-stack applications in ${skills.slice(0, 4).join(", ")}. Proven capabilities designing vector intelligence systems and tracking academic goals.'`;
    }
  },
  {
    id: "interview_agent",
    name: "Interview Agent",
    role: "Mock Prep & DSA Queries",
    description: "Mock interviewer, provides DSA question sets, and behavioral HR prep structures.",
    icon: UserCheck,
    accentColor: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
    bgGradient: "from-indigo-600/15 via-zinc-900/90 to-zinc-950/20",
    suggestedPrompts: [
      "Mock React/Next.js technical interview",
      "Give me a hard DSA string problem",
      "Explain the STAR method for HR prep"
    ],
    systemGreeting: (name, skills, goals, projs) => 
      `Greetings! Ready to face the panel? I am the Interview Agent. I'll test your knowledge in your ${skills} synced skills or algorithms. Let's start!`,
    handleUserPrompt: (prompt, name, skills, goals, projects) => {
      const p = prompt.toLowerCase();
      if (p.includes("react") || p.includes("next")) {
        return `Let's start the React interview!\n\nQuestion 1: What is the difference between Server Actions and API routes in Next.js 15, and when should you choose one over the other?\n\nTake a moment to draft your answer, and I will evaluate it!`;
      }
      if (p.includes("dsa") || p.includes("string")) {
        return `Here is a common Google string problem:\n\n'Given a string s, find the length of the longest substring without repeating characters.'\n\n- Example: s = 'abcabcbb' -> Output: 3 ('abc')\n\nHow would you solve this with O(N) time complexity? Hint: Use a sliding window map.`;
      }
      return `The STAR method is: Situation, Task, Action, Result. When answering behavioral queries, structure your answers like: 'In my ${projects[0] || "opportunity platform"} project, I had to optimize queries (Task), I introduced index constraints (Action), resulting in a 30% performance boost (Result).'`;
    }
  },
  {
    id: "opportunity_agent",
    name: "Opportunity Agent",
    role: "Funnel Matches & Alerts",
    description: "Evaluates opportunity eligibility, guides application deadlines, and triggers notifications.",
    icon: Compass,
    accentColor: "text-emerald-405 border-emerald-500/20 bg-emerald-500/10",
    bgGradient: "from-emerald-600/15 via-zinc-900/90 to-zinc-950/20",
    suggestedPrompts: [
      "What roles match my active goals?",
      "Find upcoming hackathon deadlines",
      "Am I eligible for Google STEP Internship?"
    ],
    systemGreeting: (name, skills, goals, projs) => 
      `Hello! I am the Opportunity Agent. I monitor active recruiters and placement queues. Let's find your next target!`,
    handleUserPrompt: (prompt, name, skills, goals, projects) => {
      const p = prompt.toLowerCase();
      if (p.includes("hackathon") || p.includes("deadlines")) {
        return `We have 2 trending events closing soon:\n\n1. Meta Llama Global Hackathon (Deadline: Aug 25, 2026)\n2. SRM Coding Club recruitment (Deadline: Aug 28, 2026)\n\nI recommend bookmarking them to sync with your Student Calendar notifications!`;
      }
      if (p.includes("google") || p.includes("step")) {
        return `The Google STEP Internship requires: CSE/IT year 2 or 3 student status, programming proficiency (C++, Java, Python, or Go), and basic data structures knowledge. Your profile meets 85% of eligibility metrics!`;
      }
      return `I found 3 matches for you: Amazon SDE Summer Intern, Microsoft Engage Mentorship, and Next Tech Lab Fellowship. I have flagged them in the 'Discovered' tab of your analytics center.`;
    }
  },
  {
    id: "project_mentor",
    name: "Project Mentor Agent",
    role: "System Architecture & GitHub",
    description: "Suggests tech stacks, maps microservices databases, and reviews GitHub project layouts.",
    icon: Cpu,
    accentColor: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
    bgGradient: "from-indigo-600/15 via-zinc-900/90 to-zinc-950/20",
    suggestedPrompts: [
      "Suggest architecture for a real-time feed",
      "What database layout suits a chat application?",
      "Review project stack idea"
    ],
    systemGreeting: (name, skills, goals, projs) => 
      `Welcome to the Dev Studio! I am your Project Mentor. I see you have ${projs} projects. Let's architect the next one!`,
    handleUserPrompt: (prompt, name, skills, goals, projects) => {
      const p = prompt.toLowerCase();
      if (p.includes("feed") || p.includes("architecture")) {
        return `For a real-time activity feed, I suggest: Next.js frontend, Node.js WebSocket backend (Socket.io), PostgreSQL database for persistence, and Redis for quick caching feeds. Use supabase client listeners to stream new showcases instantly!`;
      }
      if (p.includes("chat") || p.includes("layout")) {
        return `Here is a standard chat schema for Postgres:\n\n- Table 'rooms': id (UUID), name (TEXT), created_at (TIMESTAMP)\n- Table 'messages': id (UUID), room_id (UUID), sender_id (UUID), body (TEXT), created_at (TIMESTAMP)\n\nAdd index mappings on (room_id, created_at DESC) for fast message queries.`;
      }
      return `That project idea sounds excellent! For the tech stack, combine React/TypeScript with TailwindCSS and Supabase Auth. It will integrate perfectly with your Portfolio Studio.`;
    }
  },
  {
    id: "learning_agent",
    name: "Learning Companion Agent",
    role: "Courses, Certs & Syllabus",
    description: "Curates learning roadmaps, recommends course syllabuses, and aligns targets.",
    icon: BookOpen,
    accentColor: "text-purple-400 border-purple-500/20 bg-purple-500/10",
    bgGradient: "from-purple-600/15 via-zinc-900/90 to-zinc-950/20",
    suggestedPrompts: [
      "Roadmap to master Docker containerization",
      "Which certificate is best for AWS Cloud?",
      "Course recommendations to bridge DSA gaps"
    ],
    systemGreeting: (name, skills, goals, projs) => 
      `Hi! Ready to learn? I am the Learning Companion. What tech stack or topic should we master today?`,
    handleUserPrompt: (prompt, name, skills, goals, projects) => {
      const p = prompt.toLowerCase();
      if (p.includes("docker") || p.includes("roadmap")) {
        return `Here is your Docker learning roadmap:\n\nStage 1: Container basics (images, Dockerfiles, run commands).\nStage 2: Network mappings & volume mounts (persisting database directories).\nStage 3: Docker Compose (linking frontend, backend, and PostgreSQL).\nStage 4: AWS ECS / EKS deployment pipelines.`;
      }
      if (p.includes("aws") || p.includes("certificate")) {
        return `I recommend the AWS Certified Developer - Associate (DVA-C02) certificate. It covers serverless architecture, Lambda, API Gateway, DynamoDB, and ECS. It is highly valued for software engineering candidates.`;
      }
      return `For DSA, focus on sliding windows, hash maps, binary trees, and basic dynamic programming. Start with the 'DSA Masterclass' learning goal in your AI Workspace.`;
    }
  }
];

export default function AgentCenterClient() {
  const [activeAgentId, setActiveAgentId] = useState("career_coach");
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [userInput, setUserInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [studentContext, setStudentContext] = useState({
    name: "Student",
    skills: [] as string[],
    goals: [] as string[],
    projects: [] as string[],
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Active Agent details
  const activeAgent = useMemo(() => {
    return AGENTS.find((a) => a.id === activeAgentId) || AGENTS[0];
  }, [activeAgentId]);

  // Load context from local storage and build greeting
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("soip_public_portfolio");
      const savedGoals = localStorage.getItem("soip_workspace_goals");
      const profile = savedProfile ? JSON.parse(savedProfile) : null;
      const goals = savedGoals ? JSON.parse(savedGoals) : [];

      const skillsList = profile?.skills || ["TypeScript", "Python", "SQL", "React"];
      const goalsList = goals.map((g: { title?: string }) => g.title || "") || [];
      const projsList = profile?.projects.map((p: { name?: string }) => p.name || "") || [];

      setStudentContext({
        name: profile?.username || "Charan",
        skills: skillsList,
        goals: goalsList,
        projects: projsList,
      });

      // Seed initial messages for all agents
      const initialMap: Record<string, Message[]> = {};
      AGENTS.forEach((agent) => {
        initialMap[agent.id] = [
          {
            id: `init-${agent.id}`,
            sender: "agent",
            text: agent.systemGreeting(
              profile?.username || "Charan",
              skillsList.length,
              goalsList.length,
              projsList.length
            ),
            timestamp: new Date(),
          },
        ];
      });
      setMessagesMap(initialMap);
    } catch {
      // fallback
    }
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesMap, activeAgentId]);

  // Handle message sending
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date(),
    };

    // Add to message history
    const activeHistory = messagesMap[activeAgentId] || [];
    setMessagesMap((prev) => ({
      ...prev,
      [activeAgentId]: [...activeHistory, userMsg],
    }));
    setUserInput("");
    setTyping(true);

    // Simulate Agent response (streaming delay)
    setTimeout(() => {
      const responseText = activeAgent.handleUserPrompt(
        text,
        studentContext.name,
        studentContext.skills,
        studentContext.goals,
        studentContext.projects
      );

      const agentMsg: Message = {
        id: `msg-agent-${Date.now()}`,
        sender: "agent",
        text: responseText,
        timestamp: new Date(),
      };

      setMessagesMap((prev) => ({
        ...prev,
        [activeAgentId]: [...(prev[activeAgentId] || []), agentMsg],
      }));
      setTyping(false);
    }, 1200);
  };

  const activeMessages = messagesMap[activeAgentId] || [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 font-mono text-zinc-300 min-h-[580px]">
      {/* Sidebar: Agents Selection list */}
      <div className="w-full lg:w-76 shrink-0 space-y-3.5">
        <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold text-zinc-200">AI Agents Hub</h2>
          </div>
          <span className="text-[10px] text-purple-400 font-bold uppercase">6 Online</span>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {AGENTS.map((agent) => {
            const AgentIcon = agent.icon;
            const isSelected = activeAgentId === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => {
                  setActiveAgentId(agent.id);
                  setTyping(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-purple-955/20 border-purple-500/30 shadow-lg shadow-purple-950/25"
                    : "bg-zinc-900/30 border-zinc-850/80 hover:border-zinc-700/60"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${agent.accentColor}`}>
                  <AgentIcon className="w-4 h-4" />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 truncate">{agent.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  </div>
                  <span className="text-[9px] text-zinc-500 block uppercase tracking-wider">{agent.role}</span>
                  <p className="text-[10px] text-zinc-400 leading-normal font-light line-clamp-2">
                    {agent.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Window: Message log & input controls */}
      <div className="flex-1 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col h-[580px] overflow-hidden shadow-2xl relative">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Top active agent status */}
        <div className="p-4 border-b border-zinc-850 bg-zinc-950/80 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${activeAgent.accentColor}`}>
              {React.createElement(activeAgent.icon, { className: "w-4 h-4" })}
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-200 block">{activeAgent.name}</span>
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-500">
                <Database className="w-3 h-3 text-purple-400" />
                <span>Context Sync: {studentContext.skills.length} skills · {studentContext.projects.length} projects</span>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono bg-zinc-900 border border-zinc-850 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span>Agent Memory Active</span>
          </div>
        </div>

        {/* Conversation history area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 pr-3 scrollbar-thin">
          <AnimatePresence initial={false}>
            {activeMessages.map((msg) => {
              const isAgent = msg.sender === "agent";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 max-w-[85%] ${isAgent ? "self-start" : "self-end flex-row-reverse ml-auto"}`}
                >
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 text-xs font-bold ${
                    isAgent ? activeAgent.accentColor : "bg-purple-600 text-white border-purple-500/20"
                  }`}>
                    {isAgent ? React.createElement(activeAgent.icon, { className: "w-3.5 h-3.5" }) : "U"}
                  </div>

                  <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line border font-light ${
                    isAgent
                      ? "bg-zinc-900/50 border-zinc-850 text-zinc-300"
                      : "bg-purple-900/10 border-purple-500/20 text-purple-200"
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 self-start max-w-[80%]"
            >
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${activeAgent.accentColor}`}>
                {React.createElement(activeAgent.icon, { className: "w-3.5 h-3.5 animate-pulse" })}
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900/30 border border-zinc-850 text-zinc-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input panel with suggested chips */}
        <div className="p-4 border-t border-zinc-850 bg-zinc-950/80 space-y-3 relative z-10">
          {/* Suggested prompts list */}
          <div className="flex gap-2 overflow-x-auto pb-1 select-none scrollbar-none">
            {activeAgent.suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-450 hover:text-zinc-200 transition-colors text-[10px] whitespace-nowrap cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(userInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={`Ask ${activeAgent.name}...`}
              className="flex-1 bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-mono text-zinc-200"
            />
            <button
              type="submit"
              disabled={!userInput.trim() || typing}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-purple-600/15 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
