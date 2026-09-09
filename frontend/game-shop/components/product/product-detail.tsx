"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBanner } from "@/components/shared/error-banner";
import { useProduct } from "@/hooks/use-shop";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart.store";
export function ProductDetail({ id }: { id: string }) { const { data: product, error, isLoading } = useProduct(id); const add = useCartStore((s) => s.addItem); if (isLoading) return <div className="page-shell grid gap-10 py-12 lg:grid-cols-2"><Skeleton className="aspect-square rounded-lg" /><div className="space-y-5"><Skeleton className="h-8 w-32" /><Skeleton className="h-14 w-full" /><Skeleton className="h-28 w-full" /></div></div>; if (error) return <div className="page-shell py-16"><ErrorBanner message={error instanceof Error ? error.message : "Product could not be loaded."} /></div>; if (!product) return null; const soldOut = product.stock < 1; return <div className="page-shell py-10"><Button asChild variant="ghost" className="mb-6"><Link href="/"><ArrowLeft />Back to shop</Link></Button><div className="grid gap-10 lg:grid-cols-2"><div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface"><Image fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" src={product.imageUrl || "/globe.svg"} alt={product.name} /></div><section className="flex flex-col justify-center"><Badge className="mb-4 w-fit rounded-full" variant="secondary">{product.categoryName}</Badge><h1 className="heading text-4xl font-bold tracking-[-.03em] sm:text-5xl">{product.name}</h1><p className="mt-5 text-3xl font-bold text-accent">{formatCurrency(Number(product.price))}</p><p className="mt-6 whitespace-pre-wrap leading-7 text-text-secondary">{product.description || "Premium gaming gear selected for players who expect more."}</p><div className="mt-7 flex items-center gap-2 text-sm"><Check className={`size-4 ${soldOut ? "text-danger" : "text-success"}`} /><span>{soldOut ? "Currently out of stock" : `${product.stock} available and ready to ship`}</span></div><Button size="lg" disabled={soldOut} onClick={() => { add(product); toast.success(`${product.name} added to cart`); }} className="mt-7 w-full sm:w-fit"><ShoppingBag />{soldOut ? "Unavailable" : "Add to cart"}</Button></section></div></div>; }
