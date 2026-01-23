import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, User, Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { LanguageSwitcher, LanguageSwitcherMobile } from '@/components/LanguageSwitcher'
import { CartDrawer } from '@/components/CartDrawer'

export function Header() {
  const { t } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)

  const navLinks = [
    { name: t('nav.shop'), href: '/shop' },
    { name: t('nav.collections'), href: '/collections' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.contact'), href: '/contact' },
  ]

  // Handle scroll effect for header styling
  useState(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  })

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`
        sticky top-0 z-50 w-full border-b transition-all duration-300
        ${
          isScrolled
            ? 'border-neutral-200 bg-background/95 shadow-sm backdrop-blur-md'
            : 'border-transparent bg-background/80 backdrop-blur-sm'
        }
      `}
    >
      <div className="container mx-auto">
        <div className="flex h-20 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link to="/" className="relative z-10">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="font-display text-2xl font-light tracking-tight text-neutral-900 md:text-3xl">
                Bendouha
              </h1>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <NavigationLink href={link.href}>
                    {link.name}
                  </NavigationLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Language Switcher - Desktop */}
            <LanguageSwitcher className="hidden md:block" />

            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="hidden rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:block"
              aria-label={t('common.search')}
            >
              <Search className="h-5 w-5" />
            </motion.button>

            {/* Account Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="hidden rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:block"
              aria-label={t('common.account')}
            >
              <User className="h-5 w-5" />
            </motion.button>

            {/* Cart Drawer */}
            <CartDrawer />

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
                  aria-label={t('common.menu')}
                >
                  <Menu className="h-5 w-5" />
                </motion.button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl font-light tracking-tight">
                    {t('common.menu')}
                  </SheetTitle>
                </SheetHeader>
                <MobileNavigation navLinks={navLinks} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

// Navigation Link Component with hover animation
function NavigationLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      to={href}
      className="relative text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <motion.span
        className="absolute -bottom-1 start-0 h-[2px] w-full bg-neutral-900"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ originX: 0 }}
      />
    </Link>
  )
}

// Mobile Navigation Component
interface MobileNavigationProps {
  navLinks: { name: string; href: string }[]
}

function MobileNavigation({ navLinks }: MobileNavigationProps) {
  const { t } = useTranslation()

  return (
    <nav className="mt-8">
      <ul className="space-y-1">
        {navLinks.map((link, index) => (
          <motion.li
            key={link.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Link
              to={link.href}
              className="block rounded-lg px-4 py-3 text-lg font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              {link.name}
            </Link>
          </motion.li>
        ))}
      </ul>

      {/* Mobile Actions */}
      <div className="mt-8 space-y-3 border-t border-neutral-200 pt-6">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-neutral-700 transition-colors hover:bg-neutral-100"
        >
          <Search className="h-5 w-5" />
          <span className="font-medium">{t('common.search')}</span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-neutral-700 transition-colors hover:bg-neutral-100"
        >
          <User className="h-5 w-5" />
          <span className="font-medium">{t('common.account')}</span>
        </motion.button>
      </div>

      {/* Language Switcher - Mobile */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="mt-6 border-t border-neutral-200 pt-6"
      >
        <LanguageSwitcherMobile />
      </motion.div>
    </nav>
  )
}
