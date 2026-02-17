import type { Metadata } from "next";
import { PrivacyPolicyPage } from "@/views/InfoPages";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Politique de confidentialite",
  description:
    "Consultez la politique de confidentialite de Bendouha Electric et la gestion de vos donnees personnelles.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <PrivacyPolicyPage />;
}
