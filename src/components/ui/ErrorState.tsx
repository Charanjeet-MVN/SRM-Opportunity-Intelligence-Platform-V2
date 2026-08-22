"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Unable to load content",
  message = "A temporary network issue occurred while loading this section. Please try again.",
  onRetry,
  isRetrying = false,
  className = "",
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`py-12 px-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 text-center space-y-4 max-w-md mx-auto backdrop-blur-xl shadow-xl relative overflow-hidden ${className}`}
    >
      <div className="mx-auto w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
        <AlertTriangle className="w-5 h-5" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-zinc-100 font-sans">{title}</h3>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-xs mx-auto">
          {message}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            isLoading={isRetrying}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Try Again
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export default ErrorState;
