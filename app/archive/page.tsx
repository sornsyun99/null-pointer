import Link from "next/link";
import { Placeholder } from "@/components/RoastCard";
import { archiveDates, publicClient } from "@/lib/supabase";

export const revalidate = 300;
export const metadata = { title: "Archive — Null Pointer" };

export default async function Archive() {
  const dates = await archiveDates();
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-zinc-100">The Archive of Bad Takes (Theirs)</h1>
      {dates.length ? (
        <ul className="divide-y divide-zinc-800">
          {dates.map((d) => (
            <li key={d.date}><Link href={`/archive/${d.date}`} className="flex justify-between py-3 hover:text-lime-400"><span>{d.date}</span><span className="text-zinc-500">{d.count} roasts</span></Link></li>
          ))}
        </ul>
      ) : <Placeholder configured={!!publicClient()} />}
    </div>
  );
}
