import { type Variants } from '@/lib/gsap-motion'

// ============================================
// MOTION CONSTANTS - Consistent timing across the site
// ============================================

export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.7,
} as const

export const EASE = {
  default: [0.25, 0.1, 0.25, 1], // cubic-bezier for smooth feel
  out: [0, 0, 0.2, 1],
  in: [0.4, 0, 1, 1],
  inOut: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
} as const

// ============================================
// PAGE TRANSITIONS
// ============================================

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.slow,
      ease: EASE.out,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: DURATION.normal,
      ease: EASE.in,
    },
  },
}

// ============================================
// FADE ANIMATIONS
// ============================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: DURATION.normal, ease: EASE.out },
  },
  exit: { opacity: 0 },
}

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE.out },
  },
  exit: { opacity: 0, y: -10 },
}

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE.out },
  },
}

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.slow, ease: EASE.out },
  },
}

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.slow, ease: EASE.out },
  },
}

// ============================================
// SCALE ANIMATIONS
// ============================================

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.normal, ease: EASE.out },
  },
  exit: { opacity: 0, scale: 0.95 },
}

// ============================================
// STAGGER CONTAINERS
// ============================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE.out },
  },
}

// ============================================
// HOVER ANIMATIONS (for whileHover prop)
// ============================================

export const hoverLift = {
  y: -4,
  transition: { duration: DURATION.fast, ease: EASE.out },
}

export const hoverScale = {
  scale: 1.02,
  transition: { duration: DURATION.fast, ease: EASE.out },
}

export const hoverScaleSmall = {
  scale: 1.05,
  transition: { duration: DURATION.fast, ease: EASE.out },
}

export const tapScale = {
  scale: 0.98,
}

// ============================================
// SCROLL REVEAL (for whileInView)
// ============================================

export const scrollReveal: Variants = {
  offscreen: {
    opacity: 0,
    y: 30,
  },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.slower,
      ease: EASE.out,
    },
  },
}

export const scrollRevealLeft: Variants = {
  offscreen: {
    opacity: 0,
    x: -30,
  },
  onscreen: {
    opacity: 1,
    x: 0,
    transition: {
      duration: DURATION.slower,
      ease: EASE.out,
    },
  },
}

export const scrollRevealRight: Variants = {
  offscreen: {
    opacity: 0,
    x: 30,
  },
  onscreen: {
    opacity: 1,
    x: 0,
    transition: {
      duration: DURATION.slower,
      ease: EASE.out,
    },
  },
}

// ============================================
// VIEWPORT OPTIONS
// ============================================

export const viewportOnce = { once: true, margin: '-50px' }
export const viewportAlways = { once: false, margin: '-50px' }
