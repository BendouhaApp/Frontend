import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Check,
  X,
  RefreshCcw,
  AlertCircle,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

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
  const [/*loadingStatuses*/, setLoadingStatuses] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Load statuses once
  useEffect(() => {
    loadStatuses();
  }, []);

  // Load orders when page/query changes
  useEffect(() => {
    loadOrders();
  }, [page, debouncedQuery]);

  // Reset page when query changes
  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [debouncedQuery]);

  // Load order details when selected
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
    } catch (e: any) {
      console.error("Failed to load statuses:", e);
    } finally {
      setLoadingStatuses(false);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));

      if (debouncedQuery.trim()) {
        params.set("search", debouncedQuery.trim());
      }

      const res = await api.get<OrdersDbResponse>(
        `orders/admin?${params.toString()}`,
      );

      setItems(res.data.data ?? []);
      setTotalPages(res.data.meta.totalPages ?? 1);
      setTotal(res.data.meta.total ?? 0);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to load orders",
      );
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
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to load details",
      );
      setSelectedOrderId(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const updateOrderStatus = async (orderId: string, statusId: string) => {
    setUpdating(true);
    setError("");

    try {
      await api.patch(`orders/${orderId}`, {
        order_status_id: statusId,
      });

      await loadOrders();

      if (selectedOrderId === orderId) {
        await loadOrderDetails(orderId);
      }
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to update status",
      );
    } finally {
      setUpdating(false);
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
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(query.toLowerCase()) ||
        o.customers?.email?.toLowerCase().includes(query.toLowerCase()) ||
        `${o.customer_first_name ?? ""} ${o.customer_last_name ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        o.customer_phone?.toLowerCase().includes(query.toLowerCase()),
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
    <div className="mx-auto max-w-7xl p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="mb-1 text-3xl font-semibold">Orders</h1>
          <p className="mb-6 text-neutral-500">Manage customer orders</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              loadOrders();
              loadStatuses();
            }}
            className="gap-2"
            disabled={loading}
          >
            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative mb-4 max-w-md"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order ID or phone number..."
          className="w-full rounded-xl border py-2 pl-9 pr-3 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-sm text-red-900">
                Failed to load orders
              </p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                loadOrders();
                loadStatuses();
                setError("");
              }}
              className="shrink-0"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-hidden rounded-xl bg-white shadow"
        >
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 text-left">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
                    <div className="mt-1 h-3 w-24 animate-pulse rounded bg-neutral-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <div className="h-8 w-8 animate-pulse rounded-lg bg-neutral-200" />
                      <div className="h-8 w-8 animate-pulse rounded-lg bg-neutral-200" />
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
          transition={{ duration: 0.3 }}
          className="rounded-xl bg-white p-10 text-center shadow"
        >
          <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-neutral-400" />
          <p>No orders found</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-xl bg-white shadow"
        >
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 text-left">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {filtered.map((order) => (
                  <motion.tr
                    key={order.id}
                    variants={tableRowVariants}
                    className="group border-t hover:bg-neutral-50 cursor-pointer transition"
                    onClick={() => setSelectedOrderId(order.id)}
                    title="Click to view details"
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                  >
                    <td className="px-4 py-3 font-medium">{order.id}</td>

                    <td className="px-4 py-3">
                      {order.customers
                        ? `${order.customers.first_name} ${order.customers.last_name}`
                        : `${order.customer_first_name ?? ""} ${order.customer_last_name ?? ""}`.trim() ||
                          "—"}
                      <div className="text-xs text-neutral-500">
                        {order.customers?.email || order.customer_phone || "—"}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {order.order_statuses ? (
                        <motion.span
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: `${order.order_statuses.color}20`,
                            color: order.order_statuses.color,
                          }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {order.order_statuses.status_name}
                        </motion.span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-medium">
                      {calcTotal(order.order_items).toFixed(2)} {CURRENCY}
                    </td>

                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-2">
                        <motion.button
                          disabled={!confirmedStatusId || updating}
                          onClick={() =>
                            confirmedStatusId &&
                            updateOrderStatus(order.id, confirmedStatusId)
                          }
                          className="rounded-lg bg-green-100 p-2 text-green-700 hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          title="Confirm order"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Check size={16} />
                        </motion.button>

                        <motion.button
                          disabled={!canceledStatusId || updating}
                          onClick={() =>
                            canceledStatusId &&
                            updateOrderStatus(order.id, canceledStatusId)
                          }
                          className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          title="Cancel order"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <X size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
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
          className="mt-4 flex items-center justify-between"
        >
          <span className="text-sm text-neutral-600">
            Page <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
            {total > 0 && (
              <span className="ml-2 text-neutral-500">
                ({total} total orders)
              </span>
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

      <AnimatePresence>
        {normalizedSelectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedOrderId(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4 z-10">
                  <div>
                    <h2 className="text-xl font-semibold">Order Details</h2>
                    <p className="text-sm text-neutral-500">
                      {normalizedSelectedOrder.id}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setSelectedOrderId(null)}
                    className="rounded-lg p-2 hover:bg-neutral-100 transition"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                {loadingDetails ? (
                  <div className="p-12 text-center">
                    <RefreshCcw className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-3 text-sm text-neutral-600">
                      Loading details...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-neutral-600">
                          Status
                        </span>
                        {normalizedSelectedOrder.order_statuses && (
                          <span
                            className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                            style={{
                              backgroundColor: `${normalizedSelectedOrder.order_statuses.color}20`,
                              color: normalizedSelectedOrder.order_statuses.color,
                            }}
                          >
                            {normalizedSelectedOrder.order_statuses.status_name}
                          </span>
                        )}
                      </div>

                      <div className="rounded-xl border p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-700">
                          <User className="h-4 w-4" />
                          Customer Information
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Name</span>
                            <span className="font-medium">
                              {normalizedSelectedOrder.customers
                                ? `${normalizedSelectedOrder.customers.first_name} ${normalizedSelectedOrder.customers.last_name}`
                                : `${normalizedSelectedOrder.customer_first_name ?? ""} ${normalizedSelectedOrder.customer_last_name ?? ""}`.trim() ||
                                  "—"}
                            </span>
                          </div>
                          {(normalizedSelectedOrder.customers?.email ||
                            normalizedSelectedOrder.customer_phone) && (
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Contact</span>
                              <span className="font-medium">
                                {normalizedSelectedOrder.customers?.email ||
                                  normalizedSelectedOrder.customer_phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-700">
                          <MapPin className="h-4 w-4" />
                          Shipping Information
                        </div>
                        <div className="space-y-2 text-sm">
                          {normalizedSelectedOrder.customer_wilaya && (
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Wilaya</span>
                              <span className="font-medium">
                                {normalizedSelectedOrder.customer_wilaya}
                              </span>
                            </div>
                          )}
                          {normalizedSelectedOrder.delivery_type && (
                            <div className="flex justify-between">
                              <span className="text-neutral-500">
                                Delivery Type
                              </span>
                              <span className="font-medium capitalize">
                                {normalizedSelectedOrder.delivery_type}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-700">
                          <Package className="h-4 w-4" />
                          Items ({normalizedSelectedOrder.order_items.length})
                        </div>
                        <div className="space-y-3">
                          {normalizedSelectedOrder.order_items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-3 text-sm"
                            >
                              <div className="flex-1">
                                <p className="font-medium">
                                  {item.products?.product_name || "Product"}
                                </p>
                                {item.products?.sku && (
                                  <p className="text-xs text-neutral-500">
                                    SKU: {item.products.sku}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  {item.price.toFixed(2)} {CURRENCY}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-700">
                          <CreditCard className="h-4 w-4" />
                          Pricing
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Subtotal</span>
                            <span className="font-medium">
                              {calcTotal(
                                normalizedSelectedOrder.order_items,
                              ).toFixed(2)} {CURRENCY}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Shipping</span>
                            <span className="font-medium">
                              {Number(
                                normalizedSelectedOrder.shipping_price || 0,
                              ).toFixed(2)} {CURRENCY}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2 text-base font-semibold">
                            <span>Total</span>
                            <span>
                              {Number(
                                normalizedSelectedOrder.total_price ||
                                  calcTotal(
                                    normalizedSelectedOrder.order_items,
                                  ),
                              ).toFixed(2)} {CURRENCY}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Clock className="h-3.5 w-3.5" />
                        Created{" "}
                        {new Date(
                          normalizedSelectedOrder.created_at,
                        ).toLocaleString()}
                      </div>
                    </div>

                    <div className="sticky bottom-0 border-t bg-neutral-50 px-6 py-4">
                      <Button
                        onClick={() => setSelectedOrderId(null)}
                        className="w-full"
                      >
                        Close
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
