import { useState, useEffect } from "react";
import { useParams, Link } from "@/lib/router";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ShoppingBag,
  Heart,
  Star,
  ChevronLeft,
  Check,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useCart } from "@/hooks/useCart";
import type { ProductResponse, AddToCartPayload, CartItem, ApiResponse } from "@/types/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { handleImageError, resolveMediaUrl } from "@/lib/media";

function toNumber(value: unknown, fallback = 0): number {
  const numeric =
    typeof value === "number" && Number.isFinite(value)
      ? value
      : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

// Loading Skeleton for Product Detail
function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        {/* Image Gallery Skeleton */}
        <div className="flex flex-col-reverse gap-4 lg:flex-row lg:gap-6">
          <div className="flex gap-3 lg:flex-col">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="h-20 w-20 rounded-lg lg:h-24 lg:w-24"
              />
            ))}
          </div>
          <Skeleton className="aspect-square flex-1 rounded-2xl lg:aspect-[4/5]" />
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Image Gallery Component
function ImageGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row lg:gap-6">
      <div className="flex gap-3 lg:flex-col">
        {images.map((image, index) => (
          <motion.button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 lg:h-24 lg:w-24",
              selectedIndex === index && "ring-2 ring-primary ring-offset-2",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              src={image}
              alt={`${productName} view ${index + 1}`}
              className="h-full w-full object-cover"
              onError={(event) => handleImageError(event)}
            />
          </motion.button>
        ))}
      </div>

      <div className="relative flex-1 overflow-hidden rounded-2xl bg-neutral-100">
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={images[selectedIndex]}
            alt={productName}
            className="aspect-square w-full object-cover lg:aspect-[4/5]"
            onError={(event) => handleImageError(event)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}

