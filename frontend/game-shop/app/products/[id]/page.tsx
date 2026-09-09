import type { Metadata } from "next";
import { ProductDetail } from "@/components/product/product-detail";
export const metadata: Metadata = { title: "Product details" };
export default async function ProductPage({ params }: PageProps<"/products/[id]">) { const { id } = await params; return <ProductDetail id={id} />; }
