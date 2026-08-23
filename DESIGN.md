# PGC-Arena Design System & UI Specification

## 1. Brand Philosophy
PGC-Arena merges the institutional prestige of **Punjab Group of Colleges** with the high-octane energy of a **Tier-1 Esports Tournament HUD**. The design is clean, minimalist, high-contrast, and authoritative.

---

## 2. Color Palette & Design Tokens

### Primary Brand Colors
- **PGC Deep Indigo (Base Dark):** `#281E5C` / `rgb(40, 30, 92)`
  - *Usage:* App background, deeply recessed panels, header navigation.
- **PGC Royal Navy (Surface):** `#2D2B6F` / `rgb(45, 43, 111)`
  - *Usage:* Cards, squad containers, modal backdrops, table rows.
- **PGC Crimson Scarlet (Primary Action & Accent):** `#E33B29` / `rgb(227, 59, 41)`
  - *Usage:* Primary CTA buttons, buzzer triggers, "First-Blood" alerts, live timers.
- **Pure White (Text & Highlights):** `#FFFFFF` / `rgb(255, 255, 255)`
  - *Usage:* Primary typography, active tab indicators, high-contrast badges.

### Semantic & Match Engine Accents
- **Electric Gold (Trophy / 1st Place):** `#F59E0B`
- **Neon Emerald (Correct Answer / Ready):** `#10B981`
- **Muted Slate (Secondary Text / Borders):** `#94A3B8` / `#3B387E`
- **Surface Elevation (Hover & Focus):** `#383582`

---

## 3. Typography & Multi-Script Font System
To support English UI, Esports HUD elements, Urdu literature, and Arabic Islamiat questions, we use a strict multi-variable font stack via `next/font/google`.

| Language / Role | Google Font | Tailwind Class | Variable Name |
| :--- | :--- | :--- | :--- |
| **Esports Display (En)** | `Chakra_Petch` | `font-display` | `--font-display` |
| **English UI / Body** | `Inter` | `font-sans` | `--font-sans` |
| **Urdu (Modern / UI)** | `Noto_Sans_Arabic` | `font-urdu-sans` | `--font-urdu-sans` |
| **Urdu (Classical Text)** | `Noto_Nastaliq_Urdu` | `font-urdu-nastaliq` | `--font-urdu-nastaliq` |
| **Arabic / Islamiat** | `Amiri` | `font-arabic` | `--font-arabic` |

**AI Agent Instruction:** Initialize these fonts in `src/app/layout.tsx` using `display: "swap"` and map their CSS variables to the HTML `<body>` tag.

---

## 4. Tailwind CSS Configuration (`tailwind.config.ts`)
**AI Agent Instruction:** Extend the Tailwind theme strictly using this configuration.

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pgc: {
          indigo: "#281E5C",
          navy: "#2D2B6F",
          red: "#E33B29",
          hover: "#C92F1F",
          surface: "#35327D",
          border: "#3B387E",
          gold: "#F59E0B",
          emerald: "#10B981",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
        "urdu-sans": ["var(--font-urdu-sans)", "sans-serif"],
        "urdu-nastaliq": ["var(--font-urdu-nastaliq)", "serif"],
        arabic: ["var(--font-arabic)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;