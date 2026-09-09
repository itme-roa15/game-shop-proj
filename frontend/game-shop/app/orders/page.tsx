import type { Metadata } from "next";
import { OrderHistory } from "@/components/order/order-history";
import { PageHeading } from "@/components/shared/page-heading";
export const metadata: Metadata = { title: "My orders" };
export default function OrdersPage() { return <div className="page-shell py-12"><PageHeading eyebrow="Purchase history" title="My orders" description="Track every order and revisit the gear in your collection." /><div className="mt-8"><OrderHistory /></div></div>; }
