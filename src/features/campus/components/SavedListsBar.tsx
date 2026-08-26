"use client";

import { useState, useEffect, useRef } from "react";
import {
  Star,
  Trophy,
  Users,
  Bookmark,
  Plus,
  Trash2,
  Edit2,
  BookmarkCheck,
  SlidersHorizontal,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SavedFilterPreset } from "../types/campusTypes";

const DEFAULT_PRESETS: SavedFilterPreset[] = [
  {
    id: "all",
    label: "All Records",
    iconName: "bookmark",
    filters: { searchQuery: "", role: "ALL", campusId: "ALL", status: "ALL", isLeaderOnly: false, unassignedOnly: false, isStarredOnly: false },
  },
  {
    id: "starred",
    label: "Starred Campuses",
    iconName: "star",
    filters: { isStarredOnly: true, role: "ALL", campusId: "ALL" },
  },
];

interface SavedListsBarProps {
  activePresetId: string;
  onSelectPreset: (preset: SavedFilterPreset) => void;
  currentFilterState: any;
}

export function SavedListsBar({
  activePresetId,
  onSelectPreset,
  currentFilterState,
}: SavedListsBarProps) {
  const [customPresets, setCustomPresets] = useState<SavedFilterPreset[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [customListName, setCustomListName] = useState("");

  // Editing state inside Manage Modal
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Carousel scroll ref & state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Load custom saved lists from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pgc_arena_saved_lists");
      if (saved) {
        setCustomPresets(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveToStorage = (presets: SavedFilterPreset[]) => {
    setCustomPresets(presets);
    try {
      localStorage.setItem("pgc_arena_saved_lists", JSON.stringify(presets));
    } catch {
      // ignore
    }
  };

  // Check scroll position to enable/disable arrow buttons
  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [customPresets]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const amount = direction === "left" ? -220 : 220;
    el.scrollBy({ left: amount, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  // Save new custom list
  const handleSaveCustomList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customListName.trim()) return;

    const newPreset: SavedFilterPreset = {
      id: `custom_${Date.now()}`,
      label: customListName.trim(),
      iconName: "bookmark",
      filters: { ...currentFilterState },
      isCustom: true,
    };

    const updated = [...customPresets, newPreset];
    saveToStorage(updated);

    setCustomListName("");
    setIsSaveModalOpen(false);
    onSelectPreset(newPreset);
  };

  // Start editing a preset
  const startEditing = (preset: SavedFilterPreset, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingPresetId(preset.id);
    setEditingName(preset.label);
  };

  // Save edited preset name
  const saveEditingName = (id: string, e?: React.MouseEvent | React.FormEvent) => {
    e?.stopPropagation();
    if (!editingName.trim()) return;

    const updated = customPresets.map((p) =>
      p.id === id ? { ...p, label: editingName.trim() } : p
    );
    saveToStorage(updated);
    setEditingPresetId(null);
  };

  // Delete custom list
  const handleDeleteCustom = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = customPresets.filter((p) => p.id !== id);
    saveToStorage(updated);
    if (activePresetId === id) {
      onSelectPreset(DEFAULT_PRESETS[0]);
    }
  };

  const getIcon = (iconName: string, isActive: boolean) => {
    const cls = `w-3.5 h-3.5 ${isActive ? "text-white" : "text-white/40"}`;
    switch (iconName) {
      case "star":
        return <Star className={`w-3.5 h-3.5 ${isActive ? "text-pgc-gold fill-pgc-gold" : "text-pgc-gold/60"}`} />;
      case "crown":
        return <Trophy className={`w-3.5 h-3.5 ${isActive ? "text-pgc-gold" : "text-pgc-gold/60"}`} />;
      case "users":
        return <Users className={cls} />;
      default:
        return <Bookmark className={cls} />;
    }
  };

  const allPresets = [...DEFAULT_PRESETS, ...customPresets];

  return (
    <div className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.08] p-2.5 px-4 rounded-2xl backdrop-blur-md">
      {/* ── Left: Label ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0 pr-1">
        <BookmarkCheck className="w-4 h-4 text-pgc-gold" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-sans hidden sm:inline">
          Saved Lists
        </span>
      </div>

      <div className="h-4 w-px bg-white/10 shrink-0 hidden sm:block" />

      {/* ── Center: Clean Non-Overlapping Carousel ──────────────── */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-hidden">
        {/* Left Arrow (Dedicated Space) */}
        <button
          onClick={() => handleScroll("left")}
          disabled={!canScrollLeft}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
            canScrollLeft
              ? "bg-white/[0.06] border-white/10 text-white hover:bg-white/[0.12]"
              : "opacity-20 border-transparent text-white/30 pointer-events-none"
          }`}
          title="Scroll Left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Scrollable Container (Pills never collide with arrows) */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none py-1 scroll-smooth"
        >
          {allPresets.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-pgc-red text-white shadow-[0_0_15px_rgba(227,59,41,0.35)] border border-pgc-red"
                    : "bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
                }`}
              >
                {getIcon(preset.iconName, isActive)}
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow (Dedicated Space) */}
        <button
          onClick={() => handleScroll("right")}
          disabled={!canScrollRight}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
            canScrollRight
              ? "bg-white/[0.06] border-white/10 text-white hover:bg-white/[0.12]"
              : "opacity-20 border-transparent text-white/30 pointer-events-none"
          }`}
          title="Scroll Right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-4 w-px bg-white/10 shrink-0" />

      {/* ── Right: Fixed Action Buttons (Never Overlap) ────────── */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setIsSaveModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 text-pgc-gold" />
          <span className="hidden md:inline">Save View</span>
        </button>

        <button
          onClick={() => setIsManageModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
          title="Manage Saved Lists"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Lists ({customPresets.length})</span>
        </button>
      </div>

      {/* ── Save Current View Modal ─────────────────────────────── */}
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="bg-[#0B0C16]/98 border border-white/10 text-white max-w-md backdrop-blur-2xl rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6">
          <DialogHeader>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pgc-red/25 to-pgc-red/5 border border-pgc-red/30 text-pgc-red flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(227,59,41,0.2)]">
              <Bookmark className="w-5 h-5 text-pgc-red" />
            </div>
            <DialogTitle className="font-display text-2xl font-black tracking-tight text-white">
              Save Custom View
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs font-sans leading-relaxed">
              Save your current search query and filters as a quick-access list in the top bar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCustomList} className="space-y-4.5 mt-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-sans">
                Saved List Name
              </label>
              <Input
                placeholder="e.g. Lahore Top Squads, Finals Candidates"
                value={customListName}
                onChange={(e) => setCustomListName(e.target.value)}
                required
                className="h-11 bg-black/40 border-white/10 text-white placeholder-white/30 rounded-xl focus-visible:border-pgc-red/60 focus-visible:ring-1 focus-visible:ring-pgc-red/40 font-sans"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer font-sans"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-pgc-red text-white text-xs font-bold hover:bg-pgc-hover active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(227,59,41,0.3)] cursor-pointer font-sans"
              >
                Save List
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Manage Saved Lists Modal (Scalable, Edit & Delete) ──── */}
      <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
        <DialogContent className="bg-[#0B0C16]/98 border border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto backdrop-blur-2xl rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6">
          <DialogHeader>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/[0.12] to-white/[0.02] border border-white/15 text-white flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <SlidersHorizontal className="w-5 h-5 text-white/80" />
            </div>
            <DialogTitle className="font-display text-2xl font-black tracking-tight text-white">
              Manage Saved Lists
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs font-sans leading-relaxed">
              View, rename, apply, or delete your custom saved filter lists.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-3">
            {customPresets.length === 0 ? (
              <div className="p-8 text-center bg-black/30 border border-white/5 rounded-xl text-xs text-slate-400 font-sans">
                No custom saved lists yet. Apply some filters and click "Save View" to create one.
              </div>
            ) : (
              customPresets.map((preset) => {
                const isEditing = editingPresetId === preset.id;
                const isActive = activePresetId === preset.id;

                return (
                  <div
                    key={preset.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      isActive
                        ? "bg-pgc-red/10 border-pgc-red/40"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20"
                    }`}
                  >
                    {/* List Name & Edit Field */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8 text-xs bg-black/50 border-white/20 text-white font-sans"
                            autoFocus
                          />
                          <button
                            onClick={(e) => saveEditingName(preset.id, e)}
                            className="p-1.5 rounded-lg bg-pgc-emerald/20 text-pgc-emerald hover:bg-pgc-emerald/30 transition-colors cursor-pointer"
                            title="Save Name"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingPresetId(null)}
                            className="p-1.5 rounded-lg bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-semibold text-sm text-white truncate">
                            {preset.label}
                          </span>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded bg-pgc-red/20 text-pgc-red text-[10px] font-bold uppercase">
                              Active
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate font-sans">
                        Search: "{preset.filters.searchQuery || "None"}" • Campus: {preset.filters.campusId || "All"}
                      </p>
                    </div>

                    {/* Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            onSelectPreset(preset);
                            setIsManageModalOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                        <button
                          onClick={(e) => startEditing(preset, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Rename List"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteCustom(preset.id, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-pgc-red hover:bg-pgc-red/10 transition-colors cursor-pointer"
                          title="Delete List"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
