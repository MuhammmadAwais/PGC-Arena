/**
 * src/app/(auth)/layout.tsx
 *
 * Auth route group layout — renders children directly with no
 * shared header, sidebar, or navigation chrome. The login page
 * manages its own full-screen layout.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
