// Product types matching backend API
export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  badge?: 'new' | 'sale' | 'bestseller'
  description?: string
  fullDescription?: string
  inStock?: boolean
  rating?: number
  reviewCount?: number
  sizes?: string[]
  colors?: { name: string; value: string }[]
  materials?: string[]
  dimensions?: string
  care?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
}

export interface ProductFilters {
  category?: string
  badge?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  search?: string
  sortBy?: string
  page?: number
  limit?: number
}

// Cart types
export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  size?: string
  color?: string
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
}

export interface AddToCartPayload {
  productId: string
  quantity: number
  size?: string
  color?: string
}

export interface UpdateCartItemPayload {
  quantity: number
}

// Admin types
export interface CreateProductPayload {
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  badge?: 'new' | 'sale' | 'bestseller'
  description?: string
  fullDescription?: string
  inStock?: boolean
  sizes?: string[]
  colors?: { name: string; value: string }[]
  materials?: string[]
  dimensions?: string
  care?: string[]
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  message: string
  errors?: { path: string; message: string }[]
}
