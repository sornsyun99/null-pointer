import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type Roast = { id: string; roast_date: string; headline: string; url: string; source: string; roast: string; verdict: string | null; model: string | null; position: number };

export function publicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}
export function serviceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

export async function latestRoasts(): Promise<{ date: string | null; roasts: Roast[]; configured: boolean }> {
  const sb = publicClient();
  if (!sb) return { date: null, roasts: [], configured: false };
  const { data: last } = await sb.from("roasts").select("roast_date").order("roast_date", { ascending: false }).limit(1);
  const date = last?.[0]?.roast_date ?? null;
  if (!date) return { date: null, roasts: [], configured: true };
  return { date, roasts: await roastsFor(date), configured: true };
}
export async function roastsFor(date: string): Promise<Roast[]> {
  const sb = publicClient();
  if (!sb) return [];
  const { data } = await sb.from("roasts").select("*").eq("roast_date", date).order("position");
  return (data as Roast[]) ?? [];
}
export async function archiveDates(): Promise<{ date: string; count: number }[]> {
  const sb = publicClient();
  if (!sb) return [];
  const { data } = await sb.from("roasts").select("roast_date").order("roast_date", { ascending: false }).limit(2000);
  const m = new Map<string, number>();
  for (const r of data ?? []) m.set(r.roast_date, (m.get(r.roast_date) ?? 0) + 1);
  return [...m].map(([date, count]) => ({ date, count }));
}
