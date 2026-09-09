"use client";
import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorBanner } from "@/components/shared/error-banner";
import { useCategories, useProducts } from "@/hooks/use-shop";

export function Catalog() {
  const searchParams = useSearchParams(); const requested = searchParams.get("category");
  const { data: categories } = useCategories();
  const requestedCategory = categories?.find((c) => c.name === requested)?.id;
  const [keyword, setKeyword] = useState(""); const [categoryId, setCategoryId] = useState<number | null>(null); const [minPrice, setMinPrice] = useState(""); const [maxPrice, setMaxPrice] = useState(""); const [page, setPage] = useState(0);
  const selectedCategory = categoryId === 0 ? undefined : (categoryId ?? requestedCategory);
  const filters = { categoryId: selectedCategory, keyword: keyword.trim() || undefined, minPrice: minPrice ? Number(minPrice) : undefined, maxPrice: maxPrice ? Number(maxPrice) : undefined, page, size: 12 };
  const { data, error, isLoading } = useProducts(filters);
  const resetPage = <T,>(setter: (value: T) => void, value: T) => { setter(value); setPage(0); };
  return <section id="catalog" className="page-shell py-14"><div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-accent">Shop the collection</p><h2 className="heading mt-1 text-2xl font-semibold">Built for your next session</h2></div>{data && <p className="text-sm text-text-secondary">{data.totalElements} products</p>}</div><div className="mb-6 grid gap-3 rounded-lg border border-border bg-surface p-4 lg:grid-cols-[1fr_auto_auto]"><label className="relative"><span className="sr-only">Search products</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" /><Input value={keyword} onChange={(e) => resetPage(setKeyword, e.target.value)} placeholder="Search consoles, games, and gear" className="pl-9" /></label><div className="flex gap-2 overflow-x-auto" aria-label="Product categories"><Button size="sm" variant={!selectedCategory ? "default" : "secondary"} onClick={() => resetPage(setCategoryId, 0)}>All</Button>{categories?.map((category) => <Button size="sm" key={category.id} variant={selectedCategory === category.id ? "default" : "secondary"} onClick={() => resetPage(setCategoryId, category.id)} className="shrink-0">{category.name}</Button>)}</div><div className="flex items-center gap-2"><SlidersHorizontal className="size-4 text-text-muted" /><Input aria-label="Minimum price" type="number" min="0" value={minPrice} onChange={(e) => resetPage(setMinPrice, e.target.value)} placeholder="Min $" className="w-24" /><Input aria-label="Maximum price" type="number" min="0" value={maxPrice} onChange={(e) => resetPage(setMaxPrice, e.target.value)} placeholder="Max $" className="w-24" /></div></div>{error && <ErrorBanner message={error instanceof Error ? error.message : "Could not load products."} />}{isLoading && <ProductGridSkeleton />}{data && data.content.length > 0 && <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">{data.content.map((product) => <ProductCard key={product.id} product={product} />)}</div>}{data?.content.length === 0 && <EmptyState title="No gear found" description="Try a different search, category, or price range." />} {data && data.totalPages > 1 && <div className="mt-8 flex items-center justify-center gap-3"><Button variant="secondary" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Previous</Button><span className="text-sm text-text-secondary">Page {page + 1} of {data.totalPages}</span><Button variant="secondary" disabled={page + 1 >= data.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div>}</section>;
}
