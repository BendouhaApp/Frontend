import type { Metadata } from "next";
import { FaqPage } from "@/views/InfoPages";
import { createPageMetadata } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = createPageMetadata({
  title: "FAQ - Questions frequentes",
  description:
    "Retrouvez les reponses aux questions frequentes sur les commandes, la livraison et les produits Bendouha Electric.",
  path: "/faq",
  keywords: ["FAQ Bendouha Electric", "questions livraison", "aide commande"],
});

export default function Faq() {
  return <FaqPage />;
}
