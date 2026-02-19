"use client";

import { useLocation, useNavigate } from "@/lib/router";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { gsap } from "gsap";
import AdminSidebar from "../components/AdminSidebar";
import { cn } from "@/lib/utils";

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

export default function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsAuthenticated(isTokenValid(localStorage.getItem("access_token")));
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated === false) {
      logout();
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    if (!isAuthenticated || !contentRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const contentElement = contentRef.current;
      if (!contentElement) return;

      gsap.fromTo(
        contentElement,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
        },
      );
    }, contentRef);

    return () => ctx.revert();
  }, [isAuthenticated, location.pathname]);

  if (!isAuthenticated) return null;

  const sectionTitle = (() => {
    if (location.pathname.startsWith("/admin/categories")) return "Categories";
    if (location.pathname.startsWith("/admin/products")) return "Products";
    if (location.pathname.startsWith("/admin/orders")) return "Orders";
    if (location.pathname.startsWith("/admin/shipping-zones")) return "Wilayas";
    if (location.pathname.startsWith("/admin/logs")) return "Logs";
    return "Dashboard";
  })();

  return (
    <div className="min-h-screen bg-neutral-50 lg:flex">
      <div className="hidden lg:block">
        <AdminSidebar className="sticky top-0 h-screen" />
      </div>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100"
            aria-label="Open admin menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-neutral-900">
            {sectionTitle}
          </span>
          <span className="h-9 w-9" aria-hidden="true" />
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div key={location.pathname} ref={contentRef}>
            {children}
          </div>
        </main>
      </div>

      <button
        type="button"
        onClick={() => setIsMobileSidebarOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          isMobileSidebarOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-label="Close admin menu overlay"
      />

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 w-72 max-w-[85vw] bg-white shadow-xl transition-transform lg:hidden",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!isMobileSidebarOpen}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <span className="text-sm font-semibold text-neutral-900">
              Admin Panel
            </span>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100"
              aria-label="Close admin menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <AdminSidebar
            className="h-full w-full border-r-0"
            onNavigate={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      </aside>
    </div>
  );
}


