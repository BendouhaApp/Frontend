import { Suspense } from "react";
import AdminLayout from "@/layouts/AdminLayout";

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50" />}>
      <AdminLayout>{children}</AdminLayout>
    </Suspense>
  );
}

