import { memo, type SyntheticEvent, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@/lib/router";
import { motion, AnimatePresence } from '@/lib/gsap-motion';
import { ShoppingBag, Heart, Eye, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { buildGetQueryKey, fetchGet } from "@/hooks/useGet";
import { cn } from "@/lib/utils";
import { handleImageError, resolveMediaUrl } from "@/lib/media";
import { isProductOutOfStock } from "@/lib/product-stock";
import type { Product, ProductResponse } from "@/types/api";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "detailed";
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
  disableAddToCart?: boolean;
  className?: string;
}

type BadgeType = "new" | "sale" | "bestseller";

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatPrice(value: unknown): string {
  return toNumber(value).toFixed(2);
}

function getCategoryLabel(product: Product, fallback: string): string {
  return product.categories?.[0]?.category_name || product.category || fallback;
}

const usePrefetchProductDetail = (productId: string) => {
  const queryClient = useQueryClient();
  const hasPrefetchedRef = useRef(false);

  return () => {
    if (hasPrefetchedRef.current) return;
    hasPrefetchedRef.current = true;

    void queryClient.prefetchQuery({
      queryKey: buildGetQueryKey(`products/public/${productId}`),
      queryFn: ({ signal }) =>
        fetchGet<ProductResponse>({
          path: `products/public/${productId}`,
          signal,
        }),
      staleTime: 1000 * 60 * 5,
    });
  };
};

function ProductCardComponent({
  product,
  variant = "default",
  onAddToCart,
  onQuickView,
  onWishlist,
  isWishlisted,
  disableAddToCart = false,
  className,
}: ProductCardProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [internalWishlisted, setInternalWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const prefetchProductDetail = usePrefetchProductDetail(product.id);

  const wishlisted = isWishlisted ?? internalWishlisted;
  const price = toNumber(product.price);
  const originalPrice =
    product.originalPrice == null ? null : toNumber(product.originalPrice);
  const hasDiscount = originalPrice != null && originalPrice > price;
  const discount = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const categoryLabel = getCategoryLabel(product, t("products.allCategories"));
  const currency = t("common.currency");
  const outOfStock = isProductOutOfStock(product);
  const isAddToCartDisabled = outOfStock || disableAddToCart;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAddToCartDisabled) return;
    onAddToCart?.(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    if (!onQuickView) return;
    e.preventDefault();
    e.stopPropagation();
    onQuickView(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlisted === undefined) {
      setInternalWishlisted((prev) => !prev);
    }

    onWishlist?.(product);
  };

  const displayBadge: BadgeType | undefined =
    discount > 0
      ? "sale"
      : product.badge === "new" ||
          product.badge === "sale" ||
          product.badge === "bestseller"
        ? product.badge
        : undefined;

  const badgeText: Record<BadgeType, string> = {
    new: t("common.newArrival"),
    sale: `-${discount}%`,
    bestseller: t("common.bestSeller"),
  };

  const badgeColors: Record<BadgeType, string> = {
    new: "bg-cyan text-navy",
    sale: "bg-gold text-navy",
    bestseller: "bg-primary text-white",
  };

  if (variant === "compact") {
    return (
        <CompactProductCard
          product={product}
          onAddToCart={onAddToCart}
          disableAddToCart={disableAddToCart}
          className={className}
        />
      );
  }

  if (variant === "detailed") {
    return (
        <DetailedProductCard
          product={product}
          onAddToCart={onAddToCart}
          onWishlist={onWishlist}
          isWishlisted={isWishlisted}
          disableAddToCart={disableAddToCart}
          className={className}
        />
      );
  }

  return (
    <motion.div
      onMouseEnter={() => {
        setIsHovered(true);
        prefetchProductDetail();
      }}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => {
        setIsHovered(true);
        prefetchProductDetail();
      }}
      onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
        if (
          !event.currentTarget.contains(event.relatedTarget as Node | null)
        ) {
          setIsHovered(false);
        }
      }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("group block focus-visible:outline-none", className)}
    >
      <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-lg bg-navy-50 sm:mb-4 sm:rounded-xl">
        <Link
          to={`/product/${product.id}`}
          className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:rounded-xl"
          aria-label={`${product.name} - ${formatPrice(price)} ${currency}`}
        >
          <span className="sr-only">{product.name}</span>
        </Link>

        {!imageLoaded && (
          <div className="absolute inset-0 overflow-hidden bg-navy-100">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-navy-100 via-navy-50 to-navy-100" />
          </div>
        )}

        <motion.img
          src={resolveMediaUrl(product.image || product.thumbnail)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={cn(
            "h-full w-full object-cover transition-all duration-500",
            imageLoaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setImageLoaded(true)}
          onError={(event: SyntheticEvent<HTMLImageElement>) =>
            handleImageError(event)
          }
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.5 }}
        />

        {displayBadge && (
          <span
            className={cn(
              "absolute start-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium sm:start-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs",
              badgeColors[displayBadge],
            )}
          >
            {badgeText[displayBadge]}
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy sm:px-4 sm:py-2 sm:text-sm">
              {t("common.outOfStock")}
            </span>
          </div>
        )}

        <motion.button
          initial={{ opacity: 1 }}
          animate={{ opacity: isHovered || wishlisted ? 1 : 0.7 }}
          transition={{ duration: 0.2 }}
          onClick={handleWishlist}
          className={cn(
            "absolute end-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors sm:end-3 sm:top-3 sm:h-9 sm:w-9",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            wishlisted ? "text-gold" : "text-navy-600 hover:text-navy",
          )}
          aria-label={
            wishlisted
              ? t("products.removeFromWishlist")
              : t("products.addToWishlist")
          }
          aria-pressed={wishlisted}
          type="button"
        >
          <Heart
            className={cn("h-4 w-4", wishlisted && "fill-current")}
            aria-hidden="true"
          />
        </motion.button>

        {onQuickView && !outOfStock && (
          <button
            type="button"
            onClick={handleQuickView}
            className="absolute end-12 top-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy-600 backdrop-blur-sm transition-colors hover:text-navy sm:hidden"
            aria-label={t("products.quickView")}
          >
            <Eye className="h-4 w-4" />
          </button>
        )}

        <AnimatePresence>
          {isHovered && !outOfStock && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute inset-x-2 bottom-2 z-20 hidden gap-2 sm:inset-x-3 sm:bottom-3 sm:grid",
                onQuickView ? "sm:grid-cols-2" : "sm:grid-cols-1",
              )}
            >
              <Button
                onClick={handleAddToCart}
                className="h-9 min-w-0 w-full rounded-lg px-2"
                size="sm"
                disabled={isAddToCartDisabled}
              >
                <ShoppingBag className="me-2 h-4 w-4" />
                <span className="truncate">{t("common.addToCart")}</span>
              </Button>
              {onQuickView ? (
                <Button
                  onClick={handleQuickView}
                  variant="secondary"
                  size="sm"
                  className="h-9 min-w-0 w-full rounded-lg px-2"
                >
                  <Eye className="me-2 h-4 w-4" />
                  <span className="truncate">{t("products.quickView")}</span>
                </Button>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Link
        to={`/product/${product.id}`}
        className="block space-y-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:space-y-2"
      >
        <span className="text-[10px] font-medium uppercase tracking-wider text-navy-500 sm:text-xs">
          {categoryLabel}
        </span>

        <h3 className="line-clamp-2 text-sm font-medium leading-tight text-navy transition-colors group-hover:text-primary sm:text-base md:text-lg">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-sm font-medium text-navy sm:text-base md:text-lg">
            {formatPrice(price)} {currency}
          </span>
          {hasDiscount && (
            <span className="text-xs text-navy-400 line-through sm:text-sm">
              {formatPrice(originalPrice)} {currency}
            </span>
          )}
        </div>

        {product.rating ? (
          <div className="hidden items-center gap-1 sm:flex">
            <Star
              className="h-3.5 w-3.5 fill-gold text-gold sm:h-4 sm:w-4"
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-navy-700 sm:text-sm">
              {product.rating}
            </span>
            {product.reviewCount ? (
              <span className="text-sm text-navy-500">({product.reviewCount})</span>
            ) : null}
          </div>
        ) : null}
      </Link>
    </motion.div>
  );
}

