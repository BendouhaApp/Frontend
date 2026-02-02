import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, ShoppingCart, Check, X } from "lucide-react";

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

  if (opts.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/${path}`, {
    ...opts,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

type OrderItem = {
  id: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  created_at: string;
  customers?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  order_statuses?: {
    status_name: string;
    color: string;
  };
  order_items: OrderItem[];
};

type OrderStatus = {
  id: string;
  status_name: string;
  color: string;
};

type OrdersResponse = {
  message: string;
  data: Order[];
};

type StatusesResponse = {
  message: string;
  data: OrderStatus[];
};

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const loadOrders = async () => {
    const res = await api<OrdersResponse>("orders/admin"); 
    setOrders(res.data ?? []);
  };

  const loadStatuses = async () => {
    const res = await api<StatusesResponse>("orders/statuses");
    setStatuses(res.data ?? []);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        await Promise.all([loadOrders(), loadStatuses()]);
      } catch (e: any) {
        setError(e.message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ===== STATUS IDS ===== */
  const confirmedStatusId = statuses.find(
    (s) => s.status_name.toLowerCase() === "confirmed",
  )?.id;

  const canceledStatusId = statuses.find(
    (s) => s.status_name.toLowerCase() === "canceled",
  )?.id;

  /* ===== UPDATE ===== */
  const updateStatus = async (orderId: string, statusId?: string) => {
    if (!statusId) return;

    try {
      await api(`orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ order_status_id: statusId }),
      });
      loadOrders();
    } catch (e: any) {
      alert(e.message);
    }
  };

  /* ===== FILTER ===== */
  const filtered = useMemo(() => {
    if (!query) return orders;
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(query.toLowerCase()) ||
        o.customers?.email?.toLowerCase().includes(query.toLowerCase()),
    );
  }, [orders, query]);

  const calcTotal = (items: OrderItem[]) =>
    items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  /* ===== UI ===== */
  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="mb-1 text-3xl font-semibold">Orders</h1>
      <p className="mb-6 text-neutral-500">Manage customer orders</p>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order ID or email..."
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
          <Loader2 className="h-4 w-4 animate-spin" /> Loading orders…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-neutral-400" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow">
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
              {filtered.map((order) => (
                <tr key={order.id} className="border-t hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{order.id}</td>

                  <td className="px-4 py-3">
                    {order.customers
                      ? `${order.customers.first_name} ${order.customers.last_name}`
                      : "—"}
                    <div className="text-xs text-neutral-500">
                      {order.customers?.email}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {order.order_statuses?.status_name ?? "—"}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    ${calcTotal(order.order_items).toFixed(2)}
                  </td>

                  <td className="px-4 py-3 flex gap-2">
                    <button
                      disabled={!confirmedStatusId}
                      onClick={() =>
                        updateStatus(order.id, confirmedStatusId)
                      }
                      className="rounded-lg bg-green-100 p-2 text-green-700 hover:bg-green-200 disabled:opacity-40"
                      title="Confirm order"
                    >
                      <Check size={16} />
                    </button>

                    <button
                      disabled={!canceledStatusId}
                      onClick={() =>
                        updateStatus(order.id, canceledStatusId)
                      }
                      className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200 disabled:opacity-40"
                      title="Cancel order"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
