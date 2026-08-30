"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Loader2,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";

export interface CloudinaryUploadZoneProps {
  value?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  variant?: "avatar" | "banner" | "compact";
  label?: string;
  hint?: string;
  folder?: string;
  disabled?: boolean;
}

export function CloudinaryUploadZone({
  value,
  onUpload,
  onRemove,
  variant = "avatar",
  label,
  hint,
  folder = "pgc_arena",
  disabled = false,
}: CloudinaryUploadZoneProps) {
  const [isDirectUploading, setIsDirectUploading] = useState(false);
  const [directError, setDirectError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "y2uzgkca";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "pgc_arena_media";

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    onUpload(customUrl.trim());
    setCustomUrl("");
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-1.5 font-sans w-full">
      {/* ── Label & Quick URL toggle ──────────────────────────── */}
      <div className="flex items-center justify-between min-h-[20px] gap-2">
        {label && (
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 font-display flex items-center gap-1.5 truncate">
            {variant === "banner" ? (
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            )}
            <span className="truncate">{label}</span>
          </label>
        )}
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[10px] text-slate-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors group cursor-pointer shrink-0 ml-auto"
        >
          <LinkIcon className="w-2.5 h-2.5 text-slate-500 group-hover:text-cyan-300 transition-colors" />
          <span>{showUrlInput ? "Cancel" : "Paste URL"}</span>
        </button>
      </div>

      {/* ── Optional Manual URL Paste Bar ─────────────────────── */}
      {showUrlInput && (
        <form onSubmit={handleCustomUrlSubmit} className="flex gap-2 animate-in fade-in duration-200">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            autoFocus
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Apply
          </button>
        </form>
      )}

      {/* ── Main Upload Container ─────────────────────────────── */}
      {value ? (
        /* ── A. Preview State (Clean Image with Floating Controls) ── */
        <div
          className={`relative rounded-2xl border border-white/[0.15] bg-black/60 overflow-hidden shadow-lg group backdrop-blur-md transition-all ${
            variant === "compact" ? "h-20 w-20" : "h-32 w-full"
          }`}
        >
          <img
            src={value}
            alt="Uploaded Media Preview"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Subtle dark gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-3">
            <CldUploadWidget
              uploadPreset={uploadPreset}
              options={{
                maxFiles: 1,
                resourceType: "image",
                folder,
                clientAllowedFormats: ["png", "jpeg", "jpg", "webp", "gif", "svg"],
                maxFileSize: 10485760,
              }}
              onSuccess={(result: any) => {
                if (result?.info?.secure_url) {
                  onUpload(result.info.secure_url);
                }
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  disabled={disabled}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Change</span>
                </button>
              )}
            </CldUploadWidget>

            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                className="px-3 py-1.5 rounded-xl bg-pgc-red/30 hover:bg-pgc-red/50 backdrop-blur-md text-pgc-red text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md border border-pgc-red/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ── B. Empty Drop/Upload State ────────────────────────── */
        <CldUploadWidget
          uploadPreset={uploadPreset}
          options={{
            maxFiles: 1,
            resourceType: "image",
            folder,
            clientAllowedFormats: ["png", "jpeg", "jpg", "webp", "gif", "svg"],
            maxFileSize: 10485760,
          }}
          onSuccess={(result: any) => {
            if (result?.info?.secure_url) {
              onUpload(result.info.secure_url);
            }
          }}
        >
          {({ open }) => (
            <div
              className={`relative rounded-2xl border-2 border-dashed border-white/15 hover:border-cyan-400/70 bg-white/[0.02] hover:bg-cyan-500/[0.04] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-3 text-center group ${
                variant === "compact" ? "h-20 w-20 p-2" : "h-32 w-full"
              } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => open()}
            >
              {isDirectUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  <span className="text-[10px] font-mono text-slate-300">Uploading...</span>
                </div>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-xl bg-white/[0.04] group-hover:bg-cyan-500/20 text-slate-400 group-hover:text-cyan-300 border border-white/10 group-hover:border-cyan-500/40 flex items-center justify-center transition-all duration-300 mb-1.5 shadow-sm group-hover:scale-110">
                    {variant === "banner" ? (
                      <ImageIcon className="w-4 h-4" />
                    ) : (
                      <UploadCloud className="w-4 h-4" />
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                    {variant === "banner" ? "Upload Banner" : "Upload Emblem"}
                  </p>
                  <p className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
                    {hint || "PNG, JPG, WebP (Max 10MB)"}
                  </p>
                </>
              )}
            </div>
          )}
        </CldUploadWidget>
      )}

      {directError && (
        <p className="text-[10px] text-pgc-red font-mono">{directError}</p>
      )}
    </div>
  );
}
