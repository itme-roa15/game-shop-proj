import type { Metadata } from "next";
import { CheckoutPanel } from "@/components/checkout/checkout-panel";
import { PageHeading } from "@/components/shared/page-heading";
export const metadata: Metadata = { title: "Checkout" };
export default function CheckoutPage() { return <div className="page-shell py-12"><PageHeading eyebrow="Final check" title="Checkout" description="We will verify current stock before your order is confirmed." /><div className="mt-8"><CheckoutPanel /></div></div>; }
