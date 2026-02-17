import type { Metadata } from "next";
import { ShippingInfoPage } from "@/views/InfoPages";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Informations de livraison",
  description:
    "Consultez les modalites de livraison Bendouha Electric: wilayas, communes, livraison a domicile et livraison au bureau.",
  path: "/shipping",
  keywords: [
    "livraison Bendouha Electric",
    "livraison domicile Algerie",
    "livraison bureau",
    "communes livraison",
  ],
});

export default function ShippingPage() {
  return <ShippingInfoPage />;
}
