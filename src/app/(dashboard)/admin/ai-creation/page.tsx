import type { Metadata } from "next";
import { Sparkles, Upload, Brain, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Question Generator — PGC Arena Admin",
  description:
    "Generate and seed questions using the Gemini AI pipeline from uploaded PDFs.",
};

const pipeline = [
  {
    step: "1",
    label: "Upload PDF",
    icon: Upload,
    done: false,
    desc: "Drop a past paper or textbook chapter",
  },
  {
    step: "2",
    label: "AI Parsing",
    icon: Brain,
    done: false,
    desc: "Gemini extracts and structures questions",
  },
  {
    step: "3",
    label: "Review & Edit",
    icon: CheckCircle,
    done: false,
    desc: "Human review before committing to bank",
  },
];

export default function AICreationPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">
          AI Question <span className="text-pgc-red">Forge</span>
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Upload PDFs and let the Gemini pipeline automatically extract,
          structure, and seed questions into the vault.
        </p>
      </div>

      {/* Pipeline steps */}
      <div className="grid grid-cols-3 gap-4">
        {pipeline.map(({ step, label, icon: Icon, desc }) => (
          <div
            key={step}
            className="rounded-2xl p-5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-pgc-red/15 border border-pgc-red/30 flex items-center justify-center">
                <Icon className="w-4 h-4 text-pgc-red" />
              </div>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Step {step}
              </span>
            </div>
            <p className="font-semibold text-sm text-white">{label}</p>
            <p className="text-xs text-white/35 mt-1">{desc}</p>
          </div>
        ))}
      </div>

      {/* PDF drop zone placeholder */}
      <div className="rounded-2xl p-12 min-h-[320px] flex flex-col items-center justify-center gap-4 bg-white/[0.03] border border-white/[0.08] border-dashed hover:border-pgc-red/30 hover:bg-pgc-red/[0.02] transition-all duration-300 cursor-pointer">
        <div className="w-16 h-16 rounded-2xl bg-pgc-red/10 border border-pgc-red/20 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-pgc-red/60" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white/40">
            PDFDropzone component
          </p>
          <p className="text-xs text-white/25 mt-1.5 leading-relaxed">
            Drag &amp; drop a past paper PDF here. The AI pipeline (
            <span className="text-pgc-red/60 font-medium">
              parsePdfWithGemini
            </span>
            ) will extract MCQs, structured questions, and fill-in-the-blank
            items automatically.
          </p>
        </div>
        <p className="text-xs text-white/15 mt-2">
          Route: /admin/ai-creation · Feature: ai-seeding
        </p>
      </div>
    </div>
  );
}
