import type { Metadata, Viewport } from "next";
import "@/index.css";
import { Providers } from "./providers";

const DEFAULT_SITE_URL = "https://bendouha-electric.com";

const getMetadataBase = () => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Bendouha Electric",
    template: "%s | Bendouha Electric",
  },
  description:
    "Bendouha Electric : produits d'eclairage et d'equipement electrique avec livraison rapide en Algerie.",
  applicationName: "Bendouha Electric",
  keywords: [
    "Bendouha",
    "eclairage",
    "equipement electrique",
    "boutique electrique",
    "Algerie",
  ],
  icons: {
    icon: "/shop-logo.svg",
    shortcut: "/shop-logo.svg",
    apple: "/shop-logo.svg",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A5BFF",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" dir="ltr" data-scroll-behavior="smooth">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
