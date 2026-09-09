const backendUrl = process.env.INTERNAL_API_URL ?? "http://localhost:8080";

type ProxyContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: Request, context: ProxyContext): Promise<Response> {
  const { path } = await context.params;
  const incomingUrl = new URL(request.url);
  const target = new URL(`/${path.map(encodeURIComponent).join("/")}`, backendUrl);
  target.search = incomingUrl.search;

  const headers = new Headers();
  for (const name of ["accept", "authorization", "content-type"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });

    const responseHeaders = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) responseHeaders.set("content-type", contentType);

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      { success: false, message: "The backend service is unavailable.", data: null },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
