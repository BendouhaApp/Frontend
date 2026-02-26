import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, type Variants } from "@/lib/gsap-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Folder,
  Search,
  X,
  Loader2,
  RotateCcw,
  Image as ImageIcon,
  Check,
  FolderTree,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { handleImageError, resolveMediaUrl } from "@/lib/media";
import { compressImageFile } from "@/lib/image-compressor";
import { useGet } from "@/hooks/useGet";
import api from "@/lib/axios";
import { toast } from "sonner";

export type DbCategory = {
  id: string;
  category_name: string;
  category_description?: string | null;
  parent_id?: string | null;
  active?: boolean | null;
  image?: string | null;
};

type CategoryView = "main" | "sub";

const bytes = (value: number) => {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
};

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const response = (error as { response?: { data?: { message?: unknown } } })
    ?.response;
  const message = response?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
};

function CategoryForm({
  category,
  categories,
  onSubmit,
  onCancel,
  loading,
}: {
  category?: DbCategory;
  categories: DbCategory[];
  onSubmit: (data: Partial<DbCategory>) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [name, setName] = useState(category?.category_name ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [desc, setDesc] = useState(category?.category_description ?? "");
  const [parentId, setParentId] = useState<string | null>(
    category?.parent_id ?? null,
  );
  const [imagePreview, setImagePreview] = useState<string>(
    category?.image ?? "",
  );
  const [active, setActive] = useState(category?.active ?? true);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionMessage, setCompressionMessage] = useState("");

  useEffect(() => {
    if (parentId) {
      setImage("");
      setImagePreview("");
      setCompressionMessage("");
    }
  }, [parentId]);

  useEffect(() => {
    setCompressionMessage("");
    setIsCompressing(false);
  }, [category?.id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setCompressionMessage("Compressing image...");

    try {
      const compressed = await compressImageFile(file, {
        maxDimension: 1600,
        maxSizeMB: 0.8,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImage(result);
      };
      reader.readAsDataURL(compressed);

      const saved = Math.max(0, file.size - compressed.size);
      setCompressionMessage(
        saved > 0
          ? `Image compressed: ${bytes(file.size)} -> ${bytes(compressed.size)} (saved ${bytes(saved)}).`
          : "Image is already optimized.",
      );
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImage(result);
      };
      reader.readAsDataURL(file);
      setCompressionMessage(
        "Could not compress image. Original file was kept.",
      );
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompressing) return;
    onSubmit({
      category_name: name.trim(),
      category_description: desc.trim() || null,
      parent_id: parentId || null,
      active,
      image: parentId ? null : image.trim() || null,
    });
  };

  const filteredParents = useMemo(() => {
    if (!query) return [];
    return categories.filter(
      (c) =>
        !c.parent_id &&
        c.id !== category?.id &&
        c.category_name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, categories, category?.id]);

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-neutral-700">
          <Folder className="h-4 w-4" />
          Nom de catégorie
          <span className="text-red-500">*</span>
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Entrez le nom de la catégorie"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          rows={3}
          placeholder="Ajouter une description pour cette catégorie"
        />
      </div>

      <div>
        <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-neutral-700">
          <FolderTree className="h-4 w-4" />
          Catégorie parente
        </label>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            placeholder="Rechercher la catégorie parent..."
            className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          {parentId && (
            <button
              type="button"
              onClick={() => {
                setParentId(null);
                setQuery("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <AnimatePresence>
            {showResults && filteredParents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 mt-2 max-h-48 w-full overflow-auto rounded-xl border border-neutral-200 bg-white shadow-lg"
              >
                {filteredParents.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setParentId(c.id);
                      setQuery(c.category_name);
                      setShowResults(false);
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm transition hover:bg-neutral-50"
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-neutral-400" />
                      {c.category_name}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {parentId && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary">
              Parent:{" "}
              <span className="font-medium">
                {categories.find((c) => c.id === parentId)?.category_name}
              </span>
            </span>
          </div>
        )}
      </div>

      {!parentId && (
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-neutral-700">
            <ImageIcon className="h-4 w-4" />
            Image de catégorie
            <span className="text-xs font-normal text-neutral-500">
              (optionnel, recommandé pour les catégories principales)
            </span>
          </label>

          <label
            className={cn(
              "flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-sm transition",
              image
                ? "border-primary bg-primary/5"
                : "border-neutral-300 hover:bg-neutral-50",
            )}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isCompressing}
              className="hidden"
            />

            {image ? (
              <>
                <Check className="h-5 w-5 text-primary" />
                <span className="font-medium text-primary">
                  Image sélectionnée
                </span>
              </>
            ) : (
              <>
                <ImageIcon className="h-5 w-5 text-neutral-400" />
                <span className="text-neutral-600">
                  Cliquez pour télécharger l’image
                </span>
              </>
            )}
          </label>
          {compressionMessage && (
            <p className="mt-2 text-xs text-neutral-600">
              {compressionMessage}
            </p>
          )}

          {(imagePreview || image) && (
            <div className="relative mt-3 w-fit">
              <img
                src={resolveMediaUrl(imagePreview)}
                alt="Category preview"
                className="h-24 w-24 rounded-xl border object-cover"
                onError={(event) => handleImageError(event)}
              />

              <button
                type="button"
                onClick={() => {
                  setImagePreview("");
                  setImage("");
                }}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-md transition hover:bg-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              active ? "bg-emerald-100" : "bg-neutral-200",
            )}
          >
            {active ? (
              <Check className="h-5 w-5 text-emerald-600" />
            ) : (
              <X className="h-5 w-5 text-neutral-500" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">
              Statut de catégorie
            </p>
            <p className="text-xs text-neutral-500">
              {active ? "Visibles pour les clients" : "Caché du magasin"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            active ? "bg-primary" : "bg-neutral-300",
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
              active ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
      </div>

      <div className="flex gap-3 border-t border-neutral-200 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={loading || isCompressing}
        >
          {(loading || isCompressing) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {category ? "Mettre à jour la catégorie" : "Créer une catégorie"}
        </Button>
      </div>
    </form>
  );
}

function StatCard({
  label,
  value,
  icon,
  alert,
  isWarning,
  subtext,
}: {
  variants?: Variants;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  alert?: string;
  isWarning?: boolean;
  subtext?: string;
}) {
  return (
    <motion.div
      className="group relative rounded-2xl bg-white p-6 shadow-sm"
      initial={{
        y: 0,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
      }}
      animate={{
        y: 0,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
      }}
      whileHover={{
        y: -4,
        scale: 1.04,
        rotateX: 1,
        rotateY: -1,
        boxShadow: "0px 30px 60px -15px rgba(0,0,0,0.18)",
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 18,
      }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-500">{label}</span>

          <motion.div
            className="text-neutral-400 transition-colors group-hover:text-primary"
            initial={{ scale: 1, rotate: 0 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.3, rotate: 8 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 18,
            }}
          >
            {icon}
          </motion.div>
        </div>

        <motion.div
          className="mt-3 text-3xl font-semibold text-neutral-900"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {value}
        </motion.div>

        {subtext && (
          <div className="mt-1 text-xs text-neutral-500">{subtext}</div>
        )}

        {alert && (
          <div
            className={cn(
              "mt-2 text-sm font-medium",
              isWarning ? "text-orange-600" : "text-emerald-600",
            )}
          >
            {alert}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function AdminCategory() {
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<DbCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<CategoryView>("main");
  const [confirmDelete, setConfirmDelete] = useState<DbCategory | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const {
    data: categoriesResponse,
    isLoading: loading,
    isError: categoriesFailed,
    error: categoriesError,
    refetch,
  } = useGet<{ data?: DbCategory[] }>({
    path: "categories/admin",
    options: {
      staleTime: 1000 * 30,
    },
  });
  const items = useMemo(
    () => categoriesResponse?.data ?? [],
    [categoriesResponse?.data],
  );

  useEffect(() => {
    if (!categoriesFailed) return;

    toast.error(categoriesError?.message || "Failed to load categories");
  }, [categoriesFailed, categoriesError]);

  const hasChildren = (id: string) => items.some((c) => c.parent_id === id);
  const getSubCount = (id: string) =>
    items.filter((c) => c.parent_id === id).length;

  const getParentName = (parentId?: string | null) => {
    if (!parentId) return null;
    return items.find((c) => c.id === parentId)?.category_name;
  };

  const filtered = useMemo(() => {
    let list = items;

    if (view === "main") {
      list = list.filter((c) => !c.parent_id);
    } else {
      list = list.filter((c) => !!c.parent_id);
    }

    if (query) {
      list = list.filter((c) => {
        const matchesName = c.category_name
          .toLowerCase()
          .includes(query.toLowerCase());
        const parentName = c.parent_id
          ? items.find((item) => item.id === c.parent_id)?.category_name || ""
          : "";
        const matchesParent = parentName
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesName || matchesParent;
      });
    }

    return list;
  }, [items, query, view]);

  const submit = async (payload: Partial<DbCategory>) => {
    setSaving(true);

    try {
      await toast.promise(
        editing
          ? api.patch(`/categories/${editing.id}`, payload)
          : api.post("/categories", payload),
        {
          loading: editing
            ? "Mise à jour de la catégorie..."
            : "Création de Catégorie...",
          success: editing
            ? "Catégorie mise à jour avec succès"
            : "Catégorie créée avec succès",
          error: (error) => getApiErrorMessage(error, "Opération échouait"),
        },
      );

      await refetch();
      setShowForm(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    await toast.promise(api.delete(`/categories/${id}`), {
      loading: "Supprimer la catégorie...",
      success: "Catégorie supprimée avec succès",
      error: (error) => getApiErrorMessage(error, "Échec de la suppression"),
    });

    await refetch();
  };

  const toggleActive = async (c: DbCategory) => {
    setTogglingId(c.id);

    try {
      await toast.promise(
        api.patch(`/categories/${c.id}`, { active: !c.active }),
        {
          loading: c.active ? "Désactivation..." : "Activation...",
          success: c.active ? "Catégorie désactivée" : "Catégorie activée",
          error: (error) => getApiErrorMessage(error, "Échec de mise à jour"),
        },
      );

      await refetch();
    } finally {
      setTogglingId(null);
    }
  };
  const mainCategories = items.filter((c) => !c.parent_id);
  const subCategories = items.filter((c) => !!c.parent_id);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                Categories
              </h1>
              <p className="text-sm text-neutral-600">
                Organize your products with categories & sub-categories.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={loading}
              >
                <RefreshCcw
                  className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
                />
                Actualiser
              </Button>
              <Button
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter une catégorie
              </Button>
            </div>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Main Categories"
              value={mainCategories.length}
              icon={<Folder className="h-5 w-5" />}
            />

            <StatCard
              label="Sub Categories"
              value={subCategories.length}
              icon={<FolderTree className="h-5 w-5" />}
            />

            <StatCard
              label="Active"
              value={items.filter((c) => c.active).length}
              icon={<Check className="h-5 w-5" />}
              subtext={`${items.filter((c) => !c.active).length} inactive`}
            />

            <StatCard
              label="Inactive"
              value={items.filter((c) => !c.active).length}
              icon={<X className="h-5 w-5" />}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher des catégories..."
              className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex w-full overflow-x-auto rounded-xl border-2 border-primary bg-white shadow-sm sm:w-auto">
            <button
              onClick={() => setView("main")}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition",
                view === "main"
                  ? "bg-primary text-white"
                  : "text-primary hover:bg-primary/5",
              )}
            >
              <Folder className="h-4 w-4" />
              Main ({mainCategories.length})
            </button>

            <div className="w-px bg-primary/20" />

            <button
              onClick={() => setView("sub")}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition",
                view === "sub"
                  ? "bg-primary text-white"
                  : "text-primary hover:bg-primary/5",
              )}
            >
              <FolderTree className="h-4 w-4" />
              Sub ({subCategories.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-white p-20 shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm text-neutral-600">
              Chargement des catégories...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-neutral-200 bg-white p-16 text-center shadow-sm"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <Folder className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">
              Aucune catégorie trouvée
            </h3>
            <p className="mb-6 text-neutral-600">
              {query
                ? "Try adjusting your search"
                : "Get started by creating a new category"}
            </p>
            {!query && (
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter une catégorie
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="overflow-x-auto overflow-y-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <table className="min-w-[820px] w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Categories
                  </th>
                  {view === "main" && (
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Sub categories
                    </th>
                  )}
                  {view === "sub" && (
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Parent
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="divide-y divide-neutral-100"
              >
                {filtered.map((c) => (
                  <motion.tr
                    key={c.id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="show"
                    style={{ display: "table-row" }}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                    className="transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        {c.image ? (
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                            <img
                              src={resolveMediaUrl(c.image)}
                              alt={c.category_name}
                              className="h-full w-full object-cover"
                              onError={(event) => handleImageError(event)}
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                            {c.parent_id ? (
                              <FolderTree className="h-5 w-5 text-neutral-400" />
                            ) : (
                              <Folder className="h-5 w-5 text-neutral-400" />
                            )}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-neutral-900">
                            {c.category_name}
                          </p>
                          {c.category_description && (
                            <p className="mt-0.5 truncate text-xs text-neutral-500">
                              {c.category_description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {view === "main" && (
                      <td className="px-6 py-4 text-center">
                        {view === "main" ? (
                          <span className="inline-flex min-w-[28px] justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            {getSubCount(c.id)}
                          </span>
                        ) : (
                          <span className="text-sm text-neutral-400">-</span>
                        )}
                      </td>
                    )}

                    {view === "sub" && (
                      <td className="px-6 py-4">
                        {getParentName(c.parent_id) ? (
                          <div className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-neutral-400" />
                            <span className="text-sm text-neutral-600">
                              {getParentName(c.parent_id)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">-</span>
                        )}
                      </td>
                    )}

                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                          c.active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700",
                        )}
                      >
                        {c.active ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        {c.active ? "Actif" : "Inactif"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition"
                          onClick={() => {
                            setEditing(c);
                            setShowForm(true);
                          }}
                          title="éditer"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn(
                            "h-8 w-8 rounded-lg transition",
                            c.active
                              ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700",
                          )}
                          onClick={() => toggleActive(c)}
                          disabled={togglingId === c.id}
                          title={c.active ? "Deactivate" : "Activate"}
                        >
                          {togglingId === c.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : c.active ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn(
                            "h-8 w-8 rounded-lg transition",
                            hasChildren(c.id)
                              ? "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                              : "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700",
                          )}
                          disabled={hasChildren(c.id)}
                          onClick={() => {
                            if (!hasChildren(c.id)) {
                              setConfirmDelete(c);
                            }
                          }}
                          title={
                            hasChildren(c.id)
                              ? "Supprimez d’abord les sous-catégories"
                              : "Supprimer"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-start justify-center p-4 pt-16">
                <motion.div
                  className="w-full max-w-lg"
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  transition={{ type: "spring", duration: 0.4 }}
                >
                  <div className="rounded-2xl bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                      <div>
                        <h2 className="text-xl font-semibold text-neutral-900">
                          {editing
                            ? "Modifier la catégorie"
                            : "Ajouter une nouvelle catégorie"}
                        </h2>
                        <p className="mt-0.5 text-sm text-neutral-500">
                          {editing
                            ? `Mise à jour "${editing.category_name}"`
                            : "Créer une nouvelle catégorie de produit"}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setShowForm(false);
                          setEditing(null);
                        }}
                        className="rounded-lg p-2 transition hover:bg-neutral-100"
                      >
                        <X className="h-5 w-5" />
                      </motion.button>
                    </div>

                    <div className="px-6 py-6">
                      <CategoryForm
                        category={editing ?? undefined}
                        categories={items}
                        onSubmit={submit}
                        onCancel={() => {
                          setShowForm(false);
                          setEditing(null);
                        }}
                        loading={saving}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
            />

            <motion.div
              className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-85"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-4 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Supprimer la catégorie
                  </h3>
                </div>

                <p className="mb-6 text-center text-sm text-neutral-600">
                  Êtes-vous sûr de vouloir supprimer{" "}
                  <span className="font-semibold text-neutral-900">
                    "{confirmDelete.category_name}"
                  </span>
                  ?
                  <br />
                  Une fois supprimé, cette catégorie{" "}
                  <strong>ne peuvent pas être restaurés</strong>.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>

                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={async () => {
                      await deleteCategory(confirmDelete.id);
                      setConfirmDelete(null);
                    }}
                  >
                    Supprimer
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
