import type { Metadata } from "next";
import { TermsPage } from "@/views/InfoPages";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Conditions d'utilisation",
  description:
    "Lisez les conditions d'utilisation de la boutique Bendouha Electric.",
  path: "/terms",
});

export default function TermsInfoPage() {
  return <TermsPage />;
}
