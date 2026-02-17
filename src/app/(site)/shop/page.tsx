import type { Metadata } from "next";
import { Shop } from "@/views/Shop";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Boutique - Luminaires LED et equipement electrique",
  description:
    "Parcourez la boutique Bendouha Electric: spots LED, rails magnetiques, track slim, suspensions, appliques et materiel electrique avec livraison en Algerie.",
  path: "/shop",
  keywords: [
    "boutique eclairage",
    "shop electricite",
    "track light magnetique",
    "spot LED Algerie",
    "suspension LED",
    "applique murale",
    "materiel electrique en ligne",
  ],
});

export default function ShopPage() {
  return <Shop />;
}
