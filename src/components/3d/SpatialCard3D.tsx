"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface SpatialCard3DProps {
  children: React.ReactNode;
  className?: string;
  depth?: number; // max tilt degrees (default 12)
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

  // Raw cursor position normalized (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Specular light position in percentage
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  // Smooth spring physics
  const springConfig = { damping: 20, stiffness: 260, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [depth, -depth]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-depth, depth]), springConfig);
  const scale = useSpring(isHovered ? scaleOnHover : 1, springConfig);
  const translateZ = useSpring(isHovered ? elevationZ : 0, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const normX = clientX / width - 0.5;
      const normY = clientY / height - 0.5;

      mouseX.set(normX);
      mouseY.set(normY);

      glareX.set((clientX / width) * 100);
      glareY.set((clientY / height) * 100);
    },
    [mouseX, mouseY, glareX, glareY]
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
      style={{ perspective: `${perspective}px` }}
      className="relative"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          z: translateZ,
          transformStyle: "preserve-3d",
        }}
        className={`relative rounded-3xl transition-shadow duration-300 ${
          isHovered ? "shadow-3d-floating" : "shadow-3d-card"
        } ${className}`}
      >
        {/* Dynamic 3D Radial Glow underneath */}
        <motion.div
          style={{
            background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, ${glowColor}, transparent 70%)`,
            opacity: isHovered ? 1 : 0,
            transform: "translateZ(-10px)",
          }}
          className="absolute -inset-2 rounded-3xl blur-xl pointer-events-none transition-opacity duration-500"
        />

        {/* Card Content with 3D Preservation */}
        <div className="relative z-10 preserve-3d w-full h-full">
          {children}
        </div>

        {/* Specular Glare Reflection Layer */}
        <motion.div
          style={{
            background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255, 255, 255, ${glareOpacity}) 0%, transparent 60%)`,
            opacity: isHovered ? 1 : 0,
            transform: "translateZ(30px)",
          }}
          className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 mix-blend-overlay"
        />
      </motion.div>
    </div>
  );
}
