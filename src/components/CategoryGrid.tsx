import { motion, type Variants } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// Category data structure (translations handled separately)
const categoryData = [
  {
    id: '1',
    nameKey: 'categories.livingRoom',
    descKey: 'categories.livingRoomDesc',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    itemCount: 42,
  },
  {
    id: '2',
    nameKey: 'categories.bedroom',
    descKey: 'categories.bedroomDesc',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
    itemCount: 38,
  },
  {
    id: '3',
    nameKey: 'categories.kitchen',
    descKey: 'categories.kitchenDesc',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    itemCount: 56,
  },
  {
    id: '4',
    nameKey: 'categories.lighting',
    descKey: 'categories.lightingDesc',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    itemCount: 31,
  },
  {
    id: '5',
    nameKey: 'categories.textiles',
    descKey: 'categories.textilesDesc',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80',
    itemCount: 67,
  },
  {
    id: '6',
    nameKey: 'categories.decor',
    descKey: 'categories.decorDesc',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
    itemCount: 89,
  },
]

// Animation variants
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

interface CategoryGridProps {
  /** Section title */
  title?: string
  /** Section subtitle */
  subtitle?: string
  /** Show item count on cards */
  showItemCount?: boolean
}

export function CategoryGrid({
  title,
  subtitle,
  showItemCount = true,
}: CategoryGridProps) {
  const { t } = useTranslation()

  const displayTitle = title ?? t('categories.title')
  const displaySubtitle = subtitle ?? t('categories.subtitle')

  // Build categories with translations
  const categories = categoryData.map((cat) => ({
    ...cat,
    name: t(cat.nameKey),
    description: t(cat.descKey),
  }))

  return (
    <section className="section-padding bg-navy-50">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center md:mb-16"
        >
          <h2 className="font-display text-4xl font-light tracking-tight text-navy md:text-5xl">
            {displayTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-600">
            {displaySubtitle}
          </p>
        </motion.div>

        {/* Category Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              showItemCount={showItemCount}
              exploreText={t('categories.exploreCollection')}
              itemsText={t('common.items')}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Individual Category Card Component
interface Category {
  id: string
  name: string
  description: string
  image: string
  itemCount: number
}

interface CategoryCardProps {
  category: Category
  showItemCount?: boolean
  exploreText: string
  itemsText: string
}

function CategoryCard({ category, showItemCount, exploreText, itemsText }: CategoryCardProps) {
  return (
    <motion.a
      href={`/category/${category.id}`}
      variants={itemVariants}
      className="group relative block overflow-hidden rounded-xl bg-navy-100"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Image */}
        <motion.img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        {/* Overlay - darkens on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          {/* Item Count Badge */}
          {showItemCount && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-3 w-fit rounded-full bg-primary/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
            >
              {category.itemCount} {itemsText}
            </motion.span>
          )}

          {/* Title */}
          <h3 className="text-2xl font-light text-white md:text-3xl">
            {category.name}
          </h3>

          {/* Description - reveals on hover */}
          <p className="mt-2 max-h-0 overflow-hidden text-sm text-white/80 opacity-0 transition-all duration-300 group-hover:max-h-20 group-hover:opacity-100">
            {category.description}
          </p>

          {/* Explore link - reveals on hover */}
          <span className="mt-4 inline-flex translate-y-4 items-center text-sm font-medium text-cyan opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {exploreText}
            <svg
              className="ms-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
        </div>
      </div>
    </motion.a>
  )
}

// Alternative: Minimal Category Grid (no images, just text)
export function CategoryGridMinimal() {
  const { t } = useTranslation()

  const minimalCategories = [
    { id: '1', nameKey: 'categories.newArrivals', href: '/new' },
    { id: '2', nameKey: 'categories.bestSellers', href: '/best-sellers' },
    { id: '3', nameKey: 'categories.livingRoom', href: '/living-room' },
    { id: '4', nameKey: 'categories.bedroom', href: '/bedroom' },
    { id: '5', nameKey: 'categories.kitchen', href: '/kitchen' },
    { id: '6', nameKey: 'categories.outdoor', href: '/outdoor' },
    { id: '7', nameKey: 'categories.lighting', href: '/lighting' },
    { id: '8', nameKey: 'common.sale', href: '/sale' },
  ]

  return (
    <section className="section-padding-sm border-y border-navy-200 bg-navy-50">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12">
          {minimalCategories.map((cat, index) => (
            <motion.a
              key={cat.id}
              href={cat.href}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="group relative text-sm font-medium text-navy-600 transition-colors hover:text-primary md:text-base"
            >
              {t(cat.nameKey)}
              <span className="absolute -bottom-1 start-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

// Alternative: Featured Categories (larger cards, 2 columns)
export function CategoryGridFeatured() {
  const { t } = useTranslation()

  const featuredCategories = [
    {
      id: '1',
      nameKey: 'categories.theLivingCollection',
      descKey: 'categories.theLivingCollectionDesc',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
      ctaKey: 'categories.discoverLiving',
    },
    {
      id: '2',
      nameKey: 'categories.theBedroomEdit',
      descKey: 'categories.theBedroomEditDesc',
      image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=1200&q=80',
      ctaKey: 'categories.shopBedroom',
    },
  ]

  return (
    <section className="section-padding bg-navy-50">
      <div className="container mx-auto">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {featuredCategories.map((category, index) => (
            <motion.a
              key={category.id}
              href={`/collection/${category.id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="group relative block overflow-hidden rounded-2xl"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] md:aspect-[4/5]">
                <motion.img
                  src={category.image}
                  alt={t(category.nameKey)}
                  className="h-full w-full object-cover"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/40 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
                  <h3 className="font-display text-3xl font-light text-white md:text-4xl">
                    {t(category.nameKey)}
                  </h3>
                  <p className="mt-3 max-w-sm text-base text-white/80">
                    {t(category.descKey)}
                  </p>
                  <span className="mt-6 inline-flex items-center text-sm font-medium text-cyan transition-all duration-300 group-hover:translate-x-2 rtl:group-hover:-translate-x-2">
                    {t(category.ctaKey)}
                    <svg
                      className="ms-2 h-4 w-4 rtl:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
