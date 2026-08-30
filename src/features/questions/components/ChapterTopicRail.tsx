"use client";

import {
  ChevronLeft,
  ChevronRight,
  Folder,
  Hash,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  BookOpen,
  Layers,
  Sparkles,
} from "lucide-react";
import { useQuestionBankStore } from "../store/useQuestionBankStore";
import type { ChapterWithTopics, Topic } from "../types/questionTypes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ChapterTopicRail() {
  const {
    vaultData,
    activeChapterId,
    activeTopicId,
    setActiveChapter,
    setActiveTopic,
    openCreateChapter,
    openEditChapter,
    openCreateTopic,
    openEditTopic,
    openDeleteModal,
  } = useQuestionBankStore();

  const chapters = vaultData?.chapters || [];
  const activeChapter = chapters.find((c) => c.id === activeChapterId);

  // ── LEVEL 2: TOPICS RAIL ─────────────────────────────────────────
  if (activeChapterId && activeChapter) {
    return (
      <aside className="w-full lg:w-72 shrink-0 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md p-4 space-y-3 shadow-sm animate-in slide-in-from-left-4 duration-200">
        {/* Top: Back to Chapters Navigation */}
        <button
          type="button"
          onClick={() => setActiveChapter(null)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer border border-white/10 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>← Back to Chapters</span>
        </button>

        {/* Active Chapter Header Banner */}
        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-display">
              Chapter {activeChapter.chapter_number}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {activeChapter.question_count} Qs
            </span>
          </div>
          <h3 className="text-xs font-bold text-white font-display line-clamp-2">
            {activeChapter.title}
          </h3>
        </div>

        {/* Level 2 Topics List */}
        <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
          {/* All Topics in Chapter Option */}
          <button
            type="button"
            onClick={() => setActiveTopic(null)}
            className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-2 text-left transition-all cursor-pointer ${
              activeTopicId === null
                ? "bg-cyan-500/[0.08] border-cyan-400/40 text-white shadow-sm"
                : "bg-black/30 border-white/[0.08] hover:bg-white/[0.04] text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-xs font-bold truncate">All Topics</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 font-display">
              {activeChapter.question_count}
            </span>
          </button>

          {/* Individual Topics */}
          {activeChapter.topics.map((topic) => {
            const isSelected = activeTopicId === topic.id;

            return (
              <div
                key={topic.id}
                className={`group relative flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500/[0.08] border-cyan-400/40 text-white shadow-sm"
                    : "bg-black/30 border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.14] text-slate-300"
                }`}
                onClick={() => setActiveTopic(topic.id)}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono shrink-0">
                    {topic.topic_number}
                  </span>
                  <span className="text-xs font-semibold truncate group-hover:text-white transition-colors">
                    {topic.title}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-display">
                    {topic.question_count}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="h-6 w-6 rounded-md hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer outline-none"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-36 rounded-xl bg-[#0B0C16]/95 border border-white/15 backdrop-blur-xl p-1 shadow-2xl text-white z-50 animate-in fade-in-50 zoom-in-95"
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditTopic(topic);
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-cyan-400" />
                        <span>Edit Topic</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal("topic", topic.id, `${topic.topic_number} - ${topic.title}`);
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Topic CTA */}
        <button
          type="button"
          onClick={() => openCreateTopic(activeChapter)}
          className="w-full py-2 px-3 rounded-xl border border-dashed border-white/20 hover:border-cyan-400 bg-white/[0.02] hover:bg-cyan-500/10 text-xs font-bold text-slate-300 hover:text-cyan-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-display uppercase tracking-wider"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Topic</span>
        </button>
      </aside>
    );
  }

  // ── LEVEL 1: CHAPTERS RAIL ───────────────────────────────────────
  return (
    <aside className="w-full lg:w-72 shrink-0 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md p-4 space-y-3 shadow-sm">
      {/* Rail Title Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-display">
            Chapters Rail
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-display">
          {chapters.length} Total
        </span>
      </div>

      {/* All Chapters Selection */}
      <button
        type="button"
        onClick={() => setActiveChapter(null)}
        className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-2 text-left transition-all cursor-pointer ${
          activeChapterId === null
            ? "bg-cyan-500/[0.08] border-cyan-400/40 text-white shadow-sm"
            : "bg-black/30 border-white/[0.08] hover:bg-white/[0.04] text-slate-300"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-xs font-bold truncate">All Subject Chapters</span>
        </div>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 font-display">
          {vaultData?.stats.totalQuestions || 0}
        </span>
      </button>

      {/* Chapter Cards List */}
      <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
        {chapters.length > 0 ? (
          chapters.map((chapter) => (
            <div
              key={chapter.id}
              onClick={() => setActiveChapter(chapter.id)}
              className="group relative flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/30 border border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.14] text-slate-300 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/20 font-display shrink-0">
                  Ch {chapter.chapter_number}
                </span>
                <span className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {chapter.title}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-display">
                  {chapter.question_count} Qs
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="h-6 w-6 rounded-md hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer outline-none"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-36 rounded-xl bg-[#0B0C16]/95 border border-white/15 backdrop-blur-xl p-1 shadow-2xl text-white z-50 animate-in fade-in-50 zoom-in-95"
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditChapter(chapter);
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-cyan-400" />
                      <span>Edit Chapter</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal("chapter", chapter.id, `Chapter ${chapter.chapter_number}: ${chapter.title}`);
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-xs text-slate-400">No chapters created yet.</p>
          </div>
        )}
      </div>

      {/* Add Chapter Button */}
      <button
        type="button"
        onClick={openCreateChapter}
        className="w-full py-2 px-3 rounded-xl border border-dashed border-white/20 hover:border-cyan-400 bg-white/[0.02] hover:bg-cyan-500/10 text-xs font-bold text-slate-300 hover:text-cyan-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-display uppercase tracking-wider"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Chapter</span>
      </button>
    </aside>
  );
}
