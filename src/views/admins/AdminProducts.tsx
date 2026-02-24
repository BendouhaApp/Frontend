import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "@/lib/gsap-motion";
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
  Lightbulb,
  Zap,
  Gauge,
  Folder,
  ChevronRight,
  ChevronDown,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { handleImageError, resolveMediaUrl } from "@/lib/media";
import { compressImageBatch, compressImageFile } from "@/lib/image-compressor";
import api from "@/lib/axios";
import { toast } from "sonner";

const money = (v: string | number | null | undefined) => {
  const n = typeof v === "string" ? Number(v) : Number(v ?? 0);
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(2);
};
const CURRENCY = "DZD";

const bytes = (value: number) => {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
};

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const img = (url?: string | null) => {
  return resolveMediaUrl(url, "");
};

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
  cct: number;
  lumen: number;
  cri: number;
  power: string | number;
  angle: number;
  product_categories?: Array<{
    category_id: string;
    categories: {
      id: string;
      category_name: string;
      parent_id: string | null;
    };
  }>;
};

type DbCategory = {
  id: string;
  category_name: string;
  category_description?: string | null;
  parent_id?: string | null;
  active?: boolean | null;
  image?: string | null;
  other_categories?: DbCategory[];
};

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
  cct: number;
  lumen: number;
  cri: number;
  power: number;
  angle: number;
  category_ids?: string[];
};

