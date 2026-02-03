import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  exp?: number;
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    navigate("/admin/login", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      logout();
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }
    } catch {
      logout();
      return;
    }

    setCheckingAuth(false);
  }, []);

  if (checkingAuth) return null;

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
