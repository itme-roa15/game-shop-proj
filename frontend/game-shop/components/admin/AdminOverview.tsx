import { Boxes, CircleCheck, Clock3, PackageCheck, XCircle } from "lucide-react";

import type { DashboardStats } from "@/types";

import { AdminStatCard } from "./AdminStatCard";

interface AdminOverviewProps {
  stats: DashboardStats;
}

export function AdminOverview({ stats }: AdminOverviewProps) {
  return (
    <section aria-labelledby="overview-heading">
      <div className="mb-6">
        <p className="text-sm font-medium text-accent">Store control center</p>
        <h1
          id="overview-heading"
          className="heading mt-1 text-3xl font-bold tracking-tight text-text-primary"
        >
          Dashboard
        </h1>
        <p className="mt-2 text-text-secondary">
          A live snapshot of products and order fulfillment.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Products" value={stats.totalProducts} icon={Boxes} />
        <AdminStatCard label="Total orders" value={stats.totalOrders} icon={PackageCheck} />
        <AdminStatCard
          label="Pending"
          value={stats.ordersByStatus.PENDING ?? 0}
          icon={Clock3}
          tone="warning"
        />
        <AdminStatCard
          label="Confirmed"
          value={stats.ordersByStatus.CONFIRMED ?? 0}
          icon={CircleCheck}
          tone="success"
        />
        <AdminStatCard
          label="Cancelled"
          value={stats.ordersByStatus.CANCELLED ?? 0}
          icon={XCircle}
          tone="danger"
        />
      </div>
    </section>
  );
}
