# GameShop Backend API

This document describes the API implemented by the Spring Boot backend in this directory.

## Quick reference

- Default base URL: `http://localhost:8080`
- API prefix: `/api`
- Request and response media type: `application/json`
- Authentication: stateless Bearer JWT; there is no refresh token
- Roles: `ROLE_USER` and `ROLE_ADMIN`
- Public routes: authentication, category reads, and product reads
- Protected routes return `401` without a valid JWT and `403` when the JWT's user lacks the required role

All examples below assume:

```bash
export API_URL=http://localhost:8080
```

## Response envelope

Every API response uses the same envelope:

```json
{
  "success": true,
  "message": "Products retrieved",
  "data": {}
}
```

- `success` is `true` for successful requests and `false` for errors.
- `message` is a human-readable result or error message.
- `data` contains the endpoint result. It is `null` for errors without field details and for successful operations that have no response body data, such as product deletion.

A request-body validation error is returned as `400 Bad Request`, with field names mapped to validation messages:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "name": "Name must be between 2 and 100 characters",
    "email": "Email must be valid",
    "password": "Password must be between 8 and 100 characters"
  }
}
```

Query-parameter validation has the same shape. Its keys include the controller method and parameter, for example `search.size`.

Other representative errors are:

```json
{
  "success": false,
  "message": "Product 99 was not found",
  "data": null
}
```

```json
{
  "success": false,
  "message": "Authentication is required",
  "data": null
}
```

```json
{
  "success": false,
  "message": "Access denied",
  "data": null
}
```

Common status codes:

| Status | Meaning |
|---|---|
| `200 OK` | Successful read, update, or delete |
| `201 Created` | Successful registration, category/product creation, or order placement |
| `400 Bad Request` | Validation failure, malformed JSON/invalid enum, duplicate category, invalid price range, invalid order, or insufficient stock |
| `401 Unauthorized` | Missing/invalid authentication or invalid login credentials |
| `403 Forbidden` | Authenticated user does not have the required role |
| `404 Not Found` | Product, category, or order does not exist; inactive products are also reported as not found by public detail and checkout routes |
| `409 Conflict` | Registration email already exists |
| `500 Internal Server Error` | Unexpected server error |

Malformed JSON and invalid enum values return the message `Request body is malformed or contains an invalid value`. Unexpected errors use `An unexpected error occurred` and do not expose internal details.

## Authentication and authorization

Registration and login return an `AuthResponse` in `data`:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresInMs": 86400000,
    "userId": 1,
    "name": "Ada Player",
    "email": "ada@example.com",
    "role": "ROLE_USER"
  }
}
```

Send `data.token` on protected requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

The JWT subject is the user's email and its `roles` claim contains the authority. Token lifetime is returned as `expiresInMs` and configured by `JWT_EXPIRATION_MS`. Expired, malformed, or incorrectly signed tokens are treated as unauthenticated. Because the API is stateless, signing out is a client-side operation: discard the token.

Authorization matrix:

| Access | Routes |
|---|---|
| Public | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/categories`, `GET /api/products`, `GET /api/products/{id}` |
| `ROLE_USER` or `ROLE_ADMIN` | `POST /api/orders`, `GET /api/orders/me` |
| `ROLE_ADMIN` only | category writes, product writes, all-order reads/status updates, dashboard |

## Authentication endpoints

### Register

`POST /api/auth/register` — public — returns `201 Created` with message `Registration successful`.

Request fields:

| Field | Type | Required | Validation |
|---|---|---:|---|
| `name` | string | yes | Not blank; 2–100 characters |
| `email` | string | yes | Not blank; valid email format |
| `password` | string | yes | Not blank; 8–100 characters |

New accounts always receive `ROLE_USER`. The stored name is trimmed; the stored email is trimmed and lowercased. Passwords are BCrypt hashes.

```bash
curl -i "$API_URL/api/auth/register" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Ada Player",
    "email": "ada@example.com",
    "password": "password123"
  }'
