import { motion } from 'framer-motion'
import { Hero } from '@/components/Hero'

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Hero />

      {/* Featured Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-light tracking-tight text-neutral-900 md:text-4xl">
              Featured Products
            </h2>
            <p className="mt-4 text-neutral-600">
              Handpicked selections for the discerning customer
            </p>
          </motion.div>

          {/* Product Grid Placeholder */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group cursor-pointer"
              >
                <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-neutral-100">
                  <div className="flex h-full items-center justify-center text-neutral-400">
                    Product Image
                  </div>
                </div>
                <h3 className="text-lg font-medium text-neutral-900">
                  Product Name
                </h3>
                <p className="mt-1 text-neutral-600">$299.00</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
