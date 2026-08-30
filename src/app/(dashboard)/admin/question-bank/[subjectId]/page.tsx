"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useQuestionBankStore } from "@/features/questions/store/useQuestionBankStore";
import { QuestionVaultHeader } from "@/features/questions/components/QuestionVaultHeader";
import { ChapterTopicRail } from "@/features/questions/components/ChapterTopicRail";
import { McqCardGrid } from "@/features/questions/components/McqCardGrid";
import { QuestionVaultSkeleton } from "@/features/questions/components/skeletons/QuestionVaultSkeleton";

// ── Lazy-loaded Modals ───────────────────────────────────────────
const CreateEditMcqModal = dynamic(
  () =>
    import("@/features/questions/components/modals/CreateEditMcqModal").then(
      (m) => m.CreateEditMcqModal
    ),
  { ssr: false }
);

const CreateEditChapterModal = dynamic(
  () =>
    import(
      "@/features/questions/components/modals/CreateEditChapterModal"
    ).then((m) => m.CreateEditChapterModal),
  { ssr: false }
);

const CreateEditTopicModal = dynamic(
  () =>
    import("@/features/questions/components/modals/CreateEditTopicModal").then(
      (m) => m.CreateEditTopicModal
    ),
  { ssr: false }
);

const DeleteQuestionModal = dynamic(
  () =>
    import("@/features/questions/components/modals/DeleteQuestionModal").then(
      (m) => m.DeleteQuestionModal
    ),
  { ssr: false }
);

export default function SubjectQuestionVaultPage() {
  const params = useParams();
  const nodeId = (params?.subjectId as string) || "";

  const {
    vaultData,
    isLoadingVault,
    initNodeVault,
    error,
  } = useQuestionBankStore();

  useEffect(() => {
    if (nodeId) {
      initNodeVault(nodeId);
    }
  }, [nodeId, initNodeVault]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* ── Top Context Header ────────────────────────────────────── */}
      <QuestionVaultHeader />

      {/* ── Error Banner ──────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
          <p className="font-bold">Error loading question vault</p>
          <p className="text-red-400 mt-0.5">{error}</p>
        </div>
      )}

      {/* ── Main 2-Level Workspace Layout ─────────────────────────── */}
      {isLoadingVault && !vaultData ? (
        <QuestionVaultSkeleton />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: 2-Level Rail Sidebar */}
          <ChapterTopicRail />

          {/* Right: Paginated MCQ Data Grid Canvas */}
          <McqCardGrid />
        </div>
      )}

      {/* ── Dynamic Modals ─────────────────────────────────────────── */}
      <CreateEditMcqModal />
      <CreateEditChapterModal />
      <CreateEditTopicModal />
      <DeleteQuestionModal />
    </div>
  );
}
