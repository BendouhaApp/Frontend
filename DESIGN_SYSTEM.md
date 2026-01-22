# Bendouha Shop - Design System

## Overview
A premium, calm luxury design system with warm neutrals, elegant typography, and sophisticated interactions.

---

## 🎨 Color Palette

### Primary Brand Color
The primary color is a **deep warm brown** that conveys sophistication and earthiness.

```css
--primary: 25 18% 15%        /* Deep warm brown */
```

**Usage:**
- Primary CTAs and buttons
- Important UI elements
- Brand emphasis
- Links and interactive elements

**Scale:**
- `primary-50` to `primary-900` - Full tonal scale
- Use lighter shades (50-300) for backgrounds
- Use darker shades (700-900) for text and emphasis

### Neutral Colors
A **warm gray scale** that maintains brand cohesion throughout the interface.

```css
--neutral-50:  30 15% 98%   /* Almost white with warm tint */
--neutral-100: 30 12% 96%
--neutral-200: 30 10% 92%
--neutral-300: 30 8% 82%
--neutral-400: 30 6% 65%
--neutral-500: 30 5% 50%   /* Mid-gray */
--neutral-600: 30 6% 40%
--neutral-700: 30 7% 30%
--neutral-800: 30 8% 18%
--neutral-900: 30 10% 12%  /* Near black with warmth */
--neutral-950: 30 12% 8%
```

**Usage Guidelines:**
- **50-200**: Backgrounds, subtle borders, disabled states
- **300-500**: Secondary text, placeholders, dividers
- **600-950**: Primary text, headings, high contrast elements

### Semantic Colors

**Background & Foreground:**
```css
--background: 30 15% 99%    /* Soft warm white */
--foreground: 30 10% 12%    /* Deep charcoal (not pure black) */
```

**UI Elements:**
```css
--muted:      30 10% 95%    /* Muted backgrounds */
--accent:     25 35% 92%    /* Subtle warm accent */
--border:     30 8% 88%     /* Border color */
--input:      30 8% 90%     /* Input borders */
```

---

## 📝 Typography System

### Font Families

**Display/Headings:**
```css
font-family: 'Playfair Display', Georgia, serif
```
- Elegant serif for headings
- Use for h1, h2, h3
- Creates visual hierarchy and luxury feel

**Body Text:**
```css
font-family: 'Inter', system-ui, sans-serif
```
- Clean, readable sans-serif
- Use for body text, UI elements
- Optimal for smaller text sizes

### Type Scale

| Element | Size | Line Height | Tracking | Weight |
|---------|------|-------------|----------|--------|
| `.text-display` | 6-8rem | 1.05 | -0.05em | Light (300) |
| `h1` | 3.75-4.5rem | 1.05 | -0.04em | Light (300) |
| `h2` | 3-3.75rem | 1.1 | -0.03em | Light (300) |
| `h3` | 1.875-3rem | 1.15 | -0.02em | Light (300) |
| `h4` | 1.5-1.875rem | 1.2 | -0.02em | Normal (400) |
| `h5` | 1.25-1.5rem | 1.3 | -0.01em | Medium (500) |
| `h6` | 1.125rem | 1.3 | -0.01em | Medium (500) |
| `body` | 1rem | 1.75 | 0 | Normal (400) |
| `.text-sm` | 0.875rem | 1.43 | 0.01em | Normal (400) |
| `.text-xs` | 0.75rem | 1.33 | 0.02em | Normal (400) |

### Typography Utilities

**Custom Classes:**
```tsx
// Hero/Display text
<h1 className="text-display">Discover Elegance</h1>

// Section headings
<h2 className="text-section-heading">Featured Collection</h2>

// Card titles
<h3 className="text-card-title">Product Name</h3>

// Body text variations
<p className="text-body-large">Larger readable text</p>

// Small labels/captions
<span className="text-caption">New Arrival</span>

// Price display
<span className="text-price">$299.00</span>
```

### Font Weights

```css
font-light:   300  /* Headings, elegant emphasis */
font-normal:  400  /* Body text, default */
font-medium:  500  /* Subtle emphasis, card titles */
font-semibold: 600 /* Strong emphasis, rarely used */
```

