import { motion, type Variants } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from '@/lib/router'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { SkeletonProductGrid } from '@/components/ui/skeleton'
import { useGet } from '@/hooks/useGet'
import { usePost } from '@/hooks/usePost'
import { useCart } from '@/hooks/useCart'
import type {
  Product,
  ProductsResponse,
  AddToCartPayload,
  CartItem,
  ApiResponse,
} from '@/types/api'
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
  /** Products to display */
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
  /** Loading state */
  isLoading?: boolean
}

export function ProductGrid({
  title,
  subtitle,
  products = [],
  columns = 4,
  showViewAll = true,
  viewAllLink = '/shop',
  cardVariant = 'default',
  className,
  onAddToCart,
  isLoading = false,
}: ProductGridProps) {
  const { t } = useTranslation()

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <section className={cn('section-padding bg-white', className)}>
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
                <h2 className="font-display text-4xl font-light tracking-tight text-navy md:text-5xl">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-3 max-w-2xl text-lg text-navy-600">
                  {subtitle}
                </p>
              )}
            </div>

            {showViewAll && (
              <Button
                variant="outline"
                className="group rounded-full border-primary text-primary hover:bg-primary hover:text-white"
                asChild
              >
                <Link to={viewAllLink}>
                  {t('common.viewAll')}
                  <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </Link>
              </Button>
            )}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && <SkeletonProductGrid count={columns} />}

        {/* Product Grid */}
        {!isLoading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className={cn('grid gap-6 md:gap-8', gridCols[columns])}
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard
                  product={product}
                  variant={cardVariant}
                  onAddToCart={onAddToCart}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

// Featured Products Section - Uses API
export function FeaturedProducts({
  count = 4,
  initialData,
}: {
  count?: number
  initialData?: ProductsResponse
}) {
  const { t } = useTranslation()
  const { cartId } = useCart()
  
  const { data, isLoading } = useGet<ProductsResponse>({
    path: 'products/public',
    query: {
      limit: count,
      sort: 'newest',
      view: 'card',
    },
    options: {
      staleTime: 1000 * 60 * 5,
      initialData,
    },
  })
  
  const products = (data?.data || []).slice(0, count)
  
  const addToCart = usePost<AddToCartPayload, ApiResponse<CartItem>>({
    path: cartId ? `cart/items?cart_id=${cartId}` : 'cart/items?cart_id=',
    method: 'post',
    successMessage: t('cart.addedToCart'),
    errorMessage: t('cart.addToCartError'),
  })

  const handleAddToCart = (product: Product) => {
    if (!cartId) return
    addToCart.mutate({
      product_id: product.id,
      quantity: 1,
    })
  }

  return (
    <ProductGrid
      title={t('products.featured')}
      subtitle={t('products.featuredSubtitle')}
      products={products}
      columns={count === 3 ? 3 : 4}
      onAddToCart={handleAddToCart}
      isLoading={isLoading}
    />
  )
}

// New Arrivals Section - Uses API
export function NewArrivals() {
  const { t } = useTranslation()
  const { cartId } = useCart()
  
  const { data, isLoading } = useGet<ProductsResponse>({
    path: 'products/public',
    query: {
      limit: 6,
      sort: 'newest',
      view: 'card',
    },
    options: {
      staleTime: 1000 * 60 * 5,
    },
  })
  
  // Get latest products (by created_at)
  const products = (data?.data || []).slice(0, 6)
  
  const addToCart = usePost<AddToCartPayload, ApiResponse<CartItem>>({
    path: cartId ? `cart/items?cart_id=${cartId}` : 'cart/items?cart_id=',
    method: 'post',
    successMessage: t('cart.addedToCart'),
    errorMessage: t('cart.addToCartError'),
  })

  const handleAddToCart = (product: Product) => {
    if (!cartId) return
    addToCart.mutate({
      product_id: product.id,
      quantity: 1,
    })
  }

  return (
    <ProductGrid
      title={t('products.newArrivals')}
      products={products}
      columns={3}
      showViewAll
      viewAllLink="/shop?filter=new"
      onAddToCart={handleAddToCart}
      isLoading={isLoading}
    />
  )
}

// Sale Products Section - Uses API
export function SaleProducts() {
  const { t } = useTranslation()
  const { cartId } = useCart()
  
  const { data, isLoading } = useGet<ProductsResponse>({
    path: 'products/public',
    query: {
      limit: 24,
      sort: 'price-desc',
      view: 'card',
    },
    options: {
      staleTime: 1000 * 60 * 5,
    },
  })
  
  // Show products with a discount when possible
  const discounted = (data?.data || []).filter(
    (p) => p.originalPrice && p.originalPrice > p.price
  )
  const products = (discounted.length ? discounted : data?.data || []).slice(0, 3)
  
  const addToCart = usePost<AddToCartPayload, ApiResponse<CartItem>>({
    path: cartId ? `cart/items?cart_id=${cartId}` : 'cart/items?cart_id=',
    method: 'post',
    successMessage: t('cart.addedToCart'),
    errorMessage: t('cart.addToCartError'),
  })

  const handleAddToCart = (product: Product) => {
    if (!cartId) return
    addToCart.mutate({
      product_id: product.id,
      quantity: 1,
    })
  }

  return (
    <section className="section-padding bg-gold-50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-gold px-4 py-1 text-sm font-medium text-navy">
            {t('common.sale')}
          </span>
          <h2 className="font-display text-4xl font-light tracking-tight text-navy md:text-5xl">
            {t('common.sale')}
          </h2>
        </motion.div>

        {isLoading && <SkeletonProductGrid count={3} />}

        {!isLoading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard
                  product={product}
                  variant="detailed"
                  onAddToCart={handleAddToCart}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

// Horizontal scrollable product list - Uses API
export function ProductCarousel({
  title,
  products = [],
  isLoading = false,
}: {
  title?: string
  products?: Product[]
  isLoading?: boolean
}) {
  const { t } = useTranslation()
  const { cartId } = useCart()
  
  const addToCart = usePost<AddToCartPayload, ApiResponse<CartItem>>({
    path: cartId ? `cart/items?cart_id=${cartId}` : 'cart/items?cart_id=',
    method: 'post',
    successMessage: t('cart.addedToCart'),
    errorMessage: t('cart.addToCartError'),
  })

  const handleAddToCart = (product: Product) => {
    if (!cartId) return
    addToCart.mutate({
      product_id: product.id,
      quantity: 1,
    })
  }

  return (
    <section className="section-padding-sm bg-white">
      <div className="container mx-auto">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 flex items-center justify-between"
          >
            <h2 className="font-display text-3xl font-light tracking-tight text-navy">
              {title}
            </h2>
            <Button variant="ghost" className="group text-primary hover:text-primary-600" asChild>
              <Link to="/shop">
                {t('common.viewAll')}
                <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        )}

        {isLoading && (
          <div className="flex gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-72 flex-shrink-0">
                <SkeletonProductGrid count={1} />
              </div>
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="-mx-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex gap-6"
            >
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  className="w-72 flex-shrink-0"
                >
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}


