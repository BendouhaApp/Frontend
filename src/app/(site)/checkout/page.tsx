import type { Metadata } from "next";
import { Checkout } from "@/views/Checkout";
import { createPageMetadata } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Paiement",
    description:
      "Finalisez votre commande Bendouha Electric en renseignant vos informations de livraison.",
    path: "/checkout",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <Checkout />;
}
