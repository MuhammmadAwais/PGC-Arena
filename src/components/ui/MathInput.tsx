"use client";

import React, { useRef, useCallback } from "react";
import { MathRenderer } from "./MathRenderer";
import { Sparkles, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface MathChip {
  label: string;
  latex: string;
  cursorOffset?: number; // offset from start of inserted latex to place cursor
}

const QUICK_INSERT_CHIPS: MathChip[] = [
  { label: "$ Math $", latex: "$$", cursorOffset: 1 },
  { label: "$$ Block $$", latex: "$$\n\n$$", cursorOffset: 3 },
  { label: "Fraction \\frac{}{}", latex: "\\frac{}{}", cursorOffset: 6 },
  { label: "Root \\sqrt{}", latex: "\\sqrt{}", cursorOffset: 6 },
  { label: "Power ^{2}", latex: "^{2}", cursorOffset: 3 },
  { label: "Subscript _{2}", latex: "_{2}", cursorOffset: 3 },
  { label: "Delta \\Delta", latex: "\\Delta ", cursorOffset: 7 },
  { label: "Theta \\theta", latex: "\\theta ", cursorOffset: 7 },
  { label: "Pi \\pi", latex: "\\pi ", cursorOffset: 4 },
  { label: "Plus/Minus \\pm", latex: "\\pm ", cursorOffset: 4 },
  { label: "Times \\times", latex: "\\times ", cursorOffset: 7 },
  { label: "Divide \\div", latex: "\\div ", cursorOffset: 5 },
  { label: "Approx \\approx", latex: "\\approx ", cursorOffset: 8 },
  { label: "Degree ^\\circ", latex: "^\\circ ", cursorOffset: 7 },
  { label: "Omega \\Omega", latex: "\\Omega ", cursorOffset: 7 },
  { label: "Lambda \\lambda", latex: "\\lambda ", cursorOffset: 8 },
  { label: "Alpha \\alpha", latex: "\\alpha ", cursorOffset: 7 },
  { label: "Beta \\beta", latex: "\\beta ", cursorOffset: 6 },
  { label: "Micro \\mu", latex: "\\mu ", cursorOffset: 4 },
  { label: "Infinity \\infty", latex: "\\infty ", cursorOffset: 8 },
];

const UNICODE_TO_LATEX_MAP: Record<string, string> = {
  "²": "^2",
  "³": "^3",
  "⁴": "^4",
  "½": "\\frac{1}{2}",
  "⅓": "\\frac{1}{3}",
  "¼": "\\frac{1}{4}",
  "¾": "\\frac{3}{4}",
  "±": "\\pm ",
  "∓": "\\mp ",
  "°": "^\\circ ",
  "≤": "\\le ",
  "≥": "\\ge ",
  "≠": "\\ne ",
  "≈": "\\approx ",
  "∞": "\\infty ",
  "Δ": "\\Delta ",
  "δ": "\\delta ",
  "π": "\\pi ",
  "θ": "\\theta ",
  "×": "\\times ",
  "·": "\\cdot ",
  "÷": "\\div ",
  "Ω": "\\Omega ",
  "ω": "\\omega ",
  "λ": "\\lambda ",
  "α": "\\alpha ",
  "β": "\\beta ",
  "γ": "\\gamma ",
  "μ": "\\mu ",
  "ρ": "\\rho ",
  "σ": "\\sigma ",
  "Σ": "\\Sigma ",
  "√": "\\sqrt{}",
  "→": "\\rightarrow ",
};

function sanitizePastedMath(text: string): string {
  let result = text;
  for (const [unicode, latex] of Object.entries(UNICODE_TO_LATEX_MAP)) {
    result = result.split(unicode).join(latex);
  }
  return result;
}

export interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  hidePreview?: boolean;
  hideChips?: boolean;
}

export function MathInput({
  value,
  onChange,
  placeholder = "Type text and LaTeX math formulas (e.g. $[M L^2 T^{-2}]$ or $E=mc^2$)...",
  label,
  rows = 3,
  className,
  disabled = false,
  required = false,
  hidePreview = false,
  hideChips = false,
}: MathInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertLatex = useCallback(
    (latex: string, cursorOffset?: number) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart ?? value.length;
      const end = textarea.selectionEnd ?? value.length;

      const before = value.substring(0, start);
      const after = value.substring(end);
      const newValue = before + latex + after;

      onChange(newValue);

      // Set cursor position inside the inserted latex
      const newCursorPos = start + (cursorOffset !== undefined ? cursorOffset : latex.length);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      });
    },
    [value, onChange]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const pastedText = e.clipboardData.getData("text/plain");
      if (!pastedText) return;

      const sanitized = sanitizePastedMath(pastedText);

      // Only override default paste if we made substitutions
      if (sanitized !== pastedText) {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart ?? value.length;
        const end = textarea.selectionEnd ?? value.length;

        const before = value.substring(0, start);
        const after = value.substring(end);
        const newValue = before + sanitized + after;

        onChange(newValue);

        const newCursorPos = start + sanitized.length;
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        });
      }
    },
    [value, onChange]
  );

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            {label} {required && <span className="text-pgc-red">*</span>}
          </label>
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            LaTeX Supported ($...$)
          </span>
        </div>
      )}

      {/* ── Quick-Insert Toolbar ──────────────────────────────────── */}
      {!hideChips && !disabled && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-white/10 text-xs">
          <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0 uppercase tracking-wider pr-1">
            Insert:
          </span>
          {QUICK_INSERT_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => insertLatex(chip.latex, chip.cursorOffset)}
              className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 text-[11px] font-mono font-medium shrink-0 transition-colors cursor-pointer shadow-sm"
              title={`Insert ${chip.label}`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* ── The Textarea ─────────────────────────────────────────── */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          required={required}
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C16]/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 text-sm font-sans resize-y leading-relaxed transition-colors disabled:opacity-50"
        />
      </div>

      {/* ── Live Preview Pane ────────────────────────────────────── */}
      {!hidePreview && (
        <div className="rounded-xl bg-black/40 border border-white/[0.06] p-3.5 relative overflow-hidden transition-all min-h-[52px]">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5 mb-2">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Eye className="w-3 h-3" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                Live Preview
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              KaTeX + Markdown
            </span>
          </div>

          {value ? (
            <MathRenderer content={value} className="text-sm" />
          ) : (
            <p className="text-xs text-slate-500 italic">
              Live math preview will render here as you type...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
