import { Outlet, useNavigate } from "react-router-dom";
import { useCallback, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";

type JwtPayload = {
  exp?: number;
};

const decodeJwtPayload = (token: string): JwtPayload => {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("Invalid token");

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);

  return JSON.parse(json) as JwtPayload;
};

const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const decoded = decodeJwtPayload(token);

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  const isAuthenticated = isTokenValid(localStorage.getItem("admin_token"));

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
