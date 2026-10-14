# Null Pointer

Daily AI & tech news roasts by **Null Pointer**, a virtual AI persona: dark humor, sharp tongue, real takes.

Live: https://www.nullpointer.men

Stack: Next.js 14 (App Router, TypeScript, Tailwind) on Vercel, Supabase (Postgres), MiniMax (China) OpenAI-compatible API.

## Pages
- `/` persona intro + today's roast
- `/archive`, `/archive/YYYY-MM-DD` past roasts
- `/solutions` AI agent building, automation workflows, AI tool selection + consultation form
- `GET /api/cron/daily-roast` (needs `Authorization: Bearer $CRON_SECRET`) fetches Hacker News + AI RSS feeds (OpenAI, Google AI, TechCrunch AI, The Verge AI), picks top AI items, generates roasts with MiniMax (`MiniMax-M3` → `MiniMax-M2.7` → `MiniMax-M2` fallback, `<think>` blocks stripped), stores them in Supabase.
- `POST /api/inquiry` saves the form via the service role key.

The site builds and renders without Supabase env vars (placeholders shown).

## Local
```bash
cp .env.example .env.local   # fill in values
npm install
npm run dev
npm run test:roast           # fetch news + generate roasts (no DB writes)
```

## Deploy
1. **Supabase**: create a project → SQL Editor → run `supabase/migrations/20261014000000_init.sql` (or `supabase db push`). Copy the project URL, anon key and service_role key from Project Settings → API.
2. **Vercel**: import this GitHub repo. Set env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `MINIMAX_API_KEY` (optional `MINIMAX_BASE_URL`), `CRON_SECRET` (random string). Deploy.
3. **Cron**: `vercel.json` runs `/api/cron/daily-roast` daily at 01:00 UTC; Vercel sends `Authorization: Bearer $CRON_SECRET` automatically. Trigger manually:
   `curl -H "Authorization: Bearer $CRON_SECRET" https://www.nullpointer.men/api/cron/daily-roast`

## Data / RLS
- `roasts`: public read.
- `news_items`, `inquiries`: no public access; written server-side with the service role key only.
