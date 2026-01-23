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
  fullDescription?: string
  inStock?: boolean
  rating?: number
  reviewCount?: number
  sizes?: string[]
  colors?: { name: string; value: string }[]
  materials?: string[]
  dimensions?: string
  care?: string[]
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Ceramic Table Lamp',
    price: 189.00,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&q=80',
      'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&q=80',
    ],
    category: 'Lighting',
    badge: 'new',
    description: 'Handcrafted ceramic lamp with linen shade',
    fullDescription: 'This exquisite ceramic table lamp is a testament to artisanal craftsmanship. Each piece is hand-thrown and finished with a reactive glaze that creates unique variations in color and texture. The natural linen shade diffuses light beautifully, creating a warm and inviting ambiance in any space.',
    inStock: true,
    rating: 4.8,
    reviewCount: 24,
    colors: [
      { name: 'Natural White', value: '#F5F5F0' },
      { name: 'Soft Gray', value: '#9CA3AF' },
      { name: 'Terracotta', value: '#C67B5C' },
    ],
    dimensions: 'H 45cm × W 28cm',
    care: ['Dust with soft cloth', 'Avoid direct sunlight', 'Use LED bulbs only'],
  },
  {
    id: '2',
    name: 'Velvet Cushion Set',
    price: 79.00,
    originalPrice: 99.00,
    image: 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
    ],
    category: 'Textiles',
    badge: 'sale',
    description: 'Set of 2 premium velvet cushions',
    fullDescription: 'Indulge in the luxurious comfort of our premium velvet cushion set. Crafted from high-grade velvet with a subtle sheen, these cushions add a touch of sophistication to any seating arrangement. The feather-down insert provides exceptional softness and resilience.',
    inStock: true,
    rating: 4.9,
    reviewCount: 56,
    sizes: ['45×45 cm', '50×50 cm', '60×60 cm'],
    colors: [
      { name: 'Forest Green', value: '#2D5A3D' },
      { name: 'Burgundy', value: '#722F37' },
      { name: 'Navy', value: '#1E3A5F' },
      { name: 'Dusty Rose', value: '#D4A5A5' },
    ],
    care: ['Dry clean only', 'Spot clean with damp cloth', 'Fluff regularly'],
  },
  {
    id: '3',
    name: 'Oak Coffee Table',
    price: 549.00,
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80',
      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&q=80',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    ],
    category: 'Living Room',
    badge: 'bestseller',
    description: 'Solid oak with brass accents',
    fullDescription: 'A masterpiece of modern design, this coffee table combines the warmth of solid oak with elegant brass accents. The natural grain patterns make each piece unique, while the hand-applied finish ensures durability for years to come. Perfect as a centerpiece for contemporary living spaces.',
    inStock: true,
    rating: 4.7,
    reviewCount: 89,
    colors: [
      { name: 'Natural Oak', value: '#C4A77D' },
      { name: 'Walnut Stain', value: '#5C4033' },
    ],
    dimensions: 'L 120cm × W 60cm × H 45cm',
    materials: ['Solid Oak', 'Brass Hardware', 'Natural Oil Finish'],
    care: ['Use coasters', 'Wipe spills immediately', 'Apply wood oil annually'],
  },
  {
    id: '4',
    name: 'Linen Throw Blanket',
    price: 129.00,
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
    ],
    category: 'Textiles',
    description: '100% Belgian linen',
    fullDescription: 'Wrap yourself in the natural luxury of our Belgian linen throw blanket. Woven from the finest European flax, this blanket becomes softer with each wash while maintaining its beautiful drape. The breathable fabric is perfect for all seasons, providing warmth in winter and coolness in summer.',
    inStock: true,
    rating: 4.6,
    reviewCount: 42,
    sizes: ['130×170 cm', '150×200 cm'],
    colors: [
      { name: 'Natural', value: '#E8E4DC' },
      { name: 'Sage', value: '#9CAF88' },
      { name: 'Charcoal', value: '#36454F' },
    ],
    care: ['Machine wash cold', 'Tumble dry low', 'Iron while damp'],
  },
  {
    id: '5',
    name: 'Marble Vase',
    price: 159.00,
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&q=80',
      'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&q=80',
      'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
    category: 'Decor',
    badge: 'new',
    description: 'White Carrara marble',
    fullDescription: 'Carved from a single block of authentic Carrara marble, this vase is a statement piece that brings timeless elegance to any interior. The natural veining ensures each piece is one-of-a-kind. Its substantial weight and smooth finish speak to the quality of Italian craftsmanship.',
    inStock: true,
    rating: 4.9,
    reviewCount: 18,
    sizes: ['Small (H 20cm)', 'Medium (H 30cm)', 'Large (H 40cm)'],
    materials: ['Carrara Marble'],
    dimensions: 'H 30cm × Ø 15cm (Medium)',
    care: ['Wipe with damp cloth', 'Avoid acidic substances', 'Handle with care'],
  },
  {
    id: '6',
    name: 'Woven Storage Basket',
    price: 65.00,
    image: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    ],
    category: 'Storage',
    description: 'Natural seagrass weave',
    fullDescription: 'Handwoven by skilled artisans using sustainably harvested seagrass, this storage basket combines eco-conscious design with practical functionality. The natural texture adds warmth to any room while providing elegant storage for blankets, magazines, or everyday essentials.',
    inStock: false,
    rating: 4.5,
    reviewCount: 31,
    sizes: ['Small', 'Medium', 'Large'],
    materials: ['Natural Seagrass', 'Cotton Lining'],
    care: ['Keep dry', 'Dust regularly', 'Avoid direct sunlight'],
  },
  {
    id: '7',
    name: 'Brass Floor Lamp',
    price: 399.00,
    originalPrice: 479.00,
    image: 'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=800&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&q=80',
    ],
    category: 'Lighting',
    badge: 'sale',
    description: 'Adjustable arm with aged brass finish',
    fullDescription: 'This statement floor lamp features an adjustable arm that allows you to direct light exactly where you need it. The aged brass finish develops a beautiful patina over time, adding character and warmth. The weighted base ensures stability while maintaining an elegant silhouette.',
    inStock: true,
    rating: 4.8,
    reviewCount: 67,
    colors: [
      { name: 'Aged Brass', value: '#B5A642' },
      { name: 'Antique Bronze', value: '#665D1E' },
    ],
    dimensions: 'H 150-180cm (adjustable)',
    care: ['Dust with soft cloth', 'Polish occasionally', 'Use compatible bulbs'],
  },
  {
    id: '8',
    name: 'Ceramic Dinnerware Set',
    price: 249.00,
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80',
      'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    ],
    category: 'Kitchen',
    badge: 'bestseller',
    description: 'Service for 4, matte glaze',
    fullDescription: 'Elevate your dining experience with this hand-finished ceramic dinnerware set. Each piece is crafted with a matte glaze that feels beautiful in hand. The set includes dinner plates, salad plates, bowls, and mugs—everything you need for elegant everyday dining or special occasions.',
    inStock: true,
    rating: 4.9,
    reviewCount: 112,
    colors: [
      { name: 'Ivory', value: '#FFFFF0' },
      { name: 'Stone Gray', value: '#8A8A8A' },
      { name: 'Sage Green', value: '#9CAF88' },
    ],
    materials: ['Stoneware Ceramic', 'Lead-free Glaze'],
    care: ['Dishwasher safe', 'Microwave safe', 'Not for oven use'],
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

// Helper function to get a product by ID
export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id)
}
