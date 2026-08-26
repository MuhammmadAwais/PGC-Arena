export default function TeamDetailLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans animate-pulse">
      {/* 1. Breadcrumbs Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-40 bg-white/[0.06] rounded-md" />
        <div className="flex gap-2">
          <div className="h-8 w-28 bg-white/[0.06] rounded-xl" />
          <div className="h-8 w-28 bg-white/[0.06] rounded-xl" />
        </div>
      </div>

      {/* 2. Hero Banner Skeleton */}
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
        <div className="h-44 sm:h-56 bg-white/[0.03]" />
        <div className="px-8 pb-7 -mt-16 flex items-end justify-between gap-6">
          <div className="flex items-end gap-5">
            <div className="w-24 h-24 rounded-3xl bg-white/[0.08] border-2 border-white/10" />
            <div className="space-y-2 pb-1">
              <div className="h-4 w-28 bg-white/[0.08] rounded-full" />
              <div className="h-8 w-64 bg-white/[0.08] rounded-lg" />
              <div className="h-3 w-80 bg-white/[0.04] rounded" />
            </div>
          </div>
          <div className="h-16 w-52 bg-white/[0.04] rounded-2xl border border-white/10" />
        </div>
      </div>

      {/* 3. Stat Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4"
          />
        ))}
      </div>

      {/* 4. Table Skeleton */}
      <div className="h-80 rounded-2xl bg-white/[0.02] border border-white/[0.06]" />
    </div>
  );
}
