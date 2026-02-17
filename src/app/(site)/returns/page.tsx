import type { Metadata } from "next";
import { ReturnsPage } from "@/views/InfoPages";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Retours et remboursement",
  description:
    "Consultez la politique de retours et de remboursement Bendouha Electric pour vos achats d'eclairage et d'equipement electrique.",
  path: "/returns",
  keywords: [
    "retours Bendouha Electric",
    "remboursement commande",
    "retour produit electrique",
  ],
});

export default function ReturnsInfoPage() {
  return <ReturnsPage />;
}
