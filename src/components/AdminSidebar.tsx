import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login", { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-neutral-600 hover:bg-neutral-100",
    );

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white p-4">
      {/* Logo */}
      <div className="mb-6 px-2 text-xl font-semibold text-neutral-900">
        Admin Panel
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        <NavLink to="/admin" end className={linkClass}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>

        <NavLink to="/admin/products" className={linkClass}>
          <Package className="h-4 w-4" />
          Products
        </NavLink>

        <NavLink to="/admin/orders" className={linkClass}>
          <ShoppingCart className="h-4 w-4" />
          Orders
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-6">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
