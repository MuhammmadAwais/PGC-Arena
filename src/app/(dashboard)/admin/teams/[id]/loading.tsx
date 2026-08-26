export default function TeamLoadingSkeleton() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-pulse">
      {/* 1. Breadcrumbs Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-44 rounded-lg bg-white/[0.06]" />
        <div className="h-6 w-28 rounded-lg bg-white/[0.04]" />
      </div>

      {/* 2. Squad Hero Header Skeleton */}
      <div className="relative rounded-3xl border border-white/10 bg-[#0B0C16] overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Squad Crest Placeholder */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white/[0.06] border border-white/10 shrink-0" />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="h-4 w-28 rounded-full bg-white/[0.08]" />
                <div className="h-4 w-32 rounded-full bg-white/[0.08]" />
              </div>
              <div className="h-8 w-56 rounded-xl bg-white/[0.08]" />
              <div className="h-3.5 w-40 rounded-lg bg-white/[0.05]" />
            </div>
          </div>
          <div className="h-16 w-36 rounded-2xl bg-white/[0.04] border border-white/10 shrink-0" />
        </div>
      </div>

      {/* 3. Captain Profile Card Skeleton */}
      <div className="p-6 rounded-2xl bg-[#0B0C16] border border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/[0.08] shrink-0" />
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-white/[0.05]" />
            <div className="h-5 w-40 rounded bg-white/[0.08]" />
          </div>
        </div>
        <div className="h-6 w-24 rounded-full bg-white/[0.05]" />
      </div>

      {/* 4. Active Squad Roster Skeleton Table */}
      <div className="rounded-3xl bg-[#0B0C16] border border-white/10 p-6 space-y-4">
        <div className="h-5 w-48 rounded-lg bg-white/[0.08]" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-full rounded-xl bg-white/[0.02] border border-white/[0.04]" />
          ))}
        </div>
      </div>
    </div>
  );
}
