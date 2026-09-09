import { Logo } from "@/components/layout/logo";
export function Footer() { return <footer className="mt-20 border-t border-border bg-surface"><div className="page-shell flex flex-col gap-4 py-8 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between"><Logo /><p>Built for players. Designed for speed.</p><p>© {new Date().getFullYear()} GameShop</p></div></footer>; }
