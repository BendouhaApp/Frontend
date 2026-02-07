import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  AlertCircle,
  Check,
  Loader2,
  Eye,
  EyeOff,
  RefreshCcw,
  ArrowUpDown,
  Hash,
  Package,
  Tag,
  DollarSign,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL;
const money = (v: string | number | null | undefined) => {
  const n = typeof v === "string" ? Number(v) : Number(v ?? 0);
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(2);
};
const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

type ApiError = { message?: string | string[] };
const getErrMsg = (data: any, fallback = "Something went wrong") => {
  const msg = (data as ApiError)?.message;
  if (Array.isArray(msg)) return msg.join(" · ");
  return msg || fallback;
};

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL;

const img = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${PUBLIC_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

async function api<T>(
  path: string,
  opts: RequestInit & { auth?: boolean } = { auth: true },
): Promise<T> {
  const token = localStorage.getItem("admin_token");

  const isFormData = opts.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(opts.headers as any),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (opts.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/${path}`, {
    ...opts,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(
      getErrMsg(data, `Request failed (${res.status})`),
    ) as any;
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

type DbProduct = {
  id: string;
  slug: string;
  product_name: string;
  sku: string | null;
  sale_price: string | number;
  compare_price: string | number | null;
  buying_price: string | number | null;
  quantity: number;
  short_description: string;
  product_description: string;
  product_type: string | null;
  published: boolean | null;
  disable_out_of_stock: boolean | null;
  note: string | null;
  created_at?: string;
  updated_at?: string;
  thumbnail?: string | null;
  gallery?: string[];
};

//type ListResponse = { message?: string; data: DbProduct[] } | DbProduct[];
type OneResponse = { message?: string; data: DbProduct } | DbProduct;

type ProductPayload = {
  product_name: string;
  slug: string;
  sku?: string | null;
  sale_price: number;
  compare_price?: number | null;
  buying_price?: number | null;
  quantity: number;
  short_description: string;
  product_description: string;
  product_type?: string | null;
  published?: boolean;
  disable_out_of_stock?: boolean;
  note?: string | null;
  thumbnail?: string | null;
  images?: string[];
  //main_category_id?: string;
  //sub_category_id?: string | null;
};

function FieldLabel({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700">
      {icon}
      {children}
    </label>
  );
}

function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition",
        "focus:border-primary focus:ring-2 focus:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    />
  );
}

function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition",
        "focus:border-primary focus:ring-2 focus:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
  iconOn,
  iconOff,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  iconOn?: React.ReactNode;
  iconOff?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition",
        checked
          ? "border-primary/30 bg-primary/5 text-primary"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
      )}
    >
      <span className="flex items-center gap-2">
        {checked ? iconOn : iconOff}
        {label}
      </span>
      <span
        className={cn(
          "h-5 w-9 rounded-full p-0.5 transition",
          checked ? "bg-primary" : "bg-neutral-300",
        )}
      >
        <span
          className={cn(
            "block h-4 w-4 rounded-full bg-white transition",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}

function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading,
}: {
  product?: DbProduct;
  onSubmit: (
    data: ProductPayload,
    files: {
      thumbnail?: File | null;
      images?: File[];
      removedImages?: string[];
    },
  ) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const [productName, setProductName] = useState(product?.product_name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(!product?.slug);
  const [sku, setSku] = useState(product?.sku ?? "");
  const [salePrice, setSalePrice] = useState<number>(
    Number(product?.sale_price ?? 0),
  );
  const [comparePrice, setComparePrice] = useState<string>(
    product?.compare_price != null ? String(product.compare_price) : "",
  );
  const [buyingPrice, setBuyingPrice] = useState<string>(
    product?.buying_price != null ? String(product.buying_price) : "",
  );
  const [quantity, setQuantity] = useState<number>(product?.quantity ?? 0);
  const [shortDesc, setShortDesc] = useState(product?.short_description ?? "");
  const [desc, setDesc] = useState(product?.product_description ?? "");
  const [type, setType] = useState(product?.product_type ?? "");
  const [published, setPublished] = useState(
    Boolean(product?.published ?? false),
  );
  const [disableOos, setDisableOos] = useState(
    Boolean(product?.disable_out_of_stock ?? true),
  );
  const [note, setNote] = useState(product?.note ?? "");

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  type NewImage = {
    file: File;
    preview: string;
  };
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    product?.gallery ?? [],
  );
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  useEffect(() => {
    setProductName(product?.product_name ?? "");
    setSlug(product?.slug ?? "");
    setAutoSlug(!product?.slug);
    setSku(product?.sku ?? "");
    setSalePrice(Number(product?.sale_price ?? 0));
    setComparePrice(
      product?.compare_price != null ? String(product.compare_price) : "",
    );
    setBuyingPrice(
      product?.buying_price != null ? String(product.buying_price) : "",
    );
    setQuantity(product?.quantity ?? 0);
    setShortDesc(product?.short_description ?? "");
    setDesc(product?.product_description ?? "");
    setType(product?.product_type ?? "");
    setPublished(Boolean(product?.published ?? false));
    setDisableOos(Boolean(product?.disable_out_of_stock ?? true));
    setNote(product?.note ?? "");

    setExistingImages(product?.gallery ?? []);
    setRemovedImages([]);
    setNewImages([]);
    setThumbnailFile(null);
  }, [product?.id]);

  useEffect(() => {
    if (!autoSlug) return;
    setSlug(slugify(productName));
  }, [productName, autoSlug]);

  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.preview));
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [newImages, thumbnailPreview]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ProductPayload = {
      product_name: productName.trim(),
      slug: slug.trim() || slugify(productName),
      sku: sku.trim() ? sku.trim() : null,
      sale_price: Number(salePrice || 0),
      compare_price: comparePrice.trim() ? Number(comparePrice) : null,
      buying_price: buyingPrice.trim() ? Number(buyingPrice) : null,
      quantity: Number.isFinite(quantity) ? quantity : 0,
      short_description: shortDesc.trim(),
      product_description: desc.trim(),
      product_type: type.trim() ? type.trim() : null,
      published,
      disable_out_of_stock: disableOos,
      note: note.trim() ? note.trim() : null,
      thumbnail: undefined,
      images: undefined,
    };

    onSubmit(payload, {
      thumbnail: thumbnailFile,
      images: newImages.map((img) => img.file),
      removedImages,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel icon={<Package className="h-4 w-4" />}>
            Product name *
          </FieldLabel>
          <Input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <FieldLabel icon={<Hash className="h-4 w-4" />}>Slug *</FieldLabel>
            <button
              type="button"
              onClick={() => setAutoSlug((v) => !v)}
              className={cn(
                "text-xs font-medium",
                autoSlug
                  ? "text-primary"
                  : "text-neutral-500 hover:text-neutral-700",
              )}
            >
              {autoSlug ? "Auto" : "Manual"}
            </button>
          </div>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            disabled={autoSlug}
          />
        </div>

        <div>
          <FieldLabel icon={<Tag className="h-4 w-4" />}>SKU</FieldLabel>
          <Input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div>
          <FieldLabel icon={<Package className="h-4 w-4" />}>
            Quantity *
          </FieldLabel>
          <Input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </div>

        <div>
          <FieldLabel icon={<DollarSign className="h-4 w-4" />}>
            Sale price *
          </FieldLabel>
          <Input
            type="number"
            step="0.01"
            min={0}
            value={salePrice}
            onChange={(e) => setSalePrice(Number(e.target.value))}
            required
          />
        </div>

        <div>
          <FieldLabel icon={<DollarSign className="h-4 w-4" />}>
            Compare price
          </FieldLabel>
          <Input
            type="number"
            step="0.01"
            min={0}
            value={comparePrice}
            onChange={(e) => setComparePrice(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div>
          <FieldLabel icon={<DollarSign className="h-4 w-4" />}>
            Buying price
          </FieldLabel>
          <Input
            type="number"
            step="0.01"
            min={0}
            value={buyingPrice}
            onChange={(e) => setBuyingPrice(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div>
          <FieldLabel icon={<Tag className="h-4 w-4" />}>
            Product type
          </FieldLabel>
          <Input
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="md:col-span-2">
          <FieldLabel icon={<FileText className="h-4 w-4" />}>
            Short description *
          </FieldLabel>
          <Textarea
            rows={2}
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            required
          />
        </div>

        <div className="md:col-span-2">
          <FieldLabel icon={<FileText className="h-4 w-4" />}>
            Full description *
          </FieldLabel>
          <Textarea
            rows={6}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            required
          />
        </div>

        <div className="md:col-span-2">
          <FieldLabel>Note</FieldLabel>
          <Textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
          <Toggle
            checked={published}
            onChange={setPublished}
            label={published ? "Published" : "Draft"}
            iconOn={<Eye className="h-4 w-4" />}
            iconOff={<EyeOff className="h-4 w-4" />}
          />
          <Toggle
            checked={disableOos}
            onChange={setDisableOos}
            label={disableOos ? "Hide out of stock" : "Show out of stock"}
            iconOn={<AlertCircle className="h-4 w-4" />}
            iconOff={<Check className="h-4 w-4" />}
          />
        </div>

        <div className="md:col-span-2">
          <FieldLabel>Thumbnail (optional)</FieldLabel>

          <label
            className={cn(
              "flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-sm transition",
              thumbnailFile
                ? "border-primary bg-primary/5"
                : "border-neutral-300 hover:bg-neutral-50",
            )}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setThumbnailFile(file);
                setThumbnailPreview(file ? URL.createObjectURL(file) : null);
              }}
            />

            {thumbnailFile ? (
              <>
                <Check className="h-5 w-5 text-primary" />
                <span className="font-medium text-primary">
                  Thumbnail selected
                </span>
              </>
            ) : (
              <>
                <Package className="h-5 w-5 text-neutral-400" />
                <span className="text-neutral-600">
                  Click to upload thumbnail
                </span>
              </>
            )}
          </label>

          {(thumbnailFile || product?.thumbnail) && (
            <div className="mt-3">
              <img
                src={thumbnailPreview ?? img(product?.thumbnail)}
                alt="Thumbnail preview"
                className="h-24 w-24 rounded-xl object-cover border"
              />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="mb-3 text-sm font-medium text-neutral-800">
          Gallery images (optional)
        </div>

        {/* Upload */}
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 p-6 text-sm transition hover:bg-neutral-100">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []).map((file) => ({
                file,
                preview: URL.createObjectURL(file),
              }));
              setNewImages((prev) => [...prev, ...files]);
            }}
          />
          <Plus className="h-5 w-5 text-neutral-400" />
          <span className="text-neutral-600">Add images</span>
        </label>

        {(existingImages.length > 0 || newImages.length > 0) && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {/* Existing images */}
            {existingImages.map((url) => (
              <div key={url} className="relative group h-24 w-24">
                <div className="h-full w-full overflow-hidden rounded-xl border bg-neutral-100">
                  <img
                    src={img(url)}
                    alt="Gallery preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setExistingImages((imgs) => imgs.filter((i) => i !== url));
                    setRemovedImages((r) => [...r, url]);
                  }}
                  className="absolute right-2 top-2 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* New images */}
            {newImages.map((img, i) => (
              <div key={i} className="relative group h-24 w-24">
                <div className="h-full w-full overflow-hidden rounded-xl border bg-neutral-100">
                  <img
                    src={img.preview}
                    alt="Gallery preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNewImages((imgs) => imgs.filter((_, x) => x !== i))
                  }
                  className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 border-t border-neutral-200 pt-6">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {product ? "Update product" : "Create product"}
        </Button>
      </div>
    </form>
  );
}

function BadgePill({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        published
          ? "bg-primary/10 text-primary"
          : "bg-neutral-100 text-neutral-600",
      )}
    >
      {published ? (
        <Eye className="h-3.5 w-3.5" />
      ) : (
        <EyeOff className="h-3.5 w-3.5" />
      )}
      {published ? "Published" : "Draft"}
    </span>
  );
}

function StockPill({ qty, disableOos }: { qty: number; disableOos: boolean }) {
  const inStock = qty > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        inStock ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
      )}
      title={
        disableOos
          ? "Out of stock products may be hidden"
          : "Out of stock products visible"
      }
    >
      {inStock ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <X className="h-3.5 w-3.5" />
      )}
      {inStock ? `In stock (${qty})` : "Out of stock"}
    </span>
  );
}

function ProductRow({
  product,
  selected,
  onToggleSelect,
  onEdit,
  onRequestDelete,
  isDeleting,
}: {
  product: DbProduct;
  selected: boolean;
  onToggleSelect: (id: string, checked: boolean) => void;
  onEdit: (p: DbProduct) => void;
  onRequestDelete: (p: DbProduct) => void;
  isDeleting?: boolean;
}) {
  const published = Boolean(product.published ?? false);
  const disableOos = Boolean(product.disable_out_of_stock ?? true);
  const thumb = product.thumbnail || null;

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "border-b border-neutral-100 transition-colors",
        "hover:bg-neutral-50",
        selected && "bg-primary/5",
        isDeleting && "opacity-50",
      )}
    >
      {/* Checkbox column */}
      <td className="w-12 px-4 align-middle">
        <div className="flex items-center justify-center">
          <label className="relative inline-flex cursor-pointer items-center justify-center">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onToggleSelect(product.id, e.target.checked)}
              className="peer sr-only"
              aria-label="Select product"
            />
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-lg transition-all duration-200",
                "border-2 bg-white",
                selected ? "border-primary bg-primary" : "border-neutral-300",
                "peer-hover:border-primary/60",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20 peer-focus-visible:ring-offset-2",
                "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              )}
            >
              {selected && (
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              )}
            </span>
          </label>
        </div>
      </td>

      {/* Product column */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-200">
            {thumb ? (
              <img
                src={img(thumb)}
                alt={product.product_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-400">
                <Package className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate font-medium text-neutral-900">
              {product.product_name}
            </p>
            <p className="truncate text-xs text-neutral-500">
              <span className="font-mono">{product.slug}</span>
              {product.sku && (
                <span className="ms-2">• SKU: {product.sku}</span>
              )}
            </p>
          </div>
        </div>
      </td>

      {/* Pricing */}
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">
              ${money(product.sale_price)}
            </span>
            {product.compare_price != null &&
            Number(product.compare_price) > 0 ? (
              <span className="text-xs text-neutral-400 line-through">
                ${money(product.compare_price)}
              </span>
            ) : null}
          </div>
          <div className="text-xs text-neutral-500">
            Cost: ${money(product.buying_price ?? 0)}
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <div className="flex flex-col gap-2">
          <BadgePill published={published} />
          <StockPill qty={product.quantity} disableOos={disableOos} />
        </div>
      </td>

      {/* Short description */}
      <td className="px-4 py-4">
        <div className="line-clamp-2 max-w-md text-sm text-neutral-600">
          {product.short_description}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => onEdit(product)}
            disabled={isDeleting}
            aria-label="Edit product"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => onRequestDelete(product)}
            disabled={isDeleting}
            aria-label="Delete product"
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
  );
}

// ==============================
// Page
// ==============================
export default function AdminProductsPage() {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DbProduct | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [items, setItems] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<DbProduct | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const [sort, setSort] = useState<"created" | "name" | "price" | "stock">(
    "created",
  );
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{
        data: DbProduct[];
        meta: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`products?page=${page}&limit=${limit}`, { method: "GET" });

      setItems(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (e: any) {
      setError(e?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (items.length === 0 && page > 1) {
      setPage((p) => p - 1);
    }
  }, [items]);

  const normalized = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? items
      : items.filter((p) => {
          const hay = [
            p.product_name,
            p.slug,
            p.sku ?? "",
            p.short_description ?? "",
            p.product_type ?? "",
          ]
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        });

    const sorted = [...filtered].sort((a, b) => {
      const factor = dir === "asc" ? 1 : -1;
      if (sort === "name")
        return a.product_name.localeCompare(b.product_name) * factor;
      if (sort === "price")
        return (Number(a.sale_price) - Number(b.sale_price)) * factor;
      if (sort === "stock") return (a.quantity - b.quantity) * factor;
      // created fallback: use updated_at/created_at if present, else stable by name
      const at = (a.updated_at || a.created_at || "") as string;
      const bt = (b.updated_at || b.created_at || "") as string;
      if (at && bt) return at.localeCompare(bt) * factor;
      return a.product_name.localeCompare(b.product_name) * factor;
    });

    return sorted;
  }, [items, query, sort, dir]);

  const hasSelection = selectedIds.length > 0;
  const isAllSelected =
    normalized.length > 0 && selectedIds.length === normalized.length;

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = async (p: DbProduct) => {
    setError("");
    setSaving(true);
    try {
      const res = await api<OneResponse>(`products/${p.id}`, { method: "GET" });
      const raw = "data" in (res as any) ? (res as any).data : res;

      const normalized: DbProduct = {
        ...raw,
        thumbnail: raw.thumbnail ?? null,
        gallery: Array.isArray(raw.gallery)
          ? raw.gallery.map((g: any) => g.image ?? g)
          : [],
      };
      setEditing(normalized);

      setShowForm(true);
    } catch (e: any) {
      setError(e?.message || "Failed to load product");
    } finally {
      setSaving(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const create = async (
    payload: ProductPayload,
    files?: {
      thumbnail?: File | null;
      images?: File[];
      removedImages?: string[];
    },
  ) => {
    setSaving(true);
    setError("");

    try {
      const fd = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        fd.append(key, String(value));
      });

      if (files?.thumbnail) {
        fd.append("thumbnail", files.thumbnail);
      }

      files?.images?.forEach((file) => {
        fd.append("images", file);
      });

      files?.removedImages?.forEach((url) => {
        fd.append("removed_images", url);
      });

      await api("products", {
        method: "POST",
        body: fd,
      });

      await load();
      closeForm();
    } catch (e: any) {
      setError(e?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const update = async (
    payload: ProductPayload,
    files?: {
      thumbnail?: File | null;
      images?: File[];
      removedImages?: string[];
    },
  ) => {
    if (!editing) return;

    setSaving(true);
    setError("");

    try {
      const fd = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        fd.append(key, String(value));
      });

      if (files?.thumbnail) {
        fd.append("thumbnail", files.thumbnail);
      }

      files?.images?.forEach((file) => {
        fd.append("images", file);
      });

      files?.removedImages?.forEach((url) => {
        fd.append("removed_images", url);
      });

      await api(`products/${editing.id}`, {
        method: "PATCH",
        body: fd,
      });

      await load();
      closeForm();
    } catch (e: any) {
      setError(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setDeletingId(id);
    setError("");

    try {
      await api(`products/${id}`, { method: "DELETE" });
      setItems((p) => p.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const bulkUpdateStatus = async (published: boolean) => {
    try {
      await api("products/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ids: selectedIds,
          published,
        }),
      });

      setItems((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, published } : p)),
      );

      setSelectedIds([]);
    } catch (e: any) {
      setError(e?.message || "Bulk update failed");
    }
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) return;

    setSaving(true);
    setError("");

    try {
      await api("products/bulk", {
        method: "DELETE",
        body: JSON.stringify({ ids: selectedIds }),
      });

      setItems((prev) => prev.filter((p) => !selectedIds.includes(p.id)));

      setSelectedIds([]);
      setConfirmBulkDelete(false);
    } catch (e: any) {
      setError(e?.message || "Bulk delete failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                Products
              </h1>
              <p className="mt-1 text-neutral-600">
                Manage your store products.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={load}
                className="gap-2"
                disabled={loading}
              >
                <RefreshCcw
                  className={cn("h-4 w-4", loading && "animate-spin")}
                />
                Refresh
              </Button>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Add product
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-lg">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, slug, SKU, type…"
                className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setSort((s) =>
                    s === "created"
                      ? "name"
                      : s === "name"
                        ? "price"
                        : s === "price"
                          ? "stock"
                          : "created",
                  );
                }}
              >
                <ArrowUpDown className="h-4 w-4" />
                Sort: {sort}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
              >
                <ArrowUpDown className="h-4 w-4" />
                {dir.toUpperCase()}
              </Button>

              <div className="text-sm text-neutral-500">
                {normalized.length} / {items.length}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={closeForm}
              />
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                className="fixed inset-4 z-50 mx-auto max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:inset-8"
              >
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">
                      {editing ? "Update product" : "Add new product"}
                    </h2>
                    <p className="text-sm text-neutral-500">
                      Editing{" "}
                      <span className="font-medium">
                        {editing?.product_name}
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeForm}
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <ProductForm
                  product={editing ?? undefined}
                  onSubmit={editing ? update : create}
                  onCancel={closeForm}
                  isLoading={saving}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {loading && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <Package className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">
              No products yet
            </h3>
            <p className="mb-6 text-neutral-600">
              Create your first product to get started.
            </p>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add product
            </Button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-neutral-200 shadow-md hover:shadow-lg transition-shadow">
            {normalized.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="mx-auto mb-4 h-10 w-10 text-neutral-400" />
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                  No matches
                </h3>
                <p className="text-neutral-600">Try another search query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto px-2 md:px-4">
                <table className="min-w-[980px] w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="w-10 px-4">
                        <div className="flex items-center justify-center">
                          <label className="relative inline-flex cursor-pointer items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isAllSelected}
                              onChange={(e) =>
                                setSelectedIds(
                                  e.target.checked
                                    ? normalized.map((p) => p.id)
                                    : [],
                                )
                              }
                              className="peer sr-only"
                              aria-label="Select all products"
                            />
                            <span
                              className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-lg transition-all duration-200",
                                "border-2 bg-white",
                                isAllSelected
                                  ? "border-primary bg-primary"
                                  : "border-neutral-300",
                                "peer-hover:border-primary/60",
                                "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20 peer-focus-visible:ring-offset-2",
                              )}
                            >
                              {isAllSelected && (
                                <Check
                                  className="h-3.5 w-3.5 text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </span>
                          </label>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Pricing
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
                        Short description
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-700">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <AnimatePresence initial={false}>
                      {normalized.map((p) => (
                        <ProductRow
                          key={p.id}
                          product={p}
                          selected={selectedIds.includes(p.id)}
                          onToggleSelect={(id, checked) =>
                            setSelectedIds((prev) =>
                              checked
                                ? [...prev, id]
                                : prev.filter((x) => x !== id),
                            )
                          }
                          onEdit={openEdit}
                          onRequestDelete={setConfirmDelete}
                          isDeleting={deletingId === p.id}
                        />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {hasSelection && (
          <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
            <div className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-xl">
              <span className="text-sm text-neutral-600">
                {selectedIds.length} selected
              </span>

              <Button
                variant="destructive"
                onClick={() => setConfirmBulkDelete(true)}
              >
                Delete selected
              </Button>

              <Button variant="outline" onClick={() => bulkUpdateStatus(true)}>
                Activate
              </Button>

              <Button variant="outline" onClick={() => bulkUpdateStatus(false)}>
                Disable
              </Button>

              <Button
                variant="ghost"
                className="text-neutral-500"
                onClick={() => setSelectedIds([])}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {(saving || deletingId) && (
          <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm shadow-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              Working…
            </div>
          </div>
        )}
      </div>
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-neutral-200">
          <span className="text-sm text-neutral-500">
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
            />

            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-neutral-900">
                  Delete product
                </h3>

                <p className="mt-2 text-sm text-neutral-600">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-neutral-900">
                    “{confirmDelete.product_name}”
                  </span>
                  ?
                  <br />
                  Once deleted, this product <strong>cannot be restored</strong>.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDelete(null)}
                    disabled={deletingId === confirmDelete.id}
                  >
                    Cancel
                  </Button>

                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    disabled={deletingId === confirmDelete.id}
                    onClick={async () => {
                      await deleteProduct(confirmDelete.id);
                      setConfirmDelete(null);
                    }}
                  >
                    {deletingId === confirmDelete.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirmBulkDelete && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmBulkDelete(false)}
            />

            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-neutral-900">
                  Delete {selectedIds.length} products
                </h3>

                <p className="mt-2 text-sm text-neutral-600">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-neutral-900">
                    {selectedIds.length}
                  </span>{" "}
                  products?
                  <br />
                  Once deleted, all product <strong>cannot be restored</strong>.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmBulkDelete(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>

                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    disabled={saving}
                    onClick={bulkDelete}
                  >
                    {saving ? "Deleting..." : "Delete all"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
