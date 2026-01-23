import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { staggerContainer, staggerItem, fadeInUp, DURATION, EASE } from '@/lib/motion'

export function About() {
  const { t } = useTranslation()

  const values = [
    {
      title: 'Quality Craftsmanship',
      description: 'Every piece is carefully selected for its exceptional quality and timeless design.',
    },
    {
      title: 'Sustainable Sourcing',
      description: 'We partner with artisans who share our commitment to ethical and sustainable practices.',
    },
    {
      title: 'Curated Selection',
      description: 'Our collection is thoughtfully curated to bring you only the finest home furnishings.',
    },
  ]

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
            {t('about.subtitle')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: DURATION.slow, ease: EASE.out }}
            className="font-display text-4xl font-light tracking-tight text-neutral-900 md:text-5xl lg:text-6xl"
          >
            {t('about.title')}
          </motion.h1>
        </div>
      </motion.section>

      {/* Story Section */}
      <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: DURATION.slower, ease: EASE.out }}
            className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100"
          >
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80"
              alt="Our story"
              className="h-full w-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: DURATION.slower, ease: EASE.out, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <h2 className="font-display text-3xl font-light tracking-tight text-neutral-900 md:text-4xl">
              Crafting Beautiful Spaces Since 2015
            </h2>
            <div className="mt-6 space-y-4 text-neutral-600">
              <p className="text-lg leading-relaxed">
                Bendouha began with a simple vision: to bring exceptional craftsmanship
                and timeless design into every home. What started as a small curated
                collection has grown into a destination for those who appreciate the
                finer things in life.
              </p>
              <p className="leading-relaxed">
                We believe that your home should be a reflection of your personal style—a
                sanctuary that inspires and comforts. That's why we carefully select each
                piece in our collection, working directly with skilled artisans who share
                our passion for quality and authenticity.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-neutral-50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: DURATION.slow, ease: EASE.out }}
            className="mb-12 text-center font-display text-3xl font-light tracking-tight text-neutral-900 md:text-4xl"
          >
            Our Values
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="grid gap-8 md:grid-cols-3"
          >
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                variants={staggerItem}
                className="rounded-2xl bg-white p-8 shadow-sm"
              >
                <span className="mb-4 inline-block text-4xl font-light text-neutral-300">
                  0{index + 1}
                </span>
                <h3 className="mb-3 text-xl font-medium text-neutral-900">
                  {value.title}
                </h3>
                <p className="text-neutral-600">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
