"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";

import i18n, { syncDocumentLanguage } from "@/i18n";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    syncDocumentLanguage();

    const handler = (lang: string) => {
      syncDocumentLanguage(lang);
    };

    i18n.on("languageChanged", handler);

    return () => {
      i18n.off("languageChanged", handler);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "hsl(30 15% 99%)",
            border: "1px solid hsl(30 8% 88%)",
            color: "hsl(30 10% 12%)",
          },
        }}
      />
    </QueryClientProvider>
  );
}