function FieldLabel({
  icon,
  children,
  required,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700">
      {icon}
      {children}
      {required && <span className="text-red-500">*</span>}
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

function CategorySelector({
  categories,
  selectedIds,
  onChange,
}: {
  categories: DbCategory[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [mainFilterId, setMainFilterId] = useState<string>("all");

  const activeCategories = useMemo(
    () => categories.filter((c) => c.active !== false),
    [categories],
  );

  const byId = useMemo(() => {
    const m = new Map<string, DbCategory>();
    activeCategories.forEach((c) => m.set(c.id, c));
    return m;
  }, [activeCategories]);

  const mainCategories = useMemo(
    () => activeCategories.filter((c) => !c.parent_id),
    [activeCategories],
  );

  const subByParent = useMemo(() => {
    const m = new Map<string, DbCategory[]>();
    activeCategories.forEach((c) => {
      if (!c.parent_id) return;
      const arr = m.get(c.parent_id) ?? [];
      arr.push(c);
      m.set(c.parent_id, arr);
    });
    m.forEach((arr) =>
      arr.sort((a, b) => a.category_name.localeCompare(b.category_name)),
    );
    return m;
  }, [activeCategories]);

  useEffect(() => {
    if (mainFilterId === "all") return;
    setExpandedIds((prev) =>
      prev.includes(mainFilterId) ? prev : [...prev, mainFilterId],
    );
  }, [mainFilterId]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleCategory = (id: string) => {
    const cat = byId.get(id);
    if (!cat) return;

    const isCurrentlySelected = selectedIds.includes(id);

    if (!cat.parent_id && isCurrentlySelected) {
      const subsToRemove = subByParent.get(id)?.map((s) => s.id) ?? [];
      onChange(
        selectedIds.filter((x) => x !== id && !subsToRemove.includes(x)),
      );
      return;
    }

    if (cat.parent_id && !isCurrentlySelected) {
      if (!selectedIds.includes(cat.parent_id)) {
        return;
      }
    }

    onChange(
      isCurrentlySelected
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  const removeSelected = (id: string) => {
    const cat = byId.get(id);
    if (!cat) {
      onChange(selectedIds.filter((x) => x !== id));
      return;
    }

    if (!cat.parent_id) {
      const subsToRemove = subByParent.get(id)?.map((s) => s.id) ?? [];
      onChange(
        selectedIds.filter((x) => x !== id && !subsToRemove.includes(x)),
      );
    } else {
      onChange(selectedIds.filter((x) => x !== id));
    }
  };

  const isSelected = (id: string) => selectedIds.includes(id);
  const isExpanded = (id: string) => expandedIds.includes(id);
  const canSelectSubcategory = (parentId: string) =>
    selectedIds.includes(parentId);

  const filteredMain =
    mainFilterId === "all"
      ? mainCategories
      : mainCategories.filter((m) => m.id === mainFilterId);

  const selectedChips = useMemo(() => {
    const items = selectedIds
      .map((id) => byId.get(id))
      .filter(Boolean) as DbCategory[];

    const toBreadcrumb = (c: DbCategory) => {
      if (!c.parent_id) return c.category_name;
      const p = byId.get(c.parent_id);
      return p ? `${p.category_name} / ${c.category_name}` : c.category_name;
    };

    return items
      .map((c) => ({ id: c.id, label: toBreadcrumb(c), isSub: !!c.parent_id }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [selectedIds, byId]);

  const Checkbox = ({
    checked,
    onCheckedChange,
    disabled,
  }: {
    checked: boolean;
    onCheckedChange: () => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onCheckedChange}
      disabled={disabled}
      className={cn(
        "group relative grid h-6 w-6 place-items-center rounded-lg border-2 transition-all",
        checked ? "border-primary bg-primary" : "border-neutral-300 bg-white",
        disabled
          ? "cursor-not-allowed opacity-40 hover:border-neutral-300"
          : "hover:border-primary/60",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
      )}
      aria-pressed={checked}
      aria-label={checked ? "Unselect category" : "Select category"}
      title={disabled ? "Select the main category first" : ""}
    >
      <Check
        className={cn(
          "h-4 w-4 text-white transition-opacity",
          checked ? "opacity-100" : "opacity-0",
        )}
        strokeWidth={3}
      />
    </button>
  );

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
            <Filter className="h-4 w-4" />
          </span>

          <div className="flex-1">
            <p className="text-sm font-semibold text-neutral-900">Categories</p>
            <p className="text-xs text-neutral-500">
              Select main categories first, then choose subcategories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={mainFilterId}
            onChange={(e) => setMainFilterId(e.target.value)}
            className={cn(
              "h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
            )}
          >
            <option value="all">All main categories</option>
            {mainCategories
              .slice()
              .sort((a, b) => a.category_name.localeCompare(b.category_name))
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.category_name}
                </option>
              ))}
          </select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMainFilterId("all")}
            disabled={mainFilterId === "all"}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {selectedChips.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              {selectedChips.map((c) => (
                <span
                  key={c.id}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                    c.isSub
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-neutral-200 bg-white text-neutral-700",
                  )}
                >
                  <span className="max-w-[240px] truncate">{c.label}</span>
                  <button
                    type="button"
                    onClick={() => removeSelected(c.id)}
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded-full transition",
                      "hover:bg-black/5",
                    )}
                    aria-label="Remove category"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 max-h-[26rem] overflow-y-auto pr-1">
        {filteredMain.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 p-6 text-center">
            <p className="text-sm font-medium text-neutral-800">
              No categories available
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Create categories first, then assign them to products.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMain
              .slice()
              .sort((a, b) => a.category_name.localeCompare(b.category_name))
              .map((main) => {
                const subs = subByParent.get(main.id) ?? [];
                const hasSubs = subs.length > 0;
                const mainSelected = isSelected(main.id);

                return (
                  <div
                    key={main.id}
                    className={cn(
                      "rounded-xl border transition",
                      mainSelected
                        ? "border-primary/30 bg-primary/5"
                        : "border-neutral-200 bg-white hover:border-neutral-300",
                    )}
                  >
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => hasSubs && toggleExpand(main.id)}
                        className={cn(
                          "grid h-9 w-9 place-items-center rounded-lg transition",
                          hasSubs
                            ? "hover:bg-neutral-100 text-neutral-600"
                            : "text-neutral-300 cursor-default",
                        )}
                        aria-label={
                          hasSubs ? "Toggle sub-categories" : undefined
                        }
                      >
                        {hasSubs ? (
                          isExpanded(main.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronRight className="h-4 w-4 opacity-0" />
                        )}
                      </button>

                      <Checkbox
                        checked={mainSelected}
                        onCheckedChange={() => toggleCategory(main.id)}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Folder
                            className={cn(
                              "h-4 w-4",
                              mainSelected
                                ? "text-primary"
                                : "text-neutral-400",
                            )}
                          />
                          <p
                            className={cn(
                              "truncate text-sm font-semibold",
                              mainSelected
                                ? "text-primary"
                                : "text-neutral-900",
                            )}
                          >
                            {main.category_name}
                          </p>

                          {hasSubs && (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                mainSelected
                                  ? "bg-primary/20 text-primary"
                                  : "bg-neutral-100 text-neutral-600",
                              )}
                            >
                              {subs.length} Sub Category
                            </span>
                          )}
                        </div>

                        {main.category_description ? (
                          <p className="mt-0.5 truncate text-xs text-neutral-500">
                            {main.category_description}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {hasSubs && isExpanded(main.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="relative pb-3">
                            <div
                              className={cn(
                                "absolute left-7 top-0 h-full w-px",
                                mainSelected
                                  ? "bg-primary/30"
                                  : "bg-neutral-200",
                              )}
                            />
                            <div className="space-y-1 px-3 pb-2 pl-14">
                              {!mainSelected && (
                                <div className="mb-2 rounded-lg bg-amber-50 border border-amber-200 px-2 py-1.5 text-xs text-amber-700">
                                  Select the main category "{main.category_name}
                                  " first to enable subcategories
                                </div>
                              )}
                              {subs.map((sub) => {
                                const canSelect = canSelectSubcategory(main.id);
                                return (
                                  <div
                                    key={sub.id}
                                    className={cn(
                                      "relative flex items-center gap-3 rounded-lg px-2 py-2 transition",
                                      canSelect
                                        ? "hover:bg-neutral-50"
                                        : "opacity-60",
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "absolute -left-7 top-1/2 h-px w-7",
                                        mainSelected
                                          ? "bg-primary/30"
                                          : "bg-neutral-200",
                                      )}
                                    />
                                    <Checkbox
                                      checked={isSelected(sub.id)}
                                      onCheckedChange={() =>
                                        toggleCategory(sub.id)
                                      }
                                      disabled={!canSelect}
                                    />
                                    <p
                                      className={cn(
                                        "min-w-0 truncate text-sm",
                                        canSelect
                                          ? "text-neutral-700"
                                          : "text-neutral-400",
                                      )}
                                    >
                                      {sub.category_name}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
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

  const [cct, setCct] = useState<number>(product?.cct ?? 3000);
  const [lumen, setLumen] = useState<number>(product?.lumen ?? 800);
  const [cri, setCri] = useState<number>(product?.cri ?? 80);
  const [power, setPower] = useState<number>(Number(product?.power ?? 10));
  const [angle, setAngle] = useState<number>(product?.angle ?? 120);

  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.product_categories?.map((pc) => pc.category_id) ?? [],
  );

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
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionMessage, setCompressionMessage] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get<{ message?: string; data: DbCategory[] }>(
          "categories/admin",
        );
        setCategories(res.data.data ?? []);
      } catch (error: any) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

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

    setCct(product?.cct ?? 3000);
    setLumen(product?.lumen ?? 800);
    setCri(product?.cri ?? 80);
    setPower(Number(product?.power ?? 10));
    setAngle(product?.angle ?? 120);

    setSelectedCategoryIds(
      product?.product_categories?.map((pc) => pc.category_id) ?? [],
    );

    setExistingImages(product?.gallery ?? []);
    setRemovedImages([]);
    setNewImages([]);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setCompressionMessage("");
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

    if (isCompressing) {
      toast.error("Please wait for the images to finish compressing.");
      return;
    }

    if (!productName.trim()) {
      toast.error("The product name is mandatory.");
      return;
    }

    if (!slug.trim() && !productName.trim()) {
      toast.error("Le slug ne peut pas être vide.");
      return;
    }

    if (salePrice < 0) {
      toast.error("The sale price must be positive.");
      return;
    }

    if (quantity < 0) {
      toast.error("The quantity must be positive.");
      return;
    }

    if (cct < 1000 || cct > 10000) {
      toast.error("The CCT must be between 1000 and 10000 Kelvin.");
      return;
    }

    if (lumen < 1) {
      toast.error("The lumen must be greater than or equal to 1.");
      return;
    }

    if (cri < 0 || cri > 100) {
      toast.error("The CRI must be between 0 and 100.");
      return;
    }

    if (power < 0) {
      toast.error("The power must be positive.");
      return;
    }

    if (angle < 1 || angle > 180) {
      toast.error("L'angle doit être compris entre 1° et 180°.");
      return;
    }

    if (selectedCategoryIds.length === 0) {
      toast.error("Veuillez sélectionner au moins une catégorie.");
      return;
    }

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
      cct: Number(cct),
      lumen: Number(lumen),
      cri: Number(cri),
      power: Number(power),
      angle: Number(angle),
      category_ids: selectedCategoryIds,
    };

    onSubmit(payload, {
      thumbnail: thumbnailFile,
      images: newImages.map((img) => img.file),
      removedImages,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Basic Information
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel icon={<Package className="h-4 w-4" />} required>
              Product name
            </FieldLabel>
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              placeholder="Enter product name"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <FieldLabel icon={<Hash className="h-4 w-4" />} required>
                Slug
              </FieldLabel>
              <button
                type="button"
                onClick={() => setAutoSlug((v) => !v)}
                className={cn(
                  "text-xs font-medium transition",
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
              placeholder="product-slug"
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
            <FieldLabel icon={<Package className="h-4 w-4" />} required>
              Quantity
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
            <FieldLabel icon={<DollarSign className="h-4 w-4" />} required>
              Sale price
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
            <FieldLabel icon={<FileText className="h-4 w-4" />} required>
              Short description
            </FieldLabel>
            <Textarea
              rows={2}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              required
              maxLength={165}
              placeholder="Brief description (max 165 characters)"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {shortDesc.length}/165 characters
            </p>
          </div>

          <div className="md:col-span-2">
            <FieldLabel icon={<FileText className="h-4 w-4" />} required>
              Full description
            </FieldLabel>
            <Textarea
              rows={6}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
              placeholder="Detailed product description"
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel>Note</FieldLabel>
            <Textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Internal notes (optional)"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Lighting Specifications
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <FieldLabel icon={<Gauge className="h-4 w-4" />} required>
              CCT (Kelvin)
            </FieldLabel>
            <Input
              type="number"
              min={1000}
              max={10000}
              step={100}
              value={cct}
              onChange={(e) => setCct(Number(e.target.value))}
              required
              placeholder="e.g., 3000"
            />
            <p className="mt-1 text-xs text-neutral-500">Range: 1000-10000K</p>
          </div>

          <div>
            <FieldLabel icon={<Zap className="h-4 w-4" />} required>
              Lumen (lm)
            </FieldLabel>
            <Input
              type="number"
              min={1}
              step={1}
              value={lumen}
              onChange={(e) => setLumen(Number(e.target.value))}
              required
              placeholder="e.g., 800"
            />
            <p className="mt-1 text-xs text-neutral-500">Minimum: 1 lm</p>
          </div>

          <div>
            <FieldLabel icon={<Gauge className="h-4 w-4" />} required>
              CRI
            </FieldLabel>
            <Input
              type="number"
              min={0}
              max={100}
              step={1}
              value={cri}
              onChange={(e) => setCri(Number(e.target.value))}
              required
              placeholder="e.g., 80"
            />
            <p className="mt-1 text-xs text-neutral-500">Range: 0-100</p>
          </div>

          <div>
            <FieldLabel icon={<Zap className="h-4 w-4" />} required>
              Power (W)
            </FieldLabel>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={power}
              onChange={(e) => setPower(Number(e.target.value))}
              required
              placeholder="e.g., 10"
            />
            <p className="mt-1 text-xs text-neutral-500">In Watts</p>
          </div>

          <div className="md:col-span-2">
            <FieldLabel icon={<Gauge className="h-4 w-4" />} required>
              Beam Angle (degrees)
            </FieldLabel>
            <Input
              type="number"
              min={1}
              max={180}
              step={1}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              required
              placeholder="e.g., 120"
            />
            <p className="mt-1 text-xs text-neutral-500">Plage : 1-180°</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <Folder className="h-5 w-5 text-primary" />
          Categories
        </h3>

        {loadingCategories ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <CategorySelector
              categories={categories}
              selectedIds={selectedCategoryIds}
              onChange={setSelectedCategoryIds}
            />
            {selectedCategoryIds.length > 0 && (
              <p className="text-sm text-neutral-600">
                Selected {selectedCategoryIds.length} categor
                {selectedCategoryIds.length === 1 ? "y" : "ies"}
              </p>
            )}
          </>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900">Status</h3>
        <div className="grid gap-3 md:grid-cols-2">
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
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900">Images</h3>
        {compressionMessage && (
          <p className="text-xs text-neutral-600">{compressionMessage}</p>
        )}

        <div>
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
              disabled={isCompressing}
              onChange={async (e) => {
                const file = e.target.files?.[0] || null;
                if (!file) {
                  setThumbnailFile(null);
                  setThumbnailPreview((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return null;
                  });
                  return;
                }

                setIsCompressing(true);
                setCompressionMessage("Compressing thumbnail...");

                try {
                  const compressed = await compressImageFile(file, {
                    maxDimension: 1600,
                    maxSizeMB: 0.8,
                  });

                  setThumbnailFile(compressed);
                  setThumbnailPreview((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return URL.createObjectURL(compressed);
                  });

                  const saved = Math.max(0, file.size - compressed.size);
                  setCompressionMessage(
                    saved > 0
                      ? `Thumbnail compressed: ${bytes(file.size)} -> ${bytes(compressed.size)} (saved ${bytes(saved)}).`
                      : "Thumbnail is already optimized.",
                  );
                } catch {
                  setThumbnailFile(file);
                  setThumbnailPreview((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return URL.createObjectURL(file);
                  });
                  setCompressionMessage(
                    "Could not compress thumbnail. Using original file.",
                  );
                } finally {
                  setIsCompressing(false);
                  e.target.value = "";
                }
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
                onError={(event) => handleImageError(event)}
              />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="mb-3 text-sm font-medium text-neutral-800">
            Gallery images (optional)
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 p-6 text-sm transition hover:bg-neutral-100">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={isCompressing}
              onChange={async (e) => {
                const selectedFiles = Array.from(e.target.files ?? []);
                if (selectedFiles.length === 0) return;

                setIsCompressing(true);
                setCompressionMessage(
                  `Compressing gallery images (0/${selectedFiles.length})...`,
                );

                try {
                  const compressedFiles = await compressImageBatch(
                    selectedFiles,
                    {
                      maxDimension: 1920,
                      maxSizeMB: 1.2,
                    },
                    (done, total) => {
                      setCompressionMessage(
                        `Compressing gallery images (${done}/${total})...`,
                      );
                    },
                  );

                  const previews = compressedFiles.map((file) => ({
                    file,
                    preview: URL.createObjectURL(file),
                  }));
                  setNewImages((prev) => [...prev, ...previews]);

                  const saved = selectedFiles.reduce(
                    (sum, original, idx) =>
                      sum +
                      Math.max(0, original.size - compressedFiles[idx].size),
                    0,
                  );

                  setCompressionMessage(
                    saved > 0
                      ? `Gallery compressed: saved ${bytes(saved)} across ${selectedFiles.length} file(s).`
                      : "Gallery images are already optimized.",
                  );
                } catch {
                  const fallback = selectedFiles.map((file) => ({
                    file,
                    preview: URL.createObjectURL(file),
                  }));
                  setNewImages((prev) => [...prev, ...fallback]);
                  setCompressionMessage(
                    "Could not compress some images. Original files were kept.",
                  );
                } finally {
                  setIsCompressing(false);
                  e.target.value = "";
                }
              }}
            />
            <Plus className="h-5 w-5 text-neutral-400" />
            <span className="text-neutral-600">Add images</span>
          </label>

          {(existingImages.length > 0 || newImages.length > 0) && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {existingImages.map((url) => (
                <div key={url} className="relative group h-24 w-24">
                  <div className="h-full w-full overflow-hidden rounded-xl border bg-neutral-100">
                    <img
                      src={img(url)}
                      alt="Gallery preview"
                      className="h-full w-full object-cover"
                      onError={(event) => handleImageError(event)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setExistingImages((imgs) =>
                        imgs.filter((i) => i !== url),
                      );
                      setRemovedImages((r) => [...r, url]);
                    }}
                    className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

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
                      setNewImages((imgs) => {
                        const next = [...imgs];
                        const removed = next.splice(i, 1)[0];
                        if (removed) URL.revokeObjectURL(removed.preview);
                        return next;
                      })
                    }
                    className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
        <Button
          type="submit"
          className="flex-1"
          disabled={isLoading || isCompressing}
        >
          {(isLoading || isCompressing) && (
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
          )}
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
      {inStock ? `Stock (${qty})` : "Out"}
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
      <td className="w-10 px-3 align-middle">
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
              )}
            >
              {selected && (
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              )}
            </span>
          </label>
        </div>
      </td>

      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-neutral-200">
            {thumb ? (
              <img
                src={img(thumb)}
                alt={product.product_name}
                className="h-full w-full object-cover"
                onError={(event) => handleImageError(event)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-400">
                <Package className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-neutral-900 text-sm">
              {product.product_name}
            </p>
            <p className="truncate text-xs text-neutral-500">
              <span className="font-mono">{product.slug}</span>
            </p>
          </div>
        </div>
      </td>

      <td className="px-3 py-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-neutral-900 text-sm">
              {money(product.sale_price)} {CURRENCY}
            </span>
            {product.compare_price != null &&
            Number(product.compare_price) > 0 ? (
              <span className="text-xs text-neutral-400 line-through">
                {money(product.compare_price)} {CURRENCY}
              </span>
            ) : null}
          </div>
          <div className="text-xs text-neutral-500">
            Coast : {money(product.buying_price ?? 0)} {CURRENCY}
          </div>
        </div>
      </td>

      <td className="px-3 py-3">
        <div className="flex flex-col gap-1.5">
          <BadgePill published={published} />
          <StockPill qty={product.quantity} disableOos={disableOos} />
        </div>
      </td>

      <td className="px-3 py-3">
        <div className="flex flex-col gap-1 text-xs text-neutral-600">
          <div className="flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            <span>
              {product.cct}K - {product.lumen}lm
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span>
              {money(product.power)}W - {product.angle}°
            </span>
          </div>
        </div>
      </td>

      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(product)}
            disabled={isDeleting}
            aria-label="Modifier le produit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => onRequestDelete(product)}
            disabled={isDeleting}
            aria-label="Supprimer le produit"
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

export default function AdminProductsPage() {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DbProduct | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState<string>("1");

  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Category filter state
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

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

  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get<{ message?: string; data: DbCategory[] }>(
          "categories/admin",
        );
        setCategories(res.data.data ?? []);
      } catch (error: any) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Main categories (no parent)
  const mainCategories = useMemo(
    () => categories.filter((c) => !c.parent_id && c.active !== false),
    [categories],
  );

  // Subcategories for selected main category
  const subCategories = useMemo(() => {
    if (!selectedMainCategory) return [];
    return categories.filter(
      (c) => c.parent_id === selectedMainCategory && c.active !== false,
    );
  }, [categories, selectedMainCategory]);

  // Reset subcategory when main category changes
  useEffect(() => {
    setSelectedSubCategory("");
  }, [selectedMainCategory]);

  // Determine active filter category ID
  const activeCategoryFilter =
    selectedSubCategory || selectedMainCategory || "";

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));

      if (debouncedQuery.trim()) {
        params.set("search", debouncedQuery.trim());
      }

      if (activeCategoryFilter) {
        params.set("categoryId", activeCategoryFilter);
      }

      const res = await api.get<{
        data: DbProduct[];
        meta: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`products?${params.toString()}`);

      setItems(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || "Failed to load products";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, debouncedQuery, activeCategoryFilter]);

  useEffect(() => {
    setPage(1);
    setPageInput("1");
  }, [debouncedQuery, activeCategoryFilter]);

  useEffect(() => {
    if (items.length === 0 && page > 1) {
      setPage((p) => p - 1);
    }
  }, [items]);

  const normalized = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      const factor = dir === "asc" ? 1 : -1;

      if (sort === "name")
        return a.product_name.localeCompare(b.product_name) * factor;

      if (sort === "price")
        return (Number(a.sale_price) - Number(b.sale_price)) * factor;

      if (sort === "stock") return (a.quantity - b.quantity) * factor;

      const at = (a.updated_at || a.created_at || "") as string;
      const bt = (b.updated_at || b.created_at || "") as string;

      if (at && bt) return at.localeCompare(bt) * factor;

      return a.product_name.localeCompare(b.product_name) * factor;
    });

    return sorted;
  }, [items, sort, dir]);

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
      const res = await api.get<OneResponse>(`products/${p.id}`);
      const raw = "data" in res.data ? res.data.data : res.data;

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
      const msg =
        e?.response?.data?.message || e?.message || "Failed to load product";
      setError(msg);
      toast.error(msg);
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
    const loadingToast = toast.loading("Creating product...");

    setSaving(true);

    try {
      const fd = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === "category_ids" && Array.isArray(value)) {
          value.forEach((id) => fd.append("category_ids[]", id));
          return;
        }

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

      const res = await api.post("products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.dismiss(loadingToast);

      toast.success(res?.data?.message || "Product created successfully");

      await load();
      closeForm();
    } catch (e: any) {
      toast.dismiss(loadingToast);

      toast.error(
        e?.response?.data?.message || e?.message || "Failed to create product",
      );
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

    const loadingToast = toast.loading("Updating product...");

    setSaving(true);

    try {
      const fd = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === "category_ids" && Array.isArray(value)) {
          value.forEach((id) => fd.append("category_ids[]", id));
          return;
        }

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

      const res = await api.patch(`products/${editing.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.dismiss(loadingToast);
      toast.success(res?.data?.message || "Product updated successfully ✨");

      await load();
      closeForm();
    } catch (e: any) {
      toast.dismiss(loadingToast);
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to update product",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    const loadingToast = toast.loading("Deleting product...");

    setDeletingId(id);

    try {
      const res = await api.delete(`products/${id}`);

      toast.dismiss(loadingToast);
      toast.success(res?.data?.message || "Product deleted successfully");

      await load();
    } catch (e: any) {
      toast.dismiss(loadingToast);
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to delete product",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const bulkUpdateStatus = async (published: boolean) => {
    if (selectedIds.length === 0) return;

    const loadingToast = toast.loading("Updating products...");

    try {
      const res = await api.patch("products/bulk", {
        ids: selectedIds,
        published,
      });

      toast.dismiss(loadingToast);
      toast.success(res?.data?.message || "Products updated successfully");

      setItems((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, published } : p)),
      );

      setSelectedIds([]);
    } catch (e: any) {
      toast.dismiss(loadingToast);
      toast.error(
        e?.response?.data?.message || e?.message || "Bulk update failed",
      );
    }
  };

  const bulkUpdateOutOfStockVisibility = async (hide: boolean) => {
    if (selectedIds.length === 0) return;

    const loadingToast = toast.loading("Updating products...");

    try {
      const res = await api.patch("products/bulk", {
        ids: selectedIds,
        disable_out_of_stock: hide,
      });

      toast.dismiss(loadingToast);
      toast.success(res?.data?.message || "Products updated successfully");

      setItems((prev) =>
        prev.map((p) =>
          selectedIds.includes(p.id) ? { ...p, disable_out_of_stock: hide } : p,
        ),
      );

      setSelectedIds([]);
    } catch (e: any) {
      toast.dismiss(loadingToast);
      toast.error(
        e?.response?.data?.message || e?.message || "Bulk update failed",
      );
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const loadingToast = toast.loading("Deleting selected products...");

    setSaving(true);

    try {
      const res = await api.delete("products/bulk", {
        data: { ids: selectedIds },
      });

      toast.dismiss(loadingToast);
      toast.success(res?.data?.message || "Products deleted successfully");

      setSelectedIds([]);
      setConfirmBulkDelete(false);

      await load();
    } catch (e: any) {
      toast.dismiss(loadingToast);
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to delete products",
      );

      setConfirmBulkDelete(false);
    } finally {
      setSaving(false);
    }
  };

  const selectedProducts = normalized.filter((p) => selectedIds.includes(p.id));

  const allPublished =
    selectedProducts.length > 0 && selectedProducts.every((p) => p.published);

  const allHideOos =
    selectedProducts.length > 0 &&
    selectedProducts.every((p) => p.disable_out_of_stock);

  // Get category name for display
  const getActiveCategoryName = () => {
    if (selectedSubCategory) {
      const sub = categories.find((c) => c.id === selectedSubCategory);
      return sub?.category_name || "";
    }
    if (selectedMainCategory) {
      const main = categories.find((c) => c.id === selectedMainCategory);
      return main?.category_name || "";
    }
    return "";
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
                Manage your store products with lighting specifications.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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

          <div className="mt-5 space-y-3">
            {/* Main Controls Row */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {/* Search */}
              <div className="relative min-w-[280px] flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, slug, SKU, type..."
                  className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Category Filters */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Folder className="h-4 w-4 text-neutral-500" />
                <select
                  value={selectedMainCategory}
                  onChange={(e) => setSelectedMainCategory(e.target.value)}
                  className={cn(
                    "h-10 min-w-[160px] rounded-xl border border-neutral-200 bg-white px-3 pr-8 text-sm outline-none transition",
                    "focus:border-primary focus:ring-2 focus:ring-primary/20",
                    selectedMainCategory &&
                      "border-primary/50 bg-primary/5 font-medium",
                  )}
                  disabled={loadingCategories}
                >
                  <option value="">All categories</option>
                  {mainCategories
                    .slice()
                    .sort((a, b) =>
                      a.category_name.localeCompare(b.category_name),
                    )
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                </select>

                {selectedMainCategory && subCategories.length > 0 && (
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className={cn(
                      "h-10 min-w-[160px] rounded-xl border border-neutral-200 bg-white px-3 pr-8 text-sm outline-none transition",
                      "focus:border-primary focus:ring-2 focus:ring-primary/20",
                      selectedSubCategory &&
                        "border-primary/50 bg-primary/5 font-medium",
                    )}
                  >
                    <option value="">All subcategories</option>
                    {subCategories
                      .slice()
                      .sort((a, b) =>
                        a.category_name.localeCompare(b.category_name),
                      )
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.category_name}
                        </option>
                      ))}
                  </select>
                )}

                {(selectedMainCategory || selectedSubCategory) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMainCategory("");
                      setSelectedSubCategory("");
                    }}
                    className="gap-1.5 h-10"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Spacer */}
              <div className="flex-1 min-w-4" />

              {/* Sort Controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-10"
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
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sort:</span> {sort}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-10 min-w-[85px]"
                  onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  {dir.toUpperCase()}
                </Button>

                <div className="text-sm text-neutral-500 tabular-nums flex-shrink-0">
                  {normalized.length} / {items.length}
                </div>
              </div>
            </div>

            {/* Active Filter Indicator */}
            {activeCategoryFilter && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5">
                  <Filter className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    {getActiveCategoryName()}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMainCategory("");
                      setSelectedSubCategory("");
                    }}
                    className="ml-1 grid h-4 w-4 place-items-center rounded hover:bg-primary/20 transition"
                    aria-label="Clear filter"
                  >
                    <X className="h-3 w-3 text-primary" />
                  </button>
                </div>
              </motion.div>
            )}
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
                    {editing && (
                      <p className="text-sm text-neutral-500">
                        Editing{" "}
                        <span className="font-medium">
                          {editing?.product_name}
                        </span>
                      </p>
                    )}
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
          <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-neutral-200">
            {normalized.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="mx-auto mb-4 h-10 w-10 text-neutral-400" />
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                  No matches
                </h3>
                <p className="text-neutral-600">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="w-10 px-3">
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
                      <th className="px-3 py-3 text-left text-sm font-semibold text-neutral-700">
                        Product
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-neutral-700">
                        Pricing
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-neutral-700">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-neutral-700">
                        Specs
                      </th>
                      <th className="px-3 py-3 text-right text-sm font-semibold text-neutral-700">
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
          <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1rem)] max-w-5xl -translate-x-1/2 sm:bottom-6">
            <div className="flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border bg-white px-3 py-3 shadow-xl sm:px-4">
              <span className="text-sm text-neutral-600">
                {selectedIds.length} selected
              </span>

              <Button
                variant="destructive"
                onClick={() => setConfirmBulkDelete(true)}
              >
                Delete selected
              </Button>

              <Button
                onClick={() => bulkUpdateStatus(!allPublished)}
                className={cn(
                  "transition border",
                  allPublished
                    ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300"
                    : "bg-primary/10 hover:bg-primary/20 text-primary border-primary/30",
                )}
              >
                {allPublished ? "Set as Draft" : "Set as Published"}
              </Button>

              <Button
                onClick={() => bulkUpdateOutOfStockVisibility(!allHideOos)}
                className={cn(
                  "transition border",
                  allHideOos
                    ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300"
                    : "bg-primary/10 hover:bg-primary/20 text-primary border-primary/30",
                )}
              >
                {allHideOos ? "Allow Out of Stock" : "Hide Out of Stock"}
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
              WorkingÃ¢â‚¬Â¦
            </div>
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-neutral-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span className="font-medium text-neutral-900">Page</span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-semibold">
              {page}
            </span>
            <span className="text-neutral-400">/</span>
            <span className="font-semibold">{totalPages}</span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                PrÃ©cÃ©dent
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Suivant
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">Aller Ã  la page</span>
              <Input
                inputMode="numeric"
                pattern="[0-9]*"
                value={pageInput}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d]/g, "");
                  setPageInput(v);
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  const n = Number(pageInput);
                  if (!Number.isFinite(n)) return;
                  const clamped = Math.min(totalPages, Math.max(1, n));
                  setPage(clamped);
                }}
                onBlur={() => {
                  if (!pageInput) {
                    setPageInput(String(page));
                    return;
                  }
                  const n = Number(pageInput);
                  if (!Number.isFinite(n)) {
                    setPageInput(String(page));
                    return;
                  }
                  const clamped = Math.min(totalPages, Math.max(1, n));
                  setPageInput(String(clamped));
                }}
                className={cn(
                  "h-8 w-12 text-center",
                  pageInput &&
                    (Number(pageInput) < 1 || Number(pageInput) > totalPages) &&
                    "border-rose-300 focus:border-rose-400 focus:ring-rose-200/40",
                )}
                aria-label="Aller Ã  la page"
              />
            </div>
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
                    "{confirmDelete.product_name}"
                  </span>
                  ?
                  <br />
                  Once deleted, this product <strong>cannot be restored</strong>
                  .
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
                  Once deleted, all products <strong>cannot be restored</strong>
                  .
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
