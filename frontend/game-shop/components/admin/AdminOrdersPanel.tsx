"use client";

import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order, OrderStatus } from "@/types";

import { AdminPanelState } from "./AdminPanelState";
import { AdminStatusBadge } from "./AdminStatusBadge";

interface AdminOrdersPanelProps {
  orders: Order[] | undefined;
  loading: boolean;
  error: Error | undefined;
  onStatusChange: (id: number, status: OrderStatus) => Promise<void>;
}

const statuses: OrderStatus[] = ["PENDING", "CONFIRMED", "CANCELLED"];
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateTime = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export function AdminOrdersPanel({
  orders,
  loading,
  error,
  onStatusChange,
}: AdminOrdersPanelProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const updateStatus = async (id: number, status: OrderStatus) => {
    setUpdatingId(id);
    setMutationError(null);
    try {
      await onStatusChange(id, status);
    } catch (reason: unknown) {
      setMutationError(reason instanceof Error ? reason.message : "Unable to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section aria-labelledby="orders-heading">
      <div className="mb-6">
        <h1 id="orders-heading" className="heading text-3xl font-bold text-text-primary">
          Orders
        </h1>
        <p className="mt-2 text-text-secondary">Review purchases and manage fulfillment status.</p>
      </div>

      {mutationError ? (
        <p className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {mutationError}
        </p>
      ) : null}
      {loading ? <AdminPanelState kind="loading" message="Loading orders…" /> : null}
      {error ? <AdminPanelState kind="error" message={error.message} /> : null}
      {!loading && !error && orders?.length === 0 ? (
        <AdminPanelState kind="empty" message="No orders have been placed yet." />
      ) : null}

      {!loading && !error && orders && orders.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_4px_24px_rgba(0,0,0,.4)]">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-border hover:bg-surface-2/60">
                  <TableCell className="font-medium text-text-primary">#{order.id}</TableCell>
                  <TableCell>
                    <p className="font-medium text-text-primary">{order.userName}</p>
                    <p className="text-xs text-text-muted">{order.userEmail}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-text-secondary">
                    {dateTime.format(new Date(order.createdAt))}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {order.items.reduce((total, item) => total + item.quantity, 0)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-accent">
                    {money.format(order.total)}
                  </TableCell>
                  <TableCell><AdminStatusBadge status={order.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={order.status}
                        onValueChange={(status) => {
                          if (status !== null) void updateStatus(order.id, status as OrderStatus);
                        }}
                        disabled={updatingId === order.id}
                      >
                        <SelectTrigger size="sm" aria-label={`Update order ${order.id} status`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0) + status.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updatingId === order.id ? (
                        <LoaderCircle className="size-4 animate-spin text-accent motion-reduce:animate-none" aria-label="Updating order" />
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </section>
  );
}
