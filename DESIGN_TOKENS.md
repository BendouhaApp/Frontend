# Design Tokens - Quick Reference

## 🎨 Colors

### Primary (Deep Warm Brown)
```tsx
bg-primary          // Deep brown
text-primary        // Deep brown text
border-primary      // Deep brown border
hover:bg-primary/90 // 90% opacity on hover
```

### Neutrals (Warm Gray Scale)
```tsx
// Backgrounds
bg-neutral-50       // Almost white
bg-neutral-100      // Very light
bg-neutral-200      // Light

// Text
text-neutral-600    // Secondary text
text-neutral-700    // Body text  
text-neutral-900    // Primary text (headings)

// Borders
border-neutral-200  // Light borders
border-neutral-300  // Default borders
```

### Semantic
```tsx
bg-background       // Page background (warm white)
text-foreground     // Default text (deep charcoal)
bg-muted            // Muted backgrounds
text-muted-foreground // Muted text
bg-accent           // Accent backgrounds
```

---

## 📝 Typography

### Font Families
```tsx
font-display        // Playfair Display (headings)
font-sans           // Inter (body, UI)
```

### Text Sizes
```tsx
text-xs             // 12px
text-sm             // 14px  
text-base           // 16px (default body)
text-lg             // 18px
text-xl             // 20px
text-2xl            // 24px
text-3xl            // 30px
text-4xl            // 36px
text-5xl            // 48px
text-6xl            // 60px
text-7xl            // 72px
text-8xl            // 96px
```

### Custom Text Classes
```tsx
text-display         // 72-96px hero text
text-section-heading // 48-60px section headers
text-card-title      // 20px card titles
text-body-large      // 18px large body
text-caption         // 12px uppercase labels
text-price           // 18px prices
```

### Font Weights
```tsx
font-light          // 300 (headings)
font-normal         // 400 (body)
font-medium         // 500 (emphasis)
```

### Letter Spacing
```tsx
tracking-tighter    // -0.04em (large headings)
tracking-tight      // -0.02em (headings)
tracking-normal     // 0 (body)
tracking-wide       // 0.02em (captions)
```

---

## 📏 Spacing

### Padding/Margin Scale
```tsx
p-1  →  4px      m-1  →  4px
p-2  →  8px      m-2  →  8px
p-3  →  12px     m-3  →  12px
p-4  →  16px     m-4  →  16px
p-6  →  24px     m-6  →  24px
p-8  →  32px     m-8  →  32px
p-12 →  48px     m-12 →  48px
p-16 →  64px     m-16 →  64px
p-24 →  96px     m-24 →  96px
```

### Section Classes
```tsx
section-padding     // Standard: px-4 py-16 md:px-6 md:py-24
section-padding-sm  // Compact: px-4 py-12 md:px-6 md:py-16
card-padding        // Cards: p-6 md:p-8
```

### Breathing Room
```tsx
breathe             // space-y-8 md:space-y-12
breathe-lg          // space-y-12 md:space-y-16 lg:space-y-24
```

### Containers
```tsx
container           // max-w-7xl, centered
container-narrow    // max-w-4xl
container-reading   // max-w-2xl
```

---

## 🔘 Buttons

### Import
```tsx
import { Button } from "@/components/ui/button"
```

### Variants
```tsx
<Button variant="default">Default</Button>
<Button variant="premium">Premium CTA</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Tertiary</Button>
<Button variant="link">Link Style</Button>
```

### Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon"><Icon /></Button>
```

---

## 🎭 Animations

### Utility Classes
```tsx
transition-base     // 300ms ease-out
transition-slow     // 500ms ease-out
hover-lift          // -4px translate on hover
hover-scale         // scale-105 on hover
```

### Built-in Animations
```tsx
animate-fade-in     // Fade + slight move
animate-fade-up     // Fade + 20px move
animate-scale-in    // Fade + scale
```

### Framer Motion Presets

**Page Entry:**
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4 }}
```

**Hover:**
```tsx
whileHover={{ y: -4 }}
transition={{ duration: 0.2 }}
```

**Scroll Reveal:**
```tsx
initial={{ opacity: 0 }}
whileInView={{ opacity: 1 }}
viewport={{ once: true }}
transition={{ duration: 0.6 }}
```

---

## 📐 Border & Radius

### Border Radius
```tsx
rounded-sm          // 6px
rounded-md          // 8px (default)
rounded-lg          // 12px
rounded-full        // 9999px
```

### Border Width
```tsx
border              // 1px
border-2            // 2px
border-none         // none
```

---

## 🖼️ Common Patterns

### Hero Section
```tsx
<section className="section-padding bg-neutral-50">
  <div className="container-narrow text-center breathe-lg">
    <h1 className="text-display">Title</h1>
    <p className="text-body-large text-neutral-600">Description</p>
    <Button size="lg" variant="premium">CTA</Button>
  </div>
</section>
```

### Card
```tsx
<div className="group hover-lift rounded-lg bg-white shadow-sm">
  <div className="aspect-square overflow-hidden rounded-t-lg bg-neutral-100">
    <img className="hover-scale transition-slow" />
  </div>
  <div className="card-padding">
    <h3 className="text-card-title">Title</h3>
    <p className="text-neutral-600">Description</p>
    <span className="text-price">$299.00</span>
  </div>
</div>
```

### Section Header
```tsx
<div className="text-center breathe">
  <span className="text-caption text-neutral-500">Label</span>
  <h2 className="text-section-heading">Heading</h2>
  <p className="text-body-large text-neutral-600">Subtitle</p>
</div>
```

### Product Grid
```tsx
<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
  {products.map(product => (
    <ProductCard key={product.id} {...product} />
  ))}
</div>
```

---

## 🎯 Best Practices

### DO ✅
- Use `bg-neutral-50` for light backgrounds (not white)
- Use `text-neutral-900` for dark text (not black)
- Add generous padding: minimum `p-4` on mobile
- Use `font-display` for h1-h3
- Keep animations subtle (300-400ms)
- One primary button per section
- Add `hover-lift` to cards
- Use `transition-base` for smooth interactions

### DON'T ❌
- Don't use pure black (`#000000`)
- Don't use pure white backgrounds in main content
- Don't use font weights above 600
- Don't use animations longer than 500ms
- Don't cram elements together (use breathe classes)
- Don't use multiple primary CTAs on one screen
- Don't skip reduced-motion considerations
- Don't use bright, saturated colors

---

## 📦 Import Patterns

```tsx
// Components
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ProductCard"

// Layouts
import { MainLayout } from "@/layouts/MainLayout"
import { Header } from "@/layouts/Header"

// Utils
import { cn } from "@/lib/utils"

// Motion
import { motion } from "framer-motion"

// Icons
import { ShoppingBag, Search, User } from "lucide-react"
```

---

## 🚀 Quick Start Template

```tsx
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function MyComponent() {
  return (
    <section className="section-padding">
      <div className="container breathe-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <span className="text-caption text-neutral-500">
            Category
          </span>
          <h2 className="text-section-heading">
            Section Title
          </h2>
          <p className="text-body-large text-neutral-600">
            Description text goes here
          </p>
          <Button size="lg">Call to Action</Button>
        </motion.div>

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Items */}
        </div>
      </div>
    </section>
  )
}
```

---

**Pro Tip:** Use the browser DevTools to inspect existing components and see which classes create the desired effect!
