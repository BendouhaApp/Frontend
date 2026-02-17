import { Suspense } from "react";
import { MainLayout } from "@/layouts/MainLayout";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <MainLayout>{children}</MainLayout>
    </Suspense>
  );
}

