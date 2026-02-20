import type { ApiResponse, Cart, CartItem } from '@/types/api'
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
    const fallback = (item.products ?? {}) as Record<string, unknown>
    const fallbackId = fallback.id
    const fallbackProductName =
      typeof fallback.product_name === 'string' ? fallback.product_name : undefined
    const fallbackImage =
      typeof fallback.image === 'string' ? fallback.image : undefined
    const fallbackThumbnail =
      typeof fallback.thumbnail === 'string' ? fallback.thumbnail : undefined
    const fallbackColor =
      typeof fallback.color === 'string' ? fallback.color : undefined
    const fallbackSize =
      typeof fallback.size === 'string' ? fallback.size : undefined

    const priceRaw =
      product?.price ??
      (fallback.sale_price != null ? Number(fallback.sale_price) : 0)

    const image = resolveMediaUrl(
      product?.image ||
        product?.thumbnail ||
        fallbackImage ||
        fallbackThumbnail,
    )

    return {
      id: item.id,
      productId:
        product?.id ||
        String(fallbackId ?? item.product_id ?? ''),
      name: product?.name || fallbackProductName || 'Product',
      image,
      price: Number(priceRaw) || 0,
      quantity: item.quantity ?? 1,
      color: fallbackColor,
      size: fallbackSize,
    }
  })
}

export const calcSubtotal = (items: CartItemView[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)

export const getCartItemProductId = (item: CartItem): string | null => {
  const fallbackId = (item.products as { id?: unknown } | undefined)?.id
  const resolved =
    item.product?.id ??
    (typeof fallbackId === 'string'
      ? fallbackId
      : typeof fallbackId === 'number'
        ? String(fallbackId)
        : item.product_id ?? null)

  if (!resolved) return null
  return String(resolved)
}

export const toCartQuantityMap = (cart?: Cart | null): Record<string, number> => {
  const quantities: Record<string, number> = {}
  if (!cart?.card_items?.length) return quantities

  for (const item of cart.card_items) {
    const productId = getCartItemProductId(item)
    if (!productId) continue
    quantities[productId] = (quantities[productId] ?? 0) + (item.quantity ?? 0)
  }

  return quantities
}

export const mergeCartItemIntoCartResponse = (
  current: ApiResponse<Cart> | undefined,
  addedItem: CartItem,
  cartIdFallback?: string,
): ApiResponse<Cart> | undefined => {
  if (!addedItem) return current

  if (!current?.data) {
    if (!cartIdFallback) return current
    return {
      ...(current ?? {}),
      data: {
        id: cartIdFallback,
        card_items: [addedItem],
      },
    } as ApiResponse<Cart>
  }

  const currentItems = current.data.card_items ?? []
  const byIdIndex = currentItems.findIndex((item) => item.id === addedItem.id)

  let nextItems = currentItems
  if (byIdIndex >= 0) {
    nextItems = currentItems.map((item, index) =>
      index === byIdIndex ? addedItem : item,
    )
  } else {
    const addedProductId = getCartItemProductId(addedItem)
    if (addedProductId) {
      const byProductIndex = currentItems.findIndex(
        (item) => getCartItemProductId(item) === addedProductId,
      )
      if (byProductIndex >= 0) {
        nextItems = currentItems.map((item, index) =>
          index === byProductIndex ? addedItem : item,
        )
      } else {
        nextItems = [...currentItems, addedItem]
      }
    } else {
      nextItems = [...currentItems, addedItem]
    }
  }

  return {
    ...current,
    data: {
      ...current.data,
      card_items: nextItems,
    },
  }
}
