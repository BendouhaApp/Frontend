import { motion } from 'framer-motion'
import { Hero } from '@/components/Hero'
import { CategoryGrid, CategoryGridMinimal } from '@/components/CategoryGrid'
import { FeaturedProducts } from '@/components/ProductGrid'
import { DURATION, EASE } from '@/lib/motion'

export function Home() {
  const handleAddToCart = (product: { name: string }) => {
    // UI only - no actual cart logic
    console.log('Add to cart:', product.name)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.normal, ease: EASE.out }}
      className="flex flex-col"
    >
      {/* Hero Section */}
      <Hero />

      {/* Category Links (minimal) */}
      <CategoryGridMinimal />

      {/* Featured Products Section */}
      <FeaturedProducts count={4} onAddToCart={handleAddToCart} />

      {/* Category Grid Section */}
      <CategoryGrid />
    </motion.div>
  )
}
