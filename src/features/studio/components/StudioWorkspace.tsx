"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StudioContextHeader } from "./StudioContextHeader";
import { StudioSetupPanel } from "./StudioSetupPanel";
import { RapidReviewDeck } from "./RapidReviewDeck";
import { StudioStickyFooter } from "./StudioStickyFooter";
import { useStudioStore } from "../store/useStudioStore";
import { getSubjectVaultData } from "@/features/questions/actions/questionActions";
import { getLibraryBooksAction } from "@/features/library/actions/libraryActions";
import { Loader2 } from "lucide-react";

export function StudioWorkspace() {
  const searchParams = useSearchParams();
  const nodeId = searchParams.get("nodeId") || "";
  const subjectId = searchParams.get("subjectId") || "";
  const chapterId = searchParams.get("chapterId") || "";
  const topicId = searchParams.get("topicId") || "";
  const bookId = searchParams.get("bookId") || "";
  const classLevel = Number(searchParams.get("classLevel")) || 11;

  const {
    setContext,
    setAvailableBooks,
    setSelectedBook,
    stagedQuestions,
  } = useStudioStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initContext() {
      setIsInitializing(true);
      try {
        let activeSubjectId = subjectId;

        if (nodeId) {
          const vaultRes = await getSubjectVaultData(nodeId);
          if (vaultRes.success) {
            const board = vaultRes.board;
            const discipline = vaultRes.discipline;
            const subject = vaultRes.subject;
            const chapters = vaultRes.chapters;

            activeSubjectId = subject?.id || subjectId;

            const activeChapter =
              chapters.find((c) => c.id === chapterId) || chapters[0];
            const activeTopic =
              activeChapter?.topics.find((t) => t.id === topicId) ||
              activeChapter?.topics[0];

            setContext({
              nodeId,
              boardId: board?.id || null,
              boardName: board?.name || null,
              boardCode: board?.code || null,
              disciplineId: discipline?.id || null,
              disciplineName: discipline?.name || null,
              classLevel: vaultRes.classLevel || classLevel,
              subjectId: subject?.id || null,
              subjectName: subject?.name || null,
              subjectScript: subject?.script_type || "LATIN",
              chapterId: activeChapter?.id || null,
              chapterNumber: activeChapter?.chapter_number || null,
              chapterTitle: activeChapter?.title || null,
              topicId: activeTopic?.id || null,
              topicNumber: activeTopic?.topic_number || null,
              topicTitle: activeTopic?.title || null,
            });
          }
        } else {
          // Reset stale context when entering without specific topic/node parameters
          setContext({
            nodeId: null,
            boardId: null,
            boardName: null,
            boardCode: null,
            disciplineId: null,
            disciplineName: null,
            classLevel: classLevel || 11,
            subjectId: subjectId || null,
            subjectName: null,
            subjectCode: null,
            subjectScript: "LATIN",
            chapterId: null,
            chapterNumber: null,
            chapterTitle: null,
            topicId: null,
            topicNumber: null,
            topicTitle: null,
          });
        }

        // Fetch Digital Library books available for this subject or general
        const booksRes = await getLibraryBooksAction({
          subjectId: activeSubjectId || null,
        });

        if (booksRes.success) {
          setAvailableBooks(booksRes.books);
          if (bookId) {
            const matched = booksRes.books.find((b) => b.id === bookId);
            if (matched) setSelectedBook(matched);
          }
        }
      } catch (err) {
        console.error("Failed to initialize Studio context:", err);
      } finally {
        setIsInitializing(false);
      }
    }

    initContext();
  }, [
    nodeId,
    subjectId,
    chapterId,
    topicId,
    bookId,
    classLevel,
    setContext,
    setAvailableBooks,
    setSelectedBook,
  ]);

  if (isInitializing) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-xs font-mono">
          Initializing AI Question Studio environment...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300 font-sans">
      {/* ── Context & Breadcrumbs Header ───────────────────────────── */}
      <StudioContextHeader />

      {/* ── Step 1: Ingestion & Generation Setup ───────────────────── */}
      <StudioSetupPanel />

      {/* ── Step 2: Rapid Review Deck ──────────────────────────────── */}
      {stagedQuestions.length > 0 && <RapidReviewDeck />}

      {/* ── Sticky Commit Footer ───────────────────────────────────── */}
      <StudioStickyFooter />
    </div>
  );
}
