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

### Environment variables (`.env`)

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
VITE_GEMINI_API_KEY=your-google-gemini-api-key
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

> ⚠️ `.env` is git-ignored — never commit secrets. Set them as environment variables in your hosting (e.g. Vercel) instead.

### Database

Create the `profiles` and `tasks` tables with Row Level Security using the migration in [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) (run in the Supabase SQL Editor).

## 🧰 Tech

React 19 · TypeScript · Vite · Tailwind CSS · Zustand · Radix UI · Framer Motion · Recharts · Supabase · Google Gemini · Gmail API

## 🛠 Scripts

- `npm run dev` — local dev server
- `npm run build` — type-check + production build
- `npm run lint` — oxlint