export default function UserLoadingSkeleton() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 animate-pulse">
      {/* 1. Breadcrumbs Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-44 rounded-lg bg-white/[0.06]" />
        <div className="h-6 w-28 rounded-lg bg-white/[0.04]" />
      </div>

      {/* 2. Member Hero Header Skeleton */}
      <div className="relative rounded-3xl border border-white/10 bg-[#0B0C16] overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Member Headshot Avatar Placeholder */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white/[0.06] border border-white/10 shrink-0" />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="h-4 w-28 rounded-full bg-white/[0.08]" />
                <div className="h-4 w-24 rounded-full bg-white/[0.08]" />
              </div>
              <div className="h-8 w-56 rounded-xl bg-white/[0.08]" />
              <div className="h-3.5 w-44 rounded-lg bg-white/[0.05]" />
            </div>
          </div>
          <div className="h-16 w-36 rounded-2xl bg-white/[0.04] border border-white/10 shrink-0" />
        </div>
      </div>

      {/* 3. Affiliation Cards Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-[#0B0C16] border border-white/10 space-y-4">
            <div className="h-4 w-32 rounded bg-white/[0.08]" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.08] shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-36 rounded bg-white/[0.08]" />
                <div className="h-3 w-24 rounded bg-white/[0.05]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
