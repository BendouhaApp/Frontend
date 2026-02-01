import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Image as ImageIcon,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGet } from '@/hooks/useGet'
import { usePost } from '@/hooks/usePost'
import { usePostAction } from '@/hooks/usePostAction'
import type { Product, ProductsResponse, ProductResponse, CreateProductPayload } from '@/types/api'
import { cn } from '@/lib/utils'

// Product Form Component
interface ProductFormProps {
  product?: Product
  onSubmit: (data: CreateProductPayload) => void
  onCancel: () => void
  isLoading?: boolean
}

function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState<CreateProductPayload>({
    name: product?.name || '',
    price: product?.price || 0,
    originalPrice: product?.originalPrice,
    image: product?.image || '',
    images: product?.images || [],
    category: product?.category || '',
    badge: product?.badge,
    description: product?.description || '',
    fullDescription: product?.fullDescription || '',
    inStock: product?.inStock ?? true,
    sizes: product?.sizes || [],
    colors: product?.colors || [],
    materials: product?.materials || [],
    dimensions: product?.dimensions || '',
    care: product?.care || [],
  })

  const [newSize, setNewSize] = useState('')
  const [newMaterial, setNewMaterial] = useState('')
  const [newCare, setNewCare] = useState('')
  const [newColor, setNewColor] = useState({ name: '', value: '#000000' })
  const [newImage, setNewImage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: keyof CreateProductPayload, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSize = () => {
    if (newSize && !formData.sizes?.includes(newSize)) {
      handleChange('sizes', [...(formData.sizes || []), newSize])
      setNewSize('')
    }
  }

  const removeSize = (size: string) => {
    handleChange('sizes', formData.sizes?.filter((s) => s !== size))
  }

  const addMaterial = () => {
    if (newMaterial && !formData.materials?.includes(newMaterial)) {
      handleChange('materials', [...(formData.materials || []), newMaterial])
      setNewMaterial('')
    }
  }

  const removeMaterial = (material: string) => {
    handleChange('materials', formData.materials?.filter((m) => m !== material))
  }

  const addCare = () => {
    if (newCare && !formData.care?.includes(newCare)) {
      handleChange('care', [...(formData.care || []), newCare])
      setNewCare('')
    }
  }

  const removeCare = (care: string) => {
    handleChange('care', formData.care?.filter((c) => c !== care))
  }

  const addColor = () => {
    if (newColor.name && !formData.colors?.some((c) => c.name === newColor.name)) {
      handleChange('colors', [...(formData.colors || []), { ...newColor }])
      setNewColor({ name: '', value: '#000000' })
    }
  }

  const removeColor = (colorName: string) => {
    handleChange('colors', formData.colors?.filter((c) => c.name !== colorName))
  }

  const addImage = () => {
    if (newImage && !formData.images?.includes(newImage)) {
      handleChange('images', [...(formData.images || []), newImage])
      setNewImage('')
    }
  }

  const removeImage = (image: string) => {
    handleChange('images', formData.images?.filter((i) => i !== image))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Product Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Price *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value))}
            className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Original Price (optional)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.originalPrice || ''}
            onChange={(e) =>
              handleChange(
                'originalPrice',
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Category *
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Badge
          </label>
          <select
            value={formData.badge || ''}
            onChange={(e) =>
              handleChange(
                'badge',
                e.target.value ? (e.target.value as 'new' | 'sale' | 'bestseller') : undefined
              )
            }
            className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">None</option>
            <option value="new">New</option>
            <option value="sale">Sale</option>
            <option value="bestseller">Bestseller</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Main Image URL *
          </label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => handleChange('image', e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Short Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Full Description
          </label>
          <textarea
            value={formData.fullDescription || ''}
            onChange={(e) => handleChange('fullDescription', e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Dimensions
          </label>
          <input
            type="text"
            value={formData.dimensions || ''}
            onChange={(e) => handleChange('dimensions', e.target.value)}
            placeholder="e.g., 45cm x 30cm"
            className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="inStock"
            checked={formData.inStock ?? true}
            onChange={(e) => handleChange('inStock', e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
          />
          <label htmlFor="inStock" className="text-sm font-medium text-neutral-700">
            In Stock
          </label>
        </div>
      </div>

      {/* Additional Images */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Additional Images
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            placeholder="Image URL"
            className="flex-1 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button type="button" variant="outline" onClick={addImage}>
            Add
          </Button>
        </div>
        {formData.images && formData.images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.images.map((image, i) => (
              <div
                key={i}
                className="group relative h-16 w-16 overflow-hidden rounded-lg bg-neutral-100"
              >
                <img src={image} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(image)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sizes */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Sizes
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            placeholder="e.g., S, M, L, XL"
            className="flex-1 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button type="button" variant="outline" onClick={addSize}>
            Add
          </Button>
        </div>
        {formData.sizes && formData.sizes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.sizes.map((size) => (
              <span
                key={size}
                className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm"
              >
                {size}
                <button type="button" onClick={() => removeSize(size)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Colors */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Colors
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newColor.name}
            onChange={(e) => setNewColor((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Color name"
            className="flex-1 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="color"
            value={newColor.value}
            onChange={(e) => setNewColor((prev) => ({ ...prev, value: e.target.value }))}
            className="h-10 w-10 cursor-pointer rounded-lg border border-neutral-200"
          />
          <Button type="button" variant="outline" onClick={addColor}>
            Add
          </Button>
        </div>
        {formData.colors && formData.colors.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.colors.map((color) => (
              <span
                key={color.name}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-sm"
              >
                <span
                  className="h-4 w-4 rounded-full border border-neutral-200"
                  style={{ backgroundColor: color.value }}
                />
                {color.name}
                <button type="button" onClick={() => removeColor(color.name)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Materials */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Materials
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMaterial}
            onChange={(e) => setNewMaterial(e.target.value)}
            placeholder="e.g., Cotton, Linen"
            className="flex-1 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button type="button" variant="outline" onClick={addMaterial}>
            Add
          </Button>
        </div>
        {formData.materials && formData.materials.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.materials.map((material) => (
              <span
                key={material}
                className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm"
              >
                {material}
                <button type="button" onClick={() => removeMaterial(material)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Care Instructions */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Care Instructions
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCare}
            onChange={(e) => setNewCare(e.target.value)}
            placeholder="e.g., Machine wash cold"
            className="flex-1 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button type="button" variant="outline" onClick={addCare}>
            Add
          </Button>
        </div>
        {formData.care && formData.care.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.care.map((care) => (
              <span
                key={care}
                className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm"
              >
                {care}
                <button type="button" onClick={() => removeCare(care)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 border-t border-neutral-200 pt-6">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}

// Product Table Row
function ProductRow({
  product,
  onEdit,
  onDelete,
  isDeleting,
}: {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn('border-b border-neutral-100', isDeleting && 'opacity-50')}
    >
      <td className="py-4 pe-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-6 w-6 text-neutral-400" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-neutral-900">{product.name}</p>
            <p className="text-sm text-neutral-500">{product.category}</p>
          </div>
        </div>
      </td>
      <td className="py-4 pe-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-900">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-neutral-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </td>
      <td className="py-4 pe-4">
        {product.badge ? (
          <span
            className={cn(
              'rounded-full px-2 py-1 text-xs font-medium',
              product.badge === 'new' && 'bg-primary/10 text-primary',
              product.badge === 'sale' && 'bg-red-100 text-red-600',
              product.badge === 'bestseller' && 'bg-amber-100 text-amber-600'
            )}
          >
            {product.badge}
          </span>
        ) : (
          <span className="text-sm text-neutral-400">-</span>
        )}
      </td>
      <td className="py-4 pe-4">
        <span
          className={cn(
            'inline-flex items-center gap-1 text-sm',
            product.inStock !== false ? 'text-green-600' : 'text-red-500'
          )}
        >
          {product.inStock !== false ? (
            <>
              <Check className="h-3.5 w-3.5" />
              In Stock
            </>
          ) : (
            <>
              <X className="h-3.5 w-3.5" />
              Out of Stock
            </>
          )}
        </span>
      </td>
      <td className="py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(product)}
            disabled={isDeleting}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => onDelete(product.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </td>
    </motion.tr>
  )
}

// Main Admin Page
export function Admin() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch products
  const { data, isLoading, isError, refetch } = useGet<ProductsResponse>({
    path: 'products',
    options: {
      staleTime: 1000 * 60 * 5,
    },
  })
  const products = data?.data || []

  // Mutations
  const createProduct = usePost<CreateProductPayload, ProductResponse>({
    path: 'products',
    method: 'post',
    successMessage: 'Produit créé avec succès',
    errorMessage: 'Erreur lors de la création du produit',
  })
  
  const updateProduct = usePost<Partial<CreateProductPayload>, ProductResponse>({
    path: `products/${editingProduct?.id || ''}`,
    method: 'put',
    successMessage: 'Produit mis à jour avec succès',
    errorMessage: 'Erreur lors de la mise à jour du produit',
  })
  
  const deleteProduct = usePostAction<ProductResponse>()

  // Filter products by search query
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async (data: CreateProductPayload) => {
    await createProduct.mutateAsync(data)
    setShowForm(false)
  }

  const handleUpdate = async (data: CreateProductPayload) => {
    if (editingProduct) {
      await updateProduct.mutateAsync(data)
      setEditingProduct(undefined)
      setShowForm(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setDeletingId(id)
      await deleteProduct.mutateAsync({
        method: 'delete',
        path: `products/${id}`,
      })
      setDeletingId(null)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProduct(undefined)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="container mx-auto px-4 py-6 md:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-light tracking-tight text-neutral-900">
                Product Management
              </h1>
              <p className="mt-1 text-neutral-600">
                Manage your store's products
              </p>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:px-6">
        {/* Product Form Modal */}
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={handleCancel}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-4 z-50 mx-auto max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl md:inset-8"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-medium text-neutral-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={handleCancel}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <ProductForm
                  product={editingProduct}
                  onSubmit={editingProduct ? handleUpdate : handleCreate}
                  onCancel={handleCancel}
                  isLoading={createProduct.isPending || updateProduct.isPending}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pe-4 ps-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="rounded-xl bg-white p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-xl bg-white p-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-medium text-neutral-900">
              Failed to load products
            </h3>
            <p className="mb-6 text-neutral-600">
              Something went wrong while loading the products.
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        )}

        {/* Products Table */}
        {!isLoading && !isError && (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                  <ImageIcon className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-neutral-900">
                  {searchQuery ? 'No products found' : 'No products yet'}
                </h3>
                <p className="mb-6 text-neutral-600">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Get started by adding your first product'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="me-2 h-4 w-4" />
                    Add Product
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="px-4 py-3 text-start text-sm font-medium text-neutral-600">
                        Product
                      </th>
                      <th className="px-4 py-3 text-start text-sm font-medium text-neutral-600">
                        Price
                      </th>
                      <th className="px-4 py-3 text-start text-sm font-medium text-neutral-600">
                        Badge
                      </th>
                      <th className="px-4 py-3 text-start text-sm font-medium text-neutral-600">
                        Status
                      </th>
                      <th className="px-4 py-3 text-start text-sm font-medium text-neutral-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredProducts.map((product) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          isDeleting={deletingId === product.id}
                        />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {!isLoading && !isError && products.length > 0 && (
          <div className="mt-6 text-sm text-neutral-500">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </div>
    </div>
  )
}
