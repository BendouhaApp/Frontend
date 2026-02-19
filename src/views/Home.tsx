"use client";

import { Hero } from '@/components/Hero'
import { CategoryGrid, CategoryGridMinimal } from '@/components/CategoryGrid'
import { FeaturedProducts } from '@/components/ProductGrid'

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Hero />

      {/* Category Links (minimal) */}
      <CategoryGridMinimal />

      {/* Featured Products Section */}
      <FeaturedProducts count={4} />

      {/* Category Grid Section */}
      <CategoryGrid />
    </div>
  )
}

