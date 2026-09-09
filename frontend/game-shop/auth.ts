import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import type { ApiResponse, AuthResponse, Role } from "@/types";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

class InvalidCredentials extends CredentialsSignin {
  code = "invalid_credentials";
}

const apiBaseUrl =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080";

function readRole(value: unknown): Role {
  return value === "ROLE_ADMIN" ? "ROLE_ADMIN" : "ROLE_USER";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
          cache: "no-store",
        });
        const payload = (await response.json()) as ApiResponse<AuthResponse>;
        if (!response.ok || !payload.success) {
          throw new InvalidCredentials();
        }

        const user = payload.data;
        return {
          id: String(user.userId),
          name: user.name,
          email: user.email,
          role: user.role,
          accessToken: user.token,
          accessTokenExpiresAt: Date.now() + user.expiresInMs,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.accessTokenExpiresAt = user.accessTokenExpiresAt;
      }

      const expiresAt =
        typeof token.accessTokenExpiresAt === "number"
          ? token.accessTokenExpiresAt
          : undefined;
      if (expiresAt && Date.now() >= expiresAt) {
        token.accessToken = undefined;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.role = readRole(token.role);
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined;
      session.accessTokenExpiresAt =
        typeof token.accessTokenExpiresAt === "number"
          ? token.accessTokenExpiresAt
          : undefined;
      return session;
    },
  },
});
