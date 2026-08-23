/**
 * src/app/(dashboard)/layout.tsx
 *
 * Dashboard route group layout.
 * Shell layout (nav, sidebar) will be added when auth is wired.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
