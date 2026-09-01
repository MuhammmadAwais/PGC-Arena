"use client";

import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";

interface BookCoverThumbnailProps {
  thumbnailUrl?: string | null;
  title: string;
  subjectName?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

function resolveCoverUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (url.includes("backblazeb2.com") || url.startsWith("http")) {
    return `/api/library/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export function BookCoverThumbnail({
  thumbnailUrl,
  title,
  subjectName,
  className = "",
  size = "md",
}: BookCoverThumbnailProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [thumbnailUrl]);

  const resolvedUrl = resolveCoverUrl(thumbnailUrl);

  // Derive initials / short title for stylish solid fallback cover
  const shortTitle = title.trim().slice(0, 12);
  const subjectInitial = (subjectName || "LIB").slice(0, 3).toUpperCase();

  const sizeClasses = {
    sm: "w-9 h-11 text-[9px]",
    md: "w-11 h-14 text-[10px]",
    lg: "w-24 h-32 text-xs",
  }[size];

  if (resolvedUrl && !imgError) {
    return (
      <div
        className={`relative rounded-lg overflow-hidden border border-white/10 bg-black/40 shrink-0 shadow-sm ${sizeClasses} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolvedUrl}
          alt={title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Stylish solid / gradient fallback cover
  return (
    <div
      className={`relative rounded-lg overflow-hidden border border-white/10 bg-gradient-to-br from-[#171b2e] via-[#0f1322] to-[#090b14] border-l-[3px] border-l-cyan-400/80 p-1 flex flex-col justify-between select-none shrink-0 shadow-sm ${sizeClasses} ${className}`}
      title={title}
    >
      <div className="flex items-center justify-between opacity-70">
        <BookOpen className="w-2.5 h-2.5 text-cyan-400" />
        <span className="font-mono text-[8px] font-bold text-slate-400 tracking-tighter">
          {subjectInitial}
        </span>
      </div>

      <div className="min-w-0">
        <p className="font-display font-extrabold text-white truncate leading-tight tracking-tight text-[9px]">
          {shortTitle}
        </p>
      </div>
    </div>
  );
}
