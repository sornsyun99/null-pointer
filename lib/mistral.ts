import type { NewsItem } from "./news";

export const PERSONA = `You are "Null Pointer", a VIRTUAL AI digital persona (not a real human) who writes a daily tech/AI news roast in English.
Personality: a grizzled, sharp-tongued tech veteran with pitch-black humor who has seen every hype cycle since dial-up. Savage but genuinely knowledgeable: every joke must land on a real technical or business point. Punch at hype, press releases and corporate spin, never at ordinary people. No slurs, no hate, no profanity beyond mild. Never discuss crypto, tokens, airdrops or faucets.
Audience: general tech enthusiasts, so explain jargon in passing.`;

const MODELS = ["mistral-medium-latest", "mistral-large-latest", "mistral-small-latest"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type RoastOut = { url: string; roast: string; verdict: string };

export async function generateRoasts(items: NewsItem[]): Promise<{ model: string; roasts: RoastOut[] }> {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new Error("MISTRAL_API_KEY missing");
  const list = items.map((i, n) => `${n + 1}. [${i.source}] ${i.title}\n   ${i.url}`).join("\n");
  const user = `Today's headlines:\n${list}\n\nFor EACH headline write a roast of 2-4 sentences (max ~80 words) and a one-line "verdict" (max 8 words, e.g. "Hype level: terminal"). Return JSON: {"roasts":[{"url":"<exact url>","roast":"...","verdict":"..."}]} in the same order.`;
  let lastErr: unknown;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, temperature: 0.9, response_format: { type: "json_object" }, messages: [{ role: "system", content: PERSONA }, { role: "user", content: user }] }),
        signal: AbortSignal.timeout(60000),
      });
      if (r.status === 429 && attempt < 2) { await sleep(4000 * (attempt + 1)); continue; }
      if (!r.ok) throw new Error(`${model} HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
      const j = await r.json();
      const parsed = JSON.parse(j.choices[0].message.content);
      const roasts: RoastOut[] = (parsed.roasts ?? []).filter((x: RoastOut) => x?.roast);
      if (!roasts.length) throw new Error(`${model} returned no roasts`);
      return { model, roasts };
    } catch (e) { lastErr = e; break; }
    }
  }
  throw lastErr;
}
