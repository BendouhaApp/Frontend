import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { buildGetQueryKey, fetchGet, useGet } from '@/hooks/useGet'
import type { ApiResponse, Cart } from '@/types/api'
import { toCartQuantityMap } from '@/lib/cart'

export const useCart = () => {
  const query = useGet<ApiResponse<Cart>>({
    path: 'cart',
    options: {
      staleTime: 1000 * 60,
    },
  })

  const cart = query.data?.data
  const cartId = useMemo(() => cart?.id, [cart])

  return {
    ...query,
    cart,
    cartId,
  }
}

export const useCartId = () => {
  const cartId = useQuery<ApiResponse<Cart>, Error, string | undefined>({
    queryKey: buildGetQueryKey('cart'),
    queryFn: ({ signal }) =>
      fetchGet<ApiResponse<Cart>>({
        path: 'cart',
        signal,
      }),
    staleTime: 1000 * 60,
    select: (response) => response.data?.id,
  })

  return { cartId: cartId.data }
}

export const useCartProductQuantities = () => {
  const quantities = useQuery<ApiResponse<Cart>, Error, Record<string, number>>({
    queryKey: buildGetQueryKey('cart'),
    queryFn: ({ signal }) =>
      fetchGet<ApiResponse<Cart>>({
        path: 'cart',
        signal,
      }),
    staleTime: 1000 * 60,
    select: (response) => toCartQuantityMap(response.data),
  })

  return quantities.data ?? {}
}