**Best Practices:**
- Use light weights (300) for large headings
- Use normal (400) for body text
- Use medium (500) for small headings and emphasis
- Avoid bold (700+) - too heavy for premium aesthetic

---

## 📏 Spacing System

### Base Scale
Built on 4px base unit for consistency:

```
0    → 0px
1    → 4px
2    → 8px
3    → 12px
4    → 16px
6    → 24px
8    → 32px
12   → 48px
16   → 64px
20   → 80px
24   → 96px
32   → 128px
```

### Section Spacing

**Padding Utilities:**
```tsx
// Standard section
<section className="section-padding">
  {/* px-4 py-16 md:px-6 md:py-24 lg:py-32 */}
</section>

// Compact section
<section className="section-padding-sm">
  {/* px-4 py-12 md:px-6 md:py-16 */}
</section>
```

### Container Widths

```tsx
// Default container
<div className="container">
  {/* max-w-7xl, centered */}
</div>

// Narrow content
<div className="container-narrow">
  {/* max-w-4xl */}
</div>

// Reading width
<div className="container-reading">
  {/* max-w-2xl, optimal for text */}
</div>
```

### Breathing Room

For generous, calm spacing:

```tsx
// Generous vertical spacing
<div className="breathe">
  {/* space-y-8 md:space-y-12 */}
</div>

// Extra generous spacing
<div className="breathe-lg">
  {/* space-y-12 md:space-y-16 lg:space-y-24 */}
</div>
```

### Card Spacing

```tsx
<div className="card-padding">
  {/* p-6 md:p-8 */}
</div>
```

---

## 🔘 Button System

### Variants

**Default (Primary):**
```tsx
<Button>Add to Cart</Button>
```
- Deep brown background
- White text
- Subtle shadow
- Scale animation on click

**Premium:**
```tsx
<Button variant="premium">Shop Now</Button>
```
- Gradient background
- Enhanced shadow on hover
- Use sparingly for hero CTAs

**Outline:**
```tsx
<Button variant="outline">Learn More</Button>
```
- Border with transparent background
- Fills on hover
- Good for secondary actions

**Ghost:**
```tsx
<Button variant="ghost">Cancel</Button>
```
- No background or border
- Subtle hover state
- Use for tertiary actions

**Link:**
```tsx
<Button variant="link">View Details</Button>
```
- Underlined text link
- No button styling

### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon"><Icon /></Button>
```

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| `sm` | 36px | 16px | 12px |
| `default` | 44px | 24px | 14px |
| `lg` | 48px | 32px | 16px |
| `xl` | 56px | 40px | 18px |
| `icon` | 44px | - | - |

### Button Usage Guidelines

**Primary Actions:**
- Use `default` or `premium` variant
- Limit to 1-2 per screen
- Examples: "Add to Cart", "Checkout", "Shop Now"

**Secondary Actions:**
- Use `outline` or `secondary` variant
- Examples: "Learn More", "View Details"

**Tertiary Actions:**
- Use `ghost` or `link` variant
- Examples: "Cancel", "Back", "Skip"

---

## 🎭 Animation System

### Timing Functions

```css
transition-duration: 300ms  /* Default */
transition-duration: 400ms  /* Slower, more elegant */
transition-duration: 500ms  /* Hero elements */
```

**Easing:**
- `ease-out` - Default for most transitions
- `ease-in-out` - Smooth both ways

### Built-in Animations

```tsx
// Fade in from bottom
<div className="animate-fade-in">Content</div>

// Fade up with more movement
<div className="animate-fade-up">Content</div>

// Scale in
<div className="animate-scale-in">Content</div>
```

### Hover Effects

```tsx
// Subtle lift on hover
<div className="hover-lift">Card</div>

// Scale on hover
<img className="hover-scale" />

// Custom transition
<div className="transition-base">Element</div>
<div className="transition-slow">Slow Element</div>
```

### Framer Motion Patterns

**Page Entrance:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
```

