import React from "react";

interface AiSparkleIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * PGC-Arena AI Sparkle Logo
 * Inverted white 3-star celestial cluster matching institutional brand design.
 */
export function AiSparkleIcon({ className = "w-4 h-4", ...props }: AiSparkleIconProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* 1. Main Large Star (Center-Left) */}
      <path d="M225.8 402.7c-5.2 0-9.8-3.4-11.4-8.3-25.3-79.6-88.7-143-168.3-168.3-5-1.6-8.3-6.2-8.3-11.4s3.4-9.8 8.3-11.4c79.6-25.3 143-88.7 168.3-168.3 1.6-5 6.2-8.3 11.4-8.3s9.8 3.4 11.4 8.3c25.3 79.6 88.7 143 168.3 168.3 5 1.6 8.3 6.2 8.3 11.4s-3.4 9.8-8.3 11.4c-79.6 25.3-143 88.7-168.3 168.3-1.6 4.9-6.2 8.3-11.4 8.3z" />

      {/* 2. Top-Right Medium Star */}
      <path d="M386.4 179.9c-3.6 0-6.8-2.3-7.9-5.7-17.5-55.2-61.5-99.2-116.7-116.7-3.4-1.1-5.7-4.3-5.7-7.9s2.3-6.8 5.7-7.9c55.2-17.5 99.2-61.5 116.7-116.7 1.1-3.4 4.3-5.7 7.9-5.7s6.8 2.3 7.9 5.7c17.5 55.2 61.5 99.2 116.7 116.7 3.4 1.1 5.7 4.3 5.7 7.9s-2.3 6.8-5.7 7.9c-55.2 17.5-99.2 61.5-116.7 116.7-1.1 3.4-4.3 5.7-7.9 5.7z" />

      {/* 3. Bottom-Right Small Star */}
      <path d="M386.4 486.7c-3.6 0-6.8-2.3-7.9-5.7-17.5-55.2-61.5-99.2-116.7-116.7-3.4-1.1-5.7-4.3-5.7-7.9s2.3-6.8 5.7-7.9c55.2-17.5 99.2-61.5 116.7-116.7 1.1-3.4 4.3-5.7 7.9-5.7s6.8 2.3 7.9 5.7c17.5 55.2 61.5 99.2 116.7 116.7 3.4 1.1 5.7 4.3 5.7 7.9s-2.3 6.8-5.7 7.9c-55.2 17.5-99.2 61.5-116.7 116.7-1.1 3.4-4.3 5.7-7.9 5.7z" />
    </svg>
  );
}
