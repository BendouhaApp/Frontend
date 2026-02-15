import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { staggerContainer, staggerItem, fadeInUp, DURATION, EASE, hoverLift } from '@/lib/motion'
import { useGet } from '@/hooks/useGet'
import type { ApiResponse, Category } from '@/types/api'
import { cn } from '@/lib/utils'

export function Collections() {
  const { t } = useTranslation()
  const { data } = useGet<ApiResponse<Category[]>>({
    path: 'categories',
    options: {
      staleTime: 1000 * 60 * 10,
    },
  })
  const collections =
    data?.data?.map((cat) => ({
      id: cat.id,
      name: cat.category_name,
      description: cat.category_description ?? '',
      image: cat.image ?? null,
      itemCount: cat.other_categories?.length ?? 0,
    })) ?? []

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="border-b border-neutral-200 bg-neutral-50/50"
      >
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4 inline-block text-sm font-medium uppercase tracking-wider text-neutral-500"
          >
            Explorer
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: DURATION.slow, ease: EASE.out }}
            className="font-display text-4xl font-light tracking-tight text-neutral-900 md:text-5xl lg:text-6xl"
          >
            {t('nav.collections')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: DURATION.slow, ease: EASE.out }}
            className="mt-4 max-w-xl text-lg text-neutral-600"
          >
            Decouvrez nos collections soigneusement composees pour transformer votre espace.
          </motion.p>
        </div>
      </motion.section>

      {/* Collections Grid */}
      <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {collections.map((collection) => (
            <motion.div key={collection.id} variants={staggerItem}>
              <Link to={`/shop?category=${collection.id}`} className="group block">
                <motion.div
                  whileHover={hoverLift}
                  className="overflow-hidden rounded-2xl bg-neutral-100"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {collection.image ? (
                      <motion.img
                        src={collection.image}
                        alt={collection.name}
                        className="h-full w-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                      />
                    ) : (
                      <div
                        className={cn(
                          'flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-200 via-neutral-100 to-white'
                        )}
                      >
                        <span className="text-sm font-medium text-neutral-600">
                          {collection.name}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        {collection.itemCount} articles
                      </span>
                      <h3 className="text-2xl font-medium text-white">
                        {collection.name}
                      </h3>
                      <p className="mt-1 text-sm text-white/80">
                        {collection.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between bg-white p-4">
                    <span className="text-sm font-medium text-neutral-900">
                      Explorer la collection
                    </span>
                    <motion.span
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  )
}
