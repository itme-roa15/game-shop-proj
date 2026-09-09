"use client";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorBanner } from "@/components/shared/error-banner";
const schema = z.object({ email: z.email("Enter a valid email address."), password: z.string().min(1, "Password is required.") });
type LoginValues = z.infer<typeof schema>;
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(schema) });
  const submit = handleSubmit(async (values) => {
    setError("");
    try {
      const result = await signIn("credentials", { ...values, redirect: false });
      if (result?.error) {
        throw new Error("Email or password is incorrect.");
      }
      const session = await getSession();
      toast.success(`Welcome back, ${session?.user.name ?? "player"}`);
      router.replace(params.get("returnTo") || (session?.user.role === "ROLE_ADMIN" ? "/admin" : "/"));
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed.");
    }
  });
  return <form onSubmit={submit} className="space-y-5">{error && <ErrorBanner message={error} />}<div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" placeholder="player@example.com" {...register("email")} />{errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}</div><div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="current-password" {...register("password")} />{errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}</div><Button disabled={isSubmitting} size="lg" className="w-full">{isSubmitting ? "Signing in…" : "Log in"}</Button><p className="text-center text-sm text-text-secondary">New to GameShop? <Link href="/register" className="font-medium text-accent hover:underline">Create an account</Link></p></form>;
}
