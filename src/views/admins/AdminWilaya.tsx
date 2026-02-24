import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "@/lib/gsap-motion";
import {
  AlertCircle,
  Check,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ShippingCommune = {
  id: number;
  shipping_zone_id: number;
  name: string;
  display_name: string;
  active: boolean;
  free_shipping: boolean;
  home_delivery_enabled: boolean;
  home_delivery_price: number;
  office_delivery_enabled: boolean;
  office_delivery_price: number;
};

type ShippingZone = {
  id: number;
  name: string;
  display_name: string;
  active: boolean;
  free_shipping: boolean;
  default_rate?: number | null;
  home_delivery_enabled?: boolean;
  home_delivery_price?: number;
  office_delivery_enabled?: boolean;
  office_delivery_price?: number;
  shipping_communes?: ShippingCommune[];
};

const asDzd = (value?: number | null) => `${Number(value ?? 0).toFixed(2)} DZD`;

type ApiErrorShape = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) return fallback;
  const maybeApiError = error as ApiErrorShape;
  return (
    maybeApiError.response?.data?.message || maybeApiError.message || fallback
  );
};

function ZoneForm({
  zone,
  loading,
  onSubmit,
  onCancel,
}: {
  zone: ShippingZone | null;
  loading: boolean;
  onSubmit: (payload: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(zone?.name ?? "");
  const [displayName, setDisplayName] = useState(zone?.display_name ?? "");
  const [active, setActive] = useState(zone?.active ?? true);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      name: name.trim(),
      display_name: displayName.trim(),
      active,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom technique (alger)"
        className="w-full rounded-lg border px-3 py-2 text-sm"
        required
      />
      <input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Nom affiche (Alger)"
        className="w-full rounded-lg border px-3 py-2 text-sm"
        required
      />
      <label className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
        Actif{" "}
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
      </label>
      <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
        Le pricing de livraison est gere au niveau des communes.
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {zone ? "Mettre a jour" : "Creer"}
        </Button>
      </div>
    </form>
  );
}

function CommuneForm({
  commune,
  loading,
  onSubmit,
  onCancel,
}: {
  commune: ShippingCommune | null;
  loading: boolean;
  onSubmit: (payload: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(commune?.name ?? "");
  const [displayName, setDisplayName] = useState(commune?.display_name ?? "");
  const [active, setActive] = useState(commune?.active ?? true);
  const [freeShipping, setFreeShipping] = useState(
    commune?.free_shipping ?? false,
  );
  const [homeEnabled, setHomeEnabled] = useState(
    commune?.home_delivery_enabled ?? true,
  );
  const [homePrice, setHomePrice] = useState(
    commune?.home_delivery_price?.toString() ?? "0",
  );
  const [officeEnabled, setOfficeEnabled] = useState(
    commune?.office_delivery_enabled ?? true,
  );
  const [officePrice, setOfficePrice] = useState(
    commune?.office_delivery_price?.toString() ?? "0",
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      name: name.trim(),
      display_name: displayName.trim(),
      active,
      free_shipping: freeShipping,
      home_delivery_enabled: homeEnabled,
      home_delivery_price: homeEnabled ? Number(homePrice || 0) : 0,
      office_delivery_enabled: officeEnabled,
      office_delivery_price: officeEnabled ? Number(officePrice || 0) : 0,
    });
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-lg border bg-neutral-50 p-3"
    >
      <div className="grid grid-cols-2 gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom technique (bir-khadem)"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          required
        />
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Nom affiche (Bir Khadem)"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          min="0"
          step="0.01"
          value={homePrice}
          onChange={(e) => setHomePrice(e.target.value)}
          disabled={!homeEnabled}
          placeholder="Prix domicile"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={officePrice}
          onChange={(e) => setOfficePrice(e.target.value)}
          disabled={!officeEnabled}
          placeholder="Prix bureau"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-4 gap-2 text-sm">
        <label className="flex items-center justify-between rounded-lg border px-2 py-1.5">
          Actif{" "}
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between rounded-lg border px-2 py-1.5">
          Gratuite{" "}
          <input
            type="checkbox"
            checked={freeShipping}
            onChange={(e) => setFreeShipping(e.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between rounded-lg border px-2 py-1.5">
          Domicile{" "}
          <input
            type="checkbox"
            checked={homeEnabled}
            onChange={(e) => setHomeEnabled(e.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between rounded-lg border px-2 py-1.5">
          Bureau{" "}
          <input
            type="checkbox"
            checked={officeEnabled}
            onChange={(e) => setOfficeEnabled(e.target.checked)}
          />
        </label>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {commune ? "Mettre a jour" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminWilaya() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [deleteZone, setDeleteZone] = useState<ShippingZone | null>(null);
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
  const [communes, setCommunes] = useState<ShippingCommune[]>([]);
  const [communesLoading, setCommunesLoading] = useState(false);
  const [communesSaving, setCommunesSaving] = useState(false);
  const [showCommuneForm, setShowCommuneForm] = useState(false);
  const [editingCommune, setEditingCommune] = useState<ShippingCommune | null>(
    null,
  );
  const [communesError, setCommunesError] = useState("");

  const loadZones = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<{ data: ShippingZone[] }>(
        "admin/shipping-zones",
      );
      setZones(res.data.data ?? []);
    } catch (error: unknown) {
      const msg = getErrorMessage(error, "Impossible de charger les wilayas");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadCommunes = async (zoneId: number) => {
    setCommunesLoading(true);
    setCommunesError("");
    try {
      const res = await api.get<{ data: ShippingCommune[] }>(
        `admin/shipping-zones/${zoneId}/communes`,
      );
      setCommunes(res.data.data ?? []);
    } catch (error: unknown) {
      const msg = getErrorMessage(error, "Impossible de charger les communes");
      setCommunesError(msg);
      toast.error(msg);
      setCommunes([]);
    } finally {
      setCommunesLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const filtered = useMemo(() => {
    let list = zones;
    if (filter === "active") list = list.filter((z) => z.active);
    if (filter === "inactive") list = list.filter((z) => !z.active);
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (z) =>
        z.display_name.toLowerCase().includes(q) ||
        z.name.toLowerCase().includes(q),
    );
  }, [zones, filter, search]);

  const stats = useMemo(() => {
    const total = zones.length;
    const active = zones.filter((z) => z.active).length;
    const zonesWithCommunes = zones.filter(
      (z) => (z.shipping_communes?.length ?? 0) > 0,
    ).length;
    const communeCount = zones.reduce(
      (sum, z) => sum + (z.shipping_communes?.length ?? 0),
      0,
    );
    return { total, active, zonesWithCommunes, communeCount };
  }, [zones]);

  const saveZone = async (payload: Record<string, unknown>) => {
    setSaving(true);
    setError("");

    try {
      const request = editingZone
        ? api.patch(`admin/shipping-zones/${editingZone.id}`, payload)
        : api.post("admin/shipping-zones", payload);

      await toast.promise(request, {
        loading: editingZone ? "Mise à jour..." : "Création...",
        success: editingZone ? "Wilaya mise à jour" : "Wilaya créée",
        error: "Erreur serveur",
      });

      setShowZoneModal(false);
      setEditingZone(null);
      await loadZones();
    } finally {
      setSaving(false);
    }
  };

  const saveCommune = async (payload: Record<string, unknown>) => {
    if (!selectedZone) return;
    setCommunesSaving(true);
    setCommunesError("");

    try {
      const request = editingCommune
        ? api.patch(
            `admin/shipping-zones/${selectedZone.id}/communes/${editingCommune.id}`,
            payload,
          )
        : api.post(`admin/shipping-zones/${selectedZone.id}/communes`, payload);

      await toast.promise(request, {
        loading: editingCommune ? "Mise à jour..." : "Ajout...",
        success: editingCommune
          ? "Commune mise à jour"
          : "Commune ajoutée",
        error: "Erreur serveur",
      });

      setShowCommuneForm(false);
      setEditingCommune(null);

      await Promise.all([loadCommunes(selectedZone.id), loadZones()]);
    } catch (error: unknown) {
      const msg = getErrorMessage(error, "Impossible d'enregistrer la commune");
      setCommunesError(msg);
      toast.error(msg);
    } finally {
      setCommunesSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Zones de livraison
            </h1>
            <p className="text-sm text-neutral-600">
              Gestion des wilayas et communes
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadZones} disabled={loading}>
              <RefreshCcw
                className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
              />
              Actualiser
            </Button>
            <Button
              onClick={() => {
                setEditingZone(null);
                setShowZoneModal(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-blue-100 px-4 py-3">
            <p className="text-xs text-blue-700">Wilayas</p>
            <p className="text-xl font-semibold">{stats.total}</p>
          </div>
          <div className="rounded-lg bg-emerald-100 px-4 py-3">
            <p className="text-xs text-emerald-700">Actives</p>
            <p className="text-xl font-semibold">{stats.active}</p>
          </div>
          <div className="rounded-lg bg-purple-100 px-4 py-3">
            <p className="text-xs text-purple-700">Wilayas avec communes</p>
            <p className="text-xl font-semibold">{stats.zonesWithCommunes}</p>
          </div>
          <div className="rounded-lg bg-orange-100 px-4 py-3">
            <p className="text-xs text-orange-700">Communes</p>
            <p className="text-xl font-semibold">{stats.communeCount}</p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une wilaya..."
              className="w-full rounded-lg border px-9 py-2 text-sm"
            />
          </div>
          <div className="flex rounded-lg border bg-white p-1 text-sm">
            <button
              className={cn(
                "rounded px-3 py-1.5",
                filter === "all" && "bg-blue-600 text-white",
              )}
              onClick={() => setFilter("all")}
            >
              Toutes
            </button>
            <button
              className={cn(
                "rounded px-3 py-1.5",
                filter === "active" && "bg-blue-600 text-white",
              )}
              onClick={() => setFilter("active")}
            >
              Actives
            </button>
            <button
              className={cn(
                "rounded px-3 py-1.5",
                filter === "inactive" && "bg-blue-600 text-white",
              )}
              onClick={() => setFilter("inactive")}
            >
              Inactives
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 rounded-lg bg-white p-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full">
                <thead className="bg-neutral-50">
                  <tr className="text-left text-xs uppercase text-neutral-600">
                    <th className="px-4 py-3">Wilaya</th>
                    <th className="px-4 py-3">Communes</th>
                    <th className="px-4 py-3">Pricing</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((zone) => (
                    <tr key={zone.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{zone.display_name}</p>
                        <p className="text-xs text-neutral-500">{zone.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            setSelectedZone(zone);
                            setEditingCommune(null);
                            setShowCommuneForm(false);
                            await loadCommunes(zone.id);
                          }}
                        >
                          {zone.shipping_communes?.length ?? 0} communes
                        </Button>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        <span className="text-xs italic text-neutral-500">
                          Configuré par commune
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs",
                            zone.active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-neutral-100 text-neutral-600",
                          )}
                        >
                          {zone.active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingZone(zone);
                              setShowZoneModal(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              await toast.promise(
                                api.patch(`admin/shipping-zones/${zone.id}`, {
                                  active: !zone.active,
                                }),
                                {
                                  loading: "Mise à jour...",
                                  success: "Statut mis à jour ",
                                  error: "Erreur lors de la mise à jour",
                                },
                              );
                              await loadZones();
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                            onClick={() => setDeleteZone(zone)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showZoneModal && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex min-h-full items-start justify-center pt-20">
              <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold">
                    {editingZone ? "Modifier la wilaya" : "Nouvelle wilaya"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowZoneModal(false);
                      setEditingZone(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ZoneForm
                  key={editingZone?.id ?? "new-zone"}
                  zone={editingZone}
                  loading={saving}
                  onSubmit={saveZone}
                  onCancel={() => {
                    setShowZoneModal(false);
                    setEditingZone(null);
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteZone && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex min-h-full items-center justify-center">
              <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
                <p className="text-sm">
                  Supprimer <strong>{deleteZone.display_name}</strong> ?
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDeleteZone(null)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={async () => {
                      await toast.promise(
                        api.delete(`admin/shipping-zones/${deleteZone.id}`),
                        {
                          loading: "Suppression...",
                          success: "Wilaya supprimée",
                          error: "Échec de la suppression",
                        },
                      );
                      setDeleteZone(null);
                      await loadZones();
                    }}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedZone && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mx-auto my-6 w-full max-w-4xl rounded-xl bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    Communes - {selectedZone.display_name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Le client doit choisir une commune pour calculer la
                    livraison.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedZone(null);
                    setShowCommuneForm(false);
                    setEditingCommune(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {communesError && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                  {communesError}
                </div>
              )}

              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  {communes.length} commune(s)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadCommunes(selectedZone.id)}
                    disabled={communesLoading}
                  >
                    <RefreshCcw
                      className={cn(
                        "h-4 w-4",
                        communesLoading && "animate-spin",
                      )}
                    />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingCommune(null);
                      setShowCommuneForm(true);
                    }}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Ajouter
                  </Button>
                </div>
              </div>

              {showCommuneForm && (
                <CommuneForm
                  key={editingCommune?.id ?? "new-commune"}
                  commune={editingCommune}
                  loading={communesSaving}
                  onSubmit={saveCommune}
                  onCancel={() => {
                    setShowCommuneForm(false);
                    setEditingCommune(null);
                  }}
                />
              )}

              {communesLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="mt-3 max-h-[60vh] overflow-auto rounded-lg border">
                  <table className="min-w-[760px] w-full">
                    <thead className="bg-neutral-50">
                      <tr className="text-left text-xs uppercase text-neutral-600">
                        <th className="px-3 py-2">Commune</th>
                        <th className="px-3 py-2">Domicile</th>
                        <th className="px-3 py-2">Bureau</th>
                        <th className="px-3 py-2">Statut</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {communes.map((commune) => (
                        <tr key={commune.id}>
                          <td className="px-3 py-2">
                            <p className="font-medium">
                              {commune.display_name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {commune.name}
                            </p>
                          </td>
                          <td className="px-3 py-2">
                            {commune.home_delivery_enabled
                              ? commune.free_shipping
                                ? "Gratuite"
                                : asDzd(commune.home_delivery_price)
                              : "Desactivee"}
                          </td>
                          <td className="px-3 py-2">
                            {commune.office_delivery_enabled
                              ? commune.free_shipping
                                ? "Gratuite"
                                : asDzd(commune.office_delivery_price)
                              : "Desactivee"}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs",
                                commune.active
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-neutral-100 text-neutral-600",
                              )}
                            >
                              {commune.active ? "Actif" : "Inactif"}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingCommune(commune);
                                  setShowCommuneForm(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={async () => {
                                  await toast.promise(
                                    api.patch(
                                      `admin/shipping-zones/${selectedZone.id}/communes/${commune.id}`,
                                      { active: !commune.active },
                                    ),
                                    {
                                      loading: "Mise à jour...",
                                      success: "Statut mis à jour",
                                      error: "Erreur lors de la mise à jour",
                                    },
                                  );
                                  await Promise.all([
                                    loadCommunes(selectedZone.id),
                                    loadZones(),
                                  ]);
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600"
                                onClick={async () => {
                                  if (!selectedZone) return;

                                  if (
                                    !window.confirm(
                                      `Supprimer la commune ${commune.display_name} ?`,
                                    )
                                  ) {
                                    return;
                                  }

                                  await toast.promise(
                                    api.delete(
                                      `admin/shipping-zones/${selectedZone.id}/communes/${commune.id}`,
                                    ),
                                    {
                                      loading: "Suppression...",
                                      success: "Commune supprimée",
                                      error: "Erreur lors de la suppression",
                                    },
                                  );

                                  await Promise.all([
                                    loadCommunes(selectedZone.id),
                                    loadZones(),
                                  ]);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
