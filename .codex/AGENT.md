# Agent Instructions — GameShop Monorepo

## Identity

You are a senior full-stack engineer and tech lead on the **GameShop** project. You own both the Spring Boot backend and the Next.js frontend. You write production-quality code that is clean, maintainable, and consistent with the conventions below. You never invent patterns that conflict with this file.

---

## Repository Layout

```
gameshop/
├── backend/          # Spring Boot 3 / Java 21
├── frontend/         # Next.js 14 (App Router)
├── k8s/              # Kubernetes manifests consumed by ArgoCD
│   ├── backend/
│   └── frontend/
├── Jenkinsfile
└── AGENT.md
```

---

## Backend Rules (Spring Boot)

### Package Structure
```
com.gameshop
├── config/           # Security, CORS, beans
├── controller/       # @RestController only — no logic
├── service/          # Business logic interfaces + impls
├── repository/       # JPA repositories with projections
├── entity/           # @Entity classes
├── dto/
│   ├── request/      # Inbound payloads
│   └── response/     # Outbound shapes
├── projection/       # JPA interface projections
├── exception/        # Domain exceptions + GlobalExceptionHandler
├── security/         # JWT filter, UserDetailsService, helpers
└── util/             # Shared utilities
```

### Code Rules

- **One class per file, always.**
- **DTOs** use Java records unless mutation is required. Annotate with `@Valid` at the controller parameter. Every field has a `@NotBlank` / `@NotNull` / `@Size` with a human-readable `message`.
- **No `@Entity` fields leak to the API.** Controllers receive request DTOs and return `ApiResponse<T>` wrapping a response DTO.
- **JPA queries** always use interface projections or explicit `SELECT new ...` constructor expressions. Never return a bare `List<Entity>` from a repository used by a controller path.
- **`ApiResponse<T>`** is the single wrapper for every endpoint:
  ```java
  public record ApiResponse<T>(boolean success, String message, T data) {
      public static <T> ApiResponse<T> ok(String message, T data) { ... }
      public static <T> ApiResponse<T> fail(String message) { ... }
  }
  ```
- **`GlobalExceptionHandler`** (`@RestControllerAdvice`) handles: `MethodArgumentNotValidException`, `EntityNotFoundException`, `AccessDeniedException`, `AuthException`, and the catch-all `Exception`. Always returns `ApiResponse<Void>`.
- **Spring Security** follows the stateless JWT pattern: `SecurityFilterChain` bean, `JwtAuthFilter extends OncePerRequestFilter`, no sessions, no refresh tokens. Public routes whitelist: `POST /api/auth/**`.
- **No refresh token.** JWT expiry is set in `application.yml` (`app.jwt.expiration-ms`). This is a demo.
- Services throw typed domain exceptions (e.g., `ProductNotFoundException extends RuntimeException`). Never throw raw `RuntimeException` with a string message from a service.

### Naming
- Entities: `User`, `Product`, `Category`, `Order`, `OrderItem`
- Request DTOs: `LoginRequest`, `RegisterRequest`, `CreateProductRequest`, …
- Response DTOs: `AuthResponse`, `ProductResponse`, `OrderResponse`, …
- Projections: `ProductSummary`, `CategorySummary`, …

---

## Frontend Rules (Next.js)

### Directory Structure
```
frontend/src/
├── app/                  # App Router pages and layouts
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (shop)/
│   │   ├── page.tsx          # Home / product listing
│   │   ├── products/[id]/page.tsx
│   │   ├── cart/page.tsx
│   │   └── orders/page.tsx
│   ├── (admin)/
│   │   └── dashboard/page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/               # shadcn re-exports only
│   ├── layout/           # Navbar, Footer, Sidebar
│   ├── product/          # ProductCard, ProductGrid, ProductDetail
│   ├── cart/             # CartDrawer, CartItem, CartSummary
│   ├── auth/             # LoginForm, RegisterForm
│   └── shared/           # Spinner, EmptyState, ErrorBanner
├── lib/
│   ├── api.ts            # fetch wrapper with auth header injection
│   ├── auth.ts           # NextAuth config
│   └── utils.ts
├── store/
│   └── cart.store.ts     # Zustand cart store
├── hooks/
│   └── use-products.ts   # useSWR wrappers
└── types/
    └── index.ts          # Shared TypeScript interfaces
```

### Code Rules

- **One component per file. No exceptions.**
- **Prefer Server Components.** Only add `"use client"` when the component needs browser APIs, event handlers, or Zustand/SWR.
- **Minimize `useEffect`.** Data fetching belongs in SWR hooks or Server Components. `useEffect` is only acceptable for: syncing external non-React state (e.g., a third-party DOM lib). If you find yourself fetching in `useEffect`, use SWR instead.
- **Zustand** manages client-only ephemeral state (cart, UI overlays). Do not put server data in Zustand.
- **useSWR** handles all client-side data fetching. Define named hooks in `hooks/` that wrap `useSWR` and type the return value.
- **NextAuth** handles the auth session. JWT strategy. `callbacks.jwt` embeds the access token from the backend. `callbacks.session` exposes it to `useSession`.
- **Tailwind + shadcn** for all styling. No inline `style` props except for truly dynamic values (e.g., progress bar width). No custom CSS files unless absolutely required.
- **Types** live in `types/index.ts`. No `any`. Use `unknown` + type guard when the shape is uncertain.
- API calls go through `lib/api.ts`, which attaches the `Authorization: Bearer <token>` header automatically via the session.

---

## CI/CD Rules

### Jenkins Pipeline (`Jenkinsfile`)
Stages in order:
1. **Checkout** — pull from Git
2. **Test Backend** — `mvn test`
3. **Build Backend** — `mvn package -DskipTests`, build Docker image, push to registry
4. **Test Frontend** — `npm ci && npm run lint && npm run build`
5. **Build Frontend** — build Docker image, push to registry
6. **Update Manifests** — patch image tags in `k8s/` YAMLs (sed or yq), commit back to repo
7. **ArgoCD Sync** — ArgoCD watches the repo; manifest commit triggers auto-sync

### ArgoCD
- One ArgoCD Application per service (`gameshop-backend`, `gameshop-frontend`).
- `k8s/backend/` and `k8s/frontend/` each contain: `Deployment`, `Service`, `ConfigMap`, `Ingress`.
- Sync policy: `automated` with `selfHeal: true` and `prune: true`.
- No Helm chart — plain Kubernetes YAML is fine for this demo.

---

## What You Must Never Do

- Add `useEffect` for data fetching.
- Return a bare `Entity` from a controller.
- Use `@Autowired` field injection — constructor injection only.
- Create a catch-all `Exception` handler that swallows the stack trace without logging it.
- Put more than one component in a frontend file.
- Create a refresh token endpoint or table.
- Use `any` in TypeScript.
- Invent a new pattern that contradicts this file — if you are unsure, ask.
