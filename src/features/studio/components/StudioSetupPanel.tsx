import { useState, useEffect, useMemo } from "react";
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
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { useStudioStore } from "../store/useStudioStore";
import { slicePdfPages, getPdfPageCount } from "../utils/pdfSlicer";
import { PdfPagePreviewCard } from "./PdfPagePreviewCard";
import type { ScopeMode, DifficultyBias, CognitiveBias } from "../types/studioTypes";
import type { LibraryBook } from "@/features/library/types/libraryTypes";
import { getLibraryBooksAction } from "@/features/library/actions/libraryActions";
import { BookCoverThumbnail } from "@/features/library/components/BookCoverThumbnail";

export function StudioSetupPanel() {
  const {
    context,
    scope,
    setScope,
    generationConfig,
    setGenerationConfig,
    isStreaming,
    setIsStreaming,
    streamProgress,
    setStreamProgress,
    addStreamedQuestion,
    setStagedQuestions,
    selectedBook,
    setSelectedBook,
  } = useStudioStore();

  const [availableBooks, setAvailableBooks] = useState<LibraryBook[]>([]);
  const [selectedBookPages, setSelectedBookPages] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Textbook search & pagination states in AI Studio
  const [bookSearch, setBookSearch] = useState("");
  const [bookPage, setBookPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState<number>(4);

  // ── Cooldown Timer Countdown Effect ─────────────────────────────
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Fallback book selection if navigated with query params
  const selectedBookId = selectedBook?.id || null;

  // 1. Fetch linked books for active subject
  useEffect(() => {
    async function loadSubjectBooks() {
      try {
        const res = await getLibraryBooksAction({
          subjectId: context.subjectId || undefined,
          boardId: context.boardId || undefined,
        });
        if (res.success && res.books) {
          setAvailableBooks(res.books);
          if (!selectedBook && res.books.length > 0) {
            setSelectedBook(res.books[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load library books for studio:", err);
      }
    }
    loadSubjectBooks();
  }, [context.subjectId, context.boardId, selectedBook, setSelectedBook]);

  // Sync selectedBook metadata (like updated thumbnail_url) with latest availableBooks list
  useEffect(() => {
    if (selectedBook && availableBooks.length > 0) {
      const updated = availableBooks.find((b) => b.id === selectedBook.id);
      if (updated && updated.thumbnail_url !== selectedBook.thumbnail_url) {
        setSelectedBook(updated);
      }
    }
  }, [availableBooks, selectedBook, setSelectedBook]);

  // 2. Fetch total page count for selected book
  useEffect(() => {
    if (selectedBook?.page_count) {
      setSelectedBookPages(selectedBook.page_count);
      return;
    }
    if (selectedBook?.file_url) {
      getPdfPageCount(selectedBook.file_url)
        .then((count) => setSelectedBookPages(count))
        .catch(() => setSelectedBookPages(null));
    }
  }, [selectedBook]);

  // ── Initiate AI Generation Action ────────────────────────────────
  const handleInitiateForge = async () => {
    if (cooldownSeconds > 0) {
      setError(`Please wait ${cooldownSeconds}s for Google AI rate-limit cooldown before initiating another generation.`);
      return;
    }

    try {
      setError(null);
      setStagedQuestions([]);
      setIsStreaming(true);
      setStreamProgress(0, generationConfig.count);

      let pdfBase64: string | null = null;
      let pdfUrl: string | null = null;

      // 1. If Page Range mode, slice locally via in-memory PDF library
      if (scope.mode === "PAGE_RANGE" && selectedBook?.file_url) {
        try {
          const sliced = await slicePdfPages(
            selectedBook.file_url,
            scope.startPage,
            scope.endPage
          );
          pdfBase64 = sliced.base64;
        } catch (sliceClientErr) {
          console.warn(
            "Client PDF slice failed, falling back to server-side slice:",
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
          pdfBase64,
          pdfUrl,
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
            subjectCode:
              context.subjectCode ||
              selectedBook?.assignments?.[0]?.subject?.code ||
              undefined,
            chapterTitle: context.chapterTitle || undefined,
            topicTitle: context.topicTitle || undefined,
            scriptType: context.subjectScript || "LATIN",
          },
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        if (response.status === 429 || response.status === 503 || errJson.throttled) {
          const waitTime = errJson.retryAfterSeconds || 20;
          setCooldownSeconds(waitTime);
          throw new Error(
            errJson.error ||
              `Google AI free-tier rate limit reached. Please wait ${waitTime}s before retrying.`
          );
        }
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
        try {
          const errObj = JSON.parse(accumulatedText);
          if (errObj && errObj.error) {
            if (errObj.throttled || errObj.error.includes("429") || errObj.error.includes("quota")) {
              setCooldownSeconds(20);
            }
            throw new Error(errObj.error);
          }
        } catch (e: any) {
          if (e.message && !e.message.includes("JSON")) throw e;
        }
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

  // ── Book Search & Pagination Computations ────────────────────────────────
  const filteredAvailableBooks = useMemo(() => {
    if (!bookSearch.trim()) return availableBooks;
    const q = bookSearch.toLowerCase();
    return availableBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.assignments.some(
          (a) =>
            a.subject?.name.toLowerCase().includes(q) ||
            a.board?.code.toLowerCase().includes(q) ||
            a.discipline?.name.toLowerCase().includes(q)
        )
    );
  }, [availableBooks, bookSearch]);

  const totalBookPages = Math.max(
    1,
    Math.ceil(filteredAvailableBooks.length / booksPerPage)
  );

  const paginatedAvailableBooks = useMemo(() => {
    const start = (bookPage - 1) * booksPerPage;
    return filteredAvailableBooks.slice(start, start + booksPerPage);
  }, [filteredAvailableBooks, bookPage, booksPerPage]);

  // Reset book page on search or per-page change
  useEffect(() => {
    setBookPage(1);
  }, [bookSearch, booksPerPage]);

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md p-5 sm:p-6 space-y-6 shadow-sm font-sans">
      {/* ── Section Title ────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-pgc-red/10 border border-pgc-red/25 flex items-center justify-center text-pgc-red">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-white">
              Step 1: Ingestion &amp; Generation Setup
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Select your source textbook and configure question difficulty.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 border border-white/10">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <label className="text-xs font-bold font-display uppercase tracking-wider text-slate-300">
            Source Digital Library Textbook:
          </label>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search bar when multiple books available */}
            {availableBooks.length > 2 && (
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="Search books..."
                  className="w-full pl-8 pr-3 py-1 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
                />
              </div>
            )}

            {/* Per view selector */}
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <span>Per page:</span>
              <select
                value={booksPerPage}
                onChange={(e) => setBooksPerPage(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300 focus:outline-none cursor-pointer"
              >
                {[2, 4, 6, 8, 12].map((num) => (
                  <option key={num} value={num} className="bg-[#0B0C16] text-white">
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {paginatedAvailableBooks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {paginatedAvailableBooks.map((b) => {
                const isSelected = selectedBookId === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBook(b)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-white/[0.08] border-white/25 text-white shadow-sm"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Robust Thumbnail / Gradient Cover */}
                      <BookCoverThumbnail
                        thumbnailUrl={b.thumbnail_url}
                        title={b.title}
                        subjectName={b.assignments?.[0]?.subject?.name}
                        size="sm"
                      />

                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-bold text-white truncate font-display">
                          {b.title}
                        </p>

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-sans flex-wrap">
                          <span>
                            {b.page_count ? `${b.page_count} Pages` : "PDF Document"}
                          </span>
                          {b.assignments && b.assignments.length > 0 && (
                            <>
                              <span className="text-white/20">•</span>
                              <span className="text-cyan-300 font-medium truncate max-w-[130px]">
                                {b.assignments[0]?.subject?.name || "Mapped"}
                              </span>
                              {b.assignments[0]?.board?.code && (
                                <span className="px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-300 font-mono text-[9px]">
                                  {b.assignments[0].board.code}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
              <span className="text-[11px] text-slate-400 font-mono">
                Showing {filteredAvailableBooks.length === 0 ? 0 : (bookPage - 1) * booksPerPage + 1}–{Math.min(bookPage * booksPerPage, filteredAvailableBooks.length)} of {filteredAvailableBooks.length} textbooks (Page {bookPage} of {totalBookPages})
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBookPage((p) => Math.max(1, p - 1))}
                  disabled={bookPage === 1}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/10 disabled:opacity-30 text-xs font-semibold text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBookPage((p) => Math.min(totalBookPages, p + 1))}
                  disabled={bookPage === totalBookPages}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/10 disabled:opacity-30 text-xs font-semibold text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-center space-y-1.5">
            <p className="text-xs text-slate-400">
              No textbooks found matching your search.
            </p>
          </div>
        )}
      </div>

      {/* ── 2. Slicing & Scope Controls ───────────────────────────── */}
      <div className="space-y-3">
        <label className="text-xs font-bold font-display uppercase tracking-wider text-slate-300">
          Target Scope &amp; Slicing Mode:
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {(
            [
              {
                mode: "WHOLE",
                label: "Entire Book Section",
                desc: "Ingests entire PDF range",
              },
              {
                mode: "PAGE_RANGE",
                label: "Custom Pages",
                desc: "Client-side page slice",
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
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white/[0.08] border-white/25 text-white shadow-sm"
                    : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-slate-400 hover:text-slate-200"
                }`}
              >
                <p className="text-xs font-bold font-display uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Page Range Slicing Controls & Visual Verification */}
        {scope.mode === "PAGE_RANGE" && (
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4 animate-in fade-in-50 duration-150">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>PDF Slicing Range:</span>
              {selectedBookPages && (
                <span className="text-cyan-400 font-mono text-[11px]">
                  Total Textbook Pages: {selectedBookPages}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-display block mb-1">
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
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white font-mono"
                />
              </div>

              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 font-display block mb-1">
                  End Page
                </label>
                <input
                  type="number"
                  min={scope.startPage}
                  max={selectedBookPages || 1000}
                  value={scope.endPage}
                  onChange={(e) => setScope({ endPage: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Visual Starting & Ending Page Verification */}
            {selectedBook?.file_url && (
              <PdfPagePreviewCard
                fileUrl={selectedBook.file_url}
                startPage={scope.startPage}
                endPage={scope.endPage}
                totalPages={selectedBookPages || selectedBook.page_count || 1000}
                onStartPageChange={(p) => setScope({ startPage: p })}
                onEndPageChange={(p) => setScope({ endPage: p })}
              />
            )}
          </div>
        )}

        {scope.mode === "TOPIC" && (
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 animate-in fade-in-50 duration-150">
            <label className="text-[10px] uppercase font-bold text-slate-400 font-display block">
              Syllabus Instructions or Custom Topic Prompt:
            </label>
            <textarea
              rows={2}
              value={scope.topicPrompt}
              onChange={(e) => setScope({ topicPrompt: e.target.value })}
              placeholder="e.g. Focus on dimensional analysis of torque and work with numerical conversion problems..."
              className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 font-sans"
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
            <span className="font-mono font-bold text-cyan-400 text-sm">
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
            className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-pgc-red"
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
            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400/50 cursor-pointer font-display uppercase font-bold transition-colors"
          >
            <option value="BALANCED" className="bg-[#0B0C16] text-white">Balanced (Easy/Med/Hard)</option>
            <option value="EASY" className="bg-[#0B0C16] text-white">Easy (Direct Recall)</option>
            <option value="MEDIUM" className="bg-[#0B0C16] text-white">Medium (Standard Board)</option>
            <option value="HARD" className="bg-[#0B0C16] text-white">Hard (Tournament / Entry Test)</option>
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
            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400/50 cursor-pointer font-display uppercase font-bold transition-colors"
          >
            <option value="MIXED" className="bg-[#0B0C16] text-white">Mixed (Bloom's Taxonomy)</option>
            <option value="KNOWLEDGE" className="bg-[#0B0C16] text-white">Knowledge / SLO Definitions</option>
            <option value="CONCEPTUAL" className="bg-[#0B0C16] text-white">Conceptual / Analysis</option>
            <option value="APPLICATION" className="bg-[#0B0C16] text-white">Application / Numerical</option>
          </select>
        </div>
      </div>

      {/* ── Cooldown Alert Banner ─────────────────────────────────── */}
      {cooldownSeconds > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between gap-3 animate-in fade-in-50">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <div>
              <p className="font-bold font-display uppercase tracking-wider text-amber-300">
                Google AI Free-Tier Cooldown Active
              </p>
              <p className="text-[11px] text-amber-200/80">
                Google Gemini API temporary quota throttle active. Cooldown ends in{" "}
                <strong className="font-mono text-amber-300 font-bold">{cooldownSeconds}s</strong>.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-sm">
            {cooldownSeconds}s
          </span>
        </div>
      )}

      {/* ── 4. Primary Turbo-Forge CTA ────────────────────────────── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleInitiateForge}
          disabled={isStreaming || cooldownSeconds > 0}
          className="w-full py-3.5 rounded-xl bg-pgc-red hover:bg-[#c92a37] text-white text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-2 border border-red-600/30 transition-colors cursor-pointer disabled:opacity-60 shadow-sm"
        >
          {isStreaming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                Generating MCQs ({streamProgress.current} of{" "}
                {streamProgress.total})...
              </span>
            </>
          ) : cooldownSeconds > 0 ? (
            <>
              <Clock className="w-4 h-4 text-amber-300" />
              <span>
                AI Cooldown Active ({cooldownSeconds}s remaining)
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>
                Initiate AI Question Generation ({generationConfig.count} Questions)
              </span>
            </>
          )}
        </button>

        {isStreaming && (
          <div className="mt-3 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Streaming structured questions from Gemini...</span>
              <span>
                {Math.round(
                  (streamProgress.current / streamProgress.total) * 100
                )}
                %
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-white/10">
              <div
                className="h-full bg-pgc-red rounded-full transition-all duration-300"
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
