"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Check, Copy, MessageCircle, Twitter, Linkedin, X } from "lucide-react";

interface ShareOpportunityButtonProps {
  title: string;
  url?: string;
  className?: string;
}

export default function ShareOpportunityButton({
  title,
  url,
  className = "",
}: ShareOpportunityButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      }
    } catch {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    const shareUrl = getShareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out ${title} on SRM Opportunity Intelligence Platform!`,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or share failed, fallback to modal
      }
    }
    setIsOpen(true);
  };

  const shareUrl = getShareUrl();
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`Check out "${title}" on SRM Opportunity Intelligence:`);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNativeShare}
        title="Share Opportunity"
        className={`p-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 hover:border-zinc-700 backdrop-blur-md transition-colors flex items-center justify-center gap-2 cursor-pointer ${className}`}
      >
        <Share2 className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-mono hidden sm:inline">Share</span>
      </motion.button>

      {/* Share Dialog Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-zinc-950/95 border border-zinc-800 rounded-3xl p-6 shadow-2xl z-10 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">Share Opportunity</h3>
                    <p className="text-[11px] text-zinc-400 font-mono">Spread the word to fellow peers</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title preview */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <p className="text-xs font-semibold text-zinc-200 line-clamp-2">{title}</p>
              </div>

              {/* Social Channels */}
              <div className="grid grid-cols-3 gap-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 flex flex-col items-center gap-1.5 transition-all text-xs font-mono"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 flex flex-col items-center gap-1.5 transition-all text-xs font-mono"
                >
                  <Twitter className="w-5 h-5" />
                  <span>X / Twitter</span>
                </a>

                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 flex flex-col items-center gap-1.5 transition-all text-xs font-mono"
                >
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                </a>
              </div>

              {/* Direct Copy link Bar */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Direct Link
                </label>
                <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-xs text-zinc-400 truncate flex-1 font-mono">
                    {shareUrl}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      copied
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
