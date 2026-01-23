import { motion } from 'framer-motion'
import { pageVariants, DURATION, EASE } from '@/lib/motion'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

/**
 * Wrap page content with this component for entrance animations.
 * Use at the root of each page component.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Animated section that reveals on scroll.
 * Use for sections within pages.
 */
export function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: DURATION.slower,
        ease: EASE.out,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/**
 * Stagger children animations on scroll.
 * Wrap items in motion.div with staggerItem variant.
 */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.08,
}: {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}) {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Individual item for stagger animations.
 */
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { duration: DURATION.slow, ease: EASE.out },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Fade in element when it enters viewport.
 */
export function FadeIn({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = DURATION.slow,
}: {
  children: React.ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  delay?: number
  duration?: number
}) {
  const directionOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffset[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration, ease: EASE.out, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
