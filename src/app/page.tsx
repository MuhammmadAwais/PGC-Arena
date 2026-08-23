import { redirect } from "next/navigation";

/**
 * Root page — redirects to the login page.
 * Once auth is wired, the proxy (middleware) will handle
 * redirecting authenticated users to their respective dashboards.
 */
export default function RootPage() {
  redirect("/login");
}
