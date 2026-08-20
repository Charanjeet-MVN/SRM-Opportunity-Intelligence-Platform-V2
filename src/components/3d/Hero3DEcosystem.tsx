"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import * as THREE from "three";
import {
  Trophy,
  Briefcase,
  FlaskConical,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Compass,
} from "lucide-react";
import Link from "next/link";
import SpatialCard3D from "./SpatialCard3D";

interface FloatingCardSpec {
  id: string;
  category: "Hackathon" | "Internship" | "Research" | "Scholarship" | "Competition";
  title: string;
  organizer: string;
  rewardBadge: string;
  deadlineLabel: string;
  icon: React.ElementType;
  gradient: string;
  glowColor: string;
  borderClass: string;
  depthZ: number;
}

const FEATURED_3D_OPPORTUNITIES: FloatingCardSpec[] = [
  {
    id: "opp-1",
    category: "Hackathon",
    title: "SRM National AI & Cloud Hackathon 2026",
    organizer: "Directorate of Student Affairs & IEEE",
    rewardBadge: "₹3,50,000 Prize Pool",
    deadlineLabel: "Closing in 48h",
    icon: Trophy,
    gradient: "from-purple-900/40 via-zinc-950 to-zinc-950",
    glowColor: "rgba(168, 85, 247, 0.25)",
    borderClass: "border-purple-500/40",
    depthZ: 40,
  },
  {
    id: "opp-2",
    category: "Internship",
    title: "NVIDIA Distributed Systems Summer Fellow",
    organizer: "NVIDIA AI Research Lab",
    rewardBadge: "₹85,000/mo + PPO Track",
    deadlineLabel: "Verified Direct Drive",
    icon: Briefcase,
    gradient: "from-emerald-900/40 via-zinc-950 to-zinc-950",
    glowColor: "rgba(16, 185, 129, 0.25)",
    borderClass: "border-emerald-500/40",
    depthZ: 25,
  },
  {
    id: "opp-3",
    category: "Research",
    title: "Autonomous Robotics & Vision Research Grant",
    organizer: "SRM Innovation Lab & Dean of Research",
    rewardBadge: "₹1,20,000 Lab Grant",
    deadlineLabel: "Peer-Review Track",
    icon: FlaskConical,
    gradient: "from-indigo-900/40 via-zinc-950 to-zinc-950",
    glowColor: "rgba(99, 102, 241, 0.25)",
    borderClass: "border-indigo-500/40",
    depthZ: 35,
  },
  {
    id: "opp-4",
    category: "Scholarship",
    title: "Global Tech Innovation Merit Fellowship",
    organizer: "SRM Alumni Association & Google",
    rewardBadge: "100% Tuition Waiver",
    deadlineLabel: "Annual Cohort",
    icon: Award,
    gradient: "from-amber-900/40 via-zinc-950 to-zinc-950",
    glowColor: "rgba(245, 158, 11, 0.25)",
    borderClass: "border-amber-500/40",
    depthZ: 15,
  },
];

import { useReducedMotion } from "framer-motion";

