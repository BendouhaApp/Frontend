import { motion, type Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Animation variants for staggered entrance
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
}

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: 'easeOut',
    },
  },
}

interface HeroProps {
  /** Main headline text */
  headline?: string
  /** Emphasized word in headline (optional) */
  highlightWord?: string
  /** Subtitle/description text */
  subtitle?: string
  /** CTA button text */
  ctaText?: string
  /** CTA button link */
  ctaHref?: string
  /** Optional background image URL */
  backgroundImage?: string
  /** Whether to show the decorative elements */
  showDecorative?: boolean
}

export function Hero({
  headline = 'Crafted for Those Who Appreciate',
  highlightWord = 'Excellence',
  subtitle = 'Discover our curated collection of timeless pieces, designed with meticulous attention to detail and an unwavering commitment to quality.',
  ctaText = 'Explore Collection',
  ctaHref = '/shop',
  backgroundImage,
  showDecorative = true,
}: HeroProps) {
  return (
    <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0">
        {backgroundImage ? (
          // Image Background
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            className="absolute inset-0"
          >
            <img
              src={backgroundImage}
              alt=""
              className="h-full w-full object-cover"
            />
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/40" />
          </motion.div>
        ) : (
          // Soft gradient background
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-background to-neutral-100/50" />
        )}

        {/* Decorative Elements */}
        {showDecorative && (
          <>
            {/* Subtle gradient orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="absolute -right-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary-100/30 to-transparent blur-3xl"
            />
            {/* Secondary orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.7 }}
              className="absolute -left-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-neutral-200/40 to-transparent blur-3xl"
            />
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            {/* Eyebrow/Label */}
            <motion.span
              variants={itemVariants}
              className="mb-6 inline-block text-sm font-medium uppercase tracking-widest text-neutral-500"
            >
              New Collection 2026
            </motion.span>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="font-display text-5xl font-light leading-[1.1] tracking-tight text-neutral-900 sm:text-6xl md:text-7xl lg:text-8xl"
            >
              {headline}
              <br />
              <span className="font-normal text-primary">{highlightWord}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-8 max-w-xl text-lg leading-relaxed text-neutral-600 md:text-xl"
            >
              {subtitle}
            </motion.p>

            {/* CTA Button */}
            <motion.div variants={itemVariants} className="mt-10">
              <Button
                size="lg"
                className="group h-14 rounded-full px-8 text-base"
                asChild
              >
                <a href={ctaHref}>
                  {ctaText}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Button>
            </motion.div>

            {/* Optional: Trust indicators */}
            <motion.div
              variants={itemVariants}
              className="mt-16 flex items-center gap-8 border-t border-neutral-200 pt-8"
            >
              <div>
                <p className="text-2xl font-light text-neutral-900">10k+</p>
                <p className="text-sm text-neutral-500">Happy Customers</p>
              </div>
              <div className="h-10 w-px bg-neutral-200" />
              <div>
                <p className="text-2xl font-light text-neutral-900">500+</p>
                <p className="text-sm text-neutral-500">Unique Pieces</p>
              </div>
              <div className="hidden h-10 w-px bg-neutral-200 sm:block" />
              <div className="hidden sm:block">
                <p className="text-2xl font-light text-neutral-900">100%</p>
                <p className="text-sm text-neutral-500">Quality Assured</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            Scroll
          </span>
          <div className="h-12 w-px bg-gradient-to-b from-neutral-300 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// Alternative: Centered Hero variant
export function HeroCentered({
  headline = 'Timeless Elegance',
  highlightWord = 'Redefined',
  subtitle = 'Where craftsmanship meets contemporary design. Each piece tells a story of dedication and refined taste.',
  ctaText = 'Discover More',
  ctaHref = '/shop',
}: Omit<HeroProps, 'backgroundImage' | 'showDecorative'>) {
  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-neutral-50">
      {/* Subtle texture */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl text-center"
        >
          {/* Decorative line */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mb-8 h-px w-16 bg-neutral-300"
          />

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-5xl font-light leading-[1.1] tracking-tight text-neutral-900 sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {headline}
            <br />
            <span className="font-normal italic">{highlightWord}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-neutral-600 md:text-xl"
          >
            {subtitle}
          </motion.p>

          {/* CTA */}
          <motion.div variants={itemVariants} className="mt-12">
            <Button
              variant="outline"
              size="lg"
              className="group h-14 rounded-full border-2 px-10 text-base"
              asChild
            >
              <a href={ctaHref}>
                {ctaText}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Button>
          </motion.div>

          {/* Decorative line */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mt-12 h-px w-16 bg-neutral-300"
          />
        </motion.div>
      </div>
    </section>
  )
}
