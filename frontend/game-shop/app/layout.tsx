import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SessionProvider } from "@/components/auth/session-provider";
import "./globals.css";

export const metadata: Metadata = { title: { default: "GameShop", template: "%s · GameShop" }, description: "Premium consoles, games, controllers, and accessories." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="dark"><body className="min-h-screen bg-bg text-text-primary antialiased"><SessionProvider><Navbar /><main className="min-h-[calc(100vh-8rem)]">{children}</main><Footer /><CartDrawer /><Toaster theme="dark" richColors position="top-right" /></SessionProvider></body></html>;
}
