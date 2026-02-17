import type { Metadata } from "next";
import { ProductDetail } from "@/views/ProductDetail";

export const metadata: Metadata = {
  title: "Produit",
  description:
    "Consultez les details des produits d'eclairage et equipements electriques Bendouha Electric.",
  keywords: ["fiche produit eclairage", "details produit electrique"],
};

export default function ProductDetailPage() {
  return <ProductDetail />;
}
