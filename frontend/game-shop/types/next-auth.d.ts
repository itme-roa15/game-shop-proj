import type { DefaultSession } from "next-auth";
import type { Role } from "@/types";
declare module "next-auth" {
  interface User { role: Role; accessToken: string; accessTokenExpiresAt: number; }
  interface Session { user: DefaultSession["user"] & { id: string; role: Role }; accessToken?: string; accessTokenExpiresAt?: number; }
}
declare module "next-auth/jwt" { interface JWT { role: Role; accessToken?: string; accessTokenExpiresAt?: number; } }
