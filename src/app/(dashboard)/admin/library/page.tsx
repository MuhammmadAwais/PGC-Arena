import type { Metadata } from "next";
import { LibraryGrid } from "@/features/library/components/LibraryGrid";

export const metadata: Metadata = {
  title: "Digital Library — PGC Arena Admin",
  description:
    "Enterprise repository for uploading 50MB+ textbooks to Backblaze B2 and tagging to curriculum boards.",
};

export default function DigitalLibraryPage() {
  return <LibraryGrid />;
}
