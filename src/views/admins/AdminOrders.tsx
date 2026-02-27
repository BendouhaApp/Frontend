import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type Variants } from "@/lib/gsap-motion";
import {
  Search,
  ShoppingCart,
  Check,
  X,
  RefreshCcw,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";

type OrderItem = {
  id: string;
  price: number;
  quantity: number;
  products?: { product_name: string; sku: string | null };
};

type Order = {
  id: string;
  created_at: string;
  customer_first_name?: string | null;
  customer_last_name?: string | null;
  customer_phone?: string | null;
  customer_wilaya?: string | null;
  customer_commune?: string | null;
  delivery_type?: string | null;
  shipping_price?: string | number;
  total_price?: string | number;
  customers?: { first_name: string; last_name: string; email: string };
  order_statuses?: { status_name: string; color: string };
  shipping_zones?: { display_name: string };
  shipping_communes?: { display_name: string };
  order_items: OrderItem[];
};

type OrderStatus = { id: string; status_name: string; color: string };

type DbOrderItem = {
  id: string;
  price: string;
  quantity: number;
  products?: { product_name: string; sku: string | null };
};

type DbOrder = {
  id: string;
  created_at: string;
  customer_first_name?: string | null;
  customer_last_name?: string | null;
  customer_phone?: string | null;
  customer_wilaya?: string | null;
  customer_commune?: string | null;
  delivery_type?: string | null;
  shipping_price?: string | number;
  total_price?: string | number;
  customers?: { first_name: string; last_name: string; email: string };
  order_statuses?: { status_name: string; color: string };
  shipping_zones?: { display_name: string };
  shipping_communes?: { display_name: string };
  order_items: DbOrderItem[];
};

type OrdersDbResponse = {
  data: DbOrder[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

type ApiErrorShape = {
  response?: { data?: { message?: string } };
  message?: string;
};

const CURRENCY = "DZD";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) return fallback;
  const e = error as ApiErrorShape;
  return e.response?.data?.message || e.message || fallback;
};

const fixEncoding = (str: string | null | undefined): string => {
  if (!str) return "";
  try {
    return decodeURIComponent(escape(str));
  } catch {
    return str;
  }
};

const getCustomerName = (order: Order | DbOrder): string => {
  const first = order.customers?.first_name ?? order.customer_first_name ?? "";
  const last = order.customers?.last_name ?? order.customer_last_name ?? "";
  return `${first} ${last}`.trim();
};

const calcTotal = (items: OrderItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

const tableRowVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="shrink-0 text-sm text-neutral-400">{label}</span>
      <span className="text-right text-sm font-medium text-neutral-800 break-all">
        {value}
      </span>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm text-neutral-500 border border-neutral-100">
          {icon}
        </span>
        <span className="text-sm font-semibold text-neutral-700">{title}</span>
      </div>
      <div className="divide-y divide-neutral-100">{children}</div>
    </div>
  );
}

