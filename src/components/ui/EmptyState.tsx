"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
}

export default function EmptyState({
  title,
  description,
  actionText,
  onActionClick,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-16 text-center space-y-4 font-mono"
    >
      <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-center justify-center text-purple-400 shadow-inner">
        <AlertCircle className="w-5 h-5 animate-pulse" />
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-zinc-200">{title}</h4>
        <p className="text-[11px] text-zinc-500 font-light leading-relaxed max-w-xs mx-auto">{description}</p>
      </div>
      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="px-3.5 py-1.5 bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-[10px] font-bold text-purple-400 transition-all cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </motion.div>
  );
}
