"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { ChevronRight, Home, Activity } from "lucide-react";
import Link from "next/link";

// ── Breadcrumb label map ─────────────────────────────────────────
const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  campuses: "Campuses & Tenancy",
  curriculum: "Curriculum & Boards",
  "ai-creation": "AI Question Forge",
  "question-bank": "Question Bank Vault",
  tournaments: "Tournaments & Brackets",
  spectate: "Spectate Arena",
  rankings: "Tier Lists & ELO",
  settings: "Master Settings",
};

interface BreadcrumbSegment {
  label: string;
  href: string;
}

function useBreadcrumbs(): BreadcrumbSegment[] {
  const pathname = usePathname();
  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((seg, idx) => ({
      label: SEGMENT_LABELS[seg] ?? seg.replace(/-/g, " "),
      href: "/" + segments.slice(0, idx + 1).join("/"),
    }));
  }, [pathname]);
}

/** Live PKT clock — updates every second */
function LiveClock() {
  // Pure client-side — rendered after hydration
  const now = new Date();
  const pkt = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Karachi",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const utc = now.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const date = now.toLocaleDateString("en-US", {
    timeZone: "Asia/Karachi",
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col items-end leading-tight">
      <span className="text-[13px] font-mono font-semibold text-white/80">
        {pkt} <span className="text-white/30 font-normal">PKT</span>
      </span>
      <span className="text-[10px] text-white/30 font-mono">
        {utc} UTC · {date}
      </span>
    </div>
  );
}

/**
 * src/features/dashboard/components/Navbar.tsx
 *
 * Top command bar for the admin dashboard shell.
 * Renders breadcrumb navigation + realtime health indicator + clock.
 * Must be "use client" — consumes usePathname.
 */
export function Navbar() {
  const breadcrumbs = useBreadcrumbs();

  return (
    <header
      id="admin-top-navbar"
      className={[
        "flex items-center justify-between shrink-0",
        "bg-white/[0.02] backdrop-blur-[40px]",
        "border-b border-white/[0.08]",
        "px-6 lg:px-8 py-4",
        "relative z-10",
      ].join(" ")}
    >
      {/* ── Left: Breadcrumb ─────────────────────────────────────── */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm">
          {/* Home anchor */}
          <li>
            <Link
              href="/admin"
              className="flex items-center text-white/40 hover:text-white/80 transition-colors duration-150"
              aria-label="Admin home"
            >
              <Home className="w-3.5 h-3.5" />
            </Link>
          </li>

          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-1.5">
                <ChevronRight
                  className="w-3 h-3 text-white/20"
                  aria-hidden="true"
                />
                {isLast ? (
                  <span className="font-medium text-white capitalize">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-white/40 hover:text-white/80 capitalize transition-colors duration-150"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ── Right: Clock ─────────────────────── */}
      <div className="flex items-center gap-5">

        {/* Live clock */}
        <LiveClock />
      </div>
    </header>
  );
}
