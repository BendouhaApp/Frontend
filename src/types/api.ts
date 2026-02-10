// =========================
// Common API Response Types
// =========================

export interface ApiResponse<T> {
  message?: string
  data: T
}

export interface ApiError {
  message: string
  statusCode?: number
  errors?: { path: string; message: string }[]
}

// =========================
// Admin Types
// =========================

export interface Admin {
  id: number
  username: string
  is_active: boolean
  created_at: string
}

export interface UpdateAdminPayload {
  username?: string
  password?: string
  is_active?: boolean
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expiresIn: number
}

// =========================
// Admin Log Types
// =========================

export type AdminAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'CONFIRM'
  | 'CANCEL'
  | 'LOGIN'

export type AdminEntity =
  | 'PRODUCT'
  | 'CATEGORY'
  | 'ORDER'
  | 'COUPON'
  | 'SHIPPING'
  | 'USER'
  | 'ADMIN'

export interface AdminLog {
  id: number
  admin_id: number
  action: AdminAction
  entity: AdminEntity
  entity_id: number
  description?: string
  metadata?: Record<string, unknown>
  created_at: string
  admin?: {
    id: number
    username: string
  }
}

// =========================
// Category Types
// =========================

export interface Category {
  id: string
  category_name: string
  category_description?: string | null
  parent_id?: string | null
  image?: string | null
  active?: boolean | null
  other_categories?: Category[]
}

export interface CategorySummary {
  id: string
  category_name: string
  parent_id?: string | null
  image?: string | null
}

// =========================
// Product Types
// =========================

export interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number | null
  category: string
  categories?: CategorySummary[]
  description?: string
  fullDescription?: string
  image: string
  thumbnail?: string | null
  images?: string[]
  gallery?: string[]
  inStock?: boolean
  quantity?: number
  rating?: number | null
  reviewCount?: number | null
  badge?: string | null
  sizes?: string[] | null
  colors?: { name: string; value: string }[] | null
  materials?: string[] | null
  dimensions?: string | null
  care?: string[] | null
  cct?: number | null
  lumen?: number | null
  cri?: number | null
  power?: number | null
  angle?: number | null
}

export interface ProductsResponse {
  message?: string
  data: Product[]
}

export interface ProductResponse {
  message?: string
  data: Product
}

// =========================
// Cart Types
// =========================

export interface CartItem {
  id: string
  card_id?: string | null
  product_id?: string | null
  quantity: number
  product?: Product | null
  // Raw backend product payload (if needed)
  products?: Record<string, unknown>
}

export interface Cart {
  id: string
  customer_id?: string | null
  card_items: CartItem[]
}

export interface AddToCartPayload {
  product_id: string
  quantity: number
}

export interface UpdateCartItemPayload {
  quantity?: number
}

// =========================
// Wilaya / Shipping Types
// =========================

export interface Wilaya {
  id: number
  name: string
  display_name: string
  active: boolean
  free_shipping: boolean
  home_delivery_enabled?: boolean
  home_delivery_price?: number
  office_delivery_enabled?: boolean
  office_delivery_price?: number
}

// =========================
// Order Types
// =========================

export interface OrderItem {
  id: string
  product_id?: string | null
  quantity: number
  price: number | string
}

export interface Order {
  id: string
  customer_phone?: string | null
  customer_wilaya?: string | null
  delivery_type?: string | null
  shipping_zone_id?: number | null
  shipping_price?: number | string | null
  total_price?: number | string | null
  created_at: string
  order_items: OrderItem[]
}

export interface CreateOrderPayload {
  customer_phone: string
  wilaya_id: number
  delivery_type?: 'home' | 'office'
  customer_id?: string
  coupon_id?: string
  order_status_id?: string
}
