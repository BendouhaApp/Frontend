import { useMemo } from 'react'
import { useGet } from '@/hooks/useGet'
import type { ApiResponse, Cart } from '@/types/api'

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
