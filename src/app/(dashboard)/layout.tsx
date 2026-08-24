export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/20 p-6 flex flex-col">
        <div className="font-display text-2xl font-bold text-white mb-8">
          PGC <span className="text-pgc-red">Arena</span>
        </div>
        <nav className="flex flex-col gap-4 text-sm font-medium text-white/60">
          <div className="hover:text-white cursor-pointer transition-colors">Overview</div>
          <div className="hover:text-white cursor-pointer transition-colors">Matches</div>
          <div className="hover:text-white cursor-pointer transition-colors">Settings</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-10">
        {children}
      </main>
    </div>
  );
}
