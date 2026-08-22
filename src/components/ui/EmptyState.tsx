"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, Sparkles } from "lucide-react";
import Button from "./Button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
  secondaryActionText?: string;
  onSecondaryActionClick?: () => void;
  className?: string;
}

export function EmptyState({
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`py-14 px-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 text-center space-y-4 max-w-md mx-auto backdrop-blur-xl shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Subtle Ambient Radial Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        <div className="mx-auto w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-violet-400 shadow-inner">
          <Icon className="w-5 h-5" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-zinc-100 font-sans">{title}</h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        </div>

        {(actionText || secondaryActionText) && (
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            {secondaryActionText && onSecondaryActionClick && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onSecondaryActionClick}
              >
                {secondaryActionText}
              </Button>
            )}
            {actionText && onActionClick && (
              <Button
                variant="primary"
                size="sm"
                onClick={onActionClick}
              >
                {actionText}
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default EmptyState;
