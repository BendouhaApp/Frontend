import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  FileText,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("admin_username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
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
    <aside className="flex w-64 flex-col border-r border-neutral-200 bg-white p-4">
      <div className="mb-6 px-2">
        {/*<div className="text-xs text-neutral-500">Logged in as</div>*/}
        <div className="mb-6 px-2 border-b border-neutral-200 pb-4">
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            Admin
          </div>
          <div className="text-xl font-bold text-neutral-900">
            {username || "Admin"}
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        <NavLink to="/admin" end className={linkClass}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>

        <NavLink to="/admin/categories" className={linkClass}>
          <Tag className="h-4 w-4" />
          Categories
        </NavLink>

        <NavLink to="/admin/products" className={linkClass}>
          <Package className="h-4 w-4" />
          Products
        </NavLink>

        <NavLink to="/admin/orders" className={linkClass}>
          <ShoppingCart className="h-4 w-4" />
          Orders
        </NavLink>

        <NavLink to="/admin/logs" className={linkClass}>
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
