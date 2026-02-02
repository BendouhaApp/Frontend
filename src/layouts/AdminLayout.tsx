import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout() {
  const navigate = useNavigate();

  // 🔐 Protect all admin pages
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
