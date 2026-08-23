# Antigravity & AI Agent Master Protocol (AGENTS.md)

## 1. System Mission & Identity
You are building **PGC-Arena**, an institutional academic esports engine and real-time tournament platform for Punjab Group of Colleges (PGC). 
Your output must be production-ready, type-safe, and strictly aligned with this document and `DESIGN.md`.

---

## 2. Directory Architecture: Feature-Driven Vertical Slices
We reject flat horizontal folders. The codebase is organized into **Feature Slices** under `src/features/`. 
Each feature module contains its own UI components, Server Actions, Zustand stores, and validation schemas. The `src/app/` directory serves *only* as a thin routing and layout composition layer.

```text
src/
├── app/                                # Thin routing layer (layouts & page wrappers only)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── onboarding/page.tsx
│   ├── (dashboard)/
│   │   ├── admin/page.tsx              # Super Admin dashboard
│   │   ├── manager/page.tsx            # Campus Manager dashboard
│   │   └── teacher/page.tsx            # Teacher lobby host view
│   ├── (arena)/
│   │   └── lobby/[id]/page.tsx         # Live match arena
│   ├── (public)/
│   │   ├── leaderboard/page.tsx        # Public rankings (ISR cached)
│   │   └── brackets/page.tsx           # Tournament bracket tree
│   ├── layout.tsx                      # Root layout + Multi-Script font injector
│   └── page.tsx                        # Public landing & quick PIN joiner
│
├── features/                           # VERTICAL SLICES (Core domain logic)
│   ├── auth/                           # Authentication & Onboarding domain
│   │   ├── actions/authActions.ts      # signIn, signOut, completeOnboarding Server Actions
│   │   ├── components/                 # LoginForm, OnboardingModal, RoleGate
│   │   └── schemas/authSchemas.ts      # Zod validation for credentials
│   │
│   ├── arena/                          # Live Match & Real-Time Engine
│   │   ├── components/                 # BuzzerButton, FirstBloodBanner, HUDTimer, OptionGrid
│   │   ├── hooks/useMatchSocket.ts     # Supabase Realtime channel listener
│   │   ├── store/useArenaStore.ts      # Ephemeral match Zustand store
│   │   └── actions/arenaActions.ts     # submitAnswer, terminateMatch Server Actions
│   │
│   ├── tournaments/                    # Brackets & Esports Standings
│   │   ├── components/                 # LiquipediaTable, BracketTree, MatchCard
│   │   └── actions/bracketActions.ts   # generateBrackets, advanceWinner
│   │
│   ├── campus/                         # Institutional Multi-Tenancy
│   │   ├── components/                 # RosterTable, TeamBuilderModal, BatchUploader
│   │   └── actions/campusActions.ts    # createCampus, provisionUser, assignTeam
│   │
│   └── ai-seeding/                     # Asynchronous Question Bank Pipeline
│       ├── components/                 # PDFDropzone, SeedReviewTable
│       └── actions/aiSeedActions.ts    # parsePdfWithGemini, commitToQuestionBank
│
├── components/                         # Shared Cross-Feature UI Primitives
│   └── ui/                             # Button, Input, Modal, Badge, Dropdown (Tailwind/Radix)
│
├── lib/                                # Core utilities & Singletons
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase Client (Realtime/Client-side)
│   │   ├── server.ts                   # RSC / Server Action Supabase Client
│   │   └── middleware.ts               # Edge Session Bouncer & RBAC Router
│   └── utils.ts                        # cn() helper for Tailwind class merging
│
├── types/
│   └── database.types.ts               # Generated Supabase PostgreSQL types
└── middleware.ts                       # Next.js Root Middleware entrypoint
```

---

## 3. Strict Coding Standards & Hard Constraints

### A. Next.js App Router Protocol
- **No REST API Route Handlers:** Never write `/app/api/...` route handlers for mutations. All mutations MUST be Server Actions (`"use server"`) placed inside their respective feature `actions/` folder.
- **Server Components by Default:** Page files (`page.tsx`) and data tables must be React Server Components. Read data directly inside RSCs to leverage edge caching.
- **Client Component Boundary:** Mark files with `"use client"` *only* when they consume React hooks (`useState`, `useEffect`), interact with Zustand, or open Supabase WebSockets.

### B. State Management Law
- **Zustand Exclusivity:** Zustand is used strictly for transient client-side UI states (`src/features/arena/store/useArenaStore.ts`). 
- **Forbidden Libraries:** Do NOT install or use Redux Toolkit, Redux Thunk, or TanStack Query. Next.js RSC and Server Actions handle all server-state caching and invalidation natively.

### C. Type Safety & Database Integrity
- **Zero `any` Policy:** All database interactions must use types from `@/types/database.types.ts`.
- **Zod Validation:** Every Server Action must parse its input payload with a strict Zod schema before hitting the database.
- **Race Condition Handling (First-Blood):** When inserting into `match_answers`, anticipate PostgreSQL unique constraint violations (`error.code === '23505'`). Treat this not as a crash, but as a graceful lock: *"Answer already locked by teammate."*
- **Service Role Isolation:** The `SUPABASE_SERVICE_ROLE_KEY` must never be referenced in client components or assigned to `NEXT_PUBLIC_` variables. It is strictly reserved for administrative Server Actions.

### D. Design System & Typography Implementation
- **Design Tokens:** Always use colors defined in `DESIGN.md` (`bg-pgc-indigo`, `bg-pgc-navy`, `bg-pgc-red`, `text-pgc-gold`, `text-pgc-emerald`).
- **Font Classes:** Apply the correct typography utility classes based on context:
  - `font-display`: Match countdowns, rankings, tournament bracket headers.
  - `font-sans`: Standard UI labels, body text, form inputs.
  - `font-urdu-sans` / `font-urdu-nastaliq`: Urdu literature questions and interface elements.
  - `font-arabic`: Arabic verses and Islamic Studies examination modules.

---

## 4. Agent Execution Workflow
When tasked with creating or modifying a feature:
1. Identify the relevant feature slice under `src/features/[feature-name]/`.
2. Ensure data mutations are written as typed Server Actions with Zod schemas.
3. Import Supabase server clients from `@/lib/supabase/server` and browser clients from `@/lib/supabase/client`.
4. Run code generation with full type safety against `src/types/database.types.ts`.