import Link from "next/link";
import { notFound } from "next/navigation";
import RoastCard, { Placeholder } from "@/components/RoastCard";
import { roastsFor, publicClient } from "@/lib/supabase";

export const revalidate = 3600;

export default async function Day({ params }: { params: { date: string } }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date)) notFound();
  const roasts = await roastsFor(params.date);
  return (
    <div>
      <Link href="/archive" className="text-sm text-zinc-500 hover:text-lime-400">← archive</Link>
      <h1 className="mb-6 mt-2 text-3xl font-bold text-zinc-100">Roasts for {params.date}</h1>
      {roasts.length ? <div className="space-y-4">{roasts.map((r) => <RoastCard key={r.id} r={r} />)}</div> : <Placeholder configured={!!publicClient()} />}
    </div>
  );
}
