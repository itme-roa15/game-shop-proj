"use client";

import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Category, PageResponse, Product, ProductInput, ProductSummary } from "@/types";

import { AdminDeleteProductDialog } from "./AdminDeleteProductDialog";
import { AdminPanelState } from "./AdminPanelState";
import { AdminProductFormDialog } from "./AdminProductFormDialog";

interface AdminProductsPanelProps {
  page: PageResponse<ProductSummary> | undefined;
  categories: Category[];
  loading: boolean;
  error: Error | undefined;
  currentPage: number;
  onPageChange: (page: number) => void;
  onGetProduct: (id: number) => Promise<Product>;
  onCreate: (input: ProductInput) => Promise<void>;
  onUpdate: (id: number, input: ProductInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function AdminProductsPanel({
  page,
  categories,
  loading,
  error,
  currentPage,
  onPageChange,
  onGetProduct,
  onCreate,
  onUpdate,
  onDelete,
}: AdminProductsPanelProps) {
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loadingProductId, setLoadingProductId] = useState<number | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ProductSummary | null>(null);

  const visibleProducts = useMemo(() => {
    const products = page?.content ?? [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.categoryName.toLowerCase().includes(normalized),
    );
  }, [page, query]);

  const editProduct = async (id: number) => {
    setLoadingProductId(id);
    setDetailError(null);
    try {
      setEditing(await onGetProduct(id));
    } catch (reason: unknown) {
      setDetailError(reason instanceof Error ? reason.message : "Unable to load product details.");
    } finally {
      setLoadingProductId(null);
    }
  };

  return (
    <section aria-labelledby="products-heading">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 id="products-heading" className="heading text-3xl font-bold text-text-primary">
            Products
          </h1>
          <p className="mt-2 text-text-secondary">Manage pricing, stock, and catalog details.</p>
        </div>
        <Button type="button" onClick={() => setShowCreate(true)}>
          <Plus /> Add product
        </Button>
      </div>

      <div className="mb-4 flex max-w-md items-center gap-2 rounded-xl border border-border bg-surface px-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
        <Search className="size-4 text-text-muted" aria-hidden="true" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter this page"
          aria-label="Filter products on this page"
          className="border-0 bg-transparent focus-visible:ring-0"
        />
      </div>

      {detailError ? (
        <p className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {detailError}
        </p>
      ) : null}

      {loading ? <AdminPanelState kind="loading" message="Loading products…" /> : null}
      {error ? <AdminPanelState kind="error" message={error.message} /> : null}
      {!loading && !error && visibleProducts.length === 0 ? (
        <AdminPanelState
          kind="empty"
          message={query ? "No products on this page match your filter." : "No active products yet."}
        />
      ) : null}

      {!loading && !error && visibleProducts.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_4px_24px_rgba(0,0,0,.4)]">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProducts.map((product) => (
                <TableRow key={product.id} className="border-border hover:bg-surface-2/60">
                  <TableCell className="font-medium text-text-primary">{product.name}</TableCell>
                  <TableCell className="text-text-secondary">{product.categoryName}</TableCell>
                  <TableCell className="text-right font-medium text-accent">
                    {money.format(product.price)}
                  </TableCell>
                  <TableCell className="text-right text-text-secondary">
                    <span className={product.stock === 0 ? "text-danger" : ""}>{product.stock}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => editProduct(product.id)}
                        disabled={loadingProductId === product.id}
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleting(product)}
                        aria-label={`Remove ${product.name}`}
                        className="text-text-secondary hover:text-danger"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {page && page.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
          <span>
            Page {page.page + 1} of {page.totalPages} · {page.totalElements} products
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              aria-label="Previous products page"
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage + 1 >= page.totalPages}
              aria-label="Next products page"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}

      {showCreate ? (
        <AdminProductFormDialog
          key="create-product"
          product={null}
          categories={categories}
          onClose={() => setShowCreate(false)}
          onSave={onCreate}
        />
      ) : null}
      {editing ? (
        <AdminProductFormDialog
          key={editing.id}
          product={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSave={(input) => onUpdate(editing.id, input)}
        />
      ) : null}
      {deleting ? (
        <AdminDeleteProductDialog
          product={deleting}
          onClose={() => setDeleting(null)}
          onDelete={onDelete}
        />
      ) : null}
    </section>
  );
}
