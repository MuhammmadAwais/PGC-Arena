"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Sparkles,
  Database,
  Trophy,
  Eye,
  TrendingUp,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronUp,
} from "lucide-react";
import { signOut } from "@/features/auth/actions/authActions";
import type { Tables } from "@/types/database.types";

type UserProfile = Tables<"users">;

interface SidebarProps {
  profile: UserProfile;
}

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  exact?: boolean;
};

const navItems: NavItem[] = [
  {
    href: "/admin",
    label: "Command Center",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/campuses",
    label: "Campuses & Tenancy",
    icon: Building2,
  },
  {
    href: "/admin/curriculum",
    label: "Curriculum & Boards",
    icon: BookOpen,
  },
  {
    href: "/admin/ai-creation",
    label: "AI Question Forge",
    icon: Sparkles,
  },
  {
    href: "/admin/question-bank",
    label: "Question Bank Vault",
    icon: Database,
  },
  {
    href: "/admin/tournaments",
    label: "Tournaments & Brackets",
    icon: Trophy,
  },
  {
    href: "/admin/spectate",
    label: "Spectate Arena",
    icon: Eye,
  },
  {
    href: "/admin/rankings",
    label: "Tier Lists & ELO",
    icon: TrendingUp,
  },
  {
    href: "/admin/settings",
    label: "Master Settings",
    icon: Settings,
  },
] as const;

/** Derive initials from full name for avatar fallback */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

import { useState, useRef, useEffect } from "react";

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside
      id="admin-sidebar"
      className={[
        "hidden lg:flex flex-col w-[260px] shrink-0 h-full",
        "bg-white/[0.02] backdrop-blur-[40px]",
        "border-r border-white/[0.08]",
        "shadow-[4px_0_24px_rgba(0,0,0,0.2)]",
        "relative z-20",
      ].join(" ")}
    >


      {/* ═══════════════════════════════════════════════════
          TOP — Brand lockup
         ═══════════════════════════════════════════════════ */}
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          {/* Logo — inverted to white on dark bg */}
          <div
            className="relative shrink-0 brightness-0 invert drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            style={{ width: 44, height: 44 }}
          >
            <Image
              src="/brand/pgc-logo.png"
              alt="Punjab Colleges"
              fill
              sizes="44px"
              className="object-contain"
              priority
            />
          </div>

          {/* Text lockup */}
          <div className="flex flex-col leading-tight justify-center">
            <span className="font-display text-[17px] font-bold text-white tracking-tight">
              PGC <span className="text-pgc-red">Arena</span>
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          MIDDLE — Navigation
         ═══════════════════════════════════════════════════ */}
      <nav
        aria-label="Admin navigation"
        className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
      >
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              id={`sidebar-nav-${href.replace(/\//g, "-").replace(/^-/, "")}`}
              className={[
                "group flex items-center gap-3.5 px-4 py-3 rounded-[14px] text-[15px] transition-all duration-200",
                isActive
                  ? "bg-pgc-red/10 border border-pgc-red/40 text-white font-semibold shadow-[0_0_20px_rgba(227,59,41,0.15)]"
                  : "text-white/60 font-medium hover:bg-white/[0.08] hover:text-white border border-transparent",
              ].join(" ")}
            >
              <Icon
                className={[
                  "w-[18px] h-[18px] shrink-0 transition-colors duration-200",
                  isActive
                    ? "text-white"
                    : "text-white/40 group-hover:text-white/80",
                ].join(" ")}
                aria-hidden="true"
              />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ═══════════════════════════════════════════════════
          BOTTOM — Profile card (Clickable Dropdown)
         ═══════════════════════════════════════════════════ */}
      <div className="px-3 pb-4 pt-3 border-t border-white/[0.06] relative" ref={menuRef}>
        
        {/* Dropdown Menu Modal */}
        {isMenuOpen && (
          <div 
            className={[
              "absolute bottom-[calc(100%-8px)] left-3 right-3 mb-2 rounded-xl",
              "bg-[#0B0C16] border border-white/10",
              "shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden z-50",
              "animate-in slide-in-from-bottom-2 fade-in duration-200"
            ].join(" ")}
          >
            <div className="p-1.5">
              <Link 
                href="/admin/settings" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4 text-white/40" />
                Master Settings
              </Link>
              <div className="h-px bg-white/[0.06] my-1 mx-2" />
              <form action={signOut}>
                <button 
                  type="submit" 
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-pgc-red/10 hover:text-pgc-red transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={[
            "w-full flex items-center justify-between text-left",
            "rounded-xl p-3 transition-colors duration-200 cursor-pointer",
            isMenuOpen ? "bg-white/[0.08]" : "bg-white/[0.03] hover:bg-white/[0.06]",
            "border border-white/[0.04] hover:border-white/[0.08]",
          ].join(" ")}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Avatar — initials fallback */}
            <div
              className={[
                "w-9 h-9 rounded-lg shrink-0 flex items-center justify-center",
                "bg-gradient-to-br from-pgc-red/70 to-pgc-indigo",
                "font-display text-xs font-bold text-white",
                "border border-pgc-red/30",
              ].join(" ")}
              aria-hidden="true"
            >
              {getInitials(profile.full_name)}
            </div>

            {/* Name & badge */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate leading-tight">
                {profile.full_name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-pgc-gold shrink-0" />
                <span className="text-[10px] font-semibold text-pgc-gold uppercase tracking-[0.12em]">
                  Super Admin
                </span>
              </div>
            </div>
          </div>

          <ChevronUp 
            className={`w-4 h-4 text-white/30 shrink-0 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} 
          />
        </button>
      </div>
    </aside>
  );
}
