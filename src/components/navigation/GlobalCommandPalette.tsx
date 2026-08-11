"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { searchCommandPaletteAction, CommandSearchResultItem } from "@/lib/search/actions";
import { UserRole } from "@/types";
import {
  Search,
  Command,
  Compass,
  Building2,
  Sparkles,
  X,
  ArrowRight,
} from "lucide-react";

interface GlobalCommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: UserRole | "guest";
}

export default function GlobalCommandPalette({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}: GlobalCommandPaletteProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleClose = useCallback(() => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
  }, [externalOnClose]);

  const router = useRouter();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<CommandSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [role, setRole] = useState<UserRole | "guest">("guest");
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search results from server action
  const fetchResults = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await searchCommandPaletteAction(q);
      setItems(res.items);
      setRole(res.role);
      setSelectedIndex(0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Global keydown listener for Cmd+K / Ctrl+K & Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (externalOnClose) {
          if (isOpen) externalOnClose();
        } else {
          setInternalIsOpen((prev) => !prev);
        }
      }

      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, externalOnClose, handleClose]);

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      fetchResults("");
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen, fetchResults]);

  // Debounced search on query change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) {
        fetchResults(query);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isOpen, fetchResults]);

  // Keyboard navigation inside command palette
  const handleKeyDownInPalette = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (items.length > 0 ? (prev - 1 + items.length) % items.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[selectedIndex]) {
        handleSelectItem(items[selectedIndex]);
      }
    }
  };

  const handleSelectItem = (item: CommandSearchResultItem) => {
    handleClose();
    router.push(item.url);
  };

  // Group items by category
  const pagesGroup = items.filter((i) => i.type === "page");
  const oppsGroup = items.filter((i) => i.type === "opportunity");
  const clubsGroup = items.filter((i) => i.type === "club");
  const actionsGroup = items.filter((i) => i.type === "action");

  const getItemIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case "club":
        return <Building2 className="w-4 h-4 text-amber-400" />;
      case "action":
        return <Command className="w-4 h-4 text-emerald-400" />;
      default:
        return <Compass className="w-4 h-4 text-indigo-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 pt-16 sm:pt-4 bg-zinc-950/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          onKeyDown={handleKeyDownInPalette}
        >
          {/* Header Search Input */}
          <div className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950/50">
            <Search className="w-5 h-5 text-purple-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search opportunities, clubs, or commands..."
              className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none font-mono"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-zinc-700">
              ESC
            </kbd>
          </div>

          {/* Search Results List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 font-mono">
            {loading && (
              <div className="p-6 text-center text-xs text-zinc-500">Searching Command Vector...</div>
            )}

            {!loading && items.length === 0 && (
              <div className="p-8 text-center space-y-2">
                <Search className="w-6 h-6 text-zinc-600 mx-auto" />
                <p className="text-xs font-bold text-zinc-400">No matching command or opportunity</p>
                <p className="text-[11px] text-zinc-500">
                  Try searching for &quot;Hackathon&quot;, &quot;Coding&quot;, or &quot;Club&quot;
                </p>
              </div>
            )}

            {!loading && (
              <>
                {/* Actions Group */}
                {actionsGroup.length > 0 && (
                  <SectionGroup title="Quick Actions">
                    {actionsGroup.map((item) => {
                      const overallIndex = items.indexOf(item);
                      const isSelected = overallIndex === selectedIndex;
                      return (
                        <CommandItem
                          key={item.id}
                          item={item}
                          isSelected={isSelected}
                          icon={getItemIcon(item.type)}
                          onSelect={() => handleSelectItem(item)}
                        />
                      );
                    })}
                  </SectionGroup>
                )}

                {/* Pages Group */}
                {pagesGroup.length > 0 && (
                  <SectionGroup title="Navigation Pages">
                    {pagesGroup.map((item) => {
                      const overallIndex = items.indexOf(item);
                      const isSelected = overallIndex === selectedIndex;
                      return (
                        <CommandItem
                          key={item.id}
                          item={item}
                          isSelected={isSelected}
                          icon={getItemIcon(item.type)}
                          onSelect={() => handleSelectItem(item)}
                        />
                      );
                    })}
                  </SectionGroup>
                )}

                {/* Opportunities Group */}
                {oppsGroup.length > 0 && (
                  <SectionGroup title="Verified Opportunities">
                    {oppsGroup.map((item) => {
                      const overallIndex = items.indexOf(item);
                      const isSelected = overallIndex === selectedIndex;
                      return (
                        <CommandItem
                          key={item.id}
                          item={item}
                          isSelected={isSelected}
                          icon={getItemIcon(item.type)}
                          onSelect={() => handleSelectItem(item)}
                        />
                      );
                    })}
                  </SectionGroup>
                )}

                {/* Clubs Group */}
                {clubsGroup.length > 0 && (
                  <SectionGroup title="SRM Organizations">
                    {clubsGroup.map((item) => {
                      const overallIndex = items.indexOf(item);
                      const isSelected = overallIndex === selectedIndex;
                      return (
                        <CommandItem
                          key={item.id}
                          item={item}
                          isSelected={isSelected}
                          icon={getItemIcon(item.type)}
                          onSelect={() => handleSelectItem(item)}
                        />
                      );
                    })}
                  </SectionGroup>
                )}
              </>
            )}
          </div>

          {/* Footer Keyboard Hints */}
          <div className="p-3 border-t border-zinc-800 bg-zinc-950/70 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">↵</kbd>
                <span>Select</span>
              </span>
            </div>
            <div className="capitalize text-[10px] text-purple-400 font-bold">
              Role: {role}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function SectionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h3 className="px-3 py-1 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}

function CommandItem({
  item,
  isSelected,
  icon,
  onSelect,
}: {
  item: CommandSearchResultItem;
  isSelected: boolean;
  icon: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full px-3 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
        isSelected
          ? "bg-purple-600/20 border border-purple-500/40 text-zinc-100"
          : "hover:bg-zinc-800/60 text-zinc-300 border border-transparent"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-1.5 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold truncate flex items-center gap-2">
            <span>{item.title}</span>
            {item.badge && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-800 text-purple-300 border border-zinc-700">
                {item.badge}
              </span>
            )}
          </div>
          {item.subtitle && (
            <p className="text-[11px] text-zinc-500 truncate font-light">{item.subtitle}</p>
          )}
        </div>
      </div>
      <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-purple-400" : "text-zinc-600"}`} />
    </button>
  );
}
