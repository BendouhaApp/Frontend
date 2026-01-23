import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, Eye, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Product } from '@/data/products'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'detailed'
  onAddToCart?: (product: Product) => void
  onQuickView?: (product: Product) => void
  onWishlist?: (product: Product) => void
  className?: string
}

export function ProductCard({
  product,
  variant = 'default',
  onAddToCart,
  onQuickView,
  onWishlist,
  className,
}: ProductCardProps) {
  const { t } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAddToCart?.(product)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(product)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    onWishlist?.(product)
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const badgeText = {
    new: t('common.newArrival'),
    sale: `-${discount}%`,
    bestseller: t('common.bestSeller'),
  }

  const badgeColors = {
    new: 'bg-primary text-primary-foreground',
    sale: 'bg-red-500 text-white',
    bestseller: 'bg-amber-500 text-white',
  }

  if (variant === 'compact') {
    return (
      <CompactProductCard
        product={product}
        onAddToCart={onAddToCart}
        className={className}
      />
    )
  }

  if (variant === 'detailed') {
    return (
      <DetailedProductCard
        product={product}
        onAddToCart={onAddToCart}
        onWishlist={onWishlist}
        className={className}
      />
    )
  }

  return (
    <motion.a
      href={`/product/${product.id}`}
      className={cn('group block', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image Container */}
      <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-neutral-200" />
        )}

        {/* Product Image */}
        <motion.img
          src={product.image}
          alt={product.name}
          className={cn(
            'h-full w-full object-cover transition-all duration-500',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Badge */}
        {product.badge && (
          <span
            className={cn(
              'absolute start-3 top-3 rounded-full px-3 py-1 text-xs font-medium',
              badgeColors[product.badge]
            )}
          >
            {badgeText[product.badge]}
          </span>
        )}

        {/* Out of Stock Overlay */}
        {product.inStock === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-900">
              {t('common.outOfStock')}
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered || isWishlisted ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleWishlist}
          className={cn(
            'absolute end-3 top-3 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-colors',
            isWishlisted
              ? 'text-red-500'
              : 'text-neutral-600 hover:text-neutral-900'
          )}
          aria-label="Add to wishlist"
        >
          <Heart
            className={cn('h-4 w-4', isWishlisted && 'fill-current')}
          />
        </motion.button>

        {/* Quick Actions Overlay */}
        <AnimatePresence>
          {isHovered && product.inStock !== false && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-3 bottom-3 flex gap-2"
            >
              <Button
                onClick={handleAddToCart}
                className="flex-1 rounded-lg"
                size="sm"
              >
                <ShoppingBag className="me-2 h-4 w-4" />
                {t('common.addToCart')}
              </Button>
              <Button
                onClick={handleQuickView}
                variant="secondary"
                size="sm"
                className="rounded-lg"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        {/* Category */}
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          {product.category}
        </span>

        {/* Name */}
        <h3 className="text-lg font-medium text-neutral-900 transition-colors group-hover:text-neutral-600">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-neutral-900">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-neutral-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-neutral-700">
              {product.rating}
            </span>
            {product.reviewCount && (
              <span className="text-sm text-neutral-500">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}
      </div>
    </motion.a>
  )
}

// Compact variant - horizontal layout
function CompactProductCard({
  product,
  onAddToCart,
  className,
}: {
  product: Product
  onAddToCart?: (product: Product) => void
  className?: string
}) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAddToCart?.(product)
  }

  return (
    <a
      href={`/product/${product.id}`}
      className={cn(
        'group flex gap-4 rounded-xl bg-white p-3 transition-shadow hover:shadow-md',
        className
      )}
    >
      {/* Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-center">
        <span className="text-xs text-neutral-500">{product.category}</span>
        <h3 className="font-medium text-neutral-900 group-hover:text-neutral-600">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-medium text-neutral-900">
            ${product.price.toFixed(2)}
          </span>
          {product.inStock !== false && (
            <Button
              onClick={handleAddToCart}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </a>
  )
}

// Detailed variant - with description and more info
function DetailedProductCard({
  product,
  onAddToCart,
  onWishlist,
  className,
}: {
  product: Product
  onAddToCart?: (product: Product) => void
  onWishlist?: (product: Product) => void
  className?: string
}) {
  const { t } = useTranslation()
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAddToCart?.(product)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    onWishlist?.(product)
  }

  const badgeColors = {
    new: 'bg-primary text-primary-foreground',
    sale: 'bg-red-500 text-white',
    bestseller: 'bg-amber-500 text-white',
  }

  return (
    <motion.a
      href={`/product/${product.id}`}
      className={cn(
        'group block overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg',
        className
      )}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge */}
        {product.badge && (
          <span
            className={cn(
              'absolute start-4 top-4 rounded-full px-3 py-1 text-xs font-medium',
              badgeColors[product.badge]
            )}
          >
            {product.badge === 'sale'
              ? `-${Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%`
              : product.badge === 'new'
                ? t('common.newArrival')
                : t('common.bestSeller')}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className={cn(
            'absolute end-4 top-4 rounded-full bg-white/90 p-2.5 backdrop-blur-sm transition-colors',
            isWishlisted ? 'text-red-500' : 'text-neutral-600 hover:text-neutral-900'
          )}
        >
          <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              {product.category}
            </span>
            <h3 className="mt-1 text-lg font-medium text-neutral-900">
              {product.name}
            </h3>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="mb-4 text-sm text-neutral-600 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-medium text-neutral-900">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-neutral-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={product.inStock === false}
            size="sm"
            className="rounded-full"
          >
            <ShoppingBag className="me-2 h-4 w-4" />
            {product.inStock === false ? t('common.outOfStock') : t('common.addToCart')}
          </Button>
        </div>
      </div>
    </motion.a>
  )
}

// Export all variants
export { CompactProductCard, DetailedProductCard }
