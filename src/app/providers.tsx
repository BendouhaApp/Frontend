"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";

import i18n, { syncDocumentLanguage } from "@/i18n";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 1000 * 60 * 3,
            gcTime: 1000 * 60 * 30,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
          },
        },
      }),
  );

  const persister = useMemo(() => {
    if (typeof window === "undefined") return null;

    return createSyncStoragePersister({
      storage: window.localStorage,
      key: "bendouha-query-cache-v1",
      throttleTime: 1000,
    });
  }, []);

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

  const appChildren = (
    <>
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
    </>
  );

  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>{appChildren}</QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 12,
        buster: "frontend-query-cache-v1",
      }}
    >
      {appChildren}
    </PersistQueryClientProvider>
  );
}

