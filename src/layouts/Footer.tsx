import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Instagram, Facebook, Twitter, Youtube, ArrowRight, MapPin, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Social link component with hover animation
function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ElementType
  label: string
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors',
        'hover:bg-primary hover:text-primary-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Follow us on ${label}`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </motion.a>
  )
}

// Footer link component
function FooterLink({
  to,
  children,
}: {
  to: string
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        to={to}
        className={cn(
          'group inline-flex items-center gap-1 py-1 text-sm text-neutral-600 transition-colors',
          'hover:text-neutral-900',
          'focus-visible:outline-none focus-visible:text-neutral-900 focus-visible:underline'
        )}
      >
        <span>{children}</span>
        <ArrowRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
      </Link>
    </li>
  )
}

export function Footer() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')

  const currentYear = new Date().getFullYear()

  // Shop links
  const shopLinks = [
    { to: '/shop', label: t('footer.allProducts') },
    { to: '/collections', label: t('footer.collections') },
    { to: '/shop?filter=new', label: t('footer.newArrivals') },
    { to: '/shop?filter=sale', label: t('footer.sale') },
  ]

  // Company links
  const companyLinks = [
    { to: '/about', label: t('footer.aboutUs') },
    { to: '/contact', label: t('footer.contact') },
    { to: '/careers', label: t('footer.careers') },
    { to: '/press', label: t('footer.press') },
  ]

  // Social links
  const socialLinks = [
    { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
    { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
    { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
    { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
  ]

  // Newsletter submit handler (UI only)
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Newsletter signup:', email)
    setEmail('')
  }

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50" role="contentinfo">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 sm:py-16 md:px-6 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block">
              <motion.h2
                className="font-display text-3xl font-light tracking-tight text-neutral-900"
                whileHover={{ scale: 1.02 }}
              >
                Bendouha
              </motion.h2>
            </Link>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-neutral-600">
              {t('footer.brandDescription')}
            </p>

            {/* Contact Info */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <MapPin className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                <span>123 Design Street, Algiers, Algeria</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <Phone className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                <span>+213 555 123 456</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <Mail className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                <span>hello@bendouha.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-8">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-neutral-500">
                {t('footer.followUs')}
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <SocialLink key={social.label} {...social} />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5 lg:gap-12">
            {/* Shop */}
            <div>
              <h3 className="mb-5 text-sm font-medium uppercase tracking-wider text-neutral-900">
                {t('footer.shop')}
              </h3>
              <ul className="space-y-3">
                {shopLinks.map((link) => (
                  <FooterLink key={link.to} to={link.to}>
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-5 text-sm font-medium uppercase tracking-wider text-neutral-900">
                {t('footer.company')}
              </h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <FooterLink key={link.to} to={link.to}>
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-5 text-sm font-medium uppercase tracking-wider text-neutral-900">
                Support
              </h3>
              <ul className="space-y-3">
                <FooterLink to="/faq">FAQ</FooterLink>
                <FooterLink to="/shipping">Shipping Info</FooterLink>
                <FooterLink to="/returns">Returns</FooterLink>
                <FooterLink to="/size-guide">Size Guide</FooterLink>
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-3">
            <h3 className="mb-5 text-sm font-medium uppercase tracking-wider text-neutral-900">
              Newsletter
            </h3>
            <p className="mb-4 text-sm text-neutral-600">
              Subscribe for exclusive offers and new arrivals.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={cn(
                    'w-full rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm',
                    'placeholder:text-neutral-400',
                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-full">
                Subscribe
                <ArrowRight className="ms-2 h-4 w-4" />
              </Button>
            </form>
            <p className="mt-3 text-xs text-neutral-500">
              By subscribing, you agree to our Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-200 bg-neutral-100/50">
        <div className="container mx-auto px-4 py-6 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Copyright */}
            <p className="text-sm text-neutral-600">
              {t('footer.copyright', { year: currentYear })}
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link
                to="/privacy"
                className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
              >
                {t('footer.privacyPolicy')}
              </Link>
              <Link
                to="/terms"
                className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
              >
                {t('footer.termsOfService')}
              </Link>
              <Link
                to="/cookies"
                className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
              >
                Cookie Settings
              </Link>
            </div>

            {/* Payment Methods (visual only) */}
            <div className="flex items-center gap-2">
              {['Visa', 'MC', 'Amex', 'PayPal'].map((method) => (
                <div
                  key={method}
                  className="flex h-8 w-12 items-center justify-center rounded bg-white text-[10px] font-medium text-neutral-500 shadow-sm"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