// Size Selector Component
function SizeSelector({
  sizes,
  selected,
  onSelect,
}: {
  sizes: string[];
  selected: string;
  onSelect: (size: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-900">
          {t("productDetail.size")}
        </span>
        <button className="text-sm text-neutral-500 underline hover:text-neutral-700">
          {t("productDetail.sizeGuide")}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <motion.button
            key={size}
            onClick={() => onSelect(size)}
            className={cn(
              "rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors",
              selected === size
                ? "border-primary bg-primary text-primary-foreground"
                : "border-neutral-200 text-neutral-700 hover:border-neutral-300",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {size}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Color Selector Component
function ColorSelector({
  colors,
  selected,
  onSelect,
}: {
  colors: { name: string; value: string }[];
  selected: string;
  onSelect: (color: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-neutral-900">
          {t("productDetail.color")}:
        </span>
        <span className="text-sm text-neutral-600">{selected}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <motion.button
            key={color.name}
            onClick={() => onSelect(color.name)}
            className={cn(
              "relative h-10 w-10 rounded-full",
              selected === color.name && "ring-2 ring-primary ring-offset-2",
            )}
            style={{ backgroundColor: color.value }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={color.name}
          >
            {selected === color.name && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check
                  className={cn(
                    "h-5 w-5",
                    color.value === "#FFFFF0" ||
                      color.value === "#F5F5F0" ||
                      color.value === "#E8E4DC"
                      ? "text-neutral-900"
                      : "text-white",
                  )}
                />
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Quantity Selector Component
function QuantitySelector({
  quantity,
  onQuantityChange,
  maxQuantity,
}: {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxQuantity?: number;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-neutral-900">
        {t("productDetail.quantity")}
      </span>
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-e-none"
          onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="flex h-10 w-16 items-center justify-center border-y border-neutral-200 bg-background text-sm font-medium">
          {quantity}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-s-none"
          onClick={() => onQuantityChange(quantity + 1)}
          disabled={maxQuantity ? quantity >= maxQuantity : false}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {maxQuantity !== undefined && (
        <p
          className={cn(
            "text-xs",
            maxQuantity === 0 ? "text-red-500" : "text-green-600",
          )}
        >
          {maxQuantity === 0
            ? t("common.outOfStock")
            : t("productDetail.availableInStock", { count: maxQuantity })}
        </p>
      )}
    </div>
  );
}

// Product Info Features
function ProductFeatures() {
  const { t } = useTranslation();

  const features = [
    { icon: Truck, text: t("productDetail.fastShipping") },
    { icon: Shield, text: t("productDetail.warranty") },
    { icon: RotateCcw, text: t("productDetail.returns") },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 rounded-xl bg-neutral-50 p-4">
      {features.map(({ icon: Icon, text }) => (
        <div
          key={text}
          className="flex flex-col items-center gap-2 text-center"
        >
          <Icon className="h-5 w-5 text-neutral-600" />
          <span className="text-xs text-neutral-600">{text}</span>
        </div>
      ))}
    </div>
  );
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const currency = t("common.currency");

  // Fetch product from public API endpoint
  const { data, isLoading, isError, error } = useGet<ProductResponse>({
    path: `products/public/${id}`,
    options: {
      enabled: !!id,
      staleTime: 1000 * 60 * 5,
    },
  });
  const product = data?.data;

  const { cartId } = useCart();

  // Cart mutation with dynamic cart_id
  const addToCart = usePost<AddToCartPayload, ApiResponse<CartItem>>({
    path: cartId ? `cart/items?cart_id=${cartId}` : "cart/items?cart_id=",
    method: "post",
    successMessage: t("cart.addedToCart"),
    errorMessage: t("cart.addToCartError"),
  });

  // UI State
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Set initial selections when product loads
  useEffect(() => {
    if (product) {
      if (product.sizes?.length) setSelectedSize(product.sizes[0]);
      if (product.colors?.length) setSelectedColor(product.colors[0].name);
    }
  }, [product]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-neutral-100 bg-neutral-50/50">
          <div className="container mx-auto px-4 py-4 md:px-6">
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <ProductDetailSkeleton />
      </div>
    );
  }

  // Error state
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h1 className="mb-2 text-2xl font-medium text-neutral-900">
            {isError ? t("productDetail.errorLoading") : t("productDetail.notFound")}
          </h1>
          <p className="mb-6 text-neutral-600">
            {error?.message || t("productDetail.notFoundDescription")}
          </p>
          <Button asChild>
            <Link to="/shop">{t("productDetail.backToShop")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = (
    product.images ??
    product.gallery ??
    [product.image]
  )
    .map((image) => resolveMediaUrl(image, ""))
    .filter((image): image is string => typeof image === "string" && image.length > 0);
  const safeImages = images.length > 0 ? images : ["/shop-logo.svg"];
  const price = toNumber(product.price);
  const originalPrice =
    product.originalPrice == null ? null : toNumber(product.originalPrice);
  const discount =
    originalPrice != null && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (!product) return;
    if (!cartId) {
      toast.error(t("productDetail.cartNotReady"));
      return;
    }
    addToCart.mutate({
      product_id: product.id,
      quantity,
    });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-neutral-100 bg-neutral-50/50"
      >
        <div className="container mx-auto px-4 py-4 md:px-6">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("productDetail.backToShop")}
          </Link>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Left: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ImageGallery images={safeImages} productName={product.name} />
          </motion.div>

          {/* Right: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="space-y-6">
              {/* Category & Badge */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium uppercase tracking-wider text-neutral-500">
                  {product.category}
                </span>
                {product.badge && (
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      product.badge === "new" &&
                        "bg-primary text-primary-foreground",
                      product.badge === "sale" && "bg-red-500 text-white",
                      product.badge === "bestseller" &&
                        "bg-amber-500 text-white",
                    )}
                  >
                    {product.badge === "sale"
                      ? `-${discount}%`
                      : product.badge === "new"
                        ? t("common.newArrival")
                        : t("common.bestSeller")}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl font-light tracking-tight text-neutral-900 md:text-4xl lg:text-5xl">
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(product.rating!)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-neutral-200 text-neutral-200",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-neutral-700">
                    {product.rating}
                  </span>
                  <span className="text-sm text-neutral-500">
                    ({t("productDetail.reviews", { count: product.reviewCount ?? 0 })})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-medium text-neutral-900">
                  {price.toFixed(2)} {currency}
                </span>
                {originalPrice != null && originalPrice > price && (
                  <span className="text-xl text-neutral-400 line-through">
                    {originalPrice.toFixed(2)} {currency}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-base leading-relaxed text-neutral-600">
                {product.fullDescription || product.description}
              </p>

              <hr className="border-neutral-200" />

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <ColorSelector
                  colors={product.colors}
                  selected={selectedColor}
                  onSelect={setSelectedColor}
                />
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <SizeSelector
                  sizes={product.sizes}
                  selected={selectedSize}
                  onSelect={setSelectedSize}
                />
              )}

              {/* Quantity */}
              <QuantitySelector
                quantity={quantity}
                onQuantityChange={setQuantity}
                maxQuantity={product.quantity}
              />

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  size="lg"
                  className="flex-1 rounded-full"
                  onClick={handleAddToCart}
                  disabled={product.inStock === false || addToCart.isPending}
                >
                  <ShoppingBag className="me-2 h-5 w-5" />
                  {addToCart.isPending
                    ? t("productDetail.adding")
                    : product.inStock === false
                      ? t("common.outOfStock")
                      : t("common.addToCart")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={cn(
                    "rounded-full",
                    isWishlisted &&
                      "border-red-200 bg-red-50 text-red-500 hover:bg-red-100",
                  )}
                  onClick={handleWishlist}
                >
                  <Heart
                    className={cn("h-5 w-5", isWishlisted && "fill-current")}
                  />
                </Button>
              </div>

              {/* Features */}
              <ProductFeatures />

              {/* Product Details */}
              <div className="space-y-4 pt-4">
                {product.dimensions && (
                  <div className="flex justify-between border-b border-neutral-100 pb-3">
                    <span className="text-sm text-neutral-500">
                      {t("productDetail.dimensions")}
                    </span>
                    <span className="text-sm font-medium text-neutral-900">
                      {product.dimensions}
                    </span>
                  </div>
                )}
                {product.materials && (
                  <div className="flex justify-between border-b border-neutral-100 pb-3">
                    <span className="text-sm text-neutral-500">
                      {t("productDetail.materials")}
                    </span>
                    <span className="text-sm font-medium text-neutral-900">
                      {product.materials.join(", ")}
                    </span>
                  </div>
                )}
                {product.care && (
                  <div className="space-y-2">
                    <span className="text-sm text-neutral-500">
                      {t("productDetail.careInstructions")}
                    </span>
                    <ul className="space-y-1">
                      {product.care.map((instruction, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-neutral-700"
                        >
                          <Check className="h-3 w-3 text-green-600" />
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


