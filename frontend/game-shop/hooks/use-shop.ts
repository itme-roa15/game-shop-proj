"use client";

import useSWR from "swr";
import { apiFetcher } from "@/lib/api";
import type { Category, DashboardStats, Order, PageResponse, Product, ProductFilters, ProductSummary } from "@/types";

function productQuery(filters: ProductFilters): string {
  const params = new URLSearchParams();
  if (filters.categoryId) params.set("categoryId", String(filters.categoryId));
  if (filters.keyword) params.set("keyword", filters.keyword);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  params.set("page", String(filters.page ?? 0));
  params.set("size", String(filters.size ?? 12));
  return `/api/products?${params}`;
}

export function useProducts(filters: ProductFilters) {
  return useSWR<PageResponse<ProductSummary>>(productQuery(filters), apiFetcher);
}

export function useProduct(id: string) {
  return useSWR<Product>(id ? `/api/products/${id}` : null, apiFetcher);
}

export function useCategories() {
  return useSWR<Category[]>("/api/categories", apiFetcher);
}

export function useOrders(enabled = true) {
  return useSWR<Order[]>(enabled ? "/api/orders/me" : null, apiFetcher);
}

export function useAdminOrders(enabled = true) {
  return useSWR<Order[]>(enabled ? "/api/orders" : null, apiFetcher);
}

export function useDashboard(enabled = true) {
  return useSWR<DashboardStats>(enabled ? "/api/admin/dashboard" : null, apiFetcher);
}

