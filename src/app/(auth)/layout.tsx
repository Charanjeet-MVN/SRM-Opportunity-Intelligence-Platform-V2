"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function AuthNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    const NODES = Array.from({ length: 22 }, (_, i) => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1.5,
      color: ["#818cf8", "#34d399", "#60a5fa", "#a78bfa"][i % 4],
    }));

    let t = 0;
    const draw = () => {
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);
      t += 16;

      NODES.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;
      });

      for (let i = 0; i < NODES.length; i++) {
        for (let j = i + 1; j < NODES.length; j++) {
          const dx = NODES[i].x - NODES[j].x;
          const dy = NODES[i].y - NODES[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.12;
            ctx.beginPath();
            ctx.moveTo(NODES[i].x, NODES[i].y);
            ctx.lineTo(NODES[j].x, NODES[j].y);
            ctx.strokeStyle = `rgba(129,140,248,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      NODES.forEach((node) => {
        const pulse = Math.sin(t * 0.002 + node.x) * 0.3 + 0.7;
        const gGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 5);
        gGrad.addColorStop(0, node.color + "40");
        gGrad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = gGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = node.color + "cc";
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex overflow-hidden">
      {/* Left Panel — Network visualization */}
      <div className="hidden lg:flex relative w-[46%] xl:w-[50%] flex-col justify-between p-10 overflow-hidden">
        {/* Canvas */}
        <AuthNetworkCanvas />

        {/* Ambient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-950/80 to-indigo-950/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(79,70,229,0.08),transparent)] pointer-events-none" />

        {/* Top left brand */}
        <Link href="/" className="relative z-10 flex items-center gap-3 group w-fit">
          <div className="relative w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700" />
            <span className="relative text-white font-black text-[10px] tracking-wider">V2</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-200 leading-none group-hover:text-white transition-colors">
              SRM Opportunity Intelligence
            </span>
            <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase mt-0.5">
              Student Platform
            </span>
          </div>
        </Link>

        {/* Bottom content */}
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono text-emerald-400 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Verified Opportunity Intelligence Network Active
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 leading-tight max-w-xs">
            Discover every verified campus opportunity.
          </h2>
          <p className="text-sm text-zinc-400 font-light max-w-xs leading-relaxed">
            Hackathons, internships, research programs and more — structured and surfaced for SRM students.
          </p>

          {/* Category dots */}
          <div className="flex flex-wrap gap-2 pt-2">
            {["Hackathons", "Internships", "Research", "Competitions", "Workshops", "Scholarships"].map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-zinc-900/80 border border-zinc-800 text-zinc-400 backdrop-blur-sm"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-zinc-800/60 to-transparent" />

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Background */}
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-zinc-900 relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-6 h-6 rounded-md overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700" />
              <span className="relative text-white font-black text-[9px] flex items-center justify-center h-full w-full">V2</span>
            </div>
            <span className="text-xs font-semibold text-zinc-200">SRM Opportunity Intelligence</span>
          </Link>
        </div>

        {/* Back button */}
        <div className="hidden lg:block absolute top-6 right-8 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-200 transition-colors py-1.5 px-3 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
        </div>

        {/* Auth content */}
        <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-10 relative z-10">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 text-center text-[11px] text-zinc-700 font-mono py-4 px-5">
          SRM Opportunity Intelligence Platform — V2 Secure Auth
        </footer>
      </div>
    </div>
  );
}