```

In addition to validation errors, an existing email returns `409 Conflict` and `An account with this email already exists`.

### Login

`POST /api/auth/login` — public — returns `200 OK` with message `Login successful`.

| Field | Type | Required | Validation |
|---|---|---:|---|
| `email` | string | yes | Not blank; valid email format |
| `password` | string | yes | Not blank |

```bash
curl -i "$API_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"ada@example.com","password":"password123"}'
```

Invalid credentials return `401 Unauthorized` and `Invalid email or password`.

## Category endpoints

Category responses have this shape:

```json
{
  "id": 1,
  "name": "Accessories"
}
```

### List categories

`GET /api/categories` — public — returns `200 OK` with message `Categories retrieved` and an array sorted alphabetically by name.

```bash
curl "$API_URL/api/categories"
```

Example `data`:

```json
[
  {"id": 5, "name": "Accessories"},
  {"id": 4, "name": "Controllers"}
]
```

### Create a category

`POST /api/categories` — admin — returns `201 Created` with message `Category created`.

| Field | Type | Required | Validation |
|---|---|---:|---|
| `name` | string | yes | Not blank; 2–100 characters |

The value is trimmed before storage. Category names must be unique ignoring case.

```bash
curl -i "$API_URL/api/categories" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"PC Gaming"}'
```

A case-insensitive duplicate returns `400 Bad Request` and `A category with this name already exists`.

### Rename a category

`PUT /api/categories/{id}` — admin — returns `200 OK` with message `Category renamed`.

The request body and uniqueness rules are identical to category creation.

```bash
curl -i -X PUT "$API_URL/api/categories/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"PlayStation Hardware"}'
```

An unknown ID returns `404 Not Found` and `Category {id} was not found`. A duplicate name returns `400 Bad Request`.

## Product endpoints

### Search and list products

`GET /api/products` — public — returns `200 OK` with message `Products retrieved`.

Only active products are returned. Filters are combined with AND logic, the keyword is a case-insensitive substring match against product names, and blank keywords are ignored. Results are sorted by `createdAt` descending.

| Query parameter | Type | Default | Validation/behavior |
|---|---|---:|---|
| `categoryId` | integer (`Long`) | none | Exact category ID filter |
| `keyword` | string | none | Trimmed, case-insensitive name substring |
| `minPrice` | decimal | none | Must be at least `0.0`; inclusive |
| `maxPrice` | decimal | none | Must be at least `0.0`; inclusive |
| `page` | integer | `0` | Zero-based; must be at least `0` |
| `size` | integer | `20` | Must be between `1` and `100` |

If both prices are supplied, `minPrice` cannot exceed `maxPrice`; otherwise the API returns `400 Bad Request` and `Minimum price cannot exceed maximum price`.

```bash
curl "$API_URL/api/products?categoryId=1&keyword=console&minPrice=100&maxPrice=800&page=0&size=12"
```

The list uses the summary representation (it intentionally omits `description` and `active`):

```json
{
  "success": true,
  "message": "Products retrieved",
  "data": {
    "content": [
      {
        "id": 10,
        "name": "PlayStation 5 Console",
        "price": 499.99,
        "stock": 8,
        "imageUrl": "https://example.com/ps5.png",
        "categoryId": 1,
        "categoryName": "PlayStation"
      }
    ],
    "page": 0,
    "size": 12,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

### Get product detail

`GET /api/products/{id}` — public — returns `200 OK` with message `Product retrieved`.

```bash
curl "$API_URL/api/products/10"
```

Example `data`:

```json
{
  "id": 10,
  "name": "PlayStation 5 Console",
  "description": "Disc edition console",
  "price": 499.99,
  "stock": 8,
  "imageUrl": "https://example.com/ps5.png",
  "active": true,
  "categoryId": 1,
  "categoryName": "PlayStation"
}
```

An unknown or inactive product returns `404 Not Found` and `Product {id} was not found`.

### Product write body

Create and update accept the same body:

| Field | Type | Required | Validation |
|---|---|---:|---|
| `categoryId` | integer (`Long`) | yes | Positive |
| `name` | string | yes | Not blank; 2–200 characters |
| `description` | string or `null` | no | At most 10,000 characters |
| `price` | decimal | yes | At least `0.01`; at most 8 integer and 2 fractional digits |
| `stock` | integer | yes | At least `0` |
| `imageUrl` | string or `null` | no | At most 500 characters |

The name is trimmed before storage. The API does not perform URL-format validation on `imageUrl`.

### Create a product

`POST /api/products` — admin — returns `201 Created` with message `Product created` and the full product representation.

```bash
curl -i "$API_URL/api/products" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "categoryId": 1,
    "name": "PlayStation 5 Console",
    "description": "Disc edition console",
    "price": 499.99,
    "stock": 8,
    "imageUrl": "https://example.com/ps5.png"
  }'
```

An unknown category returns `404 Not Found` and `Category {id} was not found`.

### Update a product

`PUT /api/products/{id}` — admin — returns `200 OK` with message `Product updated` and the full product representation.

This is a full replacement of the writable product fields, so all required fields must be supplied. It does not reactivate a soft-deleted product.

```bash
curl -i -X PUT "$API_URL/api/products/10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "categoryId": 1,
    "name": "PlayStation 5 Slim",
    "description": "Updated model",
    "price": 449.99,
    "stock": 12,
    "imageUrl": null
  }'
```

An unknown product or category returns `404 Not Found`.

### Soft-delete a product

`DELETE /api/products/{id}` — admin — returns `200 OK` with message `Product deleted` and `data: null`.

```bash
curl -i -X DELETE "$API_URL/api/products/10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Deletion sets `active` to `false`; it does not remove the database row. The product then disappears from catalog search/detail and cannot be ordered. An unknown product returns `404 Not Found`.

## Order endpoints

Order status values are exactly `PENDING`, `CONFIRMED`, and `CANCELLED`.

An order response has this shape:

```json
{
  "id": 42,
  "userId": 1,
  "userName": "Ada Player",
  "userEmail": "ada@example.com",
  "status": "PENDING",
  "total": 109.98,
  "createdAt": "2026-09-09T10:15:30.123Z",
  "items": [
    {
      "productId": 7,
      "productName": "Wireless Controller",
      "quantity": 2,
      "unitPrice": 54.99,
      "subtotal": 109.98
    }
  ]
}
```

`total`, `unitPrice`, and `subtotal` are decimal JSON numbers. `createdAt` is a UTC ISO-8601 instant.

### Place an order

`POST /api/orders` — user or admin — returns `201 Created` with message `Order placed`.

| Field | Type | Required | Validation |
|---|---|---:|---|
| `items` | array | yes | Must contain at least one item |
| `items[].productId` | integer (`Long`) | yes | Positive |
| `items[].quantity` | integer | yes | At least `1` |

```bash
curl -i "$API_URL/api/orders" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "items": [
      {"productId": 7, "quantity": 2},
      {"productId": 11, "quantity": 1}
    ]
  }'
```

Important checkout behavior:

- Repeated entries for the same product are merged and their quantities are added before stock is checked.
- Prices are read from the server at checkout; the request cannot provide a price.
- Each product must exist, be active, and have enough stock for the merged quantity.
- Stock deduction and order creation occur in one transaction. If any item fails, no order is saved and all stock deductions are rolled back.
- A successful new order starts as `PENDING`.

An unknown/inactive product returns `404 Not Found`. Insufficient stock returns `400 Bad Request`, for example `Insufficient stock for Wireless Controller: requested 3, available 2`.

### Get the current user's orders

`GET /api/orders/me` — user or admin — returns `200 OK` with message `Orders retrieved` and an array of only the authenticated user's orders.

```bash
curl "$API_URL/api/orders/me" \
  -H "Authorization: Bearer $USER_TOKEN"
```

Orders are sorted newest first; items within each order retain database item order.

### Get all orders

`GET /api/orders` — admin — returns `200 OK` with message `Orders retrieved` and an array containing all users' orders, newest first.

```bash
curl "$API_URL/api/orders" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

This endpoint is not paginated.

### Update order status

`PATCH /api/orders/{id}/status` — admin — returns `200 OK` with message `Order status updated` and the updated order.

| Field | Type | Required | Validation |
|---|---|---:|---|
| `status` | string enum | yes | `PENDING`, `CONFIRMED`, or `CANCELLED` |

```bash
curl -i -X PATCH "$API_URL/api/orders/42/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"CONFIRMED"}'
```

An unknown order returns `404 Not Found` and `Order {id} was not found`. A missing status is a validation error; an unrecognized or differently cased status makes the request body invalid and returns `400 Bad Request`.

## Admin dashboard

`GET /api/admin/dashboard` — admin — returns `200 OK` with message `Dashboard statistics retrieved`.

```bash
curl "$API_URL/api/admin/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Example `data`:

```json
{
  "totalProducts": 24,
  "totalOrders": 9,
  "ordersByStatus": {
    "PENDING": 3,
    "CONFIRMED": 5,
    "CANCELLED": 1
  }
}
```

`totalProducts` counts active products only. `totalOrders` counts every order. `ordersByStatus` always contains all three status keys, using `0` when no orders have a status.

## Configuration

The application reads these environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/gameshop` | JDBC database URL |
| `DB_USERNAME` | `gameshop` | Database username |
| `DB_PASSWORD` | `gameshop` | Database password |
| `JWT_SECRET` | `change-this-demo-secret-to-at-least-32-bytes` | HMAC signing secret; use a private value of at least 32 bytes |
| `JWT_EXPIRATION_MS` | `86400000` | JWT lifetime in milliseconds (default: 24 hours) |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | The single allowed CORS origin |
| `ADMIN_EMAIL` | empty | Optional bootstrap administrator email |
| `ADMIN_PASSWORD` | empty | Optional bootstrap administrator password |
| `ADMIN_NAME` | `Administrator` | Bootstrap administrator display name |

CORS permits credentials, the `Authorization` and `Content-Type` request headers, and `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS` methods from the configured frontend origin. Hibernate schema management is `ddl-auto: update`, Open EntityManager in View is disabled, and Hibernate JDBC timestamps use UTC.

### Bootstrap data

At application startup:

- If the category table is empty, exactly these categories are inserted: `PlayStation`, `Xbox`, `Game Discs`, `Controllers`, and `Accessories`. If any category already exists, the bootstrap does not add missing defaults.
- An administrator is created only when both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are nonblank and no user exists with that email (case-insensitive). The email is trimmed and lowercased and the password is BCrypt-hashed. Existing users are never promoted or overwritten.

## Run locally

Prerequisites are Java 21 and PostgreSQL. Create a PostgreSQL database and user matching the defaults, or override the three `DB_*` variables. From the repository root:

```bash
cd backend
./gradlew bootRun
```

One explicit configuration example is:

```bash
cd backend
DB_URL='jdbc:postgresql://localhost:5432/gameshop' \
DB_USERNAME='gameshop' \
DB_PASSWORD='gameshop' \
JWT_SECRET='replace-with-a-private-secret-of-at-least-32-bytes' \
FRONTEND_ORIGIN='http://localhost:3000' \
ADMIN_EMAIL='admin@example.com' \
ADMIN_PASSWORD='change-me-now' \
./gradlew bootRun
```

The application uses Spring Boot's default port `8080` because no custom server port is configured.

## Run tests and build

Integration tests use an in-memory H2 database in PostgreSQL compatibility mode, so PostgreSQL is not required to run them:

```bash
cd backend
./gradlew test
```

Build the executable application artifact with:

```bash
cd backend
./gradlew build
```

