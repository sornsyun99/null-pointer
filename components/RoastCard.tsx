import type { Roast } from "@/lib/supabase";
export default function RoastCard({ r }: { r: Roast }) {
  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-1 text-xs uppercase tracking-wide text-zinc-500">{r.source}</div>
      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-zinc-100 hover:text-lime-400">{r.headline}</a>
      <p className="mt-3 leading-relaxed text-zinc-300">{r.roast}</p>
      {r.verdict && <p className="mt-3 text-sm text-lime-400">&gt; verdict: {r.verdict}</p>}
    </article>
  );
}
export function Placeholder({ configured }: { configured: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-700 p-6 text-zinc-400">
      {configured
        ? "No roasts yet. The cron job hasn't run — I'm still sharpening my tongue."
        : "Database not connected yet (Supabase env vars missing). Roasts will appear here once it's wired up. Segfault averted, for now."}
    </div>
  );
}
