import { Link } from 'react-router-dom'
import { Instagram, Facebook, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
              Bendouha
            </h2>
            <p className="text-sm text-neutral-600">
              Premium e-commerce experience crafted with attention to detail.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4 text-sm font-medium text-neutral-900">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/shop"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/collections"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  to="/new-arrivals"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="/sale"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-medium text-neutral-900">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/press"
                  className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow */}
          <div>
            <h3 className="mb-4 text-sm font-medium text-neutral-900">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 transition-colors hover:text-neutral-900"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 transition-colors hover:text-neutral-900"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 transition-colors hover:text-neutral-900"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-200 pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-neutral-600">
              © {new Date().getFullYear()} Bendouha. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/privacy"
                className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
