export type Role = "ROLE_USER" | "ROLE_ADMIN";
export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  data?: Record<string, string> | null;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresInMs: number;
  userId: number;
  name: string;
  email: string;
  role: Role;
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductSummary {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string;
}

export interface Product extends ProductSummary {
  description: string | null;
  active: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ProductFilters {
  categoryId?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  ordersByStatus: Partial<Record<OrderStatus, number>>;
}

export interface ProductInput {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface SessionUser {
  userId: number;
  name: string;
  email: string;
  role: Role;
}

