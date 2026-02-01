// =========================
// Common API Response Types
// =========================

export interface ApiResponse<T> {
  message: string
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

export type AdminAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'CONFIRM' | 'CANCEL'
export type AdminEntity = 'PRODUCT' | 'CATEGORY' | 'ORDER'

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
  id: number
  name: string
  slug: string
  description?: string
  is_active: boolean
  parent_id?: number
  created_at: string
  updated_at: string
  parent?: Category
  children?: Category[]
  products?: Product[]
}

export interface CreateCategoryPayload {
  name: string
  description?: string
  parent_id?: number
  is_active?: boolean
}

export interface UpdateCategoryPayload {
  name?: string
  description?: string
  parent_id?: number
  is_active?: boolean
}

// =========================
// Product Types
// =========================

export interface Product {
  id: number
  name: string
  slug: string
  description?: string
  sku: string
  price: number | string
  stock: number
  is_active: boolean
  is_featured: boolean
  category_id?: number
  created_at: string
  image_url?: string
  category?: Category
}

export interface ProductsResponse {
  message: string
  data: Product[]
}

export interface ProductResponse {
  message: string
  data: Product
}

export interface CreateProductPayload {
  name: string
  slug: string
  sku: string
  price: number
  image_url?: string
}

export interface UpdateProductPayload {
  name?: string
  slug?: string
  sku?: string
  price?: number
  image_url?: string
}

// =========================
// Cart Types
// =========================

export interface CartItem {
  id: number
  cart_id: number
  product_id: number
  quantity: number
  unit_price: number | string
  total_price: number | string
  product?: Product
}

export interface Cart {
  id: number
  user_id?: number
  created_at: string
  updated_at: string
  items: CartItem[]
}

export interface AddToCartPayload {
  product_id: number
  quantity: number
}

export interface UpdateCartItemPayload {
  product_id?: number
  quantity?: number
}

// =========================
// Order Types
// =========================

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export interface OrderItem {
  id: number
  order_id: number
  product_id?: number
  product_name: string
  product_sku?: string
  quantity: number
  unit_price: number | string
  total_price: number | string
  product?: Product
}

export interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_phone: string
  customer_wilaya: string
  total_amount: number | string
  status: OrderStatus
  created_by?: number
  created_at: string
  admin?: Admin
  items: OrderItem[]
}

export interface CreateOrderPayload {
  customer_name: string
  customer_phone: string
  customer_wilaya: string
  status?: string
}

export interface UpdateOrderPayload {
  status?: OrderStatus
}

export interface CreateOrderItemPayload {
  order_id: number
  product_id?: number
  quantity: number
  unit_price: number
  product_name: string
  product_sku?: string
}

export interface UpdateOrderItemPayload {
  product_id?: number
  quantity?: number
  unit_price?: number
  product_name?: string
  product_sku?: string
}
