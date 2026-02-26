import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion, type Variants } from "@/lib/gsap-motion";
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
  Home,
  Building2,
  Truck,
  Zap,
  MapPin,
  FileText,
  Map,
  MapIcon,
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
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
    <div className="rounded-2xl border-[1.5px] border-slate-200 bg-white shadow-lg overflow-hidden">
      <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
            <MapIcon size={18} className="text-slate-700" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              {zone ? "Modifier la zone" : "Nouvelle zone"}
            </p>
            <p className="text-xs text-slate-500">
              {zone
                ? `Ajustement de ${zone.display_name}`
                : "Créer une nouvelle zone de livraison"}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8 text-slate-500 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={submit} className="p-6 space-y-7">
        {/* GENERAL INFO */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
              <FileText size={14} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Informations générales
              </h4>
              <p className="text-xs text-slate-400">
                Nom interne et affichage client
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 tracking-wide">
                Nom technique
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="alger"
                required
                className="w-full rounded-lg border-[1.5px] border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 tracking-wide">
                Nom affiché
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alger"
                required
                className="w-full rounded-lg border-[1.5px] border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* STATUS SECTION */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Zap size={14} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Statut de la zone
              </h4>
              <p className="text-xs text-slate-400">
                Activer ou désactiver cette zone
              </p>
            </div>
          </div>

          <ToggleCard
            id="zoneActive"
            label="Zone active"
            description="Disponible pour les communes associées"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            icon={Map}
          />

          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
            Le pricing de livraison est géré au niveau des communes.
          </div>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-5">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {zone ? "Mettre à jour" : "Créer la zone"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function CircleCheckbox({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id: string;
}) {
  return (
    <>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <label
        htmlFor={id}
        className="cursor-pointer flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className={`
            flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-150
            ${
              checked
                ? "bg-blue-600 border-blue-600 shadow-[0_0_0_3px_#dbeafe]"
                : "bg-white border-slate-300"
            }
          `}
        >
          {checked && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6L5 9L10 3"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </label>
    </>
  );
}

function ToggleCard({
  id,
  label,
  description,
  checked,
  onChange,
  icon: Icon,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ElementType<{ size?: number; className?: string }>;
}) {
  return (
    <div
      className={`
        flex items-center justify-between px-4 py-3 rounded-xl border-[1.5px] cursor-pointer transition-all duration-150 select-none
        ${
          checked
            ? "bg-blue-50 border-blue-200"
            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
        }
      `}
      onClick={() =>
        onChange({
          target: { checked: !checked },
        } as React.ChangeEvent<HTMLInputElement>)
      }
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center transition-colors
            ${checked ? "bg-blue-100" : "bg-slate-200"}
          `}
        >
          <Icon
            size={15}
            className={checked ? "text-blue-600" : "text-slate-400"}
          />
        </div>
        <div>
          <p
            className={`text-xs font-600 leading-tight ${checked ? "text-blue-900" : "text-slate-700"}`}
            style={{ fontWeight: 600 }}
          >
            {label}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>
      <CircleCheckbox checked={checked} onChange={onChange} id={id} />
    </div>
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
  const [officeEnabled, setOfficeEnabled] = useState(
    commune?.office_delivery_enabled ?? true,
  );
  const [homePrice, setHomePrice] = useState(
    commune?.home_delivery_price != null
      ? commune.home_delivery_price.toString()
      : "",
  );
  const [officePrice, setOfficePrice] = useState(
    commune?.office_delivery_price != null
      ? commune.office_delivery_price.toString()
      : "",
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
    <div className="rounded-2xl border-[1.5px] border-slate-200 bg-white shadow-lg overflow-hidden">
      <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
          <MapPin size={18} />
        </div>
        <div>
          <p className="text-sm font-bold">
            {commune ? "Modifier la commune" : "Nouvelle commune"}
          </p>
          <p className="text-xs">
            {commune
              ? `Édition de ${commune.display_name}`
              : "Ajouter une zone de livraison"}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="p-6 space-y-7">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
              <FileText size={14} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Informations générales
              </h4>
              <p className="text-xs text-slate-400">
                Nom interne et affichage client
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 tracking-wide">
                Nom technique
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="bir-khadem"
                required
                className="w-full rounded-lg border-[1.5px] border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 tracking-wide">
                Nom affiché
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Bir Khadem"
                required
                className="w-full rounded-lg border-[1.5px] border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Truck size={14} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Paramètres de livraison
              </h4>
              <p className="text-xs text-slate-400">
                Configuration des frais et options
              </p>
            </div>
          </div>

          {/* Pricing Inputs */}
          <div className="grid grid-cols-2 gap-4">
            {/* Home price */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 tracking-wide flex items-center gap-1.5">
                <Home size={11} />
                Prix domicile
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  step="5"
                  value={homePrice}
                  onChange={(e) => setHomePrice(e.target.value)}
                  disabled={!homeEnabled}
                  placeholder="1000"
                  className="w-full rounded-lg border-[1.5px] border-slate-200 bg-slate-50 px-3 py-2 pr-12 text-sm text-right text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 tracking-widest pointer-events-none">
                  DZD
                </span>
              </div>
            </div>

            {/* Office price */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 tracking-wide flex items-center gap-1.5">
                <Building2 size={11} />
                Prix bureau
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  step="5"
                  value={officePrice}
                  onChange={(e) => setOfficePrice(e.target.value)}
                  disabled={!officeEnabled}
                  placeholder="500"
                  className="w-full rounded-lg border-[1.5px] border-slate-200 bg-slate-50 px-3 py-2 pr-12 text-sm text-right text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 tracking-widest pointer-events-none">
                  DZD
                </span>
              </div>
            </div>
          </div>

          {/* Toggle Cards */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <ToggleCard
              id="active"
              label="Actif"
              description="Zone disponible à la livraison"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              icon={Zap}
            />
            <ToggleCard
              id="freeShipping"
              label="Livraison gratuite"
              description="Aucuns frais appliqués"
              checked={freeShipping}
              onChange={(e) => setFreeShipping(e.target.checked)}
              icon={Truck}
            />
            <ToggleCard
              id="homeEnabled"
              label="Domicile activé"
              description="Livraison à l'adresse"
              checked={homeEnabled}
              onChange={(e) => setHomeEnabled(e.target.checked)}
              icon={Home}
            />
            <ToggleCard
              id="officeEnabled"
              label="Bureau activé"
              description="Retrait en point relais"
              checked={officeEnabled}
              onChange={(e) => setOfficeEnabled(e.target.checked)}
              icon={Building2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-5">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {commune ? "Mettre à jour" : "Ajouter la commune"}
          </Button>
        </div>
      </form>
    </div>
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
  const [deleteCommune, setDeleteCommune] = useState<ShippingCommune | null>(
    null,
  );
  const [updatingCommuneId, setUpdatingCommuneId] = useState<number | null>(
    null,
  );

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
        success: editingCommune ? "Commune mise à jour" : "Commune ajoutée",
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

        {!loading && stats && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            style={{ perspective: 1000 }}
          >
            <motion.div variants={fadeUp}>
              <StatCard
                label="Wilayas"
                value={stats.total}
                icon={<MapPin className="h-5 w-5" />}
                subtext="Total zones"
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <StatCard
                label="Actives"
                value={stats.active}
                icon={<Zap className="h-5 w-5" />}
                subtext={`${stats.total - stats.active} inactive`}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <StatCard
                label="Wilayas avec communes"
                value={stats.zonesWithCommunes}
                icon={<Building2 className="h-5 w-5" />}
                subtext="Zones configurées"
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <StatCard
                label="Communes"
                value={stats.communeCount}
                icon={<Home className="h-5 w-5" />}
                subtext="Total communes"
              />
            </motion.div>
          </motion.div>
        )}

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
          <div className="inline-flex rounded-xl bg-neutral-100 p-1 shadow-inner">
            {[
              { key: "all", label: "Toutes" },
              { key: "active", label: "Actives" },
              { key: "inactive", label: "Inactives" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as typeof filter)}
                className={cn(
                  "relative px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200",
                  filter === item.key
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900",
                )}
              >
                {item.label}
              </button>
            ))}
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
                        <div className="flex items-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                              zone.active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-red-200 bg-red-50 text-red-700",
                            )}
                          >
                            {zone.active ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <X className="h-3.5 w-3.5" />
                            )}
                            {zone.active ? "Actif" : "Inactif"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition"
                            onClick={() => {
                              setEditingZone(zone);
                              setShowZoneModal(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            className={cn(
                              "h-8 w-8 rounded-lg transition",
                              zone.active
                                ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700",
                            )}
                            onClick={async () => {
                              await toast.promise(
                                api.patch(`admin/shipping-zones/${zone.id}`, {
                                  active: !zone.active,
                                }),
                                {
                                  loading: "Mise à jour...",
                                  success: "Statut mis à jour",
                                  error: "Erreur lors de la mise à jour",
                                },
                              );
                              await loadZones();
                            }}
                          >
                            {zone.active ? (
                              <X className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            className="h-8 w-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition"
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
            className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex min-h-full items-start justify-center pt-20">
              <div className="w-full max-w-lg">
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
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteZone(null)}
            />

            <motion.div
              className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-90"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Supprimer wilaya
                  </h3>

                  <p className="mt-2 text-sm text-neutral-600">
                    Êtes-vous sûr de vouloir supprimer{" "}
                    <span className="font-medium text-neutral-900">
                      "{deleteZone.display_name}"
                    </span>
                    ?
                    <br />
                    Une fois supprimé, cette wilaya{" "}
                    <strong>ne peuvent pas être restaurés.</strong>.
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteZone(null)}
                    className="flex-1"
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedZone && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                "mx-auto my-6 w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden transition-all duration-200",
                deleteCommune &&
                  "blur-sm scale-[0.98] opacity-70 pointer-events-none",
              )}
            >
              {/* ── Modal Header ── */}
              <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">
                      Communes — {selectedZone.display_name}
                    </h3>
                    <p className="text-xs">
                      Le client choisit une commune pour calculer la livraison.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedZone(null);
                    setShowCommuneForm(false);
                    setEditingCommune(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 cursor-pointer" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* ── Error Banner ── */}
                {communesError && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle
                      size={15}
                      className="flex-shrink-0 text-red-500"
                    />
                    {communesError}
                  </div>
                )}

                {/* ── Toolbar ── */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      <Building2 size={11} />
                      {communes.length} commune
                      {communes.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadCommunes(selectedZone.id)}
                      disabled={communesLoading}
                      className="flex items-center justify-center w-8 h-8 rounded-lg border-[1.5px] border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 transition"
                    >
                      <RefreshCcw
                        className={cn(
                          "h-3.5 w-3.5",
                          communesLoading && "animate-spin",
                        )}
                      />
                    </button>
                    <Button
                      className="flex items-center justify-center w-24 h-8 rounded-lg border-slate-200 disabled:opacity-40 transition"
                      onClick={() => {
                        setEditingCommune(null);
                        setShowCommuneForm(true);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Ajouter
                    </Button>
                  </div>
                </div>

                {/* ── Commune Form ── */}
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

                {/* ── Table ── */}
                {communesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-xl" />
                    ))}
                  </div>
                ) : communes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <MapPin size={20} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600">
                      Aucune commune
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Ajoutez votre première commune pour commencer.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border-[1.5px] border-slate-200 overflow-hidden">
                    <div className="max-h-[55vh] overflow-auto">
                      <table className="min-w-[760px] w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              Commune
                            </th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              <span className="flex items-center gap-1">
                                <Home size={10} /> Domicile
                              </span>
                            </th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              <span className="flex items-center gap-1">
                                <Building2 size={10} /> Bureau
                              </span>
                            </th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              Statut
                            </th>
                            <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {communes.map((commune) => (
                            <tr
                              key={commune.id}
                              className="hover:bg-slate-50/70 transition-colors"
                            >
                              {/* Name */}
                              <td className="px-4 py-3">
                                <p className="text-sm font-semibold text-slate-800">
                                  {commune.display_name}
                                </p>
                                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                  {commune.name}
                                </p>
                              </td>

                              {/* Home delivery */}
                              <td className="px-4 py-3">
                                {commune.home_delivery_enabled ? (
                                  commune.free_shipping ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                      <Truck size={9} /> Gratuite
                                    </span>
                                  ) : (
                                    <span className="inline-flex rounded-lg bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                                      {asDzd(commune.home_delivery_price)}
                                    </span>
                                  )
                                ) : (
                                  <span className="text-[11px] text-slate-300 font-medium">
                                    déactivated
                                  </span>
                                )}
                              </td>

                              {/* Office delivery */}
                              <td className="px-4 py-3">
                                {commune.office_delivery_enabled ? (
                                  commune.free_shipping ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                      <Truck size={9} /> Gratuite
                                    </span>
                                  ) : (
                                    <span className="inline-flex rounded-lg bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                                      {asDzd(commune.office_delivery_price)}
                                    </span>
                                  )
                                ) : (
                                  <span className="text-[11px] text-slate-300 font-medium">
                                    déactivated
                                  </span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="px-4 py-3">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border",
                                    commune.active
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : "border-red-200 bg-red-50 text-red-700",
                                  )}
                                >
                                  {commune.active ? (
                                    <Check className="h-3.5 w-3.5" />
                                  ) : (
                                    <X className="h-3.5 w-3.5" />
                                  )}
                                  {commune.active ? "Actif" : "Inactif"}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                  {/* Edit */}
                                  <button
                                    onClick={() => {
                                      setEditingCommune(commune);
                                      setShowCommuneForm(true);
                                    }}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition"
                                    title="Modifier"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>

                                  {/* Toggle active */}
                                  <button
                                    onClick={async () => {
                                      if (!selectedZone) return;
                                      setUpdatingCommuneId(commune.id);
                                      try {
                                        await toast.promise(
                                          api.patch(
                                            `admin/shipping-zones/${selectedZone.id}/communes/${commune.id}`,
                                            { active: !commune.active },
                                          ),
                                          {
                                            loading: "Mise à jour...",
                                            success: "Statut mis à jour",
                                            error:
                                              "Erreur lors de la mise à jour",
                                          },
                                        );
                                        await Promise.all([
                                          loadCommunes(selectedZone.id),
                                          loadZones(),
                                        ]);
                                      } finally {
                                        setUpdatingCommuneId(null);
                                      }
                                    }}
                                    className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center transition",
                                      commune.active
                                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
                                    )}
                                    title={
                                      commune.active ? "Désactiver" : "Activer"
                                    }
                                  >
                                    {updatingCommuneId === commune.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                                    ) : commune.active ? (
                                      <X className="h-3.5 w-3.5" />
                                    ) : (
                                      <Check className="h-3.5 w-3.5" />
                                    )}
                                  </button>

                                  {/* Delete */}
                                  <button
                                    onClick={() => setDeleteCommune(commune)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteCommune && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteCommune(null)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-90"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-900">
                    Supprimer commune
                  </h3>

                  <p className="mt-2 text-sm text-neutral-600">
                    Êtes-vous sûr de vouloir supprimer{" "}
                    <span className="font-medium text-neutral-900">
                      "{deleteCommune.display_name}"
                    </span>
                    ?<br />
                    Une fois supprimé, ce commun{" "}
                    <strong>ne peuvent pas être restaurés</strong>.
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDeleteCommune(null)}
                  >
                    Cancel
                  </Button>

                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={async () => {
                      if (!selectedZone) return;

                      await toast.promise(
                        api.delete(
                          `admin/shipping-zones/${selectedZone.id}/communes/${deleteCommune.id}`,
                        ),
                        {
                          loading: "Suppression...",
                          success: "Commune supprimée",
                          error: "Échec de la suppression",
                        },
                      );

                      setDeleteCommune(null);

                      await Promise.all([
                        loadCommunes(selectedZone.id),
                        loadZones(),
                      ]);
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
