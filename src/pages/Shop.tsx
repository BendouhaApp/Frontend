import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  Grid,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { SkeletonProductGrid } from "@/components/ui/skeleton";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useCart } from "@/hooks/useCart";
import type {
  Product,
  ProductsResponse,
  AddToCartPayload,
  CartItem,
  ApiResponse,
  Category,
} from "@/types/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ViewMode = "grid" | "large" | "list";
type CardVariant = "default" | "compact" | "detailed";

const priceRangeIds = ["all", "under-100", "100-250", "250-500", "over-500"];
const sortOptionIds = [
  "featured",
  "newest",
  "price-low",
  "price-high",
  "rating",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFn = (key: string, opts?: any) => string;

type CategoryFilterItem = {
  id: string;
  label: string;
  level: number;
};

function flattenCategories(
  categories: Category[],
  level = 0,
  acc: CategoryFilterItem[] = [],
) {
  for (const category of categories) {
    acc.push({
      id: category.id,
      label: category.category_name,
      level,
    });
    if (category.other_categories?.length) {
      flattenCategories(category.other_categories, level + 1, acc);
    }
  }
  return acc;
}

// Helper to get price range label
function getPriceLabel(t: TFn, id: string): string {
  const labels: Record<string, string> = {
    all: t("products.allPrices"),
    "under-100": t("products.underPrice", { price: "$100" }),
    "100-250": t("products.priceRangeBetween", { min: "$100", max: "$250" }),
    "250-500": t("products.priceRangeBetween", { min: "$250", max: "$500" }),
    "over-500": t("products.overPrice", { price: "$500" }),
  };
  return labels[id] || id;
}

// Helper to get sort label
function getSortLabel(t: TFn, id: string): string {
  const labels: Record<string, string> = {
    featured: t("products.sortFeatured"),
    newest: t("products.sortNewest"),
    "price-low": t("products.sortPriceLow"),
    "price-high": t("products.sortPriceHigh"),
    rating: t("products.sortRating"),
  };
  return labels[id] || id;
}

// Filter Sidebar Component
function FilterSidebar({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedPrice,
  setSelectedPrice,
  className,
}: {
  categories: CategoryFilterItem[];
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  selectedPrice: string;
  setSelectedPrice: (id: string) => void;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <aside className={cn("space-y-8", className)}>
      {/* Categories */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-navy-500">
          {t("products.filterBy")}
        </h3>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  selectedCategory === category.id
                    ? "bg-primary text-white"
                    : "text-navy-700 hover:bg-navy-50",
                )}
              >
                <span className={cn(category.level > 0 && "ps-4")}>
                  {category.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-navy-500">
          {t("products.priceRange")}
        </h3>
        <ul className="space-y-2">
          {priceRangeIds.map((id) => (
            <li key={id}>
              <button
                onClick={() => setSelectedPrice(id)}
                className={cn(
                  "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors",
                  selectedPrice === id
                    ? "bg-primary text-white"
                    : "text-navy-700 hover:bg-navy-50",
                )}
              >
                {getPriceLabel(t, id)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full border-primary text-primary hover:bg-primary hover:text-white"
        onClick={() => {
          setSelectedCategory("all");
          setSelectedPrice("all");
        }}
      >
        {t("products.clearFilters")}
      </Button>
    </aside>
  );
}

// Mobile Filter Drawer
function MobileFilterDrawer({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedPrice,
  setSelectedPrice,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryFilterItem[];
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  selectedPrice: string;
  setSelectedPrice: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-navy/50 backdrop-blur-sm lg:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 start-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl lg:hidden"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-navy-200 px-6 py-4">
                <h2 className="text-lg font-medium text-navy">
                  {t("products.filters")}
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <FilterSidebar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedPrice={selectedPrice}
                  setSelectedPrice={setSelectedPrice}
                />
              </div>
              <div className="border-t border-navy-200 p-4">
                <Button
                  className="w-full bg-primary hover:bg-primary-600"
                  onClick={onClose}
                >
                  {t("products.showResults")}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Error State Component
function ErrorState({
  message,
  onRetry,
  retryText,
  errorTitle,
}: {
  message: string;
  onRetry: () => void;
  retryText: string;
  errorTitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-gold" />
      <h3 className="mb-2 text-lg font-medium text-navy">{errorTitle}</h3>
      <p className="mb-6 max-w-md text-navy-600">{message}</p>
      <Button onClick={onRetry} className="bg-primary hover:bg-primary-600">
        {retryText}
      </Button>
    </div>
  );
}

export function Shop() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedSort, setSelectedSort] = useState("featured");

  const { cartId } = useCart();

  const { data: categoriesResponse } = useGet<ApiResponse<Category[]>>({
    path: "categories",
    options: {
      staleTime: 1000 * 60 * 10,
    },
  });

  const categories = categoriesResponse?.data ?? [];

  const categoryItems = useMemo(() => {
    return [
      { id: "all", label: t("products.allCategories"), level: 0 },
      ...flattenCategories(categories),
    ];
  }, [categories, t]);

  const categoryLookup = useMemo(() => {
    const map = new Map<string, Category>();
    const walk = (items: Category[]) => {
      for (const item of items) {
        map.set(item.id, item);
        if (item.other_categories?.length) {
          walk(item.other_categories);
        }
      }
    };
    walk(categories);
    return map;
  }, [categories]);

  const selectedCategoryLabel =
    selectedCategory === "all"
      ? t("products.allCategories")
      : (categoryLookup.get(selectedCategory)?.category_name ??
        selectedCategory);

  useEffect(() => {
    const categoryParam =
      searchParams.get("category") ?? searchParams.get("collection");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Fetch products from API
  const { data, isLoading, isError, error, refetch } = useGet<ProductsResponse>(
    {
      path: "products/public",
      options: {
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  );
  const allProducts = data?.data || [];

  // Cart mutation - you need a cart_id to add items
  const addToCart = usePost<AddToCartPayload, ApiResponse<CartItem>>({
    path: cartId ? `cart/items?cart_id=${cartId}` : "cart/items?cart_id=",
    method: "post",
    successMessage: "Produit ajouté au panier",
    errorMessage: "Erreur lors de l'ajout au panier",
  });

  // Filter products by price range
  const products = useMemo(() => {
    let filtered = [...allProducts];

    if (selectedCategory !== "all") {
      const selected = categoryLookup.get(selectedCategory);
      const selectedName = selected?.category_name?.toLowerCase();

      filtered = filtered.filter((product) => {
        const categories = product.categories ?? [];
        if (categories.length > 0) {
          return categories.some(
            (cat) =>
              cat.id === selectedCategory || cat.parent_id === selectedCategory,
          );
        }
        if (selectedName) {
          return product.category?.toLowerCase() === selectedName;
        }
        return true;
      });
    }

    if (selectedPrice !== "all") {
      filtered = filtered.filter((product) => {
        const price =
          typeof product.price === "string"
            ? parseFloat(product.price)
            : product.price;

        switch (selectedPrice) {
          case "under-100":
            return price < 100;
          case "100-250":
            return price >= 100 && price < 250;
          case "250-500":
            return price >= 250 && price < 500;
          case "over-500":
            return price >= 500;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [allProducts, selectedCategory, selectedPrice, categoryLookup]);

  const handleAddToCart = (product: Product) => {
    if (!cartId) {
      toast.error("Cart not ready. Please try again.");
      return;
    }
    addToCart.mutate({
      product_id: product.id,
      quantity: 1,
    });
  };

  const handleQuickView = (product: Product) => {
    console.log("Quick view:", product.name);
  };

  const handleWishlist = (product: Product) => {
    console.log("Wishlist:", product.name);
  };

  // Map view mode to card variant and grid columns
  const getViewConfig = (): { variant: CardVariant; gridClass: string } => {
    switch (viewMode) {
      case "large":
        return {
          variant: "detailed",
          gridClass: "grid-cols-1 sm:grid-cols-2",
        };
      case "list":
        return {
          variant: "compact",
          gridClass: "grid-cols-1",
        };
      default:
        return {
          variant: "default",
          gridClass: "grid-cols-2 lg:grid-cols-3",
        };
    }
  };

  const { variant, gridClass } = getViewConfig();

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) + (selectedPrice !== "all" ? 1 : 0);

  return (
    <div className="min-h-screen bg-white">
      <MobileFilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        categories={categoryItems}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedPrice={selectedPrice}
        setSelectedPrice={setSelectedPrice}
      />

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-navy-200 bg-navy-50"
      >
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <h1 className="font-display text-4xl font-light tracking-tight text-navy md:text-5xl">
            {t("nav.shop")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-600">
            {t("products.featuredSubtitle")}
          </p>
        </div>
      </motion.div>

      {/* Toolbar */}
      <div className="sticky top-0 z-20 border-b border-navy-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-primary text-primary lg:hidden"
              onClick={() => setShowFilters(true)}
            >
              <SlidersHorizontal className="me-2 h-4 w-4" />
              {t("products.filters")}
              {activeFiltersCount > 0 && (
                <span className="ms-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            <p className="text-sm text-navy-600">
              {isLoading ? "..." : `${products.length} ${t("common.items")}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="hidden gap-2 text-navy sm:flex"
                onClick={() => setSortOpen(!sortOpen)}
              >
                {t("products.sortBy")}:{" "}
                <span className="font-normal text-navy-600">
                  {getSortLabel(t, selectedSort)}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    sortOpen && "rotate-180",
                  )}
                />
              </Button>

              <AnimatePresence>
                {sortOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-10"
                      onClick={() => setSortOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute end-0 top-full z-20 mt-2 w-48 rounded-lg border border-navy-200 bg-white py-1 shadow-lg"
                    >
                      {sortOptionIds.map((id) => (
                        <button
                          key={id}
                          onClick={() => {
                            setSelectedSort(id);
                            setSortOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center px-4 py-2 text-sm transition-colors",
                            selectedSort === id
                              ? "bg-primary-50 text-primary"
                              : "text-navy-700 hover:bg-navy-50",
                          )}
                        >
                          {getSortLabel(t, id)}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* View Mode Toggles */}
            <div className="flex items-center gap-1 rounded-lg bg-navy-100 p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  viewMode === "grid" && "bg-primary text-white",
                )}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "large" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  viewMode === "large" && "bg-primary text-white",
                )}
                onClick={() => setViewMode("large")}
                aria-label="Large grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  viewMode === "list" && "bg-primary text-white",
                )}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="flex gap-8 lg:gap-12">
          {/* Desktop Sidebar */}
          <FilterSidebar
            categories={categoryItems}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedPrice={selectedPrice}
            setSelectedPrice={setSelectedPrice}
            className="hidden w-64 flex-shrink-0 lg:block"
          />

          {/* Product Grid */}
          <div className="flex-1">
            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex flex-wrap items-center gap-2"
              >
                <span className="text-sm text-navy-500">
                  {t("products.activeFilters")}
                </span>
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm text-primary">
                    {selectedCategoryLabel}
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="ms-1 rounded-full p-0.5 hover:bg-primary-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedPrice !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm text-primary">
                    {getPriceLabel(t, selectedPrice)}
                    <button
                      onClick={() => setSelectedPrice("all")}
                      className="ms-1 rounded-full p-0.5 hover:bg-primary-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedPrice("all");
                  }}
                  className="text-sm text-navy-500 underline hover:text-primary"
                >
                  {t("products.clearAll")}
                </button>
              </motion.div>
            )}

            {/* Loading State */}
            {isLoading && <SkeletonProductGrid count={8} />}

            {/* Error State */}
            {isError && (
              <ErrorState
                message={error?.message || t("products.failedToLoad")}
                onRetry={() => refetch()}
                retryText={t("products.tryAgain")}
                errorTitle={t("products.somethingWentWrong")}
              />
            )}

            {/* Products Grid */}
            {!isLoading && !isError && (
              <>
                {products.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-navy-600">
                      {t("products.noProductsFound")}
                    </p>
                  </div>
                ) : (
                  <motion.div
                    key={viewMode}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className={cn("grid gap-6", gridClass)}
                  >
                    {products.map((product) => (
                      <motion.div key={product.id} variants={itemVariants}>
                        <ProductCard
                          product={product}
                          variant={variant}
                          onAddToCart={handleAddToCart}
                          onQuickView={handleQuickView}
                          onWishlist={handleWishlist}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
