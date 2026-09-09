"use client";
import Link from "next/link";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CartSummary } from "@/components/cart/cart-summary";
import { CartLine } from "@/components/cart/cart-line";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorBanner } from "@/components/shared/error-banner";
import { apiRequest } from "@/lib/api";
import { useCartStore } from "@/store/cart.store";
import type { Order } from "@/types";
export function CheckoutPanel() { const router = useRouter(); const items = useCartStore((s) => s.items); const clear = useCartStore((s) => s.clear); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState(""); if (!items.length) return <EmptyState title="Nothing to check out" description="Add products to your cart first." action={<Button asChild><Link href="/">Return to shop</Link></Button>} />; const placeOrder = async () => { setSubmitting(true); setError(""); try { const order = await apiRequest<Order>("/api/orders", { method: "POST", body: JSON.stringify({ items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })) }) }); clear(); toast.success(`Order #${order.id} placed successfully`); router.replace("/orders"); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not place order."); setSubmitting(false); } }; return <div className="grid gap-8 lg:grid-cols-[1fr_380px]"><section className="rounded-lg border border-border bg-surface px-5">{items.map((item) => <CartLine key={item.productId} item={item} />)}</section><aside>{error && <div className="mb-4"><ErrorBanner message={error} /></div>}<CartSummary items={items} /><Button disabled={submitting} onClick={placeOrder} size="lg" className="mt-4 w-full"><LockKeyhole />{submitting ? "Placing order…" : "Place order"}</Button><p className="mt-4 flex items-center justify-center gap-2 text-xs text-text-secondary"><CheckCircle2 className="size-4 text-success" />Stock is verified when you place the order.</p></aside></div>; }
