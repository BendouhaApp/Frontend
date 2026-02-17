import { NavLink, useNavigate } from "@/lib/router";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  FileText,
  LogOut,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

const readUsernameFromToken = (): string => {
  if (typeof window === "undefined") return "Admin";

  const token = localStorage.getItem("access_token");
  if (!token) return "Admin";

  try {
    const payload = token.split(".")[1];
    if (!payload) return "Admin";
    const decoded = JSON.parse(atob(payload));
    if (typeof decoded.username === "string" && decoded.username.trim()) {
      return decoded.username.trim();
    }
  } catch {
    // Token decode failed, keep default
  }

  return "Admin";
};

export default function AdminSidebar({
  className,
  onNavigate,
}: AdminSidebarProps = {}) {
  const navigate = useNavigate();
  const [username] = useState<string>(readUsernameFromToken);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    navigate("/admin/login", { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-neutral-600 hover:bg-neutral-100",
    );

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-neutral-200 bg-white p-4",
        className,
      )}
    >
      <div className="mb-6 px-2">
        <div className="mb-6 px-2 border-b border-neutral-200 pb-4">
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            Admin
          </div>
          <div className="text-xl font-bold text-neutral-900">
            {username}
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        <NavLink to="/admin" end className={linkClass} onClick={onNavigate}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/categories"
          className={linkClass}
          onClick={onNavigate}
        >
          <Tag className="h-4 w-4" />
          Categories
        </NavLink>

        <NavLink
          to="/admin/products"
          className={linkClass}
          onClick={onNavigate}
        >
          <Package className="h-4 w-4" />
          Products
        </NavLink>

        <NavLink to="/admin/orders" className={linkClass} onClick={onNavigate}>
          <ShoppingCart className="h-4 w-4" />
          Orders
        </NavLink>

        <NavLink
          to="/admin/shipping-zones"
          className={linkClass}
          onClick={onNavigate}
        >
          <MapPin className="h-4 w-4" />
          Wilayas
        </NavLink>

        <NavLink to="/admin/logs" className={linkClass} onClick={onNavigate}>
          <FileText className="h-4 w-4" />
          Logs
        </NavLink>
      </nav>

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


