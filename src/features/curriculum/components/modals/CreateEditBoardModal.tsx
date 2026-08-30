"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CloudinaryUploadZone } from "@/components/ui/CloudinaryUploadZone";
import { useCurriculumStore } from "../../store/useCurriculumStore";
import {
  createBoardAction,
  updateBoardAction,
} from "../../actions/curriculumActions";

export function CreateEditBoardModal() {
  const {
    isCreateBoardOpen,
    closeCreateBoard,
    editBoardData,
    fetchCurriculum,
  } = useCurriculumStore();

  const isEditing = !!editBoardData;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editBoardData) {
      setName(editBoardData.name);
      setCode(editBoardData.code);
      setLogoUrl(editBoardData.logo_url);
      setBannerUrl(editBoardData.banner_url);
      setIsActive(editBoardData.is_active);
    } else {
      setName("");
      setCode("");
      setLogoUrl(null);
      setBannerUrl(null);
      setIsActive(true);
    }
    setError(null);
  }, [editBoardData, isCreateBoardOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Board name and code are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && editBoardData) {
        const res = await updateBoardAction({
          id: editBoardData.id,
          name: name.trim(),
          code: code.trim().toUpperCase(),
          logo_url: logoUrl,
          banner_url: bannerUrl,
          is_active: isActive,
        });

        if (!res.success) {
          throw new Error(res.error || "Failed to update board");
        }
      } else {
        const res = await createBoardAction({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          logo_url: logoUrl,
          banner_url: bannerUrl,
          is_active: isActive,
        });

        if (!res.success) {
          throw new Error(res.error || "Failed to create board");
        }
      }

      await fetchCurriculum(true);
      closeCreateBoard();
    } catch (err: any) {
      console.error("Board modal submission error:", err);
      setError(err.message || "Failed to save board");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isCreateBoardOpen} onOpenChange={(open) => !open && closeCreateBoard()}>
      <DialogContent className="max-w-xl w-[95vw] p-6 sm:p-7 bg-[#0e111d] border border-white/[0.08] text-white backdrop-blur-2xl rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        {/* ── Dialog Header ───────────────────────────────────────── */}
        <DialogHeader className="border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-display tracking-tight text-white">
                {isEditing ? "Edit Examination Board" : "Create Examination Board"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                {isEditing
                  ? "Update board branding, code, and active status."
                  : "Add an examination board (e.g., Federal Board FBISE, BISE Lahore, Cambridge)."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* ── Board Name & Code ───────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 font-display">
                Board Name <span className="text-pgc-red">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Federal Board (FBISE)"
                required
                className="bg-black/40 border-white/10 hover:border-white/20 text-white placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 font-display">
                Board Code <span className="text-pgc-red">*</span>
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="FBISE"
                required
                className="bg-black/40 border-white/10 hover:border-white/20 text-white placeholder-slate-500 text-xs font-mono font-bold uppercase rounded-xl px-3.5 py-2.5 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all"
              />
            </div>
          </div>

          {/* ── Active Status Card (Professional & Minimal) ─────────── */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white font-display">Status</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-white/5 text-slate-400 border-white/10"
                  }`}
                >
                  {isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Allow matches, tournaments, and questions under this board.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* ── Dual Media Uploads (Pixel-Perfect Alignment) ────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 items-start">
            <CloudinaryUploadZone
              label="Board Logo / Crest"
              variant="avatar"
              value={logoUrl}
              onUpload={setLogoUrl}
              onRemove={() => setLogoUrl(null)}
              folder="boards/logos"
            />

            <CloudinaryUploadZone
              label="Header Banner"
              variant="banner"
              value={bannerUrl}
              onUpload={setBannerUrl}
              onRemove={() => setBannerUrl(null)}
              folder="boards/banners"
            />
          </div>

          {/* ── Modal Footer Actions ────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={closeCreateBoard}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-pgc-red hover:bg-[#c92f1f] text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-pgc-red/25 hover:shadow-pgc-red/40 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? "Save Changes" : "Create Board"}</span>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
