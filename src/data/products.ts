// Mock product data
export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  badge?: 'new' | 'sale' | 'bestseller'
  description?: string
  inStock?: boolean
  rating?: number
  reviewCount?: number
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Ceramic Table Lamp',
    price: 189.00,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
    category: 'Lighting',
    badge: 'new',
    description: 'Handcrafted ceramic lamp with linen shade',
    inStock: true,
    rating: 4.8,
    reviewCount: 24,
  },
  {
    id: '2',
    name: 'Velvet Cushion Set',
    price: 79.00,
    originalPrice: 99.00,
    image: 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=600&q=80',
    category: 'Textiles',
    badge: 'sale',
    description: 'Set of 2 premium velvet cushions',
    inStock: true,
    rating: 4.9,
    reviewCount: 56,
  },
  {
    id: '3',
    name: 'Oak Coffee Table',
    price: 549.00,
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&q=80',
    category: 'Living Room',
    badge: 'bestseller',
    description: 'Solid oak with brass accents',
    inStock: true,
    rating: 4.7,
    reviewCount: 89,
  },
  {
    id: '4',
    name: 'Linen Throw Blanket',
    price: 129.00,
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&q=80',
    category: 'Textiles',
    description: '100% Belgian linen',
    inStock: true,
    rating: 4.6,
    reviewCount: 42,
  },
  {
    id: '5',
    name: 'Marble Vase',
    price: 159.00,
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=80',
    category: 'Decor',
    badge: 'new',
    description: 'White Carrara marble',
    inStock: true,
    rating: 4.9,
    reviewCount: 18,
  },
  {
    id: '6',
    name: 'Woven Storage Basket',
    price: 65.00,
    image: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=600&q=80',
    category: 'Storage',
    description: 'Natural seagrass weave',
    inStock: false,
    rating: 4.5,
    reviewCount: 31,
  },
  {
    id: '7',
    name: 'Brass Floor Lamp',
    price: 399.00,
    originalPrice: 479.00,
    image: 'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=600&q=80',
    category: 'Lighting',
    badge: 'sale',
    description: 'Adjustable arm with aged brass finish',
    inStock: true,
    rating: 4.8,
    reviewCount: 67,
  },
  {
    id: '8',
    name: 'Ceramic Dinnerware Set',
    price: 249.00,
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80',
    category: 'Kitchen',
    badge: 'bestseller',
    description: 'Service for 4, matte glaze',
    inStock: true,
    rating: 4.9,
    reviewCount: 112,
  },
]

// Helper function to get featured products
export function getFeaturedProducts(count = 4): Product[] {
  return products.filter(p => p.badge === 'bestseller' || p.badge === 'new').slice(0, count)
}

// Helper function to get products on sale
export function getSaleProducts(): Product[] {
  return products.filter(p => p.badge === 'sale')
}

// Helper function to get products by category
export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category.toLowerCase() === category.toLowerCase())
}
