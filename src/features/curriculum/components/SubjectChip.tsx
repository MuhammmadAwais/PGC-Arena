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
  ChevronRight,
  Sparkles,
  Trophy,
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
          className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-urdu-sans",
          fontClass: "font-urdu-nastaliq leading-loose tracking-normal text-right",
        };
      case "ARABIC":
        return {
          label: "عربي (Arabic)",
          className: "bg-amber-500/20 text-amber-300 border-amber-500/40 font-arabic",
          fontClass: "font-arabic leading-loose text-right",
        };
      default:
        return {
          label: "Latin Script",
          className: "bg-white/10 text-slate-300 border-white/15",
          fontClass: "font-display tracking-tight",
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
    <div className="group relative flex flex-col justify-between rounded-2xl bg-[#0e111d] hover:bg-[#131728] border border-white/[0.08] hover:border-pgc-red/40 transition-all duration-300 shadow-xl hover:shadow-[0_12px_36px_rgba(0,0,0,0.6)] hover:scale-[1.01] shrink-0 min-w-[280px] max-w-[320px] flex-1 overflow-hidden">
      {/* ── 1. Top Aspect-Ratio Cover Banner (Squad Card Style) ─────── */}
      <div className="relative h-28 w-full overflow-hidden bg-black/80">
        {subject.textbook_cover_url ? (
          <img
            src={subject.textbook_cover_url}
            alt={subject.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pgc-red/30 via-[#0e111d] to-pgc-indigo/40 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white/20" />
          </div>
        )}

        {/* Gradient Fade to Card Body */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e111d] via-[#0e111d]/50 to-transparent" />

        {/* Top-Left: Code Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/15 shadow-sm">
            {subject.code}
          </span>
        </div>

        {/* Top-Right: Question Vault Metric Pill */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-display font-black text-pgc-gold border border-pgc-gold/40 flex items-center gap-1 shadow-sm">
            <Flame className="w-3 h-3 fill-pgc-gold/40 text-pgc-gold" />
            <span>{question_count} Qs</span>
          </span>
        </div>

        {/* Floating Subject Emblem Icon */}
        <div className="absolute bottom-2 left-3 z-10">
          <div className="w-9 h-9 rounded-xl bg-black/90 border border-white/20 flex items-center justify-center p-1.5 shadow-2xl backdrop-blur-md">
            <BookOpen className="w-4 h-4 text-pgc-red" />
          </div>
        </div>
      </div>

      {/* ── 2. Card Content Body ───────────────────────────────────── */}
      <div className="p-4 pt-2 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-0.5">
          <h4
            className={`text-base font-display font-extrabold text-white group-hover:text-pgc-red transition-colors truncate ${scriptInfo.fontClass}`}
            title={subject.name}
          >
            {subject.name}
          </h4>
          <p className="text-[11px] text-slate-400 font-sans truncate">
            Class {node.class_level} • {disciplineName}
          </p>
        </div>

        {/* Sub-box: Script / Language Tag & Action Menu */}
        <div className="rounded-xl bg-black/50 border border-white/5 p-2 flex items-center justify-between">
          <span
            className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${scriptInfo.className}`}
          >
            {scriptInfo.label}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className="h-6 w-6 rounded-lg bg-transparent hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer outline-none"
              aria-label="Subject Actions"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-52 rounded-xl bg-[#0B0C16]/95 border border-white/15 backdrop-blur-xl p-1.5 shadow-2xl text-white z-50 animate-in fade-in-50 zoom-in-95 font-sans"
            >
              <DropdownMenuItem
                onClick={handleEditSubject}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-pgc-red" />
                <span>Edit Subject Details</span>
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

        {/* ── 3. Tactile CTA Button ─────────────────────────────────── */}
        <Link
          href={`/admin/question-bank/${node.id}`}
          className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-pgc-red text-slate-300 hover:text-white text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-pgc-red/20 cursor-pointer"
        >
          <span>Manage Question Vault</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
