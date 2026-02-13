import { useEffect, useMemo, useState } from "react";
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

const sortOptionIds = [
  "featured",
  "newest",
  "price-low",
  "price-high",
  "rating",
];

const ITEMS_PER_PAGE = 9;

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

export function Shop() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState("featured");

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
    const next = new URLSearchParams(searchParams);
    if (!id || id === "all") {
      next.delete("category");
      next.delete("collection");
    } else {
      next.set("category", id);
      next.delete("collection");
    }
    setSearchParams(next);
  };

  useEffect(() => {
    setPage(1);
  }, [activeCategoryId]);

  // Fetch products from API
  const start = (page - 1) * ITEMS_PER_PAGE;

  const { data, isLoading, isError, error, refetch } = useGet<ProductsResponse>(
    {
      path: "products/public",
      query: {
        limit: ITEMS_PER_PAGE,
        start,
        ...(activeCategoryId !== "all" ? { categoryId: activeCategoryId } : {}),
      },
      options: {
        staleTime: 1000 * 60 * 5,
      },
    },
  );

  const products = data?.data ?? [];
  const totalItems = data?.meta?.total ?? 0;
  const totalPages = Math.max(
    1,
    data?.meta?.totalPages ?? Math.ceil(totalItems / ITEMS_PER_PAGE),
  );
  const currentPage = page;

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

  const activeFiltersCount = activeCategoryId !== "all" ? 1 : 0;

  return (
    <div className="min-h-screen bg-white">
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
              {isLoading ? "..." : `${totalItems} ${t("common.items")}`}
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
          <div className="flex-1">
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

            {!isLoading && !isError && totalItems > ITEMS_PER_PAGE && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-navy-500">
                  {t("common.pageOf", {
                    page: currentPage,
                    total: totalPages,
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    {t("common.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setPage((prev) => Math.min(totalPages, prev + 1))
                    }
                  >
                    {t("common.next")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
