import type { Metadata } from "next";
import { Settings, Shield, Bell, Database, Palette, Key } from "lucide-react";

export const metadata: Metadata = {
  title: "Master Settings — PGC Arena Admin",
  description: "Configure global platform settings, security policies, and system preferences.",
};

const settingGroups = [
  {
    label: "Security & Auth",
    icon: Shield,
    color: "text-pgc-red",
    bgColor: "bg-pgc-red/10 border-pgc-red/20",
    items: ["Session timeout policy", "Two-factor authentication", "IP allowlist"],
  },
  {
    label: "Notifications",
    icon: Bell,
    color: "text-pgc-gold",
    bgColor: "bg-pgc-gold/10 border-pgc-gold/20",
    items: ["Match start alerts", "First-blood notifications", "System health emails"],
  },
  {
    label: "Data & Storage",
    icon: Database,
    color: "text-pgc-emerald",
    bgColor: "bg-pgc-emerald/10 border-pgc-emerald/20",
    items: ["Question bank backup", "Match replay retention", "Audit log export"],
  },
  {
    label: "API Keys",
    icon: Key,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
    items: ["Gemini API key rotation", "Supabase service key", "Webhook endpoints"],
  },
  {
    label: "Appearance",
    icon: Palette,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    items: ["Theme overrides", "Custom campus branding", "Font preferences"],
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">
          Master <span className="text-pgc-red">Settings</span>
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Global platform configuration, security policies, integrations, and system preferences.
        </p>
      </div>

      {/* Settings groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {settingGroups.map(({ label, icon: Icon, color, bgColor, items }) => (
          <div
            key={label}
            className="rounded-2xl p-5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 rounded-xl ${bgColor} border flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="font-semibold text-white text-sm">{label}</p>
            </div>
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item}
                  className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0"
                >
                  <span className="text-xs text-white/50">{item}</span>
                  <div className="w-10 h-5 rounded-full bg-white/10 border border-white/10" />
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Full-width placeholder */}
        <div className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-white/[0.03] border border-white/[0.06] border-dashed lg:col-span-2">
          <Settings className="w-7 h-7 text-white/15 animate-[spin_8s_linear_infinite]" />
          <p className="text-sm font-semibold text-white/25">Advanced configuration panels</p>
          <p className="text-xs text-white/15">Route: /admin/settings · Full settings UI coming in next sprint</p>
        </div>
      </div>
    </div>
  );
}
