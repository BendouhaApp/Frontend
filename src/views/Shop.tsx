"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "@/lib/router";
import {
  Grid,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
  AlertCircle,
  Search,
  Heart,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { SkeletonProductGrid } from "@/components/ui/skeleton";
import { buildGetQueryKey, fetchGet, useGet } from "@/hooks/useGet";
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
import { handleImageError, resolveMediaUrl } from "@/lib/media";
import { toast } from "sonner";

type ViewMode = "grid" | "large" | "list";
type CardVariant = "default" | "compact" | "detailed";

const sortOptionIds = [
  "featured",
  "newest",
  "price-low",
  "price-high",
  "rating",
];

const ITEMS_PER_PAGE = 9;
const WISHLIST_STORAGE_KEY = "bendouha_wishlist";
const SEARCH_DEBOUNCE_MS = 300;

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

function toNumber(value: unknown, fallback = 0): number {
  const numeric =
    typeof value === "number" && Number.isFinite(value) ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
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
  subcategories,
  selectedCategory,
  selectedSubcategory,
  setSelectedCategory,
  setSelectedSubcategory,
  className,
}: {
  categories: Category[];
  subcategories: Category[];
  selectedCategory: string;
  selectedSubcategory: string;
  setSelectedCategory: (id: string) => void;
  setSelectedSubcategory: (id: string) => void;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <aside className={cn("space-y-8", className)}>
      {/* Categories */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-navy-500">
          {t("products.categories")}
        </h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedSubcategory("all");
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                selectedCategory === "all" && selectedSubcategory === "all"
                  ? "bg-primary text-white"
                  : "text-navy-700 hover:bg-navy-50",
              )}
            >
              <span>{t("products.allCategories")}</span>
            </button>
          </li>
          {categories.length === 0 && (
            <li className="px-3 py-2 text-sm text-navy-500">
              {t("products.noCategories")}
            </li>
          )}
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => {
                  setSelectedCategory(category.id);
                  //setSelectedSubcategory("all");  ===>  Removing this fixed category click
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  selectedCategory === category.id &&
                    selectedSubcategory === "all"
                    ? "bg-primary text-white"
                    : "text-navy-700 hover:bg-navy-50",
                )}
              >
                <span>{category.category_name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Subcategories */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-navy-500">
          {t("products.subcategories")}
        </h3>
        {selectedCategory === "all" && (
          <p className="text-sm text-navy-500">
            {t("products.subcategoriesHint")}
          </p>
        )}
        {selectedCategory !== "all" && subcategories.length === 0 && (
          <p className="text-sm text-navy-500">
            {t("products.noSubcategories")}
          </p>
        )}
        {selectedCategory !== "all" && subcategories.length > 0 && (
          <ul className="space-y-2">
            {subcategories.map((subcategory) => (
              <li key={subcategory.id}>
                <button
                  onClick={() => setSelectedSubcategory(subcategory.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    selectedSubcategory === subcategory.id
                      ? "bg-primary text-white"
                      : "text-navy-700 hover:bg-navy-50",
                  )}
                >
                  <span>{subcategory.category_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Clear Selection */}
      <Button
        variant="outline"
        className="w-full border-primary text-primary hover:bg-primary hover:text-white"
        onClick={() => {
          setSelectedCategory("all");
          setSelectedSubcategory("all");
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
  subcategories,
  selectedCategory,
  selectedSubcategory,
  setSelectedCategory,
  setSelectedSubcategory,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  subcategories: Category[];
  selectedCategory: string;
  selectedSubcategory: string;
  setSelectedCategory: (id: string) => void;
  setSelectedSubcategory: (id: string) => void;
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
                  subcategories={subcategories}
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  setSelectedCategory={setSelectedCategory}
                  setSelectedSubcategory={setSelectedSubcategory}
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

function QuickViewModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}: {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const price = toNumber(product.price);
  const originalPrice =
    product.originalPrice == null ? null : toNumber(product.originalPrice);
  const hasDiscount = originalPrice != null && originalPrice > price;
  const currency = t("common.currency");
  const categoryLabel =
    product.categories?.[0]?.category_name ||
    product.category ||
    t("products.allCategories");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      >
        <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute end-4 top-4 z-10 rounded-full bg-white/90 p-2 text-navy-600 transition-colors hover:text-navy"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid gap-0 md:grid-cols-[1.05fr_1fr]">
            <div className="aspect-square bg-navy-50">
              <img
                src={resolveMediaUrl(product.image || product.thumbnail)}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(event) => handleImageError(event)}
              />
            </div>

            <div className="flex flex-col justify-between p-6 md:p-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-500">
                  {categoryLabel}
                </span>
                <h3 className="mt-2 text-2xl font-medium text-navy">
                  {product.name}
                </h3>
                {product.description ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-navy-600">
                    {product.description}
                  </p>
                ) : null}

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-xl font-semibold text-navy">
                    {price.toFixed(2)} {currency}
                  </span>
                  {hasDiscount ? (
                    <span className="text-sm text-navy-400 line-through">
                      {originalPrice.toFixed(2)} {currency}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => onAddToCart(product)}
                  disabled={product.inStock === false}
                  className="rounded-full bg-primary hover:bg-primary-600"
                >
                  {product.inStock === false
                    ? t("common.outOfStock")
                    : t("common.addToCart")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onToggleWishlist(product)}
                  className={cn(
                    "rounded-full",
                    isWishlisted && "border-gold-300 bg-gold-50 text-gold-700",
                  )}
                >
                  <Heart
                    className={cn(
                      "me-2 h-4 w-4",
                      isWishlisted && "fill-current",
                    )}
                  />
                  {isWishlisted
                    ? t("products.removeFromWishlist")
                    : t("products.addToWishlist")}
                </Button>
                <Button variant="ghost" asChild className="rounded-full">
                  <Link to={`/product/${product.id}`} onClick={onClose}>
                    {t("products.viewDetails")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function Shop() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(
    searchParams.get("stock") === "in",
  );
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistReady, setWishlistReady] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );

  const { cartId } = useCart();

  const { data: categoriesResponse } = useGet<ApiResponse<Category[]>>({
    path: "categories",
    options: {
      staleTime: 1000 * 60 * 10,
    },
  });

  const rawCategories = useMemo(
    () => categoriesResponse?.data ?? [],
    [categoriesResponse?.data],
  );

  const { rootCategories, flatCategories } = useMemo(() => {
    const flat: Category[] = [];
    const hasTree = rawCategories.some(
      (category) => category.other_categories?.length,
    );
    if (hasTree) {
      const walk = (items: Category[]) => {
        items.forEach((item) => {
          flat.push(item);
          if (item.other_categories?.length) {
            walk(item.other_categories);
          }
        });
      };
      walk(rawCategories);
    } else {
      flat.push(...rawCategories);
    }

    const roots = flat.filter((category) => !category.parent_id);
    return { rootCategories: roots, flatCategories: flat };
  }, [rawCategories]);

  const categoryLookup = useMemo(() => {
    const map = new Map<string, Category>();
    flatCategories.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [flatCategories]);

  const categoryParam =
    searchParams.get("category") ?? searchParams.get("collection");

  const derivedSelection = useMemo(() => {
    if (!categoryParam) {
      return { category: "all", subcategory: "all" };
    }
    const selected = categoryLookup.get(categoryParam);
    if (selected?.parent_id) {
      return { category: selected.parent_id, subcategory: selected.id };
    }
    if (selected) {
      return { category: selected.id, subcategory: "all" };
    }
    const hasChildren = flatCategories.some(
      (category) => category.parent_id === categoryParam,
    );
    if (hasChildren) {
      return { category: categoryParam, subcategory: "all" };
    }
    return { category: "all", subcategory: "all" };
  }, [categoryParam, categoryLookup, flatCategories]);

  const selectedCategory = derivedSelection.category;
  const selectedSubcategory = derivedSelection.subcategory;

  const activeCategoryId =
    selectedSubcategory !== "all" ? selectedSubcategory : selectedCategory;

  const selectedCategoryLabel =
    activeCategoryId === "all"
      ? t("products.allCategories")
      : (categoryLookup.get(activeCategoryId)?.category_name ??
        activeCategoryId);

  const subcategories = useMemo(() => {
    if (selectedCategory === "all") return [];
    return flatCategories.filter(
      (category) => category.parent_id === selectedCategory,
    );
  }, [selectedCategory, flatCategories]);

  const setCategoryParam = (id?: string | null) => {
    const currentSearch =
      typeof window === "undefined"
        ? searchParams.toString()
        : window.location.search;
    const next = new URLSearchParams(currentSearch);
    next.delete("q");
    if (!id || id === "all") {
      next.delete("category");
      next.delete("collection");
    } else {
      next.set("category", id);
      next.delete("collection");
    }
    setSearchParams(next);
  };

  // Debounce search input before hitting backend, without syncing URL on each
  // keystroke (which would trigger Next.js `?_rsc=...` navigation).
  useEffect(() => {
    if (typeof window === "undefined") return;

    const next = new URLSearchParams(window.location.search);
    if (!next.has("q")) return;

    next.delete("q");
    const nextQuery = next.toString();
    const nextUrl = nextQuery
      ? `${window.location.pathname}?${nextQuery}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;

    window.history.replaceState(window.history.state, "", nextUrl);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const next = new URLSearchParams(window.location.search);
    if (next.get("focus") !== "search") return;

    searchInputRef.current?.focus();
    next.delete("focus");
    const nextQuery = next.toString();
    const nextUrl = nextQuery
      ? `${window.location.pathname}?${nextQuery}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;

    window.history.replaceState(window.history.state, "", nextUrl);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const parsed = JSON.parse(
        localStorage.getItem(WISHLIST_STORAGE_KEY) ?? "[]",
      ) as string[];
      if (Array.isArray(parsed)) {
        setWishlistIds(parsed.filter((id) => typeof id === "string"));
      }
    } finally {
      setWishlistReady(true);
    }
  }, []);

  useEffect(() => {
    if (!wishlistReady || typeof window === "undefined") return;
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds, wishlistReady]);

  useEffect(() => {
    setPage(1);
  }, [activeCategoryId, debouncedSearchQuery]);

  const productsQuery = useMemo(
    () => ({
      page,
      limit: ITEMS_PER_PAGE,
      view: "card",
      ...(activeCategoryId !== "all" ? { categoryId: activeCategoryId } : {}),
      ...(debouncedSearchQuery ? { search: debouncedSearchQuery } : {}),
    }),
    [page, activeCategoryId, debouncedSearchQuery],
  );

  const { data, isLoading, isError, error, refetch } =
    useGet<ProductsResponse>({
      path: "products/public",
      query: productsQuery,
      options: {
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
      },
    });

  const products = useMemo(() => data?.data ?? [], [data?.data]);
  const totalPages = data?.meta?.totalPages ?? 1;
  const totalItems = data?.meta?.total ?? 0;

  useEffect(() => {
    if (isLoading) return;
    if (page >= totalPages) return;

    const nextQuery = { ...productsQuery, page: page + 1 };

    void queryClient.prefetchQuery({
      queryKey: buildGetQueryKey("products/public", nextQuery),
      queryFn: ({ signal }) =>
        fetchGet<ProductsResponse>({
          path: "products/public",
          query: nextQuery,
          signal,
        }),
      staleTime: 1000 * 60 * 5,
    });
  }, [isLoading, page, productsQuery, queryClient, totalPages]);

  const displayedProducts = useMemo(() => {
    const withStockFilter = onlyInStock
      ? products.filter((product) => product.inStock !== false)
      : products;
    const next = [...withStockFilter];
    const byDateDesc = (a: Product, b: Product) => {
      const aDate = Date.parse(
        (a as Product & { created_at?: string }).created_at || "",
      );
      const bDate = Date.parse(
        (b as Product & { created_at?: string }).created_at || "",
      );
      if (Number.isFinite(aDate) && Number.isFinite(bDate)) {
        return bDate - aDate;
      }
      return String(b.id).localeCompare(String(a.id), undefined, {
        numeric: true,
      });
    };

    next.sort((a, b) => {
      if (selectedSort === "price-low") {
        return toNumber(a.price) - toNumber(b.price);
      }

      if (selectedSort === "price-high") {
        return toNumber(b.price) - toNumber(a.price);
      }

      if (selectedSort === "rating") {
        return toNumber(b.rating) - toNumber(a.rating);
      }

      if (selectedSort === "newest") {
        return byDateDesc(a, b);
      }

      return 0;
    });

    return next;
  }, [products, onlyInStock, selectedSort]);
  const [pageInput, setPageInput] = useState<string>("1");

  const wishlistSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  useEffect(() => {
    if (isLoading) return;

    setPage((prev) => {
      if (prev > totalPages) return totalPages;
      if (prev < 1) return 1;
      return prev;
    });
  }, [totalPages, isLoading]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  // Cart mutation - you need a cart_id to add items
  const addToCart = usePost<AddToCartPayload, ApiResponse<CartItem>>({
    path: cartId ? `cart/items?cart_id=${cartId}` : "cart/items?cart_id=",
    method: "post",
    successMessage: t("cart.addedToCart"),
    errorMessage: t("cart.addToCartError"),
  });

  const handleAddToCart = (product: Product) => {
    if (!cartId) {
      toast.error(t("cart.notReady"));
      return;
    }
    addToCart.mutate({
      product_id: product.id,
      quantity: 1,
    });
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const handleWishlist = (product: Product) => {
    const isAlreadyWishlisted = wishlistSet.has(product.id);
    setWishlistIds((prev) =>
      isAlreadyWishlisted
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id],
    );

    toast.success(
      isAlreadyWishlisted
        ? t("products.removedFromWishlist")
        : t("products.addedToWishlist"),
    );
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
    (activeCategoryId !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0) +
    (onlyInStock ? 1 : 0);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleWishlist}
        isWishlisted={
          quickViewProduct ? wishlistSet.has(quickViewProduct.id) : false
        }
      />

      <MobileFilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        categories={rootCategories}
        subcategories={subcategories}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        setSelectedCategory={(id) => {
          setCategoryParam(id);
          setPage(1);
        }}
        setSelectedSubcategory={(id) => {
          setCategoryParam(id);
          setPage(1);
        }}
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
      <div className="sticky top-20 z-20 border-b border-navy-200 bg-white/95 backdrop-blur-sm sm:top-24">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-6">
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
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
              {isLoading ? "..." : `${totalItems} ${t("common.items")}`}
            </p>
          </div>

          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
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
                aria-label={t("shopPage.gridView")}
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
                aria-label={t("shopPage.largeGridView")}
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
                aria-label={t("shopPage.listView")}
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
            categories={rootCategories}
            subcategories={subcategories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            setSelectedCategory={(id) => {
              setCategoryParam(id);
              setPage(1);
            }}
            setSelectedSubcategory={(id) => {
              setCategoryParam(id);
              setPage(1);
            }}
            className="hidden w-64 flex-shrink-0 lg:block"
          />

          {/* Product Grid */}
          <div className="min-w-0 flex-1">
            {/* Mobile Categories */}
            <div className="mb-6 space-y-4 lg:hidden">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
                  {t("products.categories")}
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => {
                      setCategoryParam(null);
                      setPage(1);
                    }}
                    className={cn(
                      "whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition",
                      selectedCategory === "all" &&
                        selectedSubcategory === "all"
                        ? "border-primary bg-primary text-white"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-primary/50 hover:text-primary",
                    )}
                  >
                    {t("products.allCategories")}
                  </button>
                  {rootCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setCategoryParam(category.id);
                        setPage(1);
                      }}
                      className={cn(
                        "whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition",
                        selectedCategory === category.id &&
                          selectedSubcategory === "all"
                          ? "border-primary bg-primary text-white"
                          : "border-neutral-200 bg-white text-neutral-600 hover:border-primary/50 hover:text-primary",
                      )}
                    >
                      {category.category_name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedCategory !== "all" && subcategories.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
                    {t("products.subcategories")}
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => {
                          setCategoryParam(subcategory.id);
                          setPage(1);
                        }}
                        className={cn(
                          "whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition",
                          selectedSubcategory === subcategory.id
                            ? "border-primary bg-primary text-white"
                            : "border-neutral-200 bg-white text-neutral-600 hover:border-primary/50 hover:text-primary",
                        )}
                      >
                        {subcategory.category_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t("products.searchPlaceholder")}
                  className="w-full rounded-lg border border-navy-200 bg-white py-2.5 ps-9 pe-3 text-sm text-navy-700 placeholder:text-navy-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button
                type="button"
                variant={onlyInStock ? "default" : "outline"}
                onClick={() => setOnlyInStock((prev) => !prev)}
                className={cn(
                  "w-full rounded-lg sm:w-auto",
                  onlyInStock &&
                    "border-primary bg-primary text-white hover:bg-primary-600",
                )}
              >
                {t("products.inStockOnly")}
              </Button>
            </div>

            {/* Active Selection Display */}
            {activeFiltersCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex flex-wrap items-center gap-2"
              >
                <span className="text-sm text-navy-500">
                  {t("products.activeFilters")}
                </span>
                {activeCategoryId !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm text-primary">
                    {selectedCategoryLabel}
                    <button
                      onClick={() => {
                        setCategoryParam(null);
                        setPage(1);
                      }}
                      className="ms-1 rounded-full p-0.5 hover:bg-primary-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-3 py-1 text-sm text-navy-700">
                    {searchQuery.trim()}
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ms-1 rounded-full p-0.5 hover:bg-navy-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {onlyInStock && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-3 py-1 text-sm text-navy-700">
                    {t("products.inStockOnly")}
                    <button
                      onClick={() => setOnlyInStock(false)}
                      className="ms-1 rounded-full p-0.5 hover:bg-navy-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </motion.div>
            )}

            {/* Loading State */}
            {isLoading && <SkeletonProductGrid count={ITEMS_PER_PAGE} />}

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
                {displayedProducts.length === 0 ? (
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
                    className={cn("grid gap-4 sm:gap-6", gridClass)}
                  >
                    {displayedProducts.map((product) => (
                      <motion.div key={product.id} variants={itemVariants}>
                        <ProductCard
                          product={product}
                          variant={variant}
                          onAddToCart={handleAddToCart}
                          onQuickView={handleQuickView}
                          onWishlist={handleWishlist}
                          isWishlisted={wishlistSet.has(product.id)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </>
            )}

            {!isLoading && !isError && totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-navy-500">
                  {t("common.pageOf", {
                    page: page,
                    total: totalPages,
                  })}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    {t("common.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((prev) => Math.min(totalPages, prev + 1))
                    }
                  >
                    {t("common.next")}
                  </Button>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-neutral-500 whitespace-nowrap">
                      {t("shopPage.goTo")}
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={pageInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const v = e.target.value.replace(/[^\d]/g, "");
                        setPageInput(v);
                      }}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key !== "Enter") return;
                        const n = Number(pageInput);
                        if (!Number.isFinite(n)) return;
                        const clamped = Math.min(totalPages, Math.max(1, n));
                        setPage(clamped);
                      }}
                      onBlur={() => {
                        if (!pageInput) {
                          setPageInput(String(page));
                          return;
                        }
                        const n = Number(pageInput);
                        if (!Number.isFinite(n)) {
                          setPageInput(String(page));
                          return;
                        }
                        const clamped = Math.min(totalPages, Math.max(1, n));
                        setPageInput(String(clamped));
                      }}
                      className={cn(
                        "h-7 w-10 rounded-md border border-neutral-300 bg-white text-center text-xs outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30",
                        pageInput &&
                          (Number(pageInput) < 1 ||
                            Number(pageInput) > totalPages) &&
                          "border-rose-300 focus:border-rose-400 focus:ring-rose-200/40",
                      )}
                      aria-label={t("shopPage.goToPage")}
                    />

                    <span className="text-xs text-neutral-400">
                      / {totalPages}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


