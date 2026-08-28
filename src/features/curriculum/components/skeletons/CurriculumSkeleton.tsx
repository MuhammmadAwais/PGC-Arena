"use client";

export function CurriculumSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded-lg bg-white/10" />
            <div className="h-3 w-72 rounded-lg bg-white/5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 rounded-xl bg-white/10" />
          <div className="h-9 w-32 rounded-xl bg-white/10" />
          <div className="h-9 w-32 rounded-xl bg-white/10" />
        </div>
      </div>

      {/* Switcher & Search Skeleton */}
      <div className="h-14 rounded-2xl bg-[#0B0C16]/80 border border-white/10 p-2 flex items-center justify-between gap-4">
        <div className="h-10 w-64 rounded-xl bg-white/10" />
        <div className="h-10 w-72 rounded-xl bg-white/10" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08]" />
        ))}
      </div>

      {/* Board Containers Skeleton */}
      {[1, 2].map((b) => (
        <div
          key={b}
          className="rounded-3xl bg-[#0B0C16]/80 border border-white/10 p-6 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/10" />
              <div className="space-y-2">
                <div className="h-6 w-52 rounded-lg bg-white/10" />
                <div className="h-3 w-40 rounded-lg bg-white/5" />
              </div>
            </div>
            <div className="h-8 w-8 rounded-xl bg-white/10" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((d) => (
              <div
                key={d}
                className="rounded-2xl bg-black/40 border border-white/[0.08] p-4 space-y-3"
              >
                <div className="h-4 w-40 rounded bg-white/10" />
                <div className="flex items-center gap-3 overflow-hidden">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className="h-16 w-64 rounded-2xl bg-white/[0.04] border border-white/[0.08] shrink-0"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
