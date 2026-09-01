import { Suspense } from "react";
import type { Metadata } from "next";
import { StudioWorkspace } from "@/features/studio/components/StudioWorkspace";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Question Studio — PGC Arena Admin",
  description:
    "Generate, lint, and seed competitive tournament questions using Gemini 1.5 Flash and local PDF slicing.",
};

export default function AICreationPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 font-sans">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-xs font-mono">Loading AI Question Studio...</p>
        </div>
      }
    >
      <StudioWorkspace />
    </Suspense>
  );
}
