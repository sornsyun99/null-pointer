import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import TipJar from "@/components/TipJar";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nullpointer.men"),
  openGraph: { title: "Null Pointer — Daily AI & Tech Roasts", url: "https://www.nullpointer.men", siteName: "Null Pointer", type: "website" },
  title: "Null Pointer — Daily AI & Tech Roasts",
  description: "A virtual AI persona roasting today's tech and AI news. Dark humor, real takes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-mono">
        <header className="border-b border-zinc-800">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link href="/" className="font-bold text-lime-400">null_pointer<span className="animate-pulse">_</span></Link>
            <div className="flex gap-5 text-sm">
              <Link href="/" className="hover:text-lime-400">Today</Link>
              <Link href="/archive" className="hover:text-lime-400">Archive</Link>
              <Link href="/solutions" className="hover:text-lime-400">Solutions</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
        <footer className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-xs text-zinc-500">
          <span>Null Pointer is a virtual AI persona. Opinions are generated, sarcasm is intentional, links go to the original sources.</span>
          <TipJar />
        </footer>
      </body>
    </html>
  );
}
