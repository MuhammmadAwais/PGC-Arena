"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MoreVertical,
  BookOpen,
  Edit2,
  Trash2,
  ExternalLink,
  Flame,
  Globe,
  Languages,
} from "lucide-react";
import type { CurriculumNode, ScriptType } from "../types/curriculumTypes";
import { useCurriculumStore } from "../store/useCurriculumStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SubjectChipProps {
  node: CurriculumNode;
  boardName: string;
  disciplineName: string;
}

export function SubjectChip({ node, boardName, disciplineName }: SubjectChipProps) {
  const { openEditSubject, openDeleteModal } = useCurriculumStore();
  const { subject, question_count } = node;

  const getScriptBadge = (scriptType: ScriptType) => {
    switch (scriptType) {
      case "URDU_NASTALIQ":
        return {
          label: "اردو (Nastaliq)",
          className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-urdu-sans",
          fontClass: "font-urdu-nastaliq leading-relaxed tracking-normal",
        };
      case "ARABIC":
        return {
          label: "عربي (Arabic)",
          className: "bg-amber-500/15 text-amber-300 border-amber-500/30 font-arabic",
          fontClass: "font-arabic leading-relaxed",
        };
      default:
        return {
          label: "Latin",
          className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
          fontClass: "font-sans",
        };
    }
  };

  const scriptInfo = getScriptBadge(subject.script_type);

  const handleEditSubject = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEditSubject(subject);
  };

  const handleUnlink = (e: React.MouseEvent) => {
    e.stopPropagation();
    openDeleteModal(
      "node",
      node.id,
      `${subject.name} from ${disciplineName} (${boardName})`,
      {
        boardId: node.board_id,
        disciplineId: node.discipline_id,
        subjectId: node.subject_id,
        classLevel: node.class_level,
      }
    );
  };

  return (
    <div className="group relative flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/20 backdrop-blur-md transition-all duration-200 shadow-md hover:shadow-xl shrink-0 min-w-[260px] max-w-[320px]">
      {/* ── Left: Cover / Thumbnail & Details ─────────────────────── */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Textbook Thumbnail or Fallback Icon */}
        <div className="h-12 w-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 relative flex items-center justify-center shadow-sm">
          {subject.textbook_cover_url ? (
            <img
              src={subject.textbook_cover_url}
              alt={subject.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <BookOpen className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          )}
        </div>

        {/* Name & Badges */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono">
              {subject.code}
            </span>
            <span
              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md border ${scriptInfo.className}`}
            >
              {scriptInfo.label}
            </span>
          </div>

          <h4
            className={`text-xs font-bold text-white truncate mt-1 group-hover:text-cyan-300 transition-colors ${scriptInfo.fontClass}`}
            title={subject.name}
          >
            {subject.name}
          </h4>

          {/* Question count pill */}
          <div className="flex items-center gap-1 mt-1">
            <Flame className="w-3 h-3 text-pgc-gold fill-pgc-gold/20" />
            <span className="text-[10px] font-semibold text-pgc-gold font-display">
              {question_count} Qs
            </span>
            <span className="text-[10px] text-slate-500 font-sans">available</span>
          </div>
        </div>
      </div>

      {/* ── Right: 3-dot Action Menu ──────────────────────────────── */}
      <div className="shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className="h-7 w-7 rounded-lg bg-transparent hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer outline-none"
            aria-label="Subject Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-52 rounded-xl bg-[#0B0C16]/95 border border-white/15 backdrop-blur-xl p-1.5 shadow-2xl text-white z-50 animate-in fade-in-50 zoom-in-95"
          >
            <DropdownMenuItem
              onClick={handleEditSubject}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Edit Subject Metadata</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                window.location.href = `/admin/question-bank/${node.id}`;
              }}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-pgc-gold" />
              <span>Open in Question Bank</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 border-t border-white/10" />

            <DropdownMenuItem
              onClick={handleUnlink}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Remove from Discipline</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