**Hover Interaction:**
```tsx
<motion.div
  whileHover={{ y: -4 }}
  transition={{ duration: 0.2 }}
>
```

**Scroll Reveal:**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
```

---

## 🎯 Design Principles

### 1. Calm Luxury
- Generous whitespace
- Muted, warm color palette
- Subtle animations (200-400ms)
- Light typography weights

### 2. Breathability
- Never cramped or cluttered
- Minimum 16px padding on mobile
- Generous section spacing (64-128px)
- Clear visual hierarchy

### 3. Elegance Through Restraint
- Limited color palette
- Consistent border radius (0.5rem)
- One primary CTA per section
- Subtle hover states

### 4. Premium Typography
- Large, elegant headings (48-72px)
- Comfortable body text (16px, 1.75 line-height)
- Negative letter spacing on headings (-0.02em to -0.04em)
- Serif for headings, sans-serif for body

### 5. Sophisticated Interactions
- Smooth transitions (300-400ms)
- Scale feedback on buttons (0.98 on active)
- Lift effect on cards (-4px translate)
- No jarring animations

---

## 📋 Component Conventions

### Naming
- **PascalCase** for components: `ProductCard`, `HeroSection`
- **camelCase** for utilities: `formatPrice`, `truncateText`
- **kebab-case** for CSS classes: `hover-lift`, `section-padding`

### File Structure
```
components/
  ├── ui/              # shadcn/ui base components
  │   ├── button.tsx
  │   └── card.tsx
  └── ProductCard.tsx  # Custom components
```

### Props Pattern
```tsx
interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
  className?: string  // Always allow className override
}
```

---

## 🚀 Usage Examples

### Hero Section
```tsx
<section className="section-padding bg-neutral-50">
  <div className="container-narrow text-center breathe-lg">
    <h1 className="text-display">Timeless Elegance</h1>
    <p className="text-body-large text-neutral-600">
      Curated collections for the discerning customer
    </p>
    <Button size="lg" variant="premium">
      Explore Collection
    </Button>
  </div>
</section>
```

### Product Card
```tsx
<div className="group hover-lift">
  <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
    <img className="hover-scale transition-slow" />
  </div>
  <div className="card-padding">
    <h3 className="text-card-title">Product Name</h3>
    <p className="text-price text-neutral-600">$299.00</p>
  </div>
</div>
```

### Section Header
```tsx
<div className="text-center breathe">
  <span className="text-caption text-neutral-500">New Arrivals</span>
  <h2 className="text-section-heading">Featured Collection</h2>
  <p className="text-body-large text-neutral-600">
    Handpicked selections for this season
  </p>
</div>
```

---

## ✅ Checklist for Consistency

**Colors:**
- [ ] Using warm neutrals (not pure grays)
- [ ] Primary color for CTAs only
- [ ] Foreground is `neutral-900`, not black
- [ ] Background is warm white, not pure white

**Typography:**
- [ ] Headings use `font-display` (Playfair)
- [ ] Body text uses `font-sans` (Inter)
- [ ] Large headings have negative tracking
- [ ] Line height is 1.75 for body text

**Spacing:**
- [ ] Using spacing scale (multiples of 4px)
- [ ] Generous section padding (64px+ desktop)
- [ ] Cards have breathing room
- [ ] No elements touching edges

**Interactions:**
- [ ] Transitions are 300-400ms
- [ ] Hover states are subtle
- [ ] Active states have scale feedback
- [ ] Reduced motion supported

**Components:**
- [ ] Using Button component for CTAs
- [ ] Custom classes have `className` prop
- [ ] Framer Motion for page animations
- [ ] Semantic HTML elements

---

## 🎨 Brand Assets

**Recommended Google Fonts:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@300;400;500&display=swap" rel="stylesheet">
```

Add to `index.html` for optimal loading.

---

## 📚 Resources

- [Tailwind CSS Docs](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Framer Motion Docs](https://www.framer.com/motion)
- [Inter Font](https://rsms.me/inter/)
- [Playfair Display](https://fonts.google.com/specimen/Playfair+Display)

---

**Last Updated:** January 2026
