"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { User, Cpu, Sparkles, ShieldCheck, Compass, CheckCircle2 } from "lucide-react";

interface PipelineStage {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  color: string;
  glow: string;
  icon: React.ElementType;
  items: string[];
  metrics: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "student",
    step: "01",
    title: "Student",
    subtitle: "Authenticated Profile",
    color: "#60a5fa", // sky
    glow: "rgba(96,165,250,0.35)",
    icon: User,
    items: ["CSE Core · 3rd Year", "SRM Campus ID Verified", "Interest Preference"],
    metrics: "Identity Verified",
  },
  {
    id: "skills",
    step: "02",
    title: "Skills",
    subtitle: "Technical Vector",
    color: "#a78bfa", // violet
    glow: "rgba(167,139,250,0.35)",
    icon: Cpu,
    items: ["PyTorch / ML", "Full Stack Web", "Embedded Systems"],
    metrics: "4 Active Vectors",
  },
  {
    id: "opportunities",
    step: "03",
    title: "Opportunities",
    subtitle: "Database Feed",
    color: "#818cf8", // indigo
    glow: "rgba(129,140,248,0.35)",
    icon: Compass,
    items: ["AI Hackathon 2026", "Generative Research", "Summer Fellowship"],
    metrics: "Verified Listings",
  },
  {
    id: "clubs",
    step: "04",
    title: "Clubs / Orgs",
    subtitle: "Verified Sponsors",
    color: "#34d399", // emerald
    glow: "rgba(52,211,153,0.35)",
    icon: ShieldCheck,
    items: ["Next Tech Lab", "IEEE SRM Chapter", "Department Labs"],
    metrics: "Admin Authenticated",
  },
  {
    id: "discovery",
    step: "05",
    title: "Personalized Discovery",
    subtitle: "Relevance Engine",
    color: "#f472b6", // pink/rose
    glow: "rgba(244,114,182,0.35)",
    icon: Sparkles,
    items: ["98% Vector Match Score", "Deadline Pipeline", "Direct Registration"],
    metrics: "High Precision",
  },
];

export function OpportunityNetworkViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [activeStage, setActiveStage] = useState<string>("opportunities");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let time = 0;

    const render = () => {
      const W = canvas.width / window.devicePixelRatio;
      const H = canvas.height / window.devicePixelRatio;

      // Smooth mouse tilt
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      time += reducedMotion ? 0 : 16;
      ctx.clearRect(0, 0, W, H);

      // Render connecting flow line between 5 stage columns
      const stageCount = PIPELINE_STAGES.length;
      const columnWidth = W / stageCount;
      const points: { x: number; y: number; color: string }[] = [];

      PIPELINE_STAGES.forEach((stage, idx) => {
        const cx = columnWidth * idx + columnWidth / 2;
        const cy = H / 2 + Math.sin(time * 0.0015 + idx) * (reducedMotion ? 0 : 8);
        points.push({ x: cx, y: cy, color: stage.color });
      });

      // Draw background horizontal spine connecting line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        const cpX = (points[i - 1].x + points[i].x) / 2;
        ctx.bezierCurveTo(cpX, points[i - 1].y, cpX, points[i].y, points[i].x, points[i].y);
      }
      ctx.strokeStyle = "rgba(99, 102, 241, 0.25)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Animated glowing signal pulses travelling left-to-right
      if (!reducedMotion) {
        const speed = 0.0006;
        for (let p = 0; p < 3; p++) {
          const progress = ((time * speed + p * 0.33) % 1);
          const stageIdx = progress * (stageCount - 1);
          const i1 = Math.floor(stageIdx);
          const i2 = Math.min(i1 + 1, stageCount - 1);
          const subProgress = stageIdx - i1;

          const p1 = points[i1];
          const p2 = points[i2];
          const px = p1.x + (p2.x - p1.x) * subProgress;
          const py = p1.y + (p2.y - p1.y) * subProgress;

          const pulseGrad = ctx.createRadialGradient(px, py, 0, px, py, 14);
          pulseGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
          pulseGrad.addColorStop(0.3, "rgba(99, 102, 241, 0.8)");
          pulseGrad.addColorStop(1, "rgba(99, 102, 241, 0)");

          ctx.beginPath();
          ctx.arc(px, py, 14, 0, Math.PI * 2);
          ctx.fillStyle = pulseGrad;
          ctx.fill();
        }
      }

      // Draw subtle background ambient particles
      for (let i = 0; i < 15; i++) {
        const px = (Math.sin(i * 99 + time * 0.0003) * 0.5 + 0.5) * W;
        const py = (Math.cos(i * 33 + time * 0.0004) * 0.5 + 0.5) * H;
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(161, 161, 170, 0.2)";
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full rounded-2xl bg-zinc-950/90 border border-zinc-800/80 p-5 sm:p-7 shadow-2xl overflow-hidden backdrop-blur-xl"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* Chrome header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-zinc-800/70 text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
            Opportunity Intelligence Network
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-400">Live 5-Stage System Flow</span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-zinc-400">
          <span className="inline-flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Vector Scored
          </span>
          <span className="hidden sm:inline text-zinc-500">Student → Discovery</span>
        </div>
      </div>

      {/* 5-Stage Network Nodes */}
      <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {PIPELINE_STAGES.map((stage) => {
          const isActive = activeStage === stage.id;
          const Icon = stage.icon;

          return (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-300 relative group overflow-hidden flex flex-col justify-between ${
                isActive
                  ? "bg-zinc-900/90 border-indigo-500/60 shadow-xl shadow-indigo-950/40"
                  : "bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50"
              }`}
            >
              {/* Active top glow border */}
              {isActive && (
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: stage.color, boxShadow: `0 0 12px ${stage.glow}` }}
                />
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-zinc-500">
                    STEP {stage.step}
                  </span>
                  <div
                    className="p-1.5 rounded-lg border text-zinc-300 transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `${stage.color}15`,
                      borderColor: `${stage.color}35`,
                      color: stage.color,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-sm font-bold text-zinc-100 mb-0.5">{stage.title}</div>
                <div className="text-[10px] font-mono text-zinc-400 mb-3">{stage.subtitle}</div>

                <div className="space-y-1">
                  {stage.items.map((item, idx) => (
                    <div key={idx} className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-500">Status</span>
                <span className="font-semibold" style={{ color: stage.color }}>
                  {stage.metrics}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Status & Vector Details Bar */}
      <div className="relative z-10 mt-6 pt-4 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-2 text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>SRM&apos;s opportunity ecosystem, intelligently organized and database-driven.</span>
        </div>
        <div className="font-mono text-[10px] text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          System State: 100% Verified Feed
        </div>
      </div>
    </div>
  );
}
