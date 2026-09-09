import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
export const metadata: Metadata = { title: "Log in" };
export default function LoginPage() { return <AuthShell title="Welcome back" description="Log in to check out and track your orders."><Suspense fallback={<p className="text-text-secondary">Loading…</p>}><LoginForm /></Suspense></AuthShell>; }
