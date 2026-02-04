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
  const [desc, setDesc] = useState(category?.category_description ?? "");
  const [parentId, setParentId] = useState<string | null>(
    category?.parent_id ?? null,
  );

  const [active, setActive] = useState(category?.active ?? true);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      category_name: name.trim(),
      category_description: desc.trim() || null,
      parent_id: parentId || null,
      active,
    });
  };

  const filteredParents = useMemo(() => {
    if (!query) return [];
    return categories.filter(
      (c) =>
        c.id !== category?.id &&
        c.category_name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, categories, category?.id]);

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className="text-sm font-medium">Category name *</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl border px-4 py-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="mt-1 w-full rounded-xl border px-4 py-2"
          rows={3}
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          {parentId ? "Change parent category" : "Parent category"}
        </label>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            placeholder={
              parentId ? "Change parent category..." : "Search category..."
            }
            className="w-full rounded-xl border py-2 pl-9 pr-9"
          />

          {parentId && (
            <button
              type="button"
              onClick={() => {
                setParentId(null);
                setQuery("");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {showResults && filteredParents.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border bg-white shadow-lg max-h-48 overflow-auto">
              {filteredParents.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setParentId(c.id);
                    setQuery(c.category_name);
                    setShowResults(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100"
                >
                  {c.category_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {parentId && (
          <p className="mt-1 text-xs text-neutral-500">
            Selected parent:{" "}
            <span className="font-medium">
              {categories.find((c) => c.id === parentId)?.category_name}
            </span>
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Active
      </label>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {category ? "Update" : "Create"}
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
    if (!query) return items;
    return items.filter((c) =>
      c.category_name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [items, query]);

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

  const disable = async (id: string) => {
    if (!confirm("Disable this category?")) return;
    await api(`categories/${id}`, { method: "DELETE" });
    await load();
  };

  const activate = async (id: string) => {
    await api(`categories/${id}/activate`, { method: "PATCH" });
    await load();
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Categories</h1>
          <p className="text-neutral-500">Manage product categories</p>
        </div>
        <Button
          onClick={() => {
            setError("");
            setShowForm(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add category
        </Button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search category..."
          className="w-full rounded-xl border py-2 pl-9 pr-3"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <Folder className="mx-auto mb-3 h-10 w-10 text-neutral-400" />
          <p className="font-medium">No categories</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white shadow">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between border-b px-4 py-3"
            >
              <div>
                <p className="font-medium">{c.category_name}</p>

                <p className="text-xs text-neutral-500">
                  Parent:{" "}
                  <span className="font-medium">
                    {getParentName(c.parent_id)}
                  </span>
                </p>

                {c.category_description && (
                  <p className="text-xs text-neutral-400">
                    {c.category_description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    c.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {c.active ? "Active" : "Disabled"}
                </span>

                {c.active ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => disable(c.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-emerald-600"
                    onClick={() => activate(c.id)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditing(c);
                    setShowForm(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setShowForm(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed inset-4 z-50 mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editing ? "Edit category" : "New category"}
                </h2>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <CategoryForm
                category={editing ?? undefined}
                categories={items}
                onSubmit={submit}
                onCancel={() => setShowForm(false)}
                loading={saving}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
