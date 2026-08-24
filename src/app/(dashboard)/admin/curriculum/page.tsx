import type { Metadata } from "next";
import { BookOpen, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Curriculum & Boards — PGC Arena Admin",
  description: "Manage subject boards, curriculum definitions, and question category taxonomies.",
};

const boards = [
  { name: "Federal Board (FBISE)", subjects: 12, color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  { name: "Punjab Board (BISE)", subjects: 14, color: "bg-pgc-red/10 border-pgc-red/20 text-pgc-red" },
  { name: "Aga Khan Board", subjects: 10, color: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  { name: "Cambridge (O/A Level)", subjects: 16, color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
];

export default function CurriculumPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">
          Curriculum &amp; <span className="text-pgc-red">Boards</span>
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Define examination boards, subject taxonomies, and chapter-level question categories.
        </p>
      </div>

      {/* Board cards */}
      <div className="grid grid-cols-2 gap-4">
        {boards.map(({ name, subjects, color }) => (
          <div
            key={name}
            className={`rounded-2xl p-5 border bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 cursor-pointer`}
          >
            <GraduationCap className={`w-5 h-5 mb-3 ${color.split(" ").pop()}`} />
            <p className="font-semibold text-white text-sm">{name}</p>
            <p className="text-xs text-white/35 mt-1">{subjects} active subjects</p>
          </div>
        ))}
      </div>

      {/* Placeholder */}
      <div className="rounded-2xl p-10 min-h-[280px] flex flex-col items-center justify-center gap-4 bg-white/[0.03] border border-white/[0.08] border-dashed">
        <BookOpen className="w-8 h-8 text-white/15" />
        <div className="text-center">
          <p className="text-sm font-semibold text-white/30">Curriculum tree editor</p>
          <p className="text-xs text-white/20 mt-1">Board → Subject → Chapter → Topic hierarchy will render here.</p>
        </div>
        <p className="text-xs text-white/15 mt-1">Route: /admin/curriculum · Feature: ai-seeding</p>
      </div>
    </div>
  );
}
