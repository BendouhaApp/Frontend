# Premium Header Component

## Overview
A sophisticated, responsive navigation header with subtle animations and premium design details.

---

## Features

### ✨ **Visual Design**
- **Minimal & Elegant** - Clean layout with generous spacing
- **Sticky Positioning** - Stays at top while scrolling
- **Dynamic Styling** - Changes appearance on scroll (shadow + background)
- **Backdrop Blur** - Frosted glass effect for modern look
- **Premium Typography** - Uses Playfair Display for logo

### 🎭 **Animations**
- **Entrance Animation** - Fades in from top on page load
- **Logo Hover** - Subtle scale effect (1.02x)
- **Navigation Links** - Animated underline on hover
- **Icon Buttons** - Scale feedback on hover/tap
- **Cart Badge** - Scales in/out when count changes
- **Mobile Menu** - Staggered item animations

### 📱 **Responsive Design**
- **Desktop (lg+)**: Full navigation with centered links
- **Tablet (md)**: Collapsed nav, icon actions visible
- **Mobile**: Hamburger menu with slide-out drawer

### 🎯 **Interactions**
- Smooth 300ms transitions throughout
- Tap/click feedback with scale animations
- Hover states on all interactive elements
- Accessible ARIA labels
- Keyboard navigation support

---

## Component Structure

```tsx
<Header>
  ├── Logo (left)
  ├── Desktop Navigation (center, hidden on mobile)
  └── Actions (right)
      ├── Search Button (hidden on mobile)
      ├── Account Button (hidden on mobile)
      ├── Cart Button (with badge)
      └── Mobile Menu Button (visible on mobile only)
```

---

## Code Breakdown

### **Main Header Container**

```tsx
<motion.header
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className={`
    sticky top-0 z-50 w-full border-b transition-all
    ${isScrolled ? 'border-neutral-200 bg-background/95 shadow-sm' : '...'}
  `}
>
```

**Key Classes:**
- `sticky top-0 z-50` - Stays at top, above other content
- `backdrop-blur-md` - Frosted glass effect
- Dynamic border and shadow based on scroll position

### **Logo with Hover Effect**

```tsx
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  <h1 className="font-display text-2xl font-light tracking-tight">
    Bendouha
  </h1>
</motion.div>
```

**Design Choices:**
- `font-display` - Playfair Display serif
- `font-light` - Elegant, not heavy
- `tracking-tight` - Closer letter spacing
- Subtle hover scale (1.02, not aggressive)

### **Navigation Links with Animated Underline**

```tsx
<NavigationLink href="/shop">Shop</NavigationLink>
```

**Custom Component Features:**
- Animated underline on hover
- Smooth 200ms transition
- `originX: 0` - Animates from left to right
- Text color transition

**Implementation:**
```tsx
<motion.span
  className="absolute -bottom-1 left-0 h-[2px] w-full bg-neutral-900"
  initial={{ scaleX: 0 }}
  animate={{ scaleX: isHovered ? 1 : 0 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
  style={{ originX: 0 }}
/>
```

### **Icon Buttons with Scale Feedback**

```tsx
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100"
>
  <Search className="h-5 w-5" />
</motion.button>
```

**Interaction Pattern:**
- Hover: Scale 1.1 (10% larger)
- Tap: Scale 0.95 (pressed effect)
- Background fade on hover
- Color transition

### **Cart Button with Badge**

```tsx
<motion.button>
  <ShoppingBag className="h-5 w-5" />
  <AnimatePresence>
    {cartCount > 0 && (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="absolute -right-1 -top-1 rounded-full bg-primary"
      >
        {cartCount}
      </motion.span>
    )}
  </AnimatePresence>
</motion.button>
```

**Badge Animation:**
- Scales in from 0 when item added
- Scales out to 0 when cart empties
- `AnimatePresence` handles exit animation
- Positioned absolutely at top-right

### **Mobile Menu (Sheet Component)**

```tsx
<Sheet>
  <SheetTrigger>
    <Menu />
  </SheetTrigger>
  <SheetContent side="right">
    <MobileNavigation />
  </SheetContent>
</Sheet>
```

**Mobile Menu Features:**
- Slides in from right
- Full-screen on mobile, 400px on larger screens
- Backdrop blur overlay
- Staggered link animations (0.1s delay each)
- Includes mobile-only actions (Search, Account)

---

## Design System Usage

### **Colors**
```tsx
text-neutral-600       // Default icon/link color
text-neutral-900       // Hover state / active color
bg-neutral-100         // Icon button hover background
bg-primary             // Cart badge background
border-neutral-200     // Border when scrolled
```

### **Typography**
```tsx
font-display           // Logo (Playfair Display)
text-2xl md:text-3xl   // Logo size (responsive)
text-sm                // Navigation link text
text-lg                // Mobile menu links
font-light             // Logo weight
font-medium            // Navigation links
```

### **Spacing**
```tsx
h-20                   // Header height (80px)
space-x-3 md:space-x-4 // Icon spacing (responsive)
space-x-8              // Desktop nav link spacing
px-4 md:px-6           // Container padding
```

### **Animation Timing**
```tsx
duration: 0.2          // Quick hover effects
duration: 0.3          // Mobile menu items
duration: 0.4          // Header entrance
transition-all         // Scroll state change
```

---

## Customization Guide

### **Change Logo Style**
```tsx
// In Header component, find:
<h1 className="font-display text-2xl font-light tracking-tight">
  Bendouha
</h1>

// Options:
// - Replace text with <img> for logo image
// - Change font-display to font-sans for different style
// - Adjust text size: text-xl, text-2xl, text-3xl
// - Change weight: font-light, font-normal, font-medium
```

