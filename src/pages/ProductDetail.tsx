import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getProductById } from '@/data/products'
import { cn } from '@/lib/utils'

// Image Gallery Component
function ImageGallery({ images, productName }: { images: string[]; productName: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row lg:gap-6">
      {/* Thumbnails */}
      <div className="flex gap-3 lg:flex-col">
        {images.map((image, index) => (
          <motion.button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 lg:h-24 lg:w-24',
              selectedIndex === index && 'ring-2 ring-primary ring-offset-2'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              src={image}
              alt={`${productName} view ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </motion.button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-neutral-100">
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={images[selectedIndex]}
            alt={productName}
            className="aspect-square w-full object-cover lg:aspect-[4/5]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
      </div>
    </div>
  )
}

// Size Selector Component
function SizeSelector({
  sizes,
  selected,
  onSelect,
}: {
  sizes: string[]
  selected: string
  onSelect: (size: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-900">Size</span>
        <button className="text-sm text-neutral-500 underline hover:text-neutral-700">
          Size Guide
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <motion.button
            key={size}
            onClick={() => onSelect(size)}
            className={cn(
              'rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors',
              selected === size
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {size}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// Color Selector Component
function ColorSelector({
  colors,
  selected,
  onSelect,
}: {
  colors: { name: string; value: string }[]
  selected: string
  onSelect: (color: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-neutral-900">Color:</span>
        <span className="text-sm text-neutral-600">{selected}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <motion.button
            key={color.name}
            onClick={() => onSelect(color.name)}
            className={cn(
              'relative h-10 w-10 rounded-full',
              selected === color.name && 'ring-2 ring-primary ring-offset-2'
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
                    'h-5 w-5',
                    color.value === '#FFFFF0' || color.value === '#F5F5F0' || color.value === '#E8E4DC'
                      ? 'text-neutral-900'
                      : 'text-white'
                  )}
                />
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// Quantity Selector Component
function QuantitySelector({
  quantity,
  onQuantityChange,
}: {
  quantity: number
  onQuantityChange: (quantity: number) => void
}) {
  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-neutral-900">Quantity</span>
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
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Product Info Features
function ProductFeatures() {
  const features = [
    { icon: Truck, text: 'Free shipping over $150' },
    { icon: Shield, text: '2-year warranty' },
    { icon: RotateCcw, text: '30-day returns' },
  ]

  return (
    <div className="grid grid-cols-3 gap-4 rounded-xl bg-neutral-50 p-4">
      {features.map(({ icon: Icon, text }) => (
        <div key={text} className="flex flex-col items-center gap-2 text-center">
          <Icon className="h-5 w-5 text-neutral-600" />
          <span className="text-xs text-neutral-600">{text}</span>
        </div>
      ))}
    </div>
  )
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const product = getProductById(id || '1')

  // UI State (no actual logic)
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '')
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || '')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Fallback for missing product
  if (!product) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
        <h1 className="mb-4 text-2xl font-medium text-neutral-900">Product not found</h1>
        <Button asChild>
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    )
  }

  const images = product.images || [product.image]
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  // UI only handlers
  const handleAddToCart = () => {
    console.log('Add to cart:', {
      product: product.name,
      size: selectedSize,
      color: selectedColor,
      quantity,
    })
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    console.log('Wishlist:', product.name)
  }

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
            Back to Shop
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
            <ImageGallery images={images} productName={product.name} />
          </motion.div>

          {/* Right: Product Info (Sticky on Desktop) */}
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
                      'rounded-full px-3 py-1 text-xs font-medium',
                      product.badge === 'new' && 'bg-primary text-primary-foreground',
                      product.badge === 'sale' && 'bg-red-500 text-white',
                      product.badge === 'bestseller' && 'bg-amber-500 text-white'
                    )}
                  >
                    {product.badge === 'sale'
                      ? `-${discount}%`
                      : product.badge === 'new'
                        ? t('common.newArrival')
                        : t('common.bestSeller')}
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
                          'h-4 w-4',
                          i < Math.floor(product.rating!)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-neutral-200 text-neutral-200'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-neutral-700">
                    {product.rating}
                  </span>
                  <span className="text-sm text-neutral-500">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-medium text-neutral-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-neutral-400 line-through">
                    ${product.originalPrice.toFixed(2)}
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
              <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  size="lg"
                  className="flex-1 rounded-full"
                  onClick={handleAddToCart}
                  disabled={product.inStock === false}
                >
                  <ShoppingBag className="me-2 h-5 w-5" />
                  {product.inStock === false ? t('common.outOfStock') : t('common.addToCart')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={cn(
                    'rounded-full',
                    isWishlisted && 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
                  )}
                  onClick={handleWishlist}
                >
                  <Heart
                    className={cn('h-5 w-5', isWishlisted && 'fill-current')}
                  />
                </Button>
              </div>

              {/* Features */}
              <ProductFeatures />

              {/* Product Details */}
              <div className="space-y-4 pt-4">
                {product.dimensions && (
                  <div className="flex justify-between border-b border-neutral-100 pb-3">
                    <span className="text-sm text-neutral-500">Dimensions</span>
                    <span className="text-sm font-medium text-neutral-900">
                      {product.dimensions}
                    </span>
                  </div>
                )}
                {product.materials && (
                  <div className="flex justify-between border-b border-neutral-100 pb-3">
                    <span className="text-sm text-neutral-500">Materials</span>
                    <span className="text-sm font-medium text-neutral-900">
                      {product.materials.join(', ')}
                    </span>
                  </div>
                )}
                {product.care && (
                  <div className="space-y-2">
                    <span className="text-sm text-neutral-500">Care Instructions</span>
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
  )
}
