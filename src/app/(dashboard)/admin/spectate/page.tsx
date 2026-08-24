import type { Metadata } from "next";
import { Eye, Radio, Users, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Spectate Arena — PGC Arena Admin",
  description: "Watch live matches in real-time from the Super Admin spectator view.",
};

export default function SpectatePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">
            Spectate <span className="text-pgc-red">Arena</span>
          </h1>
          <p className="mt-1 text-sm text-white/45">
            Monitor all active matches in real-time. Oversee question flow, answer locks, and match state.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pgc-red/10 border border-pgc-red/25">
          <Radio className="w-3.5 h-3.5 text-pgc-red animate-pulse" />
          <span className="text-[11px] font-semibold text-pgc-red">Live Spectator Mode</span>
        </div>
      </div>

      {/* Live match grid placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-5 bg-white/[0.04] border border-white/[0.08] hover:border-pgc-red/20 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pgc-emerald animate-pulse" />
                <span className="text-xs font-semibold text-pgc-emerald">LIVE</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                <Clock className="w-3 h-3" />
                <span>Match #{i}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-pgc-red/15 border border-pgc-red/20 flex items-center justify-center mx-auto">
                  <Users className="w-4 h-4 text-pgc-red" />
                </div>
                <p className="text-xs font-semibold text-white/60 mt-2">Team Alpha</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-bold text-white/20">VS</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xs font-semibold text-white/60 mt-2">Team Beta</p>
              </div>
            </div>
            <div className="mt-4 h-1 rounded-full bg-white/[0.05]">
              <div className="h-full w-0 rounded-full bg-pgc-red/50" />
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-white/15">
        Route: /admin/spectate · Feature: arena · Realtime: Supabase channel subscription
      </p>
    </div>
  );
}
