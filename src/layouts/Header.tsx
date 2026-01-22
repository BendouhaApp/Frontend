import { Link } from 'react-router-dom'
import { ShoppingBag, Search, User, Menu } from 'lucide-react'
import { motion } from 'framer-motion'

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Bendouha
            </h1>
          </motion.div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center space-x-8 md:flex">
          <Link
            to="/shop"
            className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            Shop
          </Link>
          <Link
            to="/collections"
            className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            Collections
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            Contact
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button
            className="text-neutral-600 transition-colors hover:text-neutral-900"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            className="text-neutral-600 transition-colors hover:text-neutral-900"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </button>
          <button
            className="relative text-neutral-600 transition-colors hover:text-neutral-900"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-xs text-white">
              0
            </span>
          </button>
          <button
            className="text-neutral-600 transition-colors hover:text-neutral-900 md:hidden"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.header>
  )
}
