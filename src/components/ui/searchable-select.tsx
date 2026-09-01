"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  icon?: React.ReactNode;
  avatarUrl?: string | null;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  emptyMessage?: string;
  allowClear?: boolean;
  align?: "start" | "end";
  dropdownClassName?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  icon,
  disabled = false,
  className,
  required = false,
  emptyMessage = "No matching items found.",
  allowClear = false,
  align = "start",
  dropdownClassName,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      opt.label.toLowerCase().includes(query) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(query)) ||
      (opt.badge && opt.badge.toLowerCase().includes(query))
    );
  });

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-11 px-3.5 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold text-white flex items-center justify-between gap-2.5 transition-all text-left cursor-pointer",
          "hover:border-white/20 hover:bg-black/50 focus:outline-none focus:border-pgc-red/60 focus:ring-1 focus:ring-pgc-red/40",
          isOpen && "border-white/30 bg-black/60 shadow-[0_0_15px_rgba(255,255,255,0.05)]",
          disabled && "opacity-40 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedOption?.avatarUrl ? (
            <img
              src={selectedOption.avatarUrl}
              alt=""
              className="w-5 h-5 rounded-full object-cover shrink-0 border border-white/15"
            />
          ) : selectedOption?.icon ? (
            <div className="shrink-0 text-white/60">{selectedOption.icon}</div>
          ) : (
            icon && <div className="shrink-0 text-white/40">{icon}</div>
          )}

          <div className="truncate min-w-0">
            {selectedOption ? (
              <span className="text-white font-medium truncate block">
                {selectedOption.label}
              </span>
            ) : (
              <span className="text-white/40 font-normal">{placeholder}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {allowClear && selectedOption && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-white/40 transition-transform duration-200",
              isOpen && "rotate-180 text-white"
            )}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 top-full mt-1.5 min-w-[280px] sm:min-w-[320px] w-max max-w-[360px] rounded-2xl bg-[#0B0C16] border border-white/15 p-2 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 duration-150 max-h-72 flex flex-col overflow-hidden",
            align === "end" ? "right-0 left-auto" : "left-0",
            dropdownClassName
          )}
        >
          {/* Search Box */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-9 pl-9 pr-7 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-colors font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto space-y-1 flex-1 pr-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-3 text-center text-xs text-slate-400 font-sans">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer text-xs group",
                      isSelected
                        ? "bg-white/15 text-white font-semibold"
                        : "hover:bg-white/[0.08] text-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {opt.avatarUrl ? (
                        <img
                          src={opt.avatarUrl}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/15"
                        />
                      ) : opt.icon ? (
                        <div className="shrink-0 text-white/60">{opt.icon}</div>
                      ) : null}

                      <div className="min-w-0 flex-1">
                        <span className="block font-medium text-white truncate font-sans">
                          {opt.label}
                        </span>
                        {opt.sublabel && (
                          <span className="block text-[11px] text-slate-400 font-normal mt-0.5 truncate font-sans">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-mono text-slate-300 font-semibold">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
