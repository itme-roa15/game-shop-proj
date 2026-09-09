# GameShop frontend

Responsive storefront and administration UI for the GameShop Spring Boot API. It uses Next.js 16 App Router, TypeScript, Tailwind CSS 4, shadcn components, SWR for server data, and persisted Zustand stores for the JWT session and cart.

## Local setup

The frontend expects the backend at `http://localhost:8080` by default. To use another origin, copy the example environment file and edit it:

```bash
cp .env.example .env
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
AUTH_SECRET=replace-with-a-random-secret-of-at-least-32-characters
```

The configured origin must match `app.cors.allowed-origin` in the backend. Start the frontend with:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). Run production checks with:

```bash
bun run lint
bun run build
```

## Routes

- `/` — catalog, search, categories, price filters, and pagination
- `/products/[id]` — product detail and add to cart
- `/cart` and `/checkout` — persisted cart and authenticated order placement
- `/login` and `/register` — JWT authentication
- `/orders` — authenticated order history
- `/admin` — admin statistics and product, category, and order management

The backend issues a single expiring JWT and has no refresh-token endpoint. Auth.js keeps that access token inside its encrypted, HTTP-only JWT session cookie and exposes it to the typed API client through the session callback. Next.js Proxy performs optimistic route checks, while backend authorization remains authoritative.
