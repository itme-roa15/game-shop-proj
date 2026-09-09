"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorBanner } from "@/components/shared/error-banner";
import { OrderCard } from "@/components/order/order-card";
import { useOrders } from "@/hooks/use-shop";
export function OrderHistory() { const { data, error, isLoading } = useOrders(); if (isLoading) return <div className="grid gap-5 md:grid-cols-2">{[1,2,3,4].map((value) => <Skeleton key={value} className="h-72 rounded-lg" />)}</div>; if (error) return <ErrorBanner message={error instanceof Error ? error.message : "Orders could not be loaded."} />; if (!data?.length) return <EmptyState title="No orders yet" description="When you check out, your order history will appear here." action={<Button asChild><Link href="/">Start shopping</Link></Button>} />; return <div className="grid gap-5 md:grid-cols-2">{data.map((order) => <OrderCard key={order.id} order={order} />)}</div>; }
