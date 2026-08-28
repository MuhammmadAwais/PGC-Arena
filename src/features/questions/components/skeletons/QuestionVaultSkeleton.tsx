"use client";

export function QuestionVaultSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-28 rounded-3xl bg-[#0B0C16]/80 border border-white/10 p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-14 rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <div className="h-6 w-56 rounded-lg bg-white/10" />
            <div className="h-3 w-40 rounded bg-white/5" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 rounded-xl bg-white/10" />
          <div className="h-10 w-32 rounded-xl bg-white/10" />
        </div>
      </div>

      {/* Search & Filter Strip Skeleton */}
      <div className="h-14 rounded-2xl bg-[#0B0C16]/80 border border-white/10" />

      {/* Main Layout: Rail + Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Rail Skeleton */}
        <div className="w-full lg:w-72 rounded-3xl bg-[#0B0C16]/80 border border-white/10 p-4 space-y-3 h-96" />

        {/* MCQ Cards Skeleton */}
        <div className="flex-1 space-y-4 w-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl bg-[#0B0C16]/80 border border-white/10 p-6 space-y-4 h-48"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
