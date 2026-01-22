import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
  category?: string
}

export function ProductCard({ id, name, price, image, category }: ProductCardProps) {
  return (
    <Link to={`/product/${id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group cursor-pointer"
      >
        <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-neutral-100">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {category && (
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-900 backdrop-blur-sm">
              {category}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-neutral-900 transition-colors group-hover:text-neutral-600">
            {name}
          </h3>
          <p className="text-neutral-600">${price.toFixed(2)}</p>
        </div>
      </motion.div>
    </Link>
  )
}
