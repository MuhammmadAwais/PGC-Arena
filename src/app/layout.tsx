import type { Metadata } from "next";
import Image from "next/image";
import {
  Chakra_Petch,
  Inter,
  Noto_Sans_Arabic,
  Noto_Nastaliq_Urdu,
  Amiri, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


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
      className={cn([
              chakraPetch.variable,
              inter.variable,
              notoSansArabic.variable,
              notoNastaliqUrdu.variable,
              amiri.variable,
            ].join(" "), "font-sans", geist.variable)}
    >
      <body
        suppressHydrationWarning
        className="bg-pgc-indigo text-white font-sans antialiased min-h-screen flex flex-col relative"
      >
        {/* Global fixed background */}
        <div className="fixed inset-0 -z-50 bg-black">
          <Image
            src="/global-bg.webp"
            alt="Global background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-70"
            quality={85}
          />
        </div>
        
        {/* Main content layer */}
        <div className="flex flex-col flex-1 relative z-0">
          {children}
        </div>
      </body>
    </html>
  );
}
