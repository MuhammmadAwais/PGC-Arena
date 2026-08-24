"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, Loader2, UserRound } from "lucide-react";
import { loginUser } from "@/features/auth/actions/authActions";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginUser(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  async function handleGuest() {
    setIsGuestLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsGuestLoading(false);
    router.push("/dashboard");
  }

  const anyLoading = isLoading || isGuestLoading;

  const inputCls = [
    "w-full rounded-xl border px-4 py-3.5 text-sm text-white placeholder-white/30",
    "bg-black/25 backdrop-blur-md",
    "border-white/10 hover:border-white/20 focus:border-pgc-red/60 focus:ring-2 focus:ring-pgc-red/20",
    "outline-none transition-all duration-200",
    "disabled:opacity-40 disabled:cursor-not-allowed cursor-text",
  ].join(" ");

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Credentials form ─────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Sign in to PGC Arena"
        className="flex flex-col gap-5 w-full"
      >
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="login-email"
            className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50 cursor-default"
          >
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@pgc.edu.pk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={anyLoading}
            className={inputCls}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="login-password"
            className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50 cursor-default"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={anyLoading}
              className={inputCls + " pr-11"}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              disabled={anyLoading}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors duration-150 cursor-pointer disabled:pointer-events-none"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2 mt-1">
          <input
            id="login-remember"
            name="remember"
            type="checkbox"
            defaultChecked={true}
            disabled={anyLoading}
            className="w-4 h-4 rounded border-white/20 bg-black/25 text-pgc-red focus:ring-pgc-red/70 focus:ring-offset-0 focus:ring-2 accent-pgc-red cursor-pointer disabled:opacity-40"
          />
          <label
            htmlFor="login-remember"
            className="text-[13px] font-medium text-white/70 cursor-pointer select-none"
          >
            Remember me
          </label>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-pgc-red/30 bg-pgc-red/10 px-4 py-3 text-sm text-pgc-red"
          >
            <span className="mt-px shrink-0">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Primary CTA */}
        <button
          id="login-submit-btn"
          type="submit"
          disabled={anyLoading}
          className={[
            "group mt-2 flex w-full items-center justify-center gap-2.5",
            "rounded-xl border border-pgc-red px-6 py-3.5 text-sm font-semibold",
            /* default — solid fill */
            "bg-pgc-red text-white",
            /* hover — outline style */
            "hover:bg-transparent hover:text-pgc-red",
            "hover:shadow-[0_4px_24px_rgba(227,59,41,0.3)]",
            /* press */
            "active:scale-[0.98]",
            /* transitions */
            "transition-all duration-200 ease-out",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
            "cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pgc-red/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          ].join(" ")}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating…</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              <span>Enter the Arena</span>
            </>
          )}
        </button>
      </form>

      {/* ── OR divider ───────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-white/[0.08]" />
        <span className="text-[10px] text-white/30 font-medium uppercase tracking-[0.15em]">
          or
        </span>
        <div className="flex-1 h-px bg-white/[0.08]" />
      </div>

      {/* ── Guest access ─────────────────────────────────────────── */}
      <button
        id="login-guest-btn"
        type="button"
        onClick={handleGuest}
        disabled={anyLoading}
        className={[
          "group flex w-full items-center justify-center gap-2.5",
          "rounded-xl border border-white/[0.12] px-6 py-3.5",
          "text-sm font-medium text-white/60",
          "hover:bg-white/[0.06] hover:border-white/[0.25] hover:text-white",
          "active:scale-[0.98]",
          "transition-all duration-200 ease-out",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
          "cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
        ].join(" ")}
      >
        {isGuestLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Joining…</span>
          </>
        ) : (
          <>
            <UserRound className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            <span>Continue as Guest</span>
          </>
        )}
      </button>
    </div>
  );
}
