"use client";

import React, { useState, useTransition } from "react";
import { toggleSaveOpportunityAction } from "@/lib/engagement/actions";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  opportunityId: string;
  initialIsSaved?: boolean;
}

export default function BookmarkButton({
  opportunityId,
  initialIsSaved = false,
}: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // Optimistic UI update
    setIsSaved((prev) => !prev);

    startTransition(async () => {
      const res = await toggleSaveOpportunityAction(opportunityId);
      if (res.error) {
        // Revert on error
        setIsSaved(initialIsSaved);
      } else {
        setIsSaved(res.isSaved);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isSaved ? "Remove Bookmark" : "Save Opportunity"}
      className={`p-2 rounded-xl transition-all cursor-pointer border ${
        isSaved
          ? "bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20"
          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700"
      }`}
    >
      <Bookmark className={`w-4 h-4 ${isSaved ? "fill-purple-400" : ""}`} />
    </button>
  );
}
