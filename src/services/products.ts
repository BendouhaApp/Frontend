import { useGet } from '@/hooks/useGet'
import { usePost } from '@/hooks/usePost'
import { usePostAction } from '@/hooks/usePostAction'
import type {
  Product,
  ProductsResponse,
  ProductFilters,
  CreateProductPayload,
} from '@/types/api'

// API endpoints
const PRODUCTS_ENDPOINT = 'products'

/**
 * Get all products with optional filters
 */
export function useProducts(filters?: ProductFilters) {
  const query: Record<string, string | number | boolean> = {}
  
  if (filters?.category) query.category = filters.category
  if (filters?.badge) query.badge = filters.badge
  if (filters?.minPrice) query.minPrice = filters.minPrice
  if (filters?.maxPrice) query.maxPrice = filters.maxPrice
  if (filters?.inStock !== undefined) query.inStock = filters.inStock
  if (filters?.search) query.search = filters.search
  if (filters?.sortBy) query.sortBy = filters.sortBy
  if (filters?.page) query.page = filters.page
  if (filters?.limit) query.limit = filters.limit

  return useGet<ProductsResponse>({
    path: PRODUCTS_ENDPOINT,
    query: Object.keys(query).length > 0 ? query : undefined,
    options: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  })
}

/**
 * Get a single product by ID
 */
export function useProduct(id: string | undefined) {
  return useGet<Product>({
    path: `${PRODUCTS_ENDPOINT}/${id}`,
    options: {
      enabled: !!id,
      staleTime: 1000 * 60 * 5,
    },
  })
}

/**
 * Get featured products
 */
export function useFeaturedProducts(count = 4) {
  return useGet<Product[]>({
    path: `${PRODUCTS_ENDPOINT}/featured`,
    query: { count },
    options: {
      staleTime: 1000 * 60 * 5,
    },
  })
}

/**
 * Get products by category
 */
export function useProductsByCategory(category: string) {
  return useProducts({ category })
}

/**
 * Create a new product (Admin)
 */
export function useCreateProduct() {
  return usePost<CreateProductPayload, Product>({
    path: PRODUCTS_ENDPOINT,
    method: 'post',
    successMessage: 'Produit créé avec succès',
    errorMessage: 'Erreur lors de la création du produit',
  })
}

/**
 * Update a product (Admin)
 */
export function useUpdateProduct(id: string) {
  return usePost<Partial<CreateProductPayload>, Product>({
    path: `${PRODUCTS_ENDPOINT}/${id}`,
    method: 'put',
    successMessage: 'Produit mis à jour avec succès',
    errorMessage: 'Erreur lors de la mise à jour du produit',
  })
}

/**
 * Delete a product (Admin)
 */
export function useDeleteProduct() {
  return usePostAction<{ success: boolean }>({
    onSuccess: () => {
      // Toast is handled by usePostAction
    },
  })
}
