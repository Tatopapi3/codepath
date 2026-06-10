# CodePath — Gamified Coding Education

> Duolingo for programming. Learn Python, JavaScript, TypeScript, HTML, CSS, SQL, React, and Git through a winding map of hexagonal lesson nodes, streaks, XP, coins, and a Claude-powered AI tutor.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-green) ![Claude](https://img.shields.io/badge/Claude-Sonnet%204-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-cyan)

---

## Features

- **🗺️ Hex Learning Map** — Zigzag path of SVG hexagonal nodes. Completed = green badge, current = pulsing glow, locked = dimmed.
- **📖 Lesson Cards** — Swipeable cards with syntax-highlighted code examples
- **✅ Quizzes** — Multiple choice with plausible distractors and instant explanations
- **💻 Code Challenges** — Monaco Editor + Pyodide (Python) / sandboxed eval (JS) with automated test cases
- **🤖 CodeBot AI Tutor** — Floating chat + full-screen tab. Context-aware Socratic tutor with hint escalation powered by Claude API streaming
- **🔥 Gamification** — XP, coins, daily streaks, rank titles, achievement badges
- **🔐 Auth** — Email/password + Google OAuth via Supabase
- **📱 Mobile-First** — 430px max-width, bottom nav, safe-area aware

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email + Google OAuth) |
| AI Tutor | Claude claude-sonnet-4-20250514 (streaming) |
| Code Editor | Monaco Editor |
| Python Runner | Pyodide (WASM, browser-side) |
| Animations | Framer Motion |
| State | Zustand |

## Curriculum

| Language | Color | Units | Lessons |
|----------|-------|-------|---------|
| Python | #3B82F6 | 5 | 16 (Units 1–3 full) |
| JavaScript | #EAB308 | 5 | 16 (Units 1–3 full) |
| TypeScript | #1D4ED8 | 1 | 4 |
| HTML | #EF4444 | 1 | 4 |
| CSS | #A855F7 | 1 | 4 |
| SQL | #F97316 | 1 | 4 |
| React | #06B6D4 | 1 | 4 |
| Git | #374151 | 1 | 4 |

**Total: 56 lessons across 8 languages**

## Rank System

| XP | Rank |
|----|------|
| 0 | Code Journey Initiate |
| 100 | Code Explorer |
| 300 | Code Apprentice |
| 750 | Junior Developer |
| 1,500 | Mid Developer |
| 2,500 | Senior Developer |
| 5,000+ | Code Legend |

---

## Local Setup

### Prerequisites
- Node.js 18+
- Supabase account (free tier)
- Anthropic API key

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/codepath.git
cd codepath
npm install
```

### 2. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run Database Migration

In Supabase SQL Editor, run `supabase/migrations/initial_schema.sql`, then `supabase/seed.sql`.

### 4. Google OAuth (Optional)

1. Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com)
2. Add `https://YOUR_PROJECT.supabase.co/auth/v1/callback` as redirect URI
3. Enable Google provider in Supabase → Authentication → Providers

### 5. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
codepath/
├── app/
│   ├── learn/              # Learning map (main screen)
│   ├── lesson/[id]/        # Individual lesson / quiz / challenge
│   ├── codebot/            # Full-screen AI tutor
│   ├── courses/            # Language picker
│   ├── activity/           # Streak calendar + history
│   ├── profile/            # Stats, achievements, sign out
│   ├── auth/               # Login, signup, OAuth callback
│   └── api/tutor/          # Claude streaming API route
├── components/
│   ├── map/                # HexNode, UnitBanner, LearningPath
│   ├── lesson/             # LessonCard, QuizCard, CodeEditor, TestResults
│   ├── tutor/              # ChatBot (floating), TutorScreen (full-screen)
│   └── ui/                 # Header, BottomNav, XPBar, CompletionAnimation
├── lib/
│   ├── supabase/           # client.ts + server.ts
│   ├── claude/             # client.ts + prompts.ts
│   ├── gamification/       # xp.ts + streak.ts
│   └── content/            # types.ts
├── stores/userStore.ts
├── hooks/useUser.ts + useProgress.ts
└── supabase/
    ├── migrations/initial_schema.sql
    └── seed.sql
```

## Design Decisions

- **Pyodide for Python** — runs Python in the browser via WebAssembly; no backend execution server needed
- **Streaming AI** — `anthropic.messages.stream()` piped through Next.js Route Handler via `ReadableStream`
- **Hint escalation** — CodeBot never gives full answers; escalates from conceptual → partial → guided over 4 asks
- **COEP/COOP headers** — required for Pyodide's SharedArrayBuffer; configured in `next.config.ts`
- **Zustand** — lightweight global state without Provider boilerplate

## Deployment

```bash
vercel deploy
```

Set env vars in Vercel dashboard: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

---

Built with ❤️ using Next.js 16, Supabase, Claude AI, and Tailwind CSS.
