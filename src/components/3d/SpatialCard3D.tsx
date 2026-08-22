"use client";

import React, { useRef, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";

interface SpatialCard3DProps {
  children: React.ReactNode;
  className?: string;
  depth?: number; // max tilt degrees (default 10)
  glareOpacity?: number; // 0 to 1
  perspective?: number; // default 1200
  scaleOnHover?: number; // default 1.02
  glowColor?: string; // custom radial glow
  elevationZ?: number; // lift on hover in px
}

export default function SpatialCard3D({
  children,
  className = "",
  depth = 10,
  glareOpacity = 0.15,
  perspective = 1200,
  scaleOnHover = 1.02,
  glowColor = "rgba(99, 102, 241, 0.18)",
  elevationZ = 20,
}: SpatialCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Raw cursor position normalized (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Specular light position in percentage
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  // Smooth spring physics (disabled if user prefers reduced motion)
  const effectiveDepth = shouldReduceMotion ? 0 : depth;
  const effectiveElevation = shouldReduceMotion ? 0 : elevationZ;
  const effectiveScale = shouldReduceMotion ? 1 : scaleOnHover;

  const springConfig = { damping: 22, stiffness: 240, mass: 0.6 };
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [effectiveDepth, -effectiveDepth]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-effectiveDepth, effectiveDepth]),
    springConfig
  );
  const scale = useSpring(isHovered ? effectiveScale : 1, springConfig);
  const translateZ = useSpring(isHovered ? effectiveElevation : 0, springConfig);

  // Reactive motion templates for GPU-accelerated specular gradients
  const glowBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, ${glowColor}, transparent 70%)`;
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, ${glareOpacity}) 0%, transparent 60%)`;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (shouldReduceMotion || !cardRef.current) return;
      if (typeof window !== "undefined" && window.matchMedia && !window.matchMedia("(hover: hover)").matches) {
        return;
      }
      const rect = cardRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (width === 0 || height === 0) return;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const normX = clientX / width - 0.5;
      const normY = clientY / height - 0.5;

      mouseX.set(normX);
      mouseY.set(normY);

      glareX.set(Math.max(0, Math.min(100, (clientX / width) * 100)));
      glareY.set(Math.max(0, Math.min(100, (clientY / height) * 100)));
    },
    [mouseX, mouseY, glareX, glareY, shouldReduceMotion]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    glareX.set(50);
    glareY.set(50);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: shouldReduceMotion ? "none" : `${perspective}px` }}
      className="relative"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          z: translateZ,
          transformStyle: shouldReduceMotion ? "flat" : "preserve-3d",
        }}
        className={`relative rounded-3xl transition-shadow duration-300 ${
          isHovered ? "shadow-3d-floating" : "shadow-3d-card"
        } ${className}`}
      >
        {/* Dynamic 3D Radial Glow underneath */}
        {!shouldReduceMotion && (
          <motion.div
            style={{
              background: glowBackground,
              opacity: isHovered ? 1 : 0,
              transform: "translateZ(-10px)",
            }}
            className="absolute -inset-2 rounded-3xl blur-xl pointer-events-none transition-opacity duration-500"
          />
        )}

        {/* Card Content with 3D Preservation */}
        <div className={`relative z-10 w-full h-full ${shouldReduceMotion ? "" : "preserve-3d"}`}>
          {children}
        </div>

        {/* Specular Glare Reflection Layer */}
        {!shouldReduceMotion && (
          <motion.div
            style={{
              background: glareBackground,
              opacity: isHovered ? 1 : 0,
              transform: "translateZ(30px)",
            }}
            className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 mix-blend-overlay"
          />
        )}
      </motion.div>
    </div>
  );
}

