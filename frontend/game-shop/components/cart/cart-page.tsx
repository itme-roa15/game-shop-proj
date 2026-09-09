"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartLine } from "@/components/cart/cart-line";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeading } from "@/components/shared/page-heading";
import { useCartStore } from "@/store/cart.store";
export function CartPage() { const items = useCartStore((s) => s.items); return <div className="page-shell py-12"><PageHeading eyebrow="Your loadout" title="Shopping cart" description="Review quantities before heading to checkout." />{items.length === 0 ? <div className="mt-8"><EmptyState title="Your cart is empty" description="Explore the catalog and add something built for play." action={<Button asChild><Link href="/">Browse products</Link></Button>} /></div> : <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"><div className="rounded-lg border border-border bg-surface px-5">{items.map((item) => <CartLine key={item.productId} item={item} />)}</div><div><CartSummary items={items} /><Button asChild size="lg" className="mt-4 w-full"><Link href="/checkout">Continue to checkout <ArrowRight /></Link></Button></div></div>}</div>; }
