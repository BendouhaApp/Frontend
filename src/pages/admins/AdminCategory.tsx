import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_URL;

async function api<T>(
  path: string,
  opts: RequestInit & { auth?: boolean } = { auth: true },
): Promise<T> {
  const token = localStorage.getItem("admin_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as any),
  };
  if (opts.auth !== false && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/${path}`, { ...opts, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

export type DbCategory = {
  id: string;
  category_name: string;
  category_description?: string | null;
  parent_id?: string | null;
  active?: boolean | null;
  image?: string | null;
};

type CategoryView = "main" | "sub";

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
  const [imagePreview, setImagePreview] = useState<string>(category?.image ?? "");
  const [active, setActive] = useState(category?.active ?? true);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  // If parent is selected, clear image
  useEffect(() => {
    if (parentId) {
      setImage("");
      setImagePreview("");
    }
  }, [parentId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImage(reader.result as string); // In production, upload to server and get URL
      };
      reader.readAsDataURL(file);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      category_name: name.trim(),
      category_description: desc.trim() || null,
      parent_id: parentId || null,
      active,
      image: parentId ? null : (image.trim() || null), // No image if it has a parent
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
    <form onSubmit={submit} className="space-y-5">
      {/* Category Name */}
      <div>
        <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
          Category name
          <span className="text-red-500">*</span>
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          placeholder="Enter category name"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
          rows={3}
          placeholder="Add a description for this category"
        />
      </div>

      {/* Parent Category Selection */}
      <div>
        <label className="text-sm font-medium text-neutral-700">
          Parent category
        </label>

        <div className="relative mt-1.5">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            placeholder="Search parent category..."
            className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />

          {parentId && (
            <button
              type="button"
              onClick={() => {
                setParentId(null);
                setQuery("");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-red-500 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {showResults && filteredParents.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg max-h-48 overflow-auto">
              {filteredParents.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setParentId(c.id);
                    setQuery(c.category_name);
                    setShowResults(false);
                  }}
                  className="block w-full px-3.5 py-2 text-left text-sm hover:bg-neutral-50 transition"
                >
                  {c.category_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {parentId && (
          <p className="mt-1.5 text-xs text-neutral-500">
            Selected parent:{" "}
            <span className="font-medium text-neutral-700">
              {categories.find((c) => c.id === parentId)?.category_name}
            </span>
          </p>
        )}
      </div>

      {/* Conditional Image Upload - Only for Main Categories */}
      {!parentId && (
        <div>
          <label className="text-sm font-medium text-neutral-700">
            Category Image (optional)
          </label>
          
          <div className="mt-1.5">
            {imagePreview ? (
              <div className="relative">
                <div className="h-32 w-full rounded-lg border-2 border-dashed border-neutral-300 overflow-hidden bg-neutral-50">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("");
                    setImage("");
                  }}
                  className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600 transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 transition hover:border-blue-400 hover:bg-blue-50/30">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-1.5 text-neutral-500">
                  <ImageIcon className="h-6 w-6 text-neutral-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-neutral-700">
                      Click to upload image
                    </p>
                    <p className="text-xs text-neutral-500">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                </div>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Status Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-neutral-300 p-3.5">
        <div>
          <p className="text-sm font-medium text-neutral-700">Status</p>
          <p className="text-xs text-neutral-500">
            Enable or disable this category
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            active ? "bg-blue-600" : "bg-neutral-300"
          }`}
        >
          <span
            className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white transition shadow-sm ${
              active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-10"
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1 h-10 bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {category ? "Update category" : "Create category"}
        </Button>
      </div>
    </form>
  );
}

