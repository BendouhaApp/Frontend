import { useEffect, useMemo, useState } from "react";
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
  products?: {
    product_name: string;
    sku: string | null;
  };
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
  customers?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  order_statuses?: {
    status_name: string;
    color: string;
  };
  shipping_zones?: {
    display_name: string;
  };
  shipping_communes?: {
    display_name: string;
  };
  order_items: OrderItem[];
};

type OrderStatus = {
  id: string;
  status_name: string;
  color: string;
};

type DbOrderItem = {
  id: string;
  price: string;
  quantity: number;
  products?: {
    product_name: string;
    sku: string | null;
  };
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
  customers?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  order_statuses?: {
    status_name: string;
    color: string;
  };
  shipping_zones?: {
    display_name: string;
  };
  shipping_communes?: {
    display_name: string;
  };
  order_items: DbOrderItem[];
};

type OrdersDbResponse = {
  data: DbOrder[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const CURRENCY = "DZD";

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
  const full = `${first} ${last}`.trim();
  return full || "";
};

const tableRowVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
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
  const calcTotal = (items: OrderItem[]) =>
    items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const customerName = order ? getCustomerName(order) : "";
  const contact = order?.customers?.email || order?.customer_phone || null;

  return (
    <AnimatePresence>
      {(order || loading) && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              inset: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 40,
              backgroundColor: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            onClick={onClose}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            style={{
              position: "fixed",
              inset: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              pointerEvents: "none",
            }}
          >
            <div
              className="pointer-events-auto flex flex-col w-full max-w-lg rounded-3xl bg-white shadow-2xl ring-1 ring-neutral-200"
              style={{ maxHeight: "calc(100vh - 2rem)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between px-6 pt-5 pb-4 border-b border-neutral-100">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                    Order Details
                  </h2>
                  {order && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400 font-mono">
                      <Hash className="h-3 w-3" />
                      {order.id}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {order?.order_statuses && (
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: `${order.order_statuses.color}18`,
                        color: order.order_statuses.color,
                        border: `1px solid ${order.order_statuses.color}30`,
                      }}
                    >
                      {order.order_statuses.status_name}
                    </span>
                  )}
                  <motion.button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800 transition"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <RefreshCcw className="h-7 w-7 animate-spin text-neutral-400" />
                    <p className="text-sm text-neutral-500">
                      Loading order details…
                    </p>
                  </div>
                ) : order ? (
                  <>
                    <SectionCard
                      icon={<User className="h-3.5 w-3.5" />}
                      title="Customer"
                    >
                      <DetailRow
                        label="Name"
                        value={
                          customerName ? (
                            customerName
                          ) : (
                            <span className="text-neutral-400 italic text-xs">
                              No name provided
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
                        title="Shipping"
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
                            label="Delivery"
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
                      title={`Items (${order.order_items.length})`}
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
                                "Product"}
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
                      title="Pricing"
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

                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 px-1">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Ordered on{" "}
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
                <div className="shrink-0 px-6 py-4 border-t border-neutral-100 bg-white rounded-b-3xl">
                  <Button
                    onClick={onClose}
                    className="w-full h-10 rounded-xl font-semibold"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
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
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
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
    if (selectedOrderId) {
      loadOrderDetails(selectedOrderId);
    } else {
      setSelectedOrder(null);
    }
  }, [selectedOrderId]);

  const loadStatuses = async () => {
    setLoadingStatuses(true);
    try {
      const res = await api.get<{ message?: string; data: OrderStatus[] }>(
        "orders/statuses",
      );
      setStatuses(res.data.data ?? []);
    } catch (error) {
      console.error("Failed to load statuses:", error);
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

      const res = await api.get<OrdersDbResponse>(
        `orders/admin?${params.toString()}`,
      );
      setItems(res.data.data ?? []);
      setTotalPages(res.data.meta.totalPages ?? 1);
      setTotal(res.data.meta.total ?? 0);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load orders"));
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      const res = await api.get<{ message?: string; data: DbOrder }>(
        `orders/admin/${id}`,
      );
      setSelectedOrder(res.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load details"));
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
          loading: "Updating order status…",
          success: "Order status updated",
          error: (err) => getErrorMessage(err, "Failed to update status"),
        },
      );
      await loadOrders();
      if (selectedOrderId === orderId) await loadOrderDetails(orderId);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const orders = useMemo<Order[]>(() => {
    return items.map((o) => ({
      ...o,
      order_items: o.order_items.map((i) => ({
        ...i,
        price: Number(i.price),
      })),
    }));
  }, [items]);

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
        `${o.customer_first_name ?? ""} ${o.customer_last_name ?? ""}`
          .toLowerCase()
          .includes(q) ||
        o.customer_phone?.toLowerCase().includes(q),
    );
  }, [orders, query]);

  const calcTotal = (items: OrderItem[]) =>
    items.reduce((sum, i) => sum + i.price * i.quantity, 0);

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Orders</h1>
          <p className="mt-1 text-neutral-500 text-sm">
            Manage customer orders
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
          Refresh
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
          placeholder="Search by order ID or phone number…"
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
                {["Order", "Customer", "Status", "Total", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
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
          <p className="font-semibold text-neutral-700">No orders found</p>
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
                {["Order", "Customer", "Status", "Total", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
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
                              Unknown customer
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
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
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
