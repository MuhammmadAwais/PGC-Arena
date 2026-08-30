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

function preprocessMath(content: string): string {
  if (!content) return "";
  let text = content;

  // Convert LaTeX delimiters \( ... \) and \[ ... \] to $ and $$
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, "$$$1$$");
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, "$$$$$$1$$$$");

  // If text doesn't contain $, auto-wrap dimensional analysis and physics formulas
  if (!text.includes("$")) {
    // Match consecutive bracketed dimensions e.g. [L][M L T^-2] or [M L^2 T^-2]
    text = text.replace(/(?:\[[A-Z0-9\s\^\-\+\{\}\=]+\])+/g, (match) => {
      const cleaned = match.replace(/\^([0-9\-]+)/g, "^{$1}");
      return `$${cleaned}$`;
    });

    // Torque formula: (tau = r x F) -> $(\tau = r \times F)$
    text = text.replace(/\(?tau\s*=\s*r\s*x\s*F\)?/gi, "$(\\tau = r \\times F)$");
  }

  return text;
}

export const MathRenderer = memo(function MathRenderer({
  content,
  className,
  inline = false,
}: MathRendererProps) {
  if (!content || typeof content !== "string") {
    return null;
  }

  const formattedContent = preprocessMath(content);

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
