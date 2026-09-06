# 🧠 Suhail AI — Personal AI Assistant

A personal AI-powered productivity dashboard — your career coach, task manager, learning planner, job tracker, portfolio reviewer, and email-to-task automation in one place.

Built with React 19 + TypeScript + Vite + Tailwind, backed by **Supabase** (real JWT auth + per-user data with Row Level Security).

## ✨ Features

- 🤖 **AI Coach** — chat-based assistant powered by Google Gemini (with an offline rule-based fallback). It can plan your day, recommend jobs, analyze your CV, and suggest learning paths.
- ✅ **Tasks** — real, per-user tasks persisted to Supabase. Create, drag-to-reorder, filter by Today / Upcoming / Overdue, track estimated vs actual time.
- 📧 **Email → Task automation** — connect your Gmail, and the AI scans your inbox, extracts actionable items (deadlines, interviews, workshops), and turns them into tasks automatically.
- 🧭 **Career hub** — career readiness score, skill-gap analysis, and an actionable checklist.
- 💼 **Jobs** — job matches with honest skill-overlap %, save/apply/offer status tracking.
- 📚 **Learning** — roadmap, weekly hours, and study streak.
- 🎓 **Classes & Workshops** — weekly schedule and local workshop discovery.
- 📊 **Portfolio** — project showcase with scoring and improvement tips.
- 🔐 **Secure auth** — Supabase Auth with JWT sessions and email confirmation; every user's data is isolated via Row Level Security.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

### Environment variables

Client variables go in `.env` (anything with a `VITE_` prefix is inlined into the
browser bundle, so only PUBLIC values belong here):

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=sb_publishable_your_publishable_key
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id     # public by design
```

Server-only secrets are read by the `/api` serverless functions (Vercel). Set these
in your hosting environment **without** a `VITE_` prefix so they never reach the client:

```
GEMINI_API_KEY=your-gemini-api-key             # /api/gemini
GOOGLE_CLIENT_ID=your-google-oauth-client-id   # /api/google-token
GOOGLE_CLIENT_SECRET=your-oauth-client-secret  # /api/google-token
```

> ⚠️ `.env` is git-ignored — never commit secrets. Anything with `VITE_` ships to the
> browser; anything secret must be server-side only.

### Database

Create the `profiles` and `tasks` tables with Row Level Security using the migration in [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) (run in the Supabase SQL Editor).

## 🧰 Tech

React 19 · TypeScript · Vite · Tailwind CSS · Zustand · Radix UI · Framer Motion · Recharts · Supabase · Google Gemini · Gmail API

## 🛠 Scripts

- `npm run dev` — local dev server
- `npm run build` — type-check + production build
- `npm run lint` — oxlint