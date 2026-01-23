import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, Eye, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/api'

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
    new: 'bg-cyan text-navy',
    sale: 'bg-gold text-navy',
    bestseller: 'bg-primary text-white',
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
      className={cn('group block focus-visible:outline-none', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      aria-label={`${product.name} - $${product.price.toFixed(2)}`}
    >
      {/* Image Container */}
      <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-lg bg-navy-50 sm:mb-4 sm:rounded-xl">
        {/* Loading skeleton with shimmer effect */}
        {!imageLoaded && (
          <div className="absolute inset-0 overflow-hidden bg-navy-100">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-navy-100 via-navy-50 to-navy-100" />
          </div>
        )}

        {/* Product Image */}
        <motion.img
          src={product.image}
          alt=""
          loading="lazy"
          decoding="async"
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
              'absolute start-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium sm:start-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs',
              badgeColors[product.badge]
            )}
          >
            {badgeText[product.badge]}
          </span>
        )}

        {/* Out of Stock Overlay */}
        {product.inStock === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy sm:px-4 sm:py-2 sm:text-sm">
              {t('common.outOfStock')}
            </span>
          </div>
        )}

        {/* Wishlist Button - Always visible on mobile for better touch access */}
        <motion.button
          initial={{ opacity: 1 }}
          animate={{ opacity: isHovered || isWishlisted ? 1 : 0.7 }}
          transition={{ duration: 0.2 }}
          onClick={handleWishlist}
          className={cn(
            'absolute end-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors sm:end-3 sm:top-3 sm:h-9 sm:w-9',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            isWishlisted
              ? 'text-gold'
              : 'text-navy-600 hover:text-navy'
          )}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
          type="button"
        >
          <Heart
            className={cn('h-4 w-4', isWishlisted && 'fill-current')}
            aria-hidden="true"
          />
        </motion.button>

        {/* Quick Actions Overlay - Hidden on mobile for cleaner look */}
        <AnimatePresence>
          {isHovered && product.inStock !== false && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-2 bottom-2 hidden gap-2 sm:inset-x-3 sm:bottom-3 sm:flex"
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
      <div className="space-y-1 sm:space-y-2">
        {/* Category */}
        <span className="text-[10px] font-medium uppercase tracking-wider text-navy-500 sm:text-xs">
          {product.category}
        </span>

        {/* Name */}
        <h3 className="line-clamp-2 text-sm font-medium leading-tight text-navy transition-colors group-hover:text-primary sm:text-base md:text-lg">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-sm font-medium text-navy sm:text-base md:text-lg">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-navy-400 line-through sm:text-sm">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Rating - Hidden on very small screens */}
        {product.rating && (
          <div className="hidden items-center gap-1 xs:flex">
            <Star className="h-3.5 w-3.5 fill-gold text-gold sm:h-4 sm:w-4" aria-hidden="true" />
            <span className="text-xs font-medium text-navy-700 sm:text-sm">
              {product.rating}
            </span>
            {product.reviewCount && (
              <span className="text-sm text-navy-500">
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
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-navy-50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-center">
        <span className="text-xs text-navy-500">{product.category}</span>
        <h3 className="font-medium text-navy group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-medium text-navy">
            ${product.price.toFixed(2)}
          </span>
          {product.inStock !== false && (
            <Button
              onClick={handleAddToCart}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-primary hover:text-primary-600"
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
    new: 'bg-cyan text-navy',
    sale: 'bg-gold text-navy',
    bestseller: 'bg-primary text-white',
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
      <div className="relative aspect-square overflow-hidden bg-navy-50">
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
            isWishlisted ? 'text-gold' : 'text-navy-600 hover:text-navy'
          )}
        >
          <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-navy-500">
              {product.category}
            </span>
            <h3 className="mt-1 text-lg font-medium text-navy">
              {product.name}
            </h3>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 rounded-full bg-gold-50 px-2 py-1">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              <span className="text-sm font-medium text-navy">{product.rating}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="mb-4 text-sm text-navy-600 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-medium text-navy">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-navy-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={product.inStock === false}
            size="sm"
            className="rounded-full bg-primary hover:bg-primary-600"
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
