import type { Metadata } from "next";
import { Contact } from "@/views/Contact";
import { createPageMetadata, SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description: `Contactez Bendouha Electric au ${SUPPORT_PHONE_DISPLAY} ou par email a ${SUPPORT_EMAIL} pour vos demandes sur l'eclairage et l'equipement electrique.`,
  path: "/contact",
  keywords: [
    "contact Bendouha Electric",
    "telephone Bendouha",
    "email Bendouha",
    "service client eclairage",
  ],
});

export default function ContactPage() {
  return <Contact />;
}
