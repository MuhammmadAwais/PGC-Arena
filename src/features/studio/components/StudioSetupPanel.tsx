"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  BookOpen,
  Zap,
  Sliders,
  FileText,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useStudioStore } from "../store/useStudioStore";
import { slicePdfPages, getPdfPageCount } from "../utils/pdfSlicer";
import type { ScopeMode, DifficultyBias, CognitiveBias } from "../types/studioTypes";

export function StudioSetupPanel() {
  const {
    context,
    scope,
    setScope,
    generationConfig,
    setGenerationConfig,
    selectedBookId,
    selectedBook,
    setSelectedBook,
    availableBooks,
    addStreamedQuestion,
    isStreaming,
    setIsStreaming,
    streamProgress,
    setStreamProgress,
    error,
    setError,
  } = useStudioStore();

  const [selectedBookPages, setSelectedBookPages] = useState<number | null>(null);

  // Auto-detect page count when book selection changes
  useEffect(() => {
    if (selectedBook?.file_url) {
      if (selectedBook.page_count) {
        setSelectedBookPages(selectedBook.page_count);
        if (scope.endPage === 10 || scope.endPage > selectedBook.page_count) {
          setScope({ endPage: Math.min(10, selectedBook.page_count) });
        }
      } else {
        getPdfPageCount(selectedBook.file_url)
          .then((count) => {
            setSelectedBookPages(count);
          })
          .catch(() => {});
      }
    }
  }, [selectedBook, setScope, scope.endPage]);

  // ── Initiate AI Streaming Pipeline ────────────────────────────
  const handleInitiateForge = async () => {
    setError(null);

    // Assert minimum scope requirements
    if (scope.mode === "PAGE_RANGE" && scope.startPage > scope.endPage) {
      setError("Start page cannot be greater than end page.");
      return;
    }

    setIsStreaming(true);
    setStreamProgress(0, generationConfig.count);

    try {
      let pdfBase64: string | undefined = undefined;
      let pdfUrl: string | undefined = undefined;

      // 1. If page range is selected, try client-side slicing with pdf-lib in milliseconds
      if (scope.mode === "PAGE_RANGE" && selectedBook?.file_url) {
        try {
          const sliceResult = await slicePdfPages(
            selectedBook.file_url,
            scope.startPage,
            scope.endPage
          );
          pdfBase64 = sliceResult.base64;
        } catch (sliceClientErr) {
          console.warn(
            "Client-side PDF slice failed (e.g. CORS on raw URL). Delegating slicing to server:",
            sliceClientErr
          );
          pdfUrl = selectedBook.file_url;
        }
      } else if (selectedBook?.file_url) {
        pdfUrl = selectedBook.file_url;
      }

      // 2. Call Vercel AI SDK SSE route
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfBase64: pdfBase64 || undefined,
          pdfUrl: pdfUrl || undefined,
          startPage: scope.mode === "PAGE_RANGE" ? scope.startPage : undefined,
          endPage: scope.mode === "PAGE_RANGE" ? scope.endPage : undefined,
          topicPrompt: scope.topicPrompt || undefined,
          count: generationConfig.count,
          difficultyBias: generationConfig.difficultyBias,
          cognitiveBias: generationConfig.cognitiveBias,
          contextData: {
            boardName: context.boardName || undefined,
            classLevel: context.classLevel || 11,
            subjectName: context.subjectName || undefined,
            chapterTitle: context.chapterTitle || undefined,
            topicTitle: context.topicTitle || undefined,
            scriptType: context.subjectScript || "LATIN",
          },
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(
          errJson.error || `Server responded with status ${response.status}`
        );
      }

      if (!response.body) {
        throw new Error("No response body received from generation engine.");
      }

      // 3. Read stream text chunks and parse structured objects
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let parsedCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        try {
          const qMatch = accumulatedText.match(/"questions"\s*:\s*\[([\s\S]*)/);
          if (qMatch) {
            let jsonFragment = "[" + qMatch[1];
            const lastClosingBrace = jsonFragment.lastIndexOf("}");
            if (lastClosingBrace !== -1) {
              jsonFragment =
                jsonFragment.substring(0, lastClosingBrace + 1) + "]";
              const parsedQuestions = JSON.parse(jsonFragment);

              if (Array.isArray(parsedQuestions)) {
                while (parsedCount < parsedQuestions.length) {
                  const q = parsedQuestions[parsedCount];
                  if (
                    q &&
                    q.prompt &&
                    Array.isArray(q.options) &&
                    q.options.length === 4
                  ) {
                    addStreamedQuestion(q);
                    parsedCount++;
                  } else {
                    break;
                  }
                }
              }
            }
          }
        } catch {
          // Intermediate parsing syntax errors are expected during active streaming
        }
      }

      // Final complete pass
      try {
        const completeParsed = JSON.parse(accumulatedText);
        if (completeParsed && Array.isArray(completeParsed.questions)) {
          while (parsedCount < completeParsed.questions.length) {
            const q = completeParsed.questions[parsedCount];
            if (q && q.prompt) {
              addStreamedQuestion(q);
              parsedCount++;
            }
          }
        }
      } catch {
        // stream complete
      }

      if (parsedCount === 0) {
        throw new Error(
          "No MCQs could be generated from the selected document/syllabus. Please verify the page range or prompt."
        );
      }

      // Smooth scroll to the Rapid Review Deck
      setTimeout(() => {
        const deckEl = document.getElementById("rapid-review-deck");
        if (deckEl) {
          deckEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (err: any) {
      console.error("Initiate Forge error:", err);
      setError(err.message || "Failed during AI generation stream.");
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl p-5 sm:p-6 space-y-6 shadow-xl font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-white">
              Step 1: Digital Library Ingestion &amp; Scope Slicing
            </h2>
            <p className="text-[11px] text-slate-400">
              Select an uploaded textbook from the B2 Digital Library and slice the target pages.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/10">
          Library Books: {availableBooks.length}
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* ── 1. Digital Library Textbook Selector ──────────────────── */}
      <div className="space-y-3">
        <label className="text-xs font-bold font-display uppercase tracking-wider text-slate-300">
          Source Digital Library Textbook (Backblaze B2):
        </label>

        {availableBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {availableBooks.map((b) => {
              const isSelected = selectedBookId === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBook(b)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/40 text-white shadow-sm ring-1 ring-amber-500/20"
                      : "bg-black/30 border-white/[0.08] hover:bg-white/[0.04] text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate font-display">
                        {b.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {b.page_count ? `${b.page_count} Pages` : "PDF Document"}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-black/30 border border-white/[0.08] text-center space-y-1.5">
            <p className="text-xs text-slate-400">
              No textbooks currently linked to this subject in the Digital Library.
            </p>
            <a
              href="/admin/library"
              className="text-xs font-bold text-cyan-400 hover:underline inline-block"
            >
              Upload textbooks in Digital Library ➔
            </a>
          </div>
        )}
      </div>

      {/* ── 2. Scope & In-Memory Slicing ──────────────────────────── */}
      <div className="space-y-3">
        <label className="text-xs font-bold font-display uppercase tracking-wider text-slate-300">
          Target Scope &amp; Page Slicing:
        </label>

        <div className="grid grid-cols-3 gap-2">
          {(
            [
              {
                mode: "WHOLE",
                label: "Whole Textbook",
                desc: "Full curriculum focus",
              },
              {
                mode: "PAGE_RANGE",
                label: "Page Range",
                desc: "Slice specific pages in memory",
              },
              {
                mode: "TOPIC",
                label: "Specific Syllabus",
                desc: "Custom syllabus prompt",
              },
            ] as const
          ).map((item) => {
            const isSelected = scope.mode === item.mode;
            return (
              <button
                key={item.mode}
                type="button"
                onClick={() => setScope({ mode: item.mode as ScopeMode })}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500/40 text-white shadow-sm"
                    : "bg-black/30 border-white/[0.08] hover:bg-white/[0.04] text-slate-400 hover:text-slate-200"
                }`}
              >
                <p className="text-xs font-bold font-display uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Page Range Slicing Controls */}
        {scope.mode === "PAGE_RANGE" && (
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 animate-in fade-in-50 duration-150">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Client-side PDF Slicing Range:</span>
              {selectedBookPages && (
                <span className="text-amber-400 font-mono text-[11px]">
                  Total Textbook Pages: {selectedBookPages}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-display block mb-1">
                  Start Page
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedBookPages || 1000}
                  value={scope.startPage}
                  onChange={(e) =>
                    setScope({ startPage: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                />
              </div>

              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-display block mb-1">
                  End Page
                </label>
                <input
                  type="number"
                  min={scope.startPage}
                  max={selectedBookPages || 1000}
                  value={scope.endPage}
                  onChange={(e) => setScope({ endPage: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              ⚡ Slicing locally in memory prevents sending unused textbook sections across network.
            </p>
          </div>
        )}

        {scope.mode === "TOPIC" && (
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 animate-in fade-in-50 duration-150">
            <label className="text-[10px] uppercase font-bold text-slate-400 font-display block">
              Syllabus Instructions or Custom Topic Prompt:
            </label>
            <textarea
              rows={2}
              value={scope.topicPrompt}
              onChange={(e) => setScope({ topicPrompt: e.target.value })}
              placeholder="e.g. Focus on dimensional analysis of torque and work with numerical conversion problems..."
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50 font-sans"
            />
          </div>
        )}
      </div>

      {/* ── 3. Generation Config Controls ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/[0.06]">
        {/* Count Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase font-display text-slate-300">
              Questions Count:
            </span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              {generationConfig.count} MCQs
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={generationConfig.count}
            onChange={(e) =>
              setGenerationConfig({ count: Number(e.target.value) })
            }
            className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Difficulty Bias */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase font-display text-slate-300 block">
            Difficulty Bias:
          </label>
          <select
            value={generationConfig.difficultyBias}
            onChange={(e) =>
              setGenerationConfig({
                difficultyBias: e.target.value as DifficultyBias,
              })
            }
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50 cursor-pointer font-display uppercase font-bold"
          >
            <option value="BALANCED">Balanced (Easy/Med/Hard)</option>
            <option value="EASY">Easy (Direct Recall)</option>
            <option value="MEDIUM">Medium (Standard Board)</option>
            <option value="HARD">Hard (Tournament / Entry Test)</option>
          </select>
        </div>

        {/* Cognitive Bias */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase font-display text-slate-300 block">
            Cognitive Level:
          </label>
          <select
            value={generationConfig.cognitiveBias}
            onChange={(e) =>
              setGenerationConfig({
                cognitiveBias: e.target.value as CognitiveBias,
              })
            }
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50 cursor-pointer font-display uppercase font-bold"
          >
            <option value="MIXED">Mixed (Bloom's Taxonomy)</option>
            <option value="KNOWLEDGE">Knowledge / SLO Definitions</option>
            <option value="CONCEPTUAL">Conceptual / Analysis</option>
            <option value="APPLICATION">Application / Numerical</option>
          </select>
        </div>
      </div>

      {/* ── 4. Primary Turbo-Forge CTA ────────────────────────────── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleInitiateForge}
          disabled={isStreaming}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-pgc-gold to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-sm font-black font-display uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-2xl shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-60 hover:scale-[1.005]"
        >
          {isStreaming ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>
                Turbo-Forging MCQs ({streamProgress.current} of{" "}
                {streamProgress.total})...
              </span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 fill-black" />
              <span>
                Initiate AI Turbo-Forge ({generationConfig.count} Questions)
              </span>
            </>
          )}
        </button>

        {isStreaming && (
          <div className="mt-3 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Streaming structured questions from Gemini 1.5 Flash...</span>
              <span>
                {Math.round(
                  (streamProgress.current / streamProgress.total) * 100
                )}
                %
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-black/60 overflow-hidden border border-white/10">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                style={{
                  width: `${Math.max(
                    5,
                    (streamProgress.current / streamProgress.total) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
