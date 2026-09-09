import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin dashboard | GameShop",
  description: "Manage the GameShop product catalog, categories, and orders.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
