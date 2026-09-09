import Link from "next/link";
import { Gamepad2 } from "lucide-react";
export function Logo() { return <Link href="/" className="flex items-center gap-2 rounded-md font-heading text-xl font-bold tracking-tight"><span className="grid size-9 place-items-center rounded-md bg-accent text-white shadow-[0_0_20px_var(--color-accent-glow)]"><Gamepad2 className="size-5" aria-hidden /></span>GameShop</Link>; }
