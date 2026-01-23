import { useGet } from '@/hooks/useGet'
import { usePost } from '@/hooks/usePost'
import { usePostAction } from '@/hooks/usePostAction'
import type { Cart, AddToCartPayload, UpdateCartItemPayload } from '@/types/api'

// API endpoints
const CART_ENDPOINT = 'cart'

/**
 * Get the current cart
 */
export function useCart() {
  return useGet<Cart>({
    path: CART_ENDPOINT,
    options: {
      staleTime: 1000 * 60, // 1 minute
    },
  })
}

/**
 * Add item to cart
 */
export function useAddToCart() {
  return usePost<AddToCartPayload, Cart>({
    path: `${CART_ENDPOINT}/items`,
    method: 'post',
    successMessage: 'Produit ajouté au panier',
    errorMessage: "Erreur lors de l'ajout au panier",
  })
}

/**
 * Update cart item quantity
 */
export function useUpdateCartItem(itemId: string) {
  return usePost<UpdateCartItemPayload, Cart>({
    path: `${CART_ENDPOINT}/items/${itemId}`,
    method: 'put',
    successMessage: 'Panier mis à jour',
    errorMessage: 'Erreur lors de la mise à jour',
  })
}

/**
 * Remove item from cart
 */
export function useRemoveFromCart() {
  return usePostAction<Cart>()
}

/**
 * Clear entire cart
 */
export function useClearCart() {
  return usePost<void, Cart>({
    path: CART_ENDPOINT,
    method: 'delete',
    successMessage: 'Panier vidé',
    errorMessage: 'Erreur lors de la suppression',
  })
}
