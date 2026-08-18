"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, Sparkles } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
  secondaryActionText?: string;
  onSecondaryActionClick?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionText,
  onActionClick,
  secondaryActionText,
  onSecondaryActionClick,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`py-16 px-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 text-center space-y-4 max-w-md mx-auto backdrop-blur-2xl shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Soft Ambient Radial Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4 font-mono">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400 shadow-inner">
          <Icon className="w-5 h-5 text-purple-400" />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold text-zinc-100 font-sans">{title}</h3>
          <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        </div>

        {(actionText || secondaryActionText) && (
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            {secondaryActionText && onSecondaryActionClick && (
              <button
                onClick={onSecondaryActionClick}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                {secondaryActionText}
              </button>
            )}
            {actionText && onActionClick && (
              <button
                onClick={onActionClick}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold shadow-md shadow-purple-600/25 transition-all cursor-pointer"
              >
                {actionText}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
