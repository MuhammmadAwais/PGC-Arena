import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — PGC Arena",
  description:
    "Sign in to PGC Arena, the institutional academic esports platform for Punjab Group of Colleges.",
};

export default function LoginPage() {
  return (
    <main
      id="login-page"
      className="h-screen w-full flex overflow-hidden"
      aria-label="PGC Arena Login"
    >
      {/* ══════════════════════════════════════════════════════════════
          LEFT COLUMN — 1/3, full-bleed library image (desktop only)
         ══════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        className="hidden lg:block lg:w-1/3 relative flex-shrink-0 overflow-hidden"
      >
        {/* Full-bleed image, no overlays */}
        <Image
          src="/auth/login-library.webp"
          alt="A grand circular library at Punjab Colleges"
          fill
          priority
          sizes="33vw"
          className="object-cover object-center"
          quality={90}
        />

        {/* Subtle bottom-up scrim — ONLY to make the brand copy readable */}
        <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* ── Top-left logo ─────────────────────────────────────────── */}
        <div className="absolute top-7 left-7 z-10">
          <div
            className="relative brightness-0 invert drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]"
            style={{ width: 76, height: 76 }}
          >
            <Image
              src="/brand/pgc-logo.png"
              alt="Punjab Colleges logo"
              fill
              sizes="76px"
              className="object-contain"
            />
          </div>
        </div>

        {/* ── Brand copy — anchored to bottom so scrim covers it ────── */}
        <div className="absolute bottom-10 left-0 right-0 px-8 z-10">
          <h1 className="font-display text-5xl xl:text-6xl font-bold text-white leading-none tracking-tight">
            PGC <span className="text-pgc-red">Arena</span>
          </h1>
          <p className="mt-3 text-sm xl:text-[15px] text-white/75 font-medium leading-relaxed max-w-[240px]">
            Where academic excellence meets competitive spirit.{" "}
            <span className="text-pgc-gold font-semibold">
              Prove your knowledge.
            </span>
          </p>
        </div>

        {/* Right-edge separator */}
        <div className="absolute right-0 inset-y-0 w-px bg-white/[0.08] z-10" />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          RIGHT COLUMN — 2/3, raw dark-texture, no overlay
          Responsive: full-width on mobile/tablet
         ══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-y-auto p-6 sm:p-10">
        {/* Raw dark-texture — zero overlay */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/auth/login-bg.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 67vw"
            className="object-cover object-center"
            quality={85}
          />
        </div>

        {/* ── Center container ─────────────────────────────────────── */}
        <div className="w-full max-w-[460px] flex flex-col items-center">
          {/* Mobile / tablet logo — hidden on desktop */}
          <div className="flex lg:hidden items-center gap-3 mb-6 self-center">
            <div
              className="relative brightness-0 invert drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]"
              style={{ width: 72, height: 72 }}
            >
              <Image
                src="/brand/pgc-logo.png"
                alt="Punjab Colleges"
                fill
                sizes="72px"
                className="object-contain"
              />
            </div>
            <div>
              <p className="font-display text-4xl font-bold text-white leading-none">
                PGC <span className="text-pgc-red">Arena</span>
              </p>
            </div>
          </div>

          {/* ── Balanced Glass Card ─────────────────────────────────── */}
          <div
            className={[
              "w-full rounded-2xl",
              /* High-end glassmorphism */
              "bg-white/[0.06] backdrop-blur-2xl",
              "border border-white/[0.12]",
              "shadow-[0_12px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]",
              "p-8 sm:p-10",
            ].join(" ")}
          >
            {/* Heading */}
            <div className="mb-6 text-center">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight">
                Welcome <span className="text-pgc-red">back.</span>
              </h2>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent mb-6" />

            {/* Form */}
            <LoginForm />
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-white/25 tracking-wide">
            © {new Date().getFullYear()} Punjab Group of Colleges
          </p>
        </div>
      </div>
    </main>
  );
}
