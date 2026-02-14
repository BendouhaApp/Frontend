import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  AlertCircle,
  Store,
  Tag,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Stats = {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalRevenue: number;
  totalCategories: number;
  outOfStockProducts: number;
  publishedProducts: number;
  draftProducts: number;
  lowStockProducts: number;
  mainCategories: number;
  subCategories: number;
  totalWilayas: number;
  activeWilayas: number;
  inactiveWilayas: number;
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
  } | null;

  order_statuses?: {
    status_name: string;
    color: string;
  } | null;

  order_items: {
    id: string;
    price: string | number;
    quantity: number;
  }[];
};

const API_BASE = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) {
          navigate("/admin/login", { replace: true });
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const statsRes = await fetch(`${API_BASE}/admin/dashboard`, {
          headers,
        });

        if (statsRes.status === 401) {
          navigate("/admin/login", { replace: true });
          return;
        }
        if (!statsRes.ok) throw new Error("Stats request failed");

        const statsData: Stats = await statsRes.json();

        const ordersRes = await fetch(
          `${API_BASE}/admin/dashboard/recent-orders`,
          { headers },
        );

        if (ordersRes.status === 401) {
          navigate("/admin/login", { replace: true });
          return;
        }
        if (!ordersRes.ok) throw new Error("Orders request failed");

        const ordersData = await ordersRes.json();

        const normalizedOrders: Order[] = Array.isArray(ordersData)
          ? ordersData.map((order: any) => ({
              ...order,
              order_items:
                order.order_items?.map((item: any) => ({
                  ...item,
                  price: Number(item.price),
                })) || [],
            }))
          : [];

        setStats(statsData);
        setOrders(normalizedOrders);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const recentOrders = orders.slice(0, 10);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusIcon = (statusName?: string) => {
    if (!statusName) return null;
    const status = statusName.toLowerCase();
    switch (status) {
      case "paid":
      case "confirmed":
      case "delivered":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "pending":
        return <Clock className="h-3.5 w-3.5" />;
      case "cancelled":
      case "canceled":
        return <XCircle className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  const getStatusStyle = (statusColor?: string) => {
    if (!statusColor) return undefined;

    return {
      backgroundColor: `${statusColor}20`, // adds transparency
      color: statusColor,
    };
  };

  const calculateOrderTotal = (order: Order) => {
    return order.order_items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1
                style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                className="text-4xl font-bold tracking-tight text-neutral-900"
              >
                Bendouha Electric Dashboard
              </h1>
              <p className="mt-1.5 text-neutral-600">
                Here's what's happening in your store today.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link to="/shop" target="_blank">
                  <Store className="me-2 h-4 w-4" />
                  View Store
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {loading && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">
              {error}
            </h3>
          </div>
        )}

        {!loading && stats && (
          <>
            <div className="grid gap-6 md:grid-cols-4">
              <StatCard
                label="Total Revenue"
                value={`${stats.totalRevenue.toLocaleString()} DZA`}
                icon={<DollarSign className="h-5 w-5" />}
              />
              <StatCard
                label="Products"
                value={stats.totalProducts}
                icon={<Package className="h-5 w-5" />}
                subtext={`${stats.publishedProducts || 0} published • ${stats.draftProducts || 0} drafts`}
              />
              <StatCard
                label="Categories"
                value={stats.totalCategories}
                icon={<Tag className="h-5 w-5" />}
                subtext={`${stats.mainCategories || 0} main • ${stats.subCategories || 0} sub`}
              />
              <StatCard
                label="Wilayas"
                value={stats.totalWilayas}
                icon={<MapPin className="h-5 w-5" />}
                subtext={`${stats.activeWilayas} active • ${stats.inactiveWilayas} inactive`}
              />
              <StatCard
                label="Total Orders"
                value={stats.totalOrders}
                icon={<ShoppingCart className="h-5 w-5" />}
              />
              <StatCard
                label="Pending Orders"
                value={stats.pendingOrders}
                icon={<Clock className="h-5 w-5" />}
                alert={
                  stats.pendingOrders > 0 ? "Needs attention" : "All clear"
                }
                isWarning={stats.pendingOrders > 0}
              />
              <StatCard
                label="Low Stock Alert"
                value={stats.lowStockProducts || 0}
                icon={<AlertCircle className="h-5 w-5" />}
                alert={
                  (stats.lowStockProducts || 0) > 0
                    ? "Restock needed"
                    : "Healthy"
                }
                isWarning={(stats.lowStockProducts || 0) > 0}
              />
              <StatCard
                label="Out of Stock"
                value={stats.outOfStockProducts}
                icon={<AlertTriangle className="h-5 w-5" />}
                alert={stats.outOfStockProducts > 0 ? "Critical" : "All good"}
                isWarning={stats.outOfStockProducts > 0}
              />
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Recent Orders
                </h3>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin/orders")}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View all
                </Button>
              </div>

              {recentOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingCart className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                  <p className="text-neutral-500">No recent orders yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50">
                        <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-neutral-100 transition-colors hover:bg-neutral-50"
                        >
                          <td className="px-6 py-4 font-mono text-sm font-medium text-neutral-900">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-neutral-900">
                              {order.customers
                                ? `${order.customers.first_name} ${order.customers.last_name}`
                                : `${order.customer_first_name ?? ""} ${order.customer_last_name ?? ""}`.trim() ||
                                  "Guest"}
                            </div>

                            <div className="text-xs text-neutral-500">
                              {order.customers?.email ||
                                order.customer_phone ||
                                ""}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                              style={getStatusStyle(
                                order.order_statuses?.color,
                              )}
                            >
                              {getStatusIcon(order.order_statuses?.status_name)}
                              {order.order_statuses?.status_name || "Unknown"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                            {calculateOrderTotal(order).toLocaleString()} DZA
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/orders`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
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
  label: string;
  value: string | number;
  icon: React.ReactNode;
  alert?: string;
  isWarning?: boolean;
  subtext?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-500">{label}</span>
        <div className="text-neutral-400">{icon}</div>
      </div>
      <div className="mt-3 text-3xl font-semibold text-neutral-900">
        {value}
      </div>
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
  );
}
