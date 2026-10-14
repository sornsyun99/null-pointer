export type NewsItem = { title: string; url: string; source: string; score: number; published_at: string | null };

const AI_RE = /\b(ai|a\.i\.|llm|llms|gpt|openai|anthropic|claude|gemini|mistral|llama|deepmind|machine learning|neural|chatbot|agent|agents|copilot|diffusion|transformer|nvidia|deepseek|qwen|grok|xai|hugging ?face|model|models|robot|robotics|agi)\b/i;

const FEEDS: { source: string; url: string; allAI?: boolean }[] = [
  { source: "OpenAI", url: "https://openai.com/news/rss.xml", allAI: true },
  { source: "Google AI", url: "https://blog.google/technology/ai/rss/", allAI: true },
  { source: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", allAI: true },
  { source: "The Verge AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", allAI: true },
];

async function getJSON(u: string) {
  const r = await fetch(u, { cache: "no-store", signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw new Error(`${u} ${r.status}`);
  return r.json();
}

async function hackerNews(): Promise<NewsItem[]> {
  const ids: number[] = (await getJSON("https://hacker-news.firebaseio.com/v0/topstories.json")).slice(0, 80);
  const items = await Promise.all(ids.map((id) => getJSON(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).catch(() => null)));
  return items
    .filter((i) => i && i.title && i.type === "story")
    .map((i) => ({ title: i.title, url: i.url || `https://news.ycombinator.com/item?id=${i.id}`, source: "Hacker News", score: i.score ?? 0, published_at: i.time ? new Date(i.time * 1000).toISOString() : null }));
}

function decode(s: string) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&#8217;|&rsquo;/g, "'").replace(/&#8216;|&lsquo;/g, "'").replace(/&#822[01];/g, '"').trim();
}
function tag(block: string, name: string) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]) : "";
}

async function rss(f: (typeof FEEDS)[number]): Promise<NewsItem[]> {
  const r = await fetch(f.url, { cache: "no-store", signal: AbortSignal.timeout(10000), headers: { "User-Agent": "NullPointerBot/1.0" } });
  if (!r.ok) throw new Error(`${f.url} ${r.status}`);
  const xml = await r.text();
  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/(item|entry)>/gi) ?? [];
  const now = Date.now();
  return blocks.slice(0, 15).map((b) => {
    let link = tag(b, "link");
    if (!link) link = b.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? "";
    const date = tag(b, "pubDate") || tag(b, "updated") || tag(b, "published");
    const t = date ? new Date(date).getTime() : NaN;
    const ageH = isNaN(t) ? 48 : (now - t) / 36e5;
    return { title: tag(b, "title"), url: link, source: f.source, score: Math.max(0, 300 - ageH * 6), published_at: isNaN(t) ? null : new Date(t).toISOString() };
  }).filter((i) => i.title && i.url);
}

export async function fetchTopAINews(limit = 6): Promise<NewsItem[]> {
  const results = await Promise.allSettled([hackerNews(), ...FEEDS.map(rss)]);
  const all: NewsItem[] = [];
  results.forEach((r, idx) => {
    if (r.status !== "fulfilled") return;
    const allAI = idx > 0 && FEEDS[idx - 1].allAI;
    for (const it of r.value) if (allAI || AI_RE.test(it.title)) all.push(it);
  });
  const seen = new Set<string>();
  const uniq = all.filter((i) => { const k = i.url.split("?")[0]; if (seen.has(k)) return false; seen.add(k); return true; });
  uniq.sort((a, b) => b.score - a.score);
  // keep source variety: max 2 per source
  const per: Record<string, number> = {}, out: NewsItem[] = [];
  for (const i of uniq) { if ((per[i.source] ?? 0) >= 2) continue; per[i.source] = (per[i.source] ?? 0) + 1; out.push(i); if (out.length >= limit) break; }
  return out;
}
