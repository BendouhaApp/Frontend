import { useMemo, useState } from "react";
import {
  Loader2,
  Search,
  ShoppingCart,
  Check,
  X,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGet } from "@/hooks/useGet";
import { usePostAction } from "@/hooks/usePostAction";

type OrderItem = {
  id: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  created_at: string;
  customer_first_name?: string | null;
  customer_last_name?: string | null;
  customer_phone?: string | null;
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

type StatusesResponse = {
  message: string;
  data: OrderStatus[];
};

export function AdminOrders() {
  const [query, setQuery] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const adminToken = localStorage.getItem("admin_token");
  const adminRequestHeader = adminToken
    ? { headers: { Authorization: `Bearer ${adminToken}` } }
    : undefined;

  const ordersQuery = useGet<OrdersDbResponse>({
    path: "orders/admin",
    query: { page, limit },
    requestHeader: adminRequestHeader,
    options: {
      staleTime: 1000 * 15,
      placeholderData: (previous) => previous,
    },
  });

  const statusesQuery = useGet<StatusesResponse>({
    path: "orders/statuses",
    requestHeader: adminRequestHeader,
    options: {
      staleTime: 1000 * 60,
    },
  });

  const orders = useMemo<Order[]>(() => {
    const data = ordersQuery.data?.data ?? [];
    return data.map((o) => ({
      ...o,
      order_items: o.order_items.map((i) => ({
        ...i,
        price: Number(i.price),
      })),
    }));
  }, [ordersQuery.data]);

  const statuses = statusesQuery.data?.data ?? [];
  const totalPages = ordersQuery.data?.meta.totalPages ?? 1;
  const loading = ordersQuery.isLoading || statusesQuery.isLoading;
  const error =
    ordersQuery.error?.message || statusesQuery.error?.message || "";

  const updateStatus = usePostAction();

  /* ===== STATUS IDS ===== */
  const confirmedStatusId = statuses.find(
    (s) => s.status_name.toLowerCase() === "confirmed",
  )?.id;

  const canceledStatusId = statuses.find(
    (s) => s.status_name.toLowerCase() === "canceled",
  )?.id;

  /* ===== UPDATE ===== */
  const updateStatusAction = (orderId: string, statusId?: string) => {
    if (!statusId) return;
    updateStatus.mutate({
      method: "patch",
      path: `orders/${orderId}`,
      body: { order_status_id: statusId },
      requestHeader: adminRequestHeader,
      invalidateQueries: true,
    });
  };

  /* ===== FILTER ===== */
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

  /* ===== Loading ===== */

  type DbOrderItem = {
    id: string;
    price: string; // Decimal
    quantity: number;
  };

  type DbOrder = {
    id: string;
    created_at: string;
    customer_first_name?: string | null;
    customer_last_name?: string | null;
    customer_phone?: string | null;
    customers?: {
      first_name: string;
      last_name: string;
      email: string;
    };
    order_statuses?: {
      status_name: string;
      color: string;
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


  /* ===== UI ===== */
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-semibold">Orders</h1>
          <p className="mb-6 text-neutral-500">Manage customer orders</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              ordersQuery.refetch();
              statusesQuery.refetch();
            }}
            className="gap-2"
            disabled={loading}
          >
            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            if (page !== 1) {
              setPage(1);
            }
          }}
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
                      : `${order.customer_first_name ?? ""} ${order.customer_last_name ?? ""}`.trim() ||
                        "—"}
                    <div className="text-xs text-neutral-500">
                      {order.customers?.email || order.customer_phone || "—"}
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
                        updateStatusAction(order.id, confirmedStatusId)
                      }
                      className="rounded-lg bg-green-100 p-2 text-green-700 hover:bg-green-200 disabled:opacity-40"
                      title="Confirm order"
                    >
                      <Check size={16} />
                    </button>

                    <button
                      disabled={!canceledStatusId}
                      onClick={() =>
                        updateStatusAction(order.id, canceledStatusId)
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
      {!loading && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-neutral-500">
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
