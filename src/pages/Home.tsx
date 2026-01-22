import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-neutral-50 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-5xl font-light tracking-tight text-neutral-900 md:text-7xl">
              Discover Timeless
              <br />
              <span className="font-semibold">Elegance</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-neutral-600 md:text-xl">
              Curated collections that blend modern design with classic
              sophistication
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Link
                to="/shop"
                className="inline-flex items-center space-x-2 rounded-full bg-neutral-900 px-8 py-4 text-sm font-medium text-white transition-all hover:bg-neutral-800"
              >
                <span>Explore Collection</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

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