function OrderDetailModal({
  order,
  loading,
  onClose,
}: {
  order: Order | null;
  loading: boolean;
  onClose: () => void;
}) {
  const isOpen = !!(order || loading);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const customerName = order ? getCustomerName(order) : "";
  const contact = order?.customers?.email || order?.customer_phone || null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] backdrop-blur-[6px] md:left-64 md:right-0 md:top-0 md:bottom-0"
            style={{ backgroundColor: "rgba(0,0,0,0.58)" }}
          />
          <motion.div
            key="modal-wrapper"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            onClick={onClose}
            className="fixed inset-4 z-[9999] flex items-start justify-center md:left-64 md:right-4 md:top-4 md:bottom-4 md:items-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "32rem",
                maxHeight: "calc(100dvh - 2rem)",
                display: "flex",
                flexDirection: "column",
                borderRadius: "1.5rem",
                backgroundColor: "#ffffff",
                boxShadow:
                  "0 32px 72px -10px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1.25rem 1.5rem 1rem",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "#111827",
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    Order Details
                  </h2>
                  {order && (
                    <p
                      style={{
                        marginTop: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        fontSize: "0.7rem",
                        color: "#9ca3af",
                        fontFamily: "monospace",
                      }}
                    >
                      <Hash style={{ width: 10, height: 10 }} />
                      {order.id}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  {order?.order_statuses && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        borderRadius: 9999,
                        padding: "0.18rem 0.65rem",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        backgroundColor: `${order.order_statuses.color}18`,
                        color: order.order_statuses.color,
                        border: `1px solid ${order.order_statuses.color}35`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.order_statuses.status_name}
                    </span>
                  )}
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: "0.6rem",
                      backgroundColor: "#f3f4f6",
                      color: "#6b7280",
                      border: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <X style={{ width: 15, height: 15 }} />
                  </motion.button>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4rem 0",
                      gap: "0.75rem",
                    }}
                  >
                    <RefreshCcw
                      style={{ width: 28, height: 28, color: "#9ca3af" }}
                      className="animate-spin"
                    />
                    <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                      Loading order details…
                    </p>
                  </div>
                ) : order ? (
                  <>
                    <SectionCard
                      icon={<User className="h-3.5 w-3.5" />}
                      title="Client"
                    >
                      <DetailRow
                        label="Nom & Prénom"
                        value={
                          customerName ? (
                            customerName
                          ) : (
                            <span className="text-neutral-400 italic text-xs">
                              Pas de nom fourni
                            </span>
                          )
                        }
                      />
                      {contact && <DetailRow label="Contact" value={contact} />}
                    </SectionCard>

                    {(order.customer_wilaya ||
                      order.customer_commune ||
                      order.shipping_communes?.display_name ||
                      order.delivery_type) && (
                      <SectionCard
                        icon={<MapPin className="h-3.5 w-3.5" />}
                        title="Livraison"
                      >
                        {order.customer_wilaya && (
                          <DetailRow
                            label="Wilaya"
                            value={fixEncoding(order.customer_wilaya)}
                          />
                        )}
                        {(order.customer_commune ||
                          order.shipping_communes?.display_name) && (
                          <DetailRow
                            label="Commune"
                            value={fixEncoding(
                              order.customer_commune ||
                                order.shipping_communes?.display_name,
                            )}
                          />
                        )}
                        {order.delivery_type && (
                          <DetailRow
                            label="Livraison"
                            value={
                              <span className="capitalize">
                                {fixEncoding(order.delivery_type)}
                              </span>
                            }
                          />
                        )}
                      </SectionCard>
                    )}

                    <SectionCard
                      icon={<Package className="h-3.5 w-3.5" />}
                      title={`Produits (${order.order_items.length})`}
                    >
                      {order.order_items.map((item, idx) => (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-start justify-between gap-3 py-2.5",
                            idx !== 0 && "border-t border-neutral-100",
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-800 leading-snug">
                              {fixEncoding(item.products?.product_name) ||
                                "Produit"}
                            </p>
                            {item.products?.sku && (
                              <p className="mt-0.5 text-xs text-neutral-400 font-mono">
                                {fixEncoding(item.products.sku)}
                              </p>
                            )}
                            <p className="mt-0.5 text-xs text-neutral-400">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-neutral-800">
                              {(item.price * item.quantity).toFixed(2)}{" "}
                              <span className="text-xs font-normal text-neutral-400">
                                {CURRENCY}
                              </span>
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-neutral-400">
                                {item.price.toFixed(2)} × {item.quantity}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </SectionCard>

                    <SectionCard
                      icon={<CreditCard className="h-3.5 w-3.5" />}
                      title="Tarif's"
                    >
                      <DetailRow
                        label="Subtotal"
                        value={`${calcTotal(order.order_items).toFixed(2)} ${CURRENCY}`}
                      />
                      <DetailRow
                        label="Shipping"
                        value={`${Number(order.shipping_price || 0).toFixed(2)} ${CURRENCY}`}
                      />
                      <div className="flex items-center justify-between pt-3 mt-1">
                        <span className="text-sm font-bold text-neutral-900">
                          Total
                        </span>
                        <span className="text-base font-bold text-neutral-900">
                          {Number(
                            order.total_price ||
                              calcTotal(order.order_items) +
                                Number(order.shipping_price || 0),
                          ).toFixed(2)}{" "}
                          <span className="text-sm font-normal text-neutral-400">
                            {CURRENCY}
                          </span>
                        </span>
                      </div>
                    </SectionCard>

                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 px-1 pb-1">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Commandé le{" "}
                        {new Date(order.created_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </>
                ) : null}
              </div>

              {!loading && (
                <div
                  style={{
                    flexShrink: 0,
                    padding: "1rem 1.5rem",
                    borderTop: "1px solid #f3f4f6",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <Button
                    onClick={onClose}
                    className="w-full h-10 rounded-xl font-semibold"
                  >
                    Fermé
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}

export function AdminOrders() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [items, setItems] = useState<DbOrder[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [, setLoadingStatuses] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    loadStatuses();
  }, []);
  useEffect(() => {
    loadOrders();
  }, [page, debouncedQuery]);
  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [debouncedQuery]);
  useEffect(() => {
    if (selectedOrderId) loadOrderDetails(selectedOrderId);
    else setSelectedOrder(null);
  }, [selectedOrderId]);

  const loadStatuses = async () => {
    setLoadingStatuses(true);
    try {
      const res = await api.get<{ data: OrderStatus[] }>("orders/statuses");
      setStatuses(res.data.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStatuses(false);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (debouncedQuery.trim()) params.set("search", debouncedQuery.trim());
      const res = await api.get<OrdersDbResponse>(`orders/admin?${params}`);
      setItems(res.data.data ?? []);
      setTotalPages(res.data.meta.totalPages ?? 1);
      setTotal(res.data.meta.total ?? 0);
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to load orders"));
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      const res = await api.get<{ data: DbOrder }>(`orders/admin/${id}`);
      setSelectedOrder(res.data.data);
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to load details"));
      setSelectedOrderId(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const updateOrderStatus = async (orderId: string, statusId: string) => {
    setUpdatingOrderId(orderId);
    try {
      await toast.promise(
        api.patch(`orders/${orderId}`, { order_status_id: statusId }),
        {
          loading: "Mise à jour du statut de la commande...",
          success: "Statut de la commande mis à jour",
          error: (e) => getErrorMessage(e, "Échec de la mise à jour du statut"),
        },
      );
      await loadOrders();
      if (selectedOrderId === orderId) await loadOrderDetails(orderId);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const orders = useMemo<Order[]>(
    () =>
      items.map((o) => ({
        ...o,
        order_items: o.order_items.map((i) => ({
          ...i,
          price: Number(i.price),
        })),
      })),
    [items],
  );

  const confirmedStatusId = statuses.find(
    (s) => s.status_name.toLowerCase() === "confirmed",
  )?.id;

  const canceledStatusId = statuses.find(
    (s) => s.status_name.toLowerCase() === "canceled",
  )?.id;

  const filtered = useMemo(() => {
    if (!query) return orders;
    const q = query.toLowerCase();
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customers?.email?.toLowerCase().includes(q) ||
        getCustomerName(o).toLowerCase().includes(q) ||
        o.customer_phone?.toLowerCase().includes(q),
    );
  }, [orders, query]);

  const normalizedSelectedOrder = useMemo<Order | null>(() => {
    if (!selectedOrder) return null;
    return {
      ...selectedOrder,
      order_items: selectedOrder.order_items.map((i) => ({
        ...i,
        price: Number(i.price),
      })),
    };
  }, [selectedOrder]);

  const tableHeaders = ["Order", "Customer", "Status", "Total", "Actions"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Commandes</h1>
          <p className="mt-1 text-neutral-500 text-sm">
            Gérer les commandes des clients
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            loadOrders();
            loadStatuses();
          }}
          className="gap-2 self-start"
          disabled={loading}
        >
          <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
          Actualiser
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative mb-4 w-full sm:max-w-md"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Recherche par numéro de commande ou numéro de téléphone..."
          className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-4 text-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </motion.div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200"
        >
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-neutral-50 text-left border-b border-neutral-200">
              <tr>
                {tableHeaders.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-t border-neutral-100">
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded-lg bg-neutral-100" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 animate-pulse rounded-lg bg-neutral-100" />
                    <div className="mt-1 h-3 w-24 animate-pulse rounded-lg bg-neutral-100" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-20 animate-pulse rounded-full bg-neutral-100" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-16 animate-pulse rounded-lg bg-neutral-100" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <div className="h-8 w-8 animate-pulse rounded-lg bg-neutral-100" />
                      <div className="h-8 w-8 animate-pulse rounded-lg bg-neutral-100" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-white p-14 text-center shadow-sm ring-1 ring-neutral-200"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
            <ShoppingCart className="h-7 w-7 text-neutral-400" />
          </div>
          <p className="font-semibold text-neutral-700">
            Aucune commande trouvée
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            {query ? "Try adjusting your search." : "Orders will appear here."}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200"
        >
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-neutral-50 text-left border-b border-neutral-200">
              <tr>
                {tableHeaders.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {filtered.map((order) => {
                  const name = getCustomerName(order);
                  return (
                    <motion.tr
                      key={order.id}
                      variants={tableRowVariants}
                      className="border-t border-neutral-100 hover:bg-neutral-50/80 cursor-pointer transition-colors"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md">
                          {order.id}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-800">
                          {name || (
                            <span className="text-neutral-400 italic text-xs">
                              Client inconnu
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {order.customers?.email ||
                            order.customer_phone ||
                            "—"}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        {order.order_statuses ? (
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{
                              backgroundColor: `${order.order_statuses.color}18`,
                              color: order.order_statuses.color,
                              border: `1px solid ${order.order_statuses.color}30`,
                            }}
                          >
                            {order.order_statuses.status_name}
                          </span>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-semibold text-neutral-800">
                        {calcTotal(order.order_items).toFixed(2)}{" "}
                        <span className="text-xs font-normal text-neutral-400">
                          {CURRENCY}
                        </span>
                      </td>

                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-1.5">
                          <motion.button
                            disabled={
                              !confirmedStatusId || updatingOrderId === order.id
                            }
                            onClick={() =>
                              confirmedStatusId &&
                              updateOrderStatus(order.id, confirmedStatusId)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Confirm order"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                          >
                            <Check size={14} />
                          </motion.button>

                          <motion.button
                            disabled={
                              !canceledStatusId || updatingOrderId === order.id
                            }
                            onClick={() =>
                              canceledStatusId &&
                              updateOrderStatus(order.id, canceledStatusId)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Cancel order"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                          >
                            <X size={14} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </motion.div>
      )}

      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="text-sm text-neutral-500">
            Page <span className="font-semibold text-neutral-800">{page}</span>{" "}
            of{" "}
            <span className="font-semibold text-neutral-800">{totalPages}</span>
            {total > 0 && (
              <span className="ml-2 text-neutral-400">({total} total)</span>
            )}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </motion.div>
      )}

      <OrderDetailModal
        order={normalizedSelectedOrder}
        loading={loadingDetails}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
