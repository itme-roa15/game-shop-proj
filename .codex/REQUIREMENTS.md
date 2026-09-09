# Requirements — GameShop

## 1. Project Overview

GameShop is a demo e-commerce application for a gaming hardware and software retailer selling PlayStation consoles, Xbox consoles, game discs, controllers, and accessories. It demonstrates a production-grade fullstack architecture with a Spring Boot API, a Next.js storefront, and a GitOps deployment pipeline via Jenkins and ArgoCD.

---

## 2. Scope

| In scope | Out of scope |
|---|---|
| Product browsing and search | Payment processing (real) |
| User registration and login | Email notifications |
| Cart and order placement | Inventory management |
| Admin product/category CRUD | Multi-tenancy |
| JWT authentication (no refresh) | Social OAuth providers |
| Jenkins + ArgoCD deploy pipeline | Mobile native apps |

---

## 3. Functional Requirements

### 3.1 Authentication

| ID | Requirement |
|---|---|
| AUTH-01 | Users can register with name, email, and password. |
| AUTH-02 | Users can log in with email and password. |
| AUTH-03 | The API returns a signed JWT on successful login or registration. |
| AUTH-04 | No refresh token is issued. JWT expiry is configurable via `app.jwt.expiration-ms`. |
| AUTH-05 | Protected endpoints return `401` when the token is missing or invalid, `403` when the role is insufficient. |
| AUTH-06 | Roles: `ROLE_USER` (default) and `ROLE_ADMIN`. |

### 3.2 Product Catalog

| ID | Requirement |
|---|---|
| PRD-01 | Products belong to exactly one category. |
| PRD-02 | A product has: name, description, price, stock quantity, image URL, and active flag. |
| PRD-03 | Any visitor (unauthenticated) can browse and search products. |
| PRD-04 | Search filters: category, name keyword, min/max price. |
| PRD-05 | Product list endpoint returns paginated `ProductSummary` projections (no full description). |
| PRD-06 | Product detail endpoint returns the full `ProductResponse`. |
| PRD-07 | Admin can create, update, and soft-delete (set `active = false`) products. |

### 3.3 Category

| ID | Requirement |
|---|---|
| CAT-01 | Categories: PlayStation, Xbox, Game Discs, Controllers, Accessories. |
| CAT-02 | Admin can create and rename categories. |
| CAT-03 | Category list is public. |

### 3.4 Cart

| ID | Requirement |
|---|---|
| CART-01 | Cart lives in Zustand (client-only). It is not persisted to the database. |
| CART-02 | Users can add, update quantity, and remove items. |
| CART-03 | Cart validates stock availability at checkout time only. |

### 3.5 Orders

| ID | Requirement |
|---|---|
| ORD-01 | Authenticated users can place an order from their cart. |
| ORD-02 | Placing an order deducts stock from each product. If any item is out of stock the entire order is rejected with a descriptive error. |
| ORD-03 | Order statuses: `PENDING`, `CONFIRMED`, `CANCELLED`. |
| ORD-04 | Users can view their own order history. |
| ORD-05 | Admin can view all orders and update order status. |

### 3.6 Admin Dashboard

| ID | Requirement |
|---|---|
| ADM-01 | Accessible only to `ROLE_ADMIN`. |
| ADM-02 | Displays: total products, total orders, orders by status. |
| ADM-03 | Admin can manage products and categories from the dashboard. |

---

## 4. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | All API responses use the `ApiResponse<T>` wrapper. |
| NFR-02 | Validation errors return `400` with a map of field → message inside `ApiResponse`. |
| NFR-03 | The backend is stateless; no HTTP sessions. |
| NFR-04 | CORS is configured to allow the frontend origin only. |
| NFR-05 | Passwords are stored as bcrypt hashes. |
| NFR-06 | Every page renders under 3 s on a 3G throttle (Lighthouse target). |
| NFR-07 | The frontend handles loading and error states for every SWR hook. |

---

## 5. Database Schema (Minimum)

```
users
  id            BIGINT PK
  name          VARCHAR(100) NOT NULL
  email         VARCHAR(150) NOT NULL UNIQUE
  password_hash VARCHAR(255) NOT NULL
  role          VARCHAR(20)  NOT NULL DEFAULT 'ROLE_USER'
  created_at    TIMESTAMP

categories
  id   BIGINT PK
  name VARCHAR(100) NOT NULL UNIQUE

products
  id          BIGINT PK
  category_id BIGINT FK → categories.id
  name        VARCHAR(200) NOT NULL
  description TEXT
  price       NUMERIC(10,2) NOT NULL
  stock       INT NOT NULL DEFAULT 0
  image_url   VARCHAR(500)
  active      BOOLEAN NOT NULL DEFAULT TRUE
  created_at  TIMESTAMP

orders
  id         BIGINT PK
  user_id    BIGINT FK → users.id
  status     VARCHAR(20) NOT NULL DEFAULT 'PENDING'
  total      NUMERIC(10,2) NOT NULL
  created_at TIMESTAMP

order_items
  id         BIGINT PK
  order_id   BIGINT FK → orders.id
  product_id BIGINT FK → products.id
  quantity   INT NOT NULL
  unit_price NUMERIC(10,2) NOT NULL
```

---

## 6. API Surface

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |

### Categories
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | Public | List all categories |
| POST | `/api/categories` | Admin | Create category |

### Products
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | Public | Paginated list with filters |
| GET | `/api/products/{id}` | Public | Product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/{id}` | Admin | Update product |
| DELETE | `/api/products/{id}` | Admin | Soft-delete product |

### Orders
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | User | Place order |
| GET | `/api/orders/me` | User | Own order history |
| GET | `/api/orders` | Admin | All orders |
| PATCH | `/api/orders/{id}/status` | Admin | Update order status |

---

## 7. Validation Rules

| Field | Rule |
|---|---|
| `name` (user) | Not blank, 2–100 chars |
| `email` | Not blank, valid email format |
| `password` | Not blank, min 8 chars |
| `product.name` | Not blank, 2–200 chars |
| `product.price` | Not null, > 0 |
| `product.stock` | Not null, >= 0 |
| `order.items` | Not empty list |
| `orderItem.quantity` | Min 1 |

---

## 8. Deployment Requirements

### Jenkins Pipeline
- Triggered on push to `main`.
- Builds and pushes Docker images tagged with the Git commit SHA.
- Patches image tags in `k8s/` manifests and commits the change.

### ArgoCD
- Two Applications: `gameshop-backend` and `gameshop-frontend`.
- Source: same Git repository, paths `k8s/backend/` and `k8s/frontend/`.
- Automated sync with self-heal and prune enabled.
- Created via the ArgoCD UI (no CLI required for initial setup).

### Kubernetes Manifests (per service)
- `Deployment` — 1 replica for demo, image pulled from registry
- `Service` — ClusterIP
- `Ingress` — host-based routing
- `ConfigMap` — non-secret env vars (DB host, API base URL)
- Secrets managed outside Git (created manually in the cluster)

---

## 9. Acceptance Criteria

- A visitor can browse products without logging in.
- A registered user can log in, add items to cart, and place an order.
- An admin can create a product and see it appear in the storefront.
- The Jenkins pipeline completes all stages and ArgoCD reflects the new image within 2 minutes of a push to `main`.
- All API error responses follow the `ApiResponse` structure with a meaningful `message`.
