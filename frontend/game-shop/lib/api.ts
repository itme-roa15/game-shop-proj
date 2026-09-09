import { getSession } from "next-auth/react";

import type { ApiErrorBody, ApiResponse } from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "/backend-api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const session = await getSession();
  return session?.accessToken ?? null;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const token = await getAccessToken();

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  let payload: ApiResponse<T> | ApiErrorBody;
  try {
    payload = (await response.json()) as ApiResponse<T> | ApiErrorBody;
  } catch {
    throw new ApiError("The server returned an unreadable response.", response.status);
  }

  if (!response.ok || !payload.success) {
    const fields = payload.data && !Array.isArray(payload.data)
      ? payload.data as Record<string, string>
      : undefined;
    throw new ApiError(payload.message || "Request failed.", response.status, fields);
  }

  return payload.data;
}

export const apiFetcher = <T>(path: string): Promise<T> => apiRequest<T>(path);
