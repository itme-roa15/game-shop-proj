"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAdminActions } from "@/hooks/use-admin-actions";
import { useAdminOrders, useCategories, useDashboard, useProducts } from "@/hooks/use-shop";
import type { AdminSection } from "@/types/admin";

import { AdminCategoriesPanel } from "./AdminCategoriesPanel";
import { AdminOrdersPanel } from "./AdminOrdersPanel";
import { AdminOverview } from "./AdminOverview";
import { AdminPanelState } from "./AdminPanelState";
import { AdminProductsPanel } from "./AdminProductsPanel";
import { AdminSidebar } from "./AdminSidebar";

export function AdminDashboard() {
  const [section, setSection] = useState<AdminSection>("overview");
  const [productPage, setProductPage] = useState(0);
  const { data: session, status } = useSession();
  const user = session?.user;
  const hydrated = status !== "loading";
  const isAdmin = hydrated && user?.role === "ROLE_ADMIN";
  const dashboard = useDashboard(isAdmin);
  const products = useProducts({ page: productPage, size: 20 });
  const categories = useCategories();
  const orders = useAdminOrders(isAdmin);
  const actions = useAdminActions();

  const logout = () => void signOut({ redirectTo: "/" });

  if (!hydrated) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg px-4">
        <div className="w-full max-w-lg">
          <AdminPanelState kind="loading" message="Checking administrator access…" />
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg px-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,.4)]">
          <p className="text-sm font-medium text-accent">Restricted area</p>
          <h1 className="heading mt-2 text-3xl font-bold text-text-primary">Admin access required</h1>
          <p className="mt-3 text-text-secondary">
            Sign in with an administrator account to manage the catalog and orders.
          </p>
          <Button asChild className="mt-6">
            <Link href="/login">Go to sign in</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-bg lg:pl-60">
      <AdminSidebar activeSection={section} onSectionChange={setSection} onLogout={logout} />
      <main className="px-4 py-8 md:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {section === "overview" && dashboard.isLoading ? (
            <AdminPanelState kind="loading" message="Loading dashboard statistics…" />
          ) : null}
          {section === "overview" && dashboard.error ? (
            <AdminPanelState kind="error" message={dashboard.error.message} />
          ) : null}
          {section === "overview" && dashboard.data ? <AdminOverview stats={dashboard.data} /> : null}

          {section === "products" ? (
            <AdminProductsPanel
              page={products.data}
              categories={categories.data ?? []}
              loading={products.isLoading || categories.isLoading}
              error={products.error ?? categories.error}
              currentPage={productPage}
              onPageChange={setProductPage}
              onGetProduct={actions.getProduct}
              onCreate={actions.createProduct}
              onUpdate={actions.updateProduct}
              onDelete={actions.deleteProduct}
            />
          ) : null}

          {section === "orders" ? (
            <AdminOrdersPanel
              orders={orders.data}
              loading={orders.isLoading}
              error={orders.error}
              onStatusChange={actions.updateOrderStatus}
            />
          ) : null}

          {section === "categories" ? (
            <AdminCategoriesPanel
              categories={categories.data}
              loading={categories.isLoading}
              error={categories.error}
              onCreate={actions.createCategory}
              onRename={actions.renameCategory}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}
