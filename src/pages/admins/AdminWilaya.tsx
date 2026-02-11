import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Loader2,
  MapPin,
  Home,
  Building2,
  DollarSign,
  Truck,
  Check,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL;

async function api<T>(
  path: string,
  opts: RequestInit & { auth?: boolean } = { auth: true },
): Promise<T> {
  const token = localStorage.getItem("admin_token");
  const normalizeHeaders = (headers?: HeadersInit): Record<string, string> => {
    if (!headers) return {};
    if (headers instanceof Headers) {
      return Object.fromEntries(headers.entries());
    }
    if (Array.isArray(headers)) {
      return Object.fromEntries(headers);
    }
    return headers;
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...normalizeHeaders(opts.headers),
  };
  if (opts.auth !== false && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/${path}`, { ...opts, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

type ShippingZone = {
  id: number;
  name: string;
  display_name: string;
  active: boolean;
  free_shipping: boolean;
  rate_type: string | null;
  default_rate?: number | null;
  home_delivery_enabled?: boolean;
  home_delivery_price?: number;
  office_delivery_enabled?: boolean;
  office_delivery_price?: number;
  created_at: string;
  updated_at: string;
};

function WilayaForm({
  zone,
  onSubmit,
  onCancel,
  loading,
}: {
  zone?: ShippingZone;
  onSubmit: (data: Partial<ShippingZone>) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [name, setName] = useState(zone?.name ?? "");
  const [displayName, setDisplayName] = useState(zone?.display_name ?? "");
  const [active, setActive] = useState(zone?.active ?? true);
  const [freeShipping, setFreeShipping] = useState(zone?.free_shipping ?? false);
  const [defaultRate, setDefaultRate] = useState(
    zone?.default_rate?.toString() ?? "700",
  );
  
  const [homeEnabled, setHomeEnabled] = useState(zone?.home_delivery_enabled ?? true);
  const [homePrice, setHomePrice] = useState<string>(
    zone?.home_delivery_price?.toString() ?? "0"
  );
  
  const [officeEnabled, setOfficeEnabled] = useState(zone?.office_delivery_enabled ?? true);
  const [officePrice, setOfficePrice] = useState<string>(
    zone?.office_delivery_price?.toString() ?? "0"
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      display_name: displayName.trim(),
      active,
      free_shipping: freeShipping,
      default_rate: Number(defaultRate),
      home_delivery_enabled: homeEnabled,
      home_delivery_price: homeEnabled ? Number(homePrice) : 0,
      office_delivery_enabled: officeEnabled,
      office_delivery_price: officeEnabled ? Number(officePrice) : 0,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Wilaya Name */}
      <div>
        <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          Wilaya Name
          <span className="text-red-500">*</span>
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          placeholder="e.g., alger, oran"
        />
        <p className="mt-1 text-xs text-neutral-500">Internal name (lowercase, no spaces)</p>
      </div>

      {/* Display Name */}
      <div>
        <label className="text-sm font-medium text-neutral-700">
          Display Name
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          placeholder="e.g., Alger, Oran"
        />
        <p className="mt-1 text-xs text-neutral-500">Name shown to customers</p>
      </div>

      {/* Home Delivery Section */}
      <div className="rounded-lg border border-neutral-200 p-4 bg-neutral-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-neutral-900">Home Delivery</h3>
          </div>
          <button
            type="button"
            onClick={() => setHomeEnabled(!homeEnabled)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition",
              homeEnabled ? "bg-blue-600" : "bg-neutral-300"
            )}
          >
            <span
              className={cn(
                "inline-block h-4.5 w-4.5 transform rounded-full bg-white transition shadow-sm",
                homeEnabled ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>

        {homeEnabled && (
          <div>
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              Delivery Price (DZA)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={homePrice}
              onChange={(e) => setHomePrice(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              placeholder="0.00"
              disabled={!homeEnabled}
            />
          </div>
        )}
      </div>

      {/* Default Shipping Rate */}
      <div className="rounded-lg border border-neutral-200 p-4 bg-neutral-50">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-5 w-5 text-amber-600" />
          <h3 className="font-semibold text-neutral-900">
            Default Shipping Rate
          </h3>
        </div>
        <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
          Default Rate (DZA)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={defaultRate}
          onChange={(e) => setDefaultRate(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
          placeholder="700"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Used when no specific delivery price is set.
        </p>
      </div>

      {/* Office Delivery Section */}
      <div className="rounded-lg border border-neutral-200 p-4 bg-neutral-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold text-neutral-900">Office Delivery</h3>
          </div>
          <button
            type="button"
            onClick={() => setOfficeEnabled(!officeEnabled)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition",
              officeEnabled ? "bg-emerald-600" : "bg-neutral-300"
            )}
          >
            <span
              className={cn(
                "inline-block h-4.5 w-4.5 transform rounded-full bg-white transition shadow-sm",
                officeEnabled ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>

        {officeEnabled && (
          <div>
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              Delivery Price (DZA)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={officePrice}
              onChange={(e) => setOfficePrice(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              placeholder="0.00"
              disabled={!officeEnabled}
            />
          </div>
        )}
      </div>

      {/* Free Shipping Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-neutral-300 p-3.5">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-neutral-500" />
          <div>
            <p className="text-sm font-medium text-neutral-700">Free Shipping</p>
            <p className="text-xs text-neutral-500">Override all delivery prices</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFreeShipping(!freeShipping)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition",
            freeShipping ? "bg-blue-600" : "bg-neutral-300"
          )}
        >
          <span
            className={cn(
              "inline-block h-4.5 w-4.5 transform rounded-full bg-white transition shadow-sm",
              freeShipping ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>

      {/* Active Status Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-neutral-300 p-3.5">
        <div>
          <p className="text-sm font-medium text-neutral-700">Active Status</p>
          <p className="text-xs text-neutral-500">Enable or disable this wilaya</p>
        </div>
        <button
          type="button"
          onClick={() => setActive(!active)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition",
            active ? "bg-blue-600" : "bg-neutral-300"
          )}
        >
          <span
            className={cn(
              "inline-block h-4.5 w-4.5 transform rounded-full bg-white transition shadow-sm",
              active ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-3 border-t border-neutral-200">
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
          {zone ? "Update Wilaya" : "Create Wilaya"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminWilaya() {
  const [items, setItems] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ShippingZone | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ShippingZone | null>(null);
  const [filterType, setFilterType] = useState<"all" | "active" | "inactive">("all");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{ data: ShippingZone[] }>("admin/shipping-zones");
      setItems(res.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load wilayas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = items;

    // Filter by active status
    if (filterType === "active") {
      list = list.filter((w) => w.active);
    } else if (filterType === "inactive") {
      list = list.filter((w) => !w.active);
    }

    // Filter by search query
    if (query) {
      list = list.filter((w) =>
        w.display_name.toLowerCase().includes(query.toLowerCase()) ||
        w.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    return list;
  }, [items, query, filterType]);

  const submit = async (payload: Partial<ShippingZone>) => {
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api(`admin/shipping-zones/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api("admin/shipping-zones", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      await load();
      setShowForm(false);
      setEditing(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save wilaya");
    } finally {
      setSaving(false);
    }
  };

  const deleteWilaya = async (id: number) => {
    setError("");
    try {
      await api(`admin/shipping-zones/${id}`, { method: "DELETE" });
      await load();
      setConfirmDelete(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete wilaya");
    }
  };

  const toggleActive = async (zone: ShippingZone) => {
    setError("");
    try {
      await api(`admin/shipping-zones/${zone.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !zone.active }),
      });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    }
  };

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((w) => w.active).length;
    const homeEnabled = items.filter((w) => w.home_delivery_enabled).length;
    const officeEnabled = items.filter((w) => w.office_delivery_enabled).length;
    return { total, active, homeEnabled, officeEnabled };
  }, [items]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                Shipping Zones (Wilayas)
              </h1>
              <p className="mt-1 text-neutral-600">
                Manage delivery zones and shipping prices
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={load}
                className="gap-2"
                disabled={loading}
              >
                <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
                Refresh
              </Button>
              <Button
                onClick={() => {
                  setError("");
                  setEditing(null);
                  setShowForm(true);
                }}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Wilaya
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-medium">Total Wilayas</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-blue-900">{stats.total}</div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <Check className="h-5 w-5" />
                <span className="text-sm font-medium">Active</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-900">{stats.active}</div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4">
              <div className="flex items-center gap-2 text-purple-700">
                <Home className="h-5 w-5" />
                <span className="text-sm font-medium">Home Delivery</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-purple-900">{stats.homeEnabled}</div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4">
              <div className="flex items-center gap-2 text-orange-700">
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-medium">Office Delivery</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-orange-900">{stats.officeEnabled}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Search and Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search wilayas..."
              className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-3.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex overflow-hidden rounded-lg border-2 border-blue-600 bg-white shadow-sm">
            <button
              onClick={() => setFilterType("all")}
              className={cn(
                "px-4 py-2 text-sm font-semibold transition",
                filterType === "all"
                  ? "bg-blue-600 text-white"
                  : "text-blue-600 hover:bg-blue-50"
              )}
            >
              All
            </button>
            <div className="w-px bg-blue-600/20" />
            <button
              onClick={() => setFilterType("active")}
              className={cn(
                "px-4 py-2 text-sm font-semibold transition",
                filterType === "active"
                  ? "bg-blue-600 text-white"
                  : "text-blue-600 hover:bg-blue-50"
              )}
            >
              Active
            </button>
            <div className="w-px bg-blue-600/20" />
            <button
              onClick={() => setFilterType("inactive")}
              className={cn(
                "px-4 py-2 text-sm font-semibold transition",
                filterType === "inactive"
                  ? "bg-blue-600 text-white"
                  : "text-blue-600 hover:bg-blue-50"
              )}
            >
              Inactive
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
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="rounded-lg bg-white border border-neutral-200 p-16 text-center shadow-sm">
            <div className="mx-auto w-fit rounded-full bg-neutral-100 p-4 mb-3">
              <MapPin className="h-8 w-8 text-neutral-400" />
            </div>
            <p className="font-semibold text-neutral-900 mb-1">No wilayas found</p>
            <p className="text-sm text-neutral-500">
              {query ? "Try adjusting your search" : "Get started by creating a new wilaya"}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="overflow-hidden rounded-lg bg-white border border-neutral-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Wilaya
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Default Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Home Delivery
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Office Delivery
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filtered.map((zone, idx) => (
                    <motion.tr
                      key={zone.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-neutral-50 transition"
                    >
                      {/* Wilaya Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-blue-100">
                            <MapPin className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900 text-sm">
                              {zone.display_name}
                            </p>
                            <p className="text-xs text-neutral-500">{zone.name}</p>
                          </div>
                        </div>
                      </td>

                      {/* Home Delivery */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-amber-700">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm font-semibold">
                            {zone.default_rate ?? 0} DZA
                          </span>
                        </div>
                      </td>

                      {/* Home Delivery */}
                      <td className="px-4 py-3">
                        {zone.home_delivery_enabled ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-blue-600">
                              <Home className="h-4 w-4" />
                              <span className="text-sm font-semibold">
                                {zone.free_shipping ? "Free" : `${zone.home_delivery_price} DZA`}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">Disabled</span>
                        )}
                      </td>

                      {/* Office Delivery */}
                      <td className="px-4 py-3">
                        {zone.office_delivery_enabled ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-emerald-600">
                              <Building2 className="h-4 w-4" />
                              <span className="text-sm font-semibold">
                                {zone.free_shipping ? "Free" : `${zone.office_delivery_price} DZA`}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">Disabled</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={cn(
                              "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                              zone.active
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-neutral-100 text-neutral-600"
                            )}
                          >
                            {zone.active ? "Active" : "Inactive"}
                          </span>
                          {zone.free_shipping && (
                            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                              <Truck className="h-3 w-3" />
                              Free
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                            onClick={() => {
                              setEditing(zone);
                              setShowForm(true);
                            }}
                            title="Edit wilaya"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                              "h-8 w-8",
                              zone.active
                                ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            )}
                            onClick={() => toggleActive(zone)}
                            title={zone.active ? "Deactivate" : "Activate"}
                          >
                            {zone.active ? (
                              <X className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setConfirmDelete(zone)}
                            title="Delete wilaya"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

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
                          {editing ? "Edit Wilaya" : "Add New Wilaya"}
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {editing ? "Update shipping zone" : "Create shipping zone"}
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
                      <WilayaForm
                        zone={editing ?? undefined}
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
                    Delete Wilaya
                  </h3>
                </div>

                <p className="text-sm text-neutral-600 text-center mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-neutral-900">
                    "{confirmDelete.display_name}"
                  </span>
                  ? Once deleted, this wilaya <strong>cannot be restored</strong>.
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
                    onClick={() => deleteWilaya(confirmDelete.id)}
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
