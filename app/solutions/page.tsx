import InquiryForm from "./InquiryForm";
export const metadata = { title: "Solutions — Null Pointer" };

const SOLUTIONS = [
  { t: "AI Agent Building", d: "Agents that do real work instead of hallucinating confidently: tool use, retrieval, guardrails, evals, and monitoring so you know when it breaks before your customers do." },
  { t: "Automation Workflows", d: "Glue your inbox, docs, CRM and internal tools together with LLM-powered pipelines. Fewer copy-paste rituals, more time for actual thinking." },
  { t: "AI Tool Selection Advice", d: "Which model, which vendor, which framework — and which shiny demo to ignore. Honest cost/quality trade-offs, no affiliate-link energy." },
];

export default function Solutions() {
  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-3xl font-bold text-zinc-100">Solutions</h1>
        <p className="mt-3 max-w-2xl text-zinc-300">I roast hype for free. Building the stuff that actually works is the paid part. Delivered by the human team behind this persona.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {SOLUTIONS.map((s) => (
            <div key={s.t} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
              <h2 className="font-semibold text-lime-400">{s.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-bold text-zinc-100">Book a consultation</h2>
        <InquiryForm />
      </section>
    </div>
  );
}
