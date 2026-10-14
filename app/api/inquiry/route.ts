import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const row = { name: s(b.name, 200), email: s(b.email, 200), company: s(b.company, 200) || null, service: s(b.service, 100) || null, message: s(b.message, 5000) };
  if (!row.name || !row.message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.email)) return NextResponse.json({ error: "Name, valid email and message are required." }, { status: 400 });
  const sb = serviceClient();
  if (!sb) return NextResponse.json({ error: "Form backend not configured yet." }, { status: 503 });
  const { error } = await sb.from("inquiries").insert(row);
  if (error) return NextResponse.json({ error: "Could not save inquiry." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
