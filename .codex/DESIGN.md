# Design System — GameShop

Reference: https://dribbble.com/shots/20455607-Game-store-Upgrader

---

## 1. Design Direction

**Aesthetic:** Dark gaming retail. Deep near-black backgrounds, high-contrast accent lighting, sharp typography. Feels like walking into a well-lit specialty game store at night — serious, knowledgeable, premium without being pretentious.

**Audience:** Gamers aged 16–35 who know exactly what they want and want to find it fast.

**Primary job of the UI:** Surface product fast. The storefront exists to get the right product into the cart with as little friction as possible.

---

## 2. Color Tokens

```css
/* globals.css — CSS custom properties */

/* Base */
--color-bg:          #0D0D12;   /* page background — near-black, slight blue shift */
--color-surface:     #16161E;   /* cards, panels */
--color-surface-2:   #1F1F2E;   /* elevated surfaces, modals */
--color-border:      #2A2A3D;   /* dividers, input borders */

/* Accent — electric violet-blue, the "glow" */
--color-accent:      #6C63FF;
--color-accent-dim:  #4A44C0;
--color-accent-glow: rgba(108, 99, 255, 0.20);

/* Semantic */
--color-success:     #22C55E;
--color-danger:      #EF4444;
--color-warning:     #F59E0B;

/* Text */
--color-text-primary:   #F0F0F8;
--color-text-secondary: #9090A8;
--color-text-muted:     #5A5A72;
```

**Tailwind mapping** (`tailwind.config.ts`):
```ts
colors: {
  bg:          'var(--color-bg)',
  surface:     'var(--color-surface)',
  'surface-2': 'var(--color-surface-2)',
  border:      'var(--color-border)',
  accent:      'var(--color-accent)',
  'accent-dim':'var(--color-accent-dim)',
  'text-primary':   'var(--color-text-primary)',
  'text-secondary': 'var(--color-text-secondary)',
  'text-muted':     'var(--color-text-muted)',
}
```

---

## 3. Typography

**Display / Headings:** `Space Grotesk` (Google Fonts) — geometric, technical, slightly condensed at large sizes.

**Body / UI:** `Inter` — the standard, but the pairing with Space Grotesk creates a clear hierarchy. Do not use a monospace face for labels.

**Scale (rem, assuming 16px base):**

| Token | Size | Weight | Tracking | Usage |
|---|---|---|---|---|
| `text-hero` | 3.5rem | 700 | -0.03em | Hero headline |
| `text-h1` | 2.25rem | 700 | -0.02em | Page titles |
| `text-h2` | 1.5rem | 600 | -0.01em | Section headers |
| `text-h3` | 1.125rem | 600 | 0 | Card titles |
| `text-body` | 1rem | 400 | 0 | Body copy |
| `text-sm` | 0.875rem | 400 | 0 | Meta, captions |
| `text-xs` | 0.75rem | 500 | 0.02em | Labels, badges |

No ALL-CAPS labels. No mid-sentence accent words. Sentence case throughout.

---

## 4. Component Tokens

```css
/* Radius */
--radius-sm:  6px;
--radius-md:  10px;
--radius-lg:  16px;
--radius-pill: 999px;

/* Shadow / Glow */
--shadow-card:   0 4px 24px rgba(0,0,0,0.40);
--glow-accent:   0 0 20px var(--color-accent-glow);

/* Transition */
--transition-fast:   150ms ease;
--transition-normal: 250ms ease;
```

---

## 5. Layout

**Max content width:** 1280px, centered, `px-4 md:px-8 lg:px-12`.