export function AdminCategory() {
  const [items, setItems] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<DbCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<CategoryView>("main");
  const [confirmDelete, setConfirmDelete] = useState<DbCategory | null>(null);

  const hasChildren = (id: string) => items.some((c) => c.parent_id === id);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api<any>("categories/admin");
      setItems(res.data ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getParentName = (parentId?: string | null) => {
    if (!parentId) return "No parent category";
    return items.find((c) => c.id === parentId)?.category_name ?? "Unknown";
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
        const matchesName = c.category_name.toLowerCase().includes(query.toLowerCase());
        const parentName = c.parent_id 
          ? items.find((item) => item.id === c.parent_id)?.category_name || ""
          : "";
        const matchesParent = parentName.toLowerCase().includes(query.toLowerCase());
        return matchesName || matchesParent;
      });
    }

    return list;
  }, [items, query, view]);

  const submit = async (payload: Partial<DbCategory>) => {
    setSaving(true);
    try {
      if (editing) {
        await api(`categories/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api("categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      await load();
      setShowForm(false);
      setEditing(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    await api(`categories/${id}`, { method: "DELETE" });
    await load();
  };

  const activate = async (id: string) => {
    await api(`categories/${id}/activate`, { method: "PATCH" });
    await load();
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Categories</h1>
          <p className="mt-1 text-sm text-neutral-600">Manage product categories</p>
        </div>
        <Button
          onClick={() => {
            setError("");
            setEditing(null);
            setShowForm(true);
          }}
          className="gap-2 h-10 px-4 bg-blue-600 hover:bg-blue-700 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add category
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search category..."
            className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-3.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>

        {view === "sub" && (
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <select
              onChange={(e) => {
                const parentName = e.target.value;
                if (parentName) {
                  setQuery(parentName);
                } else {
                  setQuery("");
                }
              }}
              className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-3.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition appearance-none bg-white"
            >
              <option value="">All parent categories</option>
              {items
                .filter((c) => !c.parent_id)
                .map((parent) => (
                  <option key={parent.id} value={parent.category_name}>
                    {parent.category_name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="flex overflow-hidden rounded-lg border-2 border-blue-600 bg-white shadow-sm">
          <button
            onClick={() => setView("main")}
            className={`px-5 py-2 text-sm font-semibold transition ${
              view === "main"
                ? "bg-blue-600 text-white"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            Main category
          </button>

          <div className="w-px bg-blue-600/20" />

          <button
            onClick={() => setView("sub")}
            className={`px-5 py-2 text-sm font-semibold transition ${
              view === "sub"
                ? "bg-blue-600 text-white"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            Sub category
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3.5 text-sm text-red-700 flex items-start gap-2"
        >
          <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading categories...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-white border border-neutral-200 p-16 text-center shadow-sm">
          <div className="mx-auto w-fit rounded-full bg-neutral-100 p-4 mb-3">
            <Folder className="h-8 w-8 text-neutral-400" />
          </div>
          <p className="font-semibold text-neutral-900 mb-1">No categories found</p>
          <p className="text-sm text-neutral-500">
            {query ? "Try adjusting your search" : "Get started by creating a new category"}
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-white border border-neutral-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Parent
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filtered.map((c, idx) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-neutral-50 transition"
                >
                  {/* Category with Image */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3.5">
                      {c.image ? (
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                          <img
                            src={c.image}
                            alt={c.category_name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                          <ImageIcon className="h-5 w-5 text-neutral-400" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-neutral-900 truncate text-sm">
                          {c.category_name}
                        </p>
                        {c.category_description && (
                          <p className="text-xs text-neutral-500 truncate mt-0.5">
                            {c.category_description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Parent Category */}
                  <td className="px-6 py-3.5">
                    <span className="text-sm text-neutral-600">
                      {getParentName(c.parent_id)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                      }`}
                    >
                      {c.active ? "Active" : "Disabled"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                        onClick={() => {
                          setEditing(c);
                          setShowForm(true);
                        }}
                        title="Edit category"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      {c.active ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-8 w-8 ${
                            hasChildren(c.id)
                              ? "text-neutral-300 cursor-not-allowed"
                              : "text-red-600 hover:text-red-700 hover:bg-red-50"
                          }`}
                          disabled={hasChildren(c.id)}
                          title={
                            hasChildren(c.id)
                              ? "Remove sub-categories first"
                              : "Delete category"
                          }
                          onClick={() => {
                            if (!hasChildren(c.id)) {
                              setConfirmDelete(c);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => activate(c.id)}
                          title="Activate category"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
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
            <motion.div
              className="fixed inset-0 z-50 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                  className="w-full max-w-lg"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.3 }}
                >
                  <div className="rounded-xl bg-white shadow-2xl">
                    <div className="border-b border-neutral-200 px-5 py-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-neutral-900">
                          {editing ? "Edit category" : "Add new category"}
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {editing ? "Editing" : "Creating"}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setShowForm(false);
                          setEditing(null);
                        }}
                        className="h-8 w-8 hover:bg-neutral-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="px-5 py-5">
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl p-6">
                <div className="mb-4">
                  <div className="mx-auto w-fit rounded-full bg-red-100 p-3 mb-3">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 text-center">
                    Delete category
                  </h3>
                </div>

                <p className="text-sm text-neutral-600 text-center mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-neutral-900">
                    "{confirmDelete.category_name}"
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 h-10"
                  >
                    Cancel
                  </Button>

                  <Button
                    className="flex-1 h-10 bg-red-600 hover:bg-red-700"
                    onClick={async () => {
                      await deleteCategory(confirmDelete.id);
                      setConfirmDelete(null);
                    }}
                  >
                    Delete
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