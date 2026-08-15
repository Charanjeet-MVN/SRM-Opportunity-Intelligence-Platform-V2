"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HoverCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export default function HoverCard({
  children,
  className = "",
  glowColor = "rgba(139, 92, 246, 0.15)",
  ...props
}: HoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-3xl bg-zinc-900/60 border border-zinc-800/80 transition-all duration-300 shadow-xl overflow-hidden hover:border-zinc-700/60 hover:shadow-2xl hover:shadow-purple-950/5 hover:-translate-y-1 ${className}`}
      {...props}
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

      <div className="relative z-10">{children}</div>
    </div>
  );
}
