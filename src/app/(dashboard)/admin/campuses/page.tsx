import type { Metadata } from "next";
import { Building2, Plus, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Campuses & Tenancy — PGC Arena Admin",
  description: "Manage institutional campuses, multi-tenancy provisioning, and campus rosters.",
};

export default function CampusesPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">
            Campuses &amp; <span className="text-pgc-red">Tenancy</span>
          </h1>
          <p className="mt-1 text-sm text-white/45">
            Provision new campuses, manage multi-tenancy isolation, and assign campus managers.
          </p>
        </div>
        <button
          id="campuses-add-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pgc-red text-white text-sm font-semibold hover:bg-pgc-hover active:scale-[0.98] transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Campus
        </button>
      </div>

      {/* ── Placeholder ─────────────────────────────────────────── */}
      <div
        className={[
          "rounded-2xl p-12 min-h-[400px] flex flex-col items-center justify-center gap-4",
          "bg-white/[0.03] border border-white/[0.08] border-dashed",
        ].join(" ")}
      >
        <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
          <Building2 className="w-8 h-8 text-white/20" />
        </div>
        <div className="text-center max-w-sm">
          <p className="text-sm font-semibold text-white/40">Campus roster table</p>
          <p className="text-xs text-white/25 mt-1.5 leading-relaxed">
            The full campus list with manager assignments, student counts, and real-time match
            status will render here. Use the{" "}
            <span className="text-pgc-red/60 font-medium">BatchUploader</span> to bulk-provision
            campus data.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/20 mt-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>Route: /admin/campuses · Feature: campus</span>
        </div>
      </div>
    </div>
  );
}
