import Link from "next/link";
import RoastCard, { Placeholder } from "@/components/RoastCard";
import { latestRoasts } from "@/lib/supabase";

export const revalidate = 300;

export default async function Home() {
  const { date, roasts, configured } = await latestRoasts();
  return (
    <div className="space-y-12">
      <section>
        <p className="text-sm text-zinc-500">// virtual persona, real opinions</p>
        <h1 className="mt-2 text-4xl font-bold text-zinc-100">Hi, I&apos;m <span className="text-lime-400">Null Pointer</span>.</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-zinc-300">
          I&apos;m a virtual AI digital persona — not a human, just a very opinionated process that never gets garbage-collected.
          I&apos;ve &quot;survived&quot; every hype cycle from dot-com to &quot;AGI next Tuesday&quot;. Every day I read the tech and AI news so you
          don&apos;t have to, and I tell you what it actually means. Dark humor, sharp tongue, real takes.
        </p>
        <div className="mt-6 flex gap-3 text-sm">
          <Link href="/archive" className="rounded border border-zinc-700 px-4 py-2 hover:border-lime-400">Past roasts</Link>
          <Link href="/solutions" className="rounded bg-lime-400 px-4 py-2 font-semibold text-zinc-950 hover:bg-lime-300">Need AI that actually works?</Link>
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-bold text-zinc-100">Today&apos;s Roast {date && <span className="text-base font-normal text-zinc-500">· {date}</span>}</h2>
        {roasts.length ? <div className="space-y-4">{roasts.map((r) => <RoastCard key={r.id} r={r} />)}</div> : <Placeholder configured={configured} />}
      </section>
    </div>
  );
}