export default function Hero3DEcosystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const shouldReduceMotion = useReducedMotion();

  // Mouse Parallax Physics for the 3D Stage
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 180, mass: 0.8 };
  const stageRotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [6, -6]),
    springConfig
  );
  const stageRotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-8, 8]),
    springConfig
  );

  // Three.js WebGL Particle Constellation & Volumetric Grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    const updateSize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    updateSize();
    window.addEventListener("resize", updateSize, { passive: true });

    // Particle Cloud Geometry (scaled down for reduced motion or mobile)
    const particleCount = shouldReduceMotion ? 60 : 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColorA = new THREE.Color("#6366f1");
    const baseColorB = new THREE.Color("#8b5cf6");
    const baseColorC = new THREE.Color("#10b981");

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      const chosenColor =
        i % 3 === 0 ? baseColorA : i % 3 === 1 ? baseColorB : baseColorC;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Subtle Vector Lines connecting nodes
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.12,
    });

    const lineGeo = new THREE.BufferGeometry();
    const linePositions: number[] = [];

    for (let i = 0; i < (shouldReduceMotion ? 15 : 40); i++) {
      const idx1 = Math.floor(Math.random() * particleCount);
      const idx2 = Math.floor(Math.random() * particleCount);

      linePositions.push(
        positions[idx1 * 3],
        positions[idx1 * 3 + 1],
        positions[idx1 * 3 + 2],
        positions[idx2 * 3],
        positions[idx2 * 3 + 1],
        positions[idx2 * 3 + 2]
      );
    }

    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // Initial render
    renderer.render(scene, camera);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      if (shouldReduceMotion) return;
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      particles.rotation.y = elapsed * 0.04;
      particles.rotation.x = Math.sin(elapsed * 0.02) * 0.05;
      lines.rotation.y = elapsed * 0.04;

      renderer.render(scene, camera);
    };

    if (!shouldReduceMotion) {
      animate();
    }

    return () => {
      window.removeEventListener("resize", updateSize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      renderer.dispose();
    };
  }, [shouldReduceMotion]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const filteredOpportunities = FEATURED_3D_OPPORTUNITIES.filter(
    (o) => activeCategory === "All" || o.category === activeCategory
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[580px] lg:min-h-[660px] w-full rounded-3xl overflow-hidden border border-zinc-800/80 bg-zinc-950/70 p-6 sm:p-10 shadow-2xl flex flex-col justify-between perspective-1500 backdrop-blur-2xl"
    >
      {/* Three.js Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Top Specular Horizon Beam */}
      <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />

      {/* Header Info & Category Filter Strip */}
      <div className="relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Interactive 3D Opportunity Ecosystem</span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-bold">SRM Live Sync</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-100 font-sans">
              Discover Campus Opportunities in Spatial Dimension
            </h2>
          </div>

          {/* Realtime Telemetry Pill */}
          <div className="flex items-center gap-3 self-start sm:self-auto font-mono text-xs text-zinc-400 bg-zinc-900/80 px-3.5 py-1.5 rounded-2xl border border-zinc-800 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>350+ Verified Active Listings</span>
          </div>
        </div>

        {/* Category Filter Nodes */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono">
          {["All", "Hackathon", "Internship", "Research", "Scholarship"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/50"
                  : "bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <span>{cat === "All" ? "All Ecosystems" : `${cat}s`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Floating Stage with Parallax */}
      <motion.div
        style={{
          rotateX: stageRotateX,
          rotateY: stageRotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-6 preserve-3d"
      >
        {filteredOpportunities.map((opp, idx) => {
          const Icon = opp.icon;
          return (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 20, z: -20 }}
              animate={{ opacity: 1, y: 0, z: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              style={{
                transform: `translateZ(${opp.depthZ}px)`,
                transformStyle: "preserve-3d",
              }}
              className="preserve-3d"
            >
              <SpatialCard3D
                depth={10}
                elevationZ={24}
                glowColor={opp.glowColor}
                className="h-full"
              >
                <div
                  className={`p-5 sm:p-6 rounded-3xl bg-gradient-to-b ${opp.gradient} border ${opp.borderClass} flex flex-col justify-between gap-4 h-full shadow-2xl relative overflow-hidden backdrop-blur-xl preserve-3d`}
                >
                  {/* Category & Status Bar */}
                  <div
                    style={{ transform: "translateZ(26px)" }}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-200 shadow-sm">
                        <Icon className="w-4 h-4 text-indigo-400" />
                      </div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                        {opp.category}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-900/90 border border-zinc-800 text-amber-300 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      {opp.deadlineLabel}
                    </span>
                  </div>

                  {/* Title & Organization */}
                  <div style={{ transform: "translateZ(18px)" }} className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{opp.organizer}</span>
                    </p>
                  </div>

                  {/* Reward & Interactive CTA */}
                  <div
                    style={{ transform: "translateZ(28px)" }}
                    className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono font-bold">
                      {opp.rewardBadge}
                    </span>

                    <Link
                      href="/opportunities"
                      className="inline-flex items-center gap-1.5 font-mono font-bold text-indigo-400 hover:text-indigo-300 transition-all group/btn"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </SpatialCard3D>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Footer Navigation Bar */}
      <div className="relative z-10 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>Move cursor to tilt and navigate the 3D opportunity vector field</span>
        </div>

        <Link
          href="/opportunities"
          className="inline-flex items-center gap-2 text-indigo-300 hover:text-white font-bold transition-colors"
        >
          <span>View All 350+ Campus Opportunities</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
