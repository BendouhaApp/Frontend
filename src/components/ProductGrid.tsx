import { motion, type Variants } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { products, getFeaturedProducts, type Product } from '@/data/products'
import { cn } from '@/lib/utils'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

interface ProductGridProps {
  /** Custom title for the section */
  title?: string
  /** Custom subtitle */
  subtitle?: string
  /** Products to display (defaults to all products) */
  products?: Product[]
  /** Number of columns on different breakpoints */
  columns?: 2 | 3 | 4
  /** Show "View All" button */
  showViewAll?: boolean
  /** Link for View All button */
  viewAllLink?: string
  /** Card variant */
  cardVariant?: 'default' | 'compact' | 'detailed'
  /** Additional class names */
  className?: string
  /** Callback when add to cart is clicked */
  onAddToCart?: (product: Product) => void
}

export function ProductGrid({
  title,
  subtitle,
  products: customProducts,
  columns = 4,
  showViewAll = true,
  viewAllLink = '/shop',
  cardVariant = 'default',
  className,
  onAddToCart,
}: ProductGridProps) {
  const { t } = useTranslation()
  const displayProducts = customProducts || products

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <section className={cn('section-padding bg-background', className)}>
      <div className="container mx-auto">
        {/* Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 flex flex-col items-center justify-between gap-4 text-center md:mb-16 md:flex-row md:text-start"
          >
            <div>
              {title && (
                <h2 className="font-display text-4xl font-light tracking-tight text-neutral-900 md:text-5xl">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-3 max-w-2xl text-lg text-neutral-600">
                  {subtitle}
                </p>
              )}
            </div>

            {showViewAll && (
              <Button
                variant="outline"
                className="group rounded-full"
                asChild
              >
                <a href={viewAllLink}>
                  {t('common.viewAll')}
                  <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </a>
              </Button>
            )}
          </motion.div>
        )}

        {/* Product Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className={cn('grid gap-6 md:gap-8', gridCols[columns])}
        >
          {displayProducts.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard
                product={product}
                variant={cardVariant}
                onAddToCart={onAddToCart}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Featured Products Section
export function FeaturedProducts({
  count = 4,
  onAddToCart,
}: {
  count?: number
  onAddToCart?: (product: Product) => void
}) {
  const { t } = useTranslation()
  const featuredProducts = getFeaturedProducts(count)

  return (
    <ProductGrid
      title={t('products.featured')}
      subtitle={t('products.featuredSubtitle')}
      products={featuredProducts}
      columns={count === 3 ? 3 : 4}
      onAddToCart={onAddToCart}
    />
  )
}

// New Arrivals Section
export function NewArrivals({
  onAddToCart,
}: {
  onAddToCart?: (product: Product) => void
}) {
  const { t } = useTranslation()
  const newProducts = products.filter((p) => p.badge === 'new')

  return (
    <ProductGrid
      title={t('products.newArrivals')}
      products={newProducts}
      columns={3}
      showViewAll
      viewAllLink="/shop?filter=new"
      onAddToCart={onAddToCart}
    />
  )
}

// Sale Products Section
export function SaleProducts({
  onAddToCart,
}: {
  onAddToCart?: (product: Product) => void
}) {
  const { t } = useTranslation()
  const saleProducts = products.filter((p) => p.badge === 'sale')

  return (
    <section className="section-padding bg-red-50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-red-500 px-4 py-1 text-sm font-medium text-white">
            {t('common.sale')}
          </span>
          <h2 className="font-display text-4xl font-light tracking-tight text-neutral-900 md:text-5xl">
            {t('common.sale')}
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {saleProducts.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard
                product={product}
                variant="detailed"
                onAddToCart={onAddToCart}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Horizontal scrollable product list
export function ProductCarousel({
  title,
  products: customProducts,
  onAddToCart,
}: {
  title?: string
  products?: Product[]
  onAddToCart?: (product: Product) => void
}) {
  const { t } = useTranslation()
  const displayProducts = customProducts || products

  return (
    <section className="section-padding-sm bg-background">
      <div className="container mx-auto">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 flex items-center justify-between"
          >
            <h2 className="font-display text-3xl font-light tracking-tight text-neutral-900">
              {title}
            </h2>
            <Button variant="ghost" className="group" asChild>
              <a href="/shop">
                {t('common.viewAll')}
                <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </a>
            </Button>
          </motion.div>
        )}

        <div className="-mx-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex gap-6"
          >
            {displayProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="w-72 flex-shrink-0"
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
