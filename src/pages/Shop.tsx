import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Grid,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
} from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { products, type Product } from '@/data/products'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'large' | 'list'
type CardVariant = 'default' | 'compact' | 'detailed'

// Mock filter data
const categories = [
  { id: 'all', label: 'All Categories', count: 8 },
  { id: 'lighting', label: 'Lighting', count: 2 },
  { id: 'textiles', label: 'Textiles', count: 2 },
  { id: 'living-room', label: 'Living Room', count: 1 },
  { id: 'decor', label: 'Decor', count: 1 },
  { id: 'storage', label: 'Storage', count: 1 },
  { id: 'kitchen', label: 'Kitchen', count: 1 },
]

const priceRanges = [
  { id: 'all', label: 'All Prices' },
  { id: 'under-100', label: 'Under $100' },
  { id: '100-250', label: '$100 - $250' },
  { id: '250-500', label: '$250 - $500' },
  { id: 'over-500', label: 'Over $500' },
]

const sortOptions = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Highest Rated' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
}

// Filter Sidebar Component
function FilterSidebar({
  selectedCategory,
  setSelectedCategory,
  selectedPrice,
  setSelectedPrice,
  className,
}: {
  selectedCategory: string
  setSelectedCategory: (id: string) => void
  selectedPrice: string
  setSelectedPrice: (id: string) => void
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <aside className={cn('space-y-8', className)}>
      {/* Categories */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-neutral-500">
          {t('products.filterBy')}
        </h3>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-neutral-700 hover:bg-neutral-100'
                )}
              >
                <span>{category.label}</span>
                <span
                  className={cn(
                    'text-xs',
                    selectedCategory === category.id
                      ? 'text-primary-foreground/70'
                      : 'text-neutral-400'
                  )}
                >
                  {category.count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-neutral-500">
          {t('products.priceRange')}
        </h3>
        <ul className="space-y-2">
          {priceRanges.map((range) => (
            <li key={range.id}>
              <button
                onClick={() => setSelectedPrice(range.id)}
                className={cn(
                  'flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors',
                  selectedPrice === range.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-neutral-700 hover:bg-neutral-100'
                )}
              >
                {range.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSelectedCategory('all')
          setSelectedPrice('all')
        }}
      >
        Clear Filters
      </Button>
    </aside>
  )
}

// Mobile Filter Drawer
function MobileFilterDrawer({
  isOpen,
  onClose,
  selectedCategory,
  setSelectedCategory,
  selectedPrice,
  setSelectedPrice,
}: {
  isOpen: boolean
  onClose: () => void
  selectedCategory: string
  setSelectedCategory: (id: string) => void
  selectedPrice: string
  setSelectedPrice: (id: string) => void
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 start-0 z-50 w-80 max-w-[85vw] bg-background shadow-xl lg:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                <h2 className="text-lg font-medium">Filters</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <FilterSidebar
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedPrice={selectedPrice}
                  setSelectedPrice={setSelectedPrice}
                />
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-200 p-4">
                <Button className="w-full" onClick={onClose}>
                  Show Results
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function Shop() {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  // Filter state (UI only - no actual filtering logic)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPrice, setSelectedPrice] = useState('all')
  const [selectedSort, setSelectedSort] = useState('featured')

  // UI only - no actual cart logic
  const handleAddToCart = (product: Product) => {
    console.log('Add to cart:', product.name)
  }

  const handleQuickView = (product: Product) => {
    console.log('Quick view:', product.name)
  }

  const handleWishlist = (product: Product) => {
    console.log('Wishlist:', product.name)
  }

  // Map view mode to card variant and grid columns
  const getViewConfig = (): { variant: CardVariant; gridClass: string } => {
    switch (viewMode) {
      case 'large':
        return {
          variant: 'detailed',
          gridClass: 'grid-cols-1 sm:grid-cols-2',
        }
      case 'list':
        return {
          variant: 'compact',
          gridClass: 'grid-cols-1',
        }
      default:
        return {
          variant: 'default',
          gridClass: 'grid-cols-2 lg:grid-cols-3',
        }
    }
  }

  const { variant, gridClass } = getViewConfig()

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) + (selectedPrice !== 'all' ? 1 : 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
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
        className="border-b border-neutral-200 bg-neutral-50/50"
      >
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <h1 className="font-display text-4xl font-light tracking-tight text-neutral-900 md:text-5xl">
            {t('nav.shop')}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600">
            {t('products.featuredSubtitle')}
          </p>
        </div>
      </motion.div>

      {/* Toolbar */}
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4 md:px-6">
          {/* Left: Filter Button (mobile) + Product Count */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowFilters(true)}
            >
              <SlidersHorizontal className="me-2 h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ms-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            <p className="text-sm text-neutral-600">
              {products.length} {t('common.items')}
            </p>
          </div>

          {/* Right: Sort + View Toggles */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="hidden gap-2 sm:flex"
                onClick={() => setSortOpen(!sortOpen)}
              >
                {t('products.sortBy')}:{' '}
                <span className="font-normal text-neutral-600">
                  {sortOptions.find((o) => o.id === selectedSort)?.label}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    sortOpen && 'rotate-180'
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
                      className="absolute end-0 top-full z-20 mt-2 w-48 rounded-lg border border-neutral-200 bg-background py-1 shadow-lg"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSelectedSort(option.id)
                            setSortOpen(false)
                          }}
                          className={cn(
                            'flex w-full items-center px-4 py-2 text-sm transition-colors',
                            selectedSort === option.id
                              ? 'bg-neutral-100 text-neutral-900'
                              : 'text-neutral-700 hover:bg-neutral-50'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* View Mode Toggles */}
            <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'large' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('large')}
                aria-label="Large grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('list')}
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
                <span className="text-sm text-neutral-500">Active filters:</span>
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm">
                    {categories.find((c) => c.id === selectedCategory)?.label}
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="ms-1 rounded-full p-0.5 hover:bg-neutral-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedPrice !== 'all' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm">
                    {priceRanges.find((p) => p.id === selectedPrice)?.label}
                    <button
                      onClick={() => setSelectedPrice('all')}
                      className="ms-1 rounded-full p-0.5 hover:bg-neutral-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedPrice('all')
                  }}
                  className="text-sm text-neutral-500 underline hover:text-neutral-700"
                >
                  Clear all
                </button>
              </motion.div>
            )}

            <motion.div
              key={viewMode}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={cn('grid gap-6', gridClass)}
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
          </div>
        </div>
      </div>
    </div>
  )
}
