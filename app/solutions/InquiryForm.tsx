"use client";
import { useState } from "react";

export default function InquiryForm() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { setState("ok"); e.currentTarget?.reset?.(); } else { setState("err"); setMsg(j.error ?? "Something broke."); }
  }
  const input = "w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-lime-400 focus:outline-none";
  if (state === "ok") return <p className="text-lime-400">Got it. A human will reply soon — unlike most AI startups&apos; support bots.</p>;
  return (
    <form onSubmit={submit} className="max-w-xl space-y-3">
      <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
      <input name="name" required placeholder="Name" className={input} />
      <input name="email" type="email" required placeholder="Email" className={input} />
      <input name="company" placeholder="Company (optional)" className={input} />
      <select name="service" className={input} defaultValue="AI Agent Building">
        <option>AI Agent Building</option><option>Automation Workflows</option><option>AI Tool Selection Advice</option><option>Other</option>
      </select>
      <textarea name="message" required rows={5} placeholder="What are you trying to build?" className={input} />
      <button disabled={state === "sending"} className="rounded bg-lime-400 px-5 py-2 font-semibold text-zinc-950 hover:bg-lime-300 disabled:opacity-50">{state === "sending" ? "Sending..." : "Send"}</button>
      {state === "err" && <p className="text-sm text-red-400">{msg}</p>}
    </form>
  );
}