**Grid:**
- Product grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`, gap `1.5rem`
- Admin dashboard: sidebar (240px fixed) + main content area

**Breakpoints:** Tailwind defaults (`sm: 640`, `md: 768`, `lg: 1024`, `xl: 1280`)

### Page Wireframes (ASCII)

#### Storefront — Home
```
┌──────────────────────────────────────────────┐
│  NAVBAR  [Logo]   [Categories ▾]  [🔍] [🛒] [Login] │
├──────────────────────────────────────────────┤
│                                              │
│   ┌──────────────────────────────────┐       │
│   │  HERO — featured product / promo │       │
│   │  Large product image, headline,  │       │
│   │  price, "Add to Cart" CTA        │       │
│   └──────────────────────────────────┘       │
│                                              │
│  [PlayStation]  [Xbox]  [Game Discs]  [More] │  ← Category pill tabs
│                                              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                │
│  │ P  │ │ P  │ │ P  │ │ P  │                │  ← ProductCard grid
│  └────┘ └────┘ └────┘ └────┘                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                │
│  │ P  │ │ P  │ │ P  │ │ P  │                │
│  └────┘ └────┘ └────┘ └────┘                │
│                                              │
│  [Load more]                                 │
└──────────────────────────────────────────────┘
```

#### ProductCard
```
┌───────────────────┐
│  ░░░░░░░░░░░░░░░  │  ← Product image (aspect-ratio: 4/3, object-cover)
│  ░░  image   ░░░  │
│  ░░░░░░░░░░░░░░░  │
├───────────────────┤
│ Category badge    │
│ Product Name      │  ← text-h3
│ $59.99            │  ← accent color
│ [Add to Cart]     │  ← full-width button
└───────────────────┘
```
Card background: `--color-surface`. Hover: border becomes `--color-accent`, subtle glow shadow.

#### Navbar
```
[◈ GameShop]   [PlayStation] [Xbox] [Game Discs] [Controllers]   [🔍]  [🛒 2]  [Avatar ▾]
```
Sticky, `bg-surface/80 backdrop-blur-md`. Bottom border: `1px solid var(--color-border)`.

#### Cart Drawer (slides from right)
```
┌────────────────┐
│ Cart        ✕  │
│────────────────│
│ [img] Name     │
│       $59.99   │
│       [−] 1 [+]│
│────────────────│
│ [img] Name     │
│       $39.99   │
│       [−] 2 [+]│
│────────────────│
│ Subtotal $139  │
│ [Checkout]     │
└────────────────┘
```

#### Admin Dashboard
```
┌────────┬───────────────────────────────────┐
│        │  Dashboard                         │
│ ◈ Logo │  ┌──────┐ ┌──────┐ ┌──────┐      │
│        │  │ 124  │ │  38  │ │  12  │      │
│ Dashboard│ │Prods │ │Orders│ │Pndng │      │
│ Products│  └──────┘ └──────┘ └──────┘      │
│ Orders │                                    │
│ Categry│  [ Product table with actions ]    │
│        │                                    │
│ Logout │                                    │
└────────┴───────────────────────────────────┘
```

---

## 6. Key Components

### Navbar (`components/layout/Navbar.tsx`)
- Logo left, category links center (hidden on mobile → hamburger), icons right.
- Cart icon shows item count badge (accent bg).
- Avatar dropdown: My Orders / Logout (or Login / Register if unauthenticated).

### ProductCard (`components/product/ProductCard.tsx`)
- Server Component where possible (if used in a grid on a Server page).
- Image via `next/image`, `fill` mode inside a `relative` container.
- Category badge: `text-xs`, rounded-pill, surface-2 background.
- "Add to Cart" calls Zustand `addItem()` — no page navigation.

### CartDrawer (`components/cart/CartDrawer.tsx`)
- shadcn `Sheet` component, side="right".
- Driven entirely by Zustand cart store.
- "Checkout" button calls `POST /api/orders` then clears cart on success.

### LoginForm / RegisterForm (`components/auth/`)
- shadcn `Form` with react-hook-form + zod.
- On success calls NextAuth `signIn("credentials", ...)`.
- No `useEffect`.

### EmptyState (`components/shared/EmptyState.tsx`)
- Reusable. Props: `icon`, `title`, `description`, optional `action` button.

---

## 7. Motion

One rule: **motion answers user action, never plays unprompted.**

- Cart drawer open/close: shadcn Sheet default slide.
- Cart badge count update: brief `scale(1.2)` pulse (150ms) via Tailwind `animate-ping` variant — only on increment.
- Page transitions: none (default Next.js behavior).
- Loading skeletons: shadcn `Skeleton` on product grid while SWR fetches.

No scroll-triggered animations. No section fade-ins.

---

## 8. shadcn Components Used

| Component | Usage |
|---|---|
| `Button` | All interactive buttons |
| `Sheet` | Cart drawer |
| `Dialog` | Confirm dialogs (delete product, cancel order) |
| `Form` | Login, register, product create/edit |
| `Input` | All text inputs |
| `Select` | Category filter, status update |
| `Badge` | Category tag on product card, order status |
| `Skeleton` | Loading states |
| `Table` | Admin orders and products list |
| `Toast` | Success/error feedback |
| `Avatar` | User menu |
| `DropdownMenu` | User menu dropdown |

All shadcn components are installed via `npx shadcn@latest add <component>`. Do not reimplement them.

---

## 9. Responsive Behaviour

| Screen | Product grid | Navbar |
|---|---|---|
| < 640px | 2 columns | Logo + Cart + Hamburger |
| 640–1023px | 3 columns | Logo + Icons + Hamburger |
| ≥ 1024px | 4 columns | Full navbar |

Cart drawer: full-width on mobile (`w-full`), 400px on desktop (`w-[400px]`).

---

## 10. Accessibility Baseline

- All interactive elements have visible focus ring (`ring-2 ring-accent ring-offset-2 ring-offset-bg`).
- Images have descriptive `alt` text.
- Color is never the sole differentiator (badge text + background both change for status).
- `prefers-reduced-motion` respected — wrap any animation in `@media (prefers-reduced-motion: no-preference)`.
