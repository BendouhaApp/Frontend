import { Hero } from '@/components/Hero'
import { CategoryGrid, CategoryGridMinimal } from '@/components/CategoryGrid'

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Hero />

      {/* Category Links (minimal) */}
      <CategoryGridMinimal />

      {/* Category Grid Section */}
      <CategoryGrid />
    </div>
  )
}
