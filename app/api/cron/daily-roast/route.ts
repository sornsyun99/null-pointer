import { NextResponse } from "next/server";
import { fetchTopAINews } from "@/lib/news";
import { generateRoasts } from "@/lib/mistral";
import { serviceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = serviceClient();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const items = await fetchTopAINews(6);
  if (!items.length) return NextResponse.json({ error: "No news fetched" }, { status: 502 });

  const { data: saved, error: nErr } = await sb.from("news_items").upsert(items, { onConflict: "url" }).select("id,url");
  if (nErr) return NextResponse.json({ error: nErr.message }, { status: 500 });
  const idByUrl = new Map((saved ?? []).map((r) => [r.url, r.id]));

  const { model, roasts } = await generateRoasts(items);
  const date = new Date().toISOString().slice(0, 10);
  const rows = items.map((it, i) => {
    const r = roasts.find((x) => x.url === it.url) ?? roasts[i];
    return r ? { roast_date: date, news_item_id: idByUrl.get(it.url) ?? null, headline: it.title, url: it.url, source: it.source, roast: r.roast, verdict: r.verdict ?? null, model, position: i } : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);
  const { error } = await sb.from("roasts").upsert(rows, { onConflict: "roast_date,url" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, date, model, count: rows.length });
}
