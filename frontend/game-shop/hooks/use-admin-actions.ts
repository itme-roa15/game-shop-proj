"use client";

import { useSWRConfig } from "swr";

import { apiRequest } from "@/lib/api";
import type { Category, Order, OrderStatus, Product, ProductInput } from "@/types";

export function useAdminActions() {
  const { mutate } = useSWRConfig();

  const refreshProducts = () =>
    mutate(
      (key: unknown) => typeof key === "string" && key.startsWith("/api/products"),
    );

  const getProduct = (id: number) => apiRequest<Product>(`/api/products/${id}`);

  const createProduct = async (input: ProductInput) => {
    await apiRequest<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(input),
    });
    await Promise.all([refreshProducts(), mutate("/api/admin/dashboard")]);
  };

  const updateProduct = async (id: number, input: ProductInput) => {
    await apiRequest<Product>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    await refreshProducts();
  };

  const deleteProduct = async (id: number) => {
    await apiRequest<null>(`/api/products/${id}`, { method: "DELETE" });
    await Promise.all([refreshProducts(), mutate("/api/admin/dashboard")]);
  };

  const createCategory = async (name: string) => {
    await apiRequest<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    await mutate("/api/categories");
  };

  const renameCategory = async (id: number, name: string) => {
    await apiRequest<Category>(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
    await Promise.all([mutate("/api/categories"), refreshProducts()]);
  };

  const updateOrderStatus = async (id: number, status: OrderStatus) => {
    await apiRequest<Order>(`/api/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await Promise.all([mutate("/api/orders"), mutate("/api/admin/dashboard")]);
  };

  return {
    createCategory,
    createProduct,
    deleteProduct,
    getProduct,
    renameCategory,
    updateOrderStatus,
    updateProduct,
  };
}
