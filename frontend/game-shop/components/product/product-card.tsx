"use client";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart.store";
import type { ProductSummary } from "@/types";
export function ProductCard({ product }: { product: ProductSummary }) {
  const addItem = useCartStore((s) => s.addItem); const soldOut = product.stock < 1;
  const add = () => { addItem(product); toast.success(`${product.name} added to cart`); };
  return <article className="card-glow group overflow-hidden rounded-lg border border-border bg-surface"><Link href={`/products/${product.id}`} className="block"><div className="relative aspect-4/3 overflow-hidden bg-surface-2"><Image src={product.imageUrl || "/globe.svg"} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-105" /></div></Link><div className="p-4"><Badge variant="secondary" className="mb-3 rounded-full text-xs text-text-secondary">{product.categoryName}</Badge><Link href={`/products/${product.id}`}><h3 className="heading line-clamp-2 min-h-12 text-lg font-semibold hover:text-accent">{product.name}</h3></Link><div className="mt-3 flex items-center justify-between"><strong className="text-lg text-accent">{formatCurrency(Number(product.price))}</strong><span className={`text-xs ${soldOut ? "text-danger" : "text-text-secondary"}`}>{soldOut ? "Sold out" : `${product.stock} in stock`}</span></div><Button disabled={soldOut} onClick={add} className="mt-4 w-full"><span className="relative"><ShoppingBag className="size-4" /><Plus className="absolute -right-2 -top-2 size-3" /></span>{soldOut ? "Unavailable" : "Add to cart"}</Button></div></article>;
}
