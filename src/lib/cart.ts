import type { CartItem } from '@/types/api'
import { resolveMediaUrl } from '@/lib/media'

export type CartItemView = {
  id: string
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  color?: string
  size?: string
}

export const mapCartItems = (items: CartItem[]): CartItemView[] => {
  return items.map((item) => {
    const product = item.product ?? null
    const fallback = (item.products ?? {}) as Record<string, any>

    const priceRaw =
      product?.price ??
      (fallback.sale_price != null ? Number(fallback.sale_price) : 0)

    const image = resolveMediaUrl(
      product?.image ||
        product?.thumbnail ||
        fallback.image ||
        fallback.thumbnail,
    )

    return {
      id: item.id,
      productId:
        product?.id ||
        String(fallback.id ?? item.product_id ?? ''),
      name: product?.name || fallback.product_name || 'Product',
      image,
      price: Number(priceRaw) || 0,
      quantity: item.quantity ?? 1,
      color: fallback.color,
      size: fallback.size,
    }
  })
}

export const calcSubtotal = (items: CartItemView[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
