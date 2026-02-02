import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Stats = {
  totalOrders: number
  pendingOrders: number
  totalProducts: number
  totalRevenue: number
}

type Order = {
  order_id: string
  status: string
  total_price: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("admin_token")
        if (!token) {
          navigate("/admin/login", { replace: true })
          return
        }

        const headers = { Authorization: `Bearer ${token}` }

        const statsRes = await fetch(
          `${import.meta.env.VITE_API_URL}/admin/dashboard`,
          { headers }
        )

        if (statsRes.status === 401) {
          navigate("/admin/login", { replace: true })
          return
        }
        if (!statsRes.ok) throw new Error("Stats request failed")

        const statsData: Stats = await statsRes.json()

        const ordersRes = await fetch(
          `${import.meta.env.VITE_API_URL}/admin/dashboard/recent-orders`,
          { headers }
        )

        if (ordersRes.status === 401) {
          navigate("/admin/login", { replace: true })
          return
        }
        if (!ordersRes.ok) throw new Error("Orders request failed")

        const ordersData: Order[] = await ordersRes.json()

        setStats(statsData)
        setOrders(Array.isArray(ordersData) ? ordersData : [])
      } catch (err) {
        console.error("Dashboard error:", err)
        setError("Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [navigate])

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                Dashboard
              </h1>
              <p className="mt-1 text-neutral-600">
                Store overview and recent activity
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link to="/admin/products">
                  <Package className="me-2 h-4 w-4" />
                  Manage Products
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Loading */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">
              {error}
            </h3>
          </div>
        )}

        {/* Stats */}
        {!loading && stats && (
          <>
            <div className="grid gap-6 md:grid-cols-4">
              <StatCard
                label="Total Orders"
                value={stats.totalOrders}
                icon={<ShoppingCart className="h-5 w-5" />}
              />
              <StatCard
                label="Revenue"
                value={`${stats.totalRevenue} DZA`}
                icon={<DollarSign className="h-5 w-5" />}
              />
              <StatCard
                label="Products"
                value={stats.totalProducts}
                icon={<Package className="h-5 w-5" />}
              />
              <StatCard
                label="Pending Orders"
                value={stats.pendingOrders}
                icon={<Clock className="h-5 w-5" />}
              />
            </div>

            {/* Recent Orders */}
            <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="border-b border-neutral-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Recent Orders
                </h3>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center text-neutral-500">
                  No recent orders
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
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-neutral-600">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.order_id}
                          className="border-b border-neutral-100"
                        >
                          <td className="px-6 py-4 font-mono text-sm">
                            #{order.order_id}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "rounded-full px-3 py-1 text-xs font-medium",
                                order.status === "pending" &&
                                  "bg-amber-100 text-amber-700",
                                order.status === "paid" &&
                                  "bg-emerald-100 text-emerald-700",
                                order.status === "cancelled" &&
                                  "bg-rose-100 text-rose-700"
                              )}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {order.total_price} DZA
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
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-500">
          {label}
        </span>
        <div className="text-neutral-400">{icon}</div>
      </div>
      <div className="mt-3 text-2xl font-semibold text-neutral-900">
        {value}
      </div>
    </div>
  )
}
