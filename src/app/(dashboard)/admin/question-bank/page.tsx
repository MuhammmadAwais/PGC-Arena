import type { Metadata } from "next";
import { Database, Search, Filter, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Question Bank Vault — PGC Arena Admin",
  description: "Browse, search, filter, and manage the entire institutional question bank.",
};

const mockStats = [
  { label: "Total Questions", value: "—", sub: "across all boards" },
  { label: "MCQ", value: "—", sub: "multiple-choice" },
  { label: "Short Answer", value: "—", sub: "structured" },
  { label: "Urdu / Arabic", value: "—", sub: "multi-script" },
];

export default function QuestionBankPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">
            Question Bank <span className="text-pgc-red">Vault</span>
          </h1>
          <p className="mt-1 text-sm text-white/45">
            Search, filter, tag, and audit every question seeded into the institutional bank.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {mockStats.map(({ label, value, sub }) => (
          <div key={label} className="rounded-2xl p-4 bg-white/[0.04] border border-white/[0.08]">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</p>
            <p className="font-display text-3xl font-bold text-white mt-2">{value}</p>
            <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Search + filter bar placeholder */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white/30">
          <Search className="w-4 h-4 shrink-0" />
          <span className="text-sm">Search questions…</span>
        </div>
        <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.09] transition-all duration-150 text-sm cursor-pointer">
          <Filter className="w-4 h-4" /> Filter
        </button>
        <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.09] transition-all duration-150 text-sm cursor-pointer">
          <Tag className="w-4 h-4" /> Tags
        </button>
      </div>

      {/* Table placeholder */}
      <div className="rounded-2xl p-10 min-h-[320px] flex flex-col items-center justify-center gap-4 bg-white/[0.03] border border-white/[0.08] border-dashed">
        <Database className="w-8 h-8 text-white/15" />
        <div className="text-center">
          <p className="text-sm font-semibold text-white/30">SeedReviewTable component</p>
          <p className="text-xs text-white/20 mt-1 leading-relaxed max-w-sm">
            Paginated data table with board, subject, difficulty, and script-type filters will render here.
          </p>
        </div>
        <p className="text-xs text-white/15">Route: /admin/question-bank · Feature: ai-seeding</p>
      </div>
    </div>
  );
}
