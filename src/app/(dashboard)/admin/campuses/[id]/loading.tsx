export default function CampusLoadingSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-pulse">
      {/* 1. Breadcrumbs Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-44 rounded-lg bg-white/[0.06]" />
        <div className="h-6 w-28 rounded-lg bg-white/[0.04]" />
      </div>

      {/* 2. Secondary Master Banner Skeleton (Top) */}
      <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white/[0.06] border border-white/10 shrink-0" />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 rounded-full bg-white/[0.08]" />
                <div className="h-4 w-28 rounded-full bg-white/[0.08]" />
              </div>
              <div className="h-8 w-64 rounded-xl bg-white/[0.08]" />
              <div className="h-3.5 w-48 rounded-lg bg-white/[0.05]" />
            </div>
          </div>
          <div className="h-14 w-40 rounded-2xl bg-white/[0.04] border border-white/10 shrink-0" />
        </div>
      </div>

      {/* 3. Primary 4-Stat KPI Grid Skeleton (Below Banner) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl p-4 bg-white/[0.02] border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-2.5 w-20 rounded bg-white/[0.06]" />
              <div className="h-7 w-16 rounded-lg bg-white/[0.08]" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
          </div>
        ))}
      </div>

      {/* 4. Secondary Leadership Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-48 rounded-lg bg-white/[0.08]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border-b-2 border-white/20 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-white/[0.08] shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-24 rounded bg-white/[0.08]" />
                <div className="h-3 w-16 rounded bg-white/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Secondary Squads Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-44 rounded-lg bg-white/[0.08]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden space-y-3 p-4">
              <div className="h-24 w-full rounded-xl bg-white/[0.04]" />
              <div className="h-5 w-36 rounded bg-white/[0.08]" />
              <div className="h-10 w-full rounded-xl bg-white/[0.02]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
