import type { Product } from "@/types/api";

type ProductStockInput = Pick<Product, "inStock" | "quantity">;

export function getProductAvailableQuantity(
  product: ProductStockInput,
): number | undefined {
  if (typeof product.quantity !== "number" || !Number.isFinite(product.quantity)) {
    return undefined;
  }

  return Math.max(0, product.quantity);
}

export function isProductOutOfStock(product: ProductStockInput): boolean {
  const quantity = getProductAvailableQuantity(product);
  if (typeof quantity === "number") {
    return quantity <= 0;
  }

  return product.inStock === false;
}
