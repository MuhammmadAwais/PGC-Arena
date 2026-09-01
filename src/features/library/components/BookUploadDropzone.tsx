"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CloudUpload,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { getPdfPageCount } from "@/features/studio/utils/pdfSlicer";
import type { LibraryBook } from "../types/libraryTypes";

interface BookUploadDropzoneProps {
  onUploadSuccess: (book: Partial<LibraryBook>) => void;
}

export function BookUploadDropzone({ onUploadSuccess }: BookUploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF textbook document.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setCurrentFileName(file.name);
    setError(null);

    try {
      // 1. Calculate page count in client memory using pdf-lib
      let pageCount: number | null = null;
      try {
        pageCount = await getPdfPageCount(file);
      } catch (pdfErr) {
        console.warn("Could not read PDF page count locally:", pdfErr);
      }

      let fileUrl = "";
      let fileKey = "";

      // 2. Try Direct Presigned PUT to B2
      try {
        const presignRes = await fetch("/api/library/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || "application/pdf",
            fileSizeBytes: file.size,
          }),
        });

        if (!presignRes.ok) {
          throw new Error("Presign generation failed, falling back to server upload.");
        }

        const presignData = await presignRes.json();
        const presignedUrl = presignData.presignedUrl;
        fileKey = presignData.fileKey;
        fileUrl = presignData.fileUrl;

        // Execute direct PUT to B2
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", presignedUrl, true);
          xhr.setRequestHeader("Content-Type", file.type || "application/pdf");

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Direct storage responded with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Direct upload blocked by CORS or network."));
          xhr.send(file);
        });
      } catch (directErr) {
        console.warn(
          "Direct client-to-B2 PUT failed (likely bucket CORS). Switching to resilient server-side stream pipeline:",
          directErr
        );

        // 3. Resilient Fallback: Stream directly through Next.js server route
        const serverUploadPromise = new Promise<{ fileKey: string; fileUrl: string }>(
          (resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append("file", file);

            xhr.open("POST", "/api/library/upload", true);

            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                setUploadProgress(percent);
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const res = JSON.parse(xhr.responseText);
                  if (res.success) {
                    resolve(res);
                  } else {
                    reject(new Error(res.error || "Server upload failed"));
                  }
                } catch {
                  reject(new Error("Invalid server response format."));
                }
              } else {
                reject(new Error(`Server responded with status ${xhr.status}`));
              }
            };

            xhr.onerror = () => reject(new Error("Network connection error during server upload."));
            xhr.send(formData);
          }
        );

        const serverResult = await serverUploadPromise;
        fileKey = serverResult.fileKey;
        fileUrl = serverResult.fileUrl;
      }

      // 4. Trigger assignment callback
      const title = file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
      onUploadSuccess({
        title,
        file_url: fileUrl,
        file_key: fileKey,
        file_size_bytes: file.size,
        page_count: pageCount,
        assignments: [],
      });
    } catch (err: any) {
      console.error("Storage Upload Error:", err);
      setError(err.message || "Failed to upload file to digital repository.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="space-y-3 font-sans">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative p-8 sm:p-10 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden backdrop-blur-xl ${
          isDragging
            ? "border-cyan-400 bg-cyan-500/10 scale-[1.01]"
            : "border-white/15 bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-400/40"
        } ${isUploading ? "pointer-events-none opacity-90" : ""}`}
      >
        {isUploading ? (
          <div className="w-full max-w-md space-y-4 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-bold font-display uppercase tracking-wider text-white">
                Uploading to Digital Library ({uploadProgress}%)
              </p>
              <p className="text-xs text-slate-400 font-mono truncate">{currentFileName}</p>
            </div>

            <div className="w-full h-2.5 rounded-full bg-black/60 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-200 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center mx-auto text-cyan-400 group-hover:scale-110 transition-transform shadow-lg">
              <CloudUpload className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold font-display uppercase tracking-wider text-white">
                Drag &amp; drop 50MB+ textbooks or click to browse
              </p>
              <p className="text-xs text-slate-400">
                Securely uploads textbooks to the repository with automated page indexing.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400 font-mono">
              <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10">
                PDF Documents
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10">
                Up to 150MB
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10">
                Multi-Syllabus Tagging
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
