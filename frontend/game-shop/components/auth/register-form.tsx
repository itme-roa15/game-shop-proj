"use client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorBanner } from "@/components/shared/error-banner";
import { apiRequest } from "@/lib/api";
import type { AuthResponse } from "@/types";
const schema = z.object({ name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100), email: z.email("Enter a valid email address."), password: z.string().min(8, "Password must be at least 8 characters.").max(100) });
type RegisterValues = z.infer<typeof schema>;
export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(schema) });
  const submit = handleSubmit(async (values) => {
    setError("");
    try {
      await apiRequest<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(values) });
      const result = await signIn("credentials", { email: values.email, password: values.password, redirect: false });
      if (result?.error) {
        throw new Error("Your account was created, but automatic sign-in failed. Please log in.");
      }
      toast.success("Account created. Welcome to GameShop!");
      router.replace("/");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Registration failed.");
    }
  });
  return <form onSubmit={submit} className="space-y-5">{error && <ErrorBanner message={error} />}<div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" autoComplete="name" placeholder="Player one" {...register("name")} />{errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}</div><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" placeholder="player@example.com" {...register("email")} />{errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}</div><div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="new-password" {...register("password")} />{errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}</div><Button disabled={isSubmitting} size="lg" className="w-full">{isSubmitting ? "Creating account…" : "Create account"}</Button><p className="text-center text-sm text-text-secondary">Already registered? <Link href="/login" className="font-medium text-accent hover:underline">Log in</Link></p></form>;
}
