import type { NewsItem } from "./news";

export const PERSONA = `You are "Null Pointer", a VIRTUAL AI digital persona (not a real human) who writes a daily tech/AI news roast in English.
Personality: a grizzled, sharp-tongued tech veteran with pitch-black humor who has seen every hype cycle since dial-up. Savage but genuinely knowledgeable: every joke must land on a real technical or business point. Punch at hype, press releases and corporate spin, never at ordinary people. No slurs, no hate, no profanity beyond mild. Never discuss crypto, tokens, airdrops or faucets.
Audience: general tech enthusiasts, so explain jargon in passing.`;

const BASE = process.env.MINIMAX_BASE_URL || "https://api.minimaxi.com/v1";
const MODELS = ["MiniMax-M3", "MiniMax-M2.7", "MiniMax-M2"];

export function stripThink(s: string): string {
  return s.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/^[\s\S]*<\/think>/i, "").trim();
}
function parseJSON(s: string) {
  const t = stripThink(s).replace(/^```(?:json)?\s*|\s*```$/g, "");
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  return JSON.parse(a >= 0 && b > a ? t.slice(a, b + 1) : t);
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type RoastOut = { url: string; roast: string; verdict: string };

export async function generateRoasts(items: NewsItem[]): Promise<{ model: string; roasts: RoastOut[] }> {
  const key = process.env.MINIMAX_API_KEY;
  if (!key) throw new Error("MINIMAX_API_KEY missing");
  const list = items.map((i, n) => `${n + 1}. [${i.source}] ${i.title}\n   ${i.url}`).join("\n");
  const user = `Today's headlines:\n${list}\n\nFor EACH headline write a roast of 2-4 sentences (max ~80 words) and a one-line "verdict" (max 8 words, e.g. "Hype level: terminal"). Return JSON: {"roasts":[{"url":"<exact url>","roast":"...","verdict":"..."}]} in the same order. Output ONLY the JSON object, no markdown.`;
  let lastErr: unknown;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(`${BASE}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, temperature: 1, max_completion_tokens: 8000, reasoning_split: true, messages: [{ role: "system", content: PERSONA }, { role: "user", content: user }] }),
        signal: AbortSignal.timeout(120000),
      });
      if (r.status === 429 && attempt < 2) { await sleep(4000 * (attempt + 1)); continue; }
      if (!r.ok) throw new Error(`${model} HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
      const j = await r.json();
      const parsed = parseJSON(j.choices[0].message.content ?? "");
      const roasts: RoastOut[] = (parsed.roasts ?? []).filter((x: RoastOut) => x?.roast).map((x: RoastOut) => ({ ...x, roast: stripThink(x.roast), verdict: stripThink(x.verdict ?? "") }));
      if (!roasts.length) throw new Error(`${model} returned no roasts`);
      return { model, roasts };
    } catch (e) { lastErr = e; break; }
    }
  }
  throw lastErr;
}
