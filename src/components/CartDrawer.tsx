import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Minus, Plus, X, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGet } from "@/hooks/useGet";
import { usePostAction } from "@/hooks/usePostAction";
import type { ApiResponse, Cart } from "@/types/api";
import { calcSubtotal, mapCartItems } from "@/lib/cart";
import { cn } from "@/lib/utils";

// Cart Item Component
function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating,
}: {
  item: ReturnType<typeof mapCartItems>[number];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  isUpdating?: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-4 py-4", isUpdating && "opacity-50")}
    >
      {/* Product Image */}
      <Link
        to={`/product/${item.productId}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
      >
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            to={`/product/${item.productId}`}
            className="text-sm font-medium text-neutral-900 transition-colors hover:text-neutral-600"
          >
            {item.name}
          </Link>
          <div className="mt-1 space-y-0.5">
            {item.color && (
              <p className="text-xs text-neutral-500">Color: {item.color}</p>
            )}
            {item.size && (
              <p className="text-xs text-neutral-500">Size: {item.size}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1 || isUpdating}
              className="flex h-8 w-8 items-center justify-center rounded-s-md border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Minus className="h-3 w-3" />
            </button>
            <div className="flex h-8 w-10 items-center justify-center border-y border-neutral-200 bg-white text-sm font-medium">
              {item.quantity}
            </div>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={isUpdating}
              className="flex h-8 w-8 items-center justify-center rounded-e-md border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Price */}
          <span className="text-sm font-medium text-neutral-900">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.id)}
        disabled={isUpdating}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed"
        aria-label="Remove item"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// Loading Skeleton
function CartSkeleton() {
  return (
    <div className="space-y-4 px-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 py-4">
          <Skeleton className="h-24 w-24 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty Cart Component
function EmptyCart() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-1 flex-col items-center justify-center py-12 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
        <ShoppingBag className="h-10 w-10 text-neutral-400" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-neutral-900">
        Your cart is empty
      </h3>
      <p className="mb-6 max-w-50 text-sm text-neutral-500">
        Looks like you haven't added any items to your cart yet.
      </p>
      <Button asChild className="rounded-full">
        <Link to="/shop">
          {t("nav.shop")}
          <ArrowRight className="ms-2 h-4 w-4" />
        </Link>
      </Button>
    </motion.div>
  );
}

// Cart Drawer Component
interface CartDrawerProps {
  trigger?: React.ReactNode;
  className?: string;
}

export function CartDrawer({ trigger, className }: CartDrawerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  // Fetch cart from API
  const { data: cartResponse, isLoading, isError } = useGet<ApiResponse<Cart>>({
    path: "cart",
    options: {
      staleTime: 1000 * 60, // 1 minute
    },
  });
  const cart = cartResponse?.data;

  // Mutations
  const removeFromCart = usePostAction<{ message?: string }>();
  const updateCartItem = usePostAction<{ message?: string }>();

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdatingItemId(itemId);
    updateCartItem.mutate(
      {
        method: "put",
        path: `cart/items/${itemId}`,
        body: { quantity },
      },
      {
        onSettled: () => setUpdatingItemId(null),
      },
    );
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart.mutate({
      method: "delete",
      path: `cart/items/${itemId}`,
    });
  };

  // Calculate totals from cart data
  const items = mapCartItems(cart?.card_items ?? []);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = calcSubtotal(items);
  const total = subtotal;

  const handleCheckout = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "relative rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900",
              className,
            )}
            aria-label={t("common.cart")}
          >
            <ShoppingBag className="h-5 w-5" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader className="border-b border-neutral-200 px-6 py-4">
          <SheetTitle className="flex items-center gap-3 font-display text-xl font-light tracking-tight">
            <ShoppingBag className="h-5 w-5" />
            {t("common.cart")}
            {itemCount > 0 && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-sm font-medium text-neutral-600">
                {itemCount} {itemCount === 1 ? "item" : t("common.items")}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Loading State */}
        {isLoading && <CartSkeleton />}

        {/* Error State */}
        {isError && (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <p className="text-neutral-600">Failed to load cart</p>
          </div>
        )}

        {/* Cart Content */}
        {!isLoading && !isError && (
          <>
            {items.length === 0 ? (
              <EmptyCart />
            ) : (
              <>
                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-6">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="border-b border-neutral-100"
                      >
                        <CartItemRow
                          item={item}
                          onUpdateQuantity={handleUpdateQuantity}
                          onRemove={handleRemoveItem}
                          isUpdating={
                            updatingItemId === item.id ||
                            removeFromCart.isPending
                          }
                        />
                      </div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="border-t border-neutral-200 bg-neutral-50/50 px-6 py-6">
                  {/* Order Summary */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">
                        {t("common.subtotal")}
                      </span>
                      <span className="font-medium text-neutral-900">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">
                        {t("common.shipping")}
                      </span>
                      <span className="font-medium text-neutral-900">
                        Calculated at checkout
                      </span>
                    </div>
                    <div className="border-t border-neutral-200 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium text-neutral-900">
                          {t("common.total")}
                        </span>
                        <span className="text-lg font-medium text-neutral-900">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleCheckout}
                      size="lg"
                      className="w-full rounded-full"
                      asChild
                    >
                      <Link to="/checkout">
                        Checkout
                        <ArrowRight className="ms-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full rounded-full"
                      asChild
                      onClick={() => setIsOpen(false)}
                    >
                      <Link to="/shop">Continue Shopping</Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
