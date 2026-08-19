"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
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
  Star,
  History,
  CornerDownLeft,
  Settings,
  User,
  Plus,
  Zap,
  Loader2,
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

  // Favorites & Recents States
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<CommandSearchResultItem[]>([]);

  // Load favorites & recents from localStorage on mount & open
  const loadLocalCache = useCallback(() => {
    try {
      const savedFavs = localStorage.getItem("soip_command_favorites");
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
      const savedRecs = localStorage.getItem("soip_command_recent");
      if (savedRecs) {
        setRecents(JSON.parse(savedRecs));
      }
    } catch (e) {
      console.error("Failed to load local storage commands cache", e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadLocalCache();
    }
  }, [isOpen, loadLocalCache]);

  // Fetch search results from server action
  const fetchResults = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await searchCommandPaletteAction(q);
      setItems(res.items);
      setRole(res.role);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K & Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (externalOnClose) {
          if (isOpen) {
            handleClose();
          } else {
            // Open via custom event or state
            if (externalIsOpen === undefined) setInternalIsOpen(true);
          }
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
  }, [isOpen, externalIsOpen, externalOnClose, handleClose]);

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
    }, 120);

    return () => clearTimeout(timer);
  }, [query, isOpen, fetchResults]);

  // Reset selected index when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  // Toggle Pinned/Favorite Action
  const toggleFavorite = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    let updated: string[];
    if (favorites.includes(itemId)) {
      updated = favorites.filter((id) => id !== itemId);
    } else {
      updated = [...favorites, itemId];
    }
    setFavorites(updated);
    try {
      localStorage.setItem("soip_command_favorites", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Record viewed/triggered command in history
  const recordRecentAction = (item: CommandSearchResultItem) => {
    try {
      // Don't record duplicate ids in recents list
      const updatedRecs = [item, ...recents.filter((r) => r.id !== item.id)].slice(0, 5);
      setRecents(updatedRecs);
      localStorage.setItem("soip_command_recent", JSON.stringify(updatedRecs));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectItem = (item: CommandSearchResultItem) => {
    recordRecentAction(item);
    handleClose();
    router.push(item.url);
  };

  // Sort and Categorize Items for Rendering
  // Pinned Favorites are grouped and rendered at the very top
  const categorizedItems = useMemo(() => {
    const pinned: CommandSearchResultItem[] = [];
    const unpinned: CommandSearchResultItem[] = [];

    items.forEach((item) => {
      if (favorites.includes(item.id)) {
        pinned.push(item);
      } else {
        unpinned.push(item);
      }
    });

    // We build a flat array representing the exact display index list for keyboard arrow navigation
    const flatList: CommandSearchResultItem[] = [];
    
    // 1. Favorites Group (only if query matches or empty)
    if (pinned.length > 0) flatList.push(...pinned);

    // 2. Recent Activities Group (only when search query is empty)
    const recentToShow = query.trim() === "" ? recents : [];
    if (recentToShow.length > 0) {
      // Deduplicate if any recent items are already in pinned
      const filteredRecents = recentToShow.filter(r => !pinned.some(p => p.id === r.id));
      flatList.push(...filteredRecents);
    }

    // 3. Regular items grouped by sections
    const regularItems = unpinned.filter(r => !recentToShow.some(rc => rc.id === r.id));
    flatList.push(...regularItems);

    return {
      flatList,
      pinned,
      recents: query.trim() === "" ? recents.filter(r => !pinned.some(p => p.id === r.id)) : [],
      actions: regularItems.filter((i) => i.type === "action"),
      pages: regularItems.filter((i) => i.type === "page"),
      opportunities: regularItems.filter((i) => i.type === "opportunity"),
      clubs: regularItems.filter((i) => i.type === "club"),
    };
  }, [items, favorites, recents, query]);

  // Keyboard navigation inside command palette
  const handleKeyDownInPalette = (e: React.KeyboardEvent) => {
    const listLength = categorizedItems.flatList.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (listLength > 0 ? (prev + 1) % listLength : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (listLength > 0 ? (prev - 1 + listLength) % listLength : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetItem = categorizedItems.flatList[selectedIndex];
      if (targetItem) {
        handleSelectItem(targetItem);
      }
    }
  };

  const getItemIcon = (type: string, id: string) => {
    if (id.includes("copilot")) return <Sparkles className="w-4 h-4 text-purple-400" />;
    if (id.includes("profile")) return <User className="w-4 h-4 text-indigo-400" />;
    if (id.includes("settings")) return <Settings className="w-4 h-4 text-zinc-400" />;
    if (id.includes("create")) return <Plus className="w-4 h-4 text-emerald-400" />;

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
          initial={{ opacity: 0, scale: 0.97, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -12 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette"
          className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative"
          onKeyDown={handleKeyDownInPalette}
        >
          {/* Top border ambient glow */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

          {/* Header Search Input */}
          <div className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950/50">
            <Search className="w-5 h-5 text-purple-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-label="Search opportunities, organizations, or commands"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search opportunities, clubs, settings, or actions..."
              className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none font-mono"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-zinc-700 select-none">
              ESC
            </kbd>
          </div>

          {/* Search Results List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 font-mono scrollbar-none">
            {loading && (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                <span className="text-xs text-zinc-500">Querying intelligence vector...</span>
              </div>
            )}

            {!loading && categorizedItems.flatList.length === 0 && (
              <div className="p-10 text-center space-y-2">
                <Search className="w-8 h-8 text-zinc-700 mx-auto stroke-[1.2]" />
                <p className="text-xs font-bold text-zinc-400">No matching commands or opportunities</p>
                <p className="text-[11px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  Try searching for keywords like &quot;hack&quot;, &quot;profile&quot;, &quot;create&quot;, or &quot;internship&quot; to invoke instant filters.
                </p>
              </div>
            )}

            {!loading && (
              <>
                {/* 1. Favorites Category */}
                {categorizedItems.pinned.length > 0 && (
                  <SectionGroup title="Favorites">
                    {categorizedItems.pinned.map((item) => {
                      const overallIndex = categorizedItems.flatList.findIndex((x) => x.id === item.id);
                      const isSelected = overallIndex === selectedIndex;
                      return (
                        <CommandItem
                          key={`pinned-${item.id}`}
                          item={item}
                          isSelected={isSelected}
                          isFavorite={true}
                          icon={getItemIcon(item.type, item.id)}
                          onSelect={() => handleSelectItem(item)}
                          onToggleFav={(e) => toggleFavorite(item.id, e)}
                        />
                      );
                    })}
                  </SectionGroup>
                )}

                {/* 2. Recent Activity Category */}
                {categorizedItems.recents.length > 0 && (
                  <SectionGroup title="Recent Activity" icon={<History className="w-3 h-3 text-zinc-500" />}>
                    {categorizedItems.recents.map((item) => {
                      const overallIndex = categorizedItems.flatList.findIndex((x) => x.id === item.id);
                      const isSelected = overallIndex === selectedIndex;
                      return (
                        <CommandItem
                          key={`recent-${item.id}`}
                          item={item}
                          isSelected={isSelected}
                          isFavorite={favorites.includes(item.id)}
                          icon={getItemIcon(item.type, item.id)}
                          onSelect={() => handleSelectItem(item)}
                          onToggleFav={(e) => toggleFavorite(item.id, e)}
                        />
                      );
                    })}
                  </SectionGroup>
                )}

                {/* 3. Quick Actions */}
                {categorizedItems.actions.length > 0 && (
                  <SectionGroup title="Quick Actions">
                    {categorizedItems.actions.map((item) => {
                      const overallIndex = categorizedItems.flatList.findIndex((x) => x.id === item.id);
                      const isSelected = overallIndex === selectedIndex;
                      return (
                        <CommandItem
                          key={item.id}
                          item={item}
                          isSelected={isSelected}
                          isFavorite={favorites.includes(item.id)}
                          icon={getItemIcon(item.type, item.id)}
                          onSelect={() => handleSelectItem(item)}
                          onToggleFav={(e) => toggleFavorite(item.id, e)}
                        />
                      );
                    })}
                  </SectionGroup>
                )}

                {/* 4. Pages */}
                {categorizedItems.pages.length > 0 && (
                  <SectionGroup title="Navigation">
                    {categorizedItems.pages.map((item) => {
                      const overallIndex = categorizedItems.flatList.findIndex((x) => x.id === item.id);
                      const isSelected = overallIndex === selectedIndex;
                      return (
                        <CommandItem
                          key={item.id}
                          item={item}
                          isSelected={isSelected}
                          isFavorite={favorites.includes(item.id)}
                          icon={getItemIcon(item.type, item.id)}
                          onSelect={() => handleSelectItem(item)}
                          onToggleFav={(e) => toggleFavorite(item.id, e)}
                        />
                      );
                    })}
                  </SectionGroup>
                )}

                {/* 5. Opportunities */}
                {categorizedItems.opportunities.length > 0 && (
                  <SectionGroup title="Verified Opportunities">
                    {categorizedItems.opportunities.map((item) => {
                      const overallIndex = categorizedItems.flatList.findIndex((x) => x.id === item.id);
                      const isSelected = overallIndex === selectedIndex;
                      return (
                        <CommandItem
                          key={item.id}
                          item={item}
                          isSelected={isSelected}
                          isFavorite={favorites.includes(item.id)}
                          icon={getItemIcon(item.type, item.id)}
                          onSelect={() => handleSelectItem(item)}
                          onToggleFav={(e) => toggleFavorite(item.id, e)}
                        />
                      );
                    })}
                  </SectionGroup>
                )}

                {/* 6. Clubs */}
                {categorizedItems.clubs.length > 0 && (
                  <SectionGroup title="SRM Organizations">
                    {categorizedItems.clubs.map((item) => {
                      const overallIndex = categorizedItems.flatList.findIndex((x) => x.id === item.id);
                      const isSelected = overallIndex === selectedIndex;
                      return (
                        <CommandItem
                          key={item.id}
                          item={item}
                          isSelected={isSelected}
                          isFavorite={favorites.includes(item.id)}
                          icon={getItemIcon(item.type, item.id)}
                          onSelect={() => handleSelectItem(item)}
                          onToggleFav={(e) => toggleFavorite(item.id, e)}
                        />
                      );
                    })}
                  </SectionGroup>
                )}
              </>
            )}
          </div>

          {/* Footer Keyboard Hints */}
          <div className="p-3 border-t border-zinc-800 bg-zinc-950/70 flex items-center justify-between text-[11px] text-zinc-500 font-mono select-none">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center">
                  <CornerDownLeft className="w-2.5 h-2.5" />
                </kbd>
                <span>Select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">F</kbd>
                <span>Toggle Star</span>
              </span>
            </div>
            <div className="capitalize text-[10px] text-purple-400 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-purple-400" />
              <span>Workspace: {role.replace("_", " ")}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ─────────────── CATEGORY SECTION HEADER GROUP ─────────────── */
function SectionGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <h3 className="px-3 py-1.5 text-[9px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1.5">
        {icon}
        <span>{title}</span>
      </h3>
      {children}
    </div>
  );
}

/* ─────────────── PALETTE ITEM CONTAINER ─────────────── */
function CommandItem({
  item,
  isSelected,
  isFavorite,
  icon,
  onSelect,
  onToggleFav,
}: {
  item: CommandSearchResultItem;
  isSelected: boolean;
  isFavorite: boolean;
  icon: React.ReactNode;
  onSelect: () => void;
  onToggleFav: (e: React.MouseEvent) => void;
}) {
  const itemRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll when selected to support keyboard scroll logic
  useEffect(() => {
    if (isSelected) {
      itemRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [isSelected]);

  // Support hitting 'F' key to toggle favorite when item is selected
  useEffect(() => {
    if (!isSelected) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        onToggleFav(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelected, onToggleFav]);

  return (
    <button
      ref={itemRef}
      onClick={onSelect}
      className={`w-full px-3 py-2 rounded-2xl flex items-center justify-between gap-3 text-left transition-all border outline-none cursor-pointer ${
        isSelected
          ? "bg-purple-600/10 border-purple-500/35 text-zinc-100 shadow-md"
          : "bg-transparent border-transparent hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-1.5 rounded-xl border shrink-0 transition-colors ${
          isSelected ? "bg-zinc-950 border-purple-500/25" : "bg-zinc-950 border-zinc-800"
        }`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold truncate flex items-center gap-2">
            <span>{item.title}</span>
            {item.badge && (
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono border transition-colors ${
                isSelected
                  ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                  : "bg-zinc-900 text-zinc-500 border-zinc-800"
              }`}>
                {item.badge}
              </span>
            )}
          </div>
          {item.subtitle && (
            <p className="text-[10px] text-zinc-500 truncate font-light mt-0.5">{item.subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Toggle Pin/Star Button */}
        <button
          onClick={onToggleFav}
          className={`p-1.5 rounded-xl border transition-all ${
            isFavorite
              ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
              : isSelected
              ? "text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10 border-zinc-850 hover:border-amber-500/20"
              : "opacity-0 group-hover:opacity-100 text-zinc-700 border-transparent"
          }`}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? "fill-amber-400" : ""}`} />
        </button>

        {/* Enter selection helper tag */}
        {isSelected && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono text-purple-400 px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-md">
            <span>Go</span>
            <CornerDownLeft className="w-2.5 h-2.5" />
          </span>
        )}
        <ArrowRight className={`w-3.5 h-3.5 transition-colors ${isSelected ? "text-purple-400" : "text-zinc-700"}`} />
      </div>
    </button>
  );
}