function CompactProductCard({
  product,
  onAddToCart,
  disableAddToCart,
  className,
}: {
  product: Product;
  onAddToCart?: (product: Product) => void;
  disableAddToCart?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const prefetchProductDetail = usePrefetchProductDetail(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const price = toNumber(product.price);
  const originalPrice =
    product.originalPrice == null ? null : toNumber(product.originalPrice);
  const hasDiscount = originalPrice != null && originalPrice > price;
  const discount = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const categoryLabel = getCategoryLabel(product, t("products.allCategories"));
  const currency = t("common.currency");
  const outOfStock = isProductOutOfStock(product);
  const isAddToCartDisabled = outOfStock || !!disableAddToCart;

  return (
    <Link
      to={`/product/${product.id}`}
      className={cn(
        "group flex gap-4 rounded-xl bg-white p-3 transition-shadow hover:shadow-md",
        className,
      )}
      onMouseEnter={prefetchProductDetail}
      onFocus={prefetchProductDetail}
    >
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-navy-50">
        <img
          src={resolveMediaUrl(product.image || product.thumbnail)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(event: SyntheticEvent<HTMLImageElement>) =>
            handleImageError(event)
          }
        />
        {discount > 0 && (
          <span className="absolute start-1 top-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-medium text-navy">
            -{discount}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <span className="text-xs text-navy-500">{categoryLabel}</span>
        <h3 className="font-medium text-navy group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-navy">
              {formatPrice(price)} {currency}
            </span>
            {hasDiscount && (
              <span className="text-xs text-navy-400 line-through">
                {formatPrice(originalPrice)} {currency}
              </span>
            )}
          </div>
          {!outOfStock && (
            <Button
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-primary hover:text-primary-600"
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
}

function DetailedProductCard({
  product,
  onAddToCart,
  onWishlist,
  isWishlisted,
  disableAddToCart,
  className,
}: {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
  disableAddToCart?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const [internalWishlisted, setInternalWishlisted] = useState(false);
  const prefetchProductDetail = usePrefetchProductDetail(product.id);

  const wishlisted = isWishlisted ?? internalWishlisted;
  const price = toNumber(product.price);
  const originalPrice =
    product.originalPrice == null ? null : toNumber(product.originalPrice);
  const hasDiscount = originalPrice != null && originalPrice > price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlisted === undefined) {
      setInternalWishlisted((prev) => !prev);
    }

    onWishlist?.(product);
  };

  const discount = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const displayBadge: BadgeType | undefined =
    discount > 0
      ? "sale"
      : product.badge === "new" ||
          product.badge === "sale" ||
          product.badge === "bestseller"
        ? product.badge
        : undefined;

  const badgeColors: Record<BadgeType, string> = {
    new: "bg-cyan text-navy",
    sale: "bg-gold text-navy",
    bestseller: "bg-primary text-white",
  };

  const badgeText: Record<BadgeType, string> = {
    new: t("common.newArrival"),
    sale: `-${discount}%`,
    bestseller: t("common.bestSeller"),
  };

  const categoryLabel = getCategoryLabel(product, t("products.allCategories"));
  const currency = t("common.currency");
  const outOfStock = isProductOutOfStock(product);
  const isAddToCartDisabled = outOfStock || !!disableAddToCart;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block focus-visible:outline-none"
      onMouseEnter={prefetchProductDetail}
      onFocus={prefetchProductDetail}
    >
      <motion.div
        className={cn(
          "block overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg",
          className,
        )}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative aspect-square overflow-hidden bg-navy-50">
          <img
            src={resolveMediaUrl(product.image || product.thumbnail)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(event: SyntheticEvent<HTMLImageElement>) =>
              handleImageError(event)
            }
          />

          {displayBadge && (
            <span
              className={cn(
                "absolute start-4 top-4 rounded-full px-3 py-1 text-xs font-medium",
                badgeColors[displayBadge],
              )}
            >
              {badgeText[displayBadge]}
            </span>
          )}

          <button
            onClick={handleWishlist}
            className={cn(
              "absolute end-4 top-4 rounded-full bg-white/90 p-2.5 backdrop-blur-sm transition-colors",
              wishlisted ? "text-gold" : "text-navy-600 hover:text-navy",
            )}
            aria-label={
              wishlisted
                ? t("products.removeFromWishlist")
                : t("products.addToWishlist")
            }
          >
            <Heart className={cn("h-5 w-5", wishlisted && "fill-current")} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-navy-500">
                {categoryLabel}
              </span>
              <h3 className="mt-1 text-lg font-medium text-navy">
                {product.name}
              </h3>
            </div>

            {product.rating ? (
              <div className="flex items-center gap-1 rounded-full bg-gold-50 px-2 py-1">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                <span className="text-sm font-medium text-navy">
                  {product.rating}
                </span>
              </div>
            ) : null}
          </div>

          {product.description ? (
            <p className="mb-4 line-clamp-2 text-sm text-navy-600">
              {product.description}
            </p>
          ) : null}

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-medium text-navy">
                {formatPrice(price)} {currency}
              </span>
              {hasDiscount && (
                <span className="text-sm text-navy-400 line-through">
                  {formatPrice(originalPrice)} {currency}
                </span>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
              size="sm"
              className="rounded-full bg-primary hover:bg-primary-600"
            >
              <ShoppingBag className="me-2 h-4 w-4" />
              {outOfStock
                ? t("common.outOfStock")
                : t("common.addToCart")}
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

const ProductCard = memo(ProductCardComponent);
ProductCard.displayName = "ProductCard";

export { ProductCard, CompactProductCard, DetailedProductCard };


