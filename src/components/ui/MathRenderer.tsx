"use client";

import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn } from "@/lib/utils";

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export const MathRenderer = memo(function MathRenderer({
  content,
  className,
  inline = false,
}: MathRendererProps) {
  if (!content || typeof content !== "string") {
    return null;
  }

  // Pre-process content if needed to ensure standard math delimiters are recognized
  // e.g. converting escaped \$ to $ if exported raw
  const formattedContent = content;

  if (inline) {
    return (
      <span
        className={cn(
          "inline-math-container align-middle text-inherit [&_.katex-display]:my-0 [&_.katex]:text-inherit",
          className
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({ children }) => <span className="inline">{children}</span>,
          }}
        >
          {formattedContent}
        </ReactMarkdown>
      </span>
    );
  }

  return (
    <div
      className={cn(
        "math-renderer text-slate-200 overflow-x-auto overflow-y-hidden max-w-full leading-relaxed",
        "[&_.katex-display]:my-2 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex]:text-inherit",
        "[&_p]:my-0 [&_p]:leading-relaxed",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
});
