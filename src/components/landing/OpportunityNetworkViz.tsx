"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface Node {
  id: string;
  label: string;
  category: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  color: string;
  glowColor: string;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  orbitOffsetX: number;
  orbitOffsetY: number;
}

interface HoveredNode {
  id: string;
  label: string;
  category: string;
  screenX: number;
  screenY: number;
}

const CATEGORY_NODES: Omit<Node, "x" | "y" | "z" | "orbitAngle">[] = [
  { id: "hackathon", label: "Hackathons", category: "Competition · Build", radius: 7, color: "#818cf8", glowColor: "rgba(129,140,248,0.4)", orbitRadius: 130, orbitSpeed: 0.0004, orbitOffsetX: 0, orbitOffsetY: -20 },
  { id: "internship", label: "Internships", category: "Career · Growth", radius: 7, color: "#34d399", glowColor: "rgba(52,211,153,0.4)", orbitRadius: 160, orbitSpeed: -0.00035, orbitOffsetX: 30, orbitOffsetY: 25 },
  { id: "research", label: "Research", category: "Academic · Publication", radius: 6, color: "#60a5fa", glowColor: "rgba(96,165,250,0.35)", orbitRadius: 110, orbitSpeed: 0.0006, orbitOffsetX: -25, orbitOffsetY: 30 },
  { id: "competition", label: "Competitions", category: "Skill · Recognition", radius: 5.5, color: "#f472b6", glowColor: "rgba(244,114,182,0.35)", orbitRadius: 145, orbitSpeed: -0.00045, orbitOffsetX: -35, orbitOffsetY: -15 },
  { id: "workshop", label: "Workshops", category: "Learning · Upskill", radius: 5, color: "#fb923c", glowColor: "rgba(251,146,60,0.35)", orbitRadius: 175, orbitSpeed: 0.0003, orbitOffsetX: 20, orbitOffsetY: -30 },
  { id: "scholarship", label: "Scholarships", category: "Finance · Support", radius: 5, color: "#a78bfa", glowColor: "rgba(167,139,250,0.35)", orbitRadius: 120, orbitSpeed: -0.0005, orbitOffsetX: 35, orbitOffsetY: 10 },
];

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function OpportunityNetworkViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, smoothX: 0, smoothY: 0 });
  const nodesRef = useRef<Node[]>([]);
  const timeRef = useRef(0);
  const [hoveredNode, setHoveredNode] = useState<HoveredNode | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const initNodes = useCallback(() => {
    nodesRef.current = CATEGORY_NODES.map((def, i) => ({
      ...def,
      x: 0,
      y: 0,
      z: 0,
      orbitAngle: (i / CATEGORY_NODES.length) * Math.PI * 2,
    }));
  }, []);

  useEffect(() => {
    initNodes();
  }, [initNodes]);

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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    container.addEventListener("mousemove", handleMouseMove);

    const drawFrame = (timestamp: number) => {
      const W = canvas.width / window.devicePixelRatio;
      const H = canvas.height / window.devicePixelRatio;
      const cx = W / 2;
      const cy = H / 2;

      // Smooth mouse
      const sm = mouseRef.current;
      sm.smoothX += (sm.x - sm.smoothX) * 0.05;
      sm.smoothY += (sm.y - sm.smoothY) * 0.05;

      const dt = reducedMotion ? 0 : 16;
      timeRef.current += dt;
      const t = timeRef.current;

      ctx.clearRect(0, 0, W, H);

      // Tilt matrix from mouse
      const tiltX = sm.smoothY * 0.18;
      const tiltY = sm.smoothX * 0.25;

      // Update node 3D positions
      nodesRef.current.forEach((node) => {
        node.orbitAngle += node.orbitSpeed * dt;
        const angle = node.orbitAngle;
        const r = node.orbitRadius;
        const nx3d = r * Math.cos(angle) + node.orbitOffsetX;
        const ny3d = r * Math.sin(angle) * 0.55 + node.orbitOffsetY;
        const nz3d = r * Math.sin(angle) * 0.35;

        // Apply tilt
        node.x = nx3d * Math.cos(tiltY) + nz3d * Math.sin(tiltY);
        node.y = ny3d * Math.cos(tiltX) - nz3d * Math.sin(tiltX);
        node.z = -nx3d * Math.sin(tiltY) + nz3d * Math.cos(tiltY);
      });

      // Sort by z
      const sorted = [...nodesRef.current].sort((a, b) => a.z - b.z);

      // Perspective
      const fov = 600;
      const project = (x: number, y: number, z: number) => {
        const scale = fov / (fov + z + 200);
        return {
          sx: cx + x * scale,
          sy: cy + y * scale,
          scale,
        };
      };

      // Draw connection lines to center
      sorted.forEach((node) => {
        const { sx, sy, scale } = project(node.x, node.y, node.z);
        const brightness = Math.max(0, Math.min(1, (node.z + 200) / 400));
        const alpha = 0.08 + brightness * 0.15;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(sx, sy);

        const grad = ctx.createLinearGradient(cx, cy, sx, sy);
        grad.addColorStop(0, `rgba(99,102,241,${alpha * 0.8})`);
        grad.addColorStop(1, node.color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
        ctx.strokeStyle = grad;
        ctx.lineWidth = scale * 0.7;
        ctx.stroke();
      });

      // Animated pulse lines
      const pulseT = ((t * 0.0008) % 1);
      sorted.forEach((node, i) => {
        if (i % 2 !== 0) return;
        const { sx, sy } = project(node.x, node.y, node.z);
        const pt = easeInOutSine((pulseT + i * 0.2) % 1);
        const px = cx + (sx - cx) * pt;
        const py = cy + (sy - cy) * pt;

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = node.color + "cc";
        ctx.fill();
      });

      // Draw inter-node connections
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const a = sorted[i];
          const b = sorted[j];
          const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
          if (dist < 160) {
            const pa = project(a.x, a.y, a.z);
            const pb = project(b.x, b.y, b.z);
            const alpha = (1 - dist / 160) * 0.08;
            ctx.beginPath();
            ctx.moveTo(pa.sx, pa.sy);
            ctx.lineTo(pb.sx, pb.sy);
            ctx.strokeStyle = `rgba(148,163,184,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw central node
      const centralPulse = Math.sin(t * 0.002) * 0.3 + 0.7;
      const cgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 36);
      cgGrad.addColorStop(0, `rgba(129,140,248,${centralPulse * 0.25})`);
      cgGrad.addColorStop(1, "rgba(129,140,248,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 36, 0, Math.PI * 2);
      ctx.fillStyle = cgGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#6366f1";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(199,210,254,${centralPulse * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Ring
      const ringR = 16 + Math.sin(t * 0.0015) * 3;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(129,140,248,${centralPulse * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw orbit nodes
      sorted.forEach((node) => {
        const { sx, sy, scale } = project(node.x, node.y, node.z);
        const r = node.radius * scale;

        // Glow
        const gGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 4);
        gGrad.addColorStop(0, node.glowColor);
        gGrad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(sx, sy, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = gGrad;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        const dotGrad = ctx.createRadialGradient(sx - r * 0.3, sy - r * 0.3, 0, sx, sy, r);
        dotGrad.addColorStop(0, "#fff");
        dotGrad.addColorStop(0.4, node.color);
        dotGrad.addColorStop(1, node.color + "88");
        ctx.fillStyle = dotGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sx, sy, r + 2, 0, Math.PI * 2);
        ctx.strokeStyle = node.color + "55";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      animFrameRef.current = requestAnimationFrame(drawFrame);
    };

    animFrameRef.current = requestAnimationFrame(drawFrame);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [reducedMotion]);

  // Hit-testing for hover
  const handleMouseMovePanels = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const W = rect.width;
    const H = rect.height;
    const cx = W / 2;
    const cy = H / 2;
    const fov = 600;

    const sm = mouseRef.current;
    const tiltY = sm.smoothX * 0.25;
    const tiltX = sm.smoothY * 0.18;

    let found: HoveredNode | null = null;
    for (const node of nodesRef.current) {
      const nx3d = node.orbitRadius * Math.cos(node.orbitAngle) + node.orbitOffsetX;
      const ny3d = node.orbitRadius * Math.sin(node.orbitAngle) * 0.55 + node.orbitOffsetY;
      const nz3d = node.orbitRadius * Math.sin(node.orbitAngle) * 0.35;
      const px = nx3d * Math.cos(tiltY) + nz3d * Math.sin(tiltY);
      const py = ny3d * Math.cos(tiltX) - nz3d * Math.sin(tiltX);
      const pz = -nx3d * Math.sin(tiltY) + nz3d * Math.cos(tiltY);
      const scale = fov / (fov + pz + 200);
      const sx = cx + px * scale;
      const sy = cy + py * scale;
      const hitR = node.radius * scale * 3.5;
      const dist = Math.sqrt((mx - sx) ** 2 + (my - sy) ** 2);
      if (dist < hitR) {
        found = { id: node.id, label: node.label, category: node.category, screenX: sx, screenY: sy };
        break;
      }
    }
    setHoveredNode(found);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] overflow-hidden rounded-2xl cursor-crosshair select-none"
      onMouseMove={handleMouseMovePanels}
      onMouseLeave={() => setHoveredNode(null)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Central label overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-[10px] font-mono font-bold tracking-[0.25em] text-indigo-400 uppercase mb-1">
            Intelligence Engine
          </div>
          <div className="text-[9px] font-mono text-zinc-500 tracking-wider">
            Opportunity Discovery
          </div>
        </div>
      </div>

      {/* Hover panel */}
      {hoveredNode && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: Math.min(hoveredNode.screenX + 14, (containerRef.current?.clientWidth ?? 400) - 160),
            top: Math.max(hoveredNode.screenY - 40, 8),
          }}
        >
          <div className="px-3 py-2 rounded-xl bg-zinc-950/95 border border-zinc-700/60 shadow-2xl backdrop-blur-xl min-w-[130px]">
            <div className="text-xs font-semibold text-zinc-100 mb-0.5">{hoveredNode.label}</div>
            <div className="text-[10px] text-zinc-400 font-mono mb-2">{hoveredNode.category}</div>
            <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>Explore →</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom label overlay */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] font-mono text-zinc-600 pointer-events-none">
        {CATEGORY_NODES.map((n) => (
          <span key={n.id} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: n.color }} />
            {n.label}
          </span>
        ))}
      </div>
    </div>
  );
}
