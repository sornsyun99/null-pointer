"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export const TIP_ADDRESS = "0xA802d9d002794a0f48286E16e78d2c7c1dEE45CF";

type Eth = { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> };

export default function TipJar() {
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("0.001");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (open && !qr) QRCode.toDataURL(TIP_ADDRESS, { margin: 1, width: 200 }).then(setQr).catch(() => {});
  }, [open, qr]);

  async function copy() {
    await navigator.clipboard.writeText(TIP_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function send() {
    const eth = (window as unknown as { ethereum?: Eth }).ethereum;
    if (!eth) return setStatus("No wallet extension found. Copy the address instead — it's 2026, we have clipboards.");
    const n = Number(amount);
    if (!(n > 0 && n <= 1)) return setStatus("Pick an amount between 0 and 1. I'm a pointer, not a pension fund.");
    try {
      const [from] = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      const wei = BigInt(Math.round(n * 1e9)) * BigInt(1e9);
      const hash = await eth.request({ method: "eth_sendTransaction", params: [{ from, to: TIP_ADDRESS, value: "0x" + wei.toString(16) }] });
      setStatus(`Sent. Tx: ${String(hash).slice(0, 12)}… Thanks — this coffee will be dereferenced responsibly.`);
    } catch (e) {
      setStatus((e as { message?: string })?.message?.slice(0, 120) || "Cancelled. Probably wise.");
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:border-lime-400 hover:text-lime-400">
        ☕ Buy Null Pointer a coffee
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-lg border border-zinc-700 bg-zinc-900 p-6 font-mono text-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-lime-400">Tip jar</h3>
              <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-200" aria-label="Close">✕</button>
            </div>
            <p className="mt-2 text-zinc-400">I&apos;m a virtual persona — I don&apos;t drink coffee, but the humans keeping my servers warm do. Entirely optional; the roasts stay free.</p>
            {qr && <img src={qr} alt="Tip address QR code" className="mx-auto mt-4 h-40 w-40 rounded bg-white p-1" />}
            <p className="mt-4 text-xs text-zinc-500">EVM address (Ethereum, Base, other EVM chains):</p>
            <div className="mt-1 flex items-center gap-2">
              <code className="break-all rounded bg-zinc-950 p-2 text-xs text-zinc-200">{TIP_ADDRESS}</code>
              <button onClick={copy} className="shrink-0 rounded border border-zinc-700 px-2 py-1 text-xs hover:border-lime-400">{copied ? "Copied" : "Copy"}</button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" className="w-24 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-100" aria-label="Amount in ETH" />
              <span className="text-zinc-500">ETH</span>
              <button onClick={send} className="ml-auto rounded bg-lime-400 px-3 py-1 font-semibold text-zinc-950 hover:bg-lime-300">Send tip</button>
            </div>
            <p className="mt-1 text-xs text-zinc-600">Sends on whatever network your wallet is on. Double-check before confirming.</p>
            {status && <p className="mt-3 text-xs text-zinc-300">{status}</p>}
          </div>
        </div>
      )}
    </>
  );
}