### **Add/Remove Navigation Links**
```tsx
// In Header component, find navLinks array:
const navLinks = [
  { name: 'Shop', href: '/shop' },
  { name: 'Collections', href: '/collections' },
  // Add more here
]
```

### **Change Header Height**
```tsx
// Find: className="flex h-20 items-center"
// Options: h-16 (64px), h-20 (80px), h-24 (96px)
```

### **Modify Scroll Behavior**
```tsx
// In useEffect, find:
setIsScrolled(window.scrollY > 10)

// Change threshold:
// > 10  - Triggers early (current)
// > 50  - Triggers after more scroll
// > 100 - Triggers much later
```

### **Adjust Backdrop Blur**
```tsx
// Find: backdrop-blur-md
// Options:
// - backdrop-blur-sm  - Less blur
// - backdrop-blur-md  - Current
// - backdrop-blur-lg  - More blur
// - backdrop-blur-xl  - Maximum blur
```

---

## Accessibility

### **ARIA Labels**
All icon buttons have descriptive `aria-label` attributes:
```tsx
aria-label="Search"
aria-label="Account"
aria-label="Shopping cart"
aria-label="Menu"
```

### **Keyboard Navigation**
- All interactive elements are keyboard accessible
- Focus states included via Tailwind defaults
- Tab order is logical (left to right)

### **Screen Reader Support**
- SheetTitle provides context for mobile menu
- Icon-only buttons have text alternatives
- Semantic HTML structure

### **Reduced Motion**
Framer Motion automatically respects `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  /* Animations disabled automatically */
}
```

---

## Performance

### **Optimizations**
- **useState for scroll** - Only updates on scroll events
- **AnimatePresence** - Smooth mount/unmount animations
- **Backdrop blur** - GPU-accelerated
- **Transform animations** - No layout recalculation
- **Conditional rendering** - Mobile menu only renders when open

### **Bundle Size**
- Header component: ~3KB (minified)
- Sheet component: ~5KB (minified)
- Framer Motion: Already included in project
- No additional dependencies required

---

## Common Patterns

### **Add Search Functionality**
```tsx
// Create state for search modal
const [isSearchOpen, setIsSearchOpen] = useState(false)

// Update search button:
<motion.button
  onClick={() => setIsSearchOpen(true)}
  // ... rest of props
>
  <Search className="h-5 w-5" />
</motion.button>

// Add SearchModal component
{isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
```

### **Add User Menu Dropdown**
```tsx
// Import Dropdown Menu from shadcn/ui
import { DropdownMenu } from "@/components/ui/dropdown-menu"

// Replace account button with dropdown
<DropdownMenu>
  <DropdownMenuTrigger>
    <User />
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Orders</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### **Add Cart Drawer**
```tsx
// Similar to mobile menu, use Sheet for cart
<Sheet>
  <SheetTrigger asChild>
    <motion.button>
      <ShoppingBag />
    </motion.button>
  </SheetTrigger>
  <SheetContent>
    <CartItems />
  </SheetContent>
</Sheet>
```

---

## Testing Checklist

### **Visual Tests**
- [ ] Logo renders correctly on all screen sizes
- [ ] Navigation links are evenly spaced
- [ ] Icons are aligned vertically
- [ ] Cart badge appears when count > 0
- [ ] Mobile menu opens smoothly
- [ ] Scroll effect triggers at right point

### **Interaction Tests**
- [ ] Logo hover scales correctly
- [ ] Navigation underlines animate on hover
- [ ] Icon buttons scale on hover/tap
- [ ] Cart badge animates in/out
- [ ] Mobile menu slides in/out
- [ ] All links navigate correctly

### **Responsive Tests**
- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Test very wide screens (> 1920px)

### **Accessibility Tests**
- [ ] Tab through all elements
- [ ] Test with screen reader
- [ ] Check color contrast ratios
- [ ] Test with reduced motion enabled
- [ ] Verify ARIA labels

---

## Browser Support

**Fully Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Backdrop Blur:**
- Chrome 76+
- Firefox 103+
- Safari 9+
- Edge 79+

**Fallback:**
If backdrop-blur not supported, header uses solid background automatically.

---

## Examples

### **Minimal Header (No Icons)**
```tsx
// Remove search, account buttons
// Keep only logo, nav, cart
<div className="flex items-center space-x-4">
  <motion.button /* cart */>
    <ShoppingBag />
  </motion.button>
  <Sheet /* mobile menu */></Sheet>
</div>
```

### **Transparent Header (Hero Pages)**
```tsx
// Remove border, use transparent background
className="fixed top-0 z-50 w-full bg-transparent"

// Add white text for dark hero backgrounds
className="text-white hover:text-neutral-200"
```

### **Centered Logo**
```tsx
// Change flex justify
<div className="flex h-20 items-center justify-center">
  <Link to="/">{/* Logo */}</Link>
</div>

// Move actions to absolute positioning
<div className="absolute right-4 flex items-center">
  {/* Actions */}
</div>
```

---

## Dependencies

```json
{
  "gsap": "^3.14.2",
  "lucide-react": "^0.562.0",
  "@radix-ui/react-dialog": "^1.x",
  "react-router-dom": "^6.x"
}
```

All dependencies already installed in project.

---

## Related Components

- **Footer** - `src/layouts/Footer.tsx`
- **MainLayout** - `src/layouts/MainLayout.tsx`
- **Sheet** - `src/components/ui/sheet.tsx`
- **Button** - `src/components/ui/button.tsx`

---

**Last Updated:** January 2026
