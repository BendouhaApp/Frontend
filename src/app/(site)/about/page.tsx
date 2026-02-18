import type { Metadata } from "next";
import { About } from "@/views/About";
import { createPageMetadata } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = createPageMetadata({
  title: "A propos",
  description:
    "Decouvrez l'histoire de Bendouha Electric, specialiste en eclairage LED, luminaires et equipement electrique pour particuliers et professionnels en Algerie.",
  path: "/about",
  keywords: [
    "a propos Bendouha Electric",
    "histoire Bendouha",
    "specialiste eclairage Algerie",
  ],
});

export default function AboutPage() {
  return <About />;
}
