import { useEffect, useState } from "react";
import { useNavigate, Link } from "@/lib/router";
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
import { motion, AnimatePresence, type Variants } from "framer-motion";
import api from "@/lib/axios";

type Stats = {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
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

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const tableRowVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");

        if (!accessToken) {
          navigate("/admin/login", { replace: true });
          return;
        }

        const statsRes = await api.get("/admin/dashboard");
        const ordersRes = await api.get("/admin/dashboard/recent-orders");

        const statsData: Stats = statsRes.data;
        const ordersData = ordersRes.data;

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
      backgroundColor: `${statusColor}20`,
      color: statusColor,
      border: `1px solid ${statusColor}40`,
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
                className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
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
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-white p-12 text-center shadow-sm"
          >
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">
              {error}
            </h3>
          </motion.div>
        )}

        {!loading && stats && (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid gap-6 md:grid-cols-4"
              style={{ perspective: 1000 }}
            >
              <motion.div variants={fadeUp}>
                <StatCard
                  label="Total Revenue"
                  value={`${stats.totalRevenue.toLocaleString()} DZD`}
                  icon={<DollarSign className="h-5 w-5" />}
                  subtext={`${stats.confirmedOrders || 0} confirmed orders`}
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <StatCard
                  label="Products"
                  value={stats.totalProducts}
                  icon={<Package className="h-5 w-5" />}
                  subtext={`${stats.publishedProducts || 0} published â€¢ ${stats.draftProducts || 0} drafts`}
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <StatCard
                  label="Categories"
                  value={stats.totalCategories}
                  icon={<Tag className="h-5 w-5" />}
                  subtext={`${stats.mainCategories || 0} main â€¢ ${stats.subCategories || 0} sub`}
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <StatCard
                  label="Wilayas"
                  value={stats.totalWilayas}
                  icon={<MapPin className="h-5 w-5" />}
                  subtext={`${stats.activeWilayas} active â€¢ ${stats.inactiveWilayas} inactive`}
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <StatCard
                  label="Total Orders"
                  value={stats.totalOrders}
                  icon={<ShoppingCart className="h-5 w-5" />}
                  subtext={`${stats.todayOrders || 0} orders today`}
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <StatCard
                  label="Pending Orders"
                  value={stats.pendingOrders}
                  icon={<Clock className="h-5 w-5" />}
                  alert={
                    stats.pendingOrders > 0 ? "Needs attention" : "All clear"
                  }
                  isWarning={stats.pendingOrders > 0}
                />
              </motion.div>

              <motion.div variants={fadeUp}>
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
              </motion.div>

              <motion.div variants={fadeUp}>
                <StatCard
                  label="Out of Stock"
                  value={stats.outOfStockProducts}
                  icon={<AlertTriangle className="h-5 w-5" />}
                  alert={stats.outOfStockProducts > 0 ? "Critical" : "All good"}
                  isWarning={stats.outOfStockProducts > 0}
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
                <h3 className="flex items-center gap-2.5 text-xl font-bold text-neutral-900">
                  <motion.div
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </motion.div>
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center"
                >
                  <ShoppingCart className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                  <h4 className="mb-1 text-lg font-semibold text-neutral-900">
                    No orders yet
                  </h4>
                  <p className="text-sm text-neutral-500">
                    Orders will appear here once customers start purchasing.
                  </p>
                </motion.div>
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
                    <motion.tbody
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      <AnimatePresence>
                        {recentOrders.map((order, index) => (
                          <motion.tr
                            key={order.id}
                            variants={tableRowVariants}
                            custom={index}
                            className="group border-b border-neutral-100 transition-colors hover:bg-neutral-50"
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
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
                              <motion.span
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                                style={getStatusStyle(
                                  order.order_statuses?.color,
                                )}
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                {getStatusIcon(
                                  order.order_statuses?.status_name,
                                )}
                                {order.order_statuses?.status_name || "Unknown"}
                              </motion.span>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                              {calculateOrderTotal(order).toLocaleString()} DZD
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-600">
                              {formatDate(order.created_at)}
                            </td>
                            <td className="px-6 py-4">
                              <motion.div whileHover={{ scale: 1.1 }}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/admin/orders`)}
                                  className="opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </motion.tbody>
                  </table>
                </div>
              )}
            </motion.div>
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
      whileHover={{
        y: -4,
        scale: 1.02,
        rotateX: 1,
        rotateY: -1,
        boxShadow: "0px 30px 60px -15px rgba(0,0,0,0.18)",
      }}
      transition={{
        type: "spring",
        stiffness: 170,
        damping: 14,
      }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-500">{label}</span>

          <motion.div
            className="text-neutral-400 transition-colors group-hover:text-primary"
            whileHover={{ scale: 1.3, rotate: 8 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 12,
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


