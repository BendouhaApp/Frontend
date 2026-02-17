import type { Metadata } from "next";
import HomeClient from "./home-client";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bendouha-electric.com";

export const metadata: Metadata = {
  title: "Bendouha Electric - Eclairage et Electricite en Algerie",
  description:
    "Decouvrez les produits d'eclairage et d'equipement electrique Bendouha Electric avec livraison rapide en Algerie.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bendouha Electric",
    description:
      "Boutique d'eclairage et d'equipement electrique pour la maison et les professionnels.",
    url: siteUrl,
    siteName: "Bendouha Electric",
    type: "website",
    images: [
      {
        url: "/shop-logo.svg",
        width: 1200,
        height: 630,
        alt: "Bendouha Electric",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bendouha Electric",
    description:
      "Produits d'eclairage et d'electricite avec livraison rapide en Algerie.",
    images: ["/shop-logo.svg"],
  },
};

export default function LandingPage() {
  return <HomeClient />;
}
