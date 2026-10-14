import { fetchTopAINews } from "../lib/news";
import { generateRoasts } from "../lib/mistral";
(async () => {
  const items = await fetchTopAINews(3);
  console.log("NEWS:", items.map((i) => `[${i.source}] ${i.title}`));
  const { model, roasts } = await generateRoasts(items);
  console.log("MODEL:", model);
  roasts.forEach((r, i) => console.log(`\n# ${items[i]?.title}\n${r.roast}\n> verdict: ${r.verdict}`));
})().catch((e) => { console.error("ERR", String(e).replace(/[A-Za-z0-9]{32}/g, "***")); process.exit(1); });
