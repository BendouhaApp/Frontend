# Bendouha Shop - Frontend Project Structure

## Overview
A modern, premium e-commerce frontend built with React, Tailwind CSS, shadcn/ui, and Framer Motion.

## Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components (install as needed)
│   └── ProductCard.tsx # Example product card component
│
├── layouts/            # Layout components
│   ├── Header.tsx      # Global header with navigation
│   ├── Footer.tsx      # Global footer
│   └── MainLayout.tsx  # Main layout wrapper (Header + Outlet + Footer)
│
├── pages/              # Page components (routes)
│   ├── Home.tsx        # Homepage with hero section
│   ├── Shop.tsx        # Product listing page
│   ├── Collections.tsx # Collections page
│   ├── About.tsx       # About page
│   └── Contact.tsx     # Contact page
│
├── lib/                # Utility functions
│   └── utils.ts        # cn() utility for class merging
│
├── styles/             # Additional custom styles
│
└── assets/             # Static assets (images, icons)
```

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Pre-built accessible components
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library
- **Vite** - Build tool

## Key Features

### 1. **Global Layout**
- Sticky header with logo, navigation, and action buttons (search, account, cart)
- Main content area with React Router outlet
- Footer with links and social media icons
- Responsive design with mobile menu support

### 2. **Routing**
All routes are configured in `App.tsx`:
- `/` - Home
- `/shop` - Shop
- `/collections` - Collections
- `/about` - About
- `/contact` - Contact

### 3. **Styling System**
- **CSS Variables**: Design tokens defined in `index.css`
- **Tailwind Config**: Extended with shadcn/ui color system
- **cn() Utility**: Merge Tailwind classes with `clsx` and `tailwind-merge`

### 4. **Animations**
Framer Motion integrated for:
- Page transitions
- Component hover effects
- Scroll-triggered animations
- Subtle entrance animations

### 5. **Path Aliases**
Configured in `tsconfig.app.json` and `vite.config.ts`:
```typescript
import { Component } from '@/components/Component'
import { cn } from '@/lib/utils'
```

## Adding shadcn/ui Components

Install components as needed:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

Components will be added to `src/components/ui/`

## Design Philosophy

- **Calm Luxury**: Minimal, elegant, breathable layouts
- **Premium Typography**: Light font weights, generous spacing
- **Subtle Animations**: 200-400ms transitions, smooth easing
- **Neutral Palette**: Based on neutral colors with custom brand colors ready
- **Responsive First**: Mobile-friendly with progressive enhancement

## Running the Project

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

## Next Steps

1. **Add Product Data**: Create mock data in `src/data/products.ts`
2. **Implement Product Listing**: Build product grid in Shop page
3. **Create Product Detail**: Add individual product page
4. **Build Cart Functionality**: State management for cart
5. **Add shadcn/ui Components**: Install needed UI components
6. **Customize Colors**: Update CSS variables for brand colors
7. **Add More Animations**: Enhance with Framer Motion
8. **Optimize Images**: Add image optimization strategy

## Code Style

- **Components**: PascalCase function components
- **Files**: PascalCase for components, camelCase for utilities
- **Styling**: Tailwind utility classes with `cn()` for dynamic classes
- **Animations**: Framer Motion with reduced-motion support
- **TypeScript**: Strict mode enabled, explicit types preferred

## Notes

- No API calls or backend integration yet
- Using mock data for development
- Focus on UI/UX and visual polish
- Production-ready component structure
- Accessible by default with shadcn/ui
