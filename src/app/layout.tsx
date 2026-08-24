import type { Metadata } from "next";
import {
  Chakra_Petch,
  Inter,
  Noto_Sans_Arabic,
  Noto_Nastaliq_Urdu,
  Amiri,
} from "next/font/google";
import "./globals.css";

// ── Esports Display (English HUD, countdowns, bracket headers)
const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// ── English UI / Body copy
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// ── Urdu (Modern / UI labels in Urdu)
const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
  display: "swap",
});

// ── Urdu (Classical / Nastaliq for literature questions)
const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-noto-nastaliq-urdu",
  subsets: ["arabic"],
  display: "swap",
});

// ── Arabic / Islamiat examination modules
const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PGC Arena — Institutional Academic Esports",
  description:
    "Real-time academic tournament platform for Punjab Group of Colleges. Compete, rank, and dominate.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={[
        chakraPetch.variable,
        inter.variable,
        notoSansArabic.variable,
        notoNastaliqUrdu.variable,
        amiri.variable,
      ].join(" ")}
    >
      <body
        suppressHydrationWarning
        className="bg-pgc-indigo text-white font-sans antialiased min-h-screen flex flex-col"
      >
        {children}
      </body>
    </html>
  );
}
