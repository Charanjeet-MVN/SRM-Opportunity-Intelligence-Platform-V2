"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";

interface HoverCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  maxTilt?: number;
}

export default function HoverCard({
  children,
  className = "",
  glowColor = "rgba(139, 92, 246, 0.12)",
  maxTilt = 8,
  ...props
}: HoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth spring physics for responsive 3D tilt tracking
  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    // Degree calculations based on center pointer offset
    const rotX = -((y / rect.height) - 0.5) * maxTilt;
    const rotY = ((x / rect.width) - 0.5) * maxTilt;
    rotateX.set(rotX);
    rotateY.set(rotY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      whileHover={{ scale: 1.015 }}
      className={`relative rounded-3xl bg-zinc-900/60 border border-zinc-850/80 transition-all duration-300 shadow-xl overflow-hidden hover:border-zinc-750/80 hover:shadow-2xl hover:shadow-purple-950/5 ${className}`}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
    >
      {/* Dynamic follow-mouse glow light */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute pointer-events-none rounded-full blur-2xl"
            style={{
              width: "180px",
              height: "180px",
              left: coords.x - 90,
              top: coords.y - 90,
              background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
              mixBlendMode: "screen",
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 transform-style-3d translate-z-[12px]">{children}</div>
    </motion.div>
  );
}
